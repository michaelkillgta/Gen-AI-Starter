import { getIssues } from "@/lib/api";
import { json } from "@/server/rest";

export async function GET() {
  return json(await getIssues());
}
