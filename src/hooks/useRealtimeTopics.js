import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useRealtimeTopics = (sessionId) => {
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!sessionId) {
            setLoading(false)
            return
        }

        // Fetch topics from database
        const fetchTopics = async () => {
            const { data, error } = await supabase
                .from('topics')
                .select('*')
                .eq('session_id', sessionId)

            if (!error && data) {
                // Sort by total votes (bad + understanding + good)
                const sortedTopics = data.sort((a, b) => {
                    const totalA = (a.votes_bad || 0) + (a.votes_understanding || 0) + (a.votes_good || 0)
                    const totalB = (b.votes_bad || 0) + (b.votes_understanding || 0) + (b.votes_good || 0)
                    return totalB - totalA
                })
                setTopics(sortedTopics)
            }
            setLoading(false)
        }

        // Initial fetch
        fetchTopics()

        // Poll for updates every 1 second for fast updates
        const pollInterval = setInterval(fetchTopics, 1000)

        // Cleanup on unmount
        return () => {
            clearInterval(pollInterval)
        }
    }, [sessionId])

    return { topics, loading }
}

