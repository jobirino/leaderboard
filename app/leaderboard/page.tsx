
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Leaderboard – LIVE Menace Tournament API (direct fetch)
// Metric: POINTS
// Stable version with row-change animation

export default function LeaderboardPage() {
  const [podium, setPodium] = useState([]);
  const [table, setTable] = useState([]);
  const [prevTable, setPrevTable] = useState([]);
  const [endsIn, setEndsIn] = useState("--");
  const [status, setStatus] = useState("live");

  useEffect(() => {
    async function loadLeaderboard() {
      const res = await fetch(
        "https://api.menace.com/api/retention/tournaments/9cfc31b9-b3e2-4378-a516-e74f63a75c54",
        { cache: "no-store" }
      );

      if (!res.ok) return;

      const json = await res.json();
      const { leaderboard, prizes: rawPrizes, endAt } = json.data;

      const prizes: { place: number; title: string }[] = rawPrizes;

      const sorted = [...leaderboard]
        .sort((a, b) => a.place - b.place)
        .slice(0, 10)
        .map((p) => ({
          rank: p.place,
          name: maskUsername(p.nickname),
          points: Number(p.points).toLocaleString(),
          prize: prizes[p.place - 1]?.title ?? "-"
        }));

      setPodium(sorted.slice(0, 3));
      setPrevTable(table);
      setTable(sorted);

      const { label, state } = calcEndsIn(endAt);
      setEndsIn(label);
      setStatus(state);
    }

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [table]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-10 py-8">
      {/* Hero */}
      <section className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight">BI-WEEKLY POINTS RACE</h1>
          <p className="text-neutral-400 mt-2">Ranked by points • Tournament leaderboard</p>
        </div>
        <div className="flex gap-6">
          <Stat label="Prize Pool" value="$1,500" />
          <Stat
            label={status === "ended" ? "Status" : "Ends In"}
            value={status === "ended" ? "Ended" : endsIn}
          />
        </div>
      </section>

      {/* Podium */}
      <section
        className={`grid grid-cols-3 gap-8 mb-16 ${status === "ended" ? "opacity-80" : ""}`}
      >
        {podium.map((p) => (
          <motion.div
            key={p.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border ${
              p.rank === 1 ? "border-yellow-500 scale-110" : "border-neutral-800"
            }`}
          >
            <div className="text-sm text-neutral-400">Rank #{p.rank}</div>
            <div className="text-2xl font-bold mt-1">{p.name}</div>
            <div className="text-neutral-400 mt-2">Points</div>
            <div className="text-3xl font-mono">{p.points}</div>
            <div className="mt-4 text-yellow-500 font-semibold">Prize: {p.prize}</div>
          </motion.div>
        ))}
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-neutral-800">
        <table className="w-full text-left">
          <thead className="bg-neutral-900 text-neutral-400">
          <tr>
            <th className="p-4">Rank</th>
            <th className="p-4">Player</th>
            <th className="p-4">Points</th>
            <th className="p-4">Prize</th>
          </tr>
        </thead>
        <tbody>
            {table.map((row) => (
              <motion.tr
                key={row.rank}
                initial={{ backgroundColor: "#0a0a0a" }}
                animate={{
                  backgroundColor: didRowChange(row, prevTable)
                    ? "#1a1a1a"
                    : "#0a0a0a"
                }}
                transition={{ duration: 0.6 }}
                className="border-t border-neutral-800 hover:bg-neutral-900 transition"
              >
                <td className="p-4 font-semibold">#{row.rank}</td>
                <td className="p-4">{row.name}</td>
                <td className="p-4 font-mono">{row.points}</td>
                <td className="p-4 text-yellow-500">{row.prize}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Rules */}
      <footer className="mt-12 text-sm text-neutral-500">
        Points-based tournament leaderboard. Rankings provided by Menace API.
      </footer>
    </div>
  );
}

// ---------------- helpers ----------------

function calcEndsIn(endAt) {
  const now = new Date();
  const end = new Date(endAt);
  const diff = end - now;

  if (diff <= 0) {
    return { label: "Ended", state: "ended" };
  }

  const hours = diff / 3600000;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);

  if (hours <= 24) {
    return { label: `${d}d ${h}h`, state: "ending" };
  }

  return { label: `${d}d ${h}h`, state: "live" };
}

function didRowChange(row, prevTable) {
  const prev = prevTable.find((r) => r.rank === row.rank);
  if (!prev) return false;
  return prev.points !== row.points;
}

function maskUsername(name) {
  if (!name) return "***";
  if (name.length <= 4) return name[0] + "***";
  return name.slice(0, 2) + "***" + name.slice(-2);
}

function Stat({ label, value }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-4">
      <div className="text-neutral-400 text-sm">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
