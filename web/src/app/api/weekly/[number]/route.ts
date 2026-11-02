import { getIssue } from "@/lib/api";
import { json, type Params } from "@/server/rest";

export async function GET(_req: Request, ctx: Params<"number">) {
  return json(await getIssue((await ctx.params).number));
}
