module.exports = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(409).json({ message: `${field} already exists` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};