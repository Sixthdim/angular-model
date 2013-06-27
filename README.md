angular-model v0.2.0
=============

<b>A single source of truth for your AngularJS apps.</b>

angular-model is an AngularJS service that is intended to be an easy-to-use, semantic and configurable tool for accessing API endpoints and storing returned data as well as arbitrary data in a centralized data store. Controllers can "subscribe" their scope to a model. For example, subscribe to the model with `Model.scopeModel('MyContext', $scope);`, update your model data with `Model.update('MyContext');` and bind in your view with `<div>{{ Model.MyContext.some_data }}</div>`. Simple as that! The data store is updated asynchronously from the server (or static JSON file). This approach may be a little different than what you're use to, as the job of the controller is mainly to make change requests to the models it cares about, then you would use AngularJS directives (or controllers) to watch the Model for specific changes to keep element states up to date. AngularJS binds always stay up to date.

### Getting Started

* **Include**

``` HTML
<script type="text/javascript" src="angular-model.min.js"></script>
```

* **Use in App**

```javascript
var App = angular.module('app', ['model']);
```

* **Configure**

```javascript
App.config(['ModelProvider', function(ModelProvider){ /* Configuration */ }]);
```

* **Configuration Options**

```javascript
/* Configure models
 * ModelProvider.configureModels(config);
 * config: Object of model config options
 *      model_name: (object) Name of the model or context
 *          endpoint: (string) HTTP path to an API endpoint. Supports :id style vars.
 *          action: (string) AngularJS fetch action (optional) (query [default], get, put, delete, jsonp, etc.)
 *          type: (string) Base return type (array, object)
 *          data: (mixed) A data array or object that will auto-set to the model
 *          cache: (bool) Cache data based on URI.
 *          resolve: (string) When to resolve. If 'parent', promise will be resolved on parent data load. Otherwise, resolved when all data is loaded, including nested.
 *          aliases: (array) Alias deep data nestings to a simpler model path. Array of objects:
 *              src: (string) Source object-notation path
 *              dest: (string) Desination object-notation path
 *          nested: (object) Auto load nested API endpoint data into result set
 *              path: (string) Object-notation path to the endpoint URL. Supports nested arrays. eg: results[].path.to
 *              action: (string) AngularJS fetch action (optional) Defaults to parent (query, get, put, delete, jsonp, etc.)
 *              type: (string) Base return type (array, object)
 *              inject: (string) Object-notation relative path of where to inject data
 *              aliases: (array) Alias deep data nestings to a simpler model path. Array of objects:
 *                  src: (string) Source object-notation path
 *                  dest: (string) Desination object-notation path
 */
ModelProvider.configureModels({
    Page: {},

    MyContext: {
        endpoint: 'path/to/data.json',
        type: 'array',
        aliases: [
            {
                src: 'some.deep.nested.data',
                dest: 'my_data'
            }
        ],
        nested: {
            path: 'extra.href',
            type: 'array',
            inject: 'extra'
        }
    },

    ExtContext: {
        endpoint: 'https://api.external.net/path/to/endpoint/:id',
        action: 'jsonp',
        type: 'object'
    }
});
```

* **Inject into your controller(s)**

```javascript
App.controller('ApiDemoCtrl', ['$scope', 'Model', function($scope, Model){ /* Controller Code */ }]);
```

### Controller Methods and Examples

* **Subscribe your controller's scope to a model**

```javascript
/* Model.scopeModel(model_name, scope);
 * model_name: (string) The name of the model (context)
 * scope: (object) AngularJS $scope or $rootScope
 * @return: AngularJS Promise
 */
Model.scopeModel('MyContext', $scope);
```

* **Update the model from an API endpoint**

```javascript
/* Model.update(model_name[, params, target]);
 * model_name: (string) The name of the model (context)
 * params: (object) Object of params to pass to the API (optional)
 * target: (string) How to update the model (optional): update, replace, append (array only)
 * @return: AngularJS Promise
 */
Model.update('MyContext');

// Or, you can update the model and then (using the returned promise) perform post-processing
Model.update('MyContext').then(function(data){
  doStuff( data );
});

// Or append data to model (arrays only). Nice for infinite scrolling.
Model.append('MyContext', {page: 2});
```

* **Update the model with arbitrary data**

```javascript
/* Model.set(ModelName, data[, target]);
 * model_name: (string) The name of the model (context)
 * data: (object) Object of data
 * target: (string) How to update the model (optional): update, replace, append (array only)
 */
Model.set('MyContext', {
    foo: 'my foo',
    bar: 'my bar'
});
```

* **Get data from the model**

```javascript
/* Model.value(key);
 * key: (string) Object-notation path, starting with the model name.
 * @return: Mixed
 */
var myVal = Model.value('MyContext[3].some_data');
```

* **Update the model from an API endpoint every 5 seconds**

```javascript
/* Model.startIntervalUpdate(model_name, seconds[, params, target]);
 * model_name: (string) The name of the model (context)
 * seconds: (int) Seconds between each update
 * params: (object) Object of params to pass to the API (optional)
 * target: (string) How to update the model (optional): update, replace, append (array only)
 */
Model.startIntervalUpdate('MyContext', 5);
```

* **Stop an interval update**

```javascript
/* Model.stopIntervalUpdate(model_name);
 * model_name: (string) The name of the model (context)
 */
Model.stopIntervalUpdate('MyContext');
```

* **Clear model data**

```javascript
/* Model.clear(model_name);
 * model_name: (string) The name of the model (context)
 */
Model.clear('MyContext');
```

* **Add new model on the fly**

```javascript
/* Model.addModel(model_definition[, scope]);
 * model_definition: (object) The model definition. Same as model config, it just has a model name property.
 * scope: (object) AngularJS $scope or $rootScope that scubscribes to this model
 */
Model.addModel({
  name: 'MyNewContext',
  endpoint: 'path/to/data.json',
  type: 'array',
  data: [1, 2, 3]
}, $scope);
```

### Views/Partials

* **View bindings**

``` HTML
<div ng-show="Model.MyContext.length">
    <ul>
        <li ng-repeat="row in Model.MyContext">{{ row.some_data }}</li>
    </ul>
</div>
```

### Example App

<b>Clone the repository</b>
`git clone https://github.com/Sixthdim/angular-model.git`

<b>Go to project example directory</b>
`cd angular-model/examples`

<b>Start local Node.js server</b>
`node web-server.js`

<b>Open your web browser and go to</b>
`http://localhost:8000/`

### To-Do's

* Add save() to save model data back to API
* Add remove() to delete record from Model & API
* Don't reload populated nested endpoints on append
* Make append() work on nested arrays
* Support computed model properties. eg. myProp() -> myProp
* Include an $.extend() equivalent so there are no jQuery dependency

### The End

<b>I'll be adding more examples soon. Feel free to contact me with any questions or bugs. Enjoy!</b>