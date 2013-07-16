'use strict';
/* Routes Config */

App.ng.config(
  [
    // Dependency Injection
    '$routeProvider',
    function(route) {

      // Colors Demo Route
      route.when('/', {
        templateUrl: App.viewsPath+'ColorsView.html',
        controller: 'ColorsCtrl'
      });

      // Bench Route
      route.when('/bench', {
        templateUrl: App.viewsPath+'BenchView.html',
        controller: 'BenchCtrl'
      });

      // All Other Routes
      route.otherwise({redirectTo: '/'});

    }
  ]
);