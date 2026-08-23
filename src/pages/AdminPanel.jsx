// src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { 
  Users, UserPlus, CheckCircle, Clock, Mail, 
  Trash2, Edit2, Plus, X, Search, RefreshCw, ArrowLeft, Crown,
  Inbox, Eye, Check
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // users | inbox | templates
  
  // Users & stats
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Feedback (Inbox)
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  // Template modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    plain_text: '',
    html_body: '',
  });
  
  // Newsletter form
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    message: '',
    template_id: '',
    recipient_filter: 'all',
  });
  
  const [rawUsersResponse, setRawUsersResponse] = useState(null);

  // Fetch data on mount and when tab changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always fetch stats and users (for tabs that need them)
      const [statsRes, usersRes, templatesRes] = await Promise.all([
        api.get('/admin/stats/'),
        api.get('/admin/users/'),
        api.get('/admin/templates/'),
      ]);
      
      console.log('📥 Users response:', usersRes.data);
      setRawUsersResponse(usersRes.data);
      
      // Robust user data handling
      let usersData = usersRes.data;
      if (!Array.isArray(usersData)) {
        if (usersData && typeof usersData === 'object' && usersData.results) {
          usersData = usersData.results;
        } else if (usersData && typeof usersData === 'object') {
          const values = Object.values(usersData);
          if (values.length > 0 && values.every(v => typeof v === 'object')) {
            usersData = values;
          } else {
            usersData = [];
          }
        } else {
          usersData = [];
        }
      }
      
      const sorted = [...usersData].sort((a, b) => {
        if (a.is_staff && !b.is_staff) return -1;
        if (!a.is_staff && b.is_staff) return 1;
        return a.username.localeCompare(b.username);
      });
      
      setUsers(sorted);
      setStats(statsRes.data);
      setTemplates(templatesRes.data);
      
      // If Inbox tab is active, fetch feedback
      if (activeTab === 'inbox') {
        await fetchFeedback();
      }
      
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError('Failed to load admin data. Make sure you are logged in as an admin.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Feedback (Inbox) ----------
  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const res = await api.get('/feedback/');
      setFeedback(res.data);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      setError('Could not load bug reports.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleMarkResolved = async (id) => {
    try {
      await api.patch(`/feedback/${id}/`, { status: 'resolved' });
      await fetchFeedback(); // refresh list
    } catch (err) {
      alert('Failed to mark as resolved.');
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!confirm('Delete this bug report?')) return;
    try {
      await api.delete(`/feedback/${id}/delete/`);
      await fetchFeedback();
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  // ---------- User Actions ----------
  const handleToggleActive = async (userId, currentStatus) => {
    if (userId === user.id) {
      alert('You cannot deactivate your own account.');
      return;
    }
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }
    try {
      await api.patch(`/admin/users/${userId}/`, { is_active: !currentStatus });
      const res = await api.get('/admin/users/');
      let usersData = res.data;
      if (!Array.isArray(usersData)) {
        if (usersData && usersData.results) {
          usersData = usersData.results;
        } else {
          usersData = [];
        }
      }
      const sorted = [...usersData].sort((a, b) => {
        if (a.is_staff && !b.is_staff) return -1;
        if (!a.is_staff && b.is_staff) return 1;
        return a.username.localeCompare(b.username);
      });
      setUsers(sorted);
    } catch (err) {
      console.error('Toggle error:', err);
      alert('Failed to update user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!confirm('Delete this user permanently? This will remove all their data.')) return;
    try {
      await api.delete(`/admin/users/${userId}/delete/`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  // ---------- Template Actions ----------
  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/admin/templates/${editingTemplate.id}/`, templateForm);
      } else {
        await api.post('/admin/templates/', templateForm);
      }
      const res = await api.get('/admin/templates/');
      setTemplates(res.data);
      setShowTemplateModal(false);
      setTemplateForm({ name: '', subject: '', plain_text: '', html_body: '' });
      setEditingTemplate(null);
    } catch (err) {
      alert('Failed to save template.');
    }
  };

  const handleEditTemplate = (tpl) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      name: tpl.name,
      subject: tpl.subject,
      plain_text: tpl.plain_text,
      html_body: tpl.html_body,
    });
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await api.delete(`/admin/templates/${id}/`);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete template.');
    }
  };

  // ---------- Newsletter ----------
  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    const { subject, message, template_id, recipient_filter } = newsletterData;

    if (!template_id && (!subject || !message)) {
      alert('Subject and message are required when no template is selected.');
      return;
    }

    let recipients = recipient_filter === 'all' ? 'all' : selectedUsers;
    if (recipient_filter === 'selected' && selectedUsers.length === 0) {
      alert('Please select at least one user.');
      return;
    }

    setSending(true);
    try {
      await api.post('/admin/newsletter/', {
        subject: subject || '',
        message: message || '',
        template_id: template_id || null,
        recipient_filter: recipients,
      });
      alert('Newsletter sent successfully!');
      setShowNewsletterForm(false);
      setSelectedUsers([]);
      setNewsletterData({ subject: '', message: '', template_id: '', recipient_filter: 'all' });
    } catch (err) {
      alert('Failed to send newsletter.');
    } finally {
      setSending(false);
    }
  };

  // ---------- Helper: Online/Offline Status ----------
  const getOnlineStatus = (userData) => {
    if (!userData.profile || !userData.profile.last_seen) return '⚪ Offline';
    const lastSeen = new Date(userData.profile.last_seen);
    const now = new Date();
    const diffMinutes = (now - lastSeen) / 60000;
    if (diffMinutes < 2) return '🟢 Online';
    return '⚪ Offline';
  };

  const getLastSeenMinutes = (userData) => {
    if (!userData.profile || !userData.profile.last_seen) return 'Never';
    const lastSeen = new Date(userData.profile.last_seen);
    const now = new Date();
    const diffMinutes = (now - lastSeen) / 60000;
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ${Math.floor(diffMinutes % 60)}m ago`;
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const pendingCount = feedback.filter(f => f.status === 'pending').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            Admin Dashboard
          </h1>
        </div>
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <RefreshCw size={20} /> Refresh
        </button>
      </div>

      {/* Stats Cards (always visible) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Total Users</span>
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Active Users</span>
            <UserPlus className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.active_users || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Total Tasks</span>
            <CheckCircle className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.total_tasks || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">New Users (7d)</span>
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.new_users_last_week || 0}</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Users size={18} />
          Users
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium relative ${
            activeTab === 'inbox'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Inbox size={18} />
          Inbox
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
            activeTab === 'templates'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Mail size={18} />
          Templates
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div>
          {/* User Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded px-3 py-1 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <button
                onClick={() => setShowNewsletterForm(!showNewsletterForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Mail size={18} /> {showNewsletterForm ? 'Hide Newsletter' : 'Send Newsletter'}
              </button>
            </div>

            {showNewsletterForm && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <form onSubmit={handleSendNewsletter} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Subject</label>
                    <input
                      type="text"
                      value={newsletterData.subject}
                      onChange={(e) => setNewsletterData({...newsletterData, subject: e.target.value})}
                      className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Leave blank to use template subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Message (Plain text)</label>
                    <textarea
                      value={newsletterData.message}
                      onChange={(e) => setNewsletterData({...newsletterData, message: e.target.value})}
                      rows="3"
                      className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Leave blank to use template plain text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Choose Template</label>
                    <select
                      value={newsletterData.template_id}
                      onChange={(e) => setNewsletterData({...newsletterData, template_id: e.target.value})}
                      className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">None (plain text only)</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Recipients</label>
                    <select
                      value={newsletterData.recipient_filter}
                      onChange={(e) => setNewsletterData({...newsletterData, recipient_filter: e.target.value})}
                      className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="all">All subscribed users</option>
                      <option value="selected">Selected users only</option>
                    </select>
                    {newsletterData.recipient_filter === 'selected' && (
                      <p className="text-sm text-gray-500 mt-1">{selectedUsers.length} user(s) selected</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send Newsletter'}
                  </button>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) setSelectedUsers(users.map(u => u.id));
                          else setSelectedUsers([]);
                        }}
                        checked={selectedUsers.length === users.length && users.length > 0}
                      />
                    </th>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Username</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Last Seen</th>
                    <th className="px-4 py-2">Account</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-6 text-center">
                        <p className="text-gray-500">No users found.</p>
                        {rawUsersResponse && (
                          <details className="mt-2 text-left">
                            <summary className="cursor-pointer text-blue-500">Raw response (click to expand)</summary>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 text-xs overflow-auto max-h-40">
                              {JSON.stringify(rawUsersResponse, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ) : (
                    users
                      .filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
                      .map(u => {
                        const isAdmin = u.is_staff || u.is_superuser;
                        return (
                          <tr key={u.id}>
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(u.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                                  else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                                }}
                              />
                            </td>
                            <td className="px-4 py-2">{u.id}</td>
                            <td className="px-4 py-2 flex items-center gap-1">
                              {u.username}
                              {isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                            </td>
                            <td className="px-4 py-2">{u.email}</td>
                            <td className="px-4 py-2">
                              <span className="text-sm">{getOnlineStatus(u)}</span>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500">
                              {getLastSeenMinutes(u)}
                            </td>
                            <td className="px-4 py-2">
                              {u.id === user.id ? (
                                <span className="text-xs text-gray-500">(you)</span>
                              ) : (
                                <button
                                  onClick={() => handleToggleActive(u.id, u.is_active)}
                                  className={`px-2 py-1 rounded text-xs ${u.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
                                >
                                  {u.is_active ? 'Active' : 'Inactive'}
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {u.id !== user.id && (
                                <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-800">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inbox' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Inbox size={20} />
              Bug Reports
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </h2>
            <button
              onClick={fetchFeedback}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          {feedbackLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : feedback.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No bug reports yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Message</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {feedback.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {item.email || 'Anonymous'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {item.message}
                        {item.screenshot && (
                          <a
                            href={item.screenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800 inline-block"
                          >
                            <Eye size={14} className="inline" /> Screenshot
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'resolved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {item.status === 'resolved' ? 'Resolved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handleMarkResolved(item.id)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Mark as resolved"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFeedback(item.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Email Templates</h2>
            <button
              onClick={() => { setShowTemplateModal(true); setEditingTemplate(null); setTemplateForm({ name: '', subject: '', plain_text: '', html_body: '' }); }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <Plus size={16} /> New Template
            </button>
          </div>
          {templates.length === 0 ? (
            <p className="text-gray-500 text-sm">No templates yet. Create one to use in newsletters.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map(tpl => (
                <div key={tpl.id} className="border border-gray-200 dark:border-gray-700 rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{tpl.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tpl.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditTemplate(tpl)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteTemplate(tpl.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Template Modal (shared across tabs) */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleTemplateSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Plain Text (fallback)</label>
                  <textarea
                    value={templateForm.plain_text}
                    onChange={(e) => setTemplateForm({...templateForm, plain_text: e.target.value})}
                    rows="3"
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">HTML Body</label>
                  <p className="text-xs text-gray-500">Use <code>{'{{ username }}'}</code> and <code>{'{{ current_year }}'}</code>.</p>
                  <textarea
                    value={templateForm.html_body}
                    onChange={(e) => setTemplateForm({...templateForm, html_body: e.target.value})}
                    rows="8"
                    className="w-full border rounded px-3 py-2 font-mono text-sm dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;