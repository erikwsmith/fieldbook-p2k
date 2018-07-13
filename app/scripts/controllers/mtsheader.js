'use strict';

angular.module('mts.fieldbook')
  .controller('MTSHeaderCtrl', ['$scope', '$rootScope', 'Auth', 'Ref', '$firebaseArray','$firebaseObject', '$location', '$route',
    function ($scope, $rootScope,  Auth, Ref, $firebaseArray,$firebaseObject, $location, $route) {

      if (typeof($rootScope.global) === 'undefined') {
        $rootScope.global = {};
      }

      $scope.logout = function() {
        Auth.$signOut();
      };

      // var messageRef = function(id){
      //   return $firebaseArray(Ref.child('users').child(id).child('messages'));
      // }
      //       if(Ref.child('users').child(user).child('messages')){
      //         var myMessages = messageRef(user);
      //         myMessages.$loaded().then(function(){
      //           var messages = [];
      //
      //           myMessages.forEach(function(message){
      //           if(message.viewed === true){
      //             messages.push(message)
      //             }
      //           })
      //           console.log(messages);
      //
      //           $scope.unreadMessages =messages.length;
      //
      //         })
      //
      //       }else{
      //         console.log("nope");
      //         $scope.unreadMessages =messages.length;
      //
      //
      //       }
      // $scope.search = function() { $location.path('/welds'); };
      // $scope.keyPressed = function(event) {
      //   if (event.which === 13){
      //     event.preventDefault();
      //     $location.path('/welds');
      //   }
      // }
      //
      // $scope.searchChanged = function(){
      //   if ($rootScope.global.weldQuery.length == 12){
      //     $location.path('/welds');
      //   }
      // }

      // $scope.$on("$routeChangeSuccess", function($event, $currentRoute, $previousRoute) {
      //
      //     if (typeof($previousRoute) !== 'undefined' && $previousRoute.loadedTemplateUrl.indexOf('welds.html') > -1) {
      //       $rootScope.global.weldQuery = '';
      //     }
      // });


      $scope.local = {};
      $scope.local.firebaseConnected = true;
      $scope.$on('firebase:connectionChanged', function (event, data) {
        $scope.local.firebaseConnected = data.connected;
        $scope.$apply();
      });
    }
]);
