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

      // All Other Routes
      route.otherwise({redirectTo: '/'});

    }
  ]
);