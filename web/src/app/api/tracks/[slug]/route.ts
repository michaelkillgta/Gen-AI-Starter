import { getTrack } from "@/lib/api";
import { json, type Params } from "@/server/rest";

export async function GET(_req: Request, ctx: Params<"slug">) {
  return json(await getTrack((await ctx.params).slug));
}
