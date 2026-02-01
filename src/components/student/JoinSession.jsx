import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, ArrowLeft, Sparkles } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { supabase } from '../../lib/supabaseClient'
import { motion } from 'framer-motion'

export const JoinSession = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [code, setCode] = useState(searchParams.get('code') || '')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Auto-join if code is in URL
        if (searchParams.get('code')?.length === 4) {
            handleJoin({ preventDefault: () => { } })
        }
    }, [])

    const handleJoin = async (e) => {
        e.preventDefault()
        const sessionCode = code.trim()

        if (sessionCode.length !== 4) {
            setError('Please enter a 4-digit code')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const { data, error: dbError } = await supabase
                .from('sessions')
                .select('id, subject, active')
                .eq('code', sessionCode)
                .single()

            if (dbError || !data) {
                setError('Session not found. Check your code.')
                setIsLoading(false)
                return
            }

            if (!data.active) {
                setError('This session has ended.')
                setIsLoading(false)
                return
            }

            // Success! Navigate to session
            navigate(`/student/${data.id}`)

        } catch (err) {
            setError('Something went wrong. Please try again.')
            setIsLoading(false)
        }
    }

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4)
        setCode(value)
        if (error) setError(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
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
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-white shadow-2xl border-0">
                        <div className="p-6 md:p-12">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                                    <LogIn size={32} className="text-white md:w-10 md:h-10" />
                                </div>
                            </div>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                                    Join Session
                                </h1>
                                <p className="text-base md:text-lg text-gray-600">
                                    Enter the 4-digit code from your teacher
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleJoin} className="space-y-6">
                                {/* Code Input */}
                                <div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={code}
                                        onChange={handleCodeChange}
                                        placeholder="0 0 0 0"
                                        autoFocus
                                        className={`
                                            w-full px-4 md:px-8 py-4 md:py-6 text-3xl md:text-5xl font-bold text-center tracking-[0.25em] md:tracking-[0.5em]
                                            rounded-2xl border-3 transition-all
                                            ${error
                                                ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            }
                                            focus:outline-none focus:ring-4
                                            placeholder-gray-300
                                        `}
                                        disabled={isLoading}
                                    />
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 text-red-600 text-center font-medium"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={code.length !== 4 || isLoading}
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Joining...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Sparkles size={20} />
                                            Join Session
                                        </span>
                                    )}
                                </Button>
                            </form>


                        </div>
                    </Card>
                </motion.div>



            </div>
        </div>
    )
}
