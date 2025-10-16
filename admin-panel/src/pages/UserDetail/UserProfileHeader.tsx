// import { User } from 'lucide-react'

// interface UserProfileHeaderProps {
//   user: {
//     name?: string
//     email: string
//     accountStatus: 'active' | 'suspended' | 'banned'
//     age?: number
//     profileCompletion?: number
//     images?: Array<{
//       url: string
//       isPrimary: boolean
//       uploadedAt: string
//     }>
//   }
// }

// export default function UserProfileHeader({ user }: UserProfileHeaderProps) {
//   const getStatusBadgeClass = (status: string) => {
//     switch (status) {
//       case 'active':
//         return 'badge-success'
//       case 'suspended':
//         return 'badge-warning'
//       case 'banned':
//         return 'badge-danger'
//       default:
//         return 'badge-secondary'
//     }
//   }

//   return (
//     <div className="glass-card p-6">
//       <div className="flex items-start space-x-6">
//         {/* Profile Image */}
//         <div className="flex-shrink-0">
//           {user.images && user.images.length > 0 ? (
//             <img
//               src={user.images.find(img => img.isPrimary)?.url || user.images[0].url}
//               alt="Profile"
//               className="w-24 h-24 rounded-full object-cover border-2 border-var(--border)"
//             />
//           ) : (
//             <div className="w-24 h-24 rounded-full bg-var(--bg-tertiary) flex items-center justify-center border-2 border-var(--border)">
//               <User className="h-12 w-12 text-var(--text-muted)" />
//             </div>
//           )}
//         </div>
        
//         {/* User Info */}
//         <div className="flex-1">
//           <div className="flex items-center space-x-3 mb-2">
//             <h2 className="text-2xl font-bold text-var(--text-primary)">{user.name || ''}</h2>
//             <span className={`badge ${getStatusBadgeClass(user.accountStatus)}`}>
//               {user.accountStatus}
//             </span>
//           </div>
//           <p className="text-var(--text-muted) mb-4">{user.email}</p>
          
//           {/* Quick Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="text-center">
//               <p className="text-2xl font-bold text-var(--primary)">{user.age || ''}</p>
//               <p className="text-xs text-var(--text-muted)">Age</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-var(--secondary)">{user.profileCompletion || 0}%</p>
//               <p className="text-xs text-var(--text-muted)">Profile Complete</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-var(--success)">{user.images?.length || 0}</p>
//               <p className="text-xs text-var(--text-muted)">Photos</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


import { User } from 'lucide-react'

interface UserProfileHeaderProps {
  user: {
    email: string
    personalInfo: {
      name: string
      age: number
    }
    accountStatus: {
      accountStatus: 'active' | 'suspended' | 'banned'
      profileCompletion: number
    }
    profileContent: {
      images: Array<{
        url: string
        isPrimary: boolean
        uploadedAt: string
      }>
    }
  }
}

export default function UserProfileHeader({ user }: UserProfileHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'suspended':
        return 'text-yellow-600'
      case 'banned':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Generate a random color for the profile placeholder
  const getRandomColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ]
    // Use user name or email to generate consistent color for same user
    const name = user.personalInfo?.name || user.email || 'default'
    const hash = name.split('').reduce((a: number, b: string) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="relative">
      {/* Profile Image - Positioned outside the card */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3/4 z-10">
        {user.profileContent.images && user.profileContent.images.length > 0 ? (
          <img
            src={user.profileContent.images.find(img => img.isPrimary)?.url || user.profileContent.images[0].url}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
            <div className={`w-28 h-28 rounded-full ${getRandomColor()} flex items-center justify-center border-4 border-white shadow-lg`}>
              <User className="h-14 w-14 text-white" />
            </div>
        )}
      </div>

      <div className="glass-card pb-0 pt-6">
        <div className="grid grid-cols-5 gap-4 h-20">
          {/* Column 1 - Age */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-blue-600">{user.personalInfo.age || ''}</p>
            <p className="text-xs text-gray-500">Age</p>
          </div>

          {/* Column 2 - Profile Completion */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-green-600">{user.accountStatus.profileCompletion || 0}%</p>
            <p className="text-xs text-gray-500">Profile Complete</p>
          </div>
          
          {/* Column 3 - Center Column - Name, Email */}
          <div className="flex flex-col items-center justify-center space-y-1">
            {/* Name */}
            <h2 className="text-lg font-bold text-var(--text-primary) text-center">{user.personalInfo.name || ''}</h2>
            
            {/* Email */}
            <p className="text-sm text-var(--text-muted) text-center">{user.email}</p>
          </div>

          {/* Column 4 - Photos */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-purple-600">{user.profileContent.images?.length || 0}</p>
            <p className="text-xs text-gray-500">Photos</p>
          </div>

          {/* Column 5 - Account Status */}
          <div className="flex flex-col items-center justify-center">
            <p className={`text-lg font-semibold ${getStatusColor(user.accountStatus.accountStatus)}`}>
              {user.accountStatus.accountStatus.charAt(0).toUpperCase() + user.accountStatus.accountStatus.slice(1)}
            </p>
            <p className="text-xs text-gray-500">Account Status</p>
          </div>
        </div>
      </div>
    </div>
  )
}