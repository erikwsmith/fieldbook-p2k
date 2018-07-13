'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Provides rudimentary account management functions.
 */
angular.module('mts.fieldbook')
  .controller('SettingsCtrl', ['$scope', '$rootScope', 'user', 'Auth', 'Ref', '$firebaseObject', '$timeout',
    function ($scope, $rootScope, user, Auth, Ref, $firebaseObject, $timeout) {
      $scope.messages = [];
      var profile = $firebaseObject(Ref.child('users/'+user.uid));
      profile.$bindTo($scope, 'profile');

      $scope.$watch('profile', function(newValue, oldValue) {
        if (typeof(newValue) !== 'undefined') {

          if (typeof(newValue.name) !== 'undefined') {
            $rootScope.user.name = newValue.name;
          }
          if (typeof(newValue.title) !== 'undefined') {
            $rootScope.user.title = newValue.title;
          }
        }

      });

      $scope.local = {};
      $scope.local.verificationsDaysRange = $rootScope.verificationsDaysRange;

      $scope.$watch('local.verificationsDaysRange', function(newValue, oldValue) {
        $rootScope.verificationsDaysRange = $scope.local.verificationsDaysRange;
      });

      function error(err) {
        alert(err, 'danger');
      }

      function success(msg) {
        alert(msg, 'success');
      }

      function alert(msg, type) {
        var obj = {text: msg+'', type: type};
        $scope.messages.unshift(obj);
        $timeout(function() {
          $scope.messages.splice($scope.messages.indexOf(obj), 1);
        }, 10000);
      }

    }
]);
