import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit, 
  Trash2, 
  Share2,
  BarChart3,
  Tag,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import type { Organizer } from '../../lib/supabase';

interface MarketingProps {
  organizer: Organizer | null;
}

const Marketing: React.FC<MarketingProps> = ({ organizer }) => {
  const [activeTab, setActiveTab] = useState('promo-codes');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock promo codes data
  const promoCodes = [
    {
      id: 1,
      code: 'EARLY2024',
      discount: 20,
      type: 'percentage',
      usageLimit: 100,
      usageCount: 45,
      expiryDate: '2024-03-31',
      status: 'active',
      events: ['AI Conference 2024', 'Design Workshop']
    },
    {
      id: 2,
      code: 'VIP50',
      discount: 50,
      type: 'fixed',
      usageLimit: 50,
      usageCount: 23,
      expiryDate: '2024-04-15',
      status: 'active',
      events: ['AI Conference 2024']
    },
    {
      id: 3,
      code: 'STUDENT15',
      discount: 15,
      type: 'percentage',
      usageLimit: 200,
      usageCount: 89,
      expiryDate: '2024-05-01',
      status: 'active',
      events: ['All Events']
    },
    {
      id: 4,
      code: 'EXPIRED10',
      discount: 10,
      type: 'percentage',
      usageLimit: 100,
      usageCount: 67,
      expiryDate: '2024-02-28',
      status: 'expired',
      events: ['Tech Summit']
    }
  ];

  // Mock social sharing data
  const socialSharing = [
    {
      platform: 'Facebook',
      shares: 234,
      clicks: 1456,
      conversions: 89,
      color: 'bg-blue-500'
    },
    {
      platform: 'Twitter',
      shares: 156,
      clicks: 892,
      conversions: 45,
      color: 'bg-sky-500'
    },
    {
      platform: 'LinkedIn',
      shares: 89,
      clicks: 567,
      conversions: 34,
      color: 'bg-blue-700'
    },
    {
      platform: 'Instagram',
      shares: 345,
      clicks: 2134,
      conversions: 123,
      color: 'bg-pink-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPromoCodes = promoCodes.filter(code =>
    code.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-600 mt-1">Manage promo codes and track marketing performance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('promo-codes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'promo-codes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Promo Codes
            </button>
            <button
              onClick={() => setActiveTab('social-sharing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'social-sharing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Social Sharing
            </button>
            <button
              onClick={() => setActiveTab('email-campaigns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'email-campaigns'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Email Campaigns
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'promo-codes' && (
            <div className="space-y-6">
              {/* Promo Code Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Active Codes</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {promoCodes.filter(c => c.status === 'active').length}
                      </p>
                    </div>
                    <Tag className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Uses</p>
                      <p className="text-2xl font-bold text-green-900">
                        {promoCodes.reduce((sum, code) => sum + code.usageCount, 0)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Discount Given</p>
                      <p className="text-2xl font-bold text-purple-900">$2,340</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-orange-900">12.5%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Search and Create */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search promo codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Promo Code</span>
                </button>
              </div>

              {/* Promo Codes Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPromoCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {code.code}
                            </div>
                            <button
                              onClick={() => navigator.clipboard.writeText(code.code)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy code"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {code.type === 'percentage' ? `${code.discount}%` : `$${code.discount}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {code.usageCount}/{code.usageLimit}
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-primary-500 h-1 rounded-full" 
                              style={{ width: `${(code.usageCount / code.usageLimit) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(code.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(code.status)}`}>
                            {code.status.charAt(0).toUpperCase() + code.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-primary-600 hover:text-primary-900">
                              <BarChart3 className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'social-sharing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {socialSharing.map((platform) => (
                  <div key={platform.platform} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{platform.platform}</h3>
                      <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Shares</span>
                        <span className="text-sm font-medium">{platform.shares}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Clicks</span>
                        <span className="text-sm font-medium">{platform.clicks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversions</span>
                        <span className="text-sm font-medium">{platform.conversions}</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      <Share2 className="h-4 w-4" />
                      <span>Generate Link</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Share2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media Tools</h3>
                <p className="text-gray-600 mb-4">
                  Generate custom sharing links and track social media performance for your events.
                </p>
                <button className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                  Create Sharing Campaign
                </button>
              </div>
            </div>
          )}

          {activeTab === 'email-campaigns' && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                📧
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Campaigns</h3>
              <p className="text-gray-600 mb-4">
                Email campaign functionality coming soon. Create and manage email marketing campaigns for your events.
              </p>
              <button className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                Coming Soon
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Promo Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Promo Code</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Enter promo code"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                      <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Create Code
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;