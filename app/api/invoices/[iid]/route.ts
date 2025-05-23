import { withAuth } from "@/lib/auth/withAuth";
import { deleteUserInvoice } from "@/lib/invoices/deleteUserInvoice";
import { getSingleInvoice } from "@/lib/invoices/getSingleInvoice";
import { updateProductGPeriod } from "@/lib/invoices/updateProductGPeriod";
import { InvoiceWithSelerAndProducts } from "@/types/prisma";
import { NextRequest, NextResponse } from "next/server";

type SuccessGetResponse = {
  success: true;
  data: InvoiceWithSelerAndProducts | null;
  productsCount: number;
  productsWithWarrantyCount: number;
};

type SuccessDeleteResponse = {
  success: true;
  message: string;
};

type SuccessPatchResponse = {
  success: true;
  message: string;
};

type ErrorResponse = {
  success: false;
  error: {
    message: string;
  };
};

// --- GET ---
async function handleGet(
  request: NextRequest,
  userId: string,
  iid: string
): Promise<NextResponse<SuccessGetResponse | ErrorResponse>> {
  try {
    const { invoice, productsCount, productsWithWarrantyCount } =
      await getSingleInvoice({ uid: userId, iid });

    return NextResponse.json(
      {
        success: true,
        data: invoice,
        productsCount,
        productsWithWarrantyCount,
      },
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

export async function GET(
  request: NextRequest,
  context: { params: { iid: string } }
) {
  const { iid } = context.params;

  return withAuth<SuccessGetResponse | ErrorResponse>(async (req, userId) => {
    return handleGet(req, userId, iid);
  })(request);
}

// --- DELETE ---
async function handleDelete(
  request: NextRequest,
  userId: string,
  iid: string
): Promise<NextResponse<SuccessDeleteResponse | ErrorResponse>> {
  try {
    await deleteUserInvoice({ uid: userId, iid });

    return NextResponse.json(
      {
        success: true,
        message: "Račun je uspešno obrisan",
      },
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

export async function DELETE(
  request: NextRequest,
  context: { params: { iid: string } }
) {
  const { iid } = context.params;

  return withAuth<SuccessDeleteResponse | ErrorResponse>(
    async (req, userId) => {
      return handleDelete(req, userId, iid);
    }
  )(request);
}

// --- PATCH ---
async function handlePatch(
  request: NextRequest,
  userId: string,
  iid: string
): Promise<NextResponse<SuccessPatchResponse | ErrorResponse>> {
  try {
    const { pid, gperiod } = await request.json();

    await updateProductGPeriod({ uid: userId, iid, pid, gperiod });

    return NextResponse.json(
      {
        success: true,
        message: "Račun je uspešno izmenjen",
      },
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

export async function PATCH(
  request: NextRequest,
  context: { params: { iid: string } }
) {
  const { iid } = context.params;

  return withAuth<SuccessPatchResponse | ErrorResponse>(async (req, userId) => {
    return handlePatch(req, userId, iid);
  })(request);
}
