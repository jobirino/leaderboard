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

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        "/api/leaderboard",
        { cache: "no-store" }
      );

      if (!res.ok) return;

      const json = await res.json();

      setLeaders(json.data.leaderboard);
      setPrizes(json.data.prizes);
    }

    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>

      <table className="w-full border border-neutral-800">
        <thead className="bg-neutral-900">
          <tr>
            <th className="p-4 text-left">Rank</th>
            <th className="p-4 text-left">Player</th>
            <th className="p-4 text-left">Points</th>
            <th className="p-4 text-left">Prize</th>
          </tr>
        </thead>

        <tbody>
          {leaders.map((p) => (
            <tr
              key={p.place}
              className="border-t border-neutral-800"
            >
              <td className="p-4">#{p.place}</td>
              <td className="p-4">{maskUsername(p.nickname)}</td>
              <td className="p-4">{p.points.toLocaleString()}</td>
              <td className="p-4 text-yellow-400">
                {prizes.find((x) => x.place === p.place)?.title ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function maskUsername(name: string) {
  if (!name) return "***";
  if (name.length <= 3) return name[0] + "***";
  return name.slice(0, 2) + "***" + name.slice(-1);
}
