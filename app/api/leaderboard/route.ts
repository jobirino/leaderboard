import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.menace.com/api/retention/tournaments/9cfc31b9-b3e2-4378-a516-e74f63a75c54",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}