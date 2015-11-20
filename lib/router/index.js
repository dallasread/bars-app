var CustomElement = require('generate-js-custom-element'),
    Bindable = require('generate-js-bindings'),
    Interactions = require('./interactions'),
    urlHandlers = require('./url-handlers'),
    applyParams = require('../utils/apply-params'),
    async = require('async'),
    config = {
        templates: {
            index: ''
        }
    };

var Router = CustomElement.createElement(config, function Router(options) {
    var _ = this;

    _.supercreate({
        $element: options.$element
    });

    _.defineProperties({
        routesCache: {}
    });

    _.defineProperties({
        writable: true,
        enumerable: true
    }, options);

    _.urlType = _.urlType || 'hash', // hash | history | none

    _.defineProperties(urlHandlers[_.urlType]);
    _.detectPathChanges();
});

Router.attach(Interactions);
Bindable.generateGettersSetters(Router, ['currentRoute']);

Router.definePrototype({
    findRoute: function findRoute(path) {
        var _ = this,
            routeNames = Object.keys(_.routes),
            routeNamesLength = routeNames.length,
            routeName, routeRegex, route;

        for (var i = 0; i < routeNamesLength; i++) {
            routeName = routeNames[i];
            routeRegex = new RegExp('^' + routeName.replace(/:[^/$\^]+/, '[^/$\^]+') + '$');

            if (routeRegex.test(path)) {
                route = _.routesCache[path];

                if (!route) {
                    route = _.routesCache[path] = _.routes[routeName].create({
                        blueprint: routeName,
                        path: path,
                        app: _,
                        params: applyParams(routeName, path)
                    });
                }

                break;
            }
        }

        return route;
    },

    go: function go(path) {
        var _ = this;

        path = path || _.findPath(path);

        var validateFormat = _.validatePathFormat(path);

        if (!validateFormat.valid) {
            // _.debug && console.debug('Path is not valid: ' + path);
            validateFormat.action();
            return;
        }

        var route = _.findRoute(path);

        if (route === _.currentRoute) {
            _.debug && console.debug('Route is already present: ' + path);
            return;
        }

        if (!route) {
            _.debug && console.debug('Route not found: ' + path);
            if (_.currentRoute) _.go(_.currentRoute.path);
            return;
        }

        _.debug && console.debug('Transitioning to: ', route.path);
        _.transitionTo(route);
    },

    transitionTo: function transitionTo(route) {
        var _ = this;

        var newPathSplit = route.path.split('/'),
            newPathSplitLength = newPathSplit.length,
            newPathSegment = '',
            routesToUnload = [],
            routesToLoad = [],
            i = 0,
            newRoute, lastParent;

        route.ancestors = [];

        // Build ancestors
        for (i = 0; i < newPathSplitLength; i++) {
            newPathSegment += (newPathSegment[newPathSegment.length - 1] === '/' ? '' : '/') + newPathSplit[i];
            newRoute = _.findRoute(newPathSegment);

            if (newRoute) {
                if (lastParent && newRoute != lastParent) {
                    newRoute.parent = lastParent;
                }

                route.ancestors.push(newRoute);
                lastParent = newRoute;
            }
        }

        var newAncestors = route.ancestors,
            newAncestorsLength = newAncestors.length,
            currentAncestors = _.currentRoute ? _.currentRoute.ancestors : [],
            currentAncestorsLength = currentAncestors.length,
            removeRemainingCurrentAncestors = false,
            newAncestor, currentAncestor;

        for (i = 0; i < Math.max(newAncestorsLength, currentAncestorsLength); i++) {
            newAncestor = newAncestors[i];
            currentAncestor = currentAncestors[i];

            if (newAncestor !== currentAncestor) {
                if (currentAncestor && i < currentAncestorsLength) {
                    removeRemainingCurrentAncestors = true;
                    routesToUnload.unshift(currentAncestor);
                }
            }

            if (
                (newAncestor && newAncestor !== currentAncestor) ||
                (newAncestor && i < newAncestorsLength)
            ) {
                routesToLoad.push(newAncestor);
            }
        }

        async.eachSeries(routesToUnload, function iterator(r, done) {
            _.debug && console.debug('Unloading: ', r.path);
            r.beforeUnload(function() {
                r._remove();
                r.afterUnload(function() {
                    done();
                });
            });
        }, function done() {
            _.currentRoute = route;
            _.markActive(route.path);

            async.eachSeries(route.ancestors, function performBeforeLoads(r, done) {
                _.debug && console.debug('Loading: ', r.path);

                r._append();
                r.update();

                function load() {
                    r.afterLoad(function() {
                        r.$element.find('[autofocus]:first').trigger('focus');
                        _.debug && console.debug('Done Loading: ', r.path);
                        done();
                    });
                }

                if (routesToLoad.indexOf(r) !== -1) {
                    r.beforeLoad(function(err) {
                        if (typeof err === 'string') return done(err);
                        load();
                    });
                } else {
                    load();
                }
            }, function done(err) {
                if (typeof err === 'string') {
                    _.debug && console.debug('Redirecting: ', err);
                    return _.go(err);
                }

                _.markActive(route.path);
            });
        });
    },

    markActive: function markActive(path) {
        if (!path) return;

        var _ = this,
            splath = path.split('/');

        _.$element.find('[href], [data-go]')
            .removeClass('active')
            .removeClass('parent-of-active');

        _.$element.find('[href="#!' + path + '"], [data-go="' + path + '"]')
            .addClass('active');

        var ancestorPath = '';
        for (var i = 1; i < splath.length - 1; i++) {
            ancestorPath += '/' + splath[i];

            _.$element.find('[href="#!' + ancestorPath + '"], [data-go="' + ancestorPath + '"]')
                .addClass('parent-of-active');
        }
    }
});

module.exports = Router;
