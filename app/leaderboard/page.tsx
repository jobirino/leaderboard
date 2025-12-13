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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/leaderboard", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const json = await res.json();

        const top10: Leader[] = json.data.leaderboard
          .sort((a: Leader, b: Leader) => a.place - b.place)
          .slice(0, 10);

        setLeaders(top10);
        setPrizes(json.data.prizes);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading leaderboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">Bi-Weekly Points Leaderboard</h1>

      <table className="w-full border border-neutral-800 rounded-lg overflow-hidden">
        <thead className="bg-neutral-900 text-neutral-400">
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
              className="border-t border-neutral-800 hover:bg-neutral-900 transition"
            >
              <td className="p-4 font-semibold">#{p.place}</td>
              <td className="p-4">{maskUsername(p.nickname)}</td>
              <td className="p-4 font-mono">
                {p.points.toLocaleString()}
              </td>
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
