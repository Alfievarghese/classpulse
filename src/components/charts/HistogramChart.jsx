import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'

export const HistogramChart = ({ topics }) => {
    if (!topics || topics.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-lg font-medium text-gray-600">No topics yet</p>
                <p className="text-sm text-gray-400 mt-1">Add topics to see feedback distribution</p>
            </div>
        )
    }

    // Calculate health metrics for each topic
    const topicsWithHealth = topics.map(topic => {
        const bad = topic.votes_bad || 0
        const understanding = topic.votes_understanding || 0
        const good = topic.votes_good || 0
        const total = bad + understanding + good

        // Calculate percentages
        const badPercent = total > 0 ? Math.round((bad / total) * 100) : 0
        const understandingPercent = total > 0 ? Math.round((understanding / total) * 100) : 0
        const goodPercent = total > 0 ? Math.round((good / total) * 100) : 0

        // Health status (traffic light)
        let status = 'neutral' // No votes
        let statusColor = 'gray'
        let statusIcon = null
        let statusText = 'No feedback yet'

        if (total > 0) {
            if (badPercent >= 50) {
                status = 'critical'
                statusColor = 'red'
                statusIcon = <AlertCircle className="w-5 h-5" />
                statusText = `${bad} student${bad !== 1 ? 's' : ''} struggling`
            } else if (goodPercent >= 60) {
                status = 'healthy'
                statusColor = 'emerald'
                statusIcon = <CheckCircle className="w-5 h-5" />
                statusText = 'Class has got it!'
            } else {
                status = 'caution'
                statusColor = 'amber'
                statusIcon = <AlertTriangle className="w-5 h-5" />
                statusText = 'Mixed understanding'
            }
        }

        return {
            ...topic,
            bad,
            understanding,
            good,
            total,
            badPercent,
            understandingPercent,
            goodPercent,
            status,
            statusColor,
            statusIcon,
            statusText
        }
    })

    // Sort by urgency: critical first, then caution, then healthy, then neutral
    const statusPriority = { critical: 0, caution: 1, healthy: 2, neutral: 3 }
    const sortedTopics = [...topicsWithHealth].sort((a, b) => {
        if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status]
        }
        return b.total - a.total
    })

    // Summary stats
    const critical = sortedTopics.filter(t => t.status === 'critical').length
    const caution = sortedTopics.filter(t => t.status === 'caution').length
    const healthy = sortedTopics.filter(t => t.status === 'healthy').length

    return (
        <div className="space-y-6">
            {/* Alert Bar - Glanceable Summary */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Health</h3>
                <div className="space-y-3">
                    {critical > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg"
                        >
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-red-900">
                                    {critical} topic{critical !== 1 ? 's' : ''} need{critical === 1 ? 's' : ''} attention
                                </p>
                                <p className="text-sm text-red-600">Students are struggling with these concepts</p>
                            </div>
                        </motion.div>
                    )}

                    {caution > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            className="flex items-center gap-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-lg"
                        >
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-amber-900">
                                    {caution} topic{caution !== 1 ? 's' : ''} {caution === 1 ? 'has' : 'have'} mixed feedback
                                </p>
                                <p className="text-sm text-amber-600">May need additional review</p>
                            </div>
                        </motion.div>
                    )}

                    {healthy > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-3 p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg"
                        >
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-emerald-900">
                                    {healthy} topic{healthy !== 1 ? 's' : ''} going strong ✨
                                </p>
                                <p className="text-sm text-emerald-600">Students understand these well</p>
                            </div>
                        </motion.div>
                    )}

                    {critical === 0 && caution === 0 && healthy === 0 && (
                        <div className="text-center py-4 text-gray-400">
                            <p>Waiting for student feedback...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Topic Status Cards - Scannable List */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Topic Breakdown</h3>
                <div className="space-y-3">
                    {sortedTopics.map((topic, index) => (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md ${topic.status === 'critical'
                                ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                                : topic.status === 'caution'
                                    ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                                    : topic.status === 'healthy'
                                        ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3 flex-1">
                                    {/* Status Dot */}
                                    <div className={`flex-shrink-0 text-${topic.statusColor}-500`}>
                                        {topic.statusIcon || <div className="w-5 h-5 rounded-full bg-gray-300" />}
                                    </div>

                                    {/* Topic Name */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900 text-lg truncate">
                                                {topic.name}
                                            </h4>
                                            {topic.status === 'healthy' && <Sparkles className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                        <p className={`text-sm font-medium text-${topic.statusColor}-600 mt-0.5`}>
                                            {topic.statusText}
                                        </p>
                                    </div>
                                </div>

                                {/* Vote Count */}
                                <div className="text-right flex-shrink-0">
                                    <p className="text-2xl font-bold text-gray-900">{topic.total}</p>
                                    <p className="text-xs text-gray-500">vote{topic.total !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {topic.total > 0 && (
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                        {topic.good > 0 && (
                                            <motion.div
                                                initial={{ flex: 0 }}
                                                animate={{ flex: topic.good }}
                                                transition={{ duration: 0.6, delay: index * 0.03 }}
                                                className="bg-emerald-500 h-full"
                                            />
                                        )}
                                        {topic.understanding > 0 && (
                                            <motion.div
                                                initial={{ flex: 0 }}
                                                animate={{ flex: topic.understanding }}
                                                transition={{ duration: 0.6, delay: index * 0.03 + 0.1 }}
                                                className="bg-amber-500 h-full"
                                            />
                                        )}
                                        {topic.bad > 0 && (
                                            <motion.div
                                                initial={{ flex: 0 }}
                                                animate={{ flex: topic.bad }}
                                                transition={{ duration: 0.6, delay: index * 0.03 + 0.2 }}
                                                className="bg-red-500 h-full"
                                            />
                                        )}
                                    </div>

                                    {/* Vote Breakdown */}
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-red-600">
                                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                                                {topic.bad} 😟
                                            </span>
                                            <span className="flex items-center gap-1.5 text-amber-600">
                                                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                                                {topic.understanding} 🤔
                                            </span>
                                            <span className="flex items-center gap-1.5 text-emerald-600">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                {topic.good} 😊
                                            </span>
                                        </div>
                                        {topic.created_by_student && (
                                            <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                                                Student-added
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
