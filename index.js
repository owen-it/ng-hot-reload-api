
var angular = require('angular');
var map = angular.__NG_HOT_MAP = Object.create(null);
var slice = Array.prototype.slice;

exports.init = function(){

    var __ng__ = angular.module;
    function __module__(){

        var hijacked  = __ng__.apply(this, arguments);
        
        if(hijacked.components) return hijacked;
        
        function __queued__(name, module){
            var exist = false;
            hijacked._invokeQueue.forEach(function(proccess){
                if (proccess[1] === 'component' && proccess[2][0] === name) {
                    exist = true; return;
                };
            })
            return exist;
        }

        function __components__ (components) {

            if(angular.isObject(components)){
                Object.keys(components).forEach(function(name){
                    if(components[name].components) __components__(components[name].components);
                    if(!__queued__(name, hijacked.name)) {
                        // register component name
                        map[components[name].__id].name = name;
                        hijacked.component(name, components[name])
                    };
                })
            }

            return hijacked;
        }

        hijacked.components = __components__;
        return hijacked;
    }

    angular.module = __module__;
}

exports.register = function(id, component)
{
    map[id] = {
        ctro: component
    }
}

exports.update = function(id, component)
{
    var target = angular.__NG_HOT_MAP[id];
    var app = angular.element(document);
    var $injector = app.injector();

    if($injector && target.name){
        var $component = $injector.get(`${target.name}Directive`)[0];
        var $compile   = $injector.get('$compile');
        
        $component.template = component.template || '';
        
        var elements = slice.call(app.find(target.name));

        elements.forEach(function(element){
            var $element = angular.element(element);
            $element.html($component.template);
            $compile($element.contents())($element.isolateScope());
            app.find('html').scope().$apply();
        })
    }
}