import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

export const AddTopicModal = ({ isOpen, onClose, onAdd }) => {
    const [topicName, setTopicName] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!topicName.trim()) {
            setError('Topic name cannot be empty')
            return
        }

        if (topicName.trim().length < 3) {
            setError('Topic name must be at least 3 characters')
            return
        }

        onAdd(topicName.trim())
        setTopicName('')
        setError('')
    }

    const handleClose = () => {
        setTopicName('')
        setError('')
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Suggest a Topic
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Topic Name
                                </label>
                                <input
                                    type="text"
                                    value={topicName}
                                    onChange={(e) => {
                                        setTopicName(e.target.value)
                                        if (error) setError('')
                                    }}
                                    placeholder="e.g., Quantum Mechanics"
                                    maxLength={100}
                                    autoFocus
                                    className={`
                                        w-full px-4 py-3 rounded-xl border-2 transition-all
                                        ${error
                                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500'
                                        }
                                        focus:outline-none focus:ring-2
                                        placeholder-gray-400
                                    `}
                                />
                                {error && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {error}
                                    </p>
                                )}
                                <p className="mt-2 text-xs text-gray-500">
                                    {topicName.length}/100 characters
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!topicName.trim() || topicName.trim().length < 3}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Topic
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
