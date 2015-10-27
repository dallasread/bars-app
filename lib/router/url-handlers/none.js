module.exports = {
    detectPathChanges: function detectPathChanges() { },

    findPath: function findPath(path) {
        return path || '/';
    },

    validatePathFormat: function validatePathFormat(path) {
        return {
            valid: true,
            action: function invalidPathAction() {}
        };
    }
};
