import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiCalendar, FiFilter, FiFileText, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { exportTransactionsFromBackend, exportTransactionsFromLocal } from '../utils/exportService';
import { ExportFilters } from '../utils/pdfExport';
import { ExportStatusIndicator, LoadingOverlay } from './LoadingSpinner';
import { apiFetch } from '../utils/api';

export default function ExportModal({ isOpen, onClose, transactions = [], onExportComplete }) {
  const [exportType, setExportType] = useState('all-time'); // all-time, date-range, monthly
  const [transactionType, setTransactionType] = useState('all'); // all, income, expense
  const [exportFormat, setExportFormat] = useState('pdf'); // pdf (future: csv, excel)
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const [exportStatus, setExportStatus] = useState('idle'); // idle, loading, success, error
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Date range states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Monthly states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Error and success states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user data when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiFetch('/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            const profile = data.profile;
            setUserInfo({
              name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username,
              email: profile.email,
              mobile: profile.phone && profile.countryCode ? `${profile.countryCode} ${profile.phone}` : profile.phone
            });
          }
        }
      } catch (error) {
        console.warn('Failed to fetch user data for PDF export:', error);
        // Don't show error to user, just proceed without user info
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setExportProgress(0);
      setExportMessage('');
      setExportStatus('idle');
      setShowLoadingOverlay(false);
      setIsExporting(false);
      
      // Set default date range to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
    } else {
      // Reset export state when modal closes
      setIsExporting(false);
      setExportProgress(0);
      setExportMessage('');
      setExportStatus('idle');
      setShowLoadingOverlay(false);
    }
  }, [isOpen]);

  // Generate years for dropdown (current year ± 5 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Validate form inputs
  const validateInputs = () => {
    setError('');
    
    if (exportType === 'date-range') {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates.');
        return false;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setError('Start date must be before end date.');
        return false;
      }
    }
    
    if (transactions.length === 0) {
      setError('No transactions available to export.');
      return false;
    }
    
    return true;
  };

  // Filter transactions based on selected criteria
  const getFilteredTransactions = () => {
    let filtered = [];
    
    switch (exportType) {
      case 'all-time':
        filtered = ExportFilters.filterAllTime(transactions, transactionType);
        break;
      case 'date-range':
        filtered = ExportFilters.filterByDateRange(transactions, startDate, endDate, transactionType);
        break;
      case 'monthly':
        filtered = ExportFilters.filterByMonth(transactions, selectedMonth, selectedYear, transactionType);
        break;
      default:
        filtered = transactions;
    }
    
    return filtered;
  };

  // Generate filter info for PDF
  const getFilterInfo = () => {
    const info = {
      type: transactionType,
      period: ''
    };
    
    switch (exportType) {
      case 'all-time':
        info.period = 'All Time';
        break;
      case 'date-range':
        info.period = `${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}`;
        info.dateRange = info.period;
        break;
      case 'monthly':
        info.period = `${monthNames[selectedMonth]} ${selectedYear}`;
        break;
    }
    
    return info;
  };

  // Handle export with enhanced backend integration
  const handleExport = async () => {
    if (!validateInputs()) return;
    
    // Initialize loading state
    setIsExporting(true);
    setExportProgress(0);
    setError('');
    setSuccess('');
    setExportStatus('loading');
    setExportMessage('Preparing export...');
    
    // Show loading overlay for large datasets
    if (transactions.length > 100) {
      setShowLoadingOverlay(true);
    }
    
    try {
      // Prepare filter parameters for backend
      const filters = {
        exportType,
        transactionType,
        startDate: exportType === 'date-range' ? startDate : null,
        endDate: exportType === 'date-range' ? endDate : null,
        month: exportType === 'monthly' ? selectedMonth : null,
        year: exportType === 'monthly' ? selectedYear : null,
        category: 'all' // Can be extended for category filtering
      };

      // Progress callback function
      const onProgress = (progress, message) => {
        setExportProgress(progress);
        setExportMessage(message || 'Processing...');
      };

      // Try backend export first, fallback to local if needed
      let result;
      try {
        result = await exportTransactionsFromBackend(filters, onProgress, userInfo);
      } catch (backendError) {
        console.warn('Backend export failed, falling back to local export:', backendError);
        
        // Fallback to local export
        setExportProgress(25);
        result = await exportTransactionsFromLocal(transactions, filters, onProgress);
      }
      
      if (result.success) {
        // Success state
        setExportStatus('success');
        setExportMessage('Export completed successfully!');
        setSuccess(`Successfully exported ${result.summary?.totalTransactions || 0} transactions to ${result.filename}`);
        
        // Call the completion callback if provided
        if (onExportComplete) {
          onExportComplete({
            success: true,
            summary: result.summary || { totalTransactions: 0 },
            filename: result.filename
          });
        }
        
        // Auto-close after success
        setTimeout(() => {
          setShowLoadingOverlay(false);
          onClose();
        }, 2000);
      } else {
        // Error state
        setExportStatus('error');
        setExportMessage('Export failed');
        setError(result.error || 'Export failed. Please try again.');
        
        // Call the completion callback with error if provided
        if (onExportComplete) {
          onExportComplete({
            success: false,
            error: result.error || 'Export failed. Please try again.'
          });
        }
      }
      
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setExportMessage('Unexpected error occurred');
      setError('An unexpected error occurred during export.');
      
      if (onExportComplete) {
        onExportComplete({
          success: false,
          error: 'An unexpected error occurred during export.'
        });
      }
    } finally {
      setIsExporting(false);
      setShowLoadingOverlay(false);
      
      // Reset progress after a delay
      setTimeout(() => {
        setExportProgress(0);
        if (exportStatus !== 'success') {
          setExportStatus('idle');
        }
      }, 1000);
    }
  };

  // Get export summary
  const getExportSummary = () => {
    const filtered = getFilteredTransactions();
    const summary = {
      total: filtered.length,
      income: filtered.filter(t => t.type === 'income').length,
      expense: filtered.filter(t => t.type === 'expense').length
    };
    return summary;
  };

  if (!isOpen) return null;

  const summary = getExportSummary();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiDownload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Export Transactions</h2>
                <p className="text-sm text-gray-600">Download your financial data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isExporting}
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(85vh-160px)]">
            {/* Export Status Indicator */}
            <ExportStatusIndicator
              status={exportStatus}
              message={exportMessage}
              progress={exportProgress}
              onRetry={() => handleExport()}
              onClose={() => {
                setExportStatus('idle');
                setError('');
                setSuccess('');
              }}
            />

            {/* Export Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FiCalendar className="inline w-4 h-4 mr-2" />
                Time Period
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'all-time', label: 'All Time', desc: 'Complete history' },
                  { value: 'date-range', label: 'Date Range', desc: 'Custom period' },
                  { value: 'monthly', label: 'Monthly', desc: 'Specific month' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExportType(option.value)}
                    disabled={isExporting}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      exportType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Inputs */}
            {exportType === 'date-range' && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={isExporting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={isExporting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Selection */}
            {exportType === 'monthly' && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      disabled={isExporting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      disabled={isExporting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    >
                      {generateYears().map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FiFilter className="inline w-4 h-4 mr-2" />
                Transaction Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'all', label: 'All Transactions', color: 'blue' },
                  { value: 'income', label: 'Income Only', color: 'green' },
                  { value: 'expense', label: 'Expenses Only', color: 'red' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTransactionType(option.value)}
                    disabled={isExporting}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      transactionType === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FiFileText className="inline w-4 h-4 mr-2" />
                Export Format
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setExportFormat('pdf')}
                  disabled={isExporting}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    exportFormat === 'pdf'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">PDF Document</div>
                      <div className="text-xs text-gray-500 mt-1">Professional formatted report</div>
                    </div>
                    <div className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Recommended</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Export Summary */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Export Summary</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-base font-bold text-blue-600">{summary.total}</div>
                  <div className="text-blue-700 text-xs">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-green-600">{summary.income}</div>
                  <div className="text-green-700 text-xs">Income</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-red-600">{summary.expense}</div>
                  <div className="text-red-700 text-xs">Expenses</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isExporting && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {exportMessage || 'Exporting...'}
                  </span>
                  <span className="text-sm text-gray-500">{exportProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${exportProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {exportMessage && (
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {exportMessage}
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || summary.total === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Loading Overlay for Large Datasets */}
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        message={exportMessage || 'Processing your export...'}
        progress={exportProgress}
        showProgress={true}
        onCancel={() => {
          setShowLoadingOverlay(false);
          setIsExporting(false);
          setExportStatus('idle');
        }}
      />
    </AnimatePresence>
  );
}
