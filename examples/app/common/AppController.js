'use strict';

// App Controller (parent)
App.ng.controller('AppCtrl',
  [
    // Dependency Injection
    '$scope', 'Model',
    function($scope, Model){
      // Create New Page Model
      Model.addModel({
        name: 'Page',
        data: {
          title: 'App',
          bodyClass: 'app'
        }
      }, $scope);

      // URL prefixer
      $scope.url = function(url){
        return App.enableHTML5Mode ? '/'+url : '/#'+url;
      };
    }
  ]
);