"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!res.ok) return;

      const json = await res.json();
      const leaderboard = json.data.leaderboard;
      const prizes = json.data.prizes;

      const data = leaderboard
        .sort((a, b) => a.place - b.place)
        .slice(0, 10)
        .map((p) => ({
          rank: p.place,
          name: maskUsername(p.nickname),
          points: Number(p.points).toLocaleString(),
          prize: prizes[p.place - 1]?.title ?? "-"
        }));

      setRows(data);
    }

    load();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Leaderboard</h1>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Points</th>
            <th>Prize</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rank}>
              <td>{r.rank}</td>
              <td>{r.name}</td>
              <td>{r.points}</td>
              <td>{r.prize}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function maskUsername(name) {
  if (!name) return "***";
  if (name.length <= 4) return name[0] + "***";
  return name.slice(0, 2) + "***" + name.slice(-1);
}
