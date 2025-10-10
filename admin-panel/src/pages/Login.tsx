import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { BarChart3, Eye, EyeOff, Lock, Mail, User, Shield, Sparkles, Users, Calendar, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingOverlay from '../components/LoadingOverlay'

const Login = () => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('Login successful! Welcome back.')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-100">
	      <LoadingOverlay isVisible={loading} />
      
      <div className="flex min-h-screen">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Logo and Header */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center  bg-transparent border-none">
                <img
                  src="/assets/logos/Mixer Logo/Primary Logo/newLogo.png"
                  alt="Mixer Logo"
                  className="h-16 w-auto bg-transparent border-none"
                />
              </div>
              <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
                Admin
              </h2>
              <p className="mt-2 text-lg text-var(--text-secondary)">
                Welcome back! Sign in to access the admin dashboard
              </p>
            </div>

            {/* Login Form */}
            <div className="glass-card">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-var(--text-muted)" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="form-input pl-12"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-var(--text-muted)" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="form-input pl-12 pr-12"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-var(--text-muted)" />
                        ) : (
                          <Eye className="h-5 w-5 text-var(--text-muted)" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>


                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary btn-lg"
                  >
                    Sign in to Dashboard
                  </button>
                </div>
              </form>
            </div>

            {/* Demo Credentials */}
            <div className="text-center">
              <p className="text-xs text-var(--text-muted)">
                Enter your admin credentials to access the dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Features Preview (Hidden on small screens) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-600 to-gray-700 items-center justify-center px-12">
          <div className="max-w-lg text-white">
            <div className="text-center mb-12">
              <div className="mx-auto h-20 w-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">AdminHub</h2>
              <p className="text-xl text-blue-100">
                Complete platform administration and management
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-blue-100">
                    Comprehensive user oversight, verification, and account management tools
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Event Oversight</h3>
                  <p className="text-blue-100">
                    Monitor and manage all platform events, approvals, and content moderation
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Platform Control</h3>
                  <p className="text-blue-100">
                    Advanced analytics, system configuration, and security management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 