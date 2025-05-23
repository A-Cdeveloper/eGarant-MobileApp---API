import prisma from "@/lib/db";
import { generateOtp } from "@/lib/auth/generateOtp";
import { storeOtp } from "@/lib/auth/storeOtp";
import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/auth/rateLimiter";
import { sendOtpEmail } from "@/lib/auth/sendOtpEmail";

const schema = z.object({
  email: z.string().min(1, "Email je obavezan").email("Email nije validan"),
});

type SuccessResponse = {
  success: true;
  data: {
    message: string;
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
    const errors = result.error.issues.map((i) => i.message);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Neispravan unos.",
          details: errors,
        },
      },
      { status: 400 }
    );
  }

  const { email } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Korisnik sa ovom email adresom ne postoji" },
        },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Nalog nije verifikovan. Proverite registracioni email i unesite OTP.",
          },
        },
        { status: 403 }
      );
    }

    const otp = generateOtp();
    const validUntil = await storeOtp(email, otp);

    await sendOtpEmail(email, "Prijava - OTP kod za prijavu", otp, validUntil);

    return NextResponse.json(
      {
        success: true,
        data: {
          message: `OTP kod je poslat na email ${email}. OTP je validan do ${validUntil}`,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Greška na serveru.",
          details: [err instanceof Error ? err.message : "Nepoznata greška"],
        },
      },
      { status: 500 }
    );
  }
}
