'use strict';

App.ng.config(
  [
    // ModelProvider Dependency Injection
    'ModelProvider',
    function(ModelProvider){

      // Set Models
      ModelProvider.configureModels({

        // Benchmark
        Bench: {
          type: 'object',
          data: {
            nested: {
              example: {
                message: ''
              }
            }
          }
        }

      });

    }
  ]
);
