import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SetLockModal = ({ onSet, onCancel }) => {
  const [lockPassword, setLockPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);

  const handleSubmit = () => {
    if (lockPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    onSet(lockPassword, rememberPassword);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Set Lock Password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Create a password to lock this task. You'll need it to unlock later.
        </p>
        <p className="text-xs text-gray-400 mb-2">Password should be at least 4 characters.</p>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="lock_password"
            autoComplete="off"
            placeholder="Enter lock password"
            value={lockPassword}
            onChange={(e) => setLockPassword(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="remember-password"
            checked={rememberPassword}
            onChange={(e) => setRememberPassword(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="remember-password" className="text-sm text-gray-600 dark:text-gray-300">
            Remember this password for future locks
          </label>
        </div>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">OK</button>
        </div>
      </div>
    </div>
  );
};

export default SetLockModal;