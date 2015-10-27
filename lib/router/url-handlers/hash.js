function stripHash(hash) {
    return hash && (hash + '').replace(/#!/, '');
}

module.exports = {
    detectPathChanges: function detectPathChanges() {
        var _ = this;

        $(window).on('hashchange', function() {
            _.go();
        });
    },

    findPath: function findPath(path) {
        return path || stripHash(window.location.hash);
    },

    validatePathFormat: function validatePathFormat(path) {
        if (window.location.hash !== '#!' + path) {
            return {
                valid: false,
                action: function invalidPathAction() {
                    window.location.hash = '#!' + path;
                }
            };
        }

        return {
            valid: path && path.length && path[0] === '/',
            action: function invalidPathAction() {
                window.location.hash = '#!/';
            }
        };
    }
};
