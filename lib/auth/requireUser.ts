import { verifyJWT } from "@/lib/auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function requireUser(
  request: NextRequest
): Promise<string | NextResponse> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Nemate prava pristupa profilu" },
      { status: 401 }
    );
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = await verifyJWT(token);

    if (!payload?.userId) {
      throw new Error("Nedostaje korisnički ID u tokenu");
    }

    return payload.userId as string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json(
      { error: "Nevažeći ili istekao token" },
      { status: 401 }
    );
  }
}
