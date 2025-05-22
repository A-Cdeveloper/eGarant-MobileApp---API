import { getUserFromRequest } from "@/lib/auth/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = await getUserFromRequest(request);

  if (!userId) {
    return NextResponse.json(
      { error: "Nemate prava pristupa profilu" },
      { status: 401 }
    );
  }

  try {
    const [user, invoiceCount, productsGaranteeCount] = await Promise.all([
      prisma.user.findUnique({
        where: { uid: userId },
        select: { email: true, fullName: true, phone: true },
      }),
      prisma.invoice.count({
        where: { uid: userId },
      }),
      prisma.product.count({
        where: {
          gperiod: {
            gt: 0,
          },
          invoice: {
            uid: userId,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        data: {
          user,
          invoiceCount,
          productsGaranteeCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error && error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
