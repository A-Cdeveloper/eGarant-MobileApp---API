import { getUserFromRequest } from "@/lib/auth/auth";
import { getAllUserGuarantees } from "@/lib/invoices/getAllUserGuarantees";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // check if user is logged in
  const userId = await getUserFromRequest(req);

  if (!userId) {
    return NextResponse.json(
      { error: "Nemate prava pristupa garancijama" },
      { status: 401 }
    );
  }

  try {
    const { total, guaranteesProducts } = await getAllUserGuarantees(userId);
    return NextResponse.json(
      { total, data: guaranteesProducts },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error && error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
