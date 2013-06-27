'use strict';

// Colors Demo Controller
App.ng.controller('ColorsCtrl',
  [
    // Dependency Injection
    '$scope', 'Model',
    function($scope, Model) {
      // Update page model
      Model.set('Page', {
        title: 'Color Demo',
        bodyClass: 'colors'
      });

      // Alerts
      $scope.loading = false;
      $scope.error = false;

      // Scope model
      Model.scopeModel('Colors', $scope);

      // Update the Model with data from the Colors endpoint
      $scope.load = function(){
        $scope.loading = true;
        $scope.error = false;

        Model.update('Colors').then(function(data){
          $scope.loading = false;

          if (data.length == 0){
            $scope.error = true;
          }
        });
      };

      // Append data to model from the Colors endpoint
      $scope.append = function(){
        Model.append('Colors');
      };

      // Clear Color model data
      $scope.clear = function(){
        Model.clear('Colors');
      };

    }
  ]
);

