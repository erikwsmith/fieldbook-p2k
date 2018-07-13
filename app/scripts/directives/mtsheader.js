'use strict';

angular.module('mts.fieldbook')
  .directive('mtsheader', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/mtsheader.html',
      controller: 'MTSHeaderCtrl'
    };
});