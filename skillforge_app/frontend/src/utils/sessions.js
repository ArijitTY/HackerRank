import api from '../api';

// Fetch drive sessions. apiPrefix is '/super' or '/admin'.
export async function fetchSessions(apiPrefix) {
  try {
    const res = await api.get(`${apiPrefix}/sessions`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    return [];
  }
}
