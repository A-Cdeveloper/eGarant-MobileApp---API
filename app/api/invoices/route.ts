import { withAuth } from "@/lib/auth/withAuth";
import { addUserInvoice } from "@/lib/invoices/addUserInvoice";
import { extractProductsFromJurnal } from "@/lib/invoices/extractProductsFromJurnal";
import { getAllUserInvoices } from "@/lib/invoices/getAllUserInvoices";
import { InvoiceWithSeller } from "@/types/prisma";
import { NextResponse } from "next/server";

type SuccessGetResponse = {
  success: true;
  data: {
    total: number;
    invoices: InvoiceWithSeller[];
  };
};

type SuccessPostResponse = {
  success: true;
  message: string;
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
      const { invoices, total } = await getAllUserInvoices(userId);
      return NextResponse.json(
        { success: true, data: { total, invoices } },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Greška na serveru";
      return NextResponse.json(
        { success: false, error: { message: errorMessage } },
        { status: 500 }
      );
    }
  }
);

export const POST = withAuth<SuccessPostResponse | ErrorResponse>(
  async (request, userId) => {
    const data = await request.json();
    const { invoiceNumber, sdcTime, totalAmount } = data.invoiceResult;
    const { businessName, address, city, taxId } = data.invoiceRequest;

    const products = extractProductsFromJurnal(data.journal);

    const scanedData = {
      invoice_number: invoiceNumber,
      invoice_date: sdcTime,
      invoice_amount: totalAmount,
      jurnal: data.journal,
      products,
      businessName,
      address,
      city,
      pib: taxId,
    };

    try {
      await addUserInvoice({ uid: userId, scanedData });
      return NextResponse.json(
        { success: true, message: "Račun je uspešno dodat" },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Greška na serveru";
      return NextResponse.json(
        { success: false, error: { message: errorMessage } },
        { status: 500 }
      );
    }
  }
);
