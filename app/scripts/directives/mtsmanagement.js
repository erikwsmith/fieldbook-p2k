'use strict';

angular.module('mts.fieldbook')
  .directive('mtsmanagement', ['Auth', 'user', 'Ref','$firebaseObject', '$timeout',function (Ref,Auth, user, $firebaseObject, $timeout) {
    return {
      restrict: 'E',
      templateUrl: 'views/mtsmanagement.html',
      controller: 'MTSManagementCtrl'
    };
}
]);
