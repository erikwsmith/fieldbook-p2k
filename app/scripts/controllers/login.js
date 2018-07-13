'use strict';
/**
 * @ngdoc function
 * @name mts.fieldbook.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('mts.fieldbook')
  .controller('LoginCtrl', function ($scope, $rootScope, Auth, $location, $q, Ref, $firebaseObject, $timeout) {
    $scope.passwordLogin = function(email, pass) {
      $scope.err = null;
      Auth.$signInWithEmailAndPassword(email, pass).then(
        redirect, showError
      );
    };

    function redirect(user) {
      if (typeof($rootScope.user) !== 'undefined')
        delete $rootScope.user;
      $rootScope.user = user;
      $location.path('/main');
    }

    function showError(err) {
      $scope.err = err;
    }


  });
