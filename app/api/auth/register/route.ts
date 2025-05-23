import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { generateOtp } from "@/lib/auth/generateOtp";
import { hashOtp } from "@/lib/auth/hashOtp";
import { consumeRateLimit } from "@/lib/auth/rateLimiter";
import { sendOtpEmail } from "@/lib/auth/sendOtpEmail";

const schema = z.object({
  email: z.string().email("Email nije validan"),
  fullName: z.string().min(1, "Ime i prezime su obavezni"),
  phone: z.string().optional(),
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
    const errors = result.error.issues.map((issue) => issue.message);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Neispravan unos.", details: errors },
      },
      { status: 400 }
    );
  }

  const { email, fullName, phone } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Korisnik sa ovim emailom je već registrovan. Molimo da se prijavite.",
          },
        },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    const validUntil = expiresAt.toLocaleString("de-DE");

    await sendOtpEmail(
      email,
      "Registracija naloga - OTP kod za registraciju",
      otp,
      validUntil
    );

    await prisma.user.create({
      data: {
        email,
        fullName,
        phone,
        otp: hashedOtp,
        otpExpiresAt: expiresAt,
        isVerified: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          message: `OTP je poslat na email ${email}. OTP je validan do ${validUntil}`,
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
