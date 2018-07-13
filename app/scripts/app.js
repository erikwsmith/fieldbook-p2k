'use strict';

/**
 * @ngdoc overview
 * @name mts.fieldbook
 * @description
 * # mts.fieldbook
 *
 * Main module of the application.
 */
angular.module('mts.fieldbook', [
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'firebase',
    'firebase.ref',
    'firebase.appauth',
    'firebase.storage',
    'ng-bootstrap-datepicker',
      'angularMoment',
    'daterangepicker',
    'ui.bootstrap',
    'ui.select',
    'angular.filter',
    'moreFilters',
    'uuid',
    'datetimepicker',
    'bootstrapLightbox',
    'naif.base64',

    // 'images-resizer',
    'cgBusy',
    'angular-js-xlsx',
    'LocalStorageModule'
  ])
  
