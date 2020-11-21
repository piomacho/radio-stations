const { unescapeLeadingUnderscores } = require("typescript")

const findInUnused = (results, unused) => {
  return unused.find(e => e.phirn === results.phirn && e.phire === results.phire)
}

module.exports = { findInUnused }