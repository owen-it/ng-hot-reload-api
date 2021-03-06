var ng;
var map = window.NG_HOT_MAP = Object.create(null);
var slice = Array.prototype.slice;
var isArray = Array.isArray;
var hasOwnProperty = Object.hasOwnProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var keys = Object.keys;
var kebabCase  = require('./utils').kebabCase;

var installed = false;
var isReplaced = false;

exports.install = function(angular, replace)
{ 
    var v = angular.version;
    exports.compatible = (v.major == 1 && v.minor >= 5);

    // https://docs.angularjs.org/guide/migration#migrating-from-1-4-to-1-5
    if (!exports.compatible) {
        console.warn(
          '[HMR] You are using a version of ng-hot-reload-api that is ' +
          'only compatible with AngularJs core ^1.5.0.'
        )
        return;
    }

    if(installed) return;
    
    installed = true;
    isReplaced = replace;

    ng = angular.__esModule  ? angular.default : angular;
    
    wrap(ng)
}

function wrap(ng) {
   
    var __ng__ = ng.module;

    function __module__(){

        var moduleNg = __ng__.apply(this, arguments);

        moduleNg.component = registerComponent.bind(moduleNg);
        
        if (moduleNg.components) return moduleNg;

        moduleNg.component = (function (h) {
            var component = h.component;

            return function (name, options) {
                // We map all the components that are 
                // registered by angular
                if (options.__id && map[options.__id]) {
                    map[options.__id].name = name;
                } else {
                    map[options.__id] = { name: name };
                }

                if(options.components) {
                    h.components(options.components);
                }

                // Register the component
                return component(name, options);
            }
        })(moduleNg);
        
        function __components__ (components) {

            if (ng.isObject(components)) {
                Object.keys(components).forEach(function (name) {
                    var options = components[name];

                    if (options.components) __components__(options.components);

                    if (!queued(name, moduleNg)) {
                        moduleNg.component(name, options);
                    };
                })
            }

            return moduleNg;
        }

        moduleNg.components = __components__;
        return moduleNg;
    }

    ng.module = __module__;
}

exports.register = function(id, component)
{
    map[id] = {
        component: component
    }
}

exports.reload = function(id, component)
{
    var target = map[id];
    var app = ng.element(document);
    var $injector = app.injector();

    if ($injector && target) {
        var $name = target.name || target.component.name;
        var $component  = $injector.get($name + 'Directive')[0];
        var $compile    = $injector.get('$compile');
        var $controller = $injector.get('$controller');
        
        if ($component) {
            $component.template = component.template || '';

            var originCtrlPrototype = getControllerPrototype($component.controller);
            var targetCtrlPrototype = getControllerPrototype(component.controller);

            var allProps = getOwnPropertyNames(targetCtrlPrototype);
            var selProps = keys(targetCtrlPrototype);

            var finallyProps = allProps.filter(function (key) {
                return selProps.indexOf(key) === -1 && key !== 'constructor';
            });

            selProps.forEach(function (prop) {
                originCtrlPrototype[prop] = targetCtrlPrototype[prop];
            });
        
            slice.call(app.find(kebabCase($name))).forEach(function(element){
                var $element = ng.element(element);
                $element.html($component.template);
                $compile($element.contents())($element.isolateScope());
            });

            app.find('html').scope().$apply();
            console.info('[NGC] Hot reload ' + $name + ' from ng-component-load')
        }
    }
}

function getControllerPrototype(controller){
    return ((isArray(controller) ? controller[controller.length - 1] : controller) || function(){}).prototype;
}

function queued (name, moduleNg) {
    var exist = false;

    moduleNg._invokeQueue.forEach(function(proccess){
        if (proccess[1] === 'component' && proccess[2][0] === name) {
            exist = true; return;
        };
    })
    
    return exist;
}


function registerComponent(name, options) {

    if(map[options.__id].instance) return;

    var controller = options.controller || function () { };

    function factory($injector) {
        function makeInjectable(fn) {
            if (typeof fn === 'function' || isArray(fn)) {
                return /** @this */ function (tElement, tAttrs) {
                    return $injector.invoke(fn, this, { $element: tElement, $attrs: tAttrs });
                };
            } else {
                return fn;
            }
        }

        var template = (!options.template && !options.templateUrl ? '' : options.template);
        var ddo = {
            controller: controller,
            controllerAs: identifierForController(options.controller) || options.controllerAs || '$ctrl',
            template: makeInjectable(template),
            templateUrl: makeInjectable(options.templateUrl),
            transclude: options.transclude,
            scope: {},
            bindToController: options.bindings || {},
            restrict: 'E',
            require: options.require,
            replace: isReplaced // hijacked 
        };

        // Copy annotations (starting with $) over to the DDO
        angular.forEach(options, function (val, key) {
            if (key.charAt(0) === '$') ddo[key] = val;
        });

        return ddo;
    }

    // TODO(pete) remove the following 'forEach' before we release 1.6.0
    // The component-router@0.2.0 looks for the annotations on the controller constructor
    // Nothing in AngularJS looks for annotations on the factory function but we can't remove
    // it from 1.5.x yet.

    // Copy any annotation properties (starting with $) over to the factory and controller constructor functions
    // These could be used by libraries such as the new component router
    angular.forEach(options, function (val, key) {
        if (key.charAt(0) === '$') {
            factory[key] = val;
            // Don't try to copy over annotations to named controller
            if (isFunction(controller)) controller[key] = val;
        }
    });

    factory.$inject = ['$injector'];

    map[options.__id].instance = factory;

    return this.directive(name, factory);
}


function identifierForController(controller, ident) {
    if (ident && typeof ident === 'string') return ident;
    if (typeof controller === 'string') {
        var match = /^(\S+)(\s+as\s+(\w+))?$/.exec(controller);
        if (match) return match[3];
    }
}