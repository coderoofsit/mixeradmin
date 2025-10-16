// import { User } from 'lucide-react'
// import { formatUTCDateOnly } from '../../utils/dateUtils'

// interface PersonalInfoCardProps {
//   user: {
//     dateOfBirth?: string
//     gender?: string
//     pronoun?: string
//     location?: {
//       city?: string
//       state?: string
//     }
//     height?: string
//     ethnicity?: string
//   }
// }

// export default function PersonalInfoCard({ user }: PersonalInfoCardProps) {
//   return (
//     <div className="glass-card p-6">
//       <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center">
//         <User className="h-5 w-5 mr-2 text-var(--primary)" />
//         Personal Information
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-3">
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Date of Birth</label>
//             <p className="text-var(--text-primary) font-medium">
//               {user.dateOfBirth ? formatUTCDateOnly(user.dateOfBirth) : ''}
//             </p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Gender</label>
//             <p className="text-var(--text-primary) font-medium">{user.gender || ''}</p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Pronoun</label>
//             <p className="text-var(--text-primary) font-medium">{user.pronoun || ''}</p>
//           </div>
//         </div>
//         <div className="space-y-3">
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Location</label>
//             <p className="text-var(--text-primary) font-medium">
//               {user.location?.city && user.location?.state ? 
//                 `${user.location.city}, ${user.location.state}` : 
//                 user.location?.city || user.location?.state || ''
//               }
//             </p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Height</label>
//             <p className="text-var(--text-primary) font-medium">{user.height || ''}</p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Ethnicity</label>
//             <p className="text-var(--text-primary) font-medium">{user.ethnicity || ''}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


// import { User } from 'lucide-react'
// import { formatUTCDateOnly } from '../../utils/dateUtils'

// interface PersonalInfoCardProps {
//   user: {
//     dateOfBirth?: string
//     gender?: string
//     pronoun?: string
//     location?: {
//       city?: string
//       state?: string
//     }
//     height?: string
//     ethnicity?: string
//   }
// }

// export default function PersonalInfoCard({ user }: PersonalInfoCardProps) {
//   return (
//     <div className="glass-card p-4">
//       <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
//         <User className="h-5 w-5 mr-2 text-var(--primary)" />
//         Personal Information
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div className="space-y-2">
//           <div className='flex gap-1'>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Date of Birth: </label>
//             <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">
//               {user.dateOfBirth ? formatUTCDateOnly(user.dateOfBirth) : ''}
//             </p>
//           </div>
//           <div className='flex gap-1'>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Gender: </label>
//             <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.gender || ''}</p>
//           </div>
//           <div className='flex gap-1'>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Pronoun: </label>
//             <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.pronoun || ''}</p>
//           </div>
//         </div>
//         <div className="space-y-2">
//           <div className='flex gap-1'>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Location: </label>
//             <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">
//               {user.location?.city && user.location?.state ? 
//                 `${user.location.city}, ${user.location.state}` : 
//                 user.location?.city || user.location?.state || ''
//               }
//             </p>
//           </div>
//           <div className='flex gap-1'>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Height: </label>
//             <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.height || ''}</p>
//           </div>
//           <div className='flex gap-1'>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Ethnicity:</label>
//             <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.ethnicity || ''}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


import { User } from 'lucide-react'
import { formatUTCDateOnly } from '../../utils/dateUtils'
import { mapGenderForDisplay } from '../../utils/genderUtils'

interface PersonalInfoCardProps {
  user: {
    personalInfo: {
      dateOfBirth: string
      gender: string
      pronoun?: string
      height: string
      ethnicity: string
    }
    location: {
      city: string
      state: string
    }
  }
}

export default function PersonalInfoCard({ user }: PersonalInfoCardProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <User className="h-5 w-5 mr-2 text-var(--primary)" />
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Date of Birth:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">
              {user.personalInfo.dateOfBirth ? formatUTCDateOnly(user.personalInfo.dateOfBirth) : ''}
            </p>
          </div>

          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Gender:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{mapGenderForDisplay(user.personalInfo.gender) || ''}</p>
          </div>
          {user.personalInfo.pronoun && (
            <div className="flex gap-1">
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Pronoun:</label>
              <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.personalInfo.pronoun}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Location:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">
              {user.location.city && user.location.state ? 
                `${user.location.city}, ${user.location.state}` : 
                user.location.city || user.location.state || ''
              }
            </p>
          </div>
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Height:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.personalInfo.height || ''}</p>
          </div>
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Ethnicity:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.personalInfo.ethnicity || ''}</p>
          </div>
        </div>
      </div>
    </div>
  )
}