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

      // Set iterations
      $scope.iterations = 100000;

      // Benchmark $watch (Simple)
      // $watch is very fast and efficient.
      // Use is best for DOM updates.
      $scope.benchWatchSimple = function(){
        var start = new Date().getTime();

        $scope.myModel = '';
        for (var x = 1; x <= $scope.iterations; x++){
          $scope.Model.Bench.nested.example.message = 'Model Change Iteration: '+x;
        }

        var end = new Date().getTime();
        var time = end - start;
        $scope.time.watch = time;
        console.log('benchWatch Time: '+time+'ms');
      };

      // Benchmark $watch (Advanced)
      // $watch is very fast and efficient.
      // Use is best for DOM updates.
      $scope.benchWatchAdvanced = function(){
        var start = new Date().getTime();

        $scope.myModel = '';
        for (var x = 1; x <= $scope.iterations; x++){
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
        for (var x = 1; x <= $scope.iterations; x++){
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