'use strict';

App.ng.directive('myWatchDirective',
  [
    function(){
      return {
        restrict: 'A', // Attribute
        controller: [
          '$scope', '$element', '$attrs',
          function($scope, $element, $attrs){
            // Create watcher
            $scope.$watch('myModel', function(newVal, oldVal){
              console.log('myModel changed');
              $element.html(newVal);
            });
          }
        ]
      };
    }
  ]
);


App.ng.directive('myEventDirective',
  [
    function(){
      return {
        restrict: 'A', // Attribute
        controller: [
          '$scope', '$element', '$attrs',
          function($scope, $element, $attrs){
            // Bind event listener
            $scope.$on('myEvent', function(event, args){
              console.log('myEvent fired');
              $element.html(args.message);
            });
          }
        ]
      };
    }
  ]
);