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
function getRowClass(rank: number) {
  if (rank === 1) return "rank-gold";
  if (rank === 2) return "rank-silver";
  if (rank === 3) return "rank-bronze";
  return "";
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
  <div style={{ minHeight: "100vh", background: "#0b0b0b", padding: 24 }}>
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "#111",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <h1 style={{ color: "#fff", marginBottom: 4 }}>
        🏆 Bi-Weekly Points Leaderboard
      </h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Updates automatically every 30 seconds
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "#aaa", textAlign: "left" }}>
            <th style={{ paddingBottom: 12 }}>Rank</th>
            <th style={{ paddingBottom: 12 }}>Player</th>
            <th style={{ paddingBottom: 12 }}>Points</th>
            <th style={{ paddingBottom: 12, textAlign: "right" }}>Prize</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row: any) => {
            const isTop1 = row.rank === 1;
            const isTop2 = row.rank === 2;
            const isTop3 = row.rank === 3;

            const highlight =
              isTop1
                ? "#ffd700"
                : isTop2
                ? "#c0c0c0"
                : isTop3
                ? "#cd7f32"
                : "#fff";

            return (
              <tr
                key={row.rank} className={getRowClass(row.rank)} 
                style={{
                  borderTop: "1px solid #222",
                  color: highlight,
                  fontWeight: isTop1 ? 700 : 400,
                }}
              >
                <td style={{ padding: "12px 0" }}>#{row.rank}</td>
                <td>{row.name}</td>
                <td>{row.points}</td>
                <td style={{ textAlign: "right", color: "#f5c542" }}>
                  {row.prize}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

}
