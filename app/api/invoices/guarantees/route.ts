import { requireUser } from "@/lib/auth/requireUser";
import { getAllUserGuarantees } from "@/lib/invoices/getAllUserGuarantees";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = await requireUser(request);
  if (userId instanceof NextResponse) return userId;
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
