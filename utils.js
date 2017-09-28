module.exports = {
  getNormalizedPathPattern,
  removeQuery,
  escapeSpecialCharacters
}
function getNormalizedPathPattern (req) {
  if (req.url) return escapeSpecialCharacters(removeQuery(req.url))
  return null
}
function removeQuery (str) {
  if (str.indexOf('?') > -1) return str.split('?')[0]
  return str
}
function escapeSpecialCharacters (str) {
  return str.split(/[/:]/).filter(Boolean).join('_')
}
