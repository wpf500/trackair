import reqwest from 'reqwest'

import Home from './components/home'
import Activity from './components/activity'

function init(el, context, config, mediator) {
    var activeComponent;
    var components = {
        'home': Home,
        'activity': Activity
    }

    function change() {
        var component = window.location.hash.substring(1);
        activeComponent = new components[component || 'home'](el);
    }

    window.addEventListener('hashchange', change);
    change();
}

(window.define || System.amdDefine)(function() { return {init: init}; });
