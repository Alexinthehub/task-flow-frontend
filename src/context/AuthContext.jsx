// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check token and validate it
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      profileAPI.get()
        .then(response => {
          setUser({
            token: token,
            username: response.data.user?.username,
            email: response.data.user?.email,
            avatar: response.data.avatar || null,
            is_staff: response.data.user?.is_staff || false,
          });
        })
        .catch(() => {
          // Token is invalid
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('showWelcomeBack');
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
    localStorage.setItem('showWelcomeBack', 'true');
    const profileResponse = await profileAPI.get();
    setUser({
      token: access,
      username: profileResponse.data.user?.username,
      email: profileResponse.data.user?.email,
      avatar: profileResponse.data.avatar || null,
      is_staff: profileResponse.data.user?.is_staff || false,
    });
    return response;
  };

  const register = async (userData) => {
    localStorage.removeItem('taskflow_lock_password');
    localStorage.removeItem('taskflow_verified');
    const response = await authAPI.register(userData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('taskflow_lock_password');
    localStorage.removeItem('taskflow_verified');
    localStorage.removeItem('showWelcomeBack');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);