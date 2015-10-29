Bars-App is a simple framework for building JS-based web applications.

## What does an App look like?
```
var myApp = require('bars-app').Router.create({
    $element: $('#lcs'),
    routes: {
        '/': require('../path/to/index/route')
    },
    urlType: 'hash' // hash | history | none
});
myApp.go('/');
```

## What does a Route look like? (eg. `../path/to/index/route`)
```
var Route = require('bars-app').Route,
    config = {
        templates: {
            index: require('../path/to/bars/template.bars')
        },
        interactions: {
            click: { // This is an example UI event
                event: 'click',
                target: 'a[href]',
                listener: function listener(e, $el) {
                    var _ = this,
                        href = $el.attr('href');

                    alert('You\'re visiting ' + href);

                    _.app.set('mySpecialVariable', href);
                    _.app.go( href );

                    return false;
                }
            }
        }
    };

var IndexRoute = Route.createElement(config, function IndexRoute(options) {
    var _ = this;
    _.supercreate(options);
    // you can access myApp with _.app
});

IndexRoute.definePrototype({
    // All of the following functions are optional

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
    }
});

module.exports = IndexRoute;
```

## What does a Bars template look like? (eg. `../path/to/bars/template.bars`)

In short, however you want it to look. You can use HTML or plain text. Use `{{}}` to access variables. Dot paths are delimited with `/` (different from Handlebars or Mustache). We've set you up with a default `app` variable that has `currentRoute` on it.

```
{{#if mySpecialVariable}}
    <p>{{mySpecialVariable}}</p>
{{else}}
    <p>{{app/currentRoute/path}}</p>
{{/if}}
```

## How can I learn more about this Bars thing?
[Visit the Bars repo.](https://github.com/Mike96Angelo/Bars)

## TODO
- History urlType
