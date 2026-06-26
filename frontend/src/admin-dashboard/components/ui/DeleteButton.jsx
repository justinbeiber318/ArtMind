import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function DeleteButton({ onClick, disabled, busy }) {
  return (
    <motion.button
      whileHover={!disabled && !busy ? { scale: 1.05 } : {}}
      whileTap={!disabled && !busy ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled || busy}
      title={disabled ? 'Has paintings — cannot delete' : 'Delete'}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
        disabled
          ? 'border-[#242424] text-[#5f5f5f] cursor-not-allowed'
          : busy
            ? 'border-[#8b2e2e]/40 text-[#e28b8b]/60 bg-[#8b2e2e]/15 cursor-wait'
            : 'border-[#8b2e2e]/40 text-[#e28b8b] hover:bg-[#8b2e2e]/90 hover:text-[#f0e6c8] hover:border-[#8b2e2e] hover:shadow-lg hover:shadow-[#8b2e2e]/20',
      )}
    >
      <Trash2 size={12} />
      {busy ? 'Deleting…' : 'Delete'}
    </motion.button>
  );
}
