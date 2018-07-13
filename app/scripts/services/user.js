'use strict';

angular.module('mts.fieldbook').factory('User', ['Auth',
  function(Auth) {
    return Auth.$requireSignIn();
  }
]);
