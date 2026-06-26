import { useQuery } from '@tanstack/react-query';
import { Bot, UserCircle } from 'lucide-react';

import { analyticsApi } from '../../api/endpoints';
import { truncate } from '../lib/cn';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import TableCell from '../components/ui/TableCell';
import TableRow from '../components/ui/TableRow';

export default function AiLogs() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'ailogs'],
    queryFn: analyticsApi.aiLogs,
  });

  return (
    <DataTable
      title="AI Logs"
      subtitle="All search and recognition events"
      icon={<Bot size={16} />}
      head={['User', 'Prompt', 'Response', 'Tokens', 'When']}
      loading={isLoading}
      rows={(data || []).map((log, i) => (
        <TableRow key={log.id} i={i}>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#153d1f]/35 flex items-center justify-center flex-shrink-0">
                <UserCircle size={12} className="text-[#6fbf73]" />
              </div>
              <span className="text-xs text-[#b8aa7a]">{log.user?.email || 'guest'}</span>
            </div>
          </TableCell>
          <TableCell className="max-w-[200px]">
            <span className="text-xs font-mono text-[#b8aa7a] bg-[#0c0c0c] px-2 py-1 rounded-lg block truncate">
              {truncate(log.prompt, 80)}
            </span>
          </TableCell>
          <TableCell className="max-w-[240px]">
            <span className="text-xs text-[#8a8a8a] block truncate">
              {truncate(log.response, 100)}
            </span>
          </TableCell>
          <TableCell>
            <StatusBadge variant="emerald">{log.tokensUsed ?? '—'}</StatusBadge>
          </TableCell>
          <TableCell className="text-xs text-[#8a8a8a]">
            {new Date(log.createdAt).toLocaleString()}
          </TableCell>
        </TableRow>
      ))}
    />
  );
}
