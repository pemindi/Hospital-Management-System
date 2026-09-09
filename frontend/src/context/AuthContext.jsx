import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const navigate = useNavigate();

  // configurable timeouts (ms) — use Vite env vars (VITE_...)
  const IDLE_TIMEOUT = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS) || 15 * 60 * 1000; // default 15 minutes
  const WARNING_BEFORE = Number(import.meta.env.VITE_IDLE_WARNING_MS) || 60 * 1000; // show warning 60s before

  useEffect(() => {
    const storedUser = localStorage.getItem('hms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    if (storedUser) startIdleTimers();

    return () => {
      clearIdleTimers();
      removeActivityListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('hms_token', token);
    localStorage.setItem('hms_user', JSON.stringify(userData));
    setUser(userData);
    startIdleTimers();
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setUser(null);
    clearIdleTimers();
    navigate('/login');
  };

  const clearIdleTimers = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    setShowIdleWarning(false);
  };

  const activityEvents = ['mousemove', 'mousedown', 'click', 'scroll', 'keydown', 'touchstart'];

  const resetIdleTimers = () => {
    clearIdleTimers();
    const timeUntilWarning = Math.max(0, IDLE_TIMEOUT - WARNING_BEFORE);

    warningTimerRef.current = setTimeout(() => {
      setShowIdleWarning(true);
      // schedule final logout after WARNING_BEFORE
      logoutTimerRef.current = setTimeout(() => {
        logout();
      }, WARNING_BEFORE);
    }, timeUntilWarning);

    // ensure final logout is scheduled in case warning not shown for any reason
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, IDLE_TIMEOUT);
  };

  const activityHandler = () => {
    if (showIdleWarning) setShowIdleWarning(false);
    resetIdleTimers();
  };

  const addActivityListeners = () => {
    activityEvents.forEach((ev) => window.addEventListener(ev, activityHandler));
  };

  const removeActivityListeners = () => {
    activityEvents.forEach((ev) => window.removeEventListener(ev, activityHandler));
  };

  const startIdleTimers = () => {
    resetIdleTimers();
    addActivityListeners();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}

      {showIdleWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">You're about to be logged out</h3>
            <p className="text-sm text-gray-600 mb-4">No activity detected. You'll be logged out in 60 seconds.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { activityHandler(); }} className="bg-blue-700 text-white px-4 py-2 rounded">Stay signed in</button>
              <button onClick={() => { clearIdleTimers(); logout(); }} className="bg-gray-200 px-4 py-2 rounded">Log out now</button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
