'use strict';

// App Controller (parent)
App.ng.controller('AppCtrl',
  [
    // Dependency Injection
    '$scope', 'Model',
    function($scope, Model){
      // Scope model
      Model.scopeModel('Page', $scope);

      // Create New Page Model
      Model.addModel({
        name: 'Page',
        data: {
          title: 'App',
          bodyClass: 'app'
        }
      });

      // URL prefixer
      $scope.url = function(url){
        return App.enableHTML5Mode ? '/'+url : '/#'+url;
      };
    }
  ]
);