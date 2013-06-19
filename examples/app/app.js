'use strict';
/* Angular App Namespace */

var App = {
  // Settings
  version: '0.1.0',                 // App Version
  enableHTML5Mode: true,            // HTML5 Mode: no # in urls
  viewsPath: '/views/',             // Path to Views

  // Angular Module
  ng: angular.module('app', [
    // Service Includes
    'model',                        // Angular-Model
    'ui.bootstrap'                  // Twitter UI Bootstrap
  ])
};
