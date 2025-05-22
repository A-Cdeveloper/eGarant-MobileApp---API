import prisma from "@/lib/db";
import { handlePrismaError } from "../handlePrismaError";

type ProductInput = {
  name: string;
  quantity: number;
  price: number;
  gperiod?: number;
};

type ScannedInvoiceData = {
  invoice_number: string;
  invoice_date: string | Date;
  invoice_amount: number;
  jurnal: string;
  products: ProductInput[];
  businessName: string;
  address: string;
  city: string;
  pib: string;
};

type AddUserInvoiceParams = {
  uid: string;
  scanedData: ScannedInvoiceData;
};

export const addUserInvoice = async ({
  uid,
  scanedData,
}: AddUserInvoiceParams): Promise<void> => {
  try {
    const {
      invoice_number,
      invoice_date,
      invoice_amount,
      jurnal,
      products,
      businessName,
      address,
      city,
      pib,
    } = scanedData;

    const [existingInvoice, existingSeller] = await Promise.all([
      prisma.invoice.findFirst({ where: { invoice_number } }),
      prisma.seller.findFirst({ where: { pib } }),
    ]);

    if (existingInvoice) {
      throw new Error("Račun već postoji u bazi.");
    }

    const seller = existingSeller
      ? existingSeller
      : await prisma.seller.create({
          data: { businessName, address, city, pib },
        });

    const newInvoice = await prisma.invoice.create({
      data: {
        invoice_number,
        invoice_date: new Date(invoice_date),
        invoice_amount,
        jurnal: jurnal ?? "",
        uid,
        sid: seller.sid,
      },
    });

    if (products.length > 0) {
      await prisma.product.createMany({
        data: products.map(({ name, quantity, price, gperiod }) => ({
          name,
          quantity,
          price,
          gperiod: gperiod ?? 0,
          iid: newInvoice.iid,
        })),
      });
    }
  } catch (error) {
    handlePrismaError(error);
  }
};
