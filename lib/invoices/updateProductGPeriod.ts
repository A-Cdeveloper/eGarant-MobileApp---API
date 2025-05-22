import prisma from "@/lib/db";
import { handlePrismaError } from "../handlePrismaError";

export const updateProductGPeriod = async ({
  uid,
  iid,
  pid,
  gperiod,
}: {
  uid: string;
  iid: string;
  pid: string;
  gperiod: number;
}) => {
  try {
    // Validate invoice ownership and product existence in one go
    const product = await prisma.product.findFirst({
      where: {
        pid,
        iid,
        invoice: {
          uid,
        },
      },
      include: {
        invoice: {
          select: { uid: true },
        },
      },
    });

    if (!product) {
      throw new Error("Artikal ne postoji ili nemate dozvolu za izmenu.");
    }

    // Update warranty period
    await prisma.product.update({
      where: { pid, iid }, // assuming you have a composite unique constraint
      data: { gperiod: +gperiod },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};
