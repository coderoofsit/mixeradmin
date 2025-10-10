import { useState, useEffect, createContext, useContext } from 'react'
import { adminApi } from '../services/api'
 
interface Admin {
  _id: string
  firebaseUid: string
  email: string
  name: string
  role: 'super_admin' | 'admin'
  permissions: {
    users: { view: boolean; create: boolean; update: boolean; delete: boolean; verify: boolean }
    organizers: { view: boolean; create: boolean; update: boolean; delete: boolean; verify: boolean }
    events: { view: boolean; create: boolean; update: boolean; delete: boolean; verify: boolean }
    stats: { view: boolean }
    system: { view: boolean; manage: boolean }
    admins: { view: boolean; create: boolean; update: boolean; delete: boolean }
  }
  isActive: boolean
  lastLogin: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('adminToken')
    if (token) {
      // Try to fetch admin profile from backend
      adminApi.getProfile()
        .then(response => {
          if (response.data.success) {
            setUser(response.data.data)
          } else {
            // If profile fetch fails, clear token
            localStorage.removeItem('adminToken')
            setUser(null)
          }
        })
        .catch(error => {
          console.error('Failed to fetch admin profile:', error)
          // If profile fetch fails, clear token
          localStorage.removeItem('adminToken')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email)
      // Try to get admin data from backend
      const response = await adminApi.login(email, password)
      
      if (response.data.success) {
        const adminData = response.data.data
        console.log('Login successful, admin data:', adminData)
        
        // Store JWT token
        if (adminData.token) {
          localStorage.setItem('adminToken', adminData.token)
        } else {
          console.error('No token received from backend')
          throw new Error('No authentication token received')
        }
        
        setUser(adminData)
      } else {
        console.log('Login failed - backend returned success: false')
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      // Let the login form handle the error
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
} 
