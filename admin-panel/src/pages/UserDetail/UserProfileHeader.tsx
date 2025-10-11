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
//             <h2 className="text-2xl font-bold text-var(--text-primary)">{user.name || 'N/A'}</h2>
//             <span className={`badge ${getStatusBadgeClass(user.accountStatus)}`}>
//               {user.accountStatus}
//             </span>
//           </div>
//           <p className="text-var(--text-muted) mb-4">{user.email}</p>
          
//           {/* Quick Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="text-center">
//               <p className="text-2xl font-bold text-var(--primary)">{user.age || 'N/A'}</p>
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
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success'
      case 'suspended':
        return 'badge-warning'
      case 'banned':
        return 'badge-danger'
      default:
        return 'badge-secondary'
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {user.profileContent.images && user.profileContent.images.length > 0 ? (
            <img
              src={user.profileContent.images.find(img => img.isPrimary)?.url || user.profileContent.images[0].url}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-var(--border)"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-var(--bg-tertiary) flex items-center justify-center border-2 border-var(--border)">
              <User className="h-10 w-10 text-var(--text-muted)" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="mb-3">
            <div className="flex items-center space-x-3 mb-1">
              <h2 className="text-xl font-bold text-var(--text-primary)">{user.personalInfo.name || 'N/A'}</h2>
              <span className={`badge ${getStatusBadgeClass(user.accountStatus.accountStatus)}`}>
                {user.accountStatus.accountStatus}
              </span>
            </div>
            <p className="text-sm text-var(--text-muted)">{user.email}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            <div className="text-left">
              <p className="text-xl font-bold text-blue-600">{user.personalInfo.age || 'N/A'}</p>
              <p className="text-xs text-gray-500">Age</p>
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-green-600">{user.accountStatus.profileCompletion || 0}%</p>
              <p className="text-xs text-gray-500">Profile Complete</p>
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-purple-600">{user.profileContent.images?.length || 0}</p>
              <p className="text-xs text-gray-500">Photos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}