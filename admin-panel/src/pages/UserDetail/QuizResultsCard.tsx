import { Star } from 'lucide-react'

interface QuizResultsCardProps {
  user: {
    quizResult?: {
      title?: string
      subTitle?: string
    }
  }
}

export default function QuizResultsCard({ user }: QuizResultsCardProps) {
  if (!user.quizResult) return null

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <Star className="h-5 w-5 mr-2 text-var(--warning)" />
        Quiz Results
      </h3>
      <div className="bg-var(--bg-tertiary) p-1 rounded-lg">
        <h4 className="font-semibold text-var(--text-primary) mb-2">{user.quizResult.title || 'N/A'}</h4>
        {user.quizResult.subTitle && (
          <p className="text-var(--text-muted)">{user.quizResult.subTitle}</p>
        )}
      </div>
    </div>
  )
}
