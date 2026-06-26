import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';

import { userApi } from '../../api/endpoints';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import TableCell from '../components/ui/TableCell';
import TableRow from '../components/ui/TableRow';

const roleVariant = {
  ADMIN: 'blue',
  USER: 'gray',
  ARTIST: 'violet',
};

export default function UsersTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => userApi.list({ limit: 25 }),
  });

  return (
    <DataTable
      title="Users"
      subtitle="All registered accounts"
      icon={<Users size={16} />}
      head={['Name', 'Email', 'Role', 'Joined']}
      loading={isLoading}
      rows={(data?.data || []).map((user, i) => (
        <TableRow key={user.id} i={i}>
          <TableCell>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#d4af5f] to-[#c39e4e] flex items-center justify-center text-[#070707] text-[10px] font-bold flex-shrink-0">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="font-medium text-[#f0e6c8]">{user.name}</span>
            </div>
          </TableCell>
          <TableCell className="text-[#8a8a8a]">{user.email}</TableCell>
          <TableCell>
            <StatusBadge variant={roleVariant[user.role] || 'gray'}>
              {user.role}
            </StatusBadge>
          </TableCell>
          <TableCell className="text-[#8a8a8a] text-xs">
            {new Date(user.createdAt).toLocaleDateString()}
          </TableCell>
        </TableRow>
      ))}
    />
  );
}
