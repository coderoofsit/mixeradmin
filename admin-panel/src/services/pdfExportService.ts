// import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas'

// interface DashboardStats {
//   totalUsers: {
//     count: number
//     growth: number
//   }
//   activeUsers: {
//     count: number
//     growth: number
//   }
//   totalMatches: {
//     count: number
//     growth: number
//   }
//   blindDateApplications: {
//     count: number
//     growth: number
//   }
//   upcomingEvents: {
//     count: number
//     growth: number
//   }
//   reports: {
//     count: number
//     growth: number
//   }
// }

// export class PDFExportService {
//   private doc: jsPDF
//   private pageWidth: number
//   private pageHeight: number
//   private margin: number

//   constructor() {
//     this.doc = new jsPDF('p', 'mm', 'a4')
//     this.pageWidth = this.doc.internal.pageSize.getWidth()
//     this.pageHeight = this.doc.internal.pageSize.getHeight()
//     this.margin = 20
//   }

//   async exportDashboardReport(stats: DashboardStats, dashboardElement?: HTMLElement): Promise<void> {
//     // Add simple one-page dashboard report
//     this.addSimpleDashboardPage(stats)
    
//     // Add footer
//     this.addFooter()
    
//     // Save the PDF
//     this.doc.save(`Mixer-Dashboard-${new Date().toISOString().split('T')[0]}.pdf`)
//   }

//   async exportDetailedReport(reportData: any, period: string): Promise<void> {
//     // Add cover page
//     this.addCoverPage()
    
//     // Add one page for each stats card with real trend data
//     await this.addDetailedStatsCardPages(reportData, period)
    
//     // Add footer
//     this.addFooter()
    
//     // Save the PDF
//     this.doc.save(`Mixer-Analytics-${period}-${new Date().toISOString().split('T')[0]}.pdf`)
//   }

//   private addSimpleDashboardPage(stats: DashboardStats): void {
//     // Clean header
//     this.doc.setFontSize(20)
//     this.doc.setTextColor(0, 0, 0)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text('Mixer Platform Dashboard', this.margin, 30)
    
//     // Date
//     this.doc.setFontSize(10)
//     this.doc.setFont('helvetica', 'normal')
//     this.doc.setTextColor(100, 100, 100)
//     this.doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })}`, this.margin, 40)
    
//     // Simple table layout
//     const startY = 60
//     const rowHeight = 25
//     const col1Width = 120
//     const col2Width = 80
//     const col3Width = 60
    
//     // Table header
//     this.doc.setFillColor(240, 240, 240)
//     this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, rowHeight, 'F')
    
//     this.doc.setFontSize(12)
//     this.doc.setTextColor(0, 0, 0)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text('Metric', this.margin + 5, startY + 15)
//     this.doc.text('Count', this.margin + col1Width + 5, startY + 15)
//     this.doc.text('Growth', this.margin + col1Width + col2Width + 5, startY + 15)
    
//     // Table data
//     const metrics = [
//       { name: 'Total Users', value: stats.totalUsers?.count || 0, growth: stats.totalUsers?.growth || 0 },
//       { name: 'Active Users', value: stats.activeUsers?.count || 0, growth: stats.activeUsers?.growth || 0 },
//       { name: 'Total Matches', value: stats.totalMatches?.count || 0, growth: stats.totalMatches?.growth || 0 },
//       { name: 'Blind Date Applications', value: stats.blindDateApplications?.count || 0, growth: stats.blindDateApplications?.growth || 0 },
//       { name: 'Upcoming Events', value: stats.upcomingEvents?.count || 0, growth: stats.upcomingEvents?.growth || 0 },
//       { name: 'User Reports', value: stats.reports?.count || 0, growth: stats.reports?.growth || 0 }
//     ]
    
//     metrics.forEach((metric, index) => {
//       const y = startY + (index + 1) * rowHeight
//       const isEven = index % 2 === 0
      

//       // Row background
//       this.doc.setFillColor(isEven ? 255, 255, 255 : 248, 250, 252)
//       this.doc.rect(this.margin, y, this.pageWidth - 2 * this.margin, rowHeight, 'F')
      
//       // Metric name
//       this.doc.setFontSize(11)
//       this.doc.setTextColor(0, 0, 0)
//       this.doc.setFont('helvetica', 'normal')
//       this.doc.text(metric.name, this.margin + 5, y + 15)
      
//       // Count
//       this.doc.setFont('helvetica', 'bold')
//       this.doc.text(metric.value.toLocaleString(), this.margin + col1Width + 5, y + 15)
      
//       // Growth
//       const growthColor = metric.growth >= 0 ? [34, 197, 94] : [239, 68, 68]
//       this.doc.setTextColor(growthColor[0], growthColor[1], growthColor[2])
//       this.doc.text(`${metric.growth >= 0 ? '+' : ''}${metric.growth.toFixed(1)}%`, this.margin + col1Width + col2Width + 5, y + 15)
//     })
    
//     // Summary box
//     const summaryY = startY + (metrics.length + 1) * rowHeight + 20
//     this.doc.setFillColor(240, 248, 255)
//     this.doc.roundedRect(this.margin, summaryY, this.pageWidth - 2 * this.margin, 50, 3, 3, 'F')
    
//     this.doc.setFontSize(14)
//     this.doc.setTextColor(0, 0, 0)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text('Summary', this.margin + 10, summaryY + 15)
    
//     this.doc.setFontSize(11)
//     this.doc.setFont('helvetica', 'normal')
//     this.doc.setTextColor(50, 50, 50)
    
//     const totalUsers = stats.totalUsers?.count || 0
//     const totalMatches = stats.totalMatches?.count || 0
//     const matchRate = totalUsers > 0 ? ((totalMatches / totalUsers) * 100).toFixed(1) : '0'
//     const activeUsers = stats.activeUsers?.count || 0
//     const upcomingEvents = stats.upcomingEvents?.count || 0
    
//     this.doc.text(`• Total Users: ${totalUsers.toLocaleString()} (${activeUsers.toLocaleString()} active)`, this.margin + 10, summaryY + 25)
//     this.doc.text(`• Match Rate: ${matchRate}% (${totalMatches.toLocaleString()} matches)`, this.margin + 10, summaryY + 35)
//     this.doc.text(`• Upcoming Events: ${upcomingEvents.toLocaleString()}`, this.margin + 10, summaryY + 45)
//   }

//   private addCoverPage(): void {
//     // Background gradient effect
//     this.doc.setFillColor(99, 102, 241) // Indigo
//     this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F')
    
//     // Title
//     this.doc.setFontSize(32)
//     this.doc.setTextColor(255, 255, 255)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text('Mixer Dashboard', this.pageWidth / 2, 80, { align: 'center' })
    
//     // Subtitle
//     this.doc.setFontSize(18)
//     this.doc.setFont('helvetica', 'normal')
//     this.doc.text('Comprehensive Analytics Report', this.pageWidth / 2, 100, { align: 'center' })
    
//     // Date
//     this.doc.setFontSize(14)
//     this.doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'long', 
//       day: 'numeric' 
//     })}`, this.pageWidth / 2, 120, { align: 'center' })
    
//     // Logo placeholder
//     this.doc.setFillColor(255, 255, 255)
//     this.doc.circle(this.pageWidth / 2, 150, 30, 'F')
//     this.doc.setFontSize(24)
//     this.doc.setTextColor(99, 102, 241)
//     this.doc.text('M', this.pageWidth / 2, 155, { align: 'center' })
    
//     // Footer
//     this.doc.setFontSize(12)
//     this.doc.setTextColor(255, 255, 255)
//     this.doc.text('Event Dating Platform - Admin Panel', this.pageWidth / 2, this.pageHeight - 30, { align: 'center' })
//   }

//   private async addStatsCardPages(stats: DashboardStats): Promise<void> {
//     const cards = [
//       {
//         title: 'Total Users',
//         value: stats.totalUsers.count,
//         growth: stats.totalUsers.growth,
//         color: [59, 130, 246],
//         description: 'Total registered users on the platform'
//       },
//       {
//         title: 'Active Users',
//         value: stats.activeUsers.count,
//         growth: stats.activeUsers.growth,
//         color: [34, 197, 94],
//         description: 'Users active in the last 30 days'
//       },
//       {
//         title: 'Total Matches',
//         value: stats.totalMatches.count,
//         growth: stats.totalMatches.growth,
//         color: [147, 51, 234],
//         description: 'Total matches created on the platform'
//       },
//       {
//         title: 'Blind Date Applications',
//         value: stats.blindDateApplications.count,
//         growth: stats.blindDateApplications.growth,
//         color: [249, 115, 22],
//         description: 'Applications for blind date events'
//       },
//       {
//         title: 'Upcoming Events',
//         value: stats.upcomingEvents.count,
//         growth: stats.upcomingEvents.growth,
//         color: [99, 102, 241],
//         description: 'Events scheduled for the future'
//       },
//       {
//         title: 'Reports',
//         value: stats.reports.count,
//         growth: stats.reports.growth,
//         color: [239, 68, 68],
//         description: 'User reports submitted'
//       }
//     ]

//     for (const card of cards) {
//       this.doc.addPage()
//       this.addStatsCardPage(card)
//     }
//   }

//   private async addDetailedStatsCardPages(reportData: any, period: string): Promise<void> {
//     const cards = [
//       {
//         title: 'Total Users',
//         value: reportData.totalUsers.count,
//         growth: reportData.totalUsers.growth,
//         color: [59, 130, 246],
//         description: 'Total registered users on the platform',
//         trend: reportData.totalUsers.trend
//       },
//       {
//         title: 'Active Users',
//         value: reportData.activeUsers.count,
//         growth: reportData.activeUsers.growth,
//         color: [34, 197, 94],
//         description: 'Users active in the selected period',
//         trend: reportData.activeUsers.trend
//       },
//       {
//         title: 'Total Matches',
//         value: reportData.totalMatches.count,
//         growth: reportData.totalMatches.growth,
//         color: [147, 51, 234],
//         description: 'Total matches created on the platform',
//         trend: reportData.totalMatches.trend
//       },
//       {
//         title: 'Blind Date Applications',
//         value: reportData.blindDateApplications.count,
//         growth: reportData.blindDateApplications.growth,
//         color: [249, 115, 22],
//         description: 'Applications for blind date events',
//         trend: reportData.blindDateApplications.trend
//       },
//       {
//         title: 'Upcoming Events',
//         value: reportData.upcomingEvents.count,
//         growth: reportData.upcomingEvents.growth,
//         color: [99, 102, 241],
//         description: 'Events scheduled for the future',
//         trend: reportData.upcomingEvents.trend
//       },
//       {
//         title: 'Reports',
//         value: reportData.reports.count,
//         growth: reportData.reports.growth,
//         color: [239, 68, 68],
//         description: 'User reports submitted',
//         trend: reportData.reports.trend
//       }
//     ]

//     for (const card of cards) {
//       this.doc.addPage()
//       this.addDetailedStatsCardPage(card, period)
//     }
//   }

//   private addDetailedStatsCardPage(card: any, period: string): void {
//     // Header with card title
//     this.doc.setFillColor(card.color[0], card.color[1], card.color[2])
//     this.doc.roundedRect(this.margin, 30, this.pageWidth - 2 * this.margin, 20, 5, 5, 'F')
    
//     this.doc.setFontSize(18)
//     this.doc.setTextColor(255, 255, 255)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text(card.title, this.margin + 10, 45)
    
//     // Description
//     this.doc.setFontSize(12)
//     this.doc.setFont('helvetica', 'normal')
//     this.doc.text(card.description, this.margin + 10, 55)
    
//     // Main stats box
//     this.doc.setFillColor(248, 250, 252)
//     this.doc.roundedRect(this.margin, 70, this.pageWidth - 2 * this.margin, 60, 5, 5, 'F')
    
//     // Current value
//     this.doc.setFontSize(36)
//     this.doc.setTextColor(0, 0, 0)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text(card.value.toLocaleString(), this.margin + 20, 100)
    
//     // Growth indicator
//     const growthColor = card.growth >= 0 ? [34, 197, 94] : [239, 68, 68]
//     this.doc.setFontSize(16)
//     this.doc.setTextColor(growthColor[0], growthColor[1], growthColor[2])
//     this.doc.text(`${card.growth >= 0 ? '+' : ''}${card.growth.toFixed(1)}%`, this.pageWidth - 60, 100)
    
//     // Growth label
//     this.doc.setFontSize(12)
//     this.doc.setTextColor(100, 100, 100)
//     this.doc.text('Growth', this.pageWidth - 60, 110)
    
//     // Real trend chart
//     this.doc.setFillColor(255, 255, 255)
//     this.doc.roundedRect(this.margin, 150, this.pageWidth - 2 * this.margin, 100, 5, 5, 'F')
    
//     this.doc.setFontSize(14)
//     this.doc.setTextColor(0, 0, 0)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text(`Growth Trend - ${period.toUpperCase()}`, this.margin + 10, 170)
    
//     // Draw real trend line based on actual data
//     if (card.trend && card.trend.length > 0) {
//       this.doc.setDrawColor(card.color[0], card.color[1], card.color[2])
//       this.doc.setLineWidth(3)
      
//       const chartStartX = this.margin + 20
//       const chartStartY = 200
//       const chartWidth = this.pageWidth - 2 * this.margin - 40
//       const chartHeight = 30
      
//       // Find min and max values for scaling
//       const values = card.trend.map(point => point.value)
//       const minValue = Math.min(...values)
//       const maxValue = Math.max(...values)
//       const valueRange = maxValue - minValue || 1
      
//       // Draw trend line based on real data
//       for (let i = 0; i < card.trend.length - 1; i++) {
//         const x1 = chartStartX + (i * chartWidth / (card.trend.length - 1))
//         const y1 = chartStartY + chartHeight - ((card.trend[i].value - minValue) / valueRange) * chartHeight
//         const x2 = chartStartX + ((i + 1) * chartWidth / (card.trend.length - 1))
//         const y2 = chartStartY + chartHeight - ((card.trend[i + 1].value - minValue) / valueRange) * chartHeight
        
//         this.doc.line(x1, y1, x2, y2)
//       }
      
//       // Add data points
//       this.doc.setFillColor(card.color[0], card.color[1], card.color[2])
//       for (let i = 0; i < card.trend.length; i++) {
//         const x = chartStartX + (i * chartWidth / (card.trend.length - 1))
//         const y = chartStartY + chartHeight - ((card.trend[i].value - minValue) / valueRange) * chartHeight
//         this.doc.circle(x, y, 2, 'F')
//       }
//     } else {
//       // Fallback to simple line if no trend data
//       this.doc.setDrawColor(card.color[0], card.color[1], card.color[2])
//       this.doc.setLineWidth(3)
      
//       const chartStartX = this.margin + 20
//       const chartStartY = 200
//       const chartWidth = this.pageWidth - 2 * this.margin - 40
//       const chartHeight = 30
      
//       // Draw a simple trend line
//       const points = 10
//       for (let i = 0; i < points - 1; i++) {
//         const x1 = chartStartX + (i * chartWidth / (points - 1))
//         const y1 = chartStartY + Math.random() * chartHeight
//         const x2 = chartStartX + ((i + 1) * chartWidth / (points - 1))
//         const y2 = chartStartY + Math.random() * chartHeight
        
//         this.doc.line(x1, y1, x2, y2)
//       }
//     }
    
//     // Chart labels
//     this.doc.setFontSize(10)
//     this.doc.setTextColor(100, 100, 100)
//     this.doc.text('Time', this.margin + 20, chartStartY + chartHeight + 10)
//     this.doc.text('Value', this.margin + 10, chartStartY - 5)
//   }

//   private addStatsCardPage(card: any): void {
//     // Header with card title
//     this.doc.setFillColor(card.color[0], card.color[1], card.color[2])
//     this.doc.roundedRect(this.margin, 30, this.pageWidth - 2 * this.margin, 20, 5, 5, 'F')
    
//     this.doc.setFontSize(18)
//     this.doc.setTextColor(255, 255, 255)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text(card.title, this.margin + 10, 45)
    
//     // Description
//     this.doc.setFontSize(12)
//     this.doc.setFont('helvetica', 'normal')
//     this.doc.text(card.description, this.margin + 10, 55)
    
//     // Main stats box
//     this.doc.setFillColor(248, 250, 252)
//     this.doc.roundedRect(this.margin, 70, this.pageWidth - 2 * this.margin, 60, 5, 5, 'F')
    
//     // Current value
//     this.doc.setFontSize(36)
//     this.doc.setTextColor(0, 0, 0)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text(card.value.toLocaleString(), this.margin + 20, 100)
    
//     // Growth indicator
//     const growthColor = card.growth >= 0 ? [34, 197, 94] : [239, 68, 68]
//     this.doc.setFontSize(16)
//     this.doc.setTextColor(growthColor[0], growthColor[1], growthColor[2])
//     this.doc.text(`${card.growth >= 0 ? '+' : ''}${card.growth.toFixed(1)}%`, this.pageWidth - 60, 100)
    
//     // Growth label
//     this.doc.setFontSize(12)
//     this.doc.setTextColor(100, 100, 100)
//     this.doc.text('Growth', this.pageWidth - 60, 110)
    
//     // Simple chart area (placeholder for now)
//     this.doc.setFillColor(255, 255, 255)
//     this.doc.roundedRect(this.margin, 150, this.pageWidth - 2 * this.margin, 100, 5, 5, 'F')
    
//     this.doc.setFontSize(14)
//     this.doc.setTextColor(0, 0, 0)
//     this.doc.setFont('helvetica', 'bold')
//     this.doc.text('Growth Trend', this.margin + 10, 170)
    
//     // Simple line chart representation
//     this.doc.setDrawColor(card.color[0], card.color[1], card.color[2])
//     this.doc.setLineWidth(3)
    
//     const chartStartX = this.margin + 20
//     const chartStartY = 200
//     const chartWidth = this.pageWidth - 2 * this.margin - 40
//     const chartHeight = 30
    
//     // Draw a simple trend line
//     const points = 10
//     for (let i = 0; i < points - 1; i++) {
//       const x1 = chartStartX + (i * chartWidth / (points - 1))
//       const y1 = chartStartY + Math.random() * chartHeight
//       const x2 = chartStartX + ((i + 1) * chartWidth / (points - 1))
//       const y2 = chartStartY + Math.random() * chartHeight
      
//       this.doc.line(x1, y1, x2, y2)
//     }
    
//     // Chart labels
//     this.doc.setFontSize(10)
//     this.doc.setTextColor(100, 100, 100)
//     this.doc.text('Time', chartStartX, chartStartY + chartHeight + 10)
//     this.doc.text('Value', chartStartX - 10, chartStartY - 5)
//   }

//   private addFooter(): void {
//     const pageCount = this.doc.getNumberOfPages()
    
//     for (let i = 1; i <= pageCount; i++) {
//       this.doc.setPage(i)
      
//       // Footer line
//       this.doc.setDrawColor(200, 200, 200)
//       this.doc.setLineWidth(0.5)
//       this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20)
      
//       // Page number
//       this.doc.setFontSize(10)
//       this.doc.setTextColor(100, 100, 100)
//       this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - 30, this.pageHeight - 10)
      
//       // Company info
//       this.doc.text('Mixer Platform - Admin Dashboard', this.margin, this.pageHeight - 10)
//     }
//   }
// }

// export default PDFExportService
