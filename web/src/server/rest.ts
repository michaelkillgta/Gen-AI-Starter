import "server-only";

/**
 * Helpers for the public read-only REST endpoints under /api (the same answers
 * the pages use): JSON, 404 for missing things, cached at the edge for a minute.
 */

export function json(body: unknown, maxAge = 60): Response {
  if (body === null) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(body, {
    headers: { "cache-control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 5}` },
  });
}

export type Params<K extends string> = { params: Promise<Record<K, string>> };
