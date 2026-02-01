export const Input = ({
    label,
    error,
    className = '',
    required = false,
    id,
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-semibold text-academic-navy mb-2"
                >
                    {label} {required && <span className="text-academic-danger">*</span>}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full px-4 py-3 min-h-[44px]
          border-2 rounded-lg
          ${error ? 'border-academic-danger' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-academic-blue
          text-base
          ${className}
        `}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
                {...props}
            />
            {error && (
                <p id={`${inputId}-error`} className="mt-1 text-sm text-academic-danger" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}
