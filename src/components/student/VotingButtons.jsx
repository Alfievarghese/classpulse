import { motion } from 'framer-motion'
import { useState } from 'react'

export const VotingButtons = ({ topicId, currentVote, onVote, disabled }) => {
    const [isPulsing, setIsPulsing] = useState(false)

    const handleVote = (voteType) => {
        if (disabled) return

        // Trigger pulse animation
        setIsPulsing(true)
        setTimeout(() => setIsPulsing(false), 600)

        // Call parent handler
        onVote(topicId, voteType)
    }

    const zones = [
        {
            type: 'bad',
            emoji: '😟',
            label: 'Need Help',
            bgColor: 'bg-white hover:bg-red-50',
            activeBg: 'bg-gradient-to-br from-red-500 to-red-600',
            borderColor: 'border-gray-200',
            activeBorder: 'border-red-500',
            textColor: 'text-gray-700',
            activeText: 'text-white'
        },
        {
            type: 'understanding',
            emoji: '🤔',
            label: 'Getting It',
            bgColor: 'bg-white hover:bg-amber-50',
            activeBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
            borderColor: 'border-gray-200',
            activeBorder: 'border-amber-500',
            textColor: 'text-gray-700',
            activeText: 'text-white'
        },
        {
            type: 'good',
            emoji: '😊',
            label: 'Clear!',
            bgColor: 'bg-white hover:bg-emerald-50',
            activeBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            borderColor: 'border-gray-200',
            activeBorder: 'border-emerald-500',
            textColor: 'text-gray-700',
            activeText: 'text-white'
        }
    ]

    return (
        <div className="grid grid-cols-3 gap-2">
            {zones.map((zone) => {
                const isActive = currentVote === zone.type

                return (
                    <motion.button
                        key={zone.type}
                        onClick={() => handleVote(zone.type)}
                        disabled={disabled}
                        whileTap={{ scale: isActive ? 1 : 0.95 }}
                        className={`
              relative overflow-hidden
              px-4 py-6 rounded-2xl
              border-2 transition-all duration-200
              ${isActive ? zone.activeBg : zone.bgColor}
              ${isActive ? zone.activeBorder : zone.borderColor}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
              ${isActive ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
            `}
                    >
                        {/* Pulse Effect on Vote */}
                        {isActive && isPulsing && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0.5 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 bg-white rounded-2xl"
                            />
                        )}

                        {/* Emoji */}
                        <div className="text-4xl mb-2 select-none">
                            {zone.emoji}
                        </div>

                        {/* Label */}
                        <div className={`
              text-sm font-semibold select-none
              ${isActive ? zone.activeText : zone.textColor}
            `}>
                            {zone.label}
                        </div>

                        {/* Checkmark when active */}
                        {isActive && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </motion.div>
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}
