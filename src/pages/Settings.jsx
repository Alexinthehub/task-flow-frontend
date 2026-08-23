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
  X,
  HelpCircle,
  Bug
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { darkMode, setDarkMode } = useTheme();

  // Translation helper with proper fallback English
  const tr = (key, fallback) => {
    const result = t(key);
    return result === key ? fallback : result;
  };

  const [activeSection, setActiveSection] = useState('general');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nickname: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Fetch profile on mount
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
        if (data.avatar) {
          setAvatarPreview(data.avatar + '?v=' + Date.now());
          setAvatarVersion(prev => prev + 1);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar + '?v=' + Date.now());
      setAvatarVersion(prev => prev + 1);
    } else {
      setAvatarPreview(null);
    }
  }, [user?.avatar]);

  const focusNickname = () => {
    if (nicknameInputRef.current) {
      nicknameInputRef.current.focus();
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.update({ nickname: formData.nickname });
      alert(tr('ProfileUpdated', 'Profile updated successfully!'));
    } catch (error) {
      alert(tr('ProfileUpdateFailed', 'Failed to update profile.'));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(tr('InvalidImageType', 'Please upload a valid image (JPEG, PNG, GIF, or WebP).'));
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(tr('ImageTooLarge', 'Image must be less than 5MB.'));
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    setIsUploading(true);
    try {
      const response = await profileAPI.uploadAvatar(formData);
      if (response.data.avatar) {
        const profileRes = await profileAPI.get();
        setUser(prev => ({ ...prev, avatar: profileRes.data.avatar }));
        const newUrl = profileRes.data.avatar + '?v=' + Date.now();
        setAvatarPreview(newUrl);
        setAvatarVersion(prev => prev + 1);
        setFormData(prev => ({ ...prev, avatar: profileRes.data.avatar }));
        alert(tr('AvatarUploadSuccess', 'Avatar uploaded successfully!'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      const msg = error.response?.data?.error || error.response?.data?.message || tr('AvatarUploadFailed', 'Failed to upload avatar.');
      alert(msg);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert(tr('PasswordsDoNotMatch', 'Passwords do not match!'));
      return;
    }
    if (passwordData.new_password.length < 8) {
      alert(tr('PasswordMinLength', 'Password must be at least 8 characters.'));
      return;
    }
    try {
      await profileAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      alert(tr('PasswordChanged', 'Password changed successfully!'));
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      const msg = error.response?.data?.error || tr('PasswordChangeFailed', 'Failed to change password. Please check your current password.');
      alert(msg);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await profileAPI.deleteAccount(deletePassword);
      alert(tr('AccountDeleted', 'Account deleted successfully.'));
      logout();
      navigate('/login');
      setShowDeleteModal(false);
      setDeletePassword('');
    } catch (error) {
      const msg = error.response?.data?.error || tr('AccountDeleteFailed', 'Failed to delete account. Please check your password.');
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
      setFeedbackError(tr('FeedbackSubmitError', 'Failed to send bug report. Please try again.'));
      setFeedbackSubmitted(false);
    }
  };

  const triggerScreenshotUpload = () => {
    if (screenshotInputRef.current) {
      screenshotInputRef.current.click();
    }
  };

  // Navigation items – proper sentence case
  const navItems = [
    { id: 'general', icon: SettingsIcon, label: tr('General', 'General') },
    { id: 'account', icon: User, label: tr('Account', 'Account') },
    { id: 'app', icon: Info, label: tr('App', 'App') },
    { id: 'support', icon: Bug, label: tr('ReportBug', 'Report a bug') },
    { id: 'faq', icon: HelpCircle, label: tr('Faqs', 'FAQs') },
  ];

  if (loading) return <div className="text-center text-gray-500 dark:text-gray-400">{tr('Loading', 'Loading...')}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
        <SettingsIcon className="w-8 h-8" />
        {tr('Settings', 'Settings')}
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{tr('GeneralSettings', 'General Settings')}</h2>
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">{tr('AppTheme', 'App Theme')}</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setDarkMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      darkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Moon size={18} /> {tr('Dark', 'Dark')}
                  </button>
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      !darkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Sun size={18} /> {tr('Light', 'Light')}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {tr('CurrentTheme', 'Current')}: {darkMode ? tr('Dark', 'Dark') : tr('Light', 'Light')}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe size={18} /> {tr('Language', 'Language')}
                </h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="sw">{tr('Swahili', 'Swahili')}</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{tr('SelectedLanguage', 'Selected')}: {language}</p>
              </div>
            </div>
          )}

          {/* Account */}
          {activeSection === 'account' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{tr('AccountSettings', 'Account Settings')}</h2>
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <User size={18} /> {tr('EditProfile', 'Edit Profile')}
                </h3>
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tr('ProfilePicture', 'Profile Picture')}</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                          {avatarPreview ? (
                            <img
                              key={avatarVersion}
                              src={avatarPreview}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image failed to load:', e);
                                e.target.src = 'https://via.placeholder.com/80/cccccc/ffffff?text=Avatar';
                              }}
                            />
                          ) : (
                            <User size={32} className="text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                            <Camera size={16} />
                            {avatarPreview ? tr('ChangeProfilePicture', 'Change Profile Picture') : tr('UploadPhoto', 'Upload Photo')}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                          {isUploading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tr('Uploading', 'Uploading...')}</p>}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tr('MaxSize5MB', 'Max size: 5MB')}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tr('Email', 'Email')}</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tr('EmailCannotBeChanged', 'This is your login email and cannot be changed.')}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {tr('Nickname', 'Nickname')} <span className="text-gray-400">{tr('Optional', '(Optional)')}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          ref={nicknameInputRef}
                          type="text"
                          value={formData.nickname}
                          onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                          className="flex-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={tr('YourPreferredNickname', 'Your preferred nickname')}
                        />
                        <button
                          type="button"
                          onClick={focusNickname}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tr('NicknameHint', 'Not your username – just a display name.')}</p>
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      <Save size={16} /> {tr('SaveProfile', 'Save Profile')}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Key size={18} /> {tr('ChangePassword', 'Change Password')}
                </h3>
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('CurrentPassword', 'Current Password')}</label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                        className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('NewPassword', 'New Password')}</label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                        className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('ConfirmNewPassword', 'Confirm New Password')}</label>
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
                      {tr('ChangePassword', 'Change Password')}
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  {tr('DeleteAccount', 'Delete Account')}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {tr('DeleteAccountWarning', 'This action is permanent and cannot be undone.')}
                </p>
              </div>
            </div>
          )}

          {/* App */}
          {activeSection === 'app' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{tr('AppSettings', 'App Settings')}</h2>
              <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{tr('AboutTaskFlow', 'About TaskFlow')}</h3>
                <p className="text-gray-700 dark:text-gray-300">{tr('Version', 'Version')}: 2.1.0</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {tr('AppDescription', 'TaskFlow helps you organise your tasks, stay on track, and get more done – simply and securely.')}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Shield size={18} /> {tr('PrivacyNotice', 'Privacy Notice')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {tr('PrivacyText', 'TaskFlow is committed to protecting your privacy. We collect minimal data required for task management and never share your information with third parties. All data is encrypted and stored securely.')}
                </p>
              </div>
            </div>
          )}

          {/* Report Bug */}
          {activeSection === 'support' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{tr('ReportBug', 'Report a bug')}</h2>

              {!showFeedbackForm ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-600">
                  <Bug className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{tr('ReportBug', 'Report a bug')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{tr('ReportBugDescription', 'Help us improve by reporting any issues you encounter.')}</p>
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    {tr('ReportBug', 'Report a bug')}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{tr('LetUsKnow', 'Let us know what went wrong')}</h3>

                  {feedbackSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-green-600 dark:text-green-400 font-medium">{tr('ThankYouReport', 'Thank you for your report!')}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{tr('ReviewSoon', "We'll review it shortly.")}</p>
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('EmailOptional', 'Email (optional)')}</label>
                          <input
                            type="email"
                            placeholder={tr('YourEmailPlaceholder', 'your@email.com')}
                            value={feedback.email}
                            onChange={(e) => setFeedback({...feedback, email: e.target.value})}
                            className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('DescribeIssue', 'Describe the issue')} <span className="text-red-600 dark:text-red-400">*</span></label>
                          <textarea
                            rows="4"
                            placeholder={tr('DescribeIssuePlaceholder', 'What happened? What were you doing when the issue occurred?')}
                            value={feedback.message}
                            onChange={(e) => setFeedback({...feedback, message: e.target.value})}
                            className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('UploadScreenshotOptional', 'Upload Screenshot (optional)')}</label>
                          <div 
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer"
                            onClick={triggerScreenshotUpload}
                          >
                            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{tr('ClickToUpload', 'Click to upload or drag and drop')}</p>
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
                          {tr('SubmitAgreePrivacy', 'By submitting, you agree to our privacy policy.')}
                        </p>
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                        >
                          {tr('SubmitBugReport', 'Submit Bug Report')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FAQ */}
          {activeSection === 'faq' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{tr('Faqs', 'FAQs')}</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-900 dark:text-white">{tr('Faq1Question', 'What is TaskFlow?')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{tr('Faq1Answer', 'TaskFlow is a task management app that helps you organise, track, and complete your tasks efficiently.')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-900 dark:text-white">{tr('Faq2Question', 'How do I create a task?')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{tr('Faq2Answer', "Click the 'Add Task' button on the Tasks page, fill in the details, and click 'Create'.")}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-900 dark:text-white">{tr('Faq3Question', 'How do I lock a task?')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{tr('Faq3Answer', 'Select a task, click the lock icon, verify your identity, and set a lock password.')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-900 dark:text-white">{tr('Faq4Question', 'Can I share tasks with others?')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{tr('Faq4Answer', 'Yes! Select a task, click the share icon, and share via email or link.')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-900 dark:text-white">{tr('Faq5Question', 'How do I reset my password?')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{tr('Faq5Answer', "Click 'Forgot password?' on the login page and follow the instructions sent to your email.")}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-900 dark:text-white">{tr('Faq6Question', 'Is my data secure?')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{tr('Faq6Answer', 'Yes, TaskFlow uses JWT tokens for secure authentication and encrypts all passwords.')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tr('DeleteAccount', 'Delete Account')}</h2>
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
              {tr('DeleteAccountConfirm', 'Are you sure you want to delete your account? This action is permanent and cannot be undone.')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {tr('DeleteAccountEnterPassword', 'To confirm, please enter your account password.')}
            </p>
            <div className="relative">
              <input
                type={showDeletePassword ? 'text' : 'password'}
                placeholder={tr('EnterPassword', 'Enter your password')}
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
                {tr('Cancel', 'Cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {deleteLoading ? tr('Deleting', 'Deleting...') : tr('DeleteAccount', 'Delete Account')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;