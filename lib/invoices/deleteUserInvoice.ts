import prisma from "@/lib/db";
import { handlePrismaError } from "../handlePrismaError";

export const deleteUserInvoice = async ({
  uid,
  iid,
}: {
  uid: string;
  iid: string;
}) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { iid },
      select: { uid: true },
    });

    if (!invoice) {
      throw new Error("Račun ne postoji u bazi.");
    }

    if (invoice.uid !== uid) {
      throw new Error("Niste autorizovani za brisanje ovog računa.");
    }

    // delete invoice products
    await prisma.product.deleteMany({
      where: { iid },
    });

    // delete invoice
    await prisma.invoice.delete({
      where: { iid },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};
