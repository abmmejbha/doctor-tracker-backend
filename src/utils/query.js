const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPagination = (q) => {
  const page = Math.max(parseInt(q.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit) || 10, 1), 50);
  return { page, limit };
};

const getDateRange = (from, to) => {
  if (!from && !to) return null;
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return range;
};

module.exports = { escapeRegex, getPagination, getDateRange };