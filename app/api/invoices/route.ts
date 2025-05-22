import { getUserFromRequest } from "@/lib/auth/auth";
import { addUserInvoice } from "@/lib/invoices/addUserInvoice";
import { extractProductsFromJurnal } from "@/lib/invoices/extractProductsFromJurnal";
import { getAllUserInvoices } from "@/lib/invoices/getAllUserInvoices";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // check if user is logged in
  const userId = await getUserFromRequest(req);

  if (!userId) {
    return NextResponse.json(
      { error: "Nemate prava pristupa računima" },
      { status: 401 }
    );
  }

  try {
    const { invoices, total } = await getAllUserInvoices(userId);
    return NextResponse.json({ total, data: invoices }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error && error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // check if user is logged in
  const userId = await getUserFromRequest(req);

  if (!userId) {
    return NextResponse.json(
      { error: "Nemate prava za dodavanje računa" },
      { status: 401 }
    );
  }

  const data = await req.json();
  const { invoiceNumber, sdcTime, totalAmount } = data.invoiceResult;
  const { businessName, address, city, taxId } = data.invoiceRequest;

  const products = extractProductsFromJurnal(data.journal);

  const scanedData = {
    invoice_number: invoiceNumber,
    invoice_date: sdcTime,
    invoice_amount: totalAmount,
    jurnal: data.jurnal,
    products,
    businessName,
    address,
    city,
    pib: taxId,
  };

  try {
    await addUserInvoice({ uid: userId, scanedData });
    return NextResponse.json(
      { message: "Račun je uspešno dodat" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error && error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
