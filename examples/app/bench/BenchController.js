'use strict';

// Bench Controller
// This is just a simple test to show the differences in $watch and $broadcast/$on methodologies
App.ng.controller('BenchCtrl',
  [
    // Dependency Injection
    '$scope', 'Model',
    function($scope, Model) {
      // Update page model
      Model.set('Page', {
        title: 'Benchmark',
        bodyClass: 'bench'
      });

      // Time model
      $scope.time = {
        'watch': 0,
        'event': 0
      };

      // Benchmark $watch
      // $watch is very fast and efficient.
      // Use is best for DOM updates.
      $scope.benchWatch = function(){
        var start = new Date().getTime();

        $scope.myModel = '';
        for (var x = 1; x <= 100000; x++){
          Model.set('Bench', {
            nested: {
              example: {
                message: 'Model Change Iteration: '+x
              }
            }
          });
        }

        var end = new Date().getTime();
        var time = end - start;
        $scope.time.watch = time;
        console.log('benchWatch Time: '+time+'ms');
      };

      // Benchmark $broadcast/$on
      // $broadcast/$on is CPU intensive and blocking.
      // Use should be limited to critical data/changes that other controllers need to know about.
      $scope.benchBroadcast = function(){
        var start = new Date().getTime();

        $scope.$broadcast('myEvent', {message: ''});
        for (var x = 1; x <= 100000; x++){
          $scope.$broadcast('myEvent', {message: 'Broadcast Iteration: '+x});
        }

        var end = new Date().getTime();
        var time = end - start;
        $scope.time.event = time;
        console.log('benchBroadcast Time: '+time+'ms');
      };
    }
  ]
);