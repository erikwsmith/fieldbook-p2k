'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:ReportsCtrl
 * @description
 * # ReportsCtrl
 * Provides rudimentary account management functions.
 */
angular.module('mts.fieldbook')
  .controller('ReportsCtrl', ['Ref', 'Auth', '$firebaseObject','$scope', '$timeout','$rootScope', '$location', '$route',
   function (Ref,  Auth, $firebaseObject, $scope, $rootScope,$location, $timeout, $route) {
  //   $scope.base = 'http://localhost:8888';
  //   if ($location.host() !== 'localhost') {
  //     $scope.base = 'https://mts-apps.mertechserv.com';
  //   }
  //   $scope.openReport = function(report){
  //     $window.open($scope.base + '/MTSInspect/' + report + ( (report.indexOf('?') < 0) ? '?' : ''  ) + 'uid='+user.uid, '_blank');
  //   };
  //
  // }
  var role;
  Auth.$onAuthStateChanged(function(authData){


    var uid= authData.uid;

  var userObj = $firebaseObject(Ref.child('users').child(uid).child('roles'));
  userObj.$loaded()
        .catch(alert)
        .then(function(){


          console.log(userObj.$value);
          var role = userObj.$value;
          if(role==="manager"||role==="admin"){$scope.isHidden=true}else{$scope.isHidden = false}

  });
  });

}
]);
