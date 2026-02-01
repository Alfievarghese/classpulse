import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Users, Presentation } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { motion } from 'framer-motion'

export const LandingPage = () => {
    const navigate = useNavigate()
    const [showJoin, setShowJoin] = useState(false)
    const [code, setCode] = useState('')

    const handleQuickJoin = (e) => {
        e.preventDefault()
        if (code.length === 4) {
            navigate(`/join?code=${code}`)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-academic-navy via-academic-blue to-academic-sky">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
                        <GraduationCap size={48} className="text-academic-blue" />
                    </div>
                    <h1 className="text-6xl font-bold text-white mb-4">ClassPulse</h1>
                    <p className="text-2xl text-white/90">Real-time Classroom Feedback System</p>
                    <p className="text-lg text-white/70 mt-2">Anonymous voting • Live updates • Better engagement</p>
                </motion.div>

                {/* Quick Join Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8">
                        <form onSubmit={handleQuickJoin} className="flex gap-4 items-center">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="0 0 0 0"
                                    className="w-full px-6 py-4 text-3xl font-bold text-center tracking-widest rounded-lg border-2 border-white/30 bg-white text-academic-navy placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={code.length !== 4}
                                size="lg"
                                className="px-8 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                            >
                                Join Session
                            </Button>
                        </form>
                    </Card>
                </motion.div>

                {/* Main Options */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Student Option */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="h-full bg-white hover:shadow-2xl transition-all duration-300 border-2 md:border-4 border-academic-success">
                            <div className="p-6 md:p-8">
                                <div className="w-16 h-16 bg-academic-success/10 rounded-full flex items-center justify-center mb-6">
                                    <Users size={32} className="text-academic-success" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-academic-navy mb-4">I'm a Student</h2>
                                <p className="text-base md:text-lg text-academic-slate mb-8">
                                    Join your class session to vote on topics and provide feedback
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start gap-3">
                                        <span className="text-academic-success text-xl">✓</span>
                                        <span className="text-academic-slate">Vote on discussion topics</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-academic-success text-xl">✓</span>
                                        <span className="text-academic-slate">Suggest new topics</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-academic-success text-xl">✓</span>
                                        <span className="text-academic-slate">Anonymous participation</span>
                                    </li>
                                </ul>
                                <Button
                                    onClick={() => navigate('/join')}
                                    variant="success"
                                    size="lg"
                                    className="w-full"
                                >
                                    Join with Code
                                </Button>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Teacher Option */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="h-full bg-white hover:shadow-2xl transition-all duration-300 border-2 md:border-4 border-academic-blue">
                            <div className="p-6 md:p-8">
                                <div className="w-16 h-16 bg-academic-blue/10 rounded-full flex items-center justify-center mb-6">
                                    <Presentation size={32} className="text-academic-blue" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-academic-navy mb-4">I'm a Teacher</h2>
                                <p className="text-base md:text-lg text-academic-slate mb-8">
                                    Create and manage classroom sessions with real-time feedback
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start gap-3">
                                        <span className="text-academic-blue text-xl">✓</span>
                                        <span className="text-academic-slate">Create instant sessions</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-academic-blue text-xl">✓</span>
                                        <span className="text-academic-slate">Live voting dashboard</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-academic-blue text-xl">✓</span>
                                        <span className="text-academic-slate">Projector mode for classroom</span>
                                    </li>
                                </ul>
                                <Button
                                    onClick={() => navigate('/teacher/create')}
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                >
                                    Create New Session
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-16 text-white/60"
                >
                    <p>Built for better classroom engagement • No login required</p>
                </motion.div>
            </div>
        </div>
    )
}
