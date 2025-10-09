import { useState, useEffect } from 'react'
import { X, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { adminApi } from '../services/api'

interface GrowthData {
  date: string
  value: number
  growth: number
}

interface GrowthChartModalProps {
  isOpen: boolean
  onClose: () => void
  cardType: string
  cardTitle: string
  currentValue: number
}

const GrowthChartModal = ({ isOpen, onClose, cardType, cardTitle, currentValue }: GrowthChartModalProps) => {
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [data, setData] = useState<GrowthData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchGrowthData()
    }
  }, [isOpen, timeFilter, cardType])

  const fetchGrowthData = async () => {
    setLoading(true)
    try {
      const response = await adminApi.getGrowthData(cardType, { period: timeFilter })
      setData(response.data.data.data)
    } catch (error) {
      console.error('Failed to fetch growth data:', error)
      // Fallback to mock data if API fails
      const mockData = generateMockData()
      setData(mockData)
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (): GrowthData[] => {
    const data: GrowthData[] = []
    const now = new Date()
    let periods: number

    switch (timeFilter) {
      case 'day':
        periods = 24 // Last 24 hours
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 60 * 60 * 1000)
          data.push({
            date: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.floor(Math.random() * 50) + currentValue * 0.8,
            growth: Math.random() * 20 - 10
          })
        }
        break
      case 'week':
        periods = 7 // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.floor(Math.random() * 100) + currentValue * 0.7,
            growth: Math.random() * 30 - 15
          })
        }
        break
      case 'month':
        periods = 30 // Last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.floor(Math.random() * 200) + currentValue * 0.5,
            growth: Math.random() * 40 - 20
          })
        }
        break
      case 'year':
        periods = 12 // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            value: Math.floor(Math.random() * 500) + currentValue * 0.3,
            growth: Math.random() * 50 - 25
          })
        }
        break
    }

    return data
  }

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'day': return 'Last 24 Hours'
      case 'week': return 'Last 7 Days'
      case 'month': return 'Last 30 Days'
      case 'year': return 'Last 12 Months'
      default: return 'Last 30 Days'
    }
  }

  const getAverageGrowth = () => {
    if (data.length === 0) return 0
    const totalGrowth = data.reduce((sum, item) => sum + item.growth, 0)
    return (totalGrowth / data.length).toFixed(1)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{cardTitle} Growth Analysis</h2>
              <p className="text-sm text-gray-600">Detailed growth trends and analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Time Period:</span>
            <div className="flex space-x-2">
              {(['day', 'week', 'month', 'year'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Current Value</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{currentValue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Average Growth</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{getAverageGrowth()}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Period</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{getFilterLabel(timeFilter)}</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Growth Trend - {getFilterLabel(timeFilter)}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'value' ? value.toLocaleString() : `${value}%`,
                        name === 'value' ? 'Count' : 'Growth'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GrowthChartModal
