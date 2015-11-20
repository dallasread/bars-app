module.exports = {
    detectPathChanges: function detectPathChanges() {
        var _ = this;

        window.addEventListener('popstate', function(event) {
            _.go();
        });
    },

    findPath: function findPath(path) {
        return path || window.location.pathname;
    },

    validatePathFormat: function validatePathFormat(path) {
        var _ = this;

        if (window.location.pathname !== path) {
            return {
                valid: false,
                action: function invalidPathAction() {
                    history.pushState(null, null, path);
                    _.go();
                }
            };
        }

        return {
            valid: path && path.length && path[0] === '/',
            action: function invalidPathAction() {
                history.pushState(null, null, '/');
            }
        };
    }
};
