import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      profileAPI.get()
        .then(response => {
          setUser({
            token,
            username: response.data.user?.username,
            email: response.data.user?.email,
            avatar: response.data.avatar || null,
          });
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password, remember = false) => {
    const response = await authAPI.login(username, password);
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    if (remember) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    const profileResponse = await profileAPI.get();
    setUser({
      token: access,
      username: profileResponse.data.user?.username,
      email: profileResponse.data.user?.email,
      avatar: profileResponse.data.avatar || null,
    });
    // Clear any old lock data on fresh login (optional but safe)
    // We don't clear here to allow reuse across sessions, but we clear on logout.
    return response;
  };

  const register = async (userData) => {
    // Clear any old lock data in case of re-registration
    localStorage.removeItem('taskflow_lock_password');
    localStorage.removeItem('taskflow_verified');
    const response = await authAPI.register(userData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    // Clear lock data so next user starts fresh
    localStorage.removeItem('taskflow_lock_password');
    localStorage.removeItem('taskflow_verified');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);