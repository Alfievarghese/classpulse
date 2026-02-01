import { motion } from 'framer-motion'

export const BarChart = ({ topics, maxVotes, projectorMode = false }) => {
    const getBarColor = (votes) => {
        const percentage = maxVotes > 0 ? (votes / maxVotes) * 100 : 0
        if (percentage >= 70) return 'bg-academic-danger'
        if (percentage >= 40) return 'bg-academic-warning'
        return 'bg-academic-success'
    }

    if (topics.length === 0) {
        return (
            <div className={`text-center ${projectorMode ? 'text-white/70 text-3xl py-20' : 'text-gray-500 text-lg py-12'}`}>
                No topics yet. {projectorMode ? '' : 'Students can add topics to get started!'}
            </div>
        )
    }

    return (
        <div className={`space-y-${projectorMode ? '6' : '4'}`}>
            {topics.map((topic) => {
                const percentage = maxVotes > 0 ? (topic.votes / maxVotes) * 100 : 0

                return (
                    <div key={topic.id} className="relative">
                        <div className={`flex items-center justify-between mb-2 ${projectorMode ? 'text-2xl' : 'text-base'}`}>
                            <span className={`font-semibold flex items-center gap-2 ${projectorMode ? 'text-white' : 'text-academic-navy'}`}>
                                {topic.name}
                                {topic.created_by_student && (
                                    <span className={`text-sm bg-academic-sky text-white px-2 py-1 rounded ${projectorMode ? 'text-base' : ''}`}>
                                        Student Added
                                    </span>
                                )}
                            </span>
                            <span className={`font-bold ${projectorMode ? 'text-white text-3xl' : 'text-academic-blue text-xl'}`}>
                                {topic.votes}
                            </span>
                        </div>

                        <div className={`w-full ${projectorMode ? 'h-16' : 'h-10'} bg-gray-200 rounded-lg overflow-hidden`}>
                            <motion.div
                                className={`h-full ${getBarColor(topic.votes)} flex items-center justify-end px-4`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            >
                                {projectorMode && percentage > 15 && (
                                    <span className="text-white font-bold text-2xl">
                                        {Math.round(percentage)}%
                                    </span>
                                )}
                            </motion.div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
