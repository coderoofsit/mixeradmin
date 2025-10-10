import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import { 
  Users, 
  Calendar, 
  Activity,
  Eye,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Heart,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import StatsCard from '../components/StatsCard'
import LoadingSpinner from '../components/LoadingSpinner'

interface DashboardStats {
  totalUsers: {
    count: number
    growth: number
  }
  activeUsers: {
    count: number
    growth: number
  }
  totalMatches: {
    count: number
    growth: number
  }
  blindDateApplications: {
    count: number
    growth: number
  }
  upcomingEvents: {
    count: number
    growth: number
  }
  reports: {
    count: number
    growth: number
  }
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await adminApi.getDashboardStats()
      setStats(response.data.data)
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error)
      // Fallback to placeholder data
      const mockStats: DashboardStats = {
        totalUsers: {
          count: 1250,
          growth: 12.5
        },
        activeUsers: {
          count: 1180,
          growth: 8.2
        },
        totalMatches: {
          count: 456,
          growth: 15.7
        },
        blindDateApplications: {
          count: 89,
          growth: 23.4
        },
        upcomingEvents: {
          count: 45,
          growth: -5.2
        },
        reports: {
          count: 12,
          growth: 0
        }
      }
      setStats(mockStats)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="md" className="mb-4" />
          {/* <p className="text-gray-600 font-medium">Loading dashboard...</p> */}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load dashboard statistics.</p>
      </div>
    )
  }


  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 flex items-center justify-center shadow-lg">
            <img
              src="/assets/logos/Mixer Logo/Primary Logo/Primary Logo.png"
              alt="Mixer Logo"
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
            Mixer Admin Dashboard
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Comprehensive overview of your platform statistics and recent activity</p>
        <div className="flex items-center justify-center mt-6">
          <button className="btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="stats-card-blue group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers?.count ? stats.totalUsers.count.toLocaleString() : 'NaN'}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${stats.totalUsers?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalUsers?.growth >= 0 ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
              <span className="text-sm font-semibold">
                {stats.totalUsers?.growth !== undefined ? `${Math.abs(stats.totalUsers.growth)}%` : 'NaN'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="stats-card-green group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeUsers?.count ? stats.activeUsers.count.toLocaleString() : 'NaN'}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${stats.activeUsers?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.activeUsers?.growth >= 0 ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
              <span className="text-sm font-semibold">
                {stats.activeUsers?.growth !== undefined ? `${Math.abs(stats.activeUsers.growth)}%` : 'NaN'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="stats-card-purple group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Total Matches</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalMatches?.count ? stats.totalMatches.count.toLocaleString() : 'NaN'}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${stats.totalMatches?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalMatches?.growth >= 0 ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
              <span className="text-sm font-semibold">
                {stats.totalMatches?.growth !== undefined ? `${Math.abs(stats.totalMatches.growth)}%` : 'NaN'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="stats-card-orange group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Blind Date Applications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.blindDateApplications?.count ? stats.blindDateApplications.count.toLocaleString() : 'NaN'}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${stats.blindDateApplications?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.blindDateApplications?.growth >= 0 ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
              <span className="text-sm font-semibold">
                {stats.blindDateApplications?.growth !== undefined ? `${Math.abs(stats.blindDateApplications.growth)}%` : 'NaN'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="stats-card-indigo group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Calendar className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.upcomingEvents?.count ? stats.upcomingEvents.count.toLocaleString() : 'NaN'}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${stats.upcomingEvents?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.upcomingEvents?.growth >= 0 ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
              <span className="text-sm font-semibold">
                {stats.upcomingEvents?.growth !== undefined ? `${Math.abs(stats.upcomingEvents.growth)}%` : 'NaN'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="stats-card-red group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Eye className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Reports</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.reports?.count ? stats.reports.count.toLocaleString() : 'NaN'}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${stats.reports?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.reports?.growth >= 0 ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
              <span className="text-sm font-semibold">
                {stats.reports?.growth !== undefined ? `${Math.abs(stats.reports.growth)}%` : 'NaN'}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Dashboard

