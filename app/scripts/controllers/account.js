'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Provides rudimentary account management functions.
 */
angular.module('mts.fieldbook')
  .controller('AccountCtrl', ['$scope', '$rootScope', 'user', 'Auth', 'Ref', '$firebaseObject', '$timeout', '$q', '$uibModal',
    function ($scope, $rootScope, user, Auth, Ref, $firebaseObject, $timeout, $q,  $uibModal) {
      // $scope.user = user;
      $scope.logout = function() {
        Auth.$signOut();
      };
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

      $scope.resizedImage = null;

      $scope.$watch('resizedImage', function(newValue, oldValue) {
        if (typeof($scope.profile) !== 'undefined' && $scope.resizedImage)
          $scope.profile.picture = $scope.resizedImage;
      });

      $scope.resizeImage = function (file, base64_object) {
          var deferred = $q.defer();
          var b64 = 'data:' + base64_object.filetype + ';base64,' + base64_object.base64;

          $scope.profile.picture = b64;

          // resizeService.resizeImage(b64, {height: 256, width: 256, size: 100, sizeScale: 'ko'}, function (err, image) {
          //     if (err) {
          //         return;
          //     }
          //
          //     $scope.resizedImage = image;
          //     deferred.resolve({file: file, resized: image});
          // });

          return deferred.promise;
      };

      $scope.changePassword = function(oldPass, newPass, confirm) {
        $scope.err = null;
        if( !oldPass || !newPass ) {
          error('Please enter all fields');
        }
        else if( newPass !== confirm ) {
          error('Passwords do not match');
        }
        else {
          Auth.$updatePassword(newPass)
            .then(function() {
              success('Password changed');
            }, error);
        }
      };

      $scope.changeEmail = function(pass, newEmail) {
        $scope.err = null;
        Auth.$updateEmail(newEmail)
          .then(function() {
            profile.email = newEmail;
            $rootScope.user.email = newEmail;
            profile.$save();
            success('Email changed');
          })
          .catch(error);
      };
      $scope.changeProfile = function() {
        $scope.err = null;
        profile.$save();
        success('Profile successfully changed');
      };


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
