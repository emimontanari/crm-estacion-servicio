/**
 * Utilidades para exportar datos a diferentes formatos
 */

/**
 * Convierte un array de objetos a CSV
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: Record<keyof T, string>
): string {
  if (data.length === 0) return "";

  const keys = Object.keys(data[0]) as (keyof T)[];
  const headerLabels = headers
    ? keys.map((key) => headers[key] || String(key))
    : keys.map((key) => String(key));

  // Encabezados
  const csvHeaders = headerLabels.join(",");

  // Filas de datos
  const csvRows = data.map((row) => {
    return keys
      .map((key) => {
        const value = row[key];
        // Escapar comillas y envolver en comillas si contiene comas
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
}

/**
 * Descarga un string como archivo CSV
 */
export function downloadCSV(
  csvContent: string,
  filename: string = "export.csv"
): void {
  // Agregar BOM para Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta datos a CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
): void {
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, filename);
}

/**
 * Convierte datos a JSON formateado y descarga
 */
export function exportToJSON<T>(data: T, filename: string = "export.json"): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Crea un documento HTML para impresión/PDF
 */
export function createPrintableHTML(
  title: string,
  content: string,
  styles?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: white;
            color: black;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 18px;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .meta {
            color: #666;
            font-size: 12px;
            margin-bottom: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
          }
          ${styles || ""}
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}

/**
 * Abre una ventana de impresión con el contenido dado
 */
export function printHTML(html: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor habilite las ventanas emergentes para imprimir");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Esperar a que se cargue el contenido antes de imprimir
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

/**
 * Formatea un número como moneda
 */
export function formatCurrency(value: number, currency: string = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Formatea una fecha
 */
export function formatDate(date: Date | number): string {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(date: Date | number): string {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}
