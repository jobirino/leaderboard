
git add app/leaderboard/page.tsx
git commit -m "Deploy test comment"
git push


"use client";

import { useEffect, useState } from "react";

type Leader = {
  place: number;
  nickname: string;
  points: number;
};

type Prize = {
  place: number;
  title: string;
};

export default function Page() {
  const [rows, setRows] = useState<
    { rank: number; name: string; points: string; prize: string }[]
  >([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!res.ok) return;

      const json = await res.json();
      const leaderboard: Leader[] = json.data.leaderboard;
      const prizes: Prize[] = json.data.prizes;

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

function maskUsername(name: string) {
  if (!name) return "***";
  return name.slice(0, 2) + "***" + name.slice(-1);
}
