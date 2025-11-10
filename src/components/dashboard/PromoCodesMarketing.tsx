import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
  BarChart3,
  Tag,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Download,
  Sparkles,
  Pause,
  Play,
  Eye
} from 'lucide-react';
import { PromoCodeService, type PromoCode } from '../../services/promoCodeService';
import type { Organizer } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

interface PromoCodesMarketingProps {
  organizer: Organizer | null;
}

const PromoCodesMarketing: React.FC<PromoCodesMarketingProps> = ({ organizer }) => {
  const { currencySymbol, colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<PromoCode | null>(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    usage_limit: undefined as number | undefined,
    max_uses_per_user: 1,
    minimum_purchase_amount: 0,
    expiry_date: '',
  });

  useEffect(() => {
    if (organizer) {
      loadData();
    }
  }, [organizer]);

  const loadData = async () => {
    if (!organizer) return;

    setIsLoading(true);
    try {
      // Load promo codes
      const codesResult = await PromoCodeService.getPromoCodesByOrganizer(organizer.id);
      if (codesResult.success) {
        setPromoCodes(codesResult.promoCodes || []);
      }

      // Load analytics
      const analyticsResult = await PromoCodeService.getPromoCodeAnalytics(organizer.id);
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.analytics);
      }
    } catch (error) {
      console.error('Error loading promo code data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!organizer) return;

    if (!formData.code || formData.discount_value <= 0 || !formData.expiry_date) {
      showMessage('error', 'Please fill all required fields');
      return;
    }

    try {
      const result = await PromoCodeService.createPromoCode(organizer.id, formData);

      if (result.success) {
        showMessage('success', 'Promo code created successfully');
        setShowCreateModal(false);
        resetForm();
        loadData();
      } else {
        showMessage('error', result.error || 'Failed to create promo code');
      }
    } catch (error) {
      showMessage('error', 'An error occurred');
    }
  };

  const handleToggleStatus = async (promoCode: PromoCode) => {
    const newStatus = promoCode.status === 'active' ? 'paused' : 'active';
    const result = await PromoCodeService.togglePromoCodeStatus(promoCode.id, newStatus);

    if (result.success) {
      showMessage('success', `Promo code ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadData();
    } else {
      showMessage('error', result.error || 'Failed to update status');
    }
  };

  const handleDeleteCode = async (promoCodeId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    const result = await PromoCodeService.deletePromoCode(promoCodeId);

    if (result.success) {
      showMessage('success', 'Promo code deleted successfully');
      loadData();
    } else {
      showMessage('error', result.error || 'Failed to delete promo code');
    }
  };

  const handleViewAnalytics = async (promoCode: PromoCode) => {
    setSelectedCode(promoCode);
    setShowAnalyticsModal(true);
    setDetailedAnalytics(null);

    const result = await PromoCodeService.getPromoCodeDetailedAnalytics(promoCode.id);
    if (result.success) {
      setDetailedAnalytics(result.analytics);
    }
  };

  const generateCode = () => {
    setFormData({ ...formData, code: PromoCodeService.generateRandomCode() });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      usage_limit: undefined,
      max_uses_per_user: 1,
      minimum_purchase_amount: 0,
      expiry_date: '',
    });
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = () => {
    PromoCodeService.exportPromoCodesCSV(promoCodes, 'promo_codes');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPromoCodes = promoCodes.filter((code) =>
    code.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes & Discounts</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional codes with detailed analytics</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Active Codes</span>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <Tag className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics?.active_codes || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            out of {analytics?.total_codes || 0} total codes
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Total Uses</span>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics?.total_uses || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics?.avg_discount_per_use ? `${currencySymbol}${analytics.avg_discount_per_use.toFixed(2)} avg discount` : 'No uses yet'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Total Discount Given</span>
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {currencySymbol}{(analytics?.total_discount_given || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">in total discounts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Revenue Generated</span>
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {currencySymbol}{(analytics?.total_revenue_generated || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics?.conversion_rate ? `${analytics.conversion_rate.toFixed(1)}% conversion` : '0% conversion'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search promo codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{ focusRing: colors.primary }}
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
            >
              <Plus className="h-4 w-4" />
              <span>Create Promo Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPromoCodes.length > 0 ? (
                filteredPromoCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {code.code}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(code.code);
                            showMessage('success', 'Code copied to clipboard');
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy code"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      {code.description && (
                        <p className="text-xs text-gray-500 mt-1">{code.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {code.discount_type === 'percentage'
                          ? `${code.discount_value}%`
                          : `${currencySymbol}${code.discount_value}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {code.usage_count}/{code.usage_limit || '∞'}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${code.usage_limit ? (code.usage_count / code.usage_limit) * 100 : 0}%`,
                            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{currencySymbol}{code.total_revenue_generated.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {currencySymbol}{code.total_discount_given.toFixed(2)} saved
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(code.expiry_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          code.status
                        )}`}
                      >
                        {code.status.charAt(0).toUpperCase() + code.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAnalytics(code)}
                          className="hover:text-blue-600"
                          style={{ color: colors.primary }}
                          title="View Analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(code)}
                          className="text-gray-600 hover:text-gray-900"
                          title={code.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {code.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Promo Codes Yet</h3>
                    <p className="text-gray-600 mb-4">Create your first promo code to start offering discounts</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center space-x-2 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create First Code</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowCreateModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Promo Code</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value.toUpperCase() })
                        }
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-20"
                        style={{ focusRing: colors.primary }}
                        placeholder="SUMMER2024"
                      />
                      <button
                        onClick={generateCode}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Generate random code"
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-20"
                      style={{ focusRing: colors.primary }}
                      placeholder="Summer sale discount"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Type *
                      </label>
                      <select
                        value={formData.discount_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_type: e.target.value as 'percentage' | 'fixed',
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-20"
                        style={{ focusRing: colors.primary }}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ({currencySymbol})</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        value={formData.discount_value || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, discount_value: parseFloat(e.target.value) })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-20"
                        style={{ focusRing: colors.primary }}
                        placeholder="20"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usage Limit
                      </label>
                      <input
                        type="number"
                        value={formData.usage_limit || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            usage_limit: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-20"
                        style={{ focusRing: colors.primary }}
                        placeholder="100 (leave empty for unlimited)"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-20"
                        style={{ focusRing: colors.primary }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleCreateCode}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                >
                  Create Code
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedCode && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAnalyticsModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Promo Code Analytics</h3>
                    <p className="text-sm text-gray-500 mt-1">Code: {selectedCode.code}</p>
                  </div>
                  <button
                    onClick={() => setShowAnalyticsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {!detailedAnalytics ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Uses</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {detailedAnalytics.total_uses}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Unique Users</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {detailedAnalytics.unique_users}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Discount</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {currencySymbol}{detailedAnalytics.total_discount_given.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {currencySymbol}{detailedAnalytics.total_revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Usage by Day */}
                    {detailedAnalytics.usage_by_day.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Usage Over Time</h4>
                        <div className="space-y-2">
                          {detailedAnalytics.usage_by_day.map((day: any) => (
                            <div key={day.date} className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600 w-24">
                                {new Date(day.date).toLocaleDateString()}
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${(day.count / Math.max(...detailedAnalytics.usage_by_day.map((d: any) => d.count))) * 100}%`,
                                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8">
                                {day.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Users */}
                    {detailedAnalytics.top_users.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Top Users</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                  Email
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                  Uses
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                  Revenue
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {detailedAnalytics.top_users.map((user: any, index: number) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{user.uses}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {currencySymbol}{user.revenue.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodesMarketing;
