import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ImageIcon } from 'lucide-react';

import { paintingApi } from '../../api/endpoints';
import DataTable from '../components/ui/DataTable';
import DeleteButton from '../components/ui/DeleteButton';
import StatusBadge from '../components/ui/StatusBadge';
import TableCell from '../components/ui/TableCell';
import TableRow from '../components/ui/TableRow';

export default function PaintingsTable() {
  const queryClient = useQueryClient();
  const [err, setErr] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'paintings'],
    queryFn: () => paintingApi.list({ limit: 50, sort: 'newest' }),
  });

  const deletePainting = useMutation({
    mutationFn: id => paintingApi.remove(id),
    onSuccess: () => {
      setErr('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'paintings'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['an'] });
      toast.success('Painting deleted successfully');
    },
    onError: e => {
      const msg = e?.response?.data?.message || 'Could not delete this painting.';
      setErr(msg);
      toast.error(msg);
    },
  });

  const handleDelete = painting => {
    if (window.confirm(`Delete "${painting.title}"? This permanently removes the painting.`)) {
      deletePainting.mutate(painting.id);
    }
  };

  return (
    <DataTable
      title="Paintings"
      subtitle={`${data?.data?.length ?? '—'} total paintings`}
      icon={<ImageIcon size={16} />}
      head={['Title', 'Artist', 'Category', 'Style', 'Views', '']}
      loading={isLoading}
      error={err}
      rows={(data?.data || []).map((painting, i) => (
        <TableRow key={painting.id} i={i}>
          <TableCell className="font-medium text-[#f0e6c8]">{painting.title}</TableCell>
          <TableCell>{painting.artist?.name}</TableCell>
          <TableCell>
            <StatusBadge variant="blue">{painting.category?.name}</StatusBadge>
          </TableCell>
          <TableCell>{painting.style?.name || '—'}</TableCell>
          <TableCell className="font-mono">{painting.viewCount?.toLocaleString()}</TableCell>
          <TableCell className="text-right">
            <DeleteButton
              onClick={() => handleDelete(painting)}
              busy={deletePainting.isPending && deletePainting.variables === painting.id}
            />
          </TableCell>
        </TableRow>
      ))}
    />
  );
}
