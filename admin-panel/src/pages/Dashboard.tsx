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
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar as CalendarIcon,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import { mapGenderForDisplay } from '../utils/genderUtils'
import StatsCard from '../components/StatsCard'
import LoadingSpinner from '../components/LoadingSpinner'
import LoadingOverlay from '../components/LoadingOverlay'
import GrowthChartModal from '../components/GrowthChartModal'
import PurchasePieChart from '../components/PurchasePieChart'
import RevenueChart from '../components/RevenueChart'
import { calculateRevenue, formatCurrency } from '../config/pricing'

interface TrendPoint { date: string; value: number }

interface DashboardStats {
  totalUsers?: { count: number; growth?: number; trend?: TrendPoint[] }
  activeUsers?: { count: number; growth?: number; trend?: TrendPoint[] }
  totalMatches?: { count: number; growth?: number; trend?: TrendPoint[] }
  totalEvents?: { count: number; growth?: number; trend?: TrendPoint[] }
  upcomingEvents?: { count: number; growth?: number; trend?: TrendPoint[] }
  totalReports?: { count: number; growth?: number; trend?: TrendPoint[] }
  reports?: { count: number; growth?: number; trend?: TrendPoint[] }
  blindDateApplications?: { count: number; growth?: number; trend?: TrendPoint[] }
  genderDistribution?: Array<{ gender: string; count: number; percentage: number }>
  ageDistribution?: Array<{ range: string; count: number; percentage: number }>
  userGrowthTrends?: Array<{ period: string; count: number }>
  matchSuccessRate?: number
  engagementMetrics?: {
    avgProfileCompleteness?: number
    usersWithPhotos?: number
    usersWithBio?: number
    photoPercentage?: number
    bioPercentage?: number
  }
  eventAttendanceTrends?: Array<{ period: string; eventCount: number; totalCapacity: number }>
  subscriptionDistribution?: Array<{ plan: string; count: number; percentage: number }>
  backgroundCheckDistribution?: Array<{ plan: string; count: number; percentage: number }>
  totalSubscriptionPurchases?: number
  totalBackgroundCheckPurchases?: number
  generatedAt?: string
  period?: string
  dateRange?: { start?: string; end?: string }
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<{
    type: string
    title: string
    value: number
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getAnalytics()
      console.log('📊 Dashboard API Response:', response.data.data)
      
      if (response.data.success && response.data.data) {
      setStats(response.data.data)
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error)
      toast.error('Failed to load dashboard statistics. Please try again.')
      // Don't set fallback data - let the user retry
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
        <AlertCircle className="mx-auto h-12 w-12 text-var(--text-muted)" />
        <h3 className="mt-2 text-sm font-medium text-var(--text-primary)">No data available</h3>
        <p className="mt-1 text-sm text-var(--text-muted)">Unable to load dashboard statistics.</p>
      </div>
    )
  }

  // Debug logging for problematic cards
  console.log('🔍 Reports Data:', stats.reports)

  const handleCardClick = (type: string, title: string, value: number) => {
    setSelectedCard({ type, title, value })
    // setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedCard(null)
  }

  const handleRefresh = async () => {
    if (isRefreshing) return
    
    try {
      setIsRefreshing(true)
      await fetchDashboardStats()
      toast.success('Dashboard refreshed successfully!')
    } catch (error) {
      console.error('Refresh error:', error)
      toast.error('Failed to refresh dashboard')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Show error state if no stats are loaded
  if (!loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-var(--text-primary) mb-2">Failed to Load Dashboard</h2>
          <p className="text-var(--text-secondary) mb-4">Unable to load dashboard statistics. Please check your connection and try again.</p>
          <button 
            onClick={fetchDashboardStats}
            className="btn btn-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-content">
			<LoadingOverlay isVisible={isRefreshing} />
      {/* Modern Header */}
      <div className="glass-card">
        <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        </div>
          <p className="text-var(--text-secondary) text-lg mb-6">Comprehensive overview of your platform statistics and recent activity</p>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`btn btn-primary hover-lift ${
              isRefreshing 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="stats-card group cursor-pointer hover-lift"
          onClick={() => handleCardClick('totalUsers', 'Total Users', stats.totalUsers?.count || 0)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-var(--text-secondary) mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-var(--text-primary) mb-2">
                {stats.totalUsers?.count ? stats.totalUsers.count.toLocaleString() : '0'}
              </p>
            <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  stats.totalUsers?.growth !== undefined && stats.totalUsers.growth >= 0 
                    ? 'text-var(--success)' 
                    : 'text-var(--error)'
                }`}>
                  {stats.totalUsers?.growth !== undefined 
                    ? `${stats.totalUsers.growth >= 0 ? '+' : ''}${stats.totalUsers.growth.toFixed(1)}%` 
                    : '0%'
                  } from last 30 days
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div 
          className="stats-card group cursor-pointer hover-lift"
          onClick={() => handleCardClick('activeUsers', 'Active Users', stats.activeUsers?.count || 0)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-var(--text-secondary) mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-var(--text-primary) mb-2">
                {stats.activeUsers?.count ? stats.activeUsers.count.toLocaleString() : '0'}
              </p>
            <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  stats.activeUsers?.growth !== undefined && stats.activeUsers.growth >= 0 
                    ? 'text-var(--success)' 
                    : 'text-var(--error)'
                }`}>
                  {stats.activeUsers?.growth !== undefined 
                    ? `${stats.activeUsers.growth >= 0 ? '+' : ''}${stats.activeUsers.growth.toFixed(1)}%` 
                    : '0%'
                  } from last 30 days
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div 
          className="stats-card group cursor-pointer hover-lift"
          onClick={() => handleCardClick('totalEvents', 'Total Events', stats.totalEvents?.count || stats.upcomingEvents?.count || 0)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-var(--text-secondary) mb-2">Total Events</h3>
              <p className="text-3xl font-bold text-var(--text-primary) mb-2">
                {(stats.totalEvents?.count || stats.upcomingEvents?.count || 0).toLocaleString()}
              </p>
            <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  (stats.totalEvents?.growth !== undefined && stats.totalEvents.growth >= 0) || (stats.upcomingEvents?.growth !== undefined && stats.upcomingEvents.growth >= 0)
                    ? 'text-var(--success)' 
                    : 'text-var(--error)'
                }`}>
                  {stats.totalEvents?.growth !== undefined 
                    ? `${stats.totalEvents.growth >= 0 ? '+' : ''}${stats.totalEvents.growth.toFixed(1)}%` 
                    : stats.upcomingEvents?.growth !== undefined
                    ? `${stats.upcomingEvents.growth >= 0 ? '+' : ''}${stats.upcomingEvents.growth.toFixed(1)}%`
                    : '0%'
                  } from last 30 days
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-var(--accent) to-var(--primary) rounded-xl flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              </div>
            </div>
          </div>
        
        <div 
          className="stats-card group cursor-pointer hover-lift"
          onClick={() => handleCardClick('upcomingEvents', 'Upcoming Events', stats.upcomingEvents?.count || 0)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-var(--text-secondary) mb-2">Upcoming Events</h3>
              <p className="text-3xl font-bold text-var(--text-primary) mb-2">
                {stats.upcomingEvents?.count ? stats.upcomingEvents.count.toLocaleString() : '0'}
              </p>
            <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  stats.upcomingEvents?.growth !== undefined && stats.upcomingEvents.growth >= 0 
                    ? 'text-var(--success)' 
                    : 'text-var(--error)'
                }`}>
                  {stats.upcomingEvents?.growth !== undefined 
                    ? `${stats.upcomingEvents.growth > 0 ? '+' : ''}${stats.upcomingEvents.growth.toFixed(1)}%`
                    : '0%'
                  } from last 30 days
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-var(--warning) to-var(--accent) rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Sections */}
      <div className="mt-8">
     
        {/* Gender Distribution and Age Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-var(--text-primary) mb-4">
              Gender Distribution
            </h3>
            <div className="space-y-4">
              {stats?.genderDistribution && stats.genderDistribution.length > 0 ? stats.genderDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="capitalize text-var(--text-secondary)">{mapGenderForDisplay(item.gender)}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-var(--bg-tertiary) rounded-full h-4">
                      <div
                        className="h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: index === 0 ? 'var(--primary)' : 'var(--secondary)'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-var(--text-muted) w-12">{item.percentage}%</span>
                    <span className="text-sm font-medium text-var(--text-primary) w-8">{item.count}</span>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-var(--text-muted)">No gender distribution data available</div>
              )}
            </div>
          </div>
          
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-var(--text-primary) mb-4">
              Age Distribution
            </h3>
            <div className="space-y-4">
              {stats?.ageDistribution && stats.ageDistribution.length > 0 ? stats.ageDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="capitalize text-var(--text-secondary)">{item.range}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-var(--bg-tertiary) rounded-full h-4">
                      <div
                        className="h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: index === 0 ? 'var(--primary)' : 'var(--secondary)'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-var(--text-muted) w-12">{item.percentage}%</span>
                    <span className="text-sm font-medium text-var(--text-primary) w-8">{item.count}</span>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-var(--text-muted)">No age distribution data available</div>
              )}
            </div>
          </div>
        </div>

        {/* User Growth Trends - expanded to full width */}
        <div className="grid grid-cols-1 gap-6">
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-var(--text-primary) mb-4">
              User Growth Trends
            </h3>
            <div className="space-y-3">
              {stats?.userGrowthTrends && stats.userGrowthTrends.length > 0 ? (
                stats.userGrowthTrends.slice(-6).map((item, index) => {
                  const maxCount = Math.max(...stats.userGrowthTrends!.map(t => t.count), 1);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-var(--text-secondary)">{item.period}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-var(--bg-tertiary) rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((item.count / maxCount) * 100, 100)}%`,
                              backgroundColor: 'var(--primary)'
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-var(--text-primary) w-8">{item.count}</span>
              </div>
            </div>
                  )
                })
              ) : (
                <div className="text-sm text-var(--text-muted)">No user growth trend data available</div>
              )}
          </div>
        </div>
      </div>
        </div>
        
      {/* Purchase Statistics Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-var(--text-primary) mb-6">
          Purchase Statistics
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Plans Pie Chart */}
          <PurchasePieChart
            data={stats?.subscriptionDistribution || []}
            title="Subscription Plans"
            totalPurchases={stats?.totalSubscriptionPurchases || 0}
            colors={['#5D1152', '#7B1FA2', '#9C27B0', '#E1BEE7']}
          />
          
          {/* Background Check Purchases */}
          <PurchasePieChart
            data={stats?.backgroundCheckDistribution || []}
            title="Background Check Purchases"
            totalPurchases={stats?.totalBackgroundCheckPurchases || 0}
            colors={['#F59E0B', '#FBBF24', '#FCD34D']}
          />
        </div>

        {/* Revenue Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-var(--text-primary) mb-4">
              Subscription Revenue
            </h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-var(--success)">
                {formatCurrency(calculateRevenue(stats?.subscriptionDistribution || []))}
              </p>
              <p className="text-sm text-var(--text-muted) mt-2">
                From {stats?.totalSubscriptionPurchases || 0} subscriptions
              </p>
            </div>
          </div>
          
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-var(--text-primary) mb-4">
              Background Check Revenue
            </h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-var(--primary)">
                {formatCurrency(calculateRevenue(stats?.backgroundCheckDistribution || []))}
              </p>
              <p className="text-sm text-var(--text-muted) mt-2">
                From {stats?.totalBackgroundCheckPurchases || 0} purchases
              </p>
              </div>
            </div>
          
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-var(--text-primary) mb-4">
              Total Revenue
            </h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-var(--secondary)">
                {formatCurrency(
                  calculateRevenue(stats?.subscriptionDistribution || []) +
                  calculateRevenue(stats?.backgroundCheckDistribution || [])
                )}
              </p>
              <p className="text-sm text-var(--text-muted) mt-2">
                From all purchases
              </p>
              </div>
            </div>
          </div>
        </div>

      {/* Revenue Analytics Section */}
      <div className="mt-8">
        <RevenueChart 
          className="mb-6" 
          subscriptionDistribution={stats.subscriptionDistribution}
          backgroundCheckDistribution={stats.backgroundCheckDistribution}
        />
      </div>

      {/* Growth Chart Modal */}
      {selectedCard && (
        <GrowthChartModal
          isOpen={isModalOpen}
          onClose={closeModal}
          cardType={selectedCard.type}
          cardTitle={selectedCard.title}
          currentValue={selectedCard.value}
        />
      )}
    </div>
  )
}

export default Dashboard 

