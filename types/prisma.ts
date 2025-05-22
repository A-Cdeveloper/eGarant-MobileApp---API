import { Prisma } from "@prisma/client";

export type InvoiceWithSeller = Prisma.InvoiceGetPayload<{
  select: {
    iid: true;
    invoice_number: true;
    invoice_date: true;
    invoice_amount: true;
    seller: {
      select: {
        businessName: true;
        address: true;
        city: true;
        pib: true;
      };
    };
    user: {
      select: {
        uid: true;
      };
    };
  };
}>;

export type InvoiceWithSelerAndProducts = Prisma.InvoiceGetPayload<{
  select: {
    iid: true;
    invoice_number: true;
    invoice_date: true;
    invoice_amount: true;
    products: {
      select: {
        pid: true;
        name: true;
        quantity: true;
        gperiod: true;
        price: true;
      };
    };
    seller: {
      select: {
        businessName: true;
        address: true;
        city: true;
        pib: true;
      };
    };
  };
}>;

export type ProductWithInvoice = Prisma.ProductGetPayload<{
  select: {
    name: true;
    quantity: true;
    gperiod: true;
    price: true;
    invoice: {
      select: {
        invoice_number: true;
        invoice_date: true;
        seller: {
          select: {
            businessName: true;
            city: true;
            address: true;
          };
        };
      };
    };
  };
}>;
