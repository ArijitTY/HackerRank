import api from '../api';

// Fetch tests grouped for a dropdown. Role determines endpoint scope.
// Returns { regular: [...], interviewPrep: [...] }.
export const fetchTestsForDropdown = async (role) => {
  const prefix = role === 'super_admin' ? '/super' : '/admin';
  try {
    const res = await api.get(`${prefix}/tests/all-for-dropdown`);
    return res.data || { regular: [], interviewPrep: [] };
  } catch (e) {
    return { regular: [], interviewPrep: [] };
  }
};

// Render optgroup options from the grouped response.
// Usage in JSX:
//   <select>
//     <option value="">All Tests</option>
//     {renderTestOptions(grouped)}
//   </select>
export const renderTestOptions = (grouped) => {
  const parts = [];
  if (grouped?.regular?.length) {
    parts.push(
      ['regular', 'Regular Tests', grouped.regular]
    );
  }
  if (grouped?.interviewPrep?.length) {
    parts.push(
      ['interviewPrep', 'Interview Prep Tests', grouped.interviewPrep]
    );
  }
  return parts;
};
