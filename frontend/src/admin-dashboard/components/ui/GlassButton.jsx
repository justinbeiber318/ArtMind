import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function GlassButton({ children, icon, primary, onClick, type = 'button', disabled = false }) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
        disabled && 'opacity-50 cursor-not-allowed',
        primary
          ? 'bg-gradient-to-r from-[#d4af5f] to-[#c39e4e] text-[#070707] shadow-lg shadow-[#d4af5f]/25 hover:shadow-[#d4af5f]/40'
          : 'bg-[#121212]/90 backdrop-blur-sm border border-[#242424] text-[#b8aa7a] hover:border-[#d4af5f] hover:text-[#d4af5f]',
      )}
    >
      {icon}
      {children}
    </motion.button>
  );
}
