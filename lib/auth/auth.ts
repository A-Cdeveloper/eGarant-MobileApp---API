import { verifyJWT } from "@/lib/auth/jwt";
import { NextRequest } from "next/server";

export async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  const payload = await verifyJWT(token);

  return payload?.userId as string;
}
