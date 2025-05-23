import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "./requireUser";

export function withAuth<T>(
  handler: (request: NextRequest, userId: string) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse<T>> {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    const userId = await requireUser(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Nemate prava pristupa. Prijavite se ponovo" },
        } as T,
        { status: 401 }
      );
    }

    return handler(request, userId);
  };
}
