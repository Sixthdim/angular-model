 'use strict';
/* Model Config
 *
 * Options:
 *    // Configure Models and Endpoints. All attributes are optional
 *    Model.configureModels({
 *      ModelName: {                                    // Model name, camel-case starting with upper case (optional convention, but makes it easy to determine what is a model)
 *        endpoint: 'http://url.to/api/endpoint/:id',   // Endpoint URL. Supports variable notation :var
 *        action: 'jsonp',                              // Endpoint API query action. Supported: query, get, jsonp
 *        type: 'object',                               // Or array, what's to be expected from API
 *        cache: true,                                  // Cache data based on URI
 *        resolve: 'parent',                            // When to resolve. If 'parent', pormise will be resolved on parent data load. Otherwise, resolved when all data is loaded, including nested.
 *        aliases: [                                    // Alias deep data nestings to a simpler model path
 *          {
 *            src: 'some.really.nested.stuff',          // Source object-notation path
 *            dest: 'stuff'                             // Desination object-notation path: Model.ModelName.some.really.nested.stuff -> Model.ModelName.stuff
 *          }
 *        ],
 *        nested: [                                     // Array of objects representing nested endpoints
 *          {
 *            path: 'object.notation[].to.url',         // Path in object-notation to URL. Support for nested arrays []
 *            action: 'jsonp',                          // Endpoint API query action. Supported: query, get, jsonp
 *            type: 'array',                            // Or object, what's to be expected from API
 *            inject: 'relative.path',                  // Segment-relative object-notation of where to inject data.
 *            aliases: [                                // Alias deep data nestings to a simpler model path
 *              {
 *                src: 'relative.path[0].some.really.nested.stuff', // Source object-notation path
 *                dest: 'nested_stuff'                  // Desination object-notation path.
 *              }
 *            ]
 *          }
 *        ],
 *        data: {}                                      // A data array or object that will auto-set to the model
 *      }
 *    })
 */

App.ng.config(
  [
    // ModelProvider Dependency Injection
    'ModelProvider',
    function(ModelProvider){

      // Set Models
      ModelProvider.configureModels({

        // Colors
        Colors: {
          endpoint: '/data/colors.json',        // URL to data/REST API endpoint
          action: 'query',
          type: 'array',                        // Returned data is an array
          aliases: [
            {
              src: 'some.deep.nested.message',  // Alias some annoying deep nested stuff...
              dest: 'message'                   // to a shorter model path
            }
          ],
          nested: [
            {
              path: 'things.href',              // Object notated path to URL of nested endpoint
              action: 'query',
              type: 'array',                    // Nested endpoint data will return as an array
              inject: 'things'                  // Insted of replacing "things.href" with data, replace "things" with data
            }
          ]
        }

      });

    }
  ]
);
