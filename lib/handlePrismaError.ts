import { Prisma } from "@prisma/client";

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Known Prisma error:", error.message);
    throw new Error("Greška u bazi podataka.");
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.error("Unknown Prisma request error:", error.message);
    throw new Error("Nepoznata greška prilikom komunikacije sa bazom.");
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    console.error("Rust panic in Prisma:", error.message);
    throw new Error("Interna greška baze podataka. Pokušajte ponovo.");
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("Failed to initialize Prisma client:", error.message);
    throw new Error("Neuspešno povezivanje sa bazom podataka.");
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error("Validation error in Prisma query:", error.message);
    throw new Error("Neispravan upit ka bazi podataka.");
  }

  console.error("Unexpected error:", error);
  throw error;
}
