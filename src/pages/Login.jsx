import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, rememberMe);
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex">
      {/* Left side – Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold">TaskFlow</h1>
          </div>
          <p className="text-2xl font-light text-blue-200 mb-6">Manage Your Tasks Efficiently</p>
          <div className="mt-4 rounded-xl overflow-hidden shadow-2xl">
            <img 
              src="https://i.imgur.com/kDkPB6Z.jpeg" 
              alt="Task Management" 
              className="w-full h-auto object-cover"
              onError={(e) => e.target.src = 'https://via.placeholder.com/600x400/1a365d/ffffff?text=Task+Management'}
            />
          </div>
          <p className="mt-6 text-blue-200 text-lg leading-relaxed">
            Manage, organize, and complete your tasks efficiently with TaskFlow.
          </p>
        </div>
      </div>

      {/* Right side – Login form with Neumorphism */}
      <div className="w-full lg:w-1/2 bg-[#0f172a] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-[#1e293b] rounded-3xl p-8 shadow-[20px_20px_60px_#0a0f1a,-20px_-20px_60px_#2a3a5a]">
            <h2 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-center mb-8">Sign in to continue</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Username or Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0f172a] border-0 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[inset_8px_8px_16px_#080c16,inset_-8px_-8px_16px_#1a273a]"
                  placeholder="Enter your username or email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0f172a] border-0 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[inset_8px_8px_16px_#080c16,inset_-8px_-8px_16px_#1a273a] pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border transition ${
                      rememberMe 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-[#0f172a] border-gray-600'
                    } flex items-center justify-center shadow-[inset_2px_2px_6px_#080c16,inset_-2px_-2px_6px_#1a273a]`}>
                      {rememberMe && <CheckCircle size={14} className="text-white" />}
                    </div>
                  </div>
                  Remember Me
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition shadow-[10px_10px_30px_#080c16,-10px_-10px_30px_#2a3a5a] hover:shadow-[inset_10px_10px_30px_#0a1628,inset_-10px_-10px_30px_#2a3a5a]"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;