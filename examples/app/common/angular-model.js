/**
 * @description Model - An API helper and data store
 * @version 0.4.0
 * @dependencies jQuery
 * @author Chris Collins
 * @website https://github.com/Sixthdim/angular-model
 */
angular.module('model', ['ngResource']).provider('Model', function(){

  // Define private namespace
  var ns = {
    config: {},
    cache: {},
    actions: {
      'jsonp': {
        method: 'JSONP',
        isArray: false
      },
      'get': {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      },
      'save': {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      },
      'query': {
        method: 'GET',
        isArray: true,
        headers: {
          'Accept': 'application/json'
        }
      },
      'remove': {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      },
      'delete': {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      }
    }
  };


  // Configure models
  this.configureModels = function(obj){
    angular.extend(ns.config, obj);
  };


  // Provider $get method
  this.$get = [
    // DI
    '$resource', '$q', '$timeout', '$location', '$rootScope',
    function($resource, $q, $timeout, $location, $rootScope){

      // Create Model on $rootScope
      $rootScope.Model = {};

      // Auto-set models with config data
      angular.forEach(ns.config, function(val, key){
        if (angular.isDefined(val.data)){
          $rootScope.Model[key] = val.data;
        }
      });


      var pub = {}, // Public methods
          pri = {}; // Private methods


      /* * * * * * * * * * * *
       * Public Methods (exposed with binds)
       * * * * * * * * * * * */
      pub = {

        // Add a new model or models (post-config)
        addModel: function(parent, def){
          var defaultOpts = {

          };

          if (angular.isDefined(def.name)){

            // Single model by name
            // Generate model config
            var config = {};
            config[def.name] = {};
            angular.extend(config[def.name], def);

            // Extend service config
            angular.extend(ns.config, config);

            // Pre-popuate model data
            pri.prepopulateData(def.name);

          } else {
            // Add multiple models
            var models = pri._keys(def);
            for (var m = 0; m < models.length; m++){
              // Extend service config
              ns.config[models[m]] = {};
              angular.extend(ns.config[models[m]], def[models[m]]);

              // Pre-popuate model data
              pri.prepopulateData(def.name);
            }
          }
        },


        // Set values to the model
        set: function(parent, model, data, target, index){
          // Default target to update
          if (angular.isUndefined(target)){
            target = 'update';
          }

          // Create model
          if (angular.isUndefined($rootScope.Model[model])){
            if (angular.isDefined(ns.config[model]) && angular.isDefined(ns.config[model].type) && ns.config[model].type == 'array'){
              $rootScope.Model[model] = [];
              if (angular.isDefined(index)){
                if (angular.isArray(data)){
                  $rootScope.Model[model][index] = [];
                } else {
                  $rootScope.Model[model][index] = {};
                }
              }
            } else {
              $rootScope.Model[model] = {};
            }

            target = 'replace';
          }

          // Clear model
          if (target == 'replace'){
            if (angular.isArray(data)){
              if (angular.isDefined(index)){
                $rootScope.Model[model][index].length = 0;
              } else {
                $rootScope.Model[model].length = 0;
              }
            } else {
              if (angular.isDefined(index)){
                $rootScope.Model[model][index] = {};
              } else {
                $rootScope.Model[model] = {};
              }
            }
          }

          // Replace array model data, update object model data (deep extend)
          if ( (target == 'replace') || (target == 'update') ){
            if (angular.isArray(data)){
              if (angular.isDefined(index) && angular.isArray($rootScope.Model[model])){
                $rootScope.Model[model][index].length = 0;
                Array.prototype.push.apply($rootScope.Model[model][index], data);
              } else {
                $rootScope.Model[model].length = 0;
                Array.prototype.push.apply($rootScope.Model[model], data);
              }

            } else {
              if (angular.isDefined(index) && angular.isArray($rootScope.Model[model])){
                $.extend(true, $rootScope.Model[model][index], data);
              } else {
                $.extend(true, $rootScope.Model[model], data);
              }
            }
          }

          // Append to model data
          if (target == 'append'){
            if (angular.isDefined(index)){
              Array.prototype.push.apply($rootScope.Model[model][index], data);
            } else {
              Array.prototype.push.apply($rootScope.Model[model], data);
            }
          }

          // Do aliasing
          if (angular.isDefined(ns.config[model].aliases)){
            if (angular.isDefined(index)){
              pri.doAliasing($rootScope.Model[model], ns.config[model].type, ns.config[model].aliases, '['+index+']');
            } else {
              pri.doAliasing($rootScope.Model[model], ns.config[model].type, ns.config[model].aliases);
            }
          }

          return $rootScope.Model[model];
        },


        // Update model from endpoint
        update: function(parent, model, par, target){
          var params = {},
              resource = {},
              action = 'query',
              data = null,
              defer = $q.defer(),
              acts = angular.copy(ns.actions, acts);

          // Default params
          if (angular.isDefined(par)){
            angular.extend(params, par);
          }

          // If model data is cached, restore from cache
          if (pri.useCache(model)){
            pri.restoreCache(model);
            defer.resolve( pub.value(parent, model) );
            return defer.promise;
          }

          // Set action
          if (angular.isDefined(ns.config[model].action)){
            action = ns.config[model].action;
          }

          // Set fields for JSONP
          if (action == 'jsonp'){
            angular.extend(params, {callback: 'JSON_CALLBACK'});
          }

          // Set actions
          if ( (angular.isUndefined(ns.config[model].type)) || (ns.config[model].type != 'array') ){
            acts[action].isArray = false;
          }

          // Instantiate resource
          if (angular.isUndefined(ns.config[model].resource)){
            ns.config[model].resource = $resource(ns.config[model].endpoint, {}, acts);
          }

          // Fetch data from api endpoint
          data = ns.config[model].resource[action](params, function(){
            // Success
            // Set data to Model
            pub.set(
              parent,
              model,
              data,
              target
            );

            // Resolve on parent complete
            if (angular.isDefined(ns.config[model].resolve) && ns.config[model].resolve == 'parent'){
              defer.resolve( $rootScope.Model[model] );
            }

            // Get nested if any, return promise
            pri.doNesting($rootScope.Model[model], ns.config[model].nested).then(function(){
              // Set cache
              if (ns.config[model].cache){
                pri.setCache(model);
              }

              // Resolve promise
              defer.resolve( $rootScope.Model[model] );
            });

          }, function(error){
            // Error
            // Resolve promise
            defer.resolve( $rootScope.Model[model] );
          });

          return defer.promise;
        },


        // Update model by appending results (array model only)
        append: function(parent, model, params){
          return pub.update(parent, model, params, 'append');
        },


        // Clear cache
        clearCache: function(parent, model){
          if (angular.isDefined(ns.cache[model])){
            if (angular.isDefined(ns.config[model].type) && ns.config[model].type == 'array'){
              ns.cache[model].length = 0;
            } else {
              ns.cache[model] = {};
            }
          }
        },


        // Clear a model's data
        clear: function(parent, model){
          if (angular.isDefined($rootScope.Model[model])){
            if (angular.isDefined(ns.config[model].type) && ns.config[model].type == 'array'){
              $rootScope.Model[model].length = 0;
            } else {
              $rootScope.Model[model] = {};
            }
          }
          pub.clearCache(parent, model);
        },


        // Get Model value
        value: function(parent, key){
          // No key, return model data store
          if (angular.isUndefined(key)){
            return $rootScope.Model;
          }

          // No sub keys, return child
          if (key.indexOf('.') == -1){
            return $rootScope.Model[key];
          }

          // Return nested child
          return pri.getObjValue($rootScope.Model, key);
        },


        // Start interval update
        startIntervalUpdate: function(parent, model, seconds, params, target){
          if (angular.isDefined(ns.config[model])){
            ns.config[model].intervalUpdateTimer = $timeout(
              function(){
                pub.update(parent, model, params, target).then(function(){
                  pub.startIntervalUpdate(parent, model, seconds, params, target);
                });
              }, (seconds*1000), true);
          }
        },


        // Stop interval update
        stopIntervalUpdate: function(parent, model){
          if (angular.isDefined(ns.config[model].intervalUpdateTimer)){
            $timeout.cancel(ns.config[model].intervalUpdateTimer);
            delete ns.config[model].intervalUpdateTimer;
          }
        },


        // Save data to API
        save: function(parent, model, params, data){

        },


        // Delete record from API
        remove: function(parent, model, params){

        }
      };


      /* * * * * * * * * * * *
       * Private Methods
       * * * * * * * * * * * */
      pri = {
        // Pre-Populate model with configured default data
        prepopulateData: function(model){
          if (angular.isDefined(model)){
            // Specific model
            if (angular.isDefined(ns.config[model])){
              if (angular.isUndefined($rootScope.Model[model])){
                if (angular.isDefined(ns.config[model].type && ns.config[model].type == 'array')){
                  $rootScope.Model[model] = [];
                } else {
                  $rootScope.Model[model] = {};
                }
              }

              if (angular.isDefined(ns.config[model].data)){
                if (angular.isArray(ns.config[model].data)){
                  Array.prototype.push.apply($rootScope.Model[model], ns.config[model].data);
                } else {
                  angular.extend($rootScope.Model[model], ns.config[model].data);
                }
              }
            }

          } else {
            // All configured models
            angular.forEach(ns.config, function(config, model){
              if (angular.isDefined(config.data)){
                pri.prepopulateData(model);
              }
            });
          }
        },


        // Do nesting
        doNesting: function(data, config){
          if ( (angular.isUndefined(config)) || (config.length == 0) ){
            // No nesting configured, resolve
            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
          }

          var nest = 0,
              promises = [];

          pri.buildNestingConfig(data, config);

          for (nest = 0; nest < config.length; nest++){
            promises = promises.concat( pri.populateNestingEndpoints(data, config[nest].config) );
          }

          return $q.all(promises);
        },


        // Build model nesting config obj
        buildNestingConfig: function(data, config){
          // Loop through each endpoint nesting
          for (var n = 0; n < config.length; n++){
            // Skip if already built
            if (angular.isDefined(config[n].config)){
              continue;
            }

            var nesting = config[n],
                parts = nesting.path.split('[]'),
                i = 0,
                c = {},
                cProto = {
                  path: '',
                  isArray: false,
                  type: nesting.type,
                  action: nesting.action,
                  inject: nesting.inject,
                  nested: (angular.isDefined(nesting.nested) ? nesting.nested : []),
                  aliases: (angular.isDefined(nesting.aliases) ? nesting.aliases : [])
                };

            // Store config array on the primary config's nested element
            config[n].config = [];

            // Model parent endpoint returns an array
            if (angular.isArray(data)){
              c = angular.copy(cProto, {});
              c.path = '';
              c.isArray = true;
              config[n].config.push(c);
            }

            // Loop through path array segments ...[]...
            for (i=0; i < parts.length; i++){
              c = angular.copy(cProto, {});
              c.path = parts[i];
              c.isArray = false;

              // Ignore empty paths
              if (c.path == ''){ continue; }

              // If the next segment has a path, this segment must be an array
              if (angular.isDefined(parts[i+1])){
                c.isArray = true;
              }

              // Trim "." from path
              c.path = c.path.replace(/^\.+/g, '');

              // Push config obj onto stack
              config[n].config.push(c);
            }
          }

          return true;
        },


        // Pull nested endpoints from data
        populateNestingEndpoints: function(data, nestConfig, nestPath, configIndex){
          var nestedData = null,
              endpoint = '',
              resource = null,
              data_i = 0,
              nestingParams = {},
              nestingActions = {},
              nestingAction = 'query',
              nestingInject = '',
              defer = $q.defer(),
              promises = [];

          // Default config index
          if (angular.isUndefined(configIndex)){
            configIndex = 0;
          }

          // End nesting if end of segments
          if (angular.isUndefined(nestConfig[configIndex])){
            return promises;
          }

          // Set nesting action
          nestingAction = nestConfig[configIndex].action;

          // Set nesting inject path
          nestingInject = nestConfig[configIndex].inject;

          // Default nest path
          if (angular.isUndefined(nestPath)){
            nestPath = '';
          }

          // If segment is an array, loop through data array and fetch each nested endpoint
          if (nestConfig[configIndex].isArray){
            nestPath = nestPath+(nestPath==''?'':'.')+nestConfig[configIndex].path;
            nestedData = pri.getObjValue(data, nestPath);

            for (data_i = 0; data_i < nestedData.length; data_i++){
              var path = nestPath+'['+data_i+']';
              promises = promises.concat( pri.populateNestingEndpoints(data, nestConfig, path, (configIndex+1)) );
            }

          } else {
            // Build current nest path
            var path = (nestPath==''?'':nestPath+'.')+nestConfig[configIndex].path;

            // Segment is not an array, fetch endpoint
            endpoint = pri.getObjValue(data, path);

            // Endpoint is a string
            if (angular.isString(endpoint)){
              // Set Params
              if (nestingAction == 'jsonp'){
                // Add jsonp callback param
                angular.extend(nestingParams, {callback: 'JSON_CALLBACK'});
              }

              // Set Actions
              angular.extend(nestingActions, ns.actions);

              // Request data from endpoint
              resource = $resource(endpoint, nestingParams, nestingActions);
              var nestedResults = resource[nestingAction](function(){
                // HTTP Success
                // Do more nesting
                pri.doNesting(nestedResults, nestConfig[configIndex].nested).then(function(){
                  // Inject nested data into object
                  pri.setObjValue(data, nestPath+'.'+nestingInject, nestedResults);

                  // Do aliasing
                  pri.doAliasing(data, 'object', nestConfig[configIndex].aliases, nestPath);

                  // Resolve promise
                  defer.resolve( data );
                });

              }, function(){
                // HTTP Fail
                defer.resolve();
              });

              // Push promise onto promise stack
              promises.push(defer.promise);
            }
          }

          return promises;
        },


        // Do aliasing
        doAliasing: function(data, type, aliases, basePath){
          // model has aliases?
          if (angular.isDefined(aliases) && angular.isArray(aliases)){
            for (var i = 0; i < aliases.length; i++){
              // src and dest are defined?
              if (angular.isDefined(aliases[i].src) && angular.isDefined(aliases[i].dest)){
                // get source value
                var srcPath = (angular.isDefined(basePath) ? basePath+'.' : '') + aliases[i].src,
                    destPath = (angular.isDefined(basePath) ? basePath+'.' : '') + aliases[i].dest;

                if (type == 'array'){
                  for (var x = 0; x < data.length; x++){
                    pri.setObjValue(data[x], destPath, pri.getObjValue(data[x], srcPath));
                  }

                } else {
                  pri.setObjValue(data, destPath, pri.getObjValue(data, srcPath));
                }
              }
            }
          }
        },


        // Set cache from model
        setCache: function(model){
          var id = pri.serializeURI();
          if (angular.isUndefined(ns.cache[model])){
            ns.cache[model] = {};
          }
          if (angular.isUndefined(ns.cache[model][id])){
            ns.cache[model][id] = {};
          }
          angular.extend(ns.cache[model][id], pub.value(null, model));
        },


        // Restore cache
        restoreCache: function(model){
          var id = pri.serializeURI();
          if (angular.isDefined(ns.cache[model][id])){
            pub.set(null, model, ns.cache[model][id], 'replace');
          }
        },


        // Use cache? Cache enabled and there is a cache
        useCache: function(model){
          if (angular.isUndefined(ns.config[model].cache) || !ns.config[model].cache || angular.isUndefined(ns.cache[model])){
            return false;
          }

          var id = pri.serializeURI();
          if (angular.isDefined(ns.cache[model][id])){
            return true;
          }

          return false;
        },


        // Serialize URI
        serializeURI: function(){
          var params = $location.search(),
              serial = [],
              keys = pri._keys(params).sort(),
              i = 0;

          serial.push('"'+$location.path()+'"');

          for (i = 0; i < keys.length; i++){
            serial.push('"'+keys[i]+'='+params[keys[i]]+'"');
          }

          return serial.join(',');
        },


        // Get an object's value based on it's path
        getObjValue: function(obj, p){
          if (p == ''){
            if (angular.isArray(obj)){
              return obj.slice();
            }
            return $.extend(true, {}, obj);
          }

          var val = null,
              path = p.split('.'),
              i = 0,
              node = '',
              index = 0,
              patt = /\[(.*)\]$/;

          if (angular.isArray(obj)){
            val = obj.slice();
          } else {
            val = $.extend(true, {}, obj);
          }

          for (i = 0; i < path.length; i++){
            node = path[i];

            if (node.indexOf('[') > -1){
              index = parseInt(node.match(patt)[1]);
              node = node.replace(patt, '');

              if (node == ''){
                val = val[index];
              } else {
                val = val[node][index];
              }

            } else {
              if (node != '' && angular.isDefined(val[node])){
                val = val[node];
              }
            }
          }

          return val;
        },


        // Set a value to an object based on the path
        setObjValue: function(obj, p, value){
          // No path, set base obj to value
          if (p == ''){
            if (angular.isArray(obj) && angular.isArray(value)){
              obj = value.slice();
            } else if (angular.isObject(obj) && angular.isObject(value)){
              $.extend(true, obj, value);
            } else {
              obj = value;
            }
            return;
          }

          var path = p.split('.'),
              i = 0,
              node = '',
              index = 0,
              patt = /\[(.*)\]$/;

          for (i = 0; i < path.length; i++){
            node = path[i];

            if (node.indexOf('[') > -1){
              index = parseInt(node.match(patt)[1]);
              node = node.replace(patt, '');

              if (node == ''){
                if (i == (path.length - 1)){
                  obj[index] = value;
                  break;
                }

                obj = obj[index];

              } else {
                if ((node in obj) === false){
                  obj[node] = [];
                  obj[node][index] = {};
                }

                if (i == (path.length - 1)){
                  obj[node][index] = value;
                  break;
                }

                obj = obj[node][index];
              }

            } else {
              if (node != ''){
                if ((node in obj) === false){
                  obj[node] = {};
                }

                if (i == (path.length - 1)){
                  obj[node] = value;
                  break;
                }

                obj = obj[node];
              }
            }
          }
        },


        // UnderscoreJS equivelent of _.keys()
        // Retrieve the names of an object's properties.
        // Delegates to **ECMAScript 5**'s native `Object.keys`
        _keys: Object.keys || function(obj){
          if (obj !== Object(obj)) throw new TypeError('Invalid object');
          var keys = [];
          for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
          return keys;
        }

      };


      // Pre-populate models configured with default data
      pri.prepopulateData();


      // Expose public methods. Bind functions and return service
      var service = {};
      service.addModel = angular.bind(service, pub.addModel, null);
      service.set = angular.bind(service, pub.set, null);
      service.update = angular.bind(service, pub.update, null);
      service.value = angular.bind(service, pub.value, null);
      service.append = angular.bind(service, pub.append, null);
      service.clearCache = angular.bind(service, pub.clearCache, null);
      service.clear = angular.bind(service, pub.clear, null);
      service.startIntervalUpdate = angular.bind(service, pub.startIntervalUpdate, null);
      service.stopIntervalUpdate = angular.bind(service, pub.stopIntervalUpdate, null);
      service.save = angular.bind(service, pub.save, null);
      service.remove = angular.bind(service, pub.remove, null);
      return service;

    }
  ];

});