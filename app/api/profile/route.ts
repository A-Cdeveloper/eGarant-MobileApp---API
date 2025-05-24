import { withAuth } from "@/lib/auth/withAuth";
import prisma from "@/lib/db";
import { User } from "@prisma/client";
import { NextResponse } from "next/server";

type UserProfile = Pick<User, "email" | "fullName" | "phone">;

type SuccessResponse = {
  success: true;
  data: {
    user: UserProfile | null;
    invoiceCount: number;
    productsGaranteeCount: number;
  };
};

type ErrorResponse = {
  success: false;
  error: {
    message: string;
  };
};

export const GET = withAuth<SuccessResponse | ErrorResponse>(
  async (request, userId) => {
    try {
      const [user, invoiceCount, productsGaranteeCount] = await Promise.all([
        prisma.user.findUnique({
          where: { uid: userId },
          select: { email: true, fullName: true, phone: true, updatedAt: true },
        }),
        prisma.invoice.count({
          where: { uid: userId },
        }),
        prisma.product.count({
          where: {
            gperiod: { gt: 0 },
            invoice: { uid: userId },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          user,
          invoiceCount,
          productsGaranteeCount,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Greška na serveru";
      return NextResponse.json(
        {
          success: false,
          error: { message: errorMessage },
        },
        { status: 500 }
      );
    }
  }
);
