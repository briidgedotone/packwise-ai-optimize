import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, User, Bell, Shield, 
  Palette, Globe, Database, Mail, Phone,
  Save, ArrowLeft, Check, X
} from 'lucide-react';
import { toast } from 'sonner';

export const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: user?.primaryPhoneNumber?.phoneNumber || '',
    company: user?.organizationMemberships?.[0]?.organization?.name || '',
    role: 'Packaging Manager'
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    analysisComplete: true,
    weeklyReport: false,
    systemUpdates: true,
    marketingEmails: false
  });

  // Theme settings state
  const [theme, setTheme] = useState('light');

  const settingSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ];

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Update user profile via Clerk
      await user?.update({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    // In a real app, this would save to your backend
    toast.success('Notification preferences saved');
  };

  const renderProfileSection = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Information</h2>
        <p className="text-sm text-gray-500">Update your personal information and contact details.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
          <Input
            id="firstName"
            value={profileData.firstName}
            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
            className="mt-2"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
          <Input
            id="lastName"
            value={profileData.lastName}
            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
            className="mt-2"
            placeholder="Enter your last name"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-2"
            placeholder="Enter your email"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Email changes must be done through your account security settings</p>
        </div>
        <div>
          <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-2"
            placeholder="Enter your phone number"
          />
        </div>
        <div>
          <Label htmlFor="company" className="text-gray-700 font-medium">Company</Label>
          <Input
            id="company"
            value={profileData.company}
            onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
            className="mt-2"
            placeholder="Enter your company name"
          />
        </div>
        <div>
          <Label htmlFor="role" className="text-gray-700 font-medium">Role</Label>
          <Input
            id="role"
            value={profileData.role}
            onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
            className="mt-2"
            placeholder="Enter your role"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="hover:opacity-90 text-white rounded-full"
          style={{ backgroundColor: designSystem.colors.primary }}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-sm text-gray-500">Manage how you receive notifications about your account and analyses.</p>
      </div>

      <div className="space-y-3">
        {[
          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
          { key: 'analysisComplete', label: 'Analysis Complete', description: 'Get notified when analyses finish' },
          { key: 'weeklyReport', label: 'Weekly Reports', description: 'Receive weekly usage summaries' },
          { key: 'systemUpdates', label: 'System Updates', description: 'Get notified about new features and updates' },
          { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive tips and product updates' }
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-3xl">
            <div>
              <h4 className="font-medium text-gray-900">{setting.label}</h4>
              <p className="text-sm text-gray-500">{setting.description}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, [setting.key]: !prev[setting.key as keyof typeof prev] }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              style={{
                backgroundColor: notifications[setting.key as keyof typeof notifications] ? designSystem.colors.primary : '#D1D5DB'
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications[setting.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleSaveNotifications}
          className="hover:opacity-90 text-white rounded-full"
          style={{ backgroundColor: designSystem.colors.primary }}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Security Settings</h2>
        <p className="text-sm text-gray-500">Manage your account security and authentication.</p>
      </div>

      <div className="space-y-3">
        <div className="p-3 border rounded-3xl" style={{ backgroundColor: designSystem.colors.primaryLight, borderColor: designSystem.colors.primary }}>
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-5 w-5" style={{ color: designSystem.colors.primary }} />
            <h4 className="font-medium text-gray-900">Account Security</h4>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Your account security is managed through Clerk. You can update your password, enable two-factor authentication, and manage connected accounts.
          </p>
          <Button 
            variant="outline" 
            className="rounded-full hover:opacity-90"
            style={{ borderColor: designSystem.colors.primary, color: designSystem.colors.primary }}
            onClick={() => window.open('https://clerk.com/docs/authentication/security', '_blank')}
          >
            Manage Security Settings
          </Button>
        </div>

        <div className="p-3 bg-gray-50 rounded-3xl">
          <h4 className="font-medium text-gray-900 mb-2">Active Sessions</h4>
          <p className="text-sm text-gray-600 mb-3">You are currently signed in on this device.</p>
          <Button 
            variant="outline" 
            onClick={() => signOut()}
            className="text-red-600 border-red-300 hover:bg-red-50 rounded-full"
          >
            Sign Out All Sessions
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Preferences</h2>
        <p className="text-sm text-gray-500">Customize your experience with QuantiPackAI.</p>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-3xl">
          <h4 className="font-medium text-gray-900 mb-3">Theme</h4>
          <div className="grid grid-cols-2 gap-3">
            {['light', 'dark'].map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => setTheme(themeOption)}
                className={`p-3 rounded-3xl border-2 transition-colors capitalize ${
                  theme === themeOption 
                    ? 'text-gray-900' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={theme === themeOption ? {
                  borderColor: designSystem.colors.primary,
                  backgroundColor: designSystem.colors.primaryLight
                } : {}}
              >
                {themeOption === theme && <Check className="h-4 w-4 float-right" style={{ color: designSystem.colors.primary }} />}
                {themeOption} Theme
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-3xl">
          <h4 className="font-medium text-gray-900 mb-2">Language & Region</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-gray-700">Language</Label>
              <select className="w-full mt-1 p-2 border border-gray-300 rounded-3xl">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-700">Time Zone</Label>
              <select className="w-full mt-1 p-2 border border-gray-300 rounded-3xl">
                <option>Pacific Time (PT)</option>
                <option>Mountain Time (MT)</option>
                <option>Central Time (CT)</option>
                <option>Eastern Time (ET)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Data & Privacy</h2>
        <p className="text-sm text-gray-500">Manage your data and privacy settings.</p>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-3xl">
          <h4 className="font-medium text-gray-900 mb-3">Data Export</h4>
          <p className="text-sm text-gray-600 mb-3">Download all your data including analyses, uploads, and settings.</p>
          <Button variant="outline" className="rounded-full">
            Download My Data
          </Button>
        </div>

        <div className="p-3 bg-red-50 border border-red-200 rounded-3xl">
          <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
          <p className="text-sm text-red-700 mb-3">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 rounded-full">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'notifications': return renderNotificationsSection();
      case 'security': return renderSecuritySection();
      case 'preferences': return renderPreferencesSection();
      case 'data': return renderDataSection();
      default: return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFC' }}>
      <div>
        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-3xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account preferences and application settings
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-200 p-3">
              <nav className="space-y-1">
                {settingSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-3xl transition-colors ${
                        activeSection === section.id
                          ? 'text-gray-900 border'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={activeSection === section.id ? {
                        backgroundColor: designSystem.colors.primaryLight,
                        borderColor: designSystem.colors.primary
                      } : {}}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-200 p-4">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;