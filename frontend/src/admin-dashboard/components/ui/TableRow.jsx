import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/animations';

export default function TableRow({ children, i }) {
  return (
    <motion.tr
      variants={fadeUp}
      custom={i}
      className="border-b border-[#1a1a1a] hover:bg-[#d4af5f]/10 transition-colors duration-150 group"
    >
      {children}
    </motion.tr>
  );
}
