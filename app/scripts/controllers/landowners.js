angular.module('mts.fieldbook')
.controller('LandOwnerRecordsCtrl', ['$firebaseArray','$firebaseObject','$firebaseAuth','$scope', '$location','$timeout', 'Ref', 'LOCATIONS', 'user', 'Auth', 'ROW','WORKSPACE',
  function ($firebaseArray, $firebaseObject, $firebaseAuth, $scope, $location, $timeout, Ref, LOCATIONS, user, Auth, WORKSPACE, ROW) {

  $scope.orderByField = 'name';
  $scope.reverseSort = false;

  $scope.ownersArray = [];
  $scope.ownersArrayFiltered = [];

  var ownersRefFiltered =  Ref.child('landowners').orderByChild('isInactive').startAt(null).endAt(false);
  var ownersRef =  Ref.child('landowners');
  var landownersFiltered= $firebaseArray(ownersRefFiltered);
  var landowners = $firebaseArray(ownersRef);

landowners.$loaded().catch(alert).then(function(){
landowners.forEach(function(x){
  if(x.$id!=='empty'){$scope.ownersArray.push(x)};
})

landownersFiltered.$loaded().catch(alert).then(function(){
landownersFiltered.forEach(function(x){
  if(x.$id!=='empty'){$scope.ownersArrayFiltered.push(x)};
})

$scope.landowners = $scope.ownersArrayFiltered;
  var inactiveowners = $scope.ownersArray;


    $scope.totalowners = $scope.ownersArrayFiltered.length;
    if (typeof($scope.inactiveFilter) === true)  {
      $scope.inactiveFilter = true;
    }
    $scope.toggleShowFilters = function(){
      $scope.showFilters = !$scope.showFilters;
      $scope.inactiveFilter = false;
    };
    $scope.toggleInactive = function() {

      $scope.inactiveFilter = !$scope.inactiveFilter;
      var allOwners = $scope.ownersArray.length;
      if ($scope.inactiveFilter) {

        $scope.landowners = $scope.ownersArray;
        $scope.totalowners = $scope.ownersArray.length;

      } else {
        $scope.landowners = $scope.ownersArrayFiltered;
        $scope.totalowners = $scope.ownersArrayFiltered.length;
      }

    }
    $scope.currentPage = 0;
    $scope.pageSize = 100;
    $scope.numberOfPages=function(){
        if($scope.landowners.length>0){
         return Math.ceil($scope.landowners.length/$scope.pageSize);
       }else{
         return 1;
       }
     };
});
});

      $scope.isInactive = function(id){
        if (id === true){
          return true
        }
        else {
          return false
        };
      };




  $scope.orderBy = function(fld, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    $scope.orderByField=fld;
    $scope.reverseSort = !$scope.reverseSort;
  }


  $scope.addNewOwner = function(){
    var o = Ref.child('landowners').push();
    $location.path('/landowners/'+o.key);
  };


    }
  ])
  .factory('OwnerDetails', ['$firebaseObject', 'Ref', 'ROW',
    function($firebaseObject, Ref, ROW) {
      return function(ownerid) {

        var o = ownerid;
        // if (landownerid === "new") {
        //   o = Ref.child('tracts').push().key;
        //
        // }
        var ownerRef = Ref.child('landowners').child(o);
        var ownerObj = $firebaseObject(ownerRef);


        return ownerObj;

      };


    }

  ])
  .controller('LandOwnerDetailsCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
      '$routeParams', 'Tract', 'OwnerDetails', 'OwnerPayment', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'ROW', 'WeldImages',
    function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
        $routeParams, Tract, OwnerDetails, OwnerPayment, $window, $location, user, LOCATIONS, openPost, ROW, WeldImages) {


      new OwnerDetails($routeParams.ownerid).$bindTo($scope, 'owner');

      $scope.orderByField = 'sequence';
      $scope.reverseSort = false;

      //toggle Accordions
      $scope.toggleOwnerDetailsAccordion = function(){
        $scope.OwnerDetailsExpanded = !$scope.OwnerDetailsExpanded;
      };
      $scope.togglePaymentsAccordion = function(){
        $scope.PaymentsExpanded = !$scope.PaymentsExpanded;
      };


      var inactiveRef = Ref.child('landowners').child($routeParams.ownerid);
      var inactiveStatus = inactiveRef.child('isInactive');
      $scope.inactiveStatus = $firebaseObject(inactiveStatus);

        var obj = $firebaseArray(Ref.child('landowners'));
            obj.$loaded()
              .catch(alert)
              .then(function() {
                $scope.inactiveFilter = $scope.inactiveStatus.$value;


                $scope.toggleInactive = function(){
                  $scope.inactiveFilter = !$scope.inactiveFilter;

                  if($scope.inactiveFilter){
                    inactiveRef.update({isInactive:true
                    })
                  }
                  else {
                    inactiveRef.update({isInactive:false
                    })
                  };
                };

//loop through tracts.child('landowners') for landowner match
var ownerMatchArray = [];

        var tractsRefFiltered = Ref.child('tracts').orderByChild('inactive').startAt(null).endAt(false);
        tractsArray = $firebaseArray(tractsRefFiltered);
        tractsArray.$loaded().catch(alert).then(function(){

          tractsArray.forEach(function(a){
            var landownersArray = [];
            if (a.landowners!==null&&typeof(a.landowners)!=='undefined'){
              landownersArray.push(a.landowners);
            }
            var ownersArray = [];

            landownersArray.forEach(function(p){
              var arr = Object.keys(p).map(function (key) { return p[key]; });
              arr.forEach(function(x){
                ownersArray.push(x)
              })

            })
            ownersArray.forEach(function(z){
              if (z.ownername == $routeParams.ownerid && z.inactive!==true){
                ownerMatchArray.push(a)}
            })


          })
          $scope.ownerMatchArray = ownerMatchArray
        })

});



    $scope.datepickerOptions = {
        format: 'mm/dd/yyyy',
        autoclose: true,
        weekStart: 0,
        enableOnReadonly: false,
        todayBtn: 'linked',
        todayHighlight: true,
        keyboardNavigation: true
      };
      $scope.oneAtATime = true;
      $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: true
      };


        $scope.orderBy = function(fld, e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }

          $scope.orderByField=fld;
          $scope.reverseSort = !$scope.reverseSort;
        }

    }])
