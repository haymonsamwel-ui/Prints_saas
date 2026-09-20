export type PdfDocument = {
  kind: "QUOTATION" | "INVOICE";
  number: string;
  customer: string;
  issueDate: string;
  dueOrExpiry: string;
  subtotal: string;
  tax: string;
  total: string;
  paid?: string;
  balance?: string;
  items: string[];
  terms?: string;
};

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

export function buildStructuredPdf(document: PdfDocument, company: { name: string; address: string; phone: string; email: string }) {
  const lines = [
    "0.12 0.18 0.25 RG",
    "0.12 0.18 0.25 rg",
    "BT",
    "/F1 20 Tf 50 785 Td",
    `(${escapePdfText(company.name || "Creative Business OS")}) Tj`,
    "/F1 10 Tf 0 -18 Td",
    `(${escapePdfText(`${company.address} | ${company.phone} | ${company.email}`)}) Tj`,
    "/F1 18 Tf 0 -42 Td",
    `(${document.kind}) Tj`,
    "/F1 10 Tf 0 -22 Td",
    `(${escapePdfText(`${document.number}    Date: ${document.issueDate}`)}) Tj`,
    `0 -16 Td (${escapePdfText(`${document.kind === "QUOTATION" ? "Valid until" : "Due date"}: ${document.dueOrExpiry}`)}) Tj`,
    `0 -30 Td (${escapePdfText(`Customer: ${document.customer}`)}) Tj`,
    "ET",
    "50 665 m 545 665 l S",
    "BT",
    "/F1 10 Tf 50 645 Td (DESCRIPTION) Tj 350 0 Td (AMOUNT) Tj",
    "ET",
    "50 635 m 545 635 l S",
    "BT",
    "/F1 10 Tf 50 615 Td",
    ...document.items.flatMap((item) => [`(${escapePdfText(item)}) Tj`, "0 -22 Td"]),
    "ET",
    "50 430 m 545 430 l S",
    "BT",
    "/F1 10 Tf 350 400 Td",
    `(${escapePdfText(`Subtotal: ${document.subtotal}`)}) Tj`,
    `0 -20 Td (${escapePdfText(`Tax: ${document.tax}`)}) Tj`,
    "/F1 13 Tf 0 -28 Td",
    `(${escapePdfText(`TOTAL: ${document.total}`)}) Tj`,
    ...(document.paid ? ["/F1 10 Tf 0 -22 Td", `(${escapePdfText(`Paid: ${document.paid}`)}) Tj`] : []),
    ...(document.balance ? [`0 -18 Td (${escapePdfText(`Balance: ${document.balance}`)}) Tj`] : []),
    "ET",
    "BT",
    "/F1 9 Tf 50 120 Td",
    `(${escapePdfText(document.terms || "Thank you for your business.")}) Tj`,
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${lines.length} >>\nstream\n${lines}\nendstream`,
  ];
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let byteLength = 0;
  const push = (value: string) => { const bytes = encoder.encode(value); chunks.push(bytes); byteLength += bytes.length; };
  push("%PDF-1.4\n");
  objects.forEach((object, index) => { offsets.push(byteLength); push(`${index + 1} 0 obj\n${object}\nendobj\n`); });
  const xref = byteLength;
  push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((offset) => push(`${offset.toString().padStart(10, "0")} 00000 n \n`));
  push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const pdf = new Uint8Array(byteLength);
  let cursor = 0;
  chunks.forEach((chunk) => { pdf.set(chunk, cursor); cursor += chunk.length; });
  return pdf;
}
