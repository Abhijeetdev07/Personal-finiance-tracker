import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// PDF Export Utility for Smart Finance Transactions
export class TransactionPDFExporter {
  constructor() {
    this.doc = null;
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
    this.logoImage = null; // Custom logo image
  }

  // Initialize PDF document
  initializePDF() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    
    // Manually add autoTable if not available
    if (typeof this.doc.autoTable !== 'function' && typeof autoTable === 'function') {
      this.doc.autoTable = (options) => autoTable(this.doc, options);
    }
    
    // Log warning if autoTable is not available (will use fallback)
    if (typeof this.doc.autoTable !== 'function') {
      console.warn('jsPDF autoTable plugin not available, using fallback table generation');
    }
    
    return this.doc;
  }

  // Format currency for display - simple version to avoid extra characters
  formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0.00';
    }
    
    // Very simple formatting to avoid any unwanted characters
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toFixed(2);
    
    // Add commas manually for thousands
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return parts.join('.');
  }

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  // Simple header with company logo and generated info
  addHeader(filterInfo = {}, pageNumber = 1, totalPages = 1) {
    const doc = this.doc;
    
    // Add custom logo if available
    if (this.logoImage) {
      try {
        // Add logo image (38.5x14mm size to maintain aspect ratio of 110x40px)
        // 110px:40px = 2.75:1 ratio, so 38.5mm:14mm maintains this ratio
        doc.addImage(this.logoImage, 'PNG', this.margin, 10, 38.5, 14);
      } catch (error) {
        console.warn('Failed to add logo to PDF:', error);
        // Fallback to simple circle logo
        this.addFallbackLogo(doc);
      }
    } else {
      // Fallback to simple circle logo
      this.addFallbackLogo(doc);
    }
    
    // Generated info (right side)
    const now = new Date();
    const dateTime = now.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }) + ' ' + now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const generatedText = `Generated on: ${dateTime}`;
    const textWidth = doc.getTextWidth(generatedText);
    doc.text(generatedText, this.pageWidth - this.margin - textWidth, 24);
    
    // Add horizontal ruler line below header
    doc.setDrawColor(200, 200, 200); // Light gray color
    doc.setLineWidth(0.5);
    doc.line(this.margin, 35, this.pageWidth - this.margin, 35);
    
    return 45; // Return next Y position (increased to account for ruler line)
  }

  // Fallback logo when custom logo fails to load
  addFallbackLogo(doc) {
    doc.setFillColor(37, 99, 235);
    doc.circle(this.margin + 8, 20, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SF', this.margin + 5, 24);
  }

  // Add enhanced summary section with detailed metrics
  addSummary(summary, startY = 85) {
    const doc = this.doc;
    
    // Summary section header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('FINANCIAL SUMMARY', this.margin, startY);
    
    let currentY = startY + 10;
    
    // Main summary boxes
    const boxWidth = 45;
    const boxHeight = 22;
    const boxSpacing = 8;
    
    // Income box
    doc.setFillColor(34, 197, 94); // Green
    doc.roundedRect(this.margin, currentY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL INCOME', this.margin + 2, currentY + 6);
    doc.setFontSize(11);
    doc.text(this.formatCurrency(summary.income || 0), this.margin + 2, currentY + 14);
    doc.setFontSize(7);
    doc.text(`${summary.incomeCount || 0} transactions`, this.margin + 2, currentY + 19);
    
    // Expense box
    const expenseX = this.margin + boxWidth + boxSpacing;
    doc.setFillColor(239, 68, 68); // Red
    doc.roundedRect(expenseX, currentY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL EXPENSE', expenseX + 2, currentY + 6);
    doc.setFontSize(11);
    doc.text(this.formatCurrency(summary.expense || 0), expenseX + 2, currentY + 14);
    doc.setFontSize(7);
    doc.text(`${summary.expenseCount || 0} transactions`, expenseX + 2, currentY + 19);
    
    // Balance box
    const balanceX = expenseX + boxWidth + boxSpacing;
    const balanceColor = (summary.balance || 0) >= 0 ? [34, 197, 94] : [239, 68, 68];
    doc.setFillColor(...balanceColor);
    doc.roundedRect(balanceX, currentY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('NET BALANCE', balanceX + 2, currentY + 6);
    doc.setFontSize(11);
    doc.text(this.formatCurrency(summary.balance || 0), balanceX + 2, currentY + 14);
    doc.setFontSize(7);
    const balanceStatus = (summary.balance || 0) >= 0 ? 'Positive' : 'Negative';
    doc.text(balanceStatus, balanceX + 2, currentY + 19);
    
    // Total transactions box
    const totalX = balanceX + boxWidth + boxSpacing;
    doc.setFillColor(99, 102, 241); // Indigo
    doc.roundedRect(totalX, currentY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTIONS', totalX + 2, currentY + 6);
    doc.setFontSize(14);
    doc.text(`${summary.totalTransactions || 0}`, totalX + 2, currentY + 16);
    
    currentY += boxHeight + 15;
    
    // Additional metrics (if space allows)
    if (summary.avgIncome || summary.avgExpense) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text('Average Amounts:', this.margin, currentY);
      
      currentY += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (summary.avgIncome > 0) {
        doc.text(`• Avg Income: ${this.formatCurrency(summary.avgIncome)}`, this.margin + 5, currentY);
        currentY += 6;
      }
      
      if (summary.avgExpense > 0) {
        doc.text(`• Avg Expense: ${this.formatCurrency(summary.avgExpense)}`, this.margin + 5, currentY);
        currentY += 6;
      }
      
      currentY += 5;
    }
    
    return currentY; // Return next Y position
  }

  // Add income/expense summary above transaction table
  addIncomeExpenseSummary(transactions, startY) {
    const doc = this.doc;
    let currentY = startY;
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });
    
    // Summary section background
    doc.setFillColor(248, 250, 252); // Very light blue-gray
    doc.rect(this.margin, currentY, 170, 25, 'F');
    
    // Summary section border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(this.margin, currentY, 170, 25);
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Transaction Summary', this.margin + 5, currentY + 8);
    
    // Income and Expense in two columns
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Total Income (left side)
    doc.setTextColor(34, 197, 94); // Green
    doc.setFont('helvetica', 'bold');
    doc.text('Total Income:', this.margin + 10, currentY + 18);
    const incomeText = this.formatCurrency(totalIncome);
    const incomeWidth = doc.getTextWidth('Total Income: ');
    doc.text(incomeText, this.margin + 10 + incomeWidth, currentY + 18);
    
    // Total Expense (right side)
    doc.setTextColor(239, 68, 68); // Red
    doc.text('Total Expense:', this.margin + 90, currentY + 18);
    const expenseText = this.formatCurrency(totalExpense);
    const expenseWidth = doc.getTextWidth('Total Expense: ');
    doc.text(expenseText, this.margin + 90 + expenseWidth, currentY + 18);
    
    return currentY + 35; // Return next Y position with some spacing
  }

 // Create enhanced transactions table with better formatting
  createTransactionsTable(transactions, startY = 120) {
    const doc = this.doc;
    
    // Table section header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('TRANSACTION DETAILS', this.margin, startY);
    
    const tableStartY = startY + 10;
    
    // Check if autoTable is available, otherwise use fallback
    if (typeof this.doc.autoTable !== 'function') {
      return this.createSimpleTable(transactions, tableStartY);
    }
    
    // Prepare table data (5 columns only)
    const tableData = transactions.map((transaction, index) => [
      index + 1,
      this.formatDate(transaction.date),
      transaction.category || 'Other',
      transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
      this.formatCurrency(transaction.amount)
    ]);
    
    // Enhanced table configuration
    const tableConfig = {
      startY: tableStartY,
      head: [['Sr No', 'Date', 'Category', 'Type', 'Amount']],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
        lineColor: [203, 213, 225],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [37, 99, 235], // Blue header
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        cellPadding: { top: 6, right: 3, bottom: 6, left: 3 }
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // Sr No column
        1: { cellWidth: 25, halign: 'center' }, // Date column
        2: { cellWidth: 45, halign: 'center' }, // Category column (wider)
        3: { halign: 'center', cellWidth: 25 }, // Type column (wider)
        4: { halign: 'center', cellWidth: 35 } // Amount column (reduced)
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Very light blue-gray for alternate rows
      },
      margin: { left: this.margin, right: this.margin },
      didParseCell: function(data) {
        // Enhanced styling for different cell types
        
        // Header row styling
        if (data.row.section === 'head') {
          data.cell.styles.fillColor = [37, 99, 235];
          data.cell.styles.textColor = [255, 255, 255];
          return;
        }
        
        // Color code transaction types
        if (data.column.index === 4) { // Type column
          const cellText = data.cell.text[0];
          if (cellText === 'Income') {
            data.cell.styles.textColor = [34, 197, 94]; // Green for income
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 253, 244]; // Light green background
          } else if (cellText === 'Expense') {
            data.cell.styles.textColor = [239, 68, 68]; // Red for expense
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [254, 242, 242]; // Light red background
          }
        }
        
        // Color code amounts
        if (data.column.index === 5) { // Amount column
          const rowIndex = data.row.index;
          if (transactions[rowIndex]) {
            const type = transactions[rowIndex].type;
            if (type === 'income') {
              data.cell.styles.textColor = [34, 197, 94]; // Green for income
              data.cell.styles.fontStyle = 'bold';
            } else if (type === 'expense') {
              data.cell.styles.textColor = [239, 68, 68]; // Red for expense
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
        
        // Serial number styling
        if (data.column.index === 0) {
          data.cell.styles.fillColor = [243, 244, 246]; // Light gray
          data.cell.styles.fontStyle = 'bold';
        }
        
        // Category styling
        if (data.column.index === 3) {
          data.cell.styles.fontSize = 7;
          data.cell.styles.textColor = [75, 85, 99];
        }
      },
      // Add page break handling
      showHead: 'everyPage',
      pageBreak: 'auto',
      pageBreakBefore: function(cursor, doc) {
        // Add space for footer
        return cursor.y >= doc.internal.pageSize.height - 40;
      }
    };
    
    // Generate table using autoTable plugin
    doc.autoTable(tableConfig);
    
    // Return final Y position after table
    return doc.lastAutoTable ? doc.lastAutoTable.finalY : tableStartY + 100;
  }

  // Simple table with 5 columns only
  createSimpleTable(transactions, startY) {
    const doc = this.doc;
    let currentY = startY;
    
    // Table headers (only 5 columns as requested)
    const headers = ['Sr No', 'Date', 'Category', 'Type', 'Amount'];
    const colX = [this.margin, this.margin + 20, this.margin + 50, this.margin + 100, this.margin + 130];
    
    // Header background
    doc.setFillColor(240, 240, 240);
    doc.rect(this.margin, currentY, 170, 10, 'F');
    
    // Header text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, i) => {
      doc.text(header, colX[i] + 2, currentY + 7);
    });
    
    currentY += 12;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    transactions.forEach((transaction, index) => {
      // Check for page break
      if (currentY > this.pageHeight - 40) {
        doc.addPage();
        currentY = 30;
        
        // Redraw header on new page
        doc.setFillColor(240, 240, 240);
        doc.rect(this.margin, currentY, 170, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        headers.forEach((header, i) => {
          doc.text(header, colX[i] + 2, currentY + 7);
        });
        currentY += 12;
        doc.setFont('helvetica', 'normal');
      }
      
      // Row data (only 5 columns)
      const rowData = [
        (index + 1).toString(),
        this.formatDate(transaction.date),
        (transaction.category || 'Other').substring(0, 15),
        transaction.type === 'income' ? 'Income' : 'Expense',
        this.formatCurrency(transaction.amount)
      ];
      
      // Draw row
      doc.setTextColor(0, 0, 0);
      rowData.forEach((data, i) => {
        if (i === 4) { // Amount column - center it
          const textWidth = doc.getTextWidth(data);
          const colWidth = 35; // Amount column width (reduced)
          const centerX = colX[i] + (colWidth - textWidth) / 2;
          doc.text(data, centerX, currentY + 7);
        } else {
          doc.text(data, colX[i] + 2, currentY + 7);
        }
      });
      
      currentY += 10;
    });
    
    // Table border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(this.margin, startY, 170, currentY - startY);
    
    return currentY + 10;
  }

  // Simple footer with page numbers on right side
  addFooter(summary = {}, pageNumber = 1, totalPages = 1) {
    const doc = this.doc;
    const footerY = this.pageHeight - 15;
    
    // Clear footer area to prevent overlapping
    doc.setFillColor(255, 255, 255); // White background
    doc.rect(this.pageWidth - this.margin - 50, footerY - 5, 50, 10, 'F'); // Clear area for page number
    
    // Page number (right side)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const pageText = `Page ${pageNumber} of ${totalPages}`;
    const pageWidth = doc.getTextWidth(pageText);
    doc.text(pageText, this.pageWidth - this.margin - pageWidth, footerY);
  }

  // Calculate summary from transactions
  calculateSummary(transactions) {
    const summary = {
      income: 0,
      expense: 0,
      balance: 0,
      totalTransactions: transactions.length
    };
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        summary.income += transaction.amount;
      } else if (transaction.type === 'expense') {
        summary.expense += transaction.amount;
      }
    });
    
    summary.balance = summary.income - summary.expense;
    return summary;
  }

  // Simplified PDF export function
  async exportTransactionsPDF(transactions, filterInfo = {}, filename = null) {
    try {
      // Load logo first
      await this.loadLogo();
      
      // Initialize PDF
      this.initializePDF();
      
      // Calculate basic summary
      const summary = this.calculateSummary(transactions);
      
      // Add simple header
      const headerEndY = this.addHeader(filterInfo, 1, 1);
      
      // Add income/expense summary
      const summaryEndY = this.addIncomeExpenseSummary(transactions, headerEndY + 5);
      
      // Add transactions table or no data message
      if (transactions.length > 0) {
        this.createTransactionsTable(transactions, summaryEndY + 5);
      } else {
        // No transactions message
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('No transactions found for the selected criteria.', this.margin, summaryEndY + 20);
      }
      
      // Handle multi-page documents
      const totalPages = this.doc.internal.getNumberOfPages();
      
      // Add footer to all pages with correct page numbers
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i);
        this.addFooter(summary, i, totalPages);
      }
      
      // Generate filename
      if (!filename) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        filename = `transactions_${dateStr}.pdf`;
      }
      
      // Save PDF
      this.doc.save(filename);
      
      return {
        success: true,
        filename: filename,
        summary: summary
      };
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate PDF report'
      };
    }
  }

  // Load logo image from assets
  async loadLogo() {
    try {
      // Import the logo from assets
      const logoModule = await import('/src/assets/web_logo.png');
      const logoUrl = logoModule.default;
      
      // Convert image to base64 for PDF
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          this.logoImage = dataURL;
          resolve(dataURL);
        };
        img.onerror = () => {
          console.warn('Failed to load logo image');
          reject(new Error('Logo load failed'));
        };
        img.src = logoUrl;
      });
    } catch (error) {
      console.warn('Logo not found in assets:', error);
      return null;
    }
  }

}

// Convenience function for quick export
export async function exportTransactionsToPDF(transactions, filterInfo = {}, filename = null) {
  const exporter = new TransactionPDFExporter();
  return await exporter.exportTransactionsPDF(transactions, filterInfo, filename);
}

// Export filter helper functions
export const ExportFilters = {
  // Filter all time transactions
  filterAllTime: (transactions, type = 'all') => {
    if (type === 'all') return transactions;
    return transactions.filter(t => t.type === type);
  },
  
  // Filter by date range
  filterByDateRange: (transactions, startDate, endDate, type = 'all') => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full end date
    
    let filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });
    
    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type);
    }
    
    return filtered;
  },
  
  // Filter by specific month
  filterByMonth: (transactions, month, year, type = 'all') => {
    let filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
    
    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type);
    }
    
    return filtered;
  }
};
