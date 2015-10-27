var XBrowser = require('../utils/x-browser');

module.exports = {
    interactions: {
        go: {
            event: XBrowser.event('click'),
            target: '[data-go]',
            listener: function listener(e, $el) {
                var _ = this;
                _.go($el.attr('data-go'));
            }
        }
    }
};
