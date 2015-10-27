module.exports = function applyParams(pattern, path) {
    var params = {},
        patternSplit = pattern.split('/'),
        pathSplit = path.split('/'),
        segment;

    for (var i = 0; i < patternSplit.length; i++) {
        segment = patternSplit[i];

        if (segment[0] === ':') {
            params[segment.replace(/:/, '')] = pathSplit[i];
        }
    }

    return params;
};
