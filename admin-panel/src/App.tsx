import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import Events from './pages/Events'
import Layout from './components/Layout'
import Feedback from './pages/Feedback'
// import Venue from './pages/Venue'
import BlindDates from './pages/BlindDates'
import AdminManagement from './pages/AdminManagement'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-var(--bg-secondary)">
          {/* <div className="glass-card p-8"> */}
            <div className="loading-spinner"></div>
            {/* <p className="mt-4 text-var(--text-secondary)">Loading...</p> */}
          {/* </div> */}
        </div>
      </ThemeProvider>
    )
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Login />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              boxShadow: 'var(--glass-shadow)',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--error)',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:userId" element={<UserDetail />} />
          <Route path="/events" element={<Events />} />
  
          {/*           // <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} /> */}
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/blind-dates" element={<BlindDates />} />
          <Route path="/admin-management" element={
            user?.role === 'super_admin' ? 
            <AdminManagement /> : 
            <Navigate to="/users" replace />
          } />
          {/** Venue route temporarily disabled until backend is ready */}
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            boxShadow: 'var(--glass-shadow)',
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error)',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </ThemeProvider>
  )
}

export default App 