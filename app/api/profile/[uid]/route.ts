import { withAuth } from "@/lib/auth/withAuth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

type DeleteSuccessResponse = {
  success: true;
  message: string;
};

type DeleteErrorResponse = {
  success: false;
  error: {
    message: string;
  };
};

export const DELETE = withAuth<DeleteSuccessResponse | DeleteErrorResponse>(
  async (request, userId) => {
    const url = new URL(request.url);
    const uid = url.pathname.split("/").pop();

    if (!uid || uid !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Nemate prava pristupa ovom korisniku" },
        },
        { status: 401 }
      );
    }

    try {
      await prisma.user.delete({ where: { uid: userId } });

      return NextResponse.json(
        {
          success: true,
          message: "Profil je uspešno obrisan",
        },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Greška na serveru";

      return NextResponse.json(
        {
          success: false,
          error: { message: errorMessage },
        },
        { status: 500 }
      );
    }
  }
);
