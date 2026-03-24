/**
 * GMP-compliant print utility for Quantum Invenza
 * Generates a printable HTML window with proper GMP header/footer.
 */

interface PrintOptions {
  title: string;
  subtitle?: string;
  preparedBy?: string;
  headers: string[];
  rows: (string | number)[][];
  orientation?: 'portrait' | 'landscape';
}

export function printTable({
  title,
  subtitle,
  preparedBy = 'System Generated',
  headers,
  rows,
  orientation = 'landscape',
}: PrintOptions): void {
  const now = new Date();
  const dateStr = now.toLocaleString('en-IN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });

  const tableRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell ?? '—'}</td>`).join('')}</tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — Quantum Invenza</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 ${orientation}; margin: 12mm 10mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
    .gmp-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #D4A847; padding-bottom: 8px; margin-bottom: 10px; }
    .gmp-header .logo { font-size: 16px; font-weight: 900; color: #D4A847; letter-spacing: -0.5px; }
    .gmp-header .company { font-size: 9px; color: #6b7280; margin-top: 2px; }
    .gmp-header .meta { text-align: right; font-size: 9px; color: #6b7280; }
    .doc-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 2px; }
    .doc-subtitle { font-size: 10px; color: #6b7280; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th { background: #f5f3ff; color: #1f1635; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 5px 6px; border: 1px solid #e2e0f0; text-align: left; }
    td { padding: 4px 6px; border: 1px solid #e5e7eb; font-size: 10px; color: #374151; vertical-align: top; }
    tr:nth-child(even) td { background: #fafaf8; }
    .gmp-footer { position: fixed; bottom: 8mm; left: 10mm; right: 10mm; display: flex; justify-content: space-between; font-size: 8px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 4px; }
    .gmp-footer .sign { display: inline-block; width: 100px; border-top: 1px solid #9ca3af; margin-top: 12px; text-align: center; font-size: 8px; }
    .sign-row { display: flex; gap: 40px; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="gmp-header">
    <div>
      <div class="logo">Quantum Invenza</div>
      <div class="company">PharmaTech Manufacturing Pvt. Ltd. | MH-SITE-01</div>
    </div>
    <div class="meta">
      <div><strong>Document Type:</strong> GMP Controlled Print</div>
      <div><strong>Print Date:</strong> ${dateStr}</div>
      <div><strong>Prepared By:</strong> ${preparedBy}</div>
    </div>
  </div>

  <div class="doc-title">${title}</div>
  ${subtitle ? `<div class="doc-subtitle">${subtitle}</div>` : ''}

  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div style="font-size:9px; color:#9ca3af; margin-bottom:16px;">
    Total Records: <strong>${rows.length}</strong>
  </div>

  <div class="sign-row">
    <div>
      <div style="width:140px; border-top:1px solid #374151; padding-top:4px; font-size:9px; text-align:center;">Prepared By</div>
    </div>
    <div>
      <div style="width:140px; border-top:1px solid #374151; padding-top:4px; font-size:9px; text-align:center;">Reviewed By (QA)</div>
    </div>
    <div>
      <div style="width:140px; border-top:1px solid #374151; padding-top:4px; font-size:9px; text-align:center;">Approved By</div>
    </div>
  </div>

  <div class="gmp-footer">
    <span>Quantum Invenza WMS — Confidential | GMP Controlled Document</span>
    <span>Printed: ${dateStr} | For internal use only</span>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 300);
}
