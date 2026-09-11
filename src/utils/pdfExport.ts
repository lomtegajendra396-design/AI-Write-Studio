import { jsPDF } from "jspdf";

export interface PdfExportOptions {
  title: string;
  toolName: string;
  language: string;
  tone: string;
  content: string;
  wordCount: number;
}

export function exportToTxt(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportToPdf(options: PdfExportOptions): void {
  const { toolName, language, tone, content, wordCount } = options;

  // Check if content contains non-Latin Unicode characters (e.g. Hindi, Marathi Devanagari)
  const hasUnicode = /[^\u0000-\u007F]/.test(content);

  if (hasUnicode) {
    // For Hindi and Marathi, browsers render high-fidelity Devanagari ligatures and glyphs via printable window/iframe
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const dateStr = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="${language === "Hindi" ? "hi" : language === "Marathi" ? "mr" : "en"}">
        <head>
          <meta charset="utf-8" />
          <title>${toolName} - AI Writing Tool</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body {
              font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif;
              line-height: 1.7;
              color: #1e293b;
              max-width: 800px;
              margin: 0 auto;
              padding: 30px;
            }
            .header-badge {
              display: inline-block;
              background: #0f172a;
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.05em;
              padding: 4px 10px;
              border-radius: 6px;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            h1 {
              font-size: 26px;
              color: #0f172a;
              margin: 0 0 8px 0;
            }
            .meta {
              font-size: 13px;
              color: #64748b;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 14px;
              margin-bottom: 24px;
            }
            .content {
              font-size: 15px;
              white-space: pre-wrap;
              word-break: break-word;
            }
            .footer {
              margin-top: 40px;
              padding-top: 12px;
              border-top: 1px solid #f1f5f9;
              font-size: 11px;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-badge">AI Writing Tool</div>
          <h1>${toolName}</h1>
          <div class="meta">Language: ${language} &nbsp;|&nbsp; Tone: ${tone} &nbsp;|&nbsp; Word Count: ${wordCount} &nbsp;|&nbsp; Date: ${dateStr}</div>
          <div class="content">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          <div class="footer">
            <span>Generated with AI Writing Tool</span>
            <span>Language: ${language}</span>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }
  }

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 48;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header Badge
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(margin, y, 130, 20, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("AI WRITING TOOL", margin + 12, y + 14);

    y += 34;

    // Title
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(toolName, margin, y);

    y += 18;

    // Meta row (Language, Tone, Words, Date)
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const metaText = `Language: ${language}   |   Tone: ${tone}   |   Words: ${wordCount}   |   Date: ${dateStr}`;
    doc.text(metaText, margin, y);

    y += 14;

    // Divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);

    y += 24;

    // Content body
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lineHeight = 16;

    // Split content into lines and paragraphs
    const paragraphs = content.split("\n");

    for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
      const para = paragraphs[pIndex].trimEnd();

      if (!para) {
        y += lineHeight * 0.8;
        continue;
      }

      // Check if it's a markdown header
      if (para.startsWith("# ")) {
        y += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(15, 23, 42);
        const headerLines = doc.splitTextToSize(para.replace(/^#\s+/, ""), contentWidth);
        for (const line of headerLines) {
          if (y + 20 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 20;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        y += 4;
        continue;
      } else if (para.startsWith("## ")) {
        y += 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        const headerLines = doc.splitTextToSize(para.replace(/^##\s+/, ""), contentWidth);
        for (const line of headerLines) {
          if (y + 18 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 18;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        y += 3;
        continue;
      } else if (para.startsWith("### ")) {
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        const headerLines = doc.splitTextToSize(para.replace(/^###\s+/, ""), contentWidth);
        for (const line of headerLines) {
          if (y + 16 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 16;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        continue;
      }

      // Normal paragraph lines
      const lines = doc.splitTextToSize(para, contentWidth);
      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }

      y += 6; // paragraph gap
    }

    // Page numbers footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 55, pageHeight - 24);
      doc.text("Generated with AI Writing Tool", margin, pageHeight - 24);
    }

    const safeTitle = toolName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    doc.save(`${safeTitle}-document.pdf`);
  } catch (err) {
    console.error("PDF generation error, fallback to print/txt:", err);
    // Fallback: create printable window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${toolName} - AI Writing Tool</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; }
            h1 { font-size: 24px; color: #0f172a; margin-bottom: 4px; }
            .meta { color: #64748b; font-size: 13px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 15px; }
          </style>
        </head>
        <body>
          <h1>${toolName}</h1>
          <div class="meta">Language: ${language} | Tone: ${tone} | Words: ${wordCount}</div>
          <pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          <script>window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}
