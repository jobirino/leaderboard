"use client";

import { useEffect, useState } from "react";

type Row = {
  rank: number;
  name: string;
  points: string;
  prize: string;
};

function maskUsername(name: string): string {
  if (!name) return "";
  if (name.length <= 2) return name[0] + "*";
  return (
    name[0] +
    "*".repeat(name.length - 2) +
    name[name.length - 1]
  );
}

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function load() {
      try {
        const res = await fetch("/api/leaderboard", {
          cache: "no-store",
        });
        if (!res.ok) return;

        const json = await res.json();

        const leaderboard = json.data.leaderboard;
        const prizes = json.data.prizes;

        const data: Row[] = leaderboard
          .sort((a: any, b: any) => a.place - b.place)
          .slice(0, 10)
          .map((p: any) => ({
            rank: p.place,
            name: maskUsername(p.nickname),
            points: Number(p.points).toLocaleString(),
            prize: prizes[p.place - 1]?.title ?? "-",
          }));

        setRows(data);
      } catch (err) {
        console.error(err);
      }
    }

    load(); // initial load
    interval = setInterval(load, 30_000); // refresh every 30s

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 6 }}>
        🏆 Bi-Weekly Points Leaderboard
      </h1>
      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        Updates automatically every 30 seconds
      </p>

      <table width="100%" cellPadding={10}>
        <thead>
          <tr>
            <th align="left">Rank</th>
            <th align="left">Player</th>
            <th align="right">Points</th>
            <th align="right">Prize</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.rank}
              style={{
                fontWeight: row.rank <= 3 ? "bold" : "normal",
                color:
                  row.rank === 1
                    ? "#FFD700"
                    : row.rank <= 3
                    ? "#C0C0C0"
                    : "inherit",
              }}
            >
              <td>#{row.rank}</td>
              <td>{row.name}</td>
              <td align="right">{row.points}</td>
              <td align="right">{row.prize}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
