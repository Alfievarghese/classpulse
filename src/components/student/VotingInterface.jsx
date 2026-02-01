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

    useEffect(() => {
        const fetchSession = async () => {
            const { data } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .single()

            setSession(data)
        }

        fetchSession()
    }, [sessionId])

    useEffect(() => {
        const fetchVotes = async () => {
            const sessionToken = getSessionToken()
            const { data } = await supabase
                .from('votes')
                .select('topic_id, vote_type')
                .eq('session_token', sessionToken)

            if (data) {
                const voteMap = new Map(data.map(v => [v.topic_id, v.vote_type]))
                setVotedTopics(voteMap)
            }
        }

        fetchVotes()
    }, [])

    const handleVote = async (topicId, voteType) => {
        const sessionToken = getSessionToken()
        const currentVote = votedTopics.get(topicId)

        try {
            if (currentVote) {
                await supabase
                    .from('votes')
                    .delete()
                    .eq('topic_id', topicId)
                    .eq('session_token', sessionToken)

                const decrementField = `votes_${currentVote}`
                const topic = topics.find(t => t.id === topicId)
                await supabase
                    .from('topics')
                    .update({
                        [decrementField]: Math.max(0, (topic[decrementField] || 0) - 1)
                    })
                    .eq('id', topicId)
            }

            await supabase
                .from('votes')
                .insert({
                    topic_id: topicId,
                    session_token: sessionToken,
                    vote_type: voteType
                })

            const incrementField = `votes_${voteType}`
            const topic = topics.find(t => t.id === topicId)
            await supabase
                .from('topics')
                .update({
                    [incrementField]: (topic[incrementField] || 0) + 1
                })
                .eq('id', topicId)

            setVotedTopics(new Map(votedTopics.set(topicId, voteType)))

            // Show success confirmation
            setShowConfirmation(true)
            setTimeout(() => setShowConfirmation(false), 2000)

        } catch (error) {
            console.error('Error voting:', error)
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



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Loading session...</p>
                </div>
            </div>
        )
    }

    const totalTopics = topics.length
    const votedCount = topics.filter(t => votedTopics.has(t.id)).length
    const completionPercent = totalTopics > 0 ? Math.min(100, Math.round((votedCount / totalTopics) * 100)) : 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Success Toast */}
            <AnimatePresence>
                {showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
                            <Sparkles size={20} />
                            <span className="font-semibold">Vote recorded!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>



            <div className="max-w-4xl mx-auto p-4 pb-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 bg-gray-50 z-10 pb-4 pt-4"
                >
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 bg-white"
                        >
                            <ArrowLeft size={16} />
                            Leave
                        </Button>
                    </div>

                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-blue-100 text-sm mb-1">
                                        {session?.subject || 'Session'}
                                    </p>
                                    <h1 className="text-2xl font-bold">
                                        Share Your Feedback
                                    </h1>
                                    <p className="text-blue-100 text-sm mt-1">
                                        Session {session?.code}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{votedCount}/{totalTopics}</div>
                                    <div className="text-blue-100 text-sm">
                                        {completionPercent}% complete
                                    </div>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            {totalTopics > 0 && (
                                <div className="mt-4">
                                    <div className="h-2 bg-blue-800/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionPercent}%` }}
                                            className="h-full bg-gradient-to-r from-emerald-400 to-green-400"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Topics List */}
                <div className="space-y-4 mt-4">
                    {topics.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2">
                            <p className="text-gray-400 text-lg">No topics yet</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Be the first to add one!
                            </p>
                        </Card>
                    ) : (
                        topics.map((topic, index) => (
                            <motion.div
                                key={topic.id}
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
                                            disabled={false}
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
