// app/api/register/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { generateOtp } from "@/lib/auth/generateOtp";
import { hashOtp } from "@/lib/auth/hashOtp"; // You already use this
import { consumeRateLimit } from "@/lib/auth/rateLimiter";
import { sendOtpEmail } from "@/lib/auth/sendOtpEmail";

const schema = z.object({
  email: z.string().email("Email nije validan"),
  fullName: z.string().min(1, "Ime i prezime su obavezni"),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
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

  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const { email, fullName, phone } = result.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      {
        success: false,
        errors: [
          "Korisnik sa ovim emailom je već registrovan. Molimo da se prijavite.",
        ],
      },
      { status: 400 }
    );
  }

  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  const validUntil = expiresAt.toLocaleString("de-DE");

  await sendOtpEmail(
    email,
    "Registracija naloga - OTP kod za rgistraciju",
    otp,
    validUntil
  );

  await prisma.user.create({
    data: {
      email,
      fullName,
      phone,
      otp: hashedOtp,
      otpExpiresAt: expiresAt, // 5 minutes
      isVerified: false,
    },
  });

  // await sendOtpEmail(email, otp); // you can uncomment this in production

  return NextResponse.json({
    success: true,
    message: `OTP je poslat na email ${email}.OTP je validan do ${validUntil}`,
  });
}
