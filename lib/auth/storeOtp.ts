// lib/otp-utils.ts
import prisma from "@/lib/db";
import { hashOtp } from "./hashOtp";

export async function storeOtp(email: string, otp: string): Promise<string> {
  const hashedOtp = await hashOtp(otp);

  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
  const validUntil = expiresAt.toLocaleString("de-DE");

  await prisma.user.update({
    where: { email },
    data: {
      otp: hashedOtp,
      otpExpiresAt: expiresAt,
    },
  });

  return validUntil;
}
