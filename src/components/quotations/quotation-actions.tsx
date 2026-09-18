"use client";

import { Download, MessageCircle } from "lucide-react";
import { customers, type quotations } from "@/lib/constants";
import { useStudioProfile, type StudioProfile } from "@/lib/studio-profile";

type Quotation = (typeof quotations)[number];

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function dataUrlToBytes(dataUrl?: string) {
  if (!dataUrl?.startsWith("data:image/jpeg;base64,")) {
    return null;
  }

  const binary = window.atob(dataUrl.split(",")[1] ?? "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function buildPdf(quote: Quotation, studioProfile: StudioProfile) {
  const logoBytes = dataUrlToBytes(studioProfile.logoDataUrl);
  const textTop = logoBytes ? 690 : 780;
  const lines = [
    studioProfile.name,
    `${studioProfile.address} | ${studioProfile.phone} | ${studioProfile.email}`,
    "",
    "QUOTATION",
    `Number: ${quote.number}`,
    `Issue date: ${quote.issueDate}`,
    `Valid until: ${quote.expiryDate}`,
    "",
    `Customer: ${quote.customer}`,
    "",
    "Items",
    ...quote.items.map((item) => `- ${item}`),
    "",
    `Subtotal: ${quote.subtotal}`,
    `VAT: ${quote.tax}`,
    `Total: ${quote.total}`,
    "",
    "Thank you for your business.",
  ];

  const content = [
    ...(logoBytes ? ["q", "70 0 0 70 50 720 cm", "/Logo Do", "Q"] : []),
    "BT",
    "/F1 12 Tf",
    `50 ${textTop} Td`,
    "16 TL",
    ...lines.map((line) => `(${escapePdfText(line)}) Tj T*`),
    "ET",
  ].join("\n");

  const contentObjectNumber = logoBytes ? 6 : 5;
  const pageResources = logoBytes
    ? "<< /Font << /F1 4 0 R >> /XObject << /Logo 5 0 R >> >>"
    : "<< /Font << /F1 4 0 R >> >>";
  const objects: (string | Uint8Array)[][] = [
    ["<< /Type /Catalog /Pages 2 0 R >>"],
    ["<< /Type /Pages /Kids [3 0 R] /Count 1 >>"],
    [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources ${pageResources} /Contents ${contentObjectNumber} 0 R >>`],
    ["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"],
  ];

  if (logoBytes) {
    objects.push([
      `<< /Type /XObject /Subtype /Image /Width 320 /Height 320 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoBytes.byteLength} >>\nstream\n`,
      logoBytes,
      "\nendstream",
    ]);
  }

  objects.push([`<< /Length ${content.length} >>\nstream\n${content}\nendstream`]);

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let byteLength = 0;

  function pushChunk(chunk: string | Uint8Array) {
    const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;

    chunks.push(bytes);
    byteLength += bytes.byteLength;
  }

  pushChunk("%PDF-1.4\n");
  objects.forEach((object, index) => {
    offsets.push(byteLength);
    pushChunk(`${index + 1} 0 obj\n`);
    object.forEach(pushChunk);
    pushChunk("\nendobj\n");
  });

  const xrefStart = byteLength;
  pushChunk(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((offset) => {
    pushChunk(`${offset.toString().padStart(10, "0")} 00000 n \n`);
  });
  pushChunk(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  const pdf = new Uint8Array(byteLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    pdf.set(chunk, offset);
    offset += chunk.byteLength;
  });

  return pdf;
}

function getWhatsAppUrl(quote: Quotation, studioProfile: StudioProfile) {
  const customer = customers.find((item) => item.name === quote.customer);
  const message = [
    `Hello ${quote.customer},`,
    `Your quotation ${quote.number} from ${studioProfile.name} is ready.`,
    `Total: ${quote.total}`,
    `Valid until: ${quote.expiryDate}`,
    "Please reply here if you would like us to proceed.",
  ].join("\n");

  const phone = customer?.contact.replace(/\D/g, "");
  const params = new URLSearchParams({ text: message });

  return phone ? `https://wa.me/${phone}?${params.toString()}` : `https://wa.me/?${params.toString()}`;
}

export function QuotationActions({ quote }: { quote: Quotation }) {
  const studioProfile = useStudioProfile();

  function downloadPdf() {
    const blob = new Blob([buildPdf(quote, studioProfile)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${quote.number}.pdf`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={getWhatsAppUrl(quote, studioProfile)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-emerald-300 transition hover:bg-slate-800"
        aria-label={`Share ${quote.number} on WhatsApp`}
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={downloadPdf}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-cyan-300 transition hover:bg-slate-800"
        aria-label={`Download ${quote.number} as PDF`}
        title="Download PDF"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}
