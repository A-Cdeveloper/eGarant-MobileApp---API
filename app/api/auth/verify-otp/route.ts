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

type SuccessResponse = {
  success: true;
  data: {
    message: string;
    token: string;
    tokenExpiry: number;
    user: {
      email: string;
      fullName: string | null;
    };
  };
};

type ErrorResponse = {
  success: false;
  error: {
    message: string;
    details?: string[];
  };
};

export async function POST(
  req: Request
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("remote-addr") ||
    "unknown";

  const allowed = await consumeRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Previše pokušaja, probajte kasnije." },
      },
      { status: 429 }
    );
  }

  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Neispravan unos.", details: errors },
      },
      { status: 400 }
    );
  }

  const { email, otp } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otp || !user.otpExpiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Pogrešan OTP kod i/ili korisnik ne postoji" },
        },
        { status: 400 }
      );
    }

    const now = new Date();
    if (user.otpExpiresAt < now) {
      return NextResponse.json(
        { success: false, error: { message: "OTP je istekao" } },
        { status: 400 }
      );
    }

    const hashedInputOtp = await hashOtp(otp);
    if (user.otp !== hashedInputOtp) {
      return NextResponse.json(
        { success: false, error: { message: "Pogrešan OTP kod" } },
        { status: 400 }
      );
    }

    // OTP valid — clear OTP, mark user verified
    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiresAt: null,
        isVerified: true,
      },
    });

    // Create JWT token
    const token = await createJWT(user.uid);
    const tokenExpiry = Date.now() + 4 * 60 * 60 * 1000; // 4 hours from now

    return NextResponse.json(
      {
        success: true,
        data: {
          message: "OTP kod je uspešno verifikovan",
          token,
          tokenExpiry,
          user: {
            email: user.email,
            fullName: user.fullName,
          },
        },
      },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Greška na serveru.",
          details: [error?.message || "Nepoznata greška"],
        },
      },
      { status: 500 }
    );
  }
}
