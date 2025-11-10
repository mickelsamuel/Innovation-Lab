'use client';

import React, { useState } from 'react';
import { exportToCSV, exportToPDF } from '@/lib/analytics';

interface ExportButtonProps {
  data: unknown[];
  filename: string;
  title?: string;
  columns?: { header: string; dataKey: string }[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, filename, title, columns }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCSV = () => {
    exportToCSV(data, filename);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    if (!title || !columns) {
      alert('PDF export requires title and columns configuration');
      return;
    }
    exportToPDF(title, data, columns, filename);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
            <div className="py-1">
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Export as CSV
              </button>
              {title && columns && (
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Export as PDF
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
