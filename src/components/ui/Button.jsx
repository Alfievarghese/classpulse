import { motion } from 'framer-motion'

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    className = '',
    type = 'button',
    ...props
}) => {
    const variants = {
        primary: 'bg-academic-blue hover:bg-academic-navy text-white',
        secondary: 'bg-academic-slate hover:bg-academic-navy text-white',
        success: 'bg-academic-success hover:bg-green-700 text-white',
        outline: 'border-2 border-academic-blue text-academic-blue hover:bg-academic-blue hover:text-white'
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm min-h-[36px]',
        md: 'px-6 py-3 text-base min-h-[44px]',
        lg: 'px-8 py-4 text-lg min-h-[52px]'
    }

    return (
        <motion.button
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
            onClick={onClick}
            disabled={disabled}
            type={type}
            aria-label={typeof children === 'string' ? children : undefined}
            {...props}
        >
            {children}
        </motion.button>
    )
}
