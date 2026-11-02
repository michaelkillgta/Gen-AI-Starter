import { getTracks } from "@/lib/api";
import { json } from "@/server/rest";

export async function GET() {
  return json(await getTracks());
}
