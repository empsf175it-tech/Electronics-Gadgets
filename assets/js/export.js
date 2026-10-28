/**
 * VOLTARIS EXPORT ENGINE (export.js)
 * Client-side CSV generator, Excel-compatible CSV generator (with BOM),
 * and high-fidelity print-to-PDF formatting.
 */

/**
 * Downloads a string payload as a client-side file
 */
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Converts array of gadget objects into RFC-4180 compliant CSV string
 */
export function convertGadgetsToCSV(gadgets) {
  const headers = [
    'ID', 'SKU', 'Name', 'Category', 'Price ($)', 'Cost ($)', 
    'Gross Margin (%)', 'In Stock', 'Min Stock', 'Status', 
    'Serial Number', 'IMEI / Identifier', 'Warranty (Months)', 'Warehouse'
  ];

  const rows = gadgets.map(item => [
    `"${item.id}"`,
    `"${item.sku}"`,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    item.price.toFixed(2),
    item.costPrice.toFixed(2),
    item.margin.toFixed(1),
    item.stock,
    item.minStock,
    `"${item.status}"`,
    `"${item.serial}"`,
    `"${item.imei}"`,
    item.warrantyMonths,
    `"${item.warehouse}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}

/**
 * Export products to standard CSV
 */
export function exportToCSV(products, filename = 'voltaris-inventory-report.csv') {
  const csvContent = convertGadgetsToCSV(products);
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export products to Excel-friendly CSV with UTF-8 BOM
 */
export function exportToExcel(products, filename = 'voltaris-inventory-ledger.csv') {
  const csvContent = '\uFEFF' + convertGadgetsToCSV(products);
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Trigger browser print dialog styled via dashboard.css @media print
 */
export function exportToPDF(reportTitle = 'VOLTARIS Operational Analytics Brief') {
  const headerElem = document.querySelector('.print-header');
  if (headerElem) {
    headerElem.innerHTML = `
      <h2>VOLTARIS — Electronics Gadgets Management & Analytics Studio</h2>
      <p>Report: ${reportTitle} | Generated: ${new Date().toLocaleString()}</p>
      <hr style="margin-block: 1rem; border-color: #ccc;" />
    `;
  }
  window.print();
}
