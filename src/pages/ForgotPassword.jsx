import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { passwordResetAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await passwordResetAPI.request(email);
      setSubmitted(true);
    } catch (err) {
      // Extract error message from backend
      const msg = err.response?.data?.message || 
                  err.response?.data?.detail || 
                  err.response?.data?.error ||
                  'Failed to send reset email. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-8">
        <div className="bg-[#1e293b] rounded-3xl p-8 max-w-md w-full shadow-[20px_20px_60px_#0a0f1a,-20px_-20px_60px_#2a3a5a] text-center">
          <Mail className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
          <p className="text-gray-400 mt-2">
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            Didn't receive it? Check your spam folder or try again.
          </p>
          <Link to="/login" className="mt-6 inline-block text-blue-400 hover:text-blue-300">
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1e293b] rounded-3xl p-8 shadow-[20px_20px_60px_#0a0f1a,-20px_-20px_60px_#2a3a5a]">
          <Link to="/login" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6">
            <ArrowLeft size={18} /> Back
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f172a] border-0 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[inset_8px_8px_16px_#080c16,inset_-8px_-8px_16px_#1a273a]"
                placeholder="your@email.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition shadow-[10px_10px_30px_#080c16,-10px_-10px_30px_#2a3a5a] hover:shadow-[inset_10px_10px_30px_#0a1628,inset_-10px_-10px_30px_#2a3a5a] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;