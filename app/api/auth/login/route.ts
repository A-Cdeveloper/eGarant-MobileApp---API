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
  const { success, data, error } = schema.safeParse(body);

  if (!success) {
    const errors = error.issues.map((issue) => issue.message);
    return NextResponse.json(
      {
        success: false,
        errors,
      },
      { status: 400 }
    );
  }

  // Logic
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Korisnik sa ovom email adresom ne postoji"],
        },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "Nalog nije verifikovan. Proverite registracioni email i unesite OTP.",
          ],
        },
        { status: 403 }
      );
    }

    const otp = generateOtp();
    const validUntil = await storeOtp(data.email, otp);

    await sendOtpEmail(
      data.email,
      "Prijava - OTP kod za prijavu",
      otp,
      validUntil
    );

    return NextResponse.json(
      {
        success: true,
        message: `OTP kod je poslat na email ${data.email}. OTP je validan do ${validUntil}`,
      },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      {
        success: false,
        errors: ["Greška na serveru", err.message],
      },
      { status: 500 }
    );
  }
}
