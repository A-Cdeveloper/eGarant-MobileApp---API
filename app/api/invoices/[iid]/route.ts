import { getUserFromRequest } from "@/lib/auth/auth";
import { deleteUserInvoice } from "@/lib/invoices/deleteUserInvoice";
import { getSingleInvoice } from "@/lib/invoices/getSingleInvoice";
import { updateProductGPeriod } from "@/lib/invoices/updateProductGPeriod";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ iid: string }> }
) {
  const { iid } = await context.params;

  // check if user is logged in
  const userId = await getUserFromRequest(request);

  if (!userId) {
    return NextResponse.json(
      { error: "Nemate prava pristupa ovom računu" },
      { status: 401 }
    );
  }

  try {
    const { invoice, productsCount, productsWithWarrantyCount } =
      await getSingleInvoice({ uid: userId, iid });
    return NextResponse.json(
      { productsCount, productsWithWarrantyCount, data: invoice },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error && error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ iid: string }> }
) {
  const { iid } = await context.params;

  // check if user is logged in
  const userId = await getUserFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Nemate prava brisanja ovog računa" },
      { status: 401 }
    );
  }

  try {
    await deleteUserInvoice({ uid: userId, iid });
    return NextResponse.json(
      { message: "Račun je uspešno obrisan" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error && error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ iid: string }> }
) {
  const { pid, gperiod } = await request.json();
  const { iid } = await context.params;

  // check if user is logged in
  const userId = await getUserFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Nemate prava pristupa ovom artiklu" },
      { status: 401 }
    );
  }

  try {
    await updateProductGPeriod({ uid: userId, iid, pid, gperiod });
  } catch (error) {
    const errorMessage = error instanceof Error && error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Račun je uspešno izmenjen" },
    { status: 200 }
  );
}
