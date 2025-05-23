import { NextRequest } from "next/server";
import { verifyJWT } from "./jwt";

export async function requireUser(
  request: NextRequest
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  const payload = (await verifyJWT(token)) as { userId: string } | null;
  return payload?.userId ?? null;
}
