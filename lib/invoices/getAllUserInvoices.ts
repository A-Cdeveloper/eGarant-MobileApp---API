import prisma from "@/lib/db";
import { InvoiceWithSeller } from "@/types/prisma";
import { handlePrismaError } from "../handlePrismaError";

export const getAllUserInvoices = async (
  uid: string
): Promise<{
  total: number;
  invoices: Omit<InvoiceWithSeller, "_count">[];
}> => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { uid },
      select: {
        iid: true,
        invoice_number: true,
        invoice_date: true,
        invoice_amount: true,
        seller: {
          select: {
            businessName: true,
            address: true,
            city: true,
            pib: true,
          },
        },
        _count: {
          select: {
            products: {
              where: {
                gperiod: {
                  gt: 0, // Only count products where warranty period is greater than 0
                },
              },
            },
          },
        },
      },
      orderBy: {
        invoice_date: "desc", // optional: newest first
      },
    });

    return {
      total: invoices.length,
      invoices: invoices.map((invoice) => ({
        ...invoice,
        productsWithWarrantyCount: invoice._count.products,
      })),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};
