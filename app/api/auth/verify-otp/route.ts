import prisma from "@/lib/db";
import { createJWT } from "@/lib/auth/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/auth/rateLimiter";
import { hashOtp } from "@/lib/auth/hashOtp";

const schema = z.object({
  email: z.string().min(1, "Email je obavezan").email("Email nije validan"),
  otp: z.string().length(6, "OTP mora imati 6 cifara"),
});

export async function POST(req: Request) {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("remote-addr") ||
    "unknown";

  const allowed = await consumeRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { success: false, errors: ["Previše pokušaja, probajte kasnije."] },
      { status: 429 }
    );
  }

  // Validation
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const { email, otp } = result.data;

  // Verify OTP
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otp || !user.otpExpiresAt) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Pogrešan OTP kod i/ili korisnik ne postoji"],
        },
        { status: 400 }
      );
    }

    const now = new Date();

    if (user.otpExpiresAt < now) {
      return NextResponse.json(
        { success: false, errors: ["OTP je istekao"] },
        { status: 400 }
      );
    }

    const hashedInputOtp = await hashOtp(otp);

    if (user.otp !== hashedInputOtp) {
      return NextResponse.json(
        { success: false, errors: ["Pogrešan OTP kod"] },
        { status: 400 }
      );
    }

    // OTP is valid, clear it to prevent reuse
    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiresAt: null,
        isVerified: true,
      },
    });

    // Create JWT token using your helper
    const token = await createJWT(user.uid);

    // Calculate token expiration timestamp for frontend info (optional)
    const tokenExpiry = Date.now() + 4 * 60 * 60 * 1000;

    return NextResponse.json({
      success: true,
      message: "OTP kod je uspešno verifikovan",
      token,
      tokenExpiry,
      user: {
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { success: false, errors: ["Greška na serveru", error.message] },
      { status: 500 }
    );
  }
}
