import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { supabase } from '../../lib/supabaseClient'
import { generateSessionCode } from '../../utils/codeGenerator'

export const CreateSession = () => {
    const [formData, setFormData] = useState({
        subject: '',
        teacherName: '',
        initialTopics: ['']
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const addTopicField = () => {
        setFormData(prev => ({
            ...prev,
            initialTopics: [...prev.initialTopics, '']
        }))
    }

    const removeTopicField = (index) => {
        setFormData(prev => ({
            ...prev,
            initialTopics: prev.initialTopics.filter((_, i) => i !== index)
        }))
    }

    const updateTopic = (index, value) => {
        const newTopics = [...formData.initialTopics]
        newTopics[index] = value
        setFormData(prev => ({ ...prev, initialTopics: newTopics }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        let code = generateSessionCode()
        let isUnique = false

        // Ensure unique code
        while (!isUnique) {
            const { data } = await supabase
                .from('sessions')
                .select('id')
                .eq('code', code)
                .single()

            if (!data) isUnique = true
            else code = generateSessionCode()
        }

        // Create session
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
                code,
                subject: formData.subject,
                teacher_name: formData.teacherName || null
            })
            .select()
            .single()

        if (sessionError) {
            console.error('Failed to create session:', sessionError)
            alert('Failed to create session. Please try again.')
            setLoading(false)
            return
        }

        // Create initial topics
        const topics = formData.initialTopics
            .filter(t => t.trim())
            .map(name => ({
                session_id: session.id,
                name: name.trim(),
                created_by_student: false
            }))

        if (topics.length > 0) {
            await supabase.from('topics').insert(topics)
        }

        navigate(`/teacher/${session.id}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-academic-navy mb-8">
                    Create New Session
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <div className="space-y-6">
                            <Input
                                label="Subject/Class Name"
                                value={formData.subject}
                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                placeholder="e.g., Advanced Physics 101"
                                required
                            />

                            <Input
                                label="Your Name (Optional)"
                                value={formData.teacherName}
                                onChange={(e) => setFormData(prev => ({ ...prev, teacherName: e.target.value }))}
                                placeholder="e.g., Dr. Smith"
                            />
                        </div>
                    </Card>

                    <Card>
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-academic-navy">
                                Initial Topics/Modules
                            </label>

                            {formData.initialTopics.map((topic, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={topic}
                                        onChange={(e) => updateTopic(index, e.target.value)}
                                        placeholder={`Topic ${index + 1}`}
                                    />
                                    {formData.initialTopics.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTopicField(index)}
                                            className="min-h-[44px] min-w-[44px] p-3 text-academic-danger hover:bg-red-50 rounded-lg transition-colors"
                                            aria-label="Remove topic"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                onClick={addTopicField}
                            >
                                <Plus className="inline-block mr-2" size={18} />
                                Add Another Topic
                            </Button>
                        </div>
                    </Card>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={loading || !formData.subject.trim()}
                    >
                        {loading ? 'Creating Session...' : 'Create Session'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
