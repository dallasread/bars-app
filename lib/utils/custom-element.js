var Bindable = require('generate-js-bindings'),
    Bars = require('bars'),
    globalBars = Bars.create();

function attach(config) {
    var _ = this,
        klass = config.class,
        proto = config.proto,
        key;

    delete config.proto;
    delete config.class;

    _.registerConfig(config);

    for (key in klass) {
        _[key] = klass[key];
    }

    _.definePrototype({
        writable: true,
        configurable: true
    }, proto);

    config.class = klass;
    config.proto = proto;
}

function registerConfig(config) {
    var _ = this,
        templates = config.templates,
        partials = config.partials,
        helpers = config.helpers,
        blocks = config.blocks,
        interactions = config.interactions,
        key;

    delete config.templates;
    delete config.partials;
    delete config.helpers;
    delete config.blocks;
    delete config.interactions;

    if (templates) {
        for (key in templates) {
            _.proto.templates[key] = globalBars.parse(templates[key]);
        }
    }

    if (partials) {
        for (key in partials) {
            _.proto.partials[key] = globalBars.parse(partials[key]);
        }
    }

    if (helpers) {
        for (key in helpers) {
            _.proto.helpers[key] = helpers[key];
        }
    }

    if (blocks) {
        for (key in blocks) {
            _.proto.blocks[key] = blocks[key];
        }
    }

    if (interactions) {
        for (key in interactions) {
            _.proto.interactions[key] = interactions[key];
        }
    }

    _.definePrototype({
        writable: true,
        enumerable: true,
        configurable: true
    }, config);

    config.templates = templates;
    config.partials = partials;
    config.helpers = helpers;
    config.blocks = blocks;
    config.interactions = interactions;
}

function registerBars(_) {
    var key;

    for (key in _.partials) {
        if (!_.Bars.partials[key]) {
            _.Bars.partials[key] = _.Bars.build(_.partials[key]);
        }
    }

    for (key in _.templates) {
        if (!_.templates[key].bars) {
            _.templates[key] = _.Bars.build(_.templates[key]);
        }
    }

    for (key in _.helpers) {
        if (!_.helpers[key].bars) {
            _.Bars.helpers[key] = _.helpers[key];
        }
    }

    for (key in _.blocks) {
        if (!_.blocks[key].bars) {
            _.Bars.blocks[key] = _.blocks[key];
        }
    }
}

function createElement(config, constructor) {
    var _ = this,
        el = _.generate(constructor);

    el.definePrototype({
        templates: Object.create(_.proto.templates),
        helpers: Object.create(_.proto.helpers),
        blocks: Object.create(_.proto.blocks),
        partials: Object.create(_.proto.partials),
        interactions: Object.create(_.proto.interactions)
    });

    el.createElement = createElement;
    el.registerConfig = registerConfig;
    el.attach = attach;

    el.registerConfig(config);

    return el;
}

var CustomElement = Bindable.generate(function CustomElement(options) {
    options = options || {};

    var _ = this,
        $element = $(options.$element);

    _.supercreate(options);

    _.$element = $element.length ? $element : $('<div>');

    _.Bars = Bars.create();

    registerBars(_);

    _.registerInteractions(_.interactions);

    _.defineProperties({
        templates: Object.create(_.templates)
    });

    _.render();
});

CustomElement.createElement = createElement;

CustomElement.definePrototype({
    templates: {},
    helpers: {},
    blocks: {},
    partials: {},
    interactions: {}
});

CustomElement.definePrototype({
    update: function(data) {
        var _ = this;
        _.dom.update(data || _._data);
    },

    dispose: function dispose() {
        var _ = this;
        _.$element.off();
        _.$element.empty();
    },

    render: function render(template) {
        var _ = this;

        template = typeof template === 'string' ? _.templates[template] : _.templates.index;

        if (template && typeof template.render === 'function') {
            _.$element.empty();
            _.dom = template.render(_._data);
            _.dom.appendTo(_.$element[0]);
            _.dom.update(_._data);
        } else {
            _.emit('error', new Error('Failed to render: Invalid template.'));
        }
    }
});

CustomElement.definePrototype({
    __eventListener: function eventListener(interaction) {
        var _ = this;

        return function (event) {
            return interaction.listener.call(_, event, $(this));
        };
    },

    registerInteractions: function registerInteractions(interactions) {
        var _ = this,
            interaction, key;

        for (key in interactions) {
            interaction = interactions[key];

            if (interaction.target) {
                _.$element.on(interaction.event, interaction.target, _.__eventListener(interaction));
            } else {
                _.$element.on(interaction.event, _.__eventListener(interaction));
            }
        }
    },

    registerTemplates: function registerTemplates(templates) {
        var _ = this,
            key;

        for (key in templates) {
            _.templates[name] = _.Bars.key( templates[key] );
        }
    },

    registerBlocks: function registerBlocks(blocks) {
        var _ = this,
            key;

        for (key in blocks) {
            _.Bars.registerBlock(key, blocks[key]);
        }
    },

    registerPartials: function registerPartials(partials) {
        var _ = this,
            key;

        for (key in partials) {
            _.Bars.registerPartial(key, partials[key]);
        }
    },

    registerHelpers: function registerHelpers(helpers) {
        var _ = this,
            key;

        for (key in helpers) {
            _.Bars.registerHelper(key, helpers[key]);
        }
    },
});

module.exports = CustomElement;
