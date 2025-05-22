import { requireUser } from "@/lib/auth/requireUser";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const { uid } = await context.params;

  const userId = await requireUser(request);
  if (userId instanceof NextResponse) return userId;

  // check if user exist
  if (userId !== uid) {
    return NextResponse.json(
      { error: "Nemate prava pristupa ovom korisniku" },
      { status: 401 }
    );
  }

  try {
    await prisma.user.delete({
      where: {
        uid: userId,
      },
    });

    return NextResponse.json(
      { message: "Profile je uspešno obrisan" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error && error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
