import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Building2, 
  MessageSquare,
  MapPin,
  LogOut, 
  Menu, 
  X,
  Settings,
  Bell,
  User,
  Shield,
  Volume2,
  HeartHandshake,
  Clock,
  CreditCard
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  requiresPermission?: string
  requiresRole?: string
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Function to get page title based on current route
  const getPageTitle = (pathname: string) => {
    const titleMap: { [key: string]: string } = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/users': 'Users Management',
      '/events': 'Events Management',
      '/feedback': 'Feedback Management',
      '/admin': 'Admin Management',
      '/blind-dates': 'Blind Dates',
      '/subscriptions': 'Subscription Management',
      '/venues': 'Venues'
    }
    return titleMap[pathname] || 'Admin Panel'
  }

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Events', href: '/events', icon: Calendar },
    // { name: 'Organizers', href: '/organizers', icon: Building2 },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
    { name: 'Blind Dates', href: '/blind-dates', icon: HeartHandshake },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
    { 
      name: 'Admin Management', 
      href: '/admin-management', 
      icon: Shield,
      requiresPermission: 'admins.view',
      requiresRole: 'super_admin'
    },
    // { name: 'Venues', href: '/venue', icon: MapPin },
  ].filter(item => {
    // Filter out items that require specific permissions or roles
    if (item.requiresRole) {
      return user?.role === item.requiresRole;
    }
    if (item.requiresPermission) {
      return user?.permissions?.admins?.view === true || user?.role === 'super_admin';
    }
    return true;
  });

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-var(--bg-secondary)">
      {/* Desktop sidebar - Full height */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col sidebar-with-animation">
        {/* Grid Effect Animation */}
        <div className="sidebar-grid-effect">
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} className="sidebar-grid-tile"></div>
          ))}
        </div>
        <div className="flex flex-col flex-grow sidebar">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-center px-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-white" />
              </div>
              <p className="text-lg font-bold gradient-text">Admin Panel</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-var(--bg-tertiary)'}`}>
                    <item.icon 
                      className={`h-5 w-5 ${isActive ? 'text-white' : 'text-var(--text-secondary)'}`} 
                    />
                  </div>
                  <span className="ml-3 font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </nav>
          
          <div className="border-t border-var(--border) p-4">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-var(--text-primary)">{user?.name}</p>
                <p className="text-xs text-var(--text-muted)">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-semibold text-var(--error) hover:bg-var(--error)/10 rounded-xl transition-all duration-300"
            >
              <div className="p-2 rounded-lg bg-var(--error)/10">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="ml-3">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Glassmorphism Header */}
      <div className="sticky top-0 z-40 header lg:ml-72">
        <div className="flex h-16 items-center gap-x-4 px-6">
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl glass hover:scale-105 transition-all duration-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-var(--text-primary)" />
          </button>
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {/* <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div> */}
          </div>
          
          <div className="flex flex-1 gap-x-4 self-stretch">
            <div className="flex flex-1"></div>
            
            {/* Page Title - Centered */}
            <div className="flex items-center justify-center flex-1">
              <h1 className="text-xl font-bold text-var(--text-primary)">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
            
            <div className="flex flex-1"></div>
            
            <div className="flex items-center gap-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Real-time Clock */}
              <div className="flex items-center space-x-2 glass px-3 py-2 rounded-xl">
                <Clock className="h-4 w-4 text-var(--text-secondary)" />
                <div className="text-sm font-medium text-var(--text-primary)">
                  <div>{currentTime.toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}</div>
                  <div className="text-xs text-var(--text-muted)">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            
              
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col sidebar-with-animation animate-slide-in-left">
          {/* Grid Effect Animation */}
          <div className="sidebar-grid-effect">
            {Array.from({ length: 100 }, (_, i) => (
              <div key={i} className="sidebar-grid-tile"></div>
            ))}
          </div>
          <div className="flex flex-col flex-grow sidebar">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Volume2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-lg font-bold gradient-text">Admin Panel</p>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl glass hover:scale-105 transition-all duration-300"
              >
                <X className="h-5 w-5 text-var(--text-primary)" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-2 px-4 py-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-var(--bg-tertiary)'}`}>
                      <item.icon 
                        className={`h-5 w-5 ${isActive ? 'text-white' : 'text-var(--text-secondary)'}`} 
                      />
                    </div>
                    <span className="ml-3 font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                )
              })}
            </nav>
            
            <div className="border-t border-var(--border) p-4">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-var(--text-primary)">{user?.name}</p>
                  <p className="text-xs text-var(--text-muted)">{user?.role || 'Administrator'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-semibold text-var(--error) hover:bg-var(--error)/10 rounded-xl transition-all duration-300"
              >
                <div className="p-2 rounded-lg bg-var(--error)/10">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="ml-3">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Page content */}
        <main className="py-6 px-6 animate-fade-in">
          <div className="w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 