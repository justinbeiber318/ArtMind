import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Palette } from 'lucide-react';

import { artistApi } from '../../api/endpoints';
import DataTable from '../components/ui/DataTable';
import DeleteButton from '../components/ui/DeleteButton';
import StatusBadge from '../components/ui/StatusBadge';
import TableCell from '../components/ui/TableCell';
import TableRow from '../components/ui/TableRow';

export default function ArtistsTable() {
  const queryClient = useQueryClient();
  const [err, setErr] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'artists'],
    queryFn: () => artistApi.list({ limit: 100 }),
  });

  const deleteArtist = useMutation({
    mutationFn: id => artistApi.remove(id),
    onSuccess: () => {
      setErr('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
      queryClient.invalidateQueries({ queryKey: ['an'] });
      toast.success('Artist deleted');
    },
    onError: e => {
      const msg = e?.response?.data?.message || 'Could not delete this artist.';
      setErr(msg);
      toast.error(msg);
    },
  });

  const handleDelete = artist => {
    if (window.confirm(`Delete artist "${artist.name}"?`)) {
      deleteArtist.mutate(artist.id);
    }
  };

  return (
    <DataTable
      title="Artists"
      subtitle="An artist can only be deleted once all their paintings are removed."
      icon={<Palette size={16} />}
      head={['Artist', 'Nationality', 'Paintings', '']}
      loading={isLoading}
      error={err}
      rows={(data?.data || []).map((artist, i) => {
        const paintingsCount = artist._count?.paintings ?? 0;

        return (
          <TableRow key={artist.id} i={i}>
            <TableCell className="font-medium text-[#f0e6c8]">{artist.name}</TableCell>
            <TableCell>{artist.nationality || '—'}</TableCell>
            <TableCell>
              <StatusBadge variant={paintingsCount > 0 ? 'blue' : 'gray'}>
                {paintingsCount} paintings
              </StatusBadge>
            </TableCell>
            <TableCell className="text-right">
              <DeleteButton
                onClick={() => handleDelete(artist)}
                disabled={paintingsCount > 0}
                busy={deleteArtist.isPending && deleteArtist.variables === artist.id}
              />
            </TableCell>
          </TableRow>
        );
      })}
    />
  );
}
