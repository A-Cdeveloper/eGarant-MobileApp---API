import prisma from "@/lib/db";
import { InvoiceWithSeller } from "@/types/prisma";
import { handlePrismaError } from "../handlePrismaError";

export const getAllUserInvoices = async (
  uid: string
): Promise<{
  total: number;
  invoices: InvoiceWithSeller[];
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
      },
      orderBy: {
        invoice_date: "desc", // optional: newest first
      },
    });

    return {
      total: invoices.length,
      invoices,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};
