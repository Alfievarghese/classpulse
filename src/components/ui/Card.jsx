export const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`
        bg-white rounded-xl shadow-lg p-6
        border border-gray-100
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    )
}
