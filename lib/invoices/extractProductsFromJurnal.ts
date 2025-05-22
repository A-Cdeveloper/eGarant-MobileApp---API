export function extractProductsFromJurnal(jurnal: string) {
  const lines = jurnal
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const productStartIndex = lines.findIndex(
    (line) => line.includes("Назив") && line.includes("Цена")
  );

  if (productStartIndex === -1) return [];

  const products: {
    name: string;
    price: number;
    quantity: number;
  }[] = [];

  for (let i = productStartIndex + 1; i < lines.length; i += 2) {
    const nameLine = lines[i];
    const dataLine = lines[i + 1];

    if (!nameLine || !dataLine || dataLine.includes("----")) break;

    const match = dataLine.match(/([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)/);
    if (!match) continue;

    const price = parseFloat(match[1].replace(",", "."));
    const quantity = parseFloat(match[2].replace(",", "."));

    products.push({
      name: nameLine,
      price,
      quantity,
    });
  }

  return products;
}
