export async function GET() {
  const res = await fetch(
    "https://api.menace.com/api/retention/tournaments/9cfc31b9-b3e2-4378-a516-e74f63a75c54",
    {
      next: { revalidate: 15 } // cache for 15 seconds
    }
  );

  if (!res.ok) {
    return new Response("Failed to fetch leaderboard", { status: 502 });
  }

  const json = await res.json();
  return Response.json(json);
}