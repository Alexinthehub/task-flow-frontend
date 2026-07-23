import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const VerifyIdentityModal = ({ email, onVerify, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    onVerify(password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">TaskFlow Account</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          To continue, verify your identity by entering your account password.
        </p>
        <p className="text-sm text-gray-500 mb-2">Email: {email}</p>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="account_password"
            autoComplete="off"
            placeholder="Enter your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">OK</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentityModal;