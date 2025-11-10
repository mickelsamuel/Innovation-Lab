import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Convert to CSV
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Escape values with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (
  title: string,
  data: any[],
  columns: { header: string; dataKey: string }[],
  filename: string
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(139, 92, 246); // Purple color
  doc.text(title, 14, 20);

  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 28);

  // Add table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey] ?? '')),
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 92, 246], // Purple
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249], // Light slate
    },
  });

  // Save PDF
  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportChartImage = async (chartId: string, filename: string) => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) return;

  try {
    // Use html2canvas if available
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(chartElement);
    const link = document.createElement('a');
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } catch (error) {
    console.error('Failed to export chart:', error);
  }
};
