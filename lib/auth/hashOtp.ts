import crypto from "crypto";

export async function hashOtp(otp: string): Promise<string> {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
