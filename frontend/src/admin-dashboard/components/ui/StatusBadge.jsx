import { cn } from '../../lib/cn';
import { badgeMap } from '../../theme/dashboardTheme';

export default function StatusBadge({ children, variant = 'gray' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
        badgeMap[variant] || badgeMap.gray,
      )}
    >
      {children}
    </span>
  );
}
