// Export Service for Smart Finance - Handles backend data fetching and PDF generation
import { apiFetch } from './api';
import { exportTransactionsToPDF } from './pdfExport';

/**
 * Enhanced Export Service that fetches filtered data from backend and generates PDF
 */
export class ExportService {
  constructor() {
    this.isExporting = false;
  }

  /**
   * Fetch filtered transactions from backend
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} API response with transactions and summary
   */
  async fetchFilteredTransactions(filters = {}) {
    try {
      const {
        exportType = 'all-time',
        transactionType = 'all',
        startDate = null,
        endDate = null,
        month = null,
        year = null,
        category = 'all'
      } = filters;

      // Build query parameters for backend API
      const queryParams = new URLSearchParams();
      
      // Add export type
      queryParams.set('exportType', exportType);
      
      // Add transaction type filter
      if (transactionType && transactionType !== 'all') {
        queryParams.set('type', transactionType);
      }
      
      // Add category filter
      if (category && category !== 'all') {
        queryParams.set('category', category);
      }
      
      // Add date filters based on export type
      switch (exportType) {
        case 'date-range':
          if (startDate) queryParams.set('startDate', startDate);
          if (endDate) queryParams.set('endDate', endDate);
          break;
          
        case 'monthly':
          if (month !== null) queryParams.set('month', month.toString());
          if (year !== null) queryParams.set('year', year.toString());
          break;
          
        case 'all-time':
        default:
          // No additional date filters needed
          break;
      }

      // Fetch from backend export endpoint
      const response = await apiFetch(`/transactions/export?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch export data`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Backend returned unsuccessful response');
      }

      return {
        success: true,
        transactions: data.data.transactions || [],
        summary: data.data.summary || {},
        filterInfo: data.data.filterInfo || {}
      };

    } catch (error) {
      console.error('Export Service - Fetch Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch transaction data',
        transactions: [],
        summary: {},
        filterInfo: {}
      };
    }
  }

  /**
   * Generate export filename based on filters and current date
   * @param {Object} filterInfo - Filter information
   * @returns {string} Generated filename
   */
  generateFilename(filterInfo = {}) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    let filename = 'transactions';
    
    // Add type suffix
    if (filterInfo.type && filterInfo.type !== 'all') {
      filename += `_${filterInfo.type}`;
    }
    
    // Add period suffix
    if (filterInfo.exportType) {
      switch (filterInfo.exportType) {
        case 'monthly':
          if (filterInfo.month !== null && filterInfo.year !== null) {
            const monthNames = [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];
            filename += `_${monthNames[filterInfo.month]}_${filterInfo.year}`;
          }
          break;
          
        case 'date-range':
          if (filterInfo.startDate && filterInfo.endDate) {
            const start = filterInfo.startDate.replace(/-/g, '');
            const end = filterInfo.endDate.replace(/-/g, '');
            filename += `_${start}_to_${end}`;
          }
          break;
          
        case 'all-time':
        default:
          filename += '_all_time';
          break;
      }
    }
    
    // Add date suffix
    filename += `_${dateStr}.pdf`;
    
    return filename;
  }

  /**
   * Format filter info for PDF generation
   * @param {Object} filters - Original filter parameters
   * @param {Object} backendFilterInfo - Filter info from backend
   * @returns {Object} Formatted filter info for PDF
   */
  formatFilterInfo(filters = {}, backendFilterInfo = {}) {
    const filterInfo = {
      type: filters.transactionType || 'all',
      exportType: filters.exportType || 'all-time',
      ...backendFilterInfo
    };

    // Format period display text
    switch (filters.exportType) {
      case 'all-time':
        filterInfo.period = 'All Time';
        filterInfo.dateRange = 'Complete transaction history';
        break;
        
      case 'date-range':
        if (filters.startDate && filters.endDate) {
          const startDate = new Date(filters.startDate).toLocaleDateString('en-IN');
          const endDate = new Date(filters.endDate).toLocaleDateString('en-IN');
          filterInfo.period = `${startDate} to ${endDate}`;
          filterInfo.dateRange = filterInfo.period;
        }
        break;
        
      case 'monthly':
        if (filters.month !== null && filters.year !== null) {
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          filterInfo.period = `${monthNames[filters.month]} ${filters.year}`;
          filterInfo.dateRange = filterInfo.period;
        }
        break;
    }

    return filterInfo;
  }

  /**
   * Main export function - fetches data from backend and generates PDF
   * @param {Object} filters - Export filter parameters
   * @param {Function} onProgress - Progress callback function
   * @param {Object} userInfo - User information for PDF header
   * @returns {Promise<Object>} Export result
   */
  async exportTransactions(filters = {}, onProgress = null, userInfo = null) {
    if (this.isExporting) {
      return {
        success: false,
        error: 'Export already in progress'
      };
    }

    this.isExporting = true;

    try {
      // Step 1: Validate inputs
      if (onProgress) onProgress(10, 'Validating export parameters...');
      
      if (filters.exportType === 'date-range') {
        if (!filters.startDate || !filters.endDate) {
          throw new Error('Start date and end date are required for date range export');
        }
        if (new Date(filters.startDate) > new Date(filters.endDate)) {
          throw new Error('Start date must be before end date');
        }
      }

      if (filters.exportType === 'monthly') {
        if (filters.month === null || filters.year === null) {
          throw new Error('Month and year are required for monthly export');
        }
      }

      // Step 2: Fetch filtered data from backend
      if (onProgress) onProgress(25, 'Fetching transaction data...');
      
      const fetchResult = await this.fetchFilteredTransactions(filters);
      
      if (!fetchResult.success) {
        throw new Error(fetchResult.error || 'Failed to fetch transaction data');
      }

      const { transactions, summary } = fetchResult;

      // Step 3: Validate data
      if (onProgress) onProgress(50, 'Processing transaction data...');
      
      if (!transactions || transactions.length === 0) {
        return {
          success: false,
          error: 'No transactions found for the selected criteria',
          summary: { totalTransactions: 0 }
        };
      }

      // Step 4: Format filter info for PDF
      if (onProgress) onProgress(60, 'Preparing PDF layout...');
      
      const filterInfo = this.formatFilterInfo(filters, fetchResult.filterInfo);

      // Step 5: Generate filename
      const filename = this.generateFilename(filterInfo);

      // Step 6: Generate PDF
      if (onProgress) onProgress(75, 'Generating PDF document...');
      
      const pdfResult = await exportTransactionsToPDF(transactions, filterInfo, filename, userInfo);

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'Failed to generate PDF');
      }

      // Step 7: Complete
      if (onProgress) onProgress(100, 'Export completed successfully!');

      return {
        success: true,
        filename: filename,
        summary: {
          totalTransactions: transactions.length,
          totalIncome: summary.totalIncome || 0,
          totalExpense: summary.totalExpense || 0,
          balance: summary.balance || 0,
          incomeCount: summary.incomeCount || 0,
          expenseCount: summary.expenseCount || 0,
          exportDate: new Date().toISOString(),
          filterApplied: filterInfo
        }
      };

    } catch (error) {
      console.error('Export Service - Export Error:', error);
      
      if (onProgress) onProgress(0, 'Export failed');
      
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during export'
      };
      
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Export with local data (fallback method)
   * @param {Array} transactions - Local transaction data
   * @param {Object} filters - Filter parameters
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Export result
   */
  async exportWithLocalData(transactions = [], filters = {}, onProgress = null) {
    if (this.isExporting) {
      return {
        success: false,
        error: 'Export already in progress'
      };
    }

    this.isExporting = true;

    try {
      if (onProgress) onProgress(20, 'Processing local data...');

      // Apply filters to local data
      let filteredTransactions = [...transactions];
      
      // Filter by type
      if (filters.transactionType && filters.transactionType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => 
          t.type === filters.transactionType
        );
      }

      // Filter by date range
      if (filters.exportType === 'date-range' && filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        
        filteredTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= start && transactionDate <= end;
        });
      }

      // Filter by month
      if (filters.exportType === 'monthly' && filters.month !== null && filters.year !== null) {
        filteredTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === filters.month && 
                 transactionDate.getFullYear() === filters.year;
        });
      }

      if (onProgress) onProgress(50, 'Generating PDF...');

      if (filteredTransactions.length === 0) {
        return {
          success: false,
          error: 'No transactions found for the selected criteria',
          summary: { totalTransactions: 0 }
        };
      }

      // Format filter info and generate PDF
      const filterInfo = this.formatFilterInfo(filters);
      const filename = this.generateFilename(filterInfo);

      if (onProgress) onProgress(80, 'Finalizing document...');
      
      const pdfResult = await exportTransactionsToPDF(filteredTransactions, filterInfo, filename);

      if (onProgress) onProgress(100, 'Export completed!');

      return {
        success: pdfResult.success,
        filename: filename,
        error: pdfResult.error,
        summary: {
          totalTransactions: filteredTransactions.length,
          exportDate: new Date().toISOString(),
          filterApplied: filterInfo
        }
      };

    } catch (error) {
      console.error('Export Service - Local Export Error:', error);
      
      if (onProgress) onProgress(0, 'Export failed');
      
      return {
        success: false,
        error: error.message || 'Failed to export with local data'
      };
      
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Check if export is currently in progress
   * @returns {boolean} Export status
   */
  isExportInProgress() {
    return this.isExporting;
  }
}

// Create singleton instance
const exportService = new ExportService();

// Export convenience functions
export async function exportTransactionsFromBackend(filters, onProgress, userInfo) {
  return await exportService.exportTransactions(filters, onProgress, userInfo);
}

export async function exportTransactionsFromLocal(transactions, filters, onProgress) {
  return await exportService.exportWithLocalData(transactions, filters, onProgress);
}

export function isExportInProgress() {
  return exportService.isExportInProgress();
}

export default exportService;
