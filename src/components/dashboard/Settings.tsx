import React, { useState } from 'react';
import { 
  User, 
  Building, 
  CreditCard, 
  Shield, 
  Bell, 
  Palette,
  Save,
  Upload,
  Eye,
  EyeOff,
  Camera,
  Trash2
} from 'lucide-react';
import ImageCropper from './ImageCropper';
import { OrganizerService } from '../../services/organizerService';
import { StorageService } from '../../services/storageService';
import type { Organizer } from '../../lib/supabase';

interface SettingsProps {
  organizer: Organizer | null;
}

const Settings: React.FC<SettingsProps> = ({ organizer }) => {
  const [activeTab, setActiveTab] = useState('branding'); // Changed default to branding to match your screenshot
  const [showPassword, setShowPassword] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [profileData, setProfileData] = useState({
    firstName: organizer?.first_name || '',
    lastName: organizer?.last_name || '',
    email: organizer?.email || '',
    phone: organizer?.phone || '',
    location: organizer?.location || '',
    organizationName: organizer?.organization_name || '',
    eventTypes: organizer?.event_types || [],
    bio: organizer?.bio || '',
    avatarUrl: organizer?.avatar_url || ''
  });

  const [brandingData, setBrandingData] = useState({
    logo: null as File | null,
    primaryColor: '#001B79',
    secondaryColor: '#9336B4',
    customDomain: '',
    eventPageTemplate: 'modern'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newRegistrations: true,
    paymentUpdates: true,
    eventReminders: true,
    marketingEmails: false
  });

  const eventTypeOptions = [
    'Corporate Events',
    'Conferences & Seminars',
    'Workshops & Training',
    'Networking Events',
    'Product Launches',
    'Trade Shows',
    'Social Events',
    'Fundraising Events'
  ];

  const handleProfileChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear status when user makes changes
    if (updateStatus.type) {
      setUpdateStatus({ type: null, message: '' });
    }
  };

  const handleEventTypeToggle = (eventType: string) => {
    setProfileData(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter(type => type !== eventType)
        : [...prev.eventTypes, eventType]
    }));
  };

  const handleSaveProfile = () => {
    // Handle profile save
    console.log('Saving profile:', profileData);
    saveProfileData();
  };

  const saveProfileData = async () => {
    if (!organizer) return;

    setIsUpdatingProfile(true);
    setUpdateStatus({ type: null, message: '' });

    try {
      const updates = {
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
        phone: profileData.phone.trim() || null,
        location: profileData.location.trim() || null,
        organization_name: profileData.organizationName.trim(),
        event_types: profileData.eventTypes,
        bio: profileData.bio.trim() || null,
        avatar_url: profileData.avatarUrl || null
      };

      const result = await OrganizerService.updateOrganizerProfile(organizer.id, updates);

      if (result.success) {
        setUpdateStatus({
          type: 'success',
          message: 'Profile updated successfully!'
        });
        
        // Update the organizer prop would require parent component refresh
        // For now, we'll just show success message
        setTimeout(() => {
          window.location.reload(); // Refresh to show updated data
        }, 1500);
      } else {
        setUpdateStatus({
          type: 'error',
          message: result.error || 'Failed to update profile'
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setUpdateStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarCropped = (croppedImageUrl: string) => {
    setProfileData(prev => ({ ...prev, avatarUrl: croppedImageUrl }));
    setShowImageCropper(false);
  };

  const handleRemoveAvatar = () => {
    setProfileData(prev => ({ ...prev, avatarUrl: '' }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBrandingData(prev => ({ ...prev, logo: file }));
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Status Messages */}
              {updateStatus.type && (
                <div className={`p-4 rounded-xl border ${
                  updateStatus.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    {updateStatus.type === 'success' ? (
                      <Save className="w-5 h-5 text-green-500" />
                    ) : (
                      <User className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">{updateStatus.message}</span>
                  </div>
                </div>
              )}

              {/* Avatar Upload Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture / Organization Logo</h3>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                      {profileData.avatarUrl ? (
                        <img 
                          src={profileData.avatarUrl} 
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            e.currentTarget.style.display = 'none';
                            const fallbackText = (profileData.organizationName || profileData.firstName || 'O').charAt(0).toUpperCase();
                            e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold text-white">${fallbackText}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {(profileData.organizationName || profileData.firstName || 'O').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {profileData.avatarUrl && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove avatar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => setShowImageCropper(true)}
                      className="inline-flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      <span>{profileData.avatarUrl ? 'Change Avatar' : 'Upload Avatar'}</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload your organization logo or personal photo. Recommended size: 200x200px
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                    <input
                      type="text"
                      value={profileData.organizationName}
                      onChange={(e) => handleProfileChange('organizationName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="City, State/Country"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {eventTypeOptions.map((eventType) => (
                    <label
                      key={eventType}
                      className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        profileData.eventTypes.includes(eventType)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={profileData.eventTypes.includes(eventType)}
                        onChange={() => handleEventTypeToggle(eventType)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-gray-700">{eventType}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Customization</h3>
                <p className="text-gray-600 mb-6">Customize your organization's branding and appearance across all event pages.</p>
                
                <div className="space-y-8">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Organization Logo</label>
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                        {brandingData.logo ? (
                          <img 
                            src={URL.createObjectURL(brandingData.logo)} 
                            alt="Logo preview" 
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="inline-flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Logo</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB. Recommended size: 200x200px</p>
                      </div>
                    </div>
                  </div>

                  {/* Color Scheme */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Brand Colors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Primary Color</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={brandingData.primaryColor}
                            onChange={(e) => setBrandingData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={brandingData.primaryColor}
                            onChange={(e) => setBrandingData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-sm"
                            placeholder="#001B79"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Secondary Color</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={brandingData.secondaryColor}
                            onChange={(e) => setBrandingData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={brandingData.secondaryColor}
                            onChange={(e) => setBrandingData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-sm"
                            placeholder="#9336B4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Color Preview</h4>
                    <div className="flex space-x-4">
                      <div 
                        className="w-20 h-20 rounded-lg shadow-sm border border-gray-200"
                        style={{ backgroundColor: brandingData.primaryColor }}
                      ></div>
                      <div 
                        className="w-20 h-20 rounded-lg shadow-sm border border-gray-200"
                        style={{ backgroundColor: brandingData.secondaryColor }}
                      ></div>
                      <div 
                        className="w-20 h-20 rounded-lg shadow-sm border border-gray-200"
                        style={{ 
                          background: `linear-gradient(135deg, ${brandingData.primaryColor} 0%, ${brandingData.secondaryColor} 100%)`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Custom Domain */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Custom Domain</label>
                    <input
                      type="text"
                      value={brandingData.customDomain}
                      onChange={(e) => setBrandingData(prev => ({ ...prev, customDomain: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="events.yourcompany.com"
                    />
                    <p className="text-sm text-gray-500 mt-2">Connect your own domain for event pages (Pro feature)</p>
                  </div>

                  {/* Event Page Template */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Event Page Template</label>
                    <select
                      value={brandingData.eventPageTemplate}
                      onChange={(e) => setBrandingData(prev => ({ ...prev, eventPageTemplate: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                      <option value="corporate">Corporate</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-2">Choose the layout style for your event pages</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                  <Save className="h-4 w-4" />
                  <span>Save Branding</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium text-blue-900">Connect Stripe Account</h4>
                      <p className="text-sm text-blue-700">Connect your Stripe account to accept payments for your events.</p>
                    </div>
                  </div>
                  <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                    Connect Stripe
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Processing Fee</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="absorb">Absorb fees (recommended)</option>
                      <option value="pass">Pass fees to attendees</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Choose who pays the payment processing fees</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payout Schedule</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {key === 'emailNotifications' && 'Receive notifications via email'}
                          {key === 'smsNotifications' && 'Receive notifications via SMS'}
                          {key === 'newRegistrations' && 'Get notified when someone registers for your events'}
                          {key === 'paymentUpdates' && 'Receive updates about payments and refunds'}
                          {key === 'eventReminders' && 'Get reminders about upcoming events'}
                          {key === 'marketingEmails' && 'Receive marketing emails and product updates'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                
                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Change Password</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <button className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Two-Factor Authentication</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Authenticator App</h5>
                          <p className="text-sm text-gray-600">Use an authenticator app to generate verification codes</p>
                        </div>
                        <button className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account Deletion */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Danger Zone</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-red-900">Delete Account</h5>
                          <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                        </div>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Image Cropper Modal */}
      {showImageCropper && organizer && (
        <ImageCropper
          onImageCropped={handleAvatarCropped}
          onClose={() => setShowImageCropper(false)}
          aspectRatio={1} // Square aspect ratio for avatars
          organizerId={organizer.id}
        />
      )}
    </div>
  );
};

export default Settings;