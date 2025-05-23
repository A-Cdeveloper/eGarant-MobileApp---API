import { withAuth } from "@/lib/auth/withAuth";
import { getAllUserGuarantees } from "@/lib/invoices/getAllUserGuarantees";
import { ProductWithInvoice } from "@/types/prisma";
import { NextResponse } from "next/server";

type SuccessGetResponse = {
  success: true;
  data: {
    total: number;
    guarantees: ProductWithInvoice[];
  };
};

type ErrorResponse = {
  success: false;
  error: {
    message: string;
  };
};

export const GET = withAuth<SuccessGetResponse | ErrorResponse>(
  async (_request, userId) => {
    try {
      const { total, guaranteesProducts } = await getAllUserGuarantees(userId);

      return NextResponse.json(
        {
          success: true,
          data: {
            total,
            guarantees: guaranteesProducts,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Greška na serveru";

      return NextResponse.json(
        {
          success: false,
          error: {
            message: errorMessage,
          },
        },
        { status: 500 }
      );
    }
  }
);
