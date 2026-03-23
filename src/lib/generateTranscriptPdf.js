import { jsPDF } from "jspdf";
import { buildChatTranscript, getTranscriptMeta } from "./chatTranscript";
import { IMAGES } from "./images";

const PRIMARY = [14, 75, 145]; // #0e4b91 - deep blue
const MUTED = [100, 116, 139]; // slate-500
const LIGHT_BG = [248, 250, 252]; // slate-50
const BORDER = [226, 232, 240]; // slate-200
const ROW_ALT = [249, 250, 251]; // slate-50 alternate
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;
const SENDER_COL_W = 28;
const MESSAGE_COL_W = CONTENT_W - SENDER_COL_W;
const ROW_HEIGHT = 6;
const LINE_HEIGHT = 4.5;

function wrapText(doc, text, maxWidth, fontSize = 8) {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  return Array.isArray(lines) ? lines : [String(lines)];
}

/**
 * Load image as base64 data URL for PDF embedding
 */
function loadImageDataUrl(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generate PDF transcript for a chat enquiry
 * @param {object} item - ChatSession document
 * @param {string} filename - optional filename (without .pdf)
 */
export async function generateTranscriptPdf(item, filename) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const meta = getTranscriptMeta(item);
  const messages = buildChatTranscript(item);

  let y = MARGIN;

  // ── Header with logo ──
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, PAGE_W, 24, "F");
  doc.setTextColor(255, 255, 255);

  const logoUrl = IMAGES?.LOGO_WHITE || IMAGES?.LOGO;
  const logoData = logoUrl ? await loadImageDataUrl(logoUrl) : null;
  if (logoData) {
    doc.addImage(logoData, "PNG", MARGIN, 4, 16, 16);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Chat Transcript", MARGIN + 20, 12);
  } else {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Petrozen", MARGIN, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Chat Transcript", MARGIN, 17);
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${meta.enquiryType} · ${meta.date}`, PAGE_W - MARGIN, 12, { align: "right" });

  y = 32;

  // ── Contact (left: label, right: credentials with breathing space) ──
  const contactPad = 10;
  const contactRight = MARGIN + CONTENT_W - contactPad;
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(MARGIN, y, CONTENT_W, 22, 2, 2, "FD");
  doc.setFontSize(6);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "bold");
  doc.text("Contact", MARGIN + contactPad, y + 8);
  doc.setFont("helvetica", "normal");
  doc.text(meta.enquiryType, MARGIN + contactPad, y + 14);
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(meta.name, contactRight, y + 6, { align: "right" });
  doc.text(meta.email, contactRight, y + 11, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(meta.phone, contactRight, y + 16, { align: "right" });

  y += 28;

  // ── Table header ──
  doc.setFillColor(...PRIMARY);
  doc.rect(MARGIN, y, SENDER_COL_W, ROW_HEIGHT, "F");
  doc.rect(MARGIN + SENDER_COL_W, y, MESSAGE_COL_W, ROW_HEIGHT, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Sender", MARGIN + 3, y + 4);
  doc.text("Message", MARGIN + SENDER_COL_W + 4, y + 4);
  y += ROW_HEIGHT;

  doc.setFont("helvetica", "normal");
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);

  // ── Table rows ──
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const sender = msg.from === "user" ? "User" : "Bot";
    const lines = wrapText(doc, msg.text, MESSAGE_COL_W - 6, 8);
    const cellH = Math.max(ROW_HEIGHT, lines.length * LINE_HEIGHT + 2);

    // Page break if needed
    if (y + cellH > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
      // Redraw table header on new page
      doc.setFillColor(...PRIMARY);
      doc.rect(MARGIN, y, SENDER_COL_W, ROW_HEIGHT, "F");
      doc.rect(MARGIN + SENDER_COL_W, y, MESSAGE_COL_W, ROW_HEIGHT, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Sender", MARGIN + 3, y + 4);
      doc.text("Message", MARGIN + SENDER_COL_W + 4, y + 4);
      y += ROW_HEIGHT;
      doc.setFont("helvetica", "normal");
    }

    // Row background (alternating)
    if (i % 2 === 1) {
      doc.setFillColor(...ROW_ALT);
      doc.rect(MARGIN, y, CONTENT_W, cellH, "F");
    }

    // Borders
    doc.setDrawColor(...BORDER);
    doc.rect(MARGIN, y, SENDER_COL_W, cellH, "S");
    doc.rect(MARGIN + SENDER_COL_W, y, MESSAGE_COL_W, cellH, "S");

    // Sender cell
    doc.setTextColor(...MUTED);
    doc.setFontSize(7);
    doc.text(sender, MARGIN + 3, y + cellH / 2 + 1.5, { align: "left" });

    // Message cell
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    const msgX = MARGIN + SENDER_COL_W + 4;
    const msgY = y + 4;
    lines.forEach((line, idx) => {
      doc.text(line, msgX, msgY + idx * LINE_HEIGHT);
    });

    y += cellH;
  }

  // ── Footer ──
  doc.setFontSize(6);
  doc.setTextColor(...MUTED);
  doc.text(
    `Generated ${new Date().toLocaleString()} · Petrozen`,
    PAGE_W / 2,
    PAGE_H - 8,
    { align: "center" }
  );

  const outFilename = filename || `petrozen-transcript-${Date.now()}.pdf`;
  doc.save(outFilename);
}
