import { requireUser } from "./requireUser";
import { NextRequest, NextResponse } from "next/server";

export function withAuth<T>(
  handler: (request: NextRequest, userId: string) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse<T>> {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    try {
      const userId = await requireUser(request);

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Nemate prava pristupa99999999. Prijavite se ponovo",
            },
          } as T,
          { status: 401 }
        );
      }

      return await handler(request, userId);
    } catch (error) {
      console.error("Auth error:", error); // ← here you'll see DB issues
      return NextResponse.json(
        {
          success: false,
          error: { message: "Greška na serveru" },
        } as T,
        { status: 500 }
      );
    }
  };
}
