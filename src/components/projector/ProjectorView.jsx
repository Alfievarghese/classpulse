import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Maximize2, Minimize2, AlertCircle, CheckCircle, AlertTriangle, PartyPopper, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeTopics } from '../../hooks/useRealtimeTopics'
import { supabase } from '../../lib/supabaseClient'

export const ProjectorView = () => {
    const { sessionId } = useParams()
    const { topics } = useRealtimeTopics(sessionId)
    const [session, setSession] = useState(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [previousTopicStates, setPreviousTopicStates] = useState(new Map())
    const [celebrations, setCelebrations] = useState([])
    const [resolvedTopics, setResolvedTopics] = useState(new Set())

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

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    // Detect topic improvements and trigger celebrations (Logic copied from TeacherDashboard)
    useEffect(() => {
        if (topics.length === 0) return

        const newCelebrations = []

        topics.forEach(topic => {
            const bad = topic.votes_bad || 0
            const understanding = topic.votes_understanding || 0
            const good = topic.votes_good || 0
            const total = bad + understanding + good

            if (total < 1) return // Need minimum votes (adjusted to 1 to match TeacherDashboard display logic if needed)

            const goodPercent = total > 0 ? Math.round((good / total) * 100) : 0
            const badPercent = total > 0 ? Math.round((bad / total) * 100) : 0

            const topicKey = topic.id
            const previousState = previousTopicStates.get(topicKey)

            // Current status
            const currentlyCritical = badPercent >= 50
            const currentlyHealthy = goodPercent >= 60

            if (previousState) {
                // Check for improvement: wasn't healthy, now is healthy
                if (!previousState.wasHealthy && currentlyHealthy) {
                    newCelebrations.push({
                        id: `${topic.id}-${Date.now()}`,
                        topicName: topic.name,
                        goodPercent
                    })

                    // Auto-archive after celebration (6.5s delay)
                    setTimeout(() => {
                        setResolvedTopics(prev => new Set(prev).add(topic.id))
                    }, 6500)
                }
            }

            // Update state for next comparison
            setPreviousTopicStates(prev => new Map(prev).set(topicKey, {
                wasCritical: currentlyCritical,
                wasHealthy: currentlyHealthy,
                badCount: bad,
                goodCount: good,
                total
            }))
        })

        // Add new celebrations
        if (newCelebrations.length > 0) {
            setCelebrations(prev => [...prev, ...newCelebrations])

            // Auto-remove after 6 seconds
            newCelebrations.forEach(celebration => {
                setTimeout(() => {
                    setCelebrations(prev => prev.filter(c => c.id !== celebration.id))
                }, 6000)
            })
        }
    }, [topics])

    // Calculate health for each topic and filter resolved
    const topicsWithHealth = topics.map(topic => {
        const bad = topic.votes_bad || 0
        const understanding = topic.votes_understanding || 0
        const good = topic.votes_good || 0
        const total = bad + understanding + good

        const badPercent = total > 0 ? Math.round((bad / total) * 100) : 0
        const goodPercent = total > 0 ? Math.round((good / total) * 100) : 0

        let status = 'neutral'
        if (total > 0) {
            if (badPercent >= 50) {
                status = 'critical'
            } else if (goodPercent >= 60) {
                status = 'healthy'
            } else {
                status = 'caution'
            }
        }

        return { ...topic, bad, understanding, good, total, status, badPercent, goodPercent }
    })

    // Filter resolved topics and sort
    const activeTopics = topicsWithHealth.filter(t => !resolvedTopics.has(t.id))

    // Sort by urgency
    const statusPriority = { critical: 0, caution: 1, healthy: 2, neutral: 3 }
    const sortedTopics = [...activeTopics].sort((a, b) => {
        if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status]
        }
        return b.total - a.total
    })

    const totalVotes = activeTopics.reduce((sum, t) => sum + t.total, 0)
    const critical = sortedTopics.filter(t => t.status === 'critical').length
    const healthy = sortedTopics.filter(t => t.status === 'healthy').length

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8 relative overflow-hidden">

            {/* Celebration Popup (Top Center for Projector) */}
            <AnimatePresence>
                {celebrations.map((celebration) => (
                    <motion.div
                        key={celebration.id}
                        initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, scale: 0.95, x: '-50%' }}
                        className="fixed top-8 left-1/2 z-50 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-2xl p-6 border-2 border-emerald-300 max-w-2xl w-full"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 bg-white/20 p-2 rounded-full">
                                <Trophy className="w-10 h-10 text-yellow-300" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-2xl flex items-center gap-2">
                                    <PartyPopper size={24} />
                                    Success!
                                </div>
                                <div className="text-emerald-50 text-xl mt-1">
                                    Congratulations! Your students learned <strong>"{celebration.topicName}"</strong>! 🎉
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-start mb-12"
                >
                    <div className="flex-1">
                        <h1 className="text-6xl font-bold text-white mb-4">
                            {session?.subject || 'ClassPulse'}
                        </h1>
                        <div className="flex items-center gap-8 text-2xl text-blue-200">
                            <span>Session <span className="font-mono font-bold text-white">{session?.code}</span></span>
                            <span>•</span>
                            <span>{activeTopics.length} topics</span>
                            <span>•</span>
                            <span>{totalVotes} votes</span>
                        </div>

                        {/* Status Summary */}
                        {totalVotes > 0 && (
                            <div className="mt-6 flex items-center gap-6 text-xl">
                                {critical > 0 && (
                                    <div className="flex items-center gap-2 text-red-400">
                                        <AlertCircle className="w-6 h-6" />
                                        <span className="font-semibold">{critical} need{critical === 1 ? 's' : ''} attention</span>
                                    </div>
                                )}
                                {healthy > 0 && (
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle className="w-6 h-6" />
                                        <span className="font-semibold">{healthy} clear ✨</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl transition-all"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 size={32} /> : <Maximize2 size={32} />}
                    </button>
                </motion.div>

                {/* Topics Grid */}
                {activeTopics.length === 0 ? (
                    <div className="text-center text-white/50 text-4xl py-32">
                        <div className="mb-6">📊</div>
                        <div>No topics yet</div>
                        <div className="text-2xl mt-4">Waiting for student feedback...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnimatePresence mode='popLayout'>
                            {sortedTopics.map((topic, index) => (
                                <motion.div
                                    key={topic.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 ${topic.status === 'critical'
                                        ? 'border-red-500/50 shadow-red-500/20'
                                        : topic.status === 'healthy'
                                            ? 'border-emerald-500/50 shadow-emerald-500/20'
                                            : topic.status === 'caution'
                                                ? 'border-amber-500/50 shadow-amber-500/20'
                                                : 'border-white/10'
                                        } shadow-2xl`}
                                >
                                    {/* Status Indicator */}
                                    <div className="absolute top-6 right-6">
                                        {topic.status === 'critical' && <AlertCircle className="w-10 h-10 text-red-500" />}
                                        {topic.status === 'caution' && <AlertTriangle className="w-10 h-10 text-amber-500" />}
                                        {topic.status === 'healthy' && <CheckCircle className="w-10 h-10 text-emerald-500" />}
                                    </div>

                                    {/* Topic Name */}
                                    <h3 className="text-3xl font-bold text-white mb-6 pr-12">
                                        {topic.name}
                                    </h3>

                                    {/* Votes Display */}
                                    {topic.total > 0 ? (
                                        <div className="space-y-4">
                                            {/* Large Vote Count */}
                                            <div className="text-right mb-4">
                                                <div className="text-5xl font-bold text-white">{topic.total}</div>
                                                <div className="text-lg text-white/50">votes</div>
                                            </div>

                                            {/* Emoji Breakdown */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center bg-red-500/20 rounded-xl p-4 border border-red-500/30">
                                                    <div className="text-4xl mb-2">😟</div>
                                                    <div className="text-3xl font-bold text-red-400">{topic.bad}</div>
                                                    <div className="text-sm text-red-300">Need Help</div>
                                                </div>
                                                <div className="text-center bg-amber-500/20 rounded-xl p-4 border border-amber-500/30">
                                                    <div className="text-4xl mb-2">🤔</div>
                                                    <div className="text-3xl font-bold text-amber-400">{topic.understanding}</div>
                                                    <div className="text-sm text-amber-300">Getting It</div>
                                                </div>
                                                <div className="text-center bg-emerald-500/20 rounded-xl p-4 border border-emerald-500/30">
                                                    <div className="text-4xl mb-2">😊</div>
                                                    <div className="text-3xl font-bold text-emerald-400">{topic.good}</div>
                                                    <div className="text-sm text-emerald-300">Clear!</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-4 bg-white/10 rounded-full overflow-hidden flex">
                                                {topic.good > 0 && (
                                                    <div
                                                        className="bg-emerald-500 h-full transition-all duration-500"
                                                        style={{ flex: topic.good }}
                                                    />
                                                )}
                                                {topic.understanding > 0 && (
                                                    <div
                                                        className="bg-amber-500 h-full transition-all duration-500"
                                                        style={{ flex: topic.understanding }}
                                                    />
                                                )}
                                                {topic.bad > 0 && (
                                                    <div
                                                        className="bg-red-500 h-full transition-all duration-500"
                                                        style={{ flex: topic.bad }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-white/30 text-xl py-8">
                                            No votes yet
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-center"
                    viewport={{ once: true }} // Just to handle potential layout shift
                    layout // Animate footer movement when items disappear
                >
                    <div className="inline-flex items-center gap-3 text-white/40 text-lg">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        <span>Live Updates • Refreshing every second</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
