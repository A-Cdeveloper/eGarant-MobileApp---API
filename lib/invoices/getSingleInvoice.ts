import prisma from "@/lib/db";
import { InvoiceWithSelerAndProducts } from "@/types/prisma";
import { handlePrismaError } from "../handlePrismaError";

export const getSingleInvoice = async ({
  uid,
  iid,
}: {
  uid: string;
  iid: string;
}): Promise<{
  invoice: InvoiceWithSelerAndProducts & {
    productsCount: number;
    productsWithWarrantyCount: number;
  };
}> => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { iid },
      select: {
        iid: true,
        invoice_number: true,
        invoice_date: true,
        invoice_amount: true,
        jurnal: true,
        uid: true,
        seller: {
          select: {
            businessName: true,
            address: true,
            city: true,
            pib: true,
          },
        },
        products: {
          select: {
            pid: true,
            name: true,
            quantity: true,
            gperiod: true,
            price: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error("Račun ne postoji u bazi.");
    }

    if (invoice.uid !== uid) {
      throw new Error("Nemate dozvolu za pristup ovom računu.");
    }

    const products = invoice.products;
    const productsCount = products.length;
    const productsWithWarrantyCount = products.reduce(
      (count, product) => (product.gperiod > 0 ? count + 1 : count),
      0
    );

    return {
      invoice: {
        productsCount,
        productsWithWarrantyCount,
        ...invoice,
      },
    };
  } catch (error) {
    handlePrismaError(error);
  }
};
