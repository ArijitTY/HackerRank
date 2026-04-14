// Parse a DB/ISO timestamp. Values are stored as local (IST) ISO strings
// like "YYYY-MM-DDTHH:MM:SS.sss". Legacy values may have a trailing Z (UTC)
// or use " " instead of "T" — handle all.
export const parseStamp = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw) ? null : raw;
  if (typeof raw === 'number') return new Date(raw);
  const s = String(raw);
  const stripped = s.endsWith('Z') ? s.slice(0, -1) : s;
  const iso = stripped.includes('T') ? stripped : stripped.replace(' ', 'T');
  const d = new Date(iso);
  return isNaN(d) ? null : d;
};

// DD/MM/YYYY
export const formatDate = (raw) => {
  const d = parseStamp(raw);
  if (!d) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
};

// DD/MM/YYYY, hh:mm AM/PM
export const formatDateTime = (raw) => {
  const d = parseStamp(raw);
  if (!d) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const h = String(hours).padStart(2, '0');
  return `${day}/${month}/${year}, ${h}:${minutes} ${ampm}`;
};

// hh:mm AM/PM (time only)
export const formatTime = (raw) => {
  const d = parseStamp(raw);
  if (!d) return '-';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const h = String(hours).padStart(2, '0');
  return `${h}:${minutes} ${ampm}`;
};

// Backwards-compatible aliases (callers still import these).
export const formatIST = formatDateTime;
export const formatISTDate = formatDate;
export const formatISTTime = formatTime;

// Current local time as ISO-like string (no Z) matching backend storage.
export const nowLocalIso = () => {
  const d = new Date();
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
};
