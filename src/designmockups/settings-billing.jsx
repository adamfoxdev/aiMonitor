import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userAPI, teamsAPI, providersAPI, billingAPI } from '../services/api.js';

const connectedProviders = [
  { id: 'anthropic', name: 'Anthropic', logo: 'A', color: '#D97757', status: 'connected', lastSync: '2 min ago' },
  { id: 'openai', name: 'OpenAI', logo: 'O', color: '#10A37F', status: 'connected', lastSync: '5 min ago' },
  { id: 'azure', name: 'Azure OpenAI', logo: 'Az', color: '#0078D4', status: 'error', lastSync: 'Failed' },
];

const availableProviders = [
  { id: 'github', name: 'GitHub Copilot', logo: 'G', color: '#8B5CF6' },
  { id: 'aws', name: 'AWS Bedrock', logo: 'λ', color: '#FF9900' },
  { id: 'google', name: 'Google Vertex', logo: 'G', color: '#4285F4' },
];

const invoices = [
  { id: 'INV-001', date: 'Feb 1, 2026', amount: 99.00, status: 'paid' },
  { id: 'INV-002', date: 'Jan 1, 2026', amount: 99.00, status: 'paid' },
  { id: 'INV-003', date: 'Dec 1, 2025', amount: 99.00, status: 'paid' },
  { id: 'INV-004', date: 'Nov 1, 2025', amount: 29.00, status: 'paid' },
];

const teamMembers = [
  { id: 1, name: 'John Smith', email: 'john@company.com', role: 'Owner', avatar: 'JS' },
  { id: 2, name: 'Sarah Chen', email: 'sarah@company.com', role: 'Admin', avatar: 'SC' },
  { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'Member', avatar: 'MJ' },
  { id: 4, name: 'Emily Davis', email: 'emily@company.com', role: 'Member', avatar: 'ED' },
];

const tabs = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'billing', label: 'Billing', icon: '💳' },
  { id: 'providers', label: 'Providers', icon: '🔌' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'alerts', label: 'Alerts', icon: '🔔' },
  { id: 'security', label: 'Security', icon: '🔒' },
];

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    company: '',
    timezone: 'America/New_York',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from backend on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const { data } = await userAPI.getProfile();
        if (data.user) {
          setProfile({
            name: data.user.name || '',
            username: data.user.username || '',
            email: data.user.email || '',
            company: data.user.company || '',
            timezone: data.user.timezone || 'America/New_York',
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to auth context if API call fails
        if (user) {
          setProfile(prev => ({
            ...prev,
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            company: user.company || '',
          }));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    email_enabled: true,
    slack_enabled: false,
    slack_webhook_url: '',
    spike_threshold_pct: 20,
    daily_digest: true,
    weekly_report: false,
  });
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [apiKeyMessage, setApiKeyMessage] = useState('');
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [alertsSaveMessage, setAlertsSaveMessage] = useState('');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [teamMessage, setTeamMessage] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [providersMessage, setProvidersMessage] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerApiKey, setProviderApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Billing state
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [billingMessage, setBillingMessage] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Load API keys, Alerts, and Team on tab change
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        setIsLoadingApiKeys(true);
        const { data } = await userAPI.getApiKeys();
        if (data.apiKeys) {
          setApiKeys(data.apiKeys);
        }
      } catch (error) {
        console.error('Failed to load API keys:', error);
      } finally {
        setIsLoadingApiKeys(false);
      }
    };

    const loadAlerts = async () => {
      try {
        setIsLoadingAlerts(true);
        const { data } = await userAPI.getAlerts();
        if (data.alerts) {
          setAlertSettings({
            email_enabled: data.alerts.email_enabled ?? true,
            slack_enabled: data.alerts.slack_enabled ?? false,
            slack_webhook_url: data.alerts.slack_webhook_url || '',
            spike_threshold_pct: data.alerts.spike_threshold_pct ?? 20,
            daily_digest: data.alerts.daily_digest ?? true,
            weekly_report: data.alerts.weekly_report ?? false,
          });
          setSlackWebhookUrl(data.alerts.slack_webhook_url || '');
        }
      } catch (error) {
        console.error('Failed to load alert settings:', error);
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    const loadTeam = async () => {
      try {
        setIsLoadingTeam(true);
        const { data } = await teamsAPI.list();
        if (data.teams && data.teams.length > 0) {
          setTeams(data.teams);
          const team = data.teams[0]; // Use first team as default
          setCurrentTeam(team);
          
          // Load team members
          const { data: membersData } = await teamsAPI.getMembers(team.id);
          if (membersData.members) {
            setTeamMembers(membersData.members);
          }
        }
      } catch (error) {
        console.error('Failed to load team:', error);
      } finally {
        setIsLoadingTeam(false);
      }
    };

    const loadProviders = async () => {
      try {
        setIsLoadingProviders(true);
        // Need currentTeam, load teams first if not already loaded
        let teamToUse = currentTeam;
        if (!teamToUse) {
          const { data } = await teamsAPI.list();
          if (data.teams && data.teams.length > 0) {
            teamToUse = data.teams[0];
            setCurrentTeam(teamToUse);
          }
        }
        
        if (teamToUse) {
          const { data } = await providersAPI.list(teamToUse.id);
          if (data.providers) {
            console.log('Loaded providers:', data.providers);
            setConnectedProviders(data.providers);
          }
        }
      } catch (error) {
        console.error('Failed to load providers:', error);
        setProvidersMessage('✕ Failed to load providers');
      } finally {
        setIsLoadingProviders(false);
      }
    };

    const loadBilling = async () => {
      try {
        setIsLoadingBilling(true);
        setBillingMessage('');
        const { data } = await billingAPI.getCurrent();
        if (data.currentSubscription) {
          setCurrentSubscription(data.currentSubscription);
        }
        if (data.availablePlans) {
          setAvailablePlans(data.availablePlans);
        }
      } catch (error) {
        console.error('Failed to load billing:', error);
        setBillingMessage('✕ Failed to load billing information');
      } finally {
        setIsLoadingBilling(false);
      }
    };

    if (activeTab === 'security') {
      loadApiKeys();
    } else if (activeTab === 'alerts') {
      loadAlerts();
    } else if (activeTab === 'billing') {
      loadBilling();
    } else if (activeTab === 'providers') {
      loadProviders();
    } else if (activeTab === 'team') {
      loadTeam();
    }
  }, [activeTab]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');
      setSavedMessage('');
      
      // Call API to update profile (name, company, timezone)
      const { data } = await userAPI.updateProfile({
        name: profile.name,
        company: profile.company,
        timezone: profile.timezone,
      });
      
      // Update local state with returned user data
      if (data.user) {
        setProfile(prev => ({
          ...prev,
          ...data.user,
        }));
      }
      
      setSavedMessage('Profile updated successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to save profile';
      setErrorMessage(message);
      console.error('Profile save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      setApiKeyMessage('Please enter a key name');
      return;
    }

    try {
      setIsLoadingApiKeys(true);
      setApiKeyMessage('');
      const { data } = await userAPI.createApiKey(newKeyName);
      setGeneratedKey(data.apiKey.plainKey);
      setShowNewKeyModal(true);
      setNewKeyName('');
      // Reload keys list
      const { data: keysData } = await userAPI.getApiKeys();
      setApiKeys(keysData.apiKeys);
    } catch (error) {
      setApiKeyMessage(error.response?.data?.message || 'Failed to create API key');
    } finally {
      setIsLoadingApiKeys(false);
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;

    try {
      await userAPI.deleteApiKey(keyId);
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      setApiKeyMessage('API key deleted');
      setTimeout(() => setApiKeyMessage(''), 3000);
    } catch (error) {
      setApiKeyMessage(error.response?.data?.message || 'Failed to delete API key');
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setApiKeyMessage('Copied to clipboard!');
    setTimeout(() => setApiKeyMessage(''), 2000);
  };

  const handleSaveAlerts = async () => {
    try {
      setIsLoadingAlerts(true);
      setAlertsSaveMessage('');
      
      const payload = {
        email_enabled: alertSettings.email_enabled,
        slack_enabled: alertSettings.slack_enabled,
        slack_webhook_url: alertSettings.slack_webhook_url || '',
        spike_threshold_pct: alertSettings.spike_threshold_pct,
        daily_digest: alertSettings.daily_digest,
        weekly_report: alertSettings.weekly_report,
      };
      
      console.log('Sending alert settings:', payload);
      
      const response = await userAPI.updateAlerts(payload);
      
      console.log('Alert update response:', response);
      
      // Update local state with returned data
      if (response.data.alerts) {
        setAlertSettings({
          email_enabled: response.data.alerts.email_enabled ?? true,
          slack_enabled: response.data.alerts.slack_enabled ?? false,
          slack_webhook_url: response.data.alerts.slack_webhook_url || '',
          spike_threshold_pct: response.data.alerts.spike_threshold_pct ?? 20,
          daily_digest: response.data.alerts.daily_digest ?? true,
          weekly_report: response.data.alerts.weekly_report ?? false,
        });
      }
      
      setAlertsSaveMessage('✓ Alert settings updated successfully!');
      setTimeout(() => setAlertsSaveMessage(''), 3000);
    } catch (error) {
      console.error('Alert save error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to save alerts';
      setAlertsSaveMessage('✕ ' + message);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleChangePlan = async (planId) => {
    try {
      setIsChangingPlan(true);
      setBillingMessage('');
      await billingAPI.changePlan(planId);
      setShowPlanModal(false);
      setBillingMessage('✓ Plan changed successfully! Reloading...');
      setTimeout(() => {
        // Reload billing data
        billingAPI.getCurrent()
          .then(({ data }) => {
            if (data.currentSubscription) {
              setCurrentSubscription(data.currentSubscription);
            }
            if (data.availablePlans) {
              setAvailablePlans(data.availablePlans);
            }
          })
          .catch(error => {
            console.error('Failed to reload billing:', error);
          });
      }, 1000);
    } catch (error) {
      console.error('Failed to change plan:', error);
      const message = error.response?.data?.error || error.message || 'Failed to change plan';
      setBillingMessage('✕ ' + message);
    } finally {
      setIsChangingPlan(false);
    }
  };

  const toggleAlert = (key) => {
    setAlertSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      setTeamMessage('✕ Please enter an email address');
      return;
    }

    try {
      setIsInviting(true);
      setTeamMessage('');
      
      if (!currentTeam) {
        console.error('No current team selected');
        setTeamMessage('✕ No team selected');
        setIsInviting(false);
        return;
      }

      console.log('Inviting member:', { teamId: currentTeam.id, email: inviteEmail, role: inviteRole });
      
      const response = await teamsAPI.inviteMember(currentTeam.id, inviteEmail, inviteRole);
      console.log('Invite response status:', response.status);
      console.log('Invite response data:', response.data);
      
      if (response.data.success) {
        setTeamMessage('✓ Invitation sent to ' + inviteEmail);
        setInviteEmail('');
        setInviteRole('member');
        
        // Reload team members
        const { data: membersData } = await teamsAPI.getMembers(currentTeam.id);
        if (membersData && membersData.members) {
          console.log('Updated members list:', membersData.members);
          setTeamMembers(membersData.members);
        }
        
        setTimeout(() => setTeamMessage(''), 3000);
      }
    } catch (error) {
      console.error('Invite error details:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      const message = error.response?.data?.message || error.message || 'Failed to send invitation';
      setTeamMessage('✕ ' + message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId, status = 'active') => {
    const confirmMessage = status === 'pending' 
      ? 'Cancel this invitation?' 
      : 'Are you sure you want to remove this member?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (currentTeam) {
        if (status === 'pending') {
          // Cancel invitation
          await teamsAPI.cancelInvitation(currentTeam.id, memberId);
        } else {
          // Remove active member
          await teamsAPI.removeMember(currentTeam.id, memberId);
        }
        
        // Remove from local state
        setTeamMembers(prev => prev.filter(m => m.id !== memberId));
        setTeamMessage('✓ ' + (status === 'pending' ? 'Invitation canceled' : 'Member removed'));
        
        setTimeout(() => setTeamMessage(''), 3000);
      }
    } catch (error) {
      console.error('Remove member error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to remove member';
      setTeamMessage('✕ ' + message);
    }
  };

  const handleConnectProvider = async () => {
    if (!selectedProvider || !providerApiKey.trim()) {
      setProvidersMessage('✕ Please provide an API key');
      return;
    }

    try {
      setIsConnecting(true);
      setProvidersMessage('');
      
      if (!currentTeam) {
        console.error('No current team selected');
        setProvidersMessage('✕ No team selected');
        setIsConnecting(false);
        return;
      }

      console.log('Connecting provider:', { teamId: currentTeam.id, provider: selectedProvider, apiKey: '***' });
      
      const response = await providersAPI.connect(currentTeam.id, selectedProvider, providerApiKey);
      console.log('Connect response:', response.data);
      
      if (response.data.success) {
        setProvidersMessage('✓ ' + selectedProvider + ' connected successfully');
        setProviderApiKey('');
        setSelectedProvider(null);
        setShowConnectModal(false);
        
        // Reload providers
        const { data: providersData } = await providersAPI.list(currentTeam.id);
        if (providersData && providersData.providers) {
          console.log('Updated providers list:', providersData.providers);
          setConnectedProviders(providersData.providers);
        }
        
        setTimeout(() => setProvidersMessage(''), 3000);
      }
    } catch (error) {
      console.error('Connect provider error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to connect provider';
      setProvidersMessage('✕ ' + message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectProvider = async (providerId) => {
    if (!window.confirm('Are you sure you want to disconnect this provider?')) {
      return;
    }

    try {
      if (!currentTeam) {
        setProvidersMessage('✕ No team selected');
        return;
      }

      console.log('Disconnecting provider:', { teamId: currentTeam.id, providerId });
      
      const response = await providersAPI.disconnect(currentTeam.id, providerId);
      console.log('Disconnect response:', response.data);
      
      if (response.data.success) {
        // Remove from local state
        setConnectedProviders(prev => prev.filter(p => p.id !== providerId));
        setProvidersMessage('✓ Provider disconnected');
        
        setTimeout(() => setProvidersMessage(''), 3000);
      }
    } catch (error) {
      console.error('Disconnect provider error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to disconnect provider';
      setProvidersMessage('✕ ' + message);
    }
  };

  const handleSyncProvider = async (providerId) => {
    try {
      if (!currentTeam) {
        setProvidersMessage('✕ No team selected');
        return;
      }

      console.log('Syncing provider:', { teamId: currentTeam.id, providerId });
      
      const response = await providersAPI.sync(currentTeam.id, providerId);
      console.log('Sync response:', response.data);
      
      if (response.data.success) {
        // Update last_sync timestamp in state
        setConnectedProviders(prev => prev.map(p => 
          p.id === providerId 
            ? { ...p, last_sync: response.data.provider.last_sync }
            : p
        ));
        setProvidersMessage('✓ Sync started');
        
        setTimeout(() => setProvidersMessage(''), 3000);
      }
    } catch (error) {
      console.error('Sync provider error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to sync provider';
      setProvidersMessage('✕ ' + message);
    }
  };

  const providerNames = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    azure: 'Azure OpenAI',
    github: 'GitHub Copilot',
    vercel: 'Vercel',
    aws: 'AWS Bedrock',
    google: 'Google Vertex',
  };

  const availableProvidersData = [
    { id: 'openai', name: 'OpenAI', color: '#10A37F' },
    { id: 'anthropic', name: 'Anthropic', color: '#D97757' },
    { id: 'azure', name: 'Azure OpenAI', color: '#0078D4' },
    { id: 'github', name: 'GitHub Copilot', color: '#8B5CF6' },
    { id: 'aws', name: 'AWS Bedrock', color: '#FF9900' },
    { id: 'google', name: 'Google Vertex', color: '#4285F4' },
    { id: 'vercel', name: 'Vercel', color: '#000000' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050506',
      color: '#FAFAFA',
      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      display: 'flex',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .input-field {
          width: 100%;
          padding: 14px 18px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: white;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: all 0.3s;
        }
        
        .input-field:focus {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        
        .input-field::placeholder {
          color: #555;
        }
        
        .input-field:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn {
          padding: 12px 24px;
          border-radius: 10px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
        
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }
        
        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #EF4444;
        }
        
        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        
        .card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 24px;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .card-title {
          font-size: 18px;
          font-weight: 600;
        }
        
        .tab-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          color: #888;
          margin-bottom: 4px;
        }
        
        .tab-item:hover {
          background: rgba(255,255,255,0.03);
          color: #FAFAFA;
        }
        
        .tab-item.active {
          background: rgba(99, 102, 241, 0.1);
          color: #FAFAFA;
        }
        
        .toggle {
          width: 44px;
          height: 24px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .toggle.active {
          background: #6366F1;
        }
        
        .toggle::after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: all 0.3s;
        }
        
        .toggle.active::after {
          left: 23px;
        }
        
        .provider-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }
        
        .provider-card:hover {
          border-color: rgba(255,255,255,0.1);
        }
        
        .provider-card.error {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .status-dot.connected {
          background: #22C55E;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }
        
        .status-dot.error {
          background: #EF4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
        }
        
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        
        .badge-owner { background: rgba(99, 102, 241, 0.15); color: #6366F1; }
        .badge-admin { background: rgba(139, 92, 246, 0.15); color: #8B5CF6; }
        .badge-member { background: rgba(255,255,255,0.05); color: #888; }
        .badge-paid { background: rgba(34, 197, 94, 0.15); color: #22C55E; }
        
        .invoice-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 100px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: center;
        }
        
        .invoice-row:last-child {
          border-bottom: none;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        .team-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        
        .team-row:last-child {
          border-bottom: none;
        }
        
        select.input-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
        }
      `}</style>

      {/* Sidebar Navigation */}
      <div style={{
        width: 280,
        padding: 32,
        borderRight: '1px solid rgba(255,255,255,0.04)',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
          }}>
            $
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>TokenMeter</span>
        </div>

        {/* Navigation */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12, padding: '0 20px' }}>
            SETTINGS
          </div>
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span style={{ fontWeight: 500 }}>{tab.label}</span>
            </div>
          ))}
        </div>

        {/* Back to Dashboard */}
        <div style={{ marginTop: 'auto' }}>
          <div 
            className="tab-item"
            onClick={() => navigate('/dashboard')}
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 20, marginTop: 20, cursor: 'pointer' }}
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 48, maxWidth: 900 }}>
        
        {/* Back to Dashboard Button */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#6366F1',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(99, 102, 241, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(99, 102, 241, 0.15)';
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Profile</h1>
            <p style={{ color: '#666', marginBottom: 40 }}>Manage your personal information</p>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Personal Information</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Full name</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Username</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={profile.username}
                    readOnly
                    style={{ background: 'rgba(255,255,255,0.03)', cursor: 'not-allowed' }}
                    title="Username cannot be changed"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Email</label>
                  <input 
                    type="email" 
                    className="input-field"
                    value={profile.email}
                    readOnly
                    style={{ background: 'rgba(255,255,255,0.03)', cursor: 'not-allowed' }}
                    title="Email cannot be changed"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Company</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Timezone</label>
                  <select 
                    className="input-field"
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {savedMessage && (
                    <div style={{ color: '#10b981', fontSize: 14, fontWeight: 500 }}>
                      ✓ {savedMessage}
                    </div>
                  )}
                  {errorMessage && (
                    <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 500 }}>
                      ✕ {errorMessage}
                    </div>
                  )}
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <><Spinner /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">API Key</div>
              </div>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                Use this key to access the TokenMeter API
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type={showApiKey ? 'text' : 'password'}
                  className="input-field mono"
                  value="tm_live_sk_1234567890abcdef1234567890abcdef"
                  readOnly
                  style={{ fontSize: 13 }}
                />
                <button className="btn btn-secondary" onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
                <button className="btn btn-secondary" onClick={() => alert('Copied!')}>
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Billing</h1>
            <p style={{ color: '#666', marginBottom: 40 }}>Manage your subscription and payment methods</p>

            {billingMessage && (
              <div style={{
                padding: 12,
                marginBottom: 20,
                borderRadius: 8,
                background: billingMessage.startsWith('✓') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: billingMessage.startsWith('✓') ? '#22C55E' : '#EF4444',
                fontSize: 13,
              }}>
                {billingMessage}
              </div>
            )}

            {isLoadingBilling ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                <Spinner /> Loading billing information...
              </div>
            ) : currentSubscription && currentSubscription.plan ? (
              <>
                {/* Current Plan */}
                <div className="card" style={{ 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
                  borderColor: 'rgba(99, 102, 241, 0.2)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700 }}>{currentSubscription.plan.name} Plan</h2>
                        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }}>
                          {currentSubscription.status ? currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1) : 'Active'}
                        </span>
                      </div>
                      <div style={{ color: '#888', marginBottom: 20 }}>
                        <span className="mono" style={{ fontSize: 32, fontWeight: 700, color: '#FAFAFA' }}>${currentSubscription.plan.price_monthly}</span>
                        <span>/month</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {Array.isArray(currentSubscription.plan.features) && currentSubscription.plan.features.map((f, i) => (
                          <span key={i} style={{
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 6,
                            fontSize: 12,
                            color: '#888',
                          }}>
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
                        {currentSubscription.currentPeriodEnd ? `Renews ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}` : 'No renewal date'}
                      </div>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowPlanModal(true);
                          if (currentSubscription?.plan) {
                            setSelectedPlan(currentSubscription.plan);
                          }
                        }}
                      >
                        Change Plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan Change Modal */}
                {showPlanModal && (
                  <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                      <div className="modal-header">
                        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Change Subscription Plan</h2>
                        <button className="modal-close" onClick={() => setShowPlanModal(false)}>✕</button>
                      </div>
                      <div className="modal-content">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                          {availablePlans.map(plan => (
                            <div
                              key={plan.id}
                              className="card"
                              style={{
                                cursor: 'pointer',
                                border: selectedPlan?.id === plan.id ? '2px solid #6366F1' : currentSubscription?.plan?.id === plan.id ? '2px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                                background: selectedPlan?.id === plan.id ? 'rgba(99, 102, 241, 0.15)' : currentSubscription?.plan?.id === plan.id ? 'rgba(34, 197, 94, 0.1)' : undefined,
                                transition: 'all 0.2s',
                              }}
                              onClick={() => setSelectedPlan(plan)}
                            >
                              <div style={{ marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                                <p style={{ color: '#888', fontSize: 13 }}>{plan.description}</p>
                              </div>
                              <div style={{ marginBottom: 16 }}>
                                <span style={{ fontSize: 28, fontWeight: 700 }}>${plan.price_monthly}</span>
                                <span style={{ color: '#888' }}>/month</span>
                              </div>
                              <div style={{ fontSize: 13, color: '#888' }}>
                                <p style={{ marginBottom: 8 }}>✓ {plan.max_team_members === 999 ? 'Unlimited' : plan.max_team_members} team members</p>
                                <p style={{ marginBottom: 8 }}>✓ {plan.max_providers === 999 ? 'Unlimited' : plan.max_providers} providers</p>
                                {plan.api_access && <p>✓ API access</p>}
                              </div>
                              {currentSubscription?.plan?.id === plan.id && (
                                <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: 4, color: '#22C55E', fontSize: 12, textAlign: 'center' }}>
                                  Current Plan
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {selectedPlan && currentSubscription?.plan?.id === selectedPlan.id && (
                          <div style={{
                            padding: 12,
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#22C55E',
                            borderRadius: 6,
                            fontSize: 13,
                            marginBottom: 20,
                            textAlign: 'center',
                          }}>
                            You are already on this plan
                          </div>
                        )}

                        {selectedPlan && currentSubscription?.plan?.id !== selectedPlan.id && (
                          <div style={{ marginBottom: 20 }}>
                            <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
                              {currentSubscription?.plan?.price_monthly > selectedPlan.price_monthly
                                ? `You'll save $${(currentSubscription?.plan?.price_monthly - selectedPlan.price_monthly).toFixed(2)} per month`
                                : `You'll pay $${(selectedPlan.price_monthly - currentSubscription?.plan?.price_monthly).toFixed(2)} extra per month`}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowPlanModal(false)}>Cancel</button>
                        <button
                          className="btn btn-primary"
                          disabled={!selectedPlan || selectedPlan.id === currentSubscription?.plan?.id || isChangingPlan}
                          onClick={() => handleChangePlan(selectedPlan.id)}
                          style={{
                            opacity: !selectedPlan || selectedPlan.id === currentSubscription?.plan?.id || isChangingPlan ? 0.5 : 1,
                            cursor: !selectedPlan || selectedPlan.id === currentSubscription?.plan?.id || isChangingPlan ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isChangingPlan ? <><Spinner /> Changing Plan...</> : 'Change Plan'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Payment Method</div>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>Update</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 56,
                      height: 36,
                      background: 'linear-gradient(135deg, #1A1F71, #2B4DFF)',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      VISA
                    </div>
                    <div>
                      <div className="mono" style={{ fontWeight: 500 }}>•••• •••• •••• 4242</div>
                      <div style={{ color: '#666', fontSize: 13 }}>Expires 12/2027</div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <div className="card-title" style={{ color: '#EF4444', marginBottom: 12 }}>Danger Zone</div>
                  <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                    Cancel your subscription. Your data will be retained for 30 days.
                  </p>
                  <button className="btn btn-danger">Cancel Subscription</button>
                </div>
              </>
            ) : (
              <div className="card">
                <p style={{ textAlign: 'center', color: '#888' }}>No active subscription. Select a plan to get started.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 20 }}>
                  {availablePlans.map(plan => (
                    <div
                      key={plan.id}
                      className="card"
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => handleChangePlan(plan.id)}
                    >
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{plan.name}</h3>
                      <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>{plan.description}</p>
                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 28, fontWeight: 700 }}>${plan.price_monthly}</span>
                        <span style={{ color: '#888' }}>/month</span>
                      </div>
                      <button className="btn btn-primary" style={{ width: '100%' }}>Subscribe Now</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Providers</h1>
            <p style={{ color: '#666', marginBottom: 40 }}>Connect and manage your LLM provider integrations</p>

            {providersMessage && (
              <div style={{ 
                padding: 12, 
                marginBottom: 20, 
                borderRadius: 8, 
                background: providersMessage.startsWith('✕') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                color: providersMessage.startsWith('✕') ? '#EF4444' : '#22C55E', 
                fontSize: 14,
                fontWeight: 500
              }}>
                {providersMessage}
              </div>
            )}

            {showConnectModal && (
              <div className="card" style={{ marginBottom: 20, borderColor: '#6366F1', borderWidth: 2 }}>
                <div className="card-header">
                  <div className="card-title">Connect {selectedProvider && providerNames[selectedProvider]}</div>
                </div>
                <div style={{ paddingBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>API Key</label>
                  <input 
                    type="password"
                    className="input-field"
                    placeholder="Enter your API key"
                    value={providerApiKey}
                    onChange={(e) => setProviderApiKey(e.target.value)}
                    disabled={isConnecting}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowConnectModal(false);
                      setSelectedProvider(null);
                      setProviderApiKey('');
                    }}
                    disabled={isConnecting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleConnectProvider}
                    disabled={isConnecting || !providerApiKey.trim()}
                  >
                    {isConnecting ? <><Spinner /> Connecting...</> : 'Connect'}
                  </button>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <div className="card-title">Connected Providers</div>
              </div>
              {isLoadingProviders ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  <Spinner /> Loading providers...
                </div>
              ) : connectedProviders.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  No providers connected yet. Add one below to get started.
                </div>
              ) : (
                connectedProviders.map(provider => {
                  const providerColor = availableProvidersData.find(p => p.id === provider.provider_name)?.color || '#6366F1';
                  return (
                    <div key={provider.id} className="provider-card" style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: `${providerColor}15`,
                          border: `1px solid ${providerColor}30`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: providerColor,
                          fontWeight: 700,
                          fontSize: 16,
                        }}>
                          {provider.provider_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{providerNames[provider.provider_name] || provider.provider_name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                            <div style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: provider.status === 'error' ? '#EF4444' : '#22C55E'
                            }} />
                            <span style={{ color: provider.status === 'error' ? '#EF4444' : '#22C55E' }}>
                              {provider.status === 'error' ? 'Connection failed' : 'Connected'}
                            </span>
                            <span style={{ color: '#555' }}>• Last sync: {provider.last_sync ? new Date(provider.last_sync).toLocaleString() : 'Never'}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '8px 16px', fontSize: 13 }}
                          onClick={() => handleSyncProvider(provider.id)}
                        >
                          Sync
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '8px 16px', fontSize: 13 }}
                          onClick={() => handleDisconnectProvider(provider.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Add Provider</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {availableProvidersData.map(p => {
                  const isConnected = connectedProviders.some(cp => cp.provider_name === p.id);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        if (!isConnected) {
                          setSelectedProvider(p.id);
                          setShowConnectModal(true);
                        }
                      }}
                      style={{
                        padding: 24,
                        textAlign: 'center',
                        cursor: isConnected ? 'default' : 'pointer',
                        opacity: isConnected ? 0.5 : 1,
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.02)',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${p.color}15`,
                        border: `1px solid ${p.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: p.color,
                        fontWeight: 700,
                        fontSize: 16,
                        marginBottom: 12,
                        margin: '0 auto 12px',
                      }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>{p.name}</div>
                      <button 
                        className={isConnected ? "btn btn-secondary" : "btn btn-secondary"}
                        style={{ padding: '6px 14px', fontSize: 12 }}
                        disabled={isConnected}
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Team</h1>
            <p style={{ color: '#666', marginBottom: 40 }}>Manage your team members and permissions</p>

            {teamMessage && (
              <div style={{ 
                padding: 12, 
                marginBottom: 20, 
                borderRadius: 8, 
                background: teamMessage.startsWith('✕') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                color: teamMessage.startsWith('✕') ? '#EF4444' : '#22C55E', 
                fontSize: 14,
                fontWeight: 500
              }}>
                {teamMessage}
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <div className="card-title">Invite Team Member</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isInviting || isLoadingTeam}
                />
                <select 
                  className="input-field" 
                  style={{ width: 150 }}
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  disabled={isInviting || isLoadingTeam}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button 
                  className="btn btn-primary"
                  onClick={handleInviteMember}
                  disabled={isInviting || isLoadingTeam}
                >
                  {isInviting ? <><Spinner /> Inviting...</> : 'Send Invite'}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Team Members</div>
                <span style={{ color: '#666', fontSize: 13 }}>
                  {isLoadingTeam ? 'Loading...' : `${teamMembers.filter(m => m.status === 'active').length} of 10 seats used`}
                </span>
              </div>
              {isLoadingTeam ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  <Spinner /> Loading team members...
                </div>
              ) : teamMembers.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  No team members yet. Invite someone to get started.
                </div>
              ) : (
                teamMembers.map(member => (
                  <div key={member.id} className="team-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: member.status === 'pending' 
                          ? 'linear-gradient(135deg, #9CA3AF, #D1D5DB)' 
                          : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: 14,
                        opacity: member.status === 'pending' ? 0.6 : 1,
                      }}>
                        {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, opacity: member.status === 'pending' ? 0.7 : 1 }}>
                          {member.name || 'Pending Invitation'}
                        </div>
                        <div style={{ color: '#666', fontSize: 13 }}>{member.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {member.status === 'pending' ? (
                        <span className="badge" style={{ background: '#FCA5A5', color: '#9F1239', padding: '4px 12px', fontSize: 12, fontWeight: 500, borderRadius: 6 }}>
                          Pending Invite
                        </span>
                      ) : (
                        <span className={`badge badge-${member.role.toLowerCase()}`}>{member.role}</span>
                      )}
                      {member.role !== 'owner' && member.status === 'active' && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => handleRemoveMember(member.id, 'active')}
                          disabled={isInviting}
                        >
                          Remove
                        </button>
                      )}
                      {member.status === 'pending' && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => handleRemoveMember(member.id, 'pending')}
                          disabled={isInviting}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Alerts</h1>
            <p style={{ color: '#666', marginBottom: 40 }}>Configure how you receive notifications</p>

            {alertsSaveMessage && (
              <div style={{ 
                padding: 12, 
                marginBottom: 20, 
                borderRadius: 8, 
                background: alertsSaveMessage.startsWith('✕') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                color: alertsSaveMessage.startsWith('✕') ? '#EF4444' : '#22C55E', 
                fontSize: 14,
                fontWeight: 500
              }}>
                {alertsSaveMessage}
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <div className="card-title">Notification Channels</div>
              </div>
              {[
                { key: 'email_enabled', label: 'Email Notifications', desc: 'Receive alerts via email' },
                { key: 'slack_enabled', label: 'Slack Integration', desc: 'Post alerts to a Slack channel' },
              ].map(channel => (
                <div key={channel.key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{channel.label}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>{channel.desc}</div>
                  </div>
                  <div 
                    className={`toggle ${alertSettings[channel.key] ? 'active' : ''}`}
                    onClick={() => toggleAlert(channel.key)}
                  />
                </div>
              ))}
              
              {alertSettings.slack_enabled && (
                <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Slack Webhook URL</label>
                  <input 
                    type="password"
                    className="input-field"
                    placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"
                    value={alertSettings.slack_webhook_url}
                    onChange={(e) => setAlertSettings({ ...alertSettings, slack_webhook_url: e.target.value })}
                  />
                  <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                    Get this from your Slack workspace integrations settings
                  </p>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Alert Types</div>
              </div>
              {[
                { key: 'daily_digest', label: 'Daily Digest', desc: 'Morning summary of yesterday\'s spend' },
                { key: 'weekly_report', label: 'Weekly Report', desc: 'Comprehensive weekly analysis' },
              ].map(alert => (
                <div key={alert.key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{alert.label}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>{alert.desc}</div>
                  </div>
                  <div 
                    className={`toggle ${alertSettings[alert.key] ? 'active' : ''}`}
                    onClick={() => toggleAlert(alert.key)}
                  />
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Spike Detection Threshold</div>
              </div>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
                Get alerted when spending increases by this percentage or more
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {[5, 10, 20, 50].map(threshold => (
                  <button
                    key={threshold}
                    className={`btn ${alertSettings.spike_threshold_pct === threshold ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAlertSettings({ ...alertSettings, spike_threshold_pct: threshold })}
                    style={{ padding: '10px 20px' }}
                  >
                    {threshold}%
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: 12, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 8, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input-field"
                  value={alertSettings.spike_threshold_pct}
                  onChange={(e) => setAlertSettings({ ...alertSettings, spike_threshold_pct: Math.max(1, Math.min(100, parseInt(e.target.value) || 0)) })}
                  style={{ width: '100px' }}
                />
                <span style={{ marginLeft: 8, fontSize: 14 }}>%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleSaveAlerts} disabled={isLoadingAlerts}>
                {isLoadingAlerts ? 'Saving...' : 'Save Alert Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Security</h1>
            <p style={{ color: '#666', marginBottom: 40 }}>Manage your account security settings</p>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Change Password</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Current password</label>
                  <input type="password" className="input-field" placeholder="Enter current password" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>New password</label>
                  <input type="password" className="input-field" placeholder="Enter new password" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Confirm new password</label>
                  <input type="password" className="input-field" placeholder="Confirm new password" />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Two-Factor Authentication</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                    Add an extra layer of security to your account
                  </p>
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>Not enabled</span>
                </div>
                <button className="btn btn-secondary">Enable 2FA</button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Active Sessions</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 24 }}>💻</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>Chrome on macOS</div>
                    <div style={{ color: '#666', fontSize: 13 }}>San Francisco, CA • Current session</div>
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }}>Active</span>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="card-title">API Keys</div>
                  <button className="btn btn-primary" onClick={() => setShowNewKeyModal(true)} style={{ padding: '8px 16px', fontSize: 13 }}>
                    + New Key
                  </button>
                </div>
              </div>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                Create and manage API keys for programmatic access
              </p>
              
              {apiKeyMessage && (
                <div style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', fontSize: 13 }}>
                  {apiKeyMessage}
                </div>
              )}

              {isLoadingApiKeys ? (
                <div style={{ color: '#666' }}>Loading API keys...</div>
              ) : apiKeys.length === 0 ? (
                <div style={{ color: '#666', fontSize: 14 }}>No API keys created yet. Create one to get started.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {apiKeys.map(key => (
                    <div key={key.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{key.name}</div>
                        <div style={{ color: '#666', fontSize: 12 }}>
                          Created {new Date(key.created_at).toLocaleDateString()} {key.last_used_at ? `• Last used ${new Date(key.last_used_at).toLocaleDateString()}` : '• Never used'}
                        </div>
                      </div>
                      <button className="btn btn-secondary" onClick={() => handleDeleteApiKey(key.id)} style={{ padding: '6px 12px', fontSize: 12, color: '#EF4444' }}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New API Key Modal */}
            {showNewKeyModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: '#1a1a1b', borderRadius: 12, padding: 28, maxWidth: 500, width: '90%', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {!generatedKey ? (
                    <>
                      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Create New API Key</h2>
                      <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
                        Give your API key a descriptive name to remember what it's for.
                      </p>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Key Name</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g., Production Server, CI/CD Pipeline"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateApiKey()}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-primary" onClick={handleCreateApiKey} disabled={isLoadingApiKeys} style={{ flex: 1 }}>
                          {isLoadingApiKeys ? 'Creating...' : 'Create Key'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => { setShowNewKeyModal(false); setGeneratedKey(null); }} style={{ flex: 1 }}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#22C55E' }}>✓ Key Created</h2>
                      <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                        Save this key somewhere safe. You won't be able to see it again.
                      </p>
                      <div style={{ marginBottom: 20, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(99, 102, 241, 0.3)', fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', userSelect: 'all' }}>
                        {generatedKey}
                      </div>
                      <button className="btn btn-primary" onClick={() => handleCopyToClipboard(generatedKey)} style={{ marginBottom: 12, width: '100%' }}>
                        📋 Copy to Clipboard
                      </button>
                      <button className="btn btn-secondary" onClick={() => { setShowNewKeyModal(false); setGeneratedKey(null); }} style={{ width: '100%' }}>
                        Done
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <div className="card-title" style={{ color: '#EF4444', marginBottom: 12 }}>Danger Zone</div>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                Permanently delete your account and all associated data
              </p>
              <button className="btn btn-danger">Delete Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
