import { cn } from '../../lib/cn';

export default function TableCell({ children, className }) {
  return (
    <td className={cn('px-5 py-3.5 text-[#b8aa7a] align-middle', className)}>
      {children}
    </td>
  );
}
