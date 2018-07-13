'use strict';

angular.module('mts.fieldbook')
  .directive('numericOnly', function(){
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {

        modelCtrl.$parsers.push(function (inputValue) {
          var transformedInput = inputValue ? inputValue.replace(/[^\d.-]/g,'') : null;

          if (transformedInput!=inputValue) {
            modelCtrl.$setViewValue(transformedInput);
            modelCtrl.$render();
          }

          return transformedInput;
        });
      }
    };
  })
  .directive('stationInput', function($filter, $browser) {
    return {
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelCtrl) {
            var listener = function() {
                var value = $element.val().replace(/\+/g, '');
                $element.val($filter('stationfmt')(value, false));
            }

            // This runs when we update the text field
            ngModelCtrl.$parsers.push(function(viewValue) {
                return viewValue.replace(/\+/g, '');
            })

            // This runs when the model gets updated on the scope directly and keeps our view in sync
            ngModelCtrl.$render = function() {
                $element.val($filter('stationfmt')(ngModelCtrl.$viewValue, false));
            }

            $element.bind('change', listener)
            $element.bind('keydown', function(event) {
                var key = event.keyCode
                // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                // This lets us support copy and paste too
                if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40))
                    return;
                $browser.defer(listener); // Have to do this or changes don't get picked up properly
            })

            $element.bind('paste cut', function() {
                $browser.defer(listener);
            })
        }

    }
  })
  .directive('onlyDate', function() {
      return function(scope, element, attrs) {

          var keyCode = [8, 9]; //, 37, 39, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 191
          element.bind("keydown", function(event) {
              //console.log($.inArray(event.which,keyCode));
              if ($.inArray(event.which, keyCode) === -1) {
                  scope.$apply(function() {
                      scope.$eval(attrs.onlyDate);
                      event.preventDefault();
                  });
                  event.preventDefault();
              }

          });
      };
  });