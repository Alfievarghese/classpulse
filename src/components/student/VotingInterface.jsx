import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, X } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { VotingButtons } from './VotingButtons'
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
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [processingTopicId, setProcessingTopicId] = useState(null)

    // Fetch session details
    useEffect(() => {
        const fetchSession = async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .single()

            if (error) {
                console.error('Error fetching session:', error)
            } else {
                setSession(data)
            }
        }
        if (sessionId) fetchSession()
    }, [sessionId])

    // Fetch previous votes
    useEffect(() => {
        const fetchUserVotes = async () => {
            const sessionToken = getSessionToken()
            const { data, error } = await supabase
                .from('votes')
                .select('topic_id, vote_type')
                .eq('session_token', sessionToken)

            if (error) {
                console.error('Error fetching votes:', error)
            } else if (data) {
                const voteMap = new Map()
                data.forEach(vote => voteMap.set(vote.topic_id, vote.vote_type))
                setVotedTopics(voteMap)
            }
        }
        fetchUserVotes()
    }, [sessionId])

    // Map to track last vote timestamp for each topic to prevent spam
    const [lastVoteTimestamps, setLastVoteTimestamps] = useState(new Map())

    const handleVote = async (topicId, voteType) => {
        // Prevent spam: Check strict 1.5s cooldown
        const now = Date.now()
        const lastVoteTime = lastVoteTimestamps.get(topicId) || 0
        if (now - lastVoteTime < 1500) {
            return // Ignore click if too fast
        }

        // Prevent multiple concurrent requests
        if (processingTopicId === topicId) return

        // Update timestamp immediately
        setLastVoteTimestamps(prev => new Map(prev).set(topicId, now))

        const sessionToken = getSessionToken()
        const currentVote = votedTopics.get(topicId)

        // Optimistic update
        setProcessingTopicId(topicId)
        const previousVoteMap = new Map(votedTopics)
        setVotedTopics(prev => new Map(prev.set(topicId, voteType)))

        try {
            if (currentVote) {
                // If changing vote, remove old vote first
                await supabase.from('votes').delete().eq('topic_id', topicId).eq('session_token', sessionToken)

                const decrementField = `votes_${currentVote}`
                const topic = topics.find(t => t.id === topicId)
                if (topic) {
                    await supabase.from('topics').update({
                        [decrementField]: Math.max(0, (topic[decrementField] || 0) - 1)
                    }).eq('id', topicId)
                }
            }

            // Insert new vote
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



    const filteredTopics = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalTopics = topics.length
    const votedCount = topics.filter(t => votedTopics.has(t.id)).length
    // const completionPercent = totalTopics > 0 ? Math.min(100, Math.round((votedCount / totalTopics) * 100)) : 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Success Toast */}
            <AnimatePresence>
                {showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
                    >
                        <Sparkles size={20} />
                        <span className="font-medium">Vote Recorded!</span>
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
                    <div className="flex items-center gap-4 mb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/')}
                            className="hover:bg-gray-200 rounded-full"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {session ? session.subject : 'Loading...'}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-bold">
                                    {session?.code}
                                </span>
                                <span>•</span>
                                <span>{votedCount} of {totalTopics} topics voted</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <Card className="p-1 bg-gray-200 overflow-hidden">
                        <motion.div
                            className="h-2 bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${totalTopics > 0 ? (votedCount / totalTopics) * 100 : 0}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </Card>

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
                                    Wait for your teacher to add topics!
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
            </div>


        </div>
    )
}
