import { ProductWithInvoice } from "@/types/prisma";
import prisma from "../db";
import { handlePrismaError } from "../handlePrismaError";

export const getAllUserGuarantees = async (
  uid: string
): Promise<{
  total: number;
  guaranteesProducts: ProductWithInvoice[];
}> => {
  try {
    const guaranteesProducts = await prisma.product.findMany({
      where: {
        gperiod: { gt: 0 },
        invoice: {
          uid,
        },
      },
      select: {
        name: true,
        quantity: true,
        gperiod: true,
        price: true,
        invoice: {
          select: {
            invoice_number: true,
            invoice_date: true,

            seller: {
              select: {
                businessName: true,
                city: true,
                address: true,
              },
            },
          },
        },
      },
    });

    return {
      total: guaranteesProducts.length,
      guaranteesProducts,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};
