import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, ArrowLeft, Sparkles, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { VotingButtons } from './VotingButtons'
import { AddTopicModal } from './AddTopicModal'
import { useRealtimeTopics } from '../../hooks/useRealtimeTopics'
import { supabase } from '../../lib/supabaseClient'
import { getSessionToken } from '../../lib/sessionManager'
import { motion, AnimatePresence } from 'framer-motion'

export const VotingInterface = () => {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const { topics, loading } = useRealtimeTopics(sessionId)
    const [session, setSession] = useState(null)
    const [votedTopics, setVotedTopics] = useState(new Map())
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [processingTopicId, setProcessingTopicId] = useState(null)

    // ... (keep useEffects)

    const handleVote = async (topicId, voteType) => {
        // Prevent multiple votes while processing
        if (processingTopicId === topicId) return

        const sessionToken = getSessionToken()
        const currentVote = votedTopics.get(topicId)

        // Optimistic update
        setProcessingTopicId(topicId)
        const previousVoteMap = new Map(votedTopics)
        setVotedTopics(prev => new Map(prev.set(topicId, voteType)))

        try {
            if (currentVote) {
                // ... (delete logic)
                await supabase.from('votes').delete().eq('topic_id', topicId).eq('session_token', sessionToken)

                const decrementField = `votes_${currentVote}`
                const topic = topics.find(t => t.id === topicId)
                if (topic) {
                    await supabase.from('topics').update({
                        [decrementField]: Math.max(0, (topic[decrementField] || 0) - 1)
                    }).eq('id', topicId)
                }
            }

            // ... (insert logic)
            await supabase.from('votes').insert({
                topic_id: topicId,
                session_token: sessionToken,
                vote_type: voteType
            })

            const incrementField = `votes_${voteType}`
            const topic = topics.find(t => t.id === topicId)
            if (topic) {
                await supabase.from('topics').update({
                    [incrementField]: (topic[incrementField] || 0) + 1
                }).eq('id', topicId)
            }

            // Show success confirmation
            setShowConfirmation(true)
            setTimeout(() => setShowConfirmation(false), 2000)

        } catch (error) {
            console.error('Error voting:', error)
            // Revert on error
            setVotedTopics(previousVoteMap)
        } finally {
            setProcessingTopicId(null)
        }
    }

    const handleAddTopic = async (topicName) => {
        try {
            await supabase
                .from('topics')
                .insert({
                    session_id: sessionId,
                    name: topicName,
                    created_by_student: true,
                    votes_bad: 0,
                    votes_understanding: 0,
                    votes_good: 0
                })
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error adding topic:', error)
        }
    }

    const filteredTopics = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalTopics = topics.length
    const votedCount = topics.filter(t => votedTopics.has(t.id)).length
    const completionPercent = totalTopics > 0 ? Math.min(100, Math.round((votedCount / totalTopics) * 100)) : 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ... (keep Toast) */}

            <div className="max-w-4xl mx-auto p-4 pb-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 bg-gray-50 z-10 pb-4 pt-4"
                >
                    {/* ... (keep Back Button) */}

                    {/* ... (keep Progress Card) */}

                    {/* Search Bar */}
                    <div className="mt-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Topics List */}
                <div className="space-y-4 mt-4">
                    {filteredTopics.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2">
                            <p className="text-gray-400 text-lg">
                                {searchTerm ? 'No matching topics' : 'No topics yet'}
                            </p>
                            {!searchTerm && (
                                <p className="text-gray-400 text-sm mt-2">
                                    Be the first to add one!
                                </p>
                            )}
                        </Card>
                    ) : (
                        filteredTopics.map((topic, index) => (
                            <motion.div
                                key={topic.id}
                                layoutId={topic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        {/* Topic Header */}
                                        <div className="mb-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {topic.name}
                                                </h3>
                                                {topic.created_by_student && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex-shrink-0">
                                                        Student-added
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {((topic.votes_bad || 0) + (topic.votes_understanding || 0) + (topic.votes_good || 0))} student{((topic.votes_bad || 0) + (topic.votes_understanding || 0) + (topic.votes_good || 0)) !== 1 ? 's' : ''} voted
                                            </p>
                                        </div>

                                        {/* Voting Buttons */}
                                        <VotingButtons
                                            topicId={topic.id}
                                            currentVote={votedTopics.get(topic.id)}
                                            onVote={handleVote}
                                            disabled={processingTopicId === topic.id}
                                        />
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Add Topic Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + topics.length * 0.05 }}
                    className="mt-6"
                >
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        variant="outline"
                        size="lg"
                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400"
                    >
                        <Plus size={20} />
                        Suggest a Topic
                    </Button>
                </motion.div>
            </div>

            {/* Add Topic Modal */}
            <AddTopicModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddTopic}
            />
        </div>
    )
}
