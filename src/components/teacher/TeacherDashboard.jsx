import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Maximize2, Copy, Check, ArrowLeft, PartyPopper, Trophy, Download } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { HistogramChart } from '../charts/HistogramChart'
import { useRealtimeTopics } from '../../hooks/useRealtimeTopics'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

export const TeacherDashboard = () => {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const { topics, loading } = useRealtimeTopics(sessionId)
    const [session, setSession] = useState(null)
    const [copied, setCopied] = useState(false)
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

    // Detect topic improvements and trigger celebrations
    useEffect(() => {
        if (topics.length === 0) return

        const newCelebrations = []

        topics.forEach(topic => {
            const bad = topic.votes_bad || 0
            const understanding = topic.votes_understanding || 0
            const good = topic.votes_good || 0
            const total = bad + understanding + good

            if (total < 3) return // Need minimum votes

            const goodPercent = Math.round((good / total) * 100)
            const badPercent = Math.round((bad / total) * 100)

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
                        improvement: previousState.badCount - bad, // This metric might be less relevant now, but keeping for structure
                        goodPercent
                    })

                    // Auto-archive after celebration (6.5s delay to allow animation to finish)
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

    const copyCode = () => {
        if (session?.code) {
            navigator.clipboard.writeText(session.code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    // Filter topics:
    // 1. Must have at least 1 vote (total > 0)
    // 2. Must NOT be resolved (in resolvedTopics set)
    // 3. User Rule: Only show if "Need Help" (Bad) > 40% OR if it's about to be celebrated (> 60% Good)
    const activeTopics = topics.filter(topic => {
        const total = (topic.votes_bad || 0) + (topic.votes_understanding || 0) + (topic.votes_good || 0)
        if (total === 0) return false
        if (resolvedTopics.has(topic.id)) return false

        const badPercent = (topic.votes_bad / total) * 100
        const goodPercent = (topic.votes_good / total) * 100

        // Show if critical (bad > 40%) OR if healthy/celebrating (good > 60%)
        return badPercent > 40 || goodPercent >= 60
    })

    const totalVotes = activeTopics.reduce((sum, t) =>
        sum + (t.votes_bad || 0) + (t.votes_understanding || 0) + (t.votes_good || 0), 0
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const handleDownloadReport = async () => {
        try {
            if (!topics.length) return

            const topicIds = topics.map(t => t.id)
            const { data: allVotes, error } = await supabase
                .from('votes')
                .select('*')
                .in('topic_id', topicIds)
                .order('created_at', { ascending: true })

            if (error) throw error

            // --- SECTION 1: TOPIC SUMMARY ---
            const summaryHeaders = ['TOPIC SUMMARY', 'Created At', 'Duration (Mins)', 'Total Bad Votes', 'Total Good Votes', 'Final Status', 'Peak Confusion (Max Bad)']

            const summaryRows = topics.map(topic => {
                const createdAt = new Date(topic.created_at)
                const now = new Date()
                const durationMins = Math.round((now - createdAt) / 60000)

                // Calculate simple metrics (cumulative)
                const totalBad = topic.votes_bad || 0
                const totalGood = topic.votes_good || 0

                // Determine status text
                let status = 'Active'
                const total = totalBad + (topic.votes_understanding || 0) + totalGood
                if (total > 0) {
                    const badPercent = (totalBad / total) * 100
                    const goodPercent = (totalGood / total) * 100
                    if (goodPercent >= 60) status = 'Resolved (Success)'
                    else if (badPercent > 40) status = 'Critical (Needs Help)'
                    else status = 'In Progress'
                }

                return [
                    `"${topic.name}"`,
                    createdAt.toLocaleString(),
                    `${durationMins} min`,
                    totalBad,
                    totalGood,
                    status,
                    totalBad // Using cumulative bad as proxy for "Peak Confusion" in this simple view
                ]
            })

            // --- SECTION 2: DETAILED VOTE LOG ---
            const logHeaders = ['FULL VOTE LOG', 'Time', 'Topic Name', 'Vote Choice', 'Vote ID']
            const logRows = allVotes.map(vote => {
                const topic = topics.find(t => t.id === vote.topic_id)
                return [
                    '', // Spacer for first col
                    new Date(vote.created_at).toLocaleString(),
                    `"${topic?.name || 'Unknown'}"`,
                    vote.vote_type.toUpperCase(),
                    vote.id
                ]
            })

            // Combine into CSV
            const csvContent = [
                summaryHeaders.join(','),
                ...summaryRows.map(r => r.join(',')),
                '', // Empty row separator
                '', // Empty row separator
                logHeaders.join(','),
                ...logRows.map(r => r.join(','))
            ].join('\n')

            // Trigger Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `${session.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_full_report.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            console.error('Error downloading report:', err)
            alert('Failed to download report. Please try again.')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Celebration Notifications */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 max-w-md w-full px-4">
                <AnimatePresence>
                    {celebrations.map((celebration) => (
                        <motion.div
                            key={celebration.id}
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.95 }}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-2xl p-4 border-2 border-emerald-300"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <Trophy className="w-8 h-8 text-yellow-300" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-lg flex items-center gap-2">
                                        <PartyPopper size={16} />
                                        Success!
                                    </div>
                                    <div className="text-emerald-50 text-sm mt-1">
                                        Congratulations! Your students learned <strong>"{celebration.topicName}"</strong>! 🎉
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 bg-white"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Button>

                    <Button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    >
                        <Download size={16} />
                        Download Full Report
                    </Button>
                </motion.div>

                {/* Session Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl">
                        <div className="p-8">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-blue-100 text-sm font-medium mb-1">
                                        {session?.subject || 'Live Session'}
                                    </p>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Teacher Dashboard
                                    </h1>
                                    <p className="text-blue-100">
                                        {session?.teacher_name || 'Teacher'} • {activeTopics.length} active topic{activeTopics.length !== 1 ? 's' : ''} • {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                {/* Session Code */}
                                <div className="text-right">
                                    <p className="text-blue-100 text-sm mb-2">Session Code</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-5xl font-bold tracking-wider font-mono">
                                            {session?.code}
                                        </span>
                                        <button
                                            onClick={copyCode}
                                            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                                            title="Copy code"
                                        >
                                            {copied ? (
                                                <Check size={24} className="text-green-300" />
                                            ) : (
                                                <Copy size={24} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Histogram/Status Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <HistogramChart topics={activeTopics} />
                </motion.div>

                {/* Projector View Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center"
                >
                    <Button
                        onClick={() => navigate(`/projector/${sessionId}`)}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg px-8 py-6 rounded-2xl flex items-center gap-3"
                    >
                        <Maximize2 size={24} />
                        Launch Projector View
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
