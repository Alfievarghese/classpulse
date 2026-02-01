// Generate unique session token for anonymous voting
export const getSessionToken = () => {
    let token = localStorage.getItem('classpulse_session_token')

    if (!token) {
        token = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('classpulse_session_token', token)
    }

    return token
}

export const clearSessionToken = () => {
    localStorage.removeItem('classpulse_session_token')
}
