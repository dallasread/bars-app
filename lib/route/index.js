var CustomElement = require('../utils/custom-element'),
    Bindable = require('generate-js-bindings');

var config = {
    templates: {
        index: 'No template set for {{@key}}.'
    }
};

var Route = CustomElement.createElement(config, function Route(options) {
    var _ = this;

    _.supercreate(options);

    _.$element
        .attr('data-blueprint', options.blueprint)
        .attr('data-path', options.path);
});

Bindable.generateGettersSetters(Route, ['app', 'params', 'parent', 'path', 'blueprint']);

Route.definePrototype({
    beforeLoad: function beforeLoad(done) {
        typeof done === 'function' && done();
    },

    afterLoad: function afterLoad(done) {
        typeof done === 'function' && done();
    },

    beforeUnload: function beforeUnload(done) {
        typeof done === 'function' && done();
    },

    afterUnload: function afterUnload(done) {
        typeof done === 'function' && done();
    },

    _append: function _append() {
        var _ = this;

        if (_.$element[0].parentElement) return;

        if (_.parent) {
            _.parent.$element.find('[data-outlet]:first').append(_.$element);
        } else {
            _.app.$element.append(_.$element);
        }
    },

    _remove: function _remove() {
        var _ = this,
            $el = _.$element[0],
            $parent = $el.parentElement;

        _.parent = null;
        if (!$parent) return;

        $parent.removeChild($el);
    }
});

module.exports = Route;
