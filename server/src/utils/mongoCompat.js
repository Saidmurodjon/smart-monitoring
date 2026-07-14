// Mirrors Prisma's numeric `id` as a stringified `_id`, recursively, so
// existing client code written against Mongo's `_id` keeps working.
function withMongoId(data) {
  if (Array.isArray(data)) {
    return data.map(withMongoId);
  }
  if (data && typeof data === "object" && !(data instanceof Date)) {
    const out = { ...data };
    if (out.id !== undefined && out._id === undefined) {
      out._id = String(out.id);
    }
    for (const key of Object.keys(out)) {
      out[key] = withMongoId(out[key]);
    }
    return out;
  }
  return data;
}

module.exports = { withMongoId };
