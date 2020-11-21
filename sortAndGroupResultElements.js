const sortAndGroupResultElements = (results) => {
    return results.sort((a, b) => {
           if (a.phire === b.phire) {
              // Price is only important when cities are the same
              return a.phirn - b.phirn ;
           }
           return a.phire > b.phire ? -1 : 1;
        }).reduce((r, a) => {
            r[a.phire] = [...r[a.phire] || [], a !== undefined && a];
            return r;
           }, {});
}

module.exports = { sortAndGroupResultElements }