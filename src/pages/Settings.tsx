import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings as SettingsIcon, User, CreditCard,
  Save, Mail, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

export const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Get current user data from Convex
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateUserProfile = useMutation(api.users.updateUserProfile);

  // Read tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'subscription', 'support'].includes(tabParam)) {
      setActiveSection(tabParam);
    }
  }, [searchParams]);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: currentUser?.phone || '',
    company: currentUser?.company || '',
    role: currentUser?.customRole || 'Packaging Manager'
  });

  // Update profile data when user or currentUser changes
  useEffect(() => {
    if (user || currentUser) {
      setProfileData({
        // Prefer Convex values, fallback to Clerk values
        firstName: currentUser?.firstName || user?.firstName || '',
        lastName: currentUser?.lastName || user?.lastName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        phone: currentUser?.phone || '',
        company: currentUser?.company || '',
        role: currentUser?.customRole || 'Packaging Manager'
      });
    }
  }, [user, currentUser]);

  // Real subscription data from Convex
  const getCurrentSubscription = useAction(api.billing.getCurrentSubscriptionDetails);
  const createBillingPortal = useAction(api.stripe.createBillingPortalSession);

  // Current subscription state
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [loadingBillingPortal, setLoadingBillingPortal] = useState(false);

  // Load current subscription details on component mount
  React.useEffect(() => {
    const loadSubscriptionDetails = async () => {
      if (user?.id) {
        setLoadingSubscription(true);
        try {
          const subscription = await getCurrentSubscription();
          setCurrentSubscription(subscription);
        } catch (error) {
          console.error('Failed to load subscription details:', error);
        } finally {
          setLoadingSubscription(false);
        }
      }
    };

    loadSubscriptionDetails();
  }, [user?.id, getCurrentSubscription]);

  // Handle manage subscription
  const handleManageSubscription = async () => {
    if (!currentSubscription?.stripeCustomerId) {
      toast.error('Unable to access billing portal. Please contact support.');
      return;
    }

    setLoadingBillingPortal(true);
    try {
      const result = await createBillingPortal({
        customerId: currentSubscription.stripeCustomerId,
        returnUrl: window.location.origin + '/settings'
      });

      if (result?.url) {
        window.open(result.url, '_blank');
      } else {
        toast.error('Failed to create billing portal session');
      }
    } catch (error) {
      console.error('Error creating billing portal:', error);
      toast.error('Failed to open billing portal. Please try again.');
    } finally {
      setLoadingBillingPortal(false);
    }
  };

  const settingSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Current Plan', icon: CreditCard },
    { id: 'support', label: 'Contact Support', icon: MessageCircle }
  ];

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Update profile data via Convex (all fields including firstName, lastName, phone, company, role)
      // Note: We save to Convex since Clerk doesn't allow updating names via SDK
      await updateUserProfile({
        name: `${profileData.firstName} ${profileData.lastName}`,
        firstName: profileData.firstName || undefined,
        lastName: profileData.lastName || undefined,
        phone: profileData.phone || undefined,
        company: profileData.company || undefined,
        customRole: profileData.role || undefined,
      });

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(`Failed to update profile: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | number) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const renderSubscriptionSection = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Plan</h2>
        <p className="text-sm text-gray-500">View and manage your current subscription plan.</p>
      </div>

      {/* Current Plan Section */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-3xl">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h4 className="text-lg font-medium text-blue-900">Current Plan</h4>
        </div>

        {loadingSubscription ? (
          <p className="text-blue-800">Loading subscription details...</p>
        ) : currentSubscription ? (
          <>
            <p className="text-blue-800 mb-4">
              You are currently on the <strong>{currentSubscription.plan}</strong> plan.
              {currentSubscription.cancelAtPeriodEnd ? (
                <>
                  {' '}Your subscription will end on <strong>{formatDate(currentSubscription.nextBillingDate)}</strong>.
                  You can continue using your remaining tokens until then.
                </>
              ) : currentSubscription.nextBillingDate ? (
                <> Your next billing date is {formatDate(currentSubscription.nextBillingDate)}.</>
              ) : null}
            </p>
            {currentSubscription.cancelAtPeriodEnd && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Cancellation Scheduled:</strong> Your subscription will cancel on {formatDate(currentSubscription.nextBillingDate)}.
                  You'll keep your current token balance until then.
                </p>
              </div>
            )}
            <Button
              variant="outline"
              className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={handleManageSubscription}
              disabled={loadingBillingPortal || !currentSubscription?.stripeCustomerId}
            >
              {loadingBillingPortal ? 'Opening billing portal...' : 'Manage Subscription'}
            </Button>
          </>
        ) : (
          <p className="text-blue-800">
            No active subscription found. <a href="/onboarding" className="underline">Choose a plan</a> to get started.
          </p>
        )}
      </div>
    </div>
  );

  const renderSupportSection = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Support</h2>
        <p className="text-sm text-gray-500">Get help with QuantiPackAI features, billing, or technical issues.</p>
      </div>

      <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">We're Here to Help</h4>
            <p className="text-sm text-gray-600">Our support team is ready to assist you</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <h5 className="font-medium text-gray-900 mb-2">What can we help you with?</h5>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Technical questions about Suite Analyzer, Spec Generator, Demand Planner, or Design Analyzer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Billing and subscription management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Feature requests and product feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Account and security issues</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <h5 className="font-medium text-gray-900 mb-2">Support Email</h5>
            <p className="text-sm text-gray-600 mb-3">
              Send us an email and we'll get back to you as soon as possible.
            </p>
            <a
              href="mailto:knammouz@quantipack.com?subject=QuantiPackAI Support Request"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm break-all"
            >
              knammouz@quantipack.com
            </a>
          </div>
        </div>

        <Button
          onClick={() => window.location.href = 'mailto:knammouz@quantipack.com?subject=QuantiPackAI Support Request'}
          className="w-full rounded-full text-white hover:opacity-90"
          style={{ backgroundColor: designSystem.colors.primary }}
        >
          <Mail className="h-4 w-4 mr-2" />
          Send Support Email
        </Button>
      </div>
    </div>
  );


  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'subscription': return renderSubscriptionSection();
      case 'support': return renderSupportSection();
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