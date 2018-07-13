(function() {
  'use strict';
  angular.module('firebase.storage', ['firebase', 'firebase.config'])

    .factory('Storage', function() {
      return firebase.storage().ref();
    });
})();
