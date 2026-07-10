function parseId(value) {
  const id = parseInt(value, 10);
  if (isNaN(id) || id <= 0) return null;
  return id;
}

module.exports = { parseId };
