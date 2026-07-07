import { useQuery } from '@tanstack/react-query';
import { paintingApi } from '../../api/endpoints.js';
import { buildMuseumCollection } from './museumData.js';

async function loadMuseumPaintings(limit) {
  try {
    const response = await paintingApi.list({ page: 1, limit });
    const records = Array.isArray(response?.data) ? response.data : [];
    return buildMuseumCollection(records, limit);
  } catch {
    return buildMuseumCollection([], limit);
  }
}

export function usePaintingsForMuseum(limit = 16) {
  return useQuery({
    queryKey: ['virtual-gallery-paintings', limit],
    queryFn: () => loadMuseumPaintings(limit),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

