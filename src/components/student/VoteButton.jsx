import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, Check } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { getSessionToken } from '../../lib/sessionManager'

export const VoteButton = ({ topic, hasVoted, onVoteComplete }) => {
    const [isVoting, setIsVoting] = useState(false)

    const handleVote = async () => {
        if (hasVoted || isVoting) return

        setIsVoting(true)
        const sessionToken = getSessionToken()

        try {
            // Insert vote record
            const { error: voteError } = await supabase
                .from('votes')
                .insert({ topic_id: topic.id, session_token: sessionToken })

            if (voteError) {
                // Check if already voted (unique constraint violation)
                if (voteError.code === '23505') {
                    console.log('Already voted on this topic')
                    onVoteComplete?.(topic.id)
                    return
                }
                throw voteError
            }

            // Increment vote count
            const { error: updateError } = await supabase
                .from('topics')
                .update({ votes: topic.votes + 1 })
                .eq('id', topic.id)

            if (updateError) throw updateError

            onVoteComplete?.(topic.id)
        } catch (error) {
            console.error('Vote failed:', error)
        } finally {
            setIsVoting(false)
        }
    }

    return (
        <motion.button
            whileTap={{ scale: hasVoted ? 1 : 0.9 }}
            onClick={handleVote}
            disabled={hasVoted || isVoting}
            className={`
        min-h-[44px] min-w-[44px] p-3 rounded-lg
        flex items-center justify-center
        transition-all duration-200
        ${hasVoted
                    ? 'bg-academic-success text-white cursor-default'
                    : 'bg-academic-blue text-white hover:bg-academic-navy'
                }
        disabled:opacity-50
      `}
            aria-label={`Vote for ${topic.name}`}
            aria-pressed={hasVoted}
        >
            {hasVoted ? (
                <Check className="fill-current" size={24} />
            ) : (
                <ThumbsUp size={24} />
            )}
        </motion.button>
    )
}
