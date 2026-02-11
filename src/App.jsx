import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './designmockups/dashboard.jsx'
import ForgotPasswordFlow from './designmockups/forgot-password.jsx'
import LandingPage from './designmockups/landing-page.jsx'
import LoginPage from './designmockups/login-page.jsx'
import SignupPage from './designmockups/signup-page.jsx'
import OnboardingTutorial from './designmockups/onboarding-tutorial.jsx'
import SettingsPage from './designmockups/settings-billing.jsx'
import AuthCallback from './designmockups/auth-callback.jsx'
import ProviderRatingsPage from './designmockups/provider-ratings-page.jsx'

const routeItems = [
  { path: '/', label: 'Landing', element: <LandingPage />, protected: false },
  { path: '/login', label: 'Login', element: <LoginPage />, protected: false },
  { path: '/signup', label: 'Signup', element: <SignupPage />, protected: false },
  { path: '/forgot-password', label: 'Forgot', element: <ForgotPasswordFlow />, protected: false },
  { path: '/auth/callback', label: 'Auth Callback', element: <AuthCallback />, protected: false },
  { path: '/providers', label: 'Provider Ratings', element: <ProviderRatingsPage />, protected: false },
  { path: '/onboarding', label: 'Onboarding', element: <OnboardingTutorial />, protected: true },
  { path: '/dashboard', label: 'Dashboard', element: <Dashboard />, protected: true },
  { path: '/settings', label: 'Settings', element: <SettingsPage />, protected: true },
]

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}

function DevNav() {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  return (
    <nav className="dev-nav">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: isCollapsed ? 0 : 12 }}>
        {!isCollapsed && <div className="dev-nav-title">Pages</div>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#6366F1',
            width: 32,
            height: 32,
            borderRadius: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 600,
          }}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>
      
      {!isCollapsed && (
        <>
          {user && (
            <div style={{
              fontSize: 11,
              color: '#888',
              paddingBottom: 8,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 8,
            }}>
              Logged in as: <span style={{ color: '#6366F1', fontWeight: 600 }}>{user.email}</span>
            </div>
          )}
          <div className="dev-nav-links">
            {routeItems.map((route) => (
              <NavLink
                key={route.path}
                className={({ isActive }) =>
                  isActive ? 'dev-nav-link active' : 'dev-nav-link'
                }
                to={route.path}
              >
                {route.label}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={logout}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
              >
                Logout
              </button>
            )}
          </div>
        </>
      )}
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <DevNav />
        <Routes>
          {routeItems.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={route.protected ? <ProtectedRoute element={route.element} /> : route.element} 
            />
          ))}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
