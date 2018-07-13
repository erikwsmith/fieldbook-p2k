angular.module('firebase.ref', ['firebase', 'firebase.config'])
  .factory('Ref', ['$window', 'FBURL', 'FBAUTHDOMAIN', 'FBKEY', 'FBSTORAGEBUCKET', function($window, FBURL, FBAUTHDOMAIN, FBKEY, FBSTORAGEBUCKET) {
    'use strict';
    var config = {
      apiKey: FBKEY,
      authDomain: FBAUTHDOMAIN,
      databaseURL: FBURL,
      storageBucket: FBSTORAGEBUCKET,
    };
    firebase.initializeApp(config);

    return firebase.database().ref();
  }]);