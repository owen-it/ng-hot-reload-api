# ng-hot-reload-api

Hot reload API for Angular Components. This is what [ng-component-loader](https://github.com/owen-it/ng-component-loader) use under the hood. It raises the power of Angular `^1.5.x` components by providing a new method called `components()` and the ability to register components in the component itself. But its main feature is the [**Hot Module Replacement**](https://webpack.js.org/concepts/hot-module-replacement/).

## New ways to register components

```js
// componentA.js
export default {
  // ...component options
}
```

```js
// componentB.js
export default {
  // ...component options
}
```

```js
// componentC.js
export default {
  bindings: { title: '@' },
  controller: ...,
  template: `
    <div>
      <h1>{{ ::$ctrl.title }}</h1>
      <component-a></component-a>
      <component-b></component-b>
    </div>
  `,
  components: { componentA, componentB }
}
```

```js
// app.js
import angular from 'angular'
import api from 'ng-hot-reload-api'
import componentC from './componentC'

api.install(angular)

angular.module('app', [])

.components({ componentC })

// OR

.component('componentC', componentC)
```

## Usage with Hot Module Replacement

```js
// componentA.js
const ComponentA = {
  bindings: { title: '<' },
  template: `<h1>{{ $ctrl.title }}</h1>`
}

// export the component
export default ComponentA

// assuming Webpack's HMR API.
// https://webpack.js.org/concepts/hot-module-replacement/#components/sidebar/sidebar.jsx
if(module.hot){
  const api = require('ng-hot-reload-api')
  
  // compatibility can be checked via api.compatible
  if (!api.compatible) {
    throw new Error('ng-hot-reload-api is not compatible with the version of Angular you are using.')
  }
  
  // indicate this module can be hot-reloaded
  module.hot.accept()
  
  if (!module.hot.data) {
    // for each component option object to be hot-reloaded,
    // you need to create a record for it with a unique id.
    // do this once on startup.
    api.register('unique-id', ComponentA)
  } else {
    // if a component has only its template or render function changed,
    // you can force a re-render for all its active instances without
    // destroying/re-creating them. This keeps all current app state intact.
    api.reload('unique-id', ComponentA)
  }
}
```

> Note: You can provide the above code through a [webpack loader](https://webpack.js.org/concepts/loaders/). 

```js
  // App.js
  import angular from 'angular'
  import api from 'ng-hot-reload-api'
  import componentA from './componentA'
  
  api.install(angular)
  
  angular.module('app', []).components({ componentA })
```

## License

The [MIT](LICENSE) License
