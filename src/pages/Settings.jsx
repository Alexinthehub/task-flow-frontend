import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { profileAPI, feedbackAPI } from '../services/api';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  User, 
  Key, 
  Info, 
  Shield, 
  Mail, 
  Upload,
  Save,
  ChevronRight,
  Edit,
  Camera,
  Trash2,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { darkMode, setDarkMode } = useTheme();

  const [activeSection, setActiveSection] = useState('general');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nickname: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [feedback, setFeedback] = useState({
    email: '',
    message: '',
    screenshot: null,
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const nicknameInputRef = useRef(null);
  const screenshotInputRef = useRef(null);

  // Delete Account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.get();
        const data = response.data;
        setFormData({
          username: data.user?.username || '',
          email: data.user?.email || '',
          nickname: data.nickname || '',
          avatar: data.avatar || null,
        });
        if (data.avatar) setAvatarPreview(data.avatar);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const focusNickname = () => {
    if (nicknameInputRef.current) {
      nicknameInputRef.current.focus();
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.update({ nickname: formData.nickname });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile.');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB.');
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);
    setIsUploading(true);
    try {
      const response = await profileAPI.uploadAvatar(formData);
      if (response.data.avatar) {
        setAvatarPreview(response.data.avatar);
        setFormData(prev => ({ ...prev, avatar: response.data.avatar }));
        // Update user context so avatar appears globally
        const profileRes = await profileAPI.get();
        setUser(prev => ({ ...prev, avatar: profileRes.data.avatar }));
      }
      alert('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload avatar.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('Passwords do not match!');
      return;
    }
    if (passwordData.new_password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    try {
      await profileAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      alert('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      const msg = error.response?.data?.error || 'Failed to change password. Please check your current password.';
      alert(msg);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await profileAPI.deleteAccount(deletePassword);
      alert('Account deleted successfully.');
      logout();
      navigate('/login');
      setShowDeleteModal(false);
      setDeletePassword('');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to delete account. Please check your password.';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSubmitted(true);

    const formData = new FormData();
    formData.append('email', feedback.email);
    formData.append('message', feedback.message);
    if (feedback.screenshot) {
      formData.append('screenshot', feedback.screenshot);
    }
    try {
      await feedbackAPI.submit(formData);
      setTimeout(() => {
        setShowFeedbackForm(false);
        setFeedbackSubmitted(false);
        setFeedback({ email: '', message: '', screenshot: null });
      }, 2000);
    } catch (error) {
      console.error('Feedback error:', error);
      setFeedbackError('Failed to send feedback. Please try again.');
      setFeedbackSubmitted(false);
    }
  };

  const triggerScreenshotUpload = () => {
    if (screenshotInputRef.current) {
      screenshotInputRef.current.click();
    }
  };

  const navItems = [
    { id: 'general', icon: SettingsIcon, label: t('general') },
    { id: 'account', icon: User, label: t('account') },
    { id: 'app', icon: Info, label: t('app') },
    { id: 'support', icon: Mail, label: t('support') },
  ];

  if (loading) return <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
        <SettingsIcon className="w-8 h-8" />
        {t('settings')}
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                <ChevronRight size={16} className="ml-auto" />
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {/* General */}
          {activeSection === 'general' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('general')}</h2>
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">{t('theme')}</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setDarkMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      darkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Moon size={18} /> Dark
                  </button>
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      !darkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Sun size={18} /> Light
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Current: {darkMode ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe size={18} /> {t('language')}
                </h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Selected: {language}</p>
              </div>
            </div>
          )}

          {/* Account */}
          {activeSection === 'account' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('account')}</h2>
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <User size={18} /> Edit Profile
                </h3>
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                            <Camera size={16} />
                            {avatarPreview ? 'Change Profile Picture' : 'Upload Photo'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                          {isUploading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Uploading...</p>}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max size: 5MB</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This is your login email and cannot be changed.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nickname <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          ref={nicknameInputRef}
                          type="text"
                          value={formData.nickname}
                          onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                          className="flex-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your preferred nickname"
                        />
                        <button
                          type="button"
                          onClick={focusNickname}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Not your username – just a display name.</p>
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      <Save size={16} /> Save Profile
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Key size={18} /> {t('changePassword')}
                </h3>
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                        className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                        className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                        className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Delete Account Button */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>
          )}

          {/* App */}
          {activeSection === 'app' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('app')}</h2>
              <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('about')}</h3>
                <p className="text-gray-700 dark:text-gray-300">Version: 2.1.0</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  TaskFlow is a task management system built with Django and React.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Shield size={18} /> {t('privacy')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  TaskFlow is committed to protecting your privacy. 
                  We collect minimal data required for task management and never share your information with third parties.
                  All data is encrypted and stored securely.
                </p>
              </div>
            </div>
          )}

          {/* Support */}
          {activeSection === 'support' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('support')}</h2>

              {!showFeedbackForm ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-600">
                  <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('feedback')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">We value your input and strive to improve.</p>
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Open Feedback Form
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Let us know how we can improve</h3>

                  {feedbackSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-green-600 dark:text-green-400 font-medium">Thank you for your feedback!</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">We'll review it shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit}>
                      <div className="space-y-4">
                        {feedbackError && (
                          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-lg">
                            {feedbackError}
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email <span className="text-gray-500">(optional)</span></label>
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={feedback.email}
                            onChange={(e) => setFeedback({...feedback, email: e.target.value})}
                            className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Message <span className="text-red-600 dark:text-red-400">*</span></label>
                          <textarea
                            rows="4"
                            placeholder="Describe your issue or suggestion..."
                            value={feedback.message}
                            onChange={(e) => setFeedback({...feedback, message: e.target.value})}
                            className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Screenshot <span className="text-gray-500">(optional)</span></label>
                          <div 
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer"
                            onClick={triggerScreenshotUpload}
                          >
                            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
                            <input
                              ref={screenshotInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFeedback({...feedback, screenshot: e.target.files[0]})}
                              className="hidden"
                            />
                            {feedback.screenshot && <p className="text-sm text-green-600 dark:text-green-400 mt-1">{feedback.screenshot.name}</p>}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          By submitting, you agree to our privacy policy.
                        </p>
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete your account? This action is <strong>permanent</strong> and cannot be undone.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              To confirm, please enter your account password.
            </p>
            <div className="relative">
              <input
                type={showDeletePassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowDeletePassword(!showDeletePassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;