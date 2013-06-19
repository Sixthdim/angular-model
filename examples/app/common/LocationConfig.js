'use strict';
/* Location Config */

App.ng.config(
  [
    // Dependency Injection
    '$locationProvider',
    function(location) {

      // Enable HTML5 Mode (no # in URLs)
      location.html5Mode(App.enableHTML5Mode);

    }
  ]
);
