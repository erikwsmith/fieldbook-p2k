'use strict';
/**
 * @ngdoc function
 * @name mts.fieldbook.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */

angular.module('mts.fieldbook')
.controller('CivilPermitsCtrl', ['$firebaseArray','$firebaseObject','$firebaseAuth','$scope', '$location','$timeout', 'Ref', 'LOCATIONS', 'user', 'Auth', 'ROW','WORKSPACE',
  function ($firebaseArray, $firebaseObject, $firebaseAuth, $scope, $location, $timeout, Ref, LOCATIONS, user, Auth, WORKSPACE, ROW) {

  $scope.orderByField = 'sequence';
  $scope.reverseSort = false;

  var permitsRefFiltered =  Ref.child('civilpermits').orderByChild('inactive').startAt(null).endAt(false);
  var permitsRef =  Ref.child('civilpermits');
  var totalpermits = $firebaseArray(permitsRefFiltered);
  $scope.permits = totalpermits;

  $scope.currentPage = 0;
  $scope.pageSize = 100;
  $scope.numberOfPages=function(){
      if($scope.permits.length>0){
       return Math.ceil($scope.permits.length/$scope.pageSize);
     }else{
       return 1;
     }
   };


  var inactivepermits = $firebaseArray(permitsRef);

  $scope.permits.$loaded().catch(alert)
  .then(function() {
    $scope.totalpermits = totalpermits.length;
    if (typeof($scope.inactiveFilter) === true)  {
      $scope.inactiveFilter = true;
    }

    $scope.toggleShowFilters = function(){
      $scope.showFilters = !$scope.showFilters;
      $scope.inactiveFilter = false;
    };
    $scope.toggleInactive = function() {

      $scope.inactiveFilter = !$scope.inactiveFilter;
      var allpermits = $firebaseArray(permitsRef).length;
      if ($scope.inactiveFilter) {

        $scope.permits = $firebaseArray(permitsRef);
        $scope.totalpermits = inactivepermits.length;
      } else {
        $scope.permits = $firebaseArray(permitsRefFiltered);
        $scope.totalpermits = totalpermits.length;
      }

    }

      $scope.isInactive = function(id){
        if (id === true){
          return true
        }
        else {
          return false
        };
      };

      })


  $scope.orderBy = function(fld, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    $scope.orderByField=fld;
    $scope.reverseSort = !$scope.reverseSort;
  }


  $scope.addNewPermit = function(){
    var t = Ref.child('civilpermits').push({
      group: 'civil_permits'
    });
    $location.path('/civil_permits/'+t.key);
  };

    }
  ])
  .filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
})
  .factory('CivilPermit', ['$firebaseObject', 'Ref', 'ROW',
    function($firebaseObject, Ref, ROW) {
      return function(civilpermitid) {
        // create a reference to the database where we will store our data

        // if (weldid === "new") {
        //   var weldRef = Ref.child(WORKSPACE).child('welds').push();

        // } else {

        //   var weldRef = Ref.child(WORKSPACE).child('welds').child(weldid);

        // }

        var t = civilpermitid;
        if (civilpermitid === "new") {
          t = Ref.child('civilpermits').push().key;

        }
        var permitRef = Ref.child('civilpermits').child(t);
        var permitObj = $firebaseObject(permitRef);

        // weldObj.$loaded().then(function(){
        //   if ( (typeof weldObj.blastabrtype === 'undefined' || weldObj.blastabrtype === '') && (!weldObj.isSect4Complete) ) {
        //     weldObj.blastabrtype = 'BLACK BEAUTY'
        //   }
        //   if ( (typeof weldObj.blastabrsize === 'undefined' || weldObj.blastabrsize === '') && (!weldObj.isSect4Complete) ) {
        //     weldObj.blastabrsize = 'FINE'
        //   }
        //   if ( (typeof weldObj.coattype === 'undefined' || weldObj.coattype === '') && (!weldObj.isSect4Complete) ) {
        //     weldObj.coattype = 'SP-2888'
        //   }
        //   if ( (typeof weldObj.blastpreheatmethod === 'undefined' || weldObj.blastpreheatmethod === '') && (!weldObj.isSect4Complete) ) {
        //     weldObj.blastpreheatmethod = 'PROPANE TORCH'
        //   }
        //
        //   if ( (typeof weldObj.coatapplicationmethod === 'undefined' || weldObj.coatapplicationmethod === '') && (!weldObj.isSect5Complete) ) {
        //     weldObj.coatapplicationmethod = 'Brush'
        //   }
        //   if ( (typeof weldObj.coatmixingratio === 'undefined' || weldObj.coatmixingratio === '') && (!weldObj.isSect5Complete) ) {
        //     weldObj.coatmixingratio = '3:1'
        //   }
        //   if ( (typeof weldObj.coatcomponentatemp === 'undefined' || weldObj.coatcomponentatemp === '') && (!weldObj.isSect5Complete) ) {
        //     weldObj.coatcomponentatemp = 'N/A'
        //   }
        //   if ( (typeof weldObj.coatcomponentapressure === 'undefined' || weldObj.coatcomponentapressure === '') && (!weldObj.isSect5Complete) ) {
        //     weldObj.coatcomponentapressure = 'N/A'
        //   }
        //   if ( (typeof weldObj.coatcomponentbtemp === 'undefined' || weldObj.coatcomponentbtemp === '') && (!weldObj.isSect5Complete) ) {
        //     weldObj.coatcomponentbtemp = 'N/A'
        //   }
        //   if ( (typeof weldObj.coatcomponentbpressure === 'undefined' || weldObj.coatcomponentbpressure === '') && (!weldObj.isSect5Complete) ) {
        //     weldObj.coatcomponentbpressure = 'N/A'
        //   }
        //
        //   if ( (typeof weldObj.coatenvcheck === 'undefined' || weldObj.coatenvcheck === '') && (!weldObj.isSect5Complete) ) {
        //     weldObj.coatenvcheck = 'Tie-In'
        //   }
        //   if ( (typeof weldObj.blastenvcheck === 'undefined' || weldObj.blastenvcheck === '') && (!weldObj.isSect4Complete) ) {
        //     weldObj.blastenvcheck = 'Tie-In'
        //   }
        //   if ( (typeof weldObj.blasttestex === 'undefined' || weldObj.blasttestex === '') && (!weldObj.isSect4Complete) ) {
        //     weldObj.blasttestex = 'Tie-In'
        //   }




        // });

        return permitObj;

      };
    }

  ])
  // .factory('WeldImages', ['$firebaseArray', 'IMAGETYPES',
  //   function($firebaseArray, IMAGETYPES) {
  //
  //     var WeldImages = $firebaseArray.$extend({
  //       getMissingImageTypes: function() {
  //         var uploadedTypes = [];
  //         var missingTypes = [];
  //
  //         angular.forEach(this.$list, function(rec) {
  //           if ((typeof(rec.isDeleted) === 'undefined' || !rec.isDeleted) && typeof(rec.imageType) !== 'undefined' && uploadedTypes.indexOf(rec.imageType) == -1) {
  //             uploadedTypes.push(rec.imageType);
  //           }
  //
  //         });
  //
  //         for(var j = 0; j < IMAGETYPES.length; j++) {
  //           if (uploadedTypes.indexOf(IMAGETYPES[j]) == -1)
  //              missingTypes.push(IMAGETYPES[j]);
  //
  //         }
  //
  //         return missingTypes;
  //       }
  //     });
  //
  //     return function(ref) {
  //       return new WeldImages(ref);
  //     }
  //   }
  // ])
  .controller('CivilPermitCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
      '$routeParams', 'CivilPermit', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'ROW', 'WeldImages',
    function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
        $routeParams, CivilPermit, $window, $location, user, LOCATIONS, openPost, ROW, WeldImages) {

      $scope.local={};


      new CivilPermit($routeParams.civilpermitid).$bindTo($scope, 'permit');

      //toggle Accordions
      $scope.toggleCrossingDetailsAccordion = function(){
        $scope.CrossingDetailsExpanded = !$scope.CrossingDetailsExpanded;
      };
      $scope.toggleContact_1_Accordion = function(){
        $scope.Contact_1_DetailsExpanded = !$scope.Contact_1_DetailsExpanded;
      };
      $scope.toggleContact_2_Accordion = function(){
        $scope.Contact_2_DetailsExpanded = !$scope.Contact_2_DetailsExpanded;
      };
      $scope.togglePermitDetailsAccordion = function(){
        $scope.PermitDetailsExpanded = !$scope.PermitDetailsExpanded;
      };


      var inactiveRef = Ref.child('civilpermits').child($routeParams.civilpermitid);
      var inactiveStatus = inactiveRef.child('inactive');
      $scope.inactiveStatus = $firebaseObject(inactiveStatus);


      Ref.child('civilpermits').on('value',function(snapshot) {
        var obj = $firebaseArray(Ref.child('civilpermits'));
            obj.$loaded()
              .catch(alert)
              .then(function() {
                $scope.inactiveFilter = $scope.inactiveStatus.$value;


                $scope.toggleInactive = function(){
                  $scope.inactiveFilter = !$scope.inactiveFilter;


                  if($scope.inactiveFilter){
                    inactiveRef.update({inactive:true
                    })
                  }
                  else {
                    inactiveRef.update({inactive:false
                    })
                  };


                };
              });
            });

      $scope.addCostTotals = function(x, y, z){
        return Number(x)+Number(y)+Number(z);
      }



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

      Ref.child('agents').on('value',function(snapshot) {

        var obj = $firebaseArray(Ref.child('agents').orderByChild('department').equalTo('RIGHT-OF-WAY'));

        obj.$loaded()
          .catch(alert)
          .then(function() {
  $scope.fieldagents = obj;
      }
        )
      });

    }
  ]);
