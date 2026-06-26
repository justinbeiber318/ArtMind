import { cn } from '../../lib/cn';

export default function GlassCard({ children, className }) {
  return (
    <div
      className={cn(
        'bg-[#121212]/90 backdrop-blur-sm border border-[#242424] rounded-2xl shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
