import React from 'react';
import { 
  generateAuthUrl, 
  generateDashboardUrl, 
  generateTransactionUrl, 
  generateShareableUrl 
} from '../utils/urlManager';

// This component demonstrates the new URL structure
export default function UrlExamples() {
  const exampleUrls = {
    // Authentication URLs
    auth: {
      login: generateAuthUrl('login', { 
        source: 'navbar', 
        campaign: 'header_cta',
        medium: 'web'
      }),
      loginWithEmail: generateAuthUrl('login', { 
        email: 'user@example.com',
        source: 'forgot_password_flow',
        redirect_to: '/dashboard/analytics'
      }),
      register: generateAuthUrl('register', { 
        source: 'hero_cta', 
        campaign: 'primary_signup',
        medium: 'web',
        plan: 'free',
        referral: 'friend123'
      }),
      forgotPassword: generateAuthUrl('forgot-password', { 
        source: 'login_form',
        email: 'user@example.com'
      }),
      verifyOtp: generateAuthUrl('verify-otp', { 
        email: 'user@example.com',
        token: 'abc123',
        source: 'email_link'
      }),
      resetPassword: generateAuthUrl('reset-password', { 
        reset_token: 'xyz789',
        email: 'user@example.com',
        source: 'email_verification'
      })
    },

    // Dashboard URLs
    dashboard: {
      overview: generateDashboardUrl('overview', {
        source: 'navbar',
        time_range: '30d',
        view: 'cards'
      }),
      overviewFiltered: generateDashboardUrl('overview', {
        source: 'login_success',
        time_range: '7d',
        category: 'Food',
        filter: 'expenses_only',
        view: 'detailed'
      }),
      analytics: generateDashboardUrl('analytics', {
        source: 'dashboard_nav',
        time_range: '90d',
        view: 'charts',
        category: 'all',
        sort: 'amount_desc'
      })
    },

    // Transaction URLs
    transactions: {
      manage: generateTransactionUrl('manage', {
        source: 'dashboard_cta',
        view_mode: 'table',
        sort_by: 'date',
        order: 'desc',
        page: '1',
        per_page: '20'
      }),
      manageFiltered: generateTransactionUrl('manage', {
        transaction_type: 'expense',
        category: 'Food',
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        amount_min: '100',
        amount_max: '5000',
        search: 'restaurant',
        sort_by: 'amount',
        order: 'desc',
        page: '2',
        per_page: '50',
        view_mode: 'cards'
      }),
      history: generateTransactionUrl('history', {
        source: 'transaction_nav',
        time_range: '1y',
        category: 'all',
        export_format: 'csv',
        view_mode: 'timeline'
      }),
      analytics: generateTransactionUrl('analytics', {
        source: 'section_nav',
        transaction_type: 'income',
        category: 'Salary',
        date_from: '2024-01-01',
        view_mode: 'charts',
        chart_type: 'pie'
      })
    },

    // Shareable URLs
    shareable: {
      dashboardShare: generateShareableUrl('/dashboard/overview', {
        time_range: '30d',
        category: 'Food',
        view: 'summary'
      }, {
        shared: true,
        shareId: 'abc123def456',
        timestamp: true
      }),
      transactionShare: generateShareableUrl('/finance/transactions/analytics', {
        transaction_type: 'expense',
        category: 'Travel',
        date_from: '2024-01-01',
        date_to: '2024-12-31'
      }, {
        shared: true,
        shareId: 'xyz789uvw012'
      })
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Smart Finance URL Examples</h2>
      
      {/* Authentication URLs */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">🔐 Authentication URLs</h3>
        <div className="space-y-3">
          <UrlExample 
            title="Login (from navbar)" 
            url={exampleUrls.auth.login}
            description="Basic login with source tracking"
          />
          <UrlExample 
            title="Login (with pre-filled email)" 
            url={exampleUrls.auth.loginWithEmail}
            description="Login with email pre-filled and redirect destination"
          />
          <UrlExample 
            title="Register (hero CTA)" 
            url={exampleUrls.auth.register}
            description="Registration with campaign tracking and referral code"
          />
          <UrlExample 
            title="Forgot Password" 
            url={exampleUrls.auth.forgotPassword}
            description="Password reset with email parameter"
          />
          <UrlExample 
            title="Verify OTP" 
            url={exampleUrls.auth.verifyOtp}
            description="OTP verification with email and token"
          />
          <UrlExample 
            title="Reset Password" 
            url={exampleUrls.auth.resetPassword}
            description="Password reset with secure token"
          />
        </div>
      </section>

      {/* Dashboard URLs */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-green-600">📊 Dashboard URLs</h3>
        <div className="space-y-3">
          <UrlExample 
            title="Dashboard Overview" 
            url={exampleUrls.dashboard.overview}
            description="Basic dashboard with time range and view mode"
          />
          <UrlExample 
            title="Filtered Overview" 
            url={exampleUrls.dashboard.overviewFiltered}
            description="Dashboard with category filter and detailed view"
          />
          <UrlExample 
            title="Analytics Dashboard" 
            url={exampleUrls.dashboard.analytics}
            description="Analytics view with sorting and time range"
          />
        </div>
      </section>

      {/* Transaction URLs */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-purple-600">💰 Transaction URLs</h3>
        <div className="space-y-3">
          <UrlExample 
            title="Manage Transactions" 
            url={exampleUrls.transactions.manage}
            description="Basic transaction management with pagination"
          />
          <UrlExample 
            title="Filtered Transactions" 
            url={exampleUrls.transactions.manageFiltered}
            description="Comprehensive filtering with search, date range, and amount filters"
          />
          <UrlExample 
            title="Transaction History" 
            url={exampleUrls.transactions.history}
            description="Historical view with export options"
          />
          <UrlExample 
            title="Transaction Analytics" 
            url={exampleUrls.transactions.analytics}
            description="Analytics view with chart type specification"
          />
        </div>
      </section>

      {/* Shareable URLs */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-orange-600">🔗 Shareable URLs</h3>
        <div className="space-y-3">
          <UrlExample 
            title="Shared Dashboard" 
            url={exampleUrls.shareable.dashboardShare}
            description="Shareable dashboard link with unique ID and timestamp"
          />
          <UrlExample 
            title="Shared Transaction Report" 
            url={exampleUrls.shareable.transactionShare}
            description="Shareable transaction analytics with share tracking"
          />
        </div>
      </section>

      {/* URL Benefits */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">✨ URL Benefits</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>SEO Friendly:</strong> Descriptive paths improve search engine visibility</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>Analytics Tracking:</strong> Source, campaign, and medium parameters for detailed analytics</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>State Preservation:</strong> Filters and view states are preserved in URLs</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>Shareable:</strong> Users can share specific views and filtered states</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>Bookmarkable:</strong> Users can bookmark specific filtered views</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>Professional:</strong> Long, descriptive URLs look more professional</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

// Helper component to display URL examples
function UrlExample({ title, url, description }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">{title}</h4>
        <button 
          onClick={copyToClipboard}
          className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
        >
          Copy
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <div className="bg-white p-2 rounded border font-mono text-xs break-all text-blue-700">
        {url}
      </div>
    </div>
  );
}
