// Generate a unique 4-digit session code
export const generateSessionCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
}

// Validate that a code is exactly 4 digits
export const validateCode = (code) => {
    return /^\d{4}$/.test(code)
}
