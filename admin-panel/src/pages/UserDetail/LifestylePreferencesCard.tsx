// import { Heart } from 'lucide-react'

// interface LifestylePreferencesCardProps {
//   user: {
//     datingType?: string
//     relationshipType?: string
//     sexuality?: string
//     familyPlans?: string
//     religion?: string
//     politics?: string
//     drinking?: string
//     smoking?: string
//   }
// }

// export default function LifestylePreferencesCard({ user }: LifestylePreferencesCardProps) {
//   return (
//     <div className="glass-card p-6">
//       <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center">
//         <Heart className="h-5 w-5 mr-2 text-var(--secondary)" />
//         Lifestyle & Preferences
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="space-y-4">
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Dating Type</label>
//             <p className="text-var(--text-primary) font-medium">{user.datingType || 'N/A'}</p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Relationship Type</label>
//             <p className="text-var(--text-primary) font-medium">{user.relationshipType || 'N/A'}</p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Sexuality</label>
//             <p className="text-var(--text-primary) font-medium">{user.sexuality || 'N/A'}</p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Family Plans</label>
//             <p className="text-var(--text-primary) font-medium">{user.familyPlans || 'N/A'}</p>
//           </div>
//         </div>
//         <div className="space-y-4">
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Religion</label>
//             <p className="text-var(--text-primary) font-medium">{user.religion || 'N/A'}</p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Politics</label>
//             <p className="text-var(--text-primary) font-medium">{user.politics || 'N/A'}</p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Drinking</label>
//             <p className="text-var(--text-primary) font-medium">{user.drinking || 'N/A'}</p>
//           </div>
//           <div>
//             <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Smoking</label>
//             <p className="text-var(--text-primary) font-medium">{user.smoking || 'N/A'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


import { Heart } from 'lucide-react'

interface LifestylePreferencesCardProps {
  user: {
    datingPreferences: {
      datingType?: string
      relationshipType: string
    }
    personalInfo: {
      sexuality: string
      familyPlans?: string
    }
    lifestyle: {
      religion?: string
      politics: string
      drinking: string
      smoking?: string
    }
  }
}

export default function LifestylePreferencesCard({ user }: LifestylePreferencesCardProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <Heart className="h-5 w-5 mr-2 text-var(--secondary)" />
        Lifestyle & Preferences
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          {user.datingPreferences.datingType && (
            <div className="flex gap-1">
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Dating Type:</label>
              <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.datingPreferences.datingType}</p>
            </div>
          )}
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Relationship Type:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.datingPreferences.relationshipType || 'N/A'}</p>
          </div>
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Sexuality:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.personalInfo.sexuality || 'N/A'}</p>
          </div>
          {user.personalInfo.familyPlans && (
            <div className="flex gap-1">
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Family Plans:</label>
              <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.personalInfo.familyPlans}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {user.lifestyle.religion && (
            <div className="flex gap-1">
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Religion:</label>
              <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.lifestyle.religion}</p>
            </div>
          )}
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Politics:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.lifestyle.politics || 'N/A'}</p>
          </div>
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Drinking:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.lifestyle.drinking || 'N/A'}</p>
          </div>
          {user.lifestyle.smoking && (
            <div className="flex gap-1">
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Smoking:</label>
              <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.lifestyle.smoking}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}