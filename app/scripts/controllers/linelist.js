'use strict';
/**
 * @ngdoc function
 * @name mts.fieldbook.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */

angular.module('mts.fieldbook')
.controller('LineListCtrl', ['$firebaseArray','$firebaseObject','$firebaseAuth','$scope', '$location','$timeout', 'Ref', 'LOCATIONS', 'user', 'Auth', 'ROW','WORKSPACE',
  function ($firebaseArray, $firebaseObject, $firebaseAuth, $scope, $location, $timeout, Ref, LOCATIONS, user, Auth, WORKSPACE, ROW) {

  $scope.orderByField = 'sequence';
  $scope.reverseSort = false;

  var tractsRefFiltered =  Ref.child('tracts').orderByChild('inactive').startAt(null).endAt(false);
  var tractsRef =  Ref.child('tracts');
  var totaltracts = $firebaseArray(tractsRefFiltered);

  $scope.currentPage = 0;
  $scope.pageSize = 100;
  $scope.numberOfPages=function(){
       return Math.ceil($scope.tracts.length/$scope.pageSize);
   };

  $scope.tracts = $firebaseArray(tractsRefFiltered);

  var inactivetracts = $firebaseArray(tractsRef);

  $scope.tracts.$loaded().catch(alert)
  .then(function() {
    $scope.totaltracts = totaltracts.length;
    if (typeof($scope.inactiveFilter) === true)  {
      $scope.inactiveFilter = true;
    }

    $scope.toggleShowFilters = function(){
      $scope.showFilters = !$scope.showFilters;
      $scope.inactiveFilter = false;
    };

    $scope.toggleInactive = function() {

      $scope.inactiveFilter = !$scope.inactiveFilter;
      var alltracts = $firebaseArray(tractsRef).length;
      if ($scope.inactiveFilter) {

        $scope.tracts = $firebaseArray(tractsRef);
        $scope.totaltracts = inactivetracts.length;
      } else {
        $scope.tracts = $firebaseArray(tractsRefFiltered);
        $scope.totaltracts = totaltracts.length;
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
  $scope.addNewTract = function(){
    var t = Ref.child('tracts').push({
    geometry: '[0,0,0]',
    group: 'tracts' ,
    surveypermission: '' ,
    surveydenied: '',
    type: 'PROPERTY',
    address: '',
    city: '',
    state: '',
    zip: '',
    titlecomplete: ''
    });
    $location.path('/tracts/'+t.key);
  };
    }
  ])
  .filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
})
  .factory('Tract', ['$firebaseObject', 'Ref', 'ROW',
    function($firebaseObject, Ref, ROW) {
      return function(tractid) {

        var t = tractid;
        if (tractid === "new") {
          t = Ref.child('tracts').push().key;

        }
        var tractRef = Ref.child('tracts').child(t);
        var tractObj = $firebaseObject(tractRef);
        return tractObj;
      };
    }
  ])

  .controller('TractCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
      '$routeParams', 'Tract', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'ROW', 'WeldImages','Auth',
    function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
        $routeParams, Tract, $window, $location, user, LOCATIONS, openPost, ROW, WeldImages, Auth) {

          //JOIN function
              function extend(base) {
                              var parts = Array.prototype.slice.call(arguments, 1);
                              parts.forEach(function (p) {
                                  if (p && typeof (p) === 'object') {
                                      for (var k in p) {
                                          if (p.hasOwnProperty(k)) {
                                              base[k] = p[k];
                                          }
                                      }
                                  }
                              });
                              return base;
                          };
          //end JOIN function
          //get userID
          $scope.authObj = Auth;
          var authData = $scope.authObj.$getAuth();
                        var userObj = $firebaseObject(Ref.child('users').child(authData.uid));
                        userObj.$loaded()
                              .catch(alert)
                              .then(function(){

                      $scope.userName = userObj.name;
                      $scope.userRoles = userObj.roles;
                    });
          //end userID

    new Tract($routeParams.tractid).$bindTo($scope, 'tract');
    //Map zoom
    $scope.MapIt = function (){
      $location.path('/map_zoom/'+$routeParams.tractid)
    }
    var obj = $firebaseArray(Ref.child('tracts').child($routeParams.tractid));
          obj.$loaded()
            .catch(alert)
            .then(function() {

//JOIN 'tracts' and 'landowners' info
      var activeOwners = $firebaseArray(Ref.child('tracts').child($scope.tract.$id).child('landowners').orderByChild('inactive').startAt(null).endAt(false));
      var inactiveOwners = $firebaseArray(Ref.child('tracts').child($scope.tract.$id).child('landowners'));

        inactiveOwners.$loaded()
                .catch(alert)
                .then(function() {
var activeOwnersArray = [];
var inactiveOwnersArray = [];
$scope.totalOwners = activeOwners.length;
inactiveOwners.forEach(function(z){
  if(z.inactive!==true){
    Ref.child('tracts').child($scope.tract.$id).child('landowners').child(z.ownername).once('value', function(tractSnap){
      var tractRecords = extend({}, tractSnap.val());
      Ref.child('landowners').child(tractSnap.key).once('value',function(ownerSnap){

          activeOwnersArray.push(extend({}, z, ownerSnap.val()) );

      });
  });
};
    Ref.child('tracts').child($scope.tract.$id).child('landowners').child(z.ownername).once('value', function(tractSnap){
      var tractRecords = extend({}, tractSnap.val());
      Ref.child('landowners').child(tractSnap.key).once('value',function(ownerSnap){

          inactiveOwnersArray.push(extend({}, z, ownerSnap.val()) );

      });
  });

})
$scope.ownerArray = activeOwnersArray;


  if (typeof($scope.inactiveOwnerFilter) === true)  {
    $scope.inactiveOwnerFilter = true;

  }

  $scope.toggleInactiveOwners = function() {

    $scope.inactiveOwnerFilter = !$scope.inactiveOwnerFilter;
    if ($scope.inactiveOwnerFilter) {

      $scope.ownerArray = inactiveOwnersArray;
      $scope.totalOwners = activeOwners.length;
    } else {
      $scope.ownerArray = activeOwnersArray;

    }
$scope.totalOwners = $scope.ownerArray.length;
  }
    $scope.ownerInactive = function(id){
      if (id === true){
        return true
      }
      else {
        return false
      };
    };
});
//get landowners for Survey Permission drop-down list
var ownerArray = [];
var tractOwnersRef = $firebaseArray(Ref.child('tracts').child($routeParams.tractid).child('landowners'));
tractOwnersRef.$loaded()
.catch(alert)
.then(function(){
  tractOwnersRef.forEach(function(x){
    if(x.inactive!==true){
    var landownerInfo = $firebaseObject(Ref.child('landowners').child(x.ownername));
    landownerInfo.$loaded()
    .catch(alert)
    .then(function(){
ownerArray.push(landownerInfo)
    })
}
    })
  })
$scope.owners = ownerArray;
//end get landowners for Survey Permission
              var tractObj=$firebaseArray(Ref.child('tracts').child($scope.tract.$id));
              tractObj.$loaded()
              .catch(alert)
              .then(function(){

              if($scope.userRoles==="manager"||$scope.userRoles==="admin"){$scope.isManager="false"}else {$scope.isManager="true"};

              var eventKey;
              tractObj.$watch(function(event){
                eventKey = event;
                // console.log($scope.userName + " modified " + event.key + " on " + new Date());
                if(eventKey!=='updatedby'){$scope.tract.updatedby = $scope.userName + " updated " + event.key + " on " + new Date()};
              });
var surveyPermissionObj=$firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('surveypermissionapproved'));
surveyPermissionObj.$loaded()
  .catch(alert)
  .then(function(){
surveyPermissionObj.$watch(function(){
if($scope.tract.surveypermissionapproved!==''&&typeof($scope.tract.surveypermissionapproved)!=='undefined'&&$scope.tract.surveypermissionapproved!==''&&$scope.userRoles==='manager'){$scope.tract.surveypermissionapprovedby = $scope.userName.toUpperCase()}
else if($scope.tract.surveypermissionapproved!==''&&typeof($scope.tract.surveypermissionapproved)!=='undefined'&&$scope.tract.surveypermissionapproved!==''&&$scope.userRoles==='admin'){$scope.tract.surveypermissionapprovedby = $scope.userName.toUpperCase()}
else{
$scope.tract.surveypermissionapprovedby='';
};
});
});
var civilSurveyObj=$firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('civilsurveyapproved'));
civilSurveyObj.$loaded()
  .catch(alert)
  .then(function(){

civilSurveyObj.$watch(function(){

if($scope.tract.civilsurveyapproved!==''&&typeof($scope.tract.civilsurveyapproved)!=='undefined'&&$scope.tract.civilsurveyapproved!==''&&$scope.userRoles==='manager'){$scope.tract.civilsurveyapprovedby = $scope.userName.toUpperCase()}
else if($scope.tract.civilsurveyapproved!==''&&typeof($scope.tract.civilsurveyapproved)!=='undefined'&&$scope.tract.civilsurveyapproved!==''&&$scope.userRoles==='admin'){$scope.tract.civilsurveyapprovedby = $scope.userName.toUpperCase()}

else{

$scope.tract.civilsurveyapprovedby='';

};

});

});

var titleObj=$firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('titleapproved'));
titleObj.$loaded()
  .catch(alert)
  .then(function(){

titleObj.$watch(function(){

if($scope.tract.titleapproved!==''&&typeof($scope.tract.titleapproved)!=='undefined'&&$scope.tract.titleapproved!==''&&$scope.userRoles==='manager'){$scope.tract.titleapprovedby = $scope.userName.toUpperCase()}
else if($scope.tract.titleapproved!==''&&typeof($scope.tract.titleapproved)!=='undefined'&&$scope.tract.titleapproved!==''&&$scope.userRoles==='admin'){$scope.tract.titleapprovedby = $scope.userName.toUpperCase()}

else{

$scope.tract.titleapprovedby='';

};

});

});



var acquisitionObj=$firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('acquisitionapproved'));
acquisitionObj.$loaded()
  .catch(alert)
  .then(function(){

acquisitionObj.$watch(function(){

if($scope.tract.acquisitionapproved!==''&&typeof($scope.tract.acquisitionapproved)!=='undefined'&&$scope.tract.acquisitionapproved!==''&&$scope.userRoles==='manager'){$scope.tract.acquisitionapprovedby = $scope.userName.toUpperCase()}
else if($scope.tract.acquisitionapproved!==''&&typeof($scope.tract.acquisitionapproved)!=='undefined'&&$scope.tract.acquisitionapproved!==''&&$scope.userRoles==='admin'){$scope.tract.acquisitionapprovedby = $scope.userName.toUpperCase()}

else{

$scope.tract.acquisitionapprovedby='';

};

});

});

var environmentalSurveyObj=$firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('environmentalsurveyapproved'));
environmentalSurveyObj.$loaded()
  .catch(alert)
  .then(function(){
environmentalSurveyObj.$watch(function(){
if($scope.tract.environmentalsurveyapproved!==''&&typeof($scope.tract.environmentalsurveyapproved)!=='undefined'&&$scope.tract.environmentalsurveyapproved!==''&&$scope.userRoles==='manager'){$scope.tract.environmentalsurveyapprovedby = $scope.userName.toUpperCase()}
else if($scope.tract.environmentalsurveyapproved!==''&&typeof($scope.tract.environmentalsurveyapproved)!=='undefined'&&$scope.tract.environmentalsurveyapproved!==''&&$scope.userRoles==='admin'){$scope.tract.environmentalsurveyapprovedby = $scope.userName.toUpperCase()}
else{
$scope.tract.environmentalsurveyapprovedby='';
};
});
});
});
            //   });
              var rowcostArray = [];
              var temporaryworkspaceArray = [];
              var atwsArray = [];
              var accessArray = [];
              var damagesArray = [];
              var valvesArray = [];
              var otherArray = [];
              var grandTotalArray = [];
              var landownersArray = [];
              var ownerArr = [];
              var ownerRef = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('landowners'));
              ownerRef.$loaded()
              .catch(alert)
              .then(function () {
                ownerRef.forEach(function(o){
                landownersArray.push(o);
                })
                setTimeout(function(){
                  $scope.ownerArr = ownerArr;
              },100);
                var paymentsArray = [];
                landownersArray.forEach(function(l){
                  if(l.payments!==null&&typeof(l.payments)!=='undefined'){paymentsArray.push(l.payments)};
                });
                var singlepaymentArray=[];
                paymentsArray.forEach(function(p){
              var arr = Object.keys(p).map(function (key) { return p[key]; });
              arr.forEach(function(x){
                if(x.inactive!==true){
                singlepaymentArray.push(x)
              };
              })
            });
                singlepaymentArray.forEach(function(i){
                if(i.rowcost!==null && typeof(i.rowcost)!=='undefined' && i.rowcost!==''){rowcostArray.push(i.rowcost);grandTotalArray.push(i.rowcost)} else {rowcostArray.push(0);grandTotalArray.push(0)};
                if(i.temporaryworkspacecost!==null && typeof(i.temporaryworkspacecost)!=='undefined' && i.temporaryworkspacecost!==''){temporaryworkspaceArray.push(i.temporaryworkspacecost); grandTotalArray.push(i.temporaryworkspacecost)} else {temporaryworkspaceArray.push(0);grandTotalArray.push(0)};
                if(i.additionalworkspacecost!==null && typeof(i.additionalworkspacecost)!=='undefined' && i.additionalworkspacecost!==''){atwsArray.push(i.additionalworkspacecost); grandTotalArray.push(i.additionalworkspacecost)} else {atwsArray.push(0);grandTotalArray.push(0)};
                if(i.accesscost!==null && typeof(i.accesscost)!=='undefined' && i.accesscost!==''){accessArray.push(i.accesscost); grandTotalArray.push(i.accesscost)} else {accessArray.push(0);grandTotalArray.push(0)};
                if(i.damagescost!==null && typeof(i.damagescost)!=='undefined' && i.damagescost!==''){damagesArray.push(i.damagescost); grandTotalArray.push(i.damagescost)} else {damagesArray.push(0);grandTotalArray.push(0)};
                if(i.valvescost!==null && typeof(i.valvescost)!=='undefined' && i.valvescost!==''){valvesArray.push(i.valvescost); grandTotalArray.push(i.valvescost)} else {valvesArray.push(0);grandTotalArray.push(0)};
                if(i.othercost!==null && typeof(i.othercost)!=='undefined' && i.othercost!==''){otherArray.push(i.othercost); grandTotalArray.push(i.othercost)} else {otherArray.push(0);grandTotalArray.push(0)};
              });
              });
            //get totals for each payment category array
              var tenantsArray = [];
              var tenantRef = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('tenants'));
              tenantRef.$loaded()
              .catch(alert)
              .then(function () {
                tenantRef.forEach(function(o){
                tenantsArray.push(o)
                })
                var paymentsArray = [];
                tenantsArray.forEach(function(l){

                  if(l.payments!==null&&typeof(l.payments)!=='undefined'){paymentsArray.push(l.payments)};
                });

                var singlepaymentArray=[];

                paymentsArray.forEach(function(p){

              var arr = Object.keys(p).map(function (key) { return p[key]; });
              arr.forEach(function(x){
                if(x.inactive!==true){
                singlepaymentArray.push(x)};
              })
              });

              function getSum(total, num) {
              return total + num;
              };

                singlepaymentArray.forEach(function(i){
                if(i.rowcost!==null && typeof(i.rowcost)!=='undefined' && i.rowcost!==''){rowcostArray.push(i.rowcost);grandTotalArray.push(i.rowcost)} else {rowcostArray.push(0);grandTotalArray.push(0)};
                if(i.temporaryworkspacecost!==null && typeof(i.temporaryworkspacecost)!=='undefined' && i.temporaryworkspacecost!==''){temporaryworkspaceArray.push(i.temporaryworkspacecost); grandTotalArray.push(i.temporaryworkspacecost)} else {temporaryworkspaceArray.push(0);grandTotalArray.push(0)};
                if(i.additionalworkspacecost!==null && typeof(i.additionalworkspacecost)!=='undefined' && i.additionalworkspacecost!==''){atwsArray.push(i.additionalworkspacecost); grandTotalArray.push(i.additionalworkspacecost)} else {atwsArray.push(0);grandTotalArray.push(0)};
                if(i.accesscost!==null && typeof(i.accesscost)!=='undefined' && i.accesscost!==''){accessArray.push(i.accesscost); grandTotalArray.push(i.accesscost)} else {accessArray.push(0);grandTotalArray.push(0)};
                if(i.damagescost!==null && typeof(i.damagescost)!=='undefined' && i.damagescost!==''){damagesArray.push(i.damagescost); grandTotalArray.push(i.damagescost)} else {damagesArray.push(0);grandTotalArray.push(0)};
                if(i.valvescost!==null && typeof(i.valvescost)!=='undefined' && i.valvescost!==''){valvesArray.push(i.valvescost); grandTotalArray.push(i.valvescost)} else {valvesArray.push(0);grandTotalArray.push(0)};
                if(i.othercost!==null && typeof(i.othercost)!=='undefined' && i.othercost!==''){otherArray.push(i.othercost); grandTotalArray.push(i.othercost)} else {otherArray.push(0);grandTotalArray.push(0)};
              });
              //get totals for each payment category array
              if(rowcostArray.length>0){$scope.rowcostTotal = rowcostArray.reduce(getSum).toFixed(2)};
              if(temporaryworkspaceArray.length>0){$scope.tempworkspaceTotal = temporaryworkspaceArray.reduce(getSum).toFixed(2)};
              if(atwsArray.length>0){$scope.atwsTotal = atwsArray.reduce(getSum).toFixed(2)};
              if(accessArray.length>0){$scope.accessTotal = accessArray.reduce(getSum).toFixed(2)};
              if(damagesArray.length>0){$scope.damagesTotal = damagesArray.reduce(getSum).toFixed(2)};
              if(valvesArray.length>0){$scope.valvesTotal = valvesArray.reduce(getSum).toFixed(2)};
              if(otherArray.length>0){$scope.otherTotal = otherArray.reduce(getSum).toFixed(2)};
              if(grandTotalArray.length>0){$scope.grandTotal = grandTotalArray.reduce(getSum).toFixed(2)};

              });

            });

      //toggle Accordions
      $scope.togglePropertyDetailsAccordion = function(){
        $scope.PropertyDetailsExpanded = !$scope.PropertyDetailsExpanded;
      };
      $scope.toggleLandOwnersAccordion = function(){
        $scope.LandOwnersExpanded = !$scope.LandOwnersExpanded;
      };
      $scope.toggleTenantsAccordion = function(){
        $scope.TenantsExpanded = !$scope.TenantsExpanded;
      };
      $scope.toggleTitleSearchAccordion = function(){
        $scope.TitleSearchExpanded = !$scope.TitleSearchExpanded;
      };
      $scope.toggleEasementsAccordion = function(){
        $scope.EasementsExpanded = !$scope.EasementsExpanded;
      };
      $scope.toggleSurveyPermissionAccordion = function(){
        $scope.SurveyPermissionExpanded = !$scope.SurveyPermissionExpanded;
      };
      $scope.toggleCivilSurveyAccordion = function(){
        $scope.CivilSurveyExpanded = !$scope.CivilSurveyExpanded;
      };
      $scope.toggleEnvironmentalSurveyAccordion = function(){
        $scope.EnvironmentalSurveyExpanded = !$scope.EnvironmentalSurveyExpanded;
      };
      $scope.toggleAcquisitionAccordion = function(){
        $scope.AcquisitionDetailsExpanded = !$scope.AcquisitionDetailsExpanded;
      };
      $scope.toggleContactReportsAccordion = function(){
        $scope.ContactReportsExpanded = !$scope.ContactReportsExpanded;
      };
      $scope.toggleCostDetailsAccordion = function(){
        $scope.CostDetailsExpanded = !$scope.CostDetailsExpanded;
      };
      $scope.toggleConstructionAccordion = function(){
        $scope.ConstructionExpanded = !$scope.ConstructionExpanded;
      };

      Ref.child('agents').once('value',function(snapshot) {

        var obj = $firebaseArray(Ref.child('agents').orderByChild('department').equalTo('RIGHT-OF-WAY'));

        obj.$loaded()
          .catch(alert)
          .then(function() {
            $scope.fieldagents = obj;
      }
        )
      });

      $scope.orderByOwnerField = 'ownerid';
      $scope.reverseOwnerSort = false;


      $scope.orderByOwner = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByOwnerField=fld;
        $scope.reverseOwnerSort = !$scope.reverseOwnerSort;
      };

      $scope.orderByTenantField = 'tenantid';
      $scope.reverseTenantSort = false;


      $scope.orderByTenant = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByTenantField=fld;
        $scope.reverseTenantSort = !$scope.reverseTenantSort;
      };

      $scope.orderByEasementField = 'easementid';
      $scope.reverseEasementSort = false;


      $scope.orderByEasement = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByEasementField=fld;
        $scope.reverseEasementSort = !$scope.reverseEasementSort;
      };
      $scope.orderByContactReportField = 'contactdate';
      $scope.reverseContactReportSort = false;


      $scope.orderByContactReport = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByContactReportField=fld;
        $scope.reverseContactReportSort = !$scope.reverseContactReportSort;
      };
      var inactiveRef = Ref.child('tracts').child($routeParams.tractid);
      var inactiveStatus = inactiveRef.child('inactive');
      $scope.inactiveStatus = $firebaseObject(inactiveStatus);


      Ref.child('tracts').once('value',function(snapshot) {
        var obj = $firebaseArray(Ref.child('tracts'));
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

                var landowners = $firebaseArray(Ref.child('tracts').child($scope.tract.$id).child('landowners'));
                landowners.$loaded().catch(alert).then(function() {
                var arrLen = landowners.length;
                $scope.addNewOwner = function(){
                  var t = Ref.child('tracts').child($scope.tract.$id).child('landowners').push();
                  $location.path('/tracts/'+$scope.tract.$id+'/landowners/'+t.key);
                  var newOwner=$firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('landowners').child(t.key));
                  newOwner.$bindTo($scope,'owner');
                  newOwner.$loaded().catch(alert).then(function(){
                    var tractnumber = $scope.tract.tract;

                  $scope.owner.ownerid=tractnumber+'-L'+Number(arrLen+1);
                  $scope.owner.ownername = 'empty';

});

                };

              });

            var ownersRefFiltered =  Ref.child('tracts').child($scope.tract.$id).child('landowners').orderByChild('inactive').startAt(null).endAt(false);
            var ownersRef =  Ref.child('tracts').child($scope.tract.$id).child('landowners');
            var activeOwners = $firebaseArray(ownersRefFiltered);
            var inactiveOwners = $firebaseArray(ownersRef);

            $scope.landowners = activeOwners;





      var tenantsRefFiltered =  Ref.child('tracts').child($scope.tract.$id).child('tenants').orderByChild('inactive').startAt(null).endAt(false);
      var tenantsRef =  Ref.child('tracts').child($scope.tract.$id).child('tenants');
      var activeTenants = $firebaseArray(tenantsRefFiltered);
      var inactiveTenants = $firebaseArray(tenantsRef);
      $scope.tenants = activeTenants;

      $scope.tenants.$loaded().catch(alert)
      .then(function() {

        $scope.totalTenants = $scope.tenants.length;

        if (typeof($scope.inactiveTenantsFilter) === true)  {
          $scope.inactiveTenantsFilter = true;
        }

        $scope.toggleInactiveTenants = function() {

          $scope.inactiveTenantsFilter = !$scope.inactiveTenantsFilter;
          if ($scope.inactiveTenantsFilter) {

            $scope.tenants = $firebaseArray(tenantsRef);
            $scope.totalTenants = inactiveTenants.length;
          } else {
            $scope.tenants = $firebaseArray(tenantsRefFiltered);
            $scope.totalTenants = activeTenants.length;
          }

        }

          $scope.tenantInactive = function(id){
            if (id === true){
              return true
            }
            else {
              return false
            };
          };
        });
        $scope.addNewTenant = function(){
        var t = Ref.child('tracts').child($scope.tract.$id).child('tenants').push();
        $location.path('/tracts/'+$scope.tract.$id+'/tenants/'+t.key);
        var arrLen = inactiveTenants.length;
        var newTenant=$firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('tenants').child(t.key));
        newTenant.$bindTo($scope,'tenant');
        newTenant.$loaded().catch(alert).then(function(){
          var tractnumber = $scope.tract.tract;

        $scope.tenant.tenantid=tractnumber+'-T'+Number(arrLen+1);
        $scope.tenant.name = 'empty';

    });
        };

        $scope.addNewEasement = function(){
        var e = Ref.child('tracts').child($scope.tract.$id).child('easements').push();
        $location.path('/tracts/'+$scope.tract.$id+'/easements/'+e.key);
        };

        var easementsRefFiltered =  Ref.child('tracts').child($scope.tract.$id).child('easements').orderByChild('inactive').startAt(null).endAt(false);
        var easementsRef =  Ref.child('tracts').child($scope.tract.$id).child('easements');
        var activeEasements = $firebaseArray(easementsRefFiltered);
        var inactiveEasements = $firebaseArray(easementsRef);
        $scope.easements = activeEasements;

        $scope.easements.$loaded().catch(alert)
        .then(function() {
          $scope.totalEasements = activeEasements.length;
          if (typeof($scope.inactiveEasementsFilter) === true)  {
            $scope.inactiveEasementsFilter = true;
          }

          $scope.toggleInactiveEasements = function() {

            $scope.inactiveEasementsFilter = !$scope.inactiveEasementsFilter;
            if ($scope.inactiveEasementsFilter) {

              $scope.easements = $firebaseArray(easementsRef);
              $scope.totalEasements = inactiveEasements.length;
            } else {
              $scope.easements = $firebaseArray(easementsRefFiltered);
              $scope.totalEasements = activeEasements.length;
            }

          }

            $scope.easementInactive = function(id){
              if (id === true){
                return true
              }
              else {
                return false
              };
            };
            })
      });
//Begin Contact ReportsCtrl
$scope.addNewContactReport = function(){
  if(typeof($scope.tract.rowagent)!=='undefined'&&$scope.tract.rowagent!==null&&$scope.tract.rowagent!==''){
var c = Ref.child('contactreports').child($scope.tract.$id).push({rowagent: $scope.tract.rowagent});
}else{
var c = Ref.child('contactreports').child($scope.tract.$id).push();
}
$location.path('/tracts/'+$scope.tract.$id+'/contactreports/'+c.key);

};

var contactReportsRefFiltered =  Ref.child('contactreports').child($routeParams.tractid).orderByChild('inactive').startAt(null).endAt(false);
var contactReportsRef =  Ref.child('contactreports').child($routeParams.tractid);
var activeContactReports = $firebaseArray(contactReportsRefFiltered);
var inactiveContactReports = $firebaseArray(contactReportsRef);
$scope.contactreports = activeContactReports;

$scope.contactreports.$loaded().catch(alert)
.then(function() {
  $scope.totalContactReports = activeContactReports.length;
  if (typeof($scope.inactiveContactReportFilter) === true)  {
    $scope.inactiveContactReportFilter = true;
  }

  $scope.toggleInactiveContactReports = function() {

    $scope.inactiveContactReportFilter = !$scope.inactiveContactReportFilter;
    if ($scope.inactiveContactReportFilter) {

      $scope.contactreports = inactiveContactReports;
      $scope.totalContactReports = inactiveContactReports.length;

      $scope.contactreports.forEach(function(z){
        if(z.contactperson!==null&&typeof(z.contactperson)!=='undefined'&&z.contactperson!==''){
  var contactOwnerRef = $firebaseArray(Ref.child('landowners').child(z.contactperson));
  if(contactOwnerRef){
    contactOwnerRef.$loaded().catch(alert).then(function(){
    contactOwnerRef.forEach(function(y){
      if (y.$id==='name'&&y.$value!==null&&typeof(y.$value)!=='undefined'){z.name=y.$value;};
    })
    });
  };

  var contactTenantRef = $firebaseObject(Ref.child('tracts').child($routeParams.tractid).child('tenants').child(z.contactperson));
    contactTenantRef.$loaded().catch(alert).then(function(){

  if(contactTenantRef){z.name=contactTenantRef.name;}

  });
};
  });
    } else {
      $scope.contactreports = activeContactReports;
      $scope.totalContactReports = activeContactReports.length;
    }

  }

    $scope.contactReportInactive = function(id){
      if (id === true){
        return true
      }
      else {
        return false
      };
    };

    $scope.contactreports.forEach(function(z){
      if(typeof(z.contactperson)!=='undefined'&&z.contactperson!==null&&z.contactperson!==''){
var contactOwnerRef = $firebaseArray(Ref.child('landowners').child(z.contactperson));
if(contactOwnerRef){
  contactOwnerRef.$loaded().catch(alert).then(function(){
  contactOwnerRef.forEach(function(y){
    if (y.$id==='name'&&y.$value!==null&&typeof(y.$value)!=='undefined'){z.name=y.$value;};
  })
  });
};

var contactTenantRef = $firebaseObject(Ref.child('tracts').child($routeParams.tractid).child('tenants').child(z.contactperson));
  contactTenantRef.$loaded().catch(alert).then(function(){

if(contactTenantRef){z.name=contactTenantRef.name;}

});
};
});
    })

//End Contact Reports

//Begin Survey Permission Form
$scope.printSurveyForm = function () {
      var tractsRefFiltered =  Ref.child('tracts').child($routeParams.tractid);
      var selectedTract = $firebaseObject(tractsRefFiltered);

      selectedTract.$loaded().catch(alert)
      .then(function() {

        if (typeof(selectedTract.sequence) === 'undefined' || selectedTract.sequence === ''){var sequence = ''}
          else {sequence = selectedTract.sequence};
        if (typeof(selectedTract.tract) === 'undefined' || selectedTract.tract === ''){var tract = ''}
            else {tract = selectedTract.tract};
            var owner = selectedTract.owner;
        if (typeof(selectedTract.section) === 'undefined' || selectedTract.section === ''){var section = ''}
            else {section = selectedTract.section};
        if (typeof(selectedTract.township) === 'undefined' || selectedTract.township === ''){var township = ''}
            else {township = selectedTract.township};
        if (typeof(selectedTract.range) === 'undefined' || selectedTract.range === ''){var range = ''}
              else {range = selectedTract.range};
        if (typeof(selectedTract.legal) === 'undefined' || selectedTract.legal === ''){var legaldescription = 'A tract of land'}
            else {legaldescription = selectedTract.legal};
        if (typeof(selectedTract.taxyear) !== 'undefined' && selectedTract.taxyear !== ''){var taxyear = selectedTract.taxyear}
            else {taxyear = ''};
        if (typeof(selectedTract.delinquentamount) !== 'undefined' && selectedTract.delinquentamount !== ''){var delinquentamount = '$ ' + selectedTract.delinquentamount.toFixed(2)}
            else {delinquentamount = ''};
        if (typeof(selectedTract.originaleasementbook) !== 'undefined' && selectedTract.originaleasementbook !== ''){var originaleasementbook = selectedTract.originaleasementbook}
            else {originaleasementbook = ''};
        if (typeof(selectedTract.originaleasementdate) !== 'undefined' && selectedTract.originaleasementdate !== ''){var originaleasementdate = selectedTract.originaleasementdate}
          else {originaleasementdate = ''};
        if (typeof(selectedTract.originaleasementpage) !== 'undefined' && selectedTract.originaleasementpage !== ''){var originaleasementpage = selectedTract.originaleasementpage}
          else {originaleasementpage = ''};
        if (typeof(selectedTract.originaleasementfiled) !== 'undefined' && selectedTract.originaleasementfiled !== ''){var originaleasementfiled = selectedTract.originaleasementfiled}
          else {originaleasementfiled = ''};
          if (typeof(selectedTract.originaleasementdocument) !== 'undefined' && selectedTract.originaleasementdocument !== ''){var originaleasementdocument = selectedTract.originaleasementdocument}
            else {originaleasementdocument = ''};
        if (typeof(selectedTract.address) !== 'undefined' && selectedTract.address !== ''){var owneraddress = selectedTract.address}
            else {owneraddress = ''};
        if (typeof(selectedTract.city) !== 'undefined' && selectedTract.city !== ''){var city = selectedTract.city}
            else {city = ''};
        if (typeof(selectedTract.state) !== 'undefined' && selectedTract.state !== ''){var state = selectedTract.state}
            else {state = ''};
        if (typeof(selectedTract.zip) !== 'undefined' && selectedTract.zip !== ''){var zip = selectedTract.zip}
            else {zip = ''};
        if(city !=='' && state !== '' && zip !== ''){var citystatezip = city+', '+state+' '+zip}
            else {citystatezip = ''};
        if (typeof(selectedTract.taxstatus) === 'undefined' || selectedTract.taxstatus === ''){var taxstatus = '2099'}
            else {taxstatus = selectedTract.taxstatus};
        if (typeof(selectedTract.county) === 'undefined' || selectedTract.county === ''){var county = ''}
            else {county = selectedTract.county};
        if (typeof(selectedTract.acres) === 'undefined' || selectedTract.acres === ''){var acres = ''}
          else {acres = selectedTract.acres};
        if (typeof(selectedTract.parcelid) === 'undefined' || selectedTract.parcelid === ''){var parcelid = ''}
          else {parcelid = selectedTract.parcelid};
        if (typeof(selectedTract.surveypermission) === 'undefined' || selectedTract.surveypermission === ''){var granted = ''}
          else {granted = selectedTract.surveypermission};
        if (selectedTract.surveypermissiontype === 'VERBAL'){var verbalcheckbox = 'Checked'}
          else {verbalcheckbox = 'Unchecked'};
        if (selectedTract.surveypermissiontype === 'WRITTEN'){var writtencheckbox = 'Checked'}
          else {writtencheckbox = 'Unchecked'};
        if (typeof(selectedTract.rowagent) === 'undefined' || selectedTract.rowagent === ''){var rowagent = ''}
          else {rowagent = selectedTract.rowagent};
        if (typeof(selectedTract.surveycomments) === 'undefined' || selectedTract.surveycomments === ''){var surveycomments = ''}
          else {surveycomments = selectedTract.surveycomments};
        if (typeof(selectedTract.accessnotes) === 'undefined' || selectedTract.accessnotes === ''){var accessnotes = ''}
          else {accessnotes = selectedTract.accessnotes};
      var dd;
      var selectedOwner;
      if (typeof(selectedTract.ownercontacted)==='undefined'||selectedTract.ownercontacted=== null||selectedTract.ownercontacted===''){
        selectedOwner = '';
        var ownercontacted='';
        var fulladdress ='';
        var phone1='';
        var phone2 = '';
        var email= '';

        dd = {
          content:[
              [	{table: {
            widths:['50%','50%'],
            body:[
            [{text:' ',border:[false,false,false,false],},{text: [{text:'Tract No. '},{text: tract, decoration: 'underline'}],alignment:'right',margin:[0,5,5,0],border:[false,false,false,false]}
      ]]}}],
            {text:'\n\nMTS\n LANDOWNER NOTIFICATION AND SURVEY PERMIT\n\n', alignment:'center',bold: true,
                    },
            { text: [
                      {text:'\n\nOn '},{text: granted, decoration:'underline', bold:true},{text: ', the owner of the herein described property grants unto MTS, their agents, assigns and employees, permission and license to enter said property for the purpose of conducting surveys, including the placement of stakes, line of sight clearing, geotechnical soil borings, environmental, archaeological and appraisal studies for the routing of pipeline right-of-way.\n\n', alignment:'left'}]
                      , margin:[4,0,0,0]
            },
        '\n',

            {   table: {
              widths:['18%','75%'],
              body: [
                [{text:'PROPERTY:',border:[false],alignment:'left',bold:true},
                {text: [
                {text: legaldescription + ' in Section '},
                {text: section, decoration:'underline'},
                {text: ' , Township '},
                {text: township, decoration:'underline'},
                {text: ' , Range '},
                {text: range, decoration:'underline'},
                {text: ' , '},
                {text: county+'.', decoration:'underline'}

              ],


                border:[false],alignment:'left'}],

              ]
                },

              alignment: 'center',

            },
            '\n',
            {   table: {
              widths:['18%','15%','60%'],
              body: [
                [{text:'LAND OWNER:',border:[false],alignment:'left',bold:true},{text:'',border:[false]},{text:'',border:[false]},],
                [{text:'',border:[false]},{text: 'Name:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: ownercontacted, style: 'tableHeader', alignment: 'left', border:[false]}],
                [{text:'',border:[false]},{text: 'Address:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: fulladdress, style: 'tableHeader', alignment: 'left', border:[false]}],
                [{text:'',border:[false]},{text: 'Phone 1:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: phone1, style: 'tableHeader', alignment: 'left', border:[false]}],
                [{text:'',border:[false]},{text: 'Phone 2:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: phone2, style: 'tableHeader', alignment: 'left', border:[false]}],
                [{text:'',border:[false]},{text: 'E-Mail:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: email, style: 'tableHeader', alignment: 'left', border:[false]}],
                [{text:'',border:[false]},{text: 'Signature:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: '', style: 'tableHeader', alignment: 'left', border:[false,false,false,true]}],
              ]
                },

              alignment: 'center',

            },
      '\n',
      '\n',
      {   table: {
        widths:['30%','65%'],
        body: [
          [{text:'PERMISSION:',bold: true, alignment: 'left',border:[false]},{text: '', alignment:'left', bold: true, border:[false]}]
        ]
      },
        alignment: 'center',
      },

      {   table: {
        widths:['18%','9%','15%', '9%','49%'],
        body: [
          [{text:'',border:[false]},{text: 'Verbal:', alignment:'right', bold: true, border:[false]}, {image: verbalcheckbox, width: 20, border:[false], alignment:'left'},
          {text: 'Written:', alignment:'left', bold: true, border:[false]}, {image: writtencheckbox, width: 20, border:[false], alignment: 'left'}],
        ]
          },
        alignment: 'center',
      },
      '\n',
      {   table: {
        widths:['18%','15%','60%'],
        body: [
          [{text:'ACQUIRED BY:',border:[false],alignment:'left',bold:true},{text:'',border:[false]},{text:'',border:[false]},],
          [{text:'',border:[false]},{text: 'ROW Agent:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: rowagent, style: 'tableHeader', alignment: 'left', border:[false]}],
          [{text:'',border:[false]},{text: 'Signature:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: '', style: 'tableHeader', alignment: 'left', border:[false,false,false,true]}],
        ]
          },

        alignment: 'center',

      },
      '\n','\n',
      {   table: {
        widths:['30%','65%'],
        body: [
          [{text:'ACCESS NOTES:',bold: true, alignment: 'left',border:[false]},{text: '', alignment:'left', bold: true, border:[false]}]
        ]
      },
        alignment: 'center',
      },

      {
            table: {
              widths:[-5,'100%'],
              body: [

                [
                  {text:'1', color:'white',border:[false]},
                  {
                  rowSpan: 3,
                  border: [true,true,true,true],
                  text: accessnotes.replace(new RegExp('\r?\n','g'), '')
                  }
                ],

                [{text:'2',color:'white', border:[false]}],
                [{text:'3', color:'white', border: [false]}],

              ]
            }
      },
      '\n',
      {   table: {
        widths:['30%','65%'],
        body: [
          [{text:'COMMENTS:',bold: true, alignment: 'left',border:[false]},{text: '', alignment:'left', bold: true, border:[false]}]
        ]
      },
        alignment: 'center',
      },

      {

            table: {
              widths:[-5,'100%'],
              body: [

                [
                  {text:'1', color:'white',border:[false]},
                  {
                  rowSpan: 4,
                  border: [true,true,true,true],
                  text: surveycomments.replace(new RegExp('\r?\n','g'), '')
                  }
                ],

                [{text:'2',color:'white', border:[false]}],
                [{text:'3', color:'white', border: [false]}],
                [{text:'4', color:'white', border: [false]}],

              ]
            }
      }

          ],
      pageMargins: [40,15,40,25],

      images:{
        Unchecked:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABVUlEQVR4Xu2UQQ6DQAwD4f+Pbg9w4pQZC2nRumevcSZOz2Pz37n5/EcBtAGbE+gJbF6A/gn2BHoCcwK/uXQJ5ajdI9E9TgEssdd5iNFyR6I24CLwPAECb743r1T5yBDqA34e/FLlKwDAWREG/qlU5WsDAHZFGPinUpWvDQDYFWHgn0pVvjYAYFeEgX8qVfnaAIBdEQb+qVTlawMAdkUY+KdSla8NANgVYeCfSlW+NgBgV4SBfypV+doAgF0RBv6pVOVrAwB2RRj4p1KVrw0A2BVh4J9KVb42AGBXhIF/KlX52gCAXREG/qlU5WsDAHZFGPinUpWvDQDYFWHgn0pVvjYAYFeEgX8qVfnaAIBdEQb+qVTlSxqQBn77/Wi2kehO+iT89gCp/2i2kagALgLbNyCt5JLvyQksOUAaqgBSgl9/3wZ8fYNp/jYgJfj1923A1zeY5v8D3apQQVw1ztMAAAAASUVORK5CYII=',

        Checked:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABzklEQVR4Xu2a0W0DIRBE152klKSTpLKklHSSdJII2UgWgvPMLJYWbu/HHx7wztsB7k6+2Mmvy8n9WwLIBJycQC6BkwcgN8FcArkEcAJ/uDSEEko3JLrZSQAh+ooXATUXEmUCrgTaJcDAw/umK6X6GBPSD+h+6JFSfQmA4CwRJub3SqX6MgEEdokwMb9XKtWXCSCwS4SJ+b1Sqb6VEvBqZt8HlLYG8G5mn2b2ZWYfAwjbAqjmq+8RhC0BtOYrhLfOctgOwMh8WQIlBe21FQDWvPywFvEUUMxvA0A1Hw7Ai5n9knc2HvOhAFQjo82qx8VrPgyA1ggCYYb5EABK7H867T2CMMt8CAClCMYQo0W2kzD3AYgxRIOYvteEAfAoCeX78mDTXsh+cQQlFIAjCD0TXvNh9oDW3Cjq97oZ5sMCeJSEWeZDAxhBmGk+PIAWwmzzSwCoEMpn73mePfZafbhTwGuIHZ8AGmLQuw5IdJtYIsy20aGX6ksABHGJMDG/VyrVlwkgsEuEifm9Uqk+TwK8BT97POQNEg1OgWcb8M4PeYNECeBK4PT/FPVGMuR4ZgmENOAtKgF4Ca4+PhOwege99WcCvARXH58JWL2D3vr/AaNqhEEBNqzLAAAAAElFTkSuQmCC',

      }
              };

                  // pdfMake.createPdf(dd).download('surveypermissionform.pdf');
                  pdfMake.createPdf(dd).download('Survey Permission Form.pdf');


      } else { selectedOwner = $firebaseObject(Ref.child('landowners').child(selectedTract.ownercontacted));

      selectedOwner.$loaded().catch(alert)
      .then(function() {
        if (typeof(selectedOwner.name) === 'undefined'){var ownercontacted = ''}
          else {ownercontacted = selectedOwner.name};

                if (typeof(selectedOwner.address) === 'undefined'){var street = ''}
              else {street = selectedOwner.address};

        if (typeof(selectedOwner.city) === 'undefined'){var city = ''}
            else {city = selectedOwner.city};
        if (typeof(selectedOwner.state) === 'undefined'){var state = ''}
            else {state = selectedOwner.state};

        if (typeof(selectedOwner.zip) === 'undefined'){var zip = ''}
              else {zip = selectedOwner.zip};
        var fulladdress;
        if (street!=='' && city!=='' && state!=='' && zip!==''){fulladdress = street + ', ' + city + ', ' + state +  ' ' + zip }
        else{fulladdress = ''};

        if (typeof(selectedOwner.phone1) === 'undefined'){var phone1 = ''}
              else {phone1 = selectedOwner.phone1};
        if (typeof(selectedOwner.phone2) === 'undefined'){var phone2 = ''}
          else {phone2 = selectedOwner.phone2};
        if (typeof(selectedOwner.email) === 'undefined'){var email = ''}
          else {email = selectedOwner.email};
          if (typeof(selectedTract.surveyagent) === 'undefined'){var surveyagent = ''}
            else {surveyagent = selectedTract.surveyagent};

          dd = {
            content:[
                [	{table: {
              widths:['50%','50%'],
              body:[
              [{text:' ',border:[false,false,false,false],},{text: [{text:'Tract No. '},{text: tract, decoration: 'underline'}],alignment:'right',margin:[0,5,5,0],border:[false,false,false,false]}
        ]]}}],
              {text:'\n\nMTS\n LANDOWNER NOTIFICATION AND SURVEY PERMIT\n\n', alignment:'center',bold: true,
                      },
              { text: [
                        {text:'\n\nOn '},{text: granted, decoration:'underline', bold:true},{text: ', the owner of the herein described property grants unto MTS, their agents, assigns and employees, permission and license to enter said property for the purpose of conducting surveys, including the placement of stakes, line of sight clearing, geotechnical soil borings, environmental, archaeological and appraisal studies for the routing of pipeline right-of-way.\n\n', alignment:'left'}]
                        , margin:[4,0,0,0]
              },
          '\n',

              {   table: {
                widths:['18%','75%'],
                body: [
                  [{text:'PROPERTY:',border:[false],alignment:'left',bold:true},
                  {text: [
                  {text: legaldescription + ' in Section '},
                  {text: section, decoration:'underline'},
                  {text: ' , Township '},
                  {text: township, decoration:'underline'},
                  {text: ' , Range '},
                  {text: range, decoration:'underline'},
                  {text: ' , '},
                  {text: county, decoration:'underline'},
                  {text: '.'},

                ],


                  border:[false],alignment:'left'}],

                ]
                  },

                alignment: 'center',

              },
              '\n',
              {   table: {
                widths:['18%','15%','60%'],
                body: [
                  [{text:'LAND OWNER:',border:[false],alignment:'left',bold:true},{text:'',border:[false]},{text:'',border:[false]},],
                  [{text:'',border:[false]},{text: 'Name:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: ownercontacted, style: 'tableHeader', alignment: 'left', border:[false]}],
                  [{text:'',border:[false]},{text: 'Address:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: fulladdress, style: 'tableHeader', alignment: 'left', border:[false]}],
                  [{text:'',border:[false]},{text: 'Phone 1:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: phone1, style: 'tableHeader', alignment: 'left', border:[false]}],
                  [{text:'',border:[false]},{text: 'Phone 2:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: phone2, style: 'tableHeader', alignment: 'left', border:[false]}],
                  [{text:'',border:[false]},{text: 'E-Mail:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: email, style: 'tableHeader', alignment: 'left', border:[false]}],
                  [{text:'',border:[false]},{text: 'Signature:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: '', style: 'tableHeader', alignment: 'left', border:[false,false,false,true]}],
                ]
                  },

                alignment: 'center',

              },
        '\n',
        '\n',
        {   table: {
          widths:['30%','65%'],
          body: [
            [{text:'PERMISSION:',bold: true, alignment: 'left',border:[false]},{text: '', alignment:'left', bold: true, border:[false]}]
          ]
        },
          alignment: 'center',
        },

        {   table: {
          widths:['18%','9%','15%', '9%','49%'],
          body: [
            [{text:'',border:[false]},{text: 'Verbal:', alignment:'right', bold: true, border:[false]}, {image: verbalcheckbox, width: 20, border:[false], alignment:'left'},
            {text: 'Written:', alignment:'left', bold: true, border:[false]}, {image: writtencheckbox, width: 20, border:[false], alignment: 'left'}],
          ]
            },
          alignment: 'center',
        },
        '\n',
        {   table: {
          widths:['18%','15%','60%'],
          body: [
            [{text:'OBTAINED BY:',border:[false],alignment:'left',bold:true},{text:'',border:[false]},{text:'',border:[false]},],
            [{text:'',border:[false]},{text: 'ROW Agent:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: surveyagent, style: 'tableHeader', alignment: 'left', border:[false]}],
            [{text:'',border:[false]},{text: 'Signature:', style: 'tableHeader', alignment:'left', bold: true, border:[false]}, {text: '', style: 'tableHeader', alignment: 'left', border:[false,false,false,true]}],
          ]
            },

          alignment: 'center',

        },
        '\n','\n',
        {   table: {
          widths:['30%','65%'],
          body: [
            [{text:'ACCESS NOTES:',bold: true, alignment: 'left',border:[false]},{text: '', alignment:'left', bold: true, border:[false]}]
          ]
        },
          alignment: 'center',
        },

        {

              table: {
                widths:[-5,'100%'],
                body: [

                  [
                    {text:'1', color:'white',border:[false]},
                    {
                    rowSpan: 3,
                    border: [true,true,true,true],
                    text: accessnotes.replace(new RegExp('\r?\n','g'), '')
                    }
                  ],

                  [{text:'2',color:'white', border:[false]}],
                  [{text:'3', color:'white', border: [false]}],

                ]
              }
        },
        '\n',
        {   table: {
          widths:['30%','65%'],
          body: [
            [{text:'COMMENTS:',bold: true, alignment: 'left',border:[false]},{text: '', alignment:'left', bold: true, border:[false]}]
          ]
        },
          alignment: 'center',
        },

        {

              table: {
                widths:[-5,'100%'],
                body: [

                  [
                    {text:'1', color:'white',border:[false]},
                    {
                    rowSpan: 4,
                    border: [true,true,true,true],
                    text: surveycomments.replace(new RegExp('\r?\n','g'), '')
                    }
                  ],

                  [{text:'2',color:'white', border:[false]}],
                  [{text:'3', color:'white', border: [false]}],
                  [{text:'4', color:'white', border: [false]}],

                ]
              }
        }


            ],
        pageMargins: [40,15,40,25],

        images:{
          Unchecked:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABVUlEQVR4Xu2UQQ6DQAwD4f+Pbg9w4pQZC2nRumevcSZOz2Pz37n5/EcBtAGbE+gJbF6A/gn2BHoCcwK/uXQJ5ajdI9E9TgEssdd5iNFyR6I24CLwPAECb743r1T5yBDqA34e/FLlKwDAWREG/qlU5WsDAHZFGPinUpWvDQDYFWHgn0pVvjYAYFeEgX8qVfnaAIBdEQb+qVTlawMAdkUY+KdSla8NANgVYeCfSlW+NgBgV4SBfypV+doAgF0RBv6pVOVrAwB2RRj4p1KVrw0A2BVh4J9KVb42AGBXhIF/KlX52gCAXREG/qlU5WsDAHZFGPinUpWvDQDYFWHgn0pVvjYAYFeEgX8qVfnaAIBdEQb+qVTlSxqQBn77/Wi2kehO+iT89gCp/2i2kagALgLbNyCt5JLvyQksOUAaqgBSgl9/3wZ8fYNp/jYgJfj1923A1zeY5v8D3apQQVw1ztMAAAAASUVORK5CYII=',

          Checked:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABzklEQVR4Xu2a0W0DIRBE152klKSTpLKklHSSdJII2UgWgvPMLJYWbu/HHx7wztsB7k6+2Mmvy8n9WwLIBJycQC6BkwcgN8FcArkEcAJ/uDSEEko3JLrZSQAh+ooXATUXEmUCrgTaJcDAw/umK6X6GBPSD+h+6JFSfQmA4CwRJub3SqX6MgEEdokwMb9XKtWXCSCwS4SJ+b1Sqb6VEvBqZt8HlLYG8G5mn2b2ZWYfAwjbAqjmq+8RhC0BtOYrhLfOctgOwMh8WQIlBe21FQDWvPywFvEUUMxvA0A1Hw7Ai5n9knc2HvOhAFQjo82qx8VrPgyA1ggCYYb5EABK7H867T2CMMt8CAClCMYQo0W2kzD3AYgxRIOYvteEAfAoCeX78mDTXsh+cQQlFIAjCD0TXvNh9oDW3Cjq97oZ5sMCeJSEWeZDAxhBmGk+PIAWwmzzSwCoEMpn73mePfZafbhTwGuIHZ8AGmLQuw5IdJtYIsy20aGX6ksABHGJMDG/VyrVlwkgsEuEifm9Uqk+TwK8BT97POQNEg1OgWcb8M4PeYNECeBK4PT/FPVGMuR4ZgmENOAtKgF4Ca4+PhOwege99WcCvARXH58JWL2D3vr/AaNqhEEBNqzLAAAAAElFTkSuQmCC',

        }
                };



        //End Survey Permisison Form
        pdfMake.createPdf(dd).download('Survey Permission Form.pdf');

  });

}//end ifelse statement
  })
};//end printPDF

  //ownerArray totalOwners
    $scope.ownershipReport = function(){
  var tractsRefFiltered =  Ref.child('tracts').child($routeParams.tractid);
  var selectedTract = $firebaseObject(tractsRefFiltered);

  selectedTract.$loaded().catch(alert)
  .then(function() {

    if (typeof(selectedTract.sequence) === 'undefined' || selectedTract.sequence === ''){var sequence = ''}
      else {sequence = selectedTract.sequence};
    if (typeof(selectedTract.tract) === 'undefined' || selectedTract.tract === ''){var tract = ''}
        else {tract = selectedTract.tract};
        var owner = selectedTract.owner;
    if (typeof(selectedTract.section) === 'undefined' || selectedTract.section === ''){var section = ''}
        else {section = selectedTract.section};
    if (typeof(selectedTract.township) === 'undefined' || selectedTract.township === ''){var township = ''}
        else {township = selectedTract.township};
    if (typeof(selectedTract.range) === 'undefined' || selectedTract.range === ''){var range = ''}
          else {range = selectedTract.range};
    if (typeof(selectedTract.legal) === 'undefined' || selectedTract.legal === ''){var legaldescription = 'A tract of land'}
        else {legaldescription = selectedTract.legal};
    if (typeof(selectedTract.taxyear) !== 'undefined' && selectedTract.taxyear !== ''){var taxyear = selectedTract.taxyear}
        else {taxyear = ''};
    if (typeof(selectedTract.delinquentamount) !== 'undefined' && selectedTract.delinquentamount !== ''){var delinquentamount = '$ ' + selectedTract.delinquentamount.toFixed(2)}
        else {delinquentamount = ''};
    if (typeof(selectedTract.originaleasementbook) !== 'undefined' && selectedTract.originaleasementbook !== ''){var originaleasementbook = selectedTract.originaleasementbook}
        else {originaleasementbook = ''};
    if (typeof(selectedTract.originaleasementdate) !== 'undefined' && selectedTract.originaleasementdate !== ''){var originaleasementdate = selectedTract.originaleasementdate}
      else {originaleasementdate = ''};
    if (typeof(selectedTract.originaleasementpage) !== 'undefined' && selectedTract.originaleasementpage !== ''){var originaleasementpage = selectedTract.originaleasementpage}
      else {originaleasementpage = ''};
    if (typeof(selectedTract.originaleasementfiled) !== 'undefined' && selectedTract.originaleasementfiled !== ''){var originaleasementfiled = selectedTract.originaleasementfiled}
      else {originaleasementfiled = ''};
      if (typeof(selectedTract.originaleasementdocument) !== 'undefined' && selectedTract.originaleasementdocument !== ''){var originaleasementdocument = selectedTract.originaleasementdocument}
        else {originaleasementdocument = ''};
    if (typeof(selectedTract.address) !== 'undefined' && selectedTract.address !== ''){var owneraddress = selectedTract.address}
        else {owneraddress = ''};
    if (typeof(selectedTract.city) !== 'undefined' && selectedTract.city !== ''){var city = selectedTract.city}
        else {city = ''};
    if (typeof(selectedTract.state) !== 'undefined' && selectedTract.state !== ''){var state = selectedTract.state}
        else {state = ''};
    if (typeof(selectedTract.zip) !== 'undefined' && selectedTract.zip !== ''){var zip = selectedTract.zip}
        else {zip = ''};
    if(city !=='' && state !== '' && zip !== ''){var citystatezip = city+', '+state+' '+zip}
        else {citystatezip = ''};
    if (typeof(selectedTract.taxstatus) === 'undefined' || selectedTract.taxstatus === ''){var taxstatus = '2099'}
        else {taxstatus = selectedTract.taxstatus};
    if (typeof(selectedTract.county) === 'undefined' || selectedTract.county === ''){var county = ''}
        else {county = selectedTract.county};
    if (typeof(selectedTract.acres) === 'undefined' || selectedTract.acres === ''){var acres = ''}
      else {acres = selectedTract.acres};
    if (typeof(selectedTract.parcelid) === 'undefined' || selectedTract.parcelid === ''){var parcelid = ''}
      else {parcelid = selectedTract.parcelid};
    if (typeof(selectedTract.surveypermission) === 'undefined' || selectedTract.surveypermission === ''){var granted = ''}
      else {granted = selectedTract.surveypermission};
    if (selectedTract.surveypermissiontype === 'VERBAL'){var verbalcheckbox = 'Checked'}
      else {verbalcheckbox = 'Unchecked'};
    if (selectedTract.surveypermissiontype === 'WRITTEN'){var writtencheckbox = 'Checked'}
      else {writtencheckbox = 'Unchecked'};
    if (typeof(selectedTract.rowagent) === 'undefined' || selectedTract.rowagent === ''){var rowagent = ''}
      else {rowagent = selectedTract.rowagent};
  var activeOwnersArr = [];
  var activeOwners = $firebaseArray(Ref.child('tracts').child($routeParams.tractid).child('landowners').orderByChild('inactive').startAt(null).endAt(false));
activeOwners.$loaded().catch(alert).then(function(){
activeOwners.forEach(function(z){
if(z.inactive!==true){
  Ref.child('tracts').child($routeParams.tractid).child('landowners').child(z.ownername).once('value', function(tractSnap){
    var tractRecords = extend({}, tractSnap.val());
    Ref.child('landowners').child(tractSnap.key).once('value',function(ownerSnap){

        activeOwnersArr.push(extend({}, z, ownerSnap.val()) );

    });
});
};
});
      var ownershipReportArray = [[{text:'',border:[false,false,false,false]},{text:'LAND OWNER(S):',bold:true,alignment:'left',border:[false,false,false,false]},{text:'INTEREST:\n\n\n',bold:true,alignment:'left',border:[false,false,false,false]}]];

setTimeout(function(){
            var ownerInterests = [0];
            activeOwnersArr.forEach(function(x){
            if (typeof(x.zip) === 'undefined' || x.zip === null && x.inactive !== true){var ownerzip =''} else {ownerzip = x.zip};
            if (typeof(x.address) === 'undefined' || x.address === null && x.inactive !== true){var ownerstreet =''} else {ownerstreet = x.address};
            if (typeof(x.city) === 'undefined' || x.city === null && x.inactive !== true){var ownercity =''} else {ownercity = x.city};
            if (typeof(x.state) === 'undefined' || x.state === null && x.inactive !== true){var ownerstate =''} else {ownerstate = x.state};
            if (typeof(x.name) === 'undefined' || x.name === null && x.inactive !== true){var ownername =''} else {ownername = x.name};

            if (typeof(x.ownerinterest) === 'undefined' || x.ownerinterest === null && x.inactive !== true){var ownerinterest = 0} else {ownerinterest = Number(x.ownerinterest)};
            if (typeof(x.zip) === 'undefined' || typeof(x.city) === 'undefined' || typeof(x.state) === 'undefined' && x.inactive !== true){var citystatezip = ''}else{
                citystatezip = x.city+', '+x.state+' '+x.zip};

            if(x.inactive!==true){ownerInterests.push(ownerinterest)};
            if (typeof(activeOwnersArr) === 'undefined' || activeOwnersArr === null) {

            ownershipReportArray.push([{text:'',border:[false,false,false,false]},{text:'' + '\n' + '' + '\n' + '' + '\n\n\n',
            border:[false],bold:false},
            {
            table: {
            widths:['20%'],
            body: [[{text:''+' %',border:[false,false,false,true]}]],
            alignment:'center',
            border:[false]
            },
            border:[false]
            }],
        [{text:'',border:[false]},{text:'',border:[false]},{text:'',border:[false]}])

                          }
             else {

              if(x.inactive!==true){ownershipReportArray.push([{text:'',border:[false,false,false,false]},{text:ownername + '\n' + ownerstreet + '\n' + citystatezip + '\n\n\n',
              border:[false],bold:false},
              {
                table: {
                  widths:['20%'],
                  body: [[{text:Number(ownerinterest).toFixed(2)+' %',border:[false,false,false,true]}]],
                  alignment:'center',
                  border:[false]
                },
                border:[false]
              }
            ],
              [{text:'',border:[false]},{text:'',border:[false]},{text:'',border:[false]}])

            };
};

});

      //get sum of values in ownerInterests array
            function getSum(total, num) {
                return total + num;
            };
            var interestPercent;
            if(typeof(ownerInterests)==='undefined' || ownerInterests === null) {interestPercent = ''} else {
              interestPercent = ownerInterests.reduce(getSum).toFixed(2)
            };


            ownershipReportArray.push([{text:'',border:[false]},{text:'\nTOTAL: ',border:[false,false,false,false],bold:true,alignment:'right'},{text:'\n'+ interestPercent+' %',border:[false],bold:true, alignment:'left',margin:[5,0,0,0]}])
            ;


            var d = new Date();
            var date = (d.getMonth()+1) + ('/')+ (d.getDate()) + ('/') + (d.getFullYear());
            var ff = {
                    content: [
                      [	{table: {
                    widths:['6%','15%','54%','10%','15%'],
                    body:[
                    [{text:'Date: ',border:[false,false,false,false],},{text:date,border:[false,false,false,true],alignment:'center'},{text:' ',border:[false,false,false,false],},{text: 'Tract No. ',border:[false]},{text: tract,alignment:'center',border:[false,false,false,true]}
              ]],

          }}],
                    {text:'\n\nBoardwalk P2K Project\nMTS OWNERSHIP REPORT\n\n\n\n', alignment:'center',bold: true,
                            },

                            {   table: {
                              widths:['18%','75%'],
                              body: [
                                [{text:'PROPERTY:',border:[false],alignment:'left',bold:true},
                                {text: [
                                {text: legaldescription + ' in Section '},
                                {text: '  '+section+'  ', decoration:'underline'},
                                {text: ' , Township '},
                                {text: '  '+township+'  ', decoration:'underline'},
                                {text: ' , Range '},
                                {text: '  '+range+'  ', decoration:'underline'},
                                {text: ' , in the county of '},
                                {text: '  '+county+' ', decoration:'underline'},
                                {text: '.'}


                              ],
                                border:[false],alignment:'left'}],

                              ]
                                },
                              },
                  '\n\n\n',
                  {

                    table: {
                      widths:[-4,'50%','50%'],
                      body: ownershipReportArray,
                      alignment:'center'
                    }
                  },


                    ],

                    pageOrientation:'portrait',
                    pageSize: 'legal',
                    pageMargins: [20,30,20,30],
                    styles: {
                      header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10]
                      },
                      subheader: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 10, 0, 5]
                      },
                      tableExample: {
                        margin: [0, 5, 0, 15]
                      },
                      tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black'
                      }
                    },
                    defaultStyle: {

                    }

                  };

            pdfMake.createPdf(ff).download('Ownership Report.pdf')

        },1000);
});
})
  };

  $scope.printTitleCertificate = function(){
    var tractsRefFiltered =  Ref.child('tracts').child($routeParams.tractid);
    var selectedTract = $firebaseObject(tractsRefFiltered);
    selectedTract.$loaded().catch(alert)
    .then(function() {

      if (typeof(selectedTract.sequence) === 'undefined' || selectedTract.sequence === ''){var sequence = ''}
        else {sequence = selectedTract.sequence};
      if (typeof(selectedTract.tract) === 'undefined' || selectedTract.tract === ''){var tract = ''}
          else {tract = selectedTract.tract};
          var owner = selectedTract.owner;
      if (typeof(selectedTract.section) === 'undefined' || selectedTract.section === ''){var section = ''}
          else {section = selectedTract.section};
      if (typeof(selectedTract.township) === 'undefined' || selectedTract.township === ''){var township = ''}
          else {township = selectedTract.township};
      if (typeof(selectedTract.range) === 'undefined' || selectedTract.range === ''){var range = ''}
            else {range = selectedTract.range};
      if (typeof(selectedTract.legal) === 'undefined' || selectedTract.legal === ''){var legaldescription = 'A tract of land'}
          else {legaldescription = selectedTract.legal};
      if (typeof(selectedTract.taxyear) !== 'undefined' && selectedTract.taxyear !== ''){var taxyear = selectedTract.taxyear}
          else {taxyear = ''};
      if (typeof(selectedTract.delinquentamount) !== 'undefined' && selectedTract.delinquentamount !== ''){var delinquentamount = '$ ' + selectedTract.delinquentamount.toFixed(2)}
          else {delinquentamount = ''};
      if (typeof(selectedTract.originaleasementbook) !== 'undefined' && selectedTract.originaleasementbook !== ''){var originaleasementbook = selectedTract.originaleasementbook}
          else {originaleasementbook = ''};
      if (typeof(selectedTract.originaleasementdate) !== 'undefined' && selectedTract.originaleasementdate !== ''){var originaleasementdate = selectedTract.originaleasementdate}
        else {originaleasementdate = ''};
      if (typeof(selectedTract.originaleasementpage) !== 'undefined' && selectedTract.originaleasementpage !== ''){var originaleasementpage = selectedTract.originaleasementpage}
        else {originaleasementpage = ''};
      if (typeof(selectedTract.originaleasementfiled) !== 'undefined' && selectedTract.originaleasementfiled !== ''){var originaleasementfiled = selectedTract.originaleasementfiled}
        else {originaleasementfiled = ''};
        if (typeof(selectedTract.originaleasementdocument) !== 'undefined' && selectedTract.originaleasementdocument !== ''){var originaleasementdocument = selectedTract.originaleasementdocument}
          else {originaleasementdocument = ''};
      if (typeof(selectedTract.address) !== 'undefined' && selectedTract.address !== ''){var owneraddress = selectedTract.address}
          else {owneraddress = ' '};
      if (typeof(selectedTract.city) !== 'undefined' && selectedTract.city !== ''){var city = selectedTract.city}
          else {city = ' '};
      if (typeof(selectedTract.state) !== 'undefined' && selectedTract.state !== ''){var state = selectedTract.state}
          else {state = ''};
      if (typeof(selectedTract.zip) !== 'undefined' && selectedTract.zip !== ''){var zip = selectedTract.zip}
          else {zip = ''};
      if(city !=='' && state !== '' && zip !== ''){var citystatezip = city+', '+state+' '+zip}
          else {citystatezip = ' '};
      if (typeof(selectedTract.taxstatus) === 'undefined' || selectedTract.taxstatus === ''){var taxstatus = ''}
          else {taxstatus = selectedTract.taxstatus};
      if (typeof(selectedTract.county) === 'undefined' || selectedTract.county === ''){var county = ''}
          else {county = selectedTract.county};
      if (typeof(selectedTract.acres) === 'undefined' || selectedTract.acres === ''){var acres = ''}
        else {acres = selectedTract.acres};
      if (typeof(selectedTract.parcelid) === 'undefined' || selectedTract.parcelid === ''){var parcelid = ''}
        else {parcelid = selectedTract.parcelid};
      if (typeof(selectedTract.surveypermission) === 'undefined' || selectedTract.surveypermission === ''){var granted = ''}
        else {granted = selectedTract.surveypermission};
      if (selectedTract.surveypermissiontype === 'VERBAL'){var verbalcheckbox = 'Checked'}
        else {verbalcheckbox = 'Unchecked'};
      if (selectedTract.surveypermissiontype === 'WRITTEN'){var writtencheckbox = 'Checked'}
        else {writtencheckbox = 'Unchecked'};
      if (typeof(selectedTract.rowagent) === 'undefined' || selectedTract.rowagent === ''){var rowagent = ''}
        else {rowagent = selectedTract.rowagent};
      if (typeof(selectedTract.surveycomments) === 'undefined' || selectedTract.surveycomments === ''){var surveycomments = ''}
        else {surveycomments = selectedTract.surveycomments};
      if (typeof(selectedTract.accessnotes) === 'undefined' || selectedTract.accessnotes === ''){var accessnotes = ''}
        else {accessnotes = selectedTract.accessnotes};
    //begin Chain of Title blocks for LTS
    var chainOfTitleObject = function(){
      return  {
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 2 : 1;
          },
          vLineWidth: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 2 : 1;
          },
          hLineColor: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
          },
          vLineColor: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
          },
          // paddingLeft: function(i, node) { return 4; },
          // paddingRight: function(i, node) { return 4; },
          // paddingTop: function(i, node) { return 2; },
          // paddingBottom: function(i, node) { return 2; },
          // fillColor: function (i, node) { return null; }
        },
      margin:[5,0,0,5],
      table: {
        widths:['7%','12%','5%','5%','7%','35%','28%'],
        body: [
          [{text:'Inst. #:',fontSize:9,border:[true,true,false,false]},{text:'',border:[false,true,true,false]},{text:'Date:',fontSize:9,border:[true,true,false,false]},{text:'',border:[false,true,true,false]},{rowSpan:2,text:'Grantor:',decoration:'underline',fontSize:9,border:[true,true,false,false]},{rowSpan:2,text:'',border:[false,true,true,false]},{rowSpan:2,text:'Land Description:',border:[true,true,true,false],fontSize:9}],
          [{text:'Doc. #:',fontSize:9,border:[true,false,false,false]},{text:'',border:[false,false,true,false]},{text:'',border:[true,false,false,false]},{text:'',border:[false,false,true,false]},{},{},{}],
          [{text: 'Book #:',fontSize:9,border:[true,false,false,false]},{text:'',border:[false,false,true,false]},{text:'Filed:',fontSize:9,border:[true,false,false,false]},{text:'',border:[false,false,true,false]},{rowSpan:2,text:'Grantee:',decoration:'underline',fontSize:9,border:[true,false,false,true]},{rowSpan:2,text:'',border:[false,false,true,true]},{rowSpan:2,text:'',border:[true,false,true,true],fontSize:9}],
          [{text: 'Page #:',fontSize:9,border:[true,false,false,true]},{text:'',border:[false,false,true,true]},{text:'',border:[true,false,false,true]},{text:'',border:[false,false,true,true]},{},{},{}],

        ]
      },

    } };

    var easementChainObject = function(){
      return  {
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 2 : 1;
          },
          vLineWidth: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 2 : 1;
          },
          hLineColor: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
          },
          vLineColor: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
          },
          // paddingLeft: function(i, node) { return 4; },
          // paddingRight: function(i, node) { return 4; },
          // paddingTop: function(i, node) { return 2; },
          // paddingBottom: function(i, node) { return 2; },
          // fillColor: function (i, node) { return null; }
        },
      margin:[5,0,0,5],
      table: {
        widths:['7%','12%','5%','5%','7%','35%','28%'],
        body: [
          [{text:'Inst. #:',fontSize:9,border:[true,true,false,false]},{text:'',border:[false,true,true,false]},{text:'Date:',fontSize:9,border:[true,true,false,false]},{text:'',border:[false,true,true,false]},{rowSpan:2,text:'Grantor:',decoration:'underline',fontSize:9,border:[true,true,false,false]},{rowSpan:2,text:'',border:[false,true,true,false]},{rowSpan:2,text:'Easement/Mortgage:',border:[true,true,true,false],fontSize:9}],
          [{text:'Doc. #:',fontSize:9,border:[true,false,false,false]},{text:'',border:[false,false,true,false]},{text:'',border:[true,false,false,false]},{text:'',border:[false,false,true,false]},{},{},{}],
          [{text: 'Book #:',fontSize:9,border:[true,false,false,false]},{text:'',border:[false,false,true,false]},{text:'Filed:',fontSize:9,border:[true,false,false,false]},{text:'',border:[false,false,true,false]},{rowSpan:2,text:'Grantee:',decoration:'underline',fontSize:9,border:[true,false,false,true]},{rowSpan:2,text:'',border:[false,false,true,true]},{rowSpan:2,text:'',border:[true,false,true,true],fontSize:9}],
          [{text: 'Page #:',fontSize:9,border:[true,false,false,true]},{text:'',border:[false,false,true,true]},{text:'',border:[true,false,false,true]},{text:'',border:[false,false,true,true]},{},{},{}],

        ]
      },

    } };

    var ee = {
      content: [
        {text: 'MTS', alignment: 'center', bold:true},
        {text: 'LIMITED TITLE SEARCH\n\n\n', alignment: 'center', bold:true},
        {
          table: {
              widths:['8%','36%','6%','14.5%','9%','12%','13.5%'] ,
            body: [
              [{text:'TRACT:',bold:true,border:[false,false,false,false],fontSize:'10'},
               {text:tract,border:[false,false,false,true]},
               {text:'',border:[false],fontSize:'10'},
               {text:'TAX YEAR:', alignment:'left',bold:true,fontSize:'10',border:[false,false,false,false]},
               {text:taxyear, alignment:'center',border:[false,false,false,true]},
               {fontSize:'10',text:'TAX STATUS:',border:[false,false,false,false],bold:true},
               {text:taxstatus,alignment:'center',border:[false,false,false,true]}],
            [{text:'OWNER:',bold:true,border:[false],fontSize:'10'},
                {text:owner,border:[false,false,false,true]}, //owner name
                {text:'', border:[false],fontSize:'10'},
                {text:'ASSESSED TO:',alignment:'left',bold:true,fontSize:'10',border:[false,false,false,false]},
                {text: owner,border:[false,false,false,true],colSpan:3}, //assessed owner name
                {text:'',border:[false,false,false,true]},
                {text:'',border:[false,false,false,true]}],
            [{text:'',bold:true,border:[false],fontSize:'10'},
                {text:owneraddress,border:[false,false,false,true]}, //owner address
                {text:'',border:[false],fontSize:'10'},
                {text:'',bold:true,fontSize:'10',alignment:'left',border:[false,false,false,false],color:'white'},
                {text:owneraddress,border:[false,false,false,true],colSpan:3}, //assessed owner address
                {text:'',border:[false,false,false,true]},
                {text:'',border:[false,false,false,true]}],
            [{text:'',bold:true,border:[false],fontSize:'10'},
                {text:citystatezip,border:[false,false,false,true]}, //city state zip
                {text:'',border:[false],fontSize:'10'},
                {text:'',bold:true,fontSize:'10',alignment:'left',color:'white',border:[false,false,false,false]},
                {text:citystatezip,border:[false,false,false,true],colSpan: 3}, //assessed city state zip
                {text:'',border:[false,false,false,true]},
                {text:'',border:[false,false,false,true]}],
            [{text:'PHONE:',fontSize:'10',bold:true,border:[false]},
                {text:'',border:[false,false,false,true]},
                {text:'',border:[false,false,false,false]},
                {colSpan:2,text:'DELINQUENT AMOUNT DUE:',border:[false,false,false,false],fontSize:10,bold:true},
                {text:'',border:[false,false,false,true]},
                {text:delinquentamount,border:[false,false,false,true],alignment:'left',colSpan:2},
                {text:'',border:[false,false,false,true]}]
            ]
          }
        },
        '\n',
        {
          table: {
            widths:['55%','10%','15%','19%'],
            body: [[
            {text: '\nSEE COPY OF DEED FOR COMPLETE PROPERTY DESCRIPTION', fontSize:10,border:[false]},
            {text: '',border:[false]},
            {text: '\nNO. OF ACRES: ',border:[false],fontSize:10,alignment:'right'},
            {text: '\n'+acres,border:[false,false,false,true],fontSize:10,alignment:'center'},
                  ]]
          }
    },

    {
          margin:[0,5,0,0],
          table: {
            widths:[-4,'100%'],
            body: [

              [
                {text:'1', color:'white',border:[false]},
                {
                rowSpan: 4,
                border: [true,true,true,true],
                text: [{text:'Brief Tax Legal:    ' ,bold:true},{text: legaldescription + '.',bold:false}   ]


                }
              ],

              [{text:'2',color:'white', border:[false]}],
              [{text:'3', color:'white', border: [false]}],
              [{text:'4', color:'white', border: [false]}],

            ]
          }
    },

    {
      table: {
        widths:['8%','9%','10%','9%','8%','10%','8%','15%','8%','14%'],
        body: [[
        {text: 'Section:', fontSize:10,border:[false],alignment:'left'},
        {text: section,fontSize:10,border:[false,false,false,true],alignment:'center'},
        {text: 'Township:', fontSize:10,border:[false],alignment:'left'},
        {text: township,fontSize:10,border:[false,false,false,true],alignment:'center'},
        {text: 'Range:', fontSize:10,border:[false],alignment:'left'},
        {text: range,fontSize:10,border:[false,false,false,true],alignment:'center'},
        {text: 'County:', fontSize:10,border:[false],alignment:'left'},
        {text: county,fontSize:10,border:[false,false,false,true],alignment:'center'},
        {text: 'State:', fontSize:10,border:[false],alignment:'left'},
        {text: 'Texas',fontSize:10,border:[false,false,false,true],alignment:'center'},
              ]]
      }
    },
    '\n',
    {
      table: {
        widths:['5.5%','28%','1%','38%','11%','6%','8%'],
        body: [[
        {text: 'PIN #:', fontSize:10,border:[false],alignment:'left',bold:true},
        {text: parcelid,fontSize:10,border:[false,false,false,true],alignment:'center'},
        {text: '', fontSize:10,border:[false]},
        {text: 'If ALR, list original Easement:  R/W Volume:',fontSize:10,border:[false,false,false,false],alignment:'left'},
        {text: originaleasementbook, fontSize:10,border:[false,false,false,true],alignment:'center'},
        {text: 'Page:',fontSize:10,border:[false,false,false,false],alignment:'left'},
        {text: originaleasementpage, fontSize:10,border:[false,false,false,true],alignment:'center'},
                ]]
      }
    },
    {
      table: {
        widths:['38%','7.5%','18%','6%','11%','6%','11%'],
        body: [[
        {text: '', fontSize:10,border:[false]},
        {text: 'Doc. #:',fontSize:10,border:[false,false,false,false],alignment:'left'},
        {text: originaleasementdocument, fontSize:10,border:[false,false,false,true],alignment:'center'},
        {text: 'Date:',fontSize:10,border:[false,false,false,false],alignment:'left'},
        {text: originaleasementdate, fontSize:10,border:[false,false,false,true],alignment:'center'},
        {text: 'Filed:',fontSize:10,border:[false,false,false,false],alignment:'left'},
        {text: originaleasementfiled, fontSize:10,border:[false,false,false,true],alignment:'center'},
      ]],

      }
    },
    '\n\n',
    {text:'CHAIN OF TITLE',bold:true,alignment:'center',fontSize:9,margin:[0,0,0,5]},

    chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),

    {text:'\n',pageBreak:'before'},
    chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),
    chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),chainOfTitleObject(),

    {text:'\nEncumbrances, Outstanding Mortgages, Deeds of Trust, Mechanics Liens, Taxes and Other Liens',bold:true,alignment:'center',pageBreak:'before',margin:[0,0,0,5]},

    easementChainObject(),'\n',easementChainObject(),easementChainObject(),easementChainObject(),easementChainObject(),easementChainObject(),easementChainObject(),easementChainObject(),
    easementChainObject(),easementChainObject(),easementChainObject(),easementChainObject(),

      ],

      pageOrientation:'portrait',
      pageSize: 'legal',
      pageMargins: [20,30,20,30],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {

      }

    };
              // pdfMake.createPdf(dd).download('surveypermissionform.pdf');
              pdfMake.createPdf(ee).download('Limited Title Search Form.pdf');
            });
          };


  //End Title Certificate


  //get Cost Details totals

$scope.datepickerOptions = {
        format: 'mm/dd/yyyy',
        autoclose: true,
        weekStart: 0,
        enableOnReadonly: false,
        todayBtn: 'linked',
        todayHighlight: true,
        keyboardNavigation: true
      };
      $scope.yearpickerOptions = {
        format: 'yyyy',
        autoclose: true,
        enableOnReadonly: false,
        keyboardNavigation: true,
        minMode: "year",
        startingDay: 1
      };
      $scope.oneAtATime = true;
      $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
      };


            $scope.insertCurrentDate = function(field){
              $scope.tract[field] = moment().format('MM/DD/YYYY');
            };
            $scope.insertCurrentTime = function(field){
              $scope.tract[field] = moment().format('LT');
            };




    });

  }
  ])
  .factory('Owner', ['$firebaseObject', 'Ref', 'ROW',
    function($firebaseObject, Ref, ROW) {
      return function(landownerid) {

        var o = landownerid;
        // if (landownerid === "new") {
        //   o = Ref.child('tracts').push().key;
        //
        // }
        var ownerRef = Ref.child('tracts').child(o);
        var ownerObj = $firebaseObject(ownerRef);


        return ownerObj;

      };


    }

  ])

  .controller('LandOwnerCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
      '$routeParams', 'Tract', 'Owner', 'OwnerPayment', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'ROW', 'WeldImages',
    function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
        $routeParams, Tract, Owner, OwnerPayment, $window, $location, user, LOCATIONS, openPost, ROW, WeldImages) {


      new Owner($routeParams.landownerid).$bindTo($scope, 'owner');
      new Tract($routeParams.tractid).$bindTo($scope, 'tract');

      //JOIN function
          function extend(base) {
                          var parts = Array.prototype.slice.call(arguments, 1);
                          parts.forEach(function (p) {
                              if (p && typeof (p) === 'object') {
                                  for (var k in p) {
                                      if (p.hasOwnProperty(k)) {
                                          base[k] = p[k];
                                      }
                                  }
                              }
                          });
                          return base;
                      };
      //end JOIN function

      //JOIN function using extend
      var ownerInfoArray = [];

      //JOIN function using extend
      Ref.child('tracts').child($routeParams.tractid).child('landowners').child($routeParams.landownerid).once('value', function(tractSnap){
        Ref.child('landowners').child(tractSnap.key).once('value',function(ownerSnap){

            ownerInfoArray.push(extend({}, tractSnap.val(), ownerSnap.val()) );
        });
      });

      var ownerName = $firebaseObject(Ref.child('tracts').child($routeParams.tractid).child('landowners').child($routeParams.landownerid));

      Ref.child('landowners').once('value',function(snapshot) {
        var obj = $firebaseArray(Ref.child('landowners').orderByChild('name'));
        obj.$loaded()
          .catch(alert)
          .then(function() {
            $scope.landowners = [];
            obj.forEach(function(x){
              if(x.inactive!==true){$scope.landowners.push(x)};
            })
      }
        )
      });

      //toggle Accordions
      $scope.toggleOwnerDetailsAccordion = function(){
        $scope.OwnerDetailsExpanded = !$scope.OwnerDetailsExpanded;
      };
      $scope.togglePaymentsAccordion = function(){
        $scope.PaymentsExpanded = !$scope.PaymentsExpanded;
      };


      var inactiveRef = Ref.child('tracts').child($routeParams.tractid).child('landowners').child($routeParams.landownerid);
      var inactiveStatus = inactiveRef.child('inactive');
      $scope.inactiveStatus = $firebaseObject(inactiveStatus);



        var obj = $firebaseArray(Ref.child('tracts'));
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

        var ownerid = Ref.child('tracts').child($scope.tract.$id).child('landowners').child($scope.owner.$id);

        var ownerRef = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('landowners').child($scope.owner.$id));
        ownerRef.$bindTo($scope, "ownerdata");
        ownerRef.$loaded()
        .catch(alert)
        .then(function () {
          if($scope.ownerdata.ownerinterest!==null&&typeof($scope.ownerdata.ownerinterest)!=='undefined'){
$scope.ownerdata.ownerinterest = Number($scope.ownerdata.ownerinterest)};
$scope.ownerRef = ownerRef;
if(typeof($scope.ownerdata.ownername) !== 'undefined'){
var landownerRef = $firebaseObject(Ref.child('landowners').child(ownerRef.ownername));


  $scope.landownerRef = landownerRef;
};

ownerRef.$watch(function(){

  var landownerRef = $firebaseObject(Ref.child('landowners').child(ownerRef.ownername));
    $scope.landownerRef = landownerRef;
});

$scope.ownerDetails = ownerid;

$scope.addNewPayment = function() {
var p = Ref.child('tracts').child($scope.tract.$id).child('landowners').child($scope.owner.$id).child('payments').push();
$location.path('/tracts/'+$scope.tract.$id+'/landowners/'+$scope.owner.$id+'/payments/'+p.key)
};
$scope.checkInactive = function(id){
  if (id === true){
    return true
  }
  else {
    return false
  };
};
var filteredPayments = [];
var inactivePayments = [];


var payments = $firebaseArray(Ref.child('tracts').child($scope.tract.$id).child('landowners').child($scope.owner.$id).child('payments').orderByChild('checkdate'));
payments.$loaded().catch(alert).then(function () {

payments.forEach(function(x){
  if(x.inactive!==true){
    filteredPayments.push(x)
  };
    inactivePayments.push(x)
  });

$scope.payments = filteredPayments;
$scope.numberOfPayments = filteredPayments.length;


  if (typeof($scope.inactivePaymentFilter) === true)  {
    $scope.inactivePaymentFilter = true;
  }

  //create arrays for each payment category
  var rowArray = [];
  var temporaryworkspaceArray = [];
  var additionalworkspaceArray = [];
  var accessArray = [];
  var damagesArray = [];
  var valvesArray = [];
  var otherArray = [];
  var totalArray = [];
  var interest = $scope.owner.ownerinterest
  //loop through payments and push category values to master arrays
  filteredPayments.forEach(function(p){
    if(p.rowcost!==null&&typeof(p.rowcost)!=='undefined'&&p.rowcost!==''){rowArray.push(p.rowcost)}else{rowArray.push(0)};
    if(p.temporaryworkspacecost!==null&&typeof(p.temporaryworkspacecost)!=='undefined'&&p.temporaryworkspacecost!==''){temporaryworkspaceArray.push(p.temporaryworkspacecost)}else{temporaryworkspaceArray.push(0)};
    if(p.additionalworkspacecost!==null&&typeof(p.additionalworkspacecost)!=='undefined'&&p.additionalworkspacecost!==''){additionalworkspaceArray.push(p.additionalworkspacecost)}else{additionalworkspaceArray.push(0)};
    if(p.accesscost!==null&&typeof(p.accesscost)!=='undefined'&&p.accesscost!==''){accessArray.push(p.accesscost)}else{accessArray.push(0)};
    if(p.damagescost!==null&&typeof(p.damagescost)!=='undefined'&&p.damagescost!==''){damagesArray.push(p.damagescost)}else{damagesArray.push(0)};
    if(p.valvescost!==null&&typeof(p.valvescost)!=='undefined'&&p.valvescost!==''){valvesArray.push(p.valvescost)}else{valvesArray.push(0)};
    if(p.othercost!==null&&typeof(p.othercost)!=='undefined'&&p.othercost!==''){otherArray.push(p.othercost)}else{otherArray.push(0)};
var interest = p.ownerinterest
  })
  //get sum of each payment category array
  function getSum(total, num) {
      return total + num;};
      if(rowArray.length>0){
        var totalRowCost = rowArray.reduce(getSum).toFixed(2)
      }else{
        totalRowCost=''
      };
      if(temporaryworkspaceArray.length>0){
        var totalTemporaryWorkspaceCost = temporaryworkspaceArray.reduce(getSum).toFixed(2)
      }else{
        totalTemporaryWorkspaceCost=''
      };
      if(additionalworkspaceArray.length>0){
        var totalATWSCost = additionalworkspaceArray.reduce(getSum).toFixed(2)
      }else{
        totalATWSCost=''
      };
      if(accessArray.length>0){
        var totalAccessCost = accessArray.reduce(getSum).toFixed(2)
      }else{
        totalAccessCost=''
      };
      if(damagesArray.length>0){
        var totalDamagesCost = damagesArray.reduce(getSum).toFixed(2)
      }else{
        totalDamagesCost=''
      };
      if(valvesArray.length>0){
        var totalValvesCost = valvesArray.reduce(getSum).toFixed(2)
      }else{
        totalValvesCost=''
      };
      if(otherArray.length>0){
        var totalOtherCost = otherArray.reduce(getSum).toFixed(2)
      }else{
        totalOtherCost=''
      };
  var grandTotalCost = Number(totalRowCost)+Number(totalTemporaryWorkspaceCost)+Number(totalATWSCost)+Number(totalAccessCost)+Number(totalDamagesCost)+Number(totalOtherCost)+Number(totalValvesCost);
  //apply array totals to scope
  $scope.totalRowCost = totalRowCost;
  $scope.totalTemporaryWorkspace = totalTemporaryWorkspaceCost;
  $scope.totalAdditionalWorkspace = totalATWSCost;
  $scope.totalAccess = totalAccessCost;
  $scope.totalDamages = totalDamagesCost;
  $scope.totalValves = totalValvesCost;
  $scope.totalOther = totalOtherCost;
  var paymentTotal = totalRowCost+totalTemporaryWorkspaceCost+totalATWSCost+totalAccessCost+totalDamagesCost+totalValvesCost+totalOtherCost*interest;
  $scope.grandTotal = grandTotalCost;

$scope.toggleInactivePayment=function(){
  $scope.inactivePaymentFilter = !$scope.inactivePaymentFilter;

  if($scope.inactivePaymentFilter){
    $scope.payments = inactivePayments;
    $scope.numberOfPayments = inactivePayments.length;
    //create arrays for each payment category
    var rowArray = [];
    var temporaryworkspaceArray = [];
    var additionalworkspaceArray = [];
    var accessArray = [];
    var damagesArray = [];
    var otherArray = [];
    var totalArray = [];
    //loop through payments and push category values to master arrays
    inactivePayments.forEach(function(p){
      if(p.rowcost!==null&&typeof(p.rowcost)!=='undefined'&&p.rowcost!==''){rowArray.push(p.rowcost)}else{rowArray.push(0)};
      if(p.temporaryworkspacecost!==null&&typeof(p.temporaryworkspacecost)!=='undefined'&&p.temporaryworkspacecost!==''){temporaryworkspaceArray.push(p.temporaryworkspacecost)}else{temporaryworkspaceArray.push(0)};
      if(p.additionalworkspacecost!==null&&typeof(p.additionalworkspacecost)!=='undefined'&&p.additionalworkspacecost!==''){additionalworkspaceArray.push(p.additionalworkspacecost)}else{additionalworkspaceArray.push(0)};
      if(p.accesscost!==null&&typeof(p.accesscost)!=='undefined'&&p.accesscost!==''){accessArray.push(p.accesscost)}else{accessArray.push(0)};
      if(p.damagescost!==null&&typeof(p.damagescost)!=='undefined'&&p.damagescost!==''){damagesArray.push(p.damagescost)}else{damagesArray.push(0)};
      if(p.othercost!==null&&typeof(p.othercost)!=='undefined'&&p.othercost!==''){otherArray.push(p.othercost)}else{otherArray.push(0)};

    })
    //get sum of each payment category array
    function getSum(total, num) {
        return total + num;};
    if(rowArray.length>0){
      var totalRowCost = rowArray.reduce(getSum).toFixed(2)
    }else{
      totalRowCost=''
    };
    if(temporaryworkspaceArray.length>0){
      var totalTemporaryWorkspaceCost = temporaryworkspaceArray.reduce(getSum).toFixed(2)
    }else{
      totalTemporaryWorkspaceCost=''
    };
    if(additionalworkspaceArray.length>0){
      var totalATWSCost = additionalworkspaceArray.reduce(getSum).toFixed(2)
    }else{
      totalATWSCost=''
    };
    if(accessArray.length>0){
      var totalAccessCost = accessArray.reduce(getSum).toFixed(2)
    }else{
      totalAccessCost=''
    };
    if(damagesArray.length>0){
      var totalDamagesCost = damagesArray.reduce(getSum).toFixed(2)
    }else{
      totalDamagesCost=''
    };
    if(otherArray.length>0){
      var totalOtherCost = otherArray.reduce(getSum).toFixed(2)
    }else{
      totalOtherCost=''
    };
    var grandTotalCost = Number(totalRowCost)+Number(totalTemporaryWorkspaceCost)+Number(totalATWSCost)+Number(totalAccessCost)+Number(totalDamagesCost)+Number(totalOtherCost);
    //apply array totals to scope
    $scope.totalRowCost = totalRowCost;
    $scope.totalTemporaryWorkspace = totalTemporaryWorkspaceCost;
    $scope.totalAdditionalWorkspace = totalATWSCost;
    $scope.totalAccess = totalAccessCost;
    $scope.totalDamages = totalDamagesCost;
    $scope.totalOther = totalOtherCost;
    $scope.subTotal = function(){
      return $scope.totalRowCost+$scope.totalTemporaryWorkspace+$scope.totalAdditionalWorkspace+$scope.totalDamagesCost+$scope.totalOtherCost
    }
    $scope.grandTotal = grandTotalCost;


  }else{
    $scope.payments = filteredPayments;
    $scope.numberOfPayments = filteredPayments.length;
    //create arrays for each payment category
    var rowArray = [];
    var temporaryworkspaceArray = [];
    var additionalworkspaceArray = [];
    var accessArray = [];
    var damagesArray = [];
    var otherArray = [];
    var totalArray = [];
    //loop through payments and push category values to master arrays
    filteredPayments.forEach(function(p){
      if(p.rowcost!==null&&typeof(p.rowcost)!=='undefined'&&p.rowcost!==''){rowArray.push(p.rowcost)}else{rowArray.push(0)};
      if(p.temporaryworkspacecost!==null&&typeof(p.temporaryworkspacecost)!=='undefined'&&p.temporaryworkspacecost!==''){temporaryworkspaceArray.push(p.temporaryworkspacecost)}else{temporaryworkspaceArray.push(0)};
      if(p.additionalworkspacecost!==null&&typeof(p.additionalworkspacecost)!=='undefined'&&p.additionalworkspacecost!==''){additionalworkspaceArray.push(p.additionalworkspacecost)}else{additionalworkspaceArray.push(0)};
      if(p.accesscost!==null&&typeof(p.accesscost)!=='undefined'&&p.accesscost!==''){accessArray.push(p.accesscost)}else{accessArray.push(0)};
      if(p.damagescost!==null&&typeof(p.damagescost)!=='undefined'&&p.damagescost!==''){damagesArray.push(p.damagescost)}else{damagesArray.push(0)};
      if(p.othercost!==null&&typeof(p.othercost)!=='undefined'&&p.othercost!==''){otherArray.push(p.othercost)}else{otherArray.push(0)};


    })
    //get sum of each payment category array
    function getSum(total, num) {
        return total + num;};
        if(rowArray.length>0){
          var totalRowCost = rowArray.reduce(getSum).toFixed(2)
        }else{
          totalRowCost=''
        };
        if(temporaryworkspaceArray.length>0){
          var totalTemporaryWorkspaceCost = temporaryworkspaceArray.reduce(getSum).toFixed(2)
        }else{
          totalTemporaryWorkspaceCost=''
        };
        if(additionalworkspaceArray.length>0){
          var totalATWSCost = additionalworkspaceArray.reduce(getSum).toFixed(2)
        }else{
          totalATWSCost=''
        };
        if(accessArray.length>0){
          var totalAccessCost = accessArray.reduce(getSum).toFixed(2)
        }else{
          totalAccessCost=''
        };
        if(damagesArray.length>0){
          var totalDamagesCost = damagesArray.reduce(getSum).toFixed(2)
        }else{
          totalDamagesCost=''
        };
        if(otherArray.length>0){
          var totalOtherCost = otherArray.reduce(getSum).toFixed(2)
        }else{
          totalOtherCost=''
        };
    var grandTotalCost = Number(totalRowCost)+Number(totalTemporaryWorkspaceCost)+Number(totalATWSCost)+Number(totalAccessCost)+Number(totalDamagesCost)+Number(totalOtherCost);

    //apply array totals to scope
    $scope.totalRowCost = totalRowCost;
    $scope.totalTemporaryWorkspace = totalTemporaryWorkspaceCost;
    $scope.totalAdditionalWorkspace = totalATWSCost;
    $scope.totalAccess = totalAccessCost;
    $scope.totalDamages = totalDamagesCost;
    $scope.totalOther = totalOtherCost;
    $scope.subTotal = function(){
      return $scope.totalRowCost+$scope.totalTemporaryWorkspace+$scope.totalAdditionalWorkspace+$scope.totalDamagesCost+$scope.totalOtherCost
    }
    $scope.grandTotal = grandTotalCost;

  }

}
});

})
          }
            )
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

    .factory('OwnerPayment', ['$firebaseObject', 'Ref', 'ROW',
      function($firebaseObject, Ref, ROW) {
        return function(landownerpaymentid) {

          var p = landownerpaymentid;

          var landownerpaymentRef = Ref.child('tracts').child(p);
          var landownerpaymentObj = $firebaseObject(landownerpaymentRef);


          return landownerpaymentObj;

        };


      }

    ])

    .controller('LandOwnerPaymentCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
        '$routeParams', 'Tract', 'Owner', 'OwnerPayment', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'ROW', 'WeldImages',
      function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
          $routeParams, Tract, Owner, OwnerPayment, $window, $location, user, LOCATIONS, openPost, ROW, WeldImages) {

        new Owner($routeParams.landownerid).$bindTo($scope, 'owner');
        new Tract($routeParams.tractid).$bindTo($scope, 'tract');
        new OwnerPayment($routeParams.landownerpaymentid).$bindTo($scope, 'record')

        $scope.grandTotal = $scope.rowcost+$scope.temporaryworkspacecost+$scope.additionalworkspacecost+$scope.damagescost+$scope.accesscost+$scope.valvescost+$scope.othercost;

        Ref.child('tracts').once('value',function(snapshot) {
          var obj = $firebaseArray(Ref.child('tracts'));
              obj.$loaded()
                .catch(alert)
                .then(function() {

                  var ownerid = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('landowners').child($scope.owner.$id));
                  ownerid.$bindTo($scope, "ownerdata");
                  ownerid.$loaded()
                  .catch(alert)
                  .then(function () {
                    $scope.ownerInterestRef =$scope.ownerdata.ownerinterest;

                    var ownerDetailsRef = $firebaseObject(Ref.child('landowners').child($scope.ownerdata.ownername));
                    ownerDetailsRef.$loaded()
                    .catch(alert)
                    .then(function () {
            $scope.ownername = ownerDetailsRef.name;


            var address = ownerDetailsRef.address;
            var city = ownerDetailsRef.city;
            var state = ownerDetailsRef.state;
            var zip = ownerDetailsRef.zip;
            var taxid = ownerDetailsRef.taxid;
            var fullAddress;
            if(typeof(address)==='undefined'||typeof(city)==='undefined'||city === null ||typeof(state)==='undefined'||state === null ||typeof(zip)==='undefined'||zip === null ){
              fullAddress = ' '}else{
              fullAddress = address+', '+city+', '+state+' '+zip};
            $scope.fullAddress = fullAddress;
            $scope.address = address;
            $scope.city = city;
            $scope.state = state;
            $scope.zip = zip;
            $scope.taxid = taxid;


                    $scope.addPaymentTotals = function(a, b, c, d, e, f){
                      return Number(a)+Number(b)+Number(c)+Number(d)+Number(e)+Number(f);
                    };

                  $scope.ownerDetails = ownerid;


                  var paymentid = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('landowners').child($scope.owner.$id).child('payments').child($scope.record.$id));
                  var activePaymentStatus = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('landowners').child($scope.owner.$id).child('payments').child($scope.record.$id).child('inactive'));
                  paymentid.$bindTo($scope,"paymentdata");
                  paymentid.$loaded().catch(alert).then(function () {

                      $scope.addNewPayment = function() {
                        var p = Ref.child('tracts').child($scope.tract.$id).child('landowners').child($scope.owner.$id).child('payments').push();
                        $location.path('/tracts/'+$scope.tract.$id+'/landowners/'+$scope.owner.$id+'/payments/'+p.key)
                      };

                      //get total acres
                      $scope.getAcres = function(width, length){
                        if(width===null||typeof(width)==='undefined'||width===''||isNaN(width)||length===null||typeof(length)==='undefined'||length===''||isNaN(length)){
                             return ''}else{
                         return ((width*length)/43560)
                         }
                       }
                      //get total rods
                      $scope.getRods = function(length){
                        if(length===null||typeof(length)==='undefined'||length===''||isNaN(length)){
                             return ''}else{
                               return (length/16.5)
                             }
                            }
                      //get offer per rod
                      $scope.getRodOffer  = function(perAcreOffer,acres,rods){
                        if(perAcreOffer===null||typeof(perAcreOffer)==='undefined'||perAcreOffer===''||isNaN(perAcreOffer)||acres===null||typeof(acres)==='undefined'||acres===''||isNaN(acres)||rods===null||typeof(rods)==='undefined'||rods===''||isNaN(rods)){
                             return ''}else{
                               return ((perAcreOffer*acres)/rods)
                         }
                      }
                      //get subtotal
                      $scope.getSubTotal  = function(perAcreOffer,acres){
                        if(perAcreOffer===null||typeof(perAcreOffer)==='undefined'||perAcreOffer===''||isNaN(perAcreOffer)||acres===null||typeof(acres)==='undefined'||acres===''||isNaN(acres)){
                             return ''}else{
                        return (perAcreOffer*acres)
                         }
                        }
                      //get damages per acre
                      $scope.getDamageCost  = function(price, units){
                        if(price===null||typeof(price)==='undefined'||price===''||isNaN(price)||units===null||typeof(units)==='undefined'||units===''||isNaN(units)){
                             return ''}else{
                         return (price*units)
                         }
                      }
                      //get 1st Year Valuation
                      $scope.yearOneCost  = function(pricePerAcre,totalAcres){
                        if(pricePerAcre===null||typeof(pricePerAcre)==='undefined'||pricePerAcre===''||isNaN(pricePerAcre)||totalAcres===null||typeof(totalAcres)==='undefined'||totalAcres===''||isNaN(totalAcres)){
                             return ''}else{
                         return (pricePerAcre*totalAcres*1.0)
                         }
                       }
                      //get 2nd Year Valuation
                      $scope.yearTwoCost  = function(pricePerAcre,totalAcres){
                        if(pricePerAcre===null||typeof(pricePerAcre)==='undefined'||pricePerAcre===''||isNaN(pricePerAcre)||totalAcres===null||typeof(totalAcres)==='undefined'||totalAcres===''||isNaN(totalAcres)){
                             return ''}else{
                         return (pricePerAcre*totalAcres*0.75)
                         }
                      }
                      //get 3rd Year Valuation
                      $scope.yearThreeCost  = function(pricePerAcre,totalAcres){
                        if(pricePerAcre===null||typeof(pricePerAcre)==='undefined'||pricePerAcre===''||isNaN(pricePerAcre)||totalAcres===null||typeof(totalAcres)==='undefined'||totalAcres===''||isNaN(totalAcres)){
                             return ''}else{
                         return (pricePerAcre*totalAcres*0.50)
                         }
                      }
                      //get total Damage Valuation
                      $scope.extendedDamageCost = function(yearOne, yearTwo, yearThree){
                        return (Number(yearOne)+Number(yearTwo)+Number(yearThree))
                      }
                      //get Grand Total
                      $scope.getGrandTotal = function(){
                      // var totalAmount = $scope.paymentdata.rowcost+$scope.paymentdata.temporaryworkspacecost+$scope.paymentdata.additionalworkspacecost+$scope.paymentdata.accesscost+$scope.paymentdata.damagescost+$scope.paymentdata.othercost;
                      var rowcost = $scope.paymentdata.rowcost;
                      var tws = $scope.paymentdata.temporaryworkspacecost;
                      var atws = $scope.paymentdata.additionalworkspacecost;
                      var damages = $scope.paymentdata.damagescost;
                      var access = $scope.paymentdata.accesscost;
                      var valves = $scope.paymentdata.valvescost;
                      var other = $scope.paymentdata.othercost;
                      var interest = $scope.paymentdata.ownerinterest;

                      if(rowcost!==''&&rowcost!==null&&typeof(rowcost)!=='undefined'){var rowTotal = rowcost}else{rowTotal =0};
                      if(tws&&tws!==''&&tws!==null&&typeof(tws)!=='undefined'){var twsTotal = tws}else{twsTotal =0};
                      if(atws&&atws!==''&&atws!==null&&typeof(atws)!=='undefined'){var atwsTotal = atws}else{atwsTotal =0};
                      if(damages&&damages!==''&&damages!==null&&typeof(damages)!=='undefined'){var damagesTotal = damages}else{damagesTotal =0};
                      if(access&access!==''&&access!==null&&typeof(access)!=='undefined'){var accessTotal = access}else{accessTotal =0};
                      if(valves&&valves!==''&&valves!==null&&typeof(valves)!=='undefined'){var valvesTotal = valves}else{valvesTotal =0};
                      if(other&&other!==''&&other!==null&&typeof(other)!=='undefined'){var otherTotal = other}else{otherTotal =0};
                      if(interest&&interest!==''&&interest!==null&&typeof(interest)!=='undefined'){var interestTotal = interest/100}else{interestTotal =100/100 ; $scope.paymentdata.ownerinterest = 100};

                      return Number(interestTotal)*(Number(rowTotal.toFixed(2))+Number(twsTotal.toFixed(2))+Number(atwsTotal.toFixed(2))+Number(damagesTotal.toFixed(2))+Number(accessTotal.toFixed(2))+Number(valvesTotal.toFixed(2))+Number(otherTotal.toFixed(2)));
                      }


                      $scope.updateAccessCost=function(){
                        $scope.paymentdata.accesscost = (($scope.paymentdata.accesswidth*$scope.paymentdata.accesslength)/43560)*$scope.paymentdata.accessoffer;
                      };
                      $scope.updateROWCost = function(){
                      if($scope.paymentdata.easementwidth&&$scope.paymentdata.easementwidth!==null&&$scope.paymentdata.easementwidth!==''&&typeof($scope.paymentdata.easementwidth)!=='undefined'&&
                      $scope.paymentdata.easementlength&&$scope.paymentdata.easementlength!==null&&$scope.paymentdata.easementlength!==''&&typeof($scope.paymentdata.easementlength)!=='undefined'&&
                      $scope.paymentdata.offerperacre&&$scope.paymentdata.offerperacre!==null&&$scope.paymentdata.offerperacre!==''&&typeof($scope.paymentdata.offerperacre)!=='undefined'){
                      $scope.paymentdata.rowcost = $scope.paymentdata.offerperacre*(($scope.paymentdata.easementwidth*$scope.paymentdata.easementlength)/43560);
                      var totalacres= ($scope.paymentdata.easementwidth*$scope.paymentdata.easementlength)/43560;
                      $scope.paymentdata.rowacres = totalacres;
                        $scope.paymentdata.rods='';$scope.paymentdata.rodsoffer='';
                        }
                      };
                      $scope.updateROWAcres = function(){
                      if($scope.paymentdata.rowacres&&$scope.paymentdata.rowacres!==null&&$scope.paymentdata.rowacres!==''&&typeof($scope.paymentdata.rowacres)!=='undefined'){
                      $scope.paymentdata.rowcost = $scope.paymentdata.offerperacre*($scope.paymentdata.rowacres);
                    $scope.paymentdata.easementwidth='';
                    $scope.paymentdata.easementlength = '';
                    $scope.paymentdata.rods = '';
                    $scope.paymentdata.rodsoffer='';
                    };
                      };
                      $scope.updateROWOffer = function(){
                      if($scope.paymentdata.offerperacre&&$scope.paymentdata.offerperacre!==null&&$scope.paymentdata.offerperacre!==''&&typeof($scope.paymentdata.offerperacre)!=='undefined'&&
                      $scope.paymentdata.rowacres&&$scope.paymentdata.rowacres!==null&&$scope.paymentdata.rowacres!==''&&typeof($scope.paymentdata.rowacres)!=='undefined'){
                          $scope.paymentdata.rowcost = $scope.paymentdata.offerperacre*($scope.paymentdata.rowacres);
                          $scope.paymentdata.rods='';$scope.paymentdata.rodsoffer='';
                    }else if($scope.paymentdata.offerperacre&&$scope.paymentdata.offerperacre!==null&&$scope.paymentdata.offerperacre!==''&&typeof($scope.paymentdata.offerperacre)!=='undefined'&&
                      $scope.paymentdata.easementwidth&&$scope.paymentdata.easementwidth!==null&&$scope.paymentdata.easementwidth!==''&&typeof($scope.paymentdata.easementwidth)!=='undefined'&&
                      $scope.paymentdata.easementlength&&$scope.paymentdata.easementlength!==null&&$scope.paymentdata.easementlength!==''&&typeof($scope.paymentdata.easementlength)!=='undefined'){
                          $scope.paymentdata.rowcost = $scope.paymentdata.offerperacre*(($scope.paymentdata.easementwidth*$scope.paymentdata.easementlength)/43560);
                            $scope.paymentdata.rods='';$scope.paymentdata.rodsoffer='';
                      };
                      };
                      $scope.updateROWRods = function(){
                      if($scope.paymentdata.rods&&$scope.paymentdata.rods!==null&&$scope.paymentdata.rods!==''&&typeof($scope.paymentdata.rods)!=='undefined'){
                          $scope.paymentdata.rowcost = $scope.paymentdata.rodsoffer*($scope.paymentdata.rods);
                          $scope.paymentdata.easementlength = '';$scope.paymentdata.easementwidth='';
                          $scope.paymentdata.rowacres = '';  $scope.paymentdata.offerperacre = ''

                    }
                      };
                      $scope.updateTWSCost = function(){
                      if($scope.paymentdata.twswidth&&$scope.paymentdata.twswidth!==null&&$scope.paymentdata.twswidth!==''&&typeof($scope.paymentdata.twswidth)!=='undefined'&&
                      $scope.paymentdata.twslength&&$scope.paymentdata.twslength!==null&&$scope.paymentdata.twslength!==''&&typeof($scope.paymentdata.twslength)!=='undefined'&&
                      $scope.paymentdata.twsperacre&&$scope.paymentdata.twsperacre!==null&&$scope.paymentdata.twsperacre!==''&&typeof($scope.paymentdata.twsperacre)!=='undefined'){
                      $scope.paymentdata.temporaryworkspacecost = $scope.paymentdata.twsperacre*(($scope.paymentdata.twswidth*$scope.paymentdata.twslength)/43560);
                      var totalacres= ($scope.paymentdata.twswidth*$scope.paymentdata.twslength)/43560;
                      $scope.paymentdata.twsacres = totalacres;
                        $scope.paymentdata.twsrods='';$scope.paymentdata.twsrodsoffer='';
                        }
                      };
                      $scope.updateTWSAcres = function(){
                      if($scope.paymentdata.twsacres&&$scope.paymentdata.twsacres!==null&&$scope.paymentdata.twsacres!==''&&typeof($scope.paymentdata.twsacres)!=='undefined'){
                      $scope.paymentdata.temporaryworkspacecost = $scope.paymentdata.twsperacre*($scope.paymentdata.twsacres);
                    $scope.paymentdata.twswidth='';
                    $scope.paymentdata.twslength = '';
                    $scope.paymentdata.twsrods = '';
                    $scope.paymentdata.twsrodsoffer='';
                    };
                      };
                      $scope.updateTWSOffer = function(){
                      if($scope.paymentdata.twsperacre&&$scope.paymentdata.twsperacre!==null&&$scope.paymentdata.twsperacre!==''&&typeof($scope.paymentdata.twsperacre)!=='undefined'&&
                      $scope.paymentdata.twsacres&&$scope.paymentdata.twsacres!==null&&$scope.paymentdata.twsacres!==''&&typeof($scope.paymentdata.twsacres)!=='undefined'){
                          $scope.paymentdata.temporaryworkspacecost = $scope.paymentdata.twsperacre*($scope.paymentdata.twsacres);
                          $scope.paymentdata.twsrods='';$scope.paymentdata.twsrodsoffer='';
                    }else if($scope.paymentdata.twsperacre&&$scope.paymentdata.twsperacre!==null&&$scope.paymentdata.twsperacre!==''&&typeof($scope.paymentdata.twsperacre)!=='undefined'&&
                      $scope.paymentdata.twswidth&&$scope.paymentdata.twswidth!==null&&$scope.paymentdata.twswidth!==''&&typeof($scope.paymentdata.twswidth)!=='undefined'&&
                      $scope.paymentdata.twslength&&$scope.paymentdata.twslength!==null&&$scope.paymentdata.twslength!==''&&typeof($scope.paymentdata.twslength)!=='undefined'){
                          $scope.paymentdata.temporaryworkspacecost = $scope.paymentdata.twsperacre*(($scope.paymentdata.twswidth*$scope.paymentdata.twslength)/43560);
                            $scope.paymentdata.twsrods='';$scope.paymentdata.twsrodsoffer='';
                      };
                      };
                      $scope.updateTWSRods = function(){
                      if($scope.paymentdata.twsrods&&$scope.paymentdata.twsrods!==null&&$scope.paymentdata.twsrods!==''&&typeof($scope.paymentdata.twsrods)!=='undefined'){
                          $scope.paymentdata.temporaryworkspacecost = $scope.paymentdata.twsrodsoffer*($scope.paymentdata.twsrods);
                          $scope.paymentdata.twslength = '';$scope.paymentdata.twslength='';
                          $scope.paymentdata.twsacres = '';  $scope.paymentdata.twsperacre = ''

                    }
                      };

                      $scope.updateATWSCost = function(){
                      if($scope.paymentdata.atwswidth&&$scope.paymentdata.atwswidth!==null&&$scope.paymentdata.atwswidth!==''&&typeof($scope.paymentdata.atwswidth)!=='undefined'&&
                      $scope.paymentdata.atwslength&&$scope.paymentdata.atwslength!==null&&$scope.paymentdata.atwslength!==''&&typeof($scope.paymentdata.atwslength)!=='undefined'&&
                      $scope.paymentdata.atwsperacre&&$scope.paymentdata.atwsperacre!==null&&$scope.paymentdata.atwsperacre!==''&&typeof($scope.paymentdata.atwsperacre)!=='undefined'){
                      $scope.paymentdata.additionalworkspacecost = $scope.paymentdata.atwsperacre*(($scope.paymentdata.atwswidth*$scope.paymentdata.atwslength)/43560);
                      var totalacres= ($scope.paymentdata.atwswidth*$scope.paymentdata.atwslength)/43560;
                      $scope.paymentdata.atwsacres = totalacres;
                        $scope.paymentdata.atwsrods='';$scope.paymentdata.atwsrodsoffer='';
                        }
                      };
                      $scope.updateATWSAcres = function(){
                      if($scope.paymentdata.atwsacres&&$scope.paymentdata.atwsacres!==null&&$scope.paymentdata.atwsacres!==''&&typeof($scope.paymentdata.atwsacres)!=='undefined'){
                      $scope.paymentdata.additionalworkspacecost = $scope.paymentdata.atwsperacre*($scope.paymentdata.atwsacres);
                    $scope.paymentdata.atwswidth='';
                    $scope.paymentdata.atwslength = '';
                    $scope.paymentdata.atwsrods = '';
                    $scope.paymentdata.atwsrodsoffer='';
                    };
                      };
                      $scope.updateATWSOffer = function(){
                      if($scope.paymentdata.atwsperacre&&$scope.paymentdata.atwsperacre!==null&&$scope.paymentdata.atwsperacre!==''&&typeof($scope.paymentdata.atwsperacre)!=='undefined'&&
                      $scope.paymentdata.atwsacres&&$scope.paymentdata.atwsacres!==null&&$scope.paymentdata.atwsacres!==''&&typeof($scope.paymentdata.atwsacres)!=='undefined'){
                          $scope.paymentdata.additionalworkspacecost = $scope.paymentdata.atwsperacre*($scope.paymentdata.atwsacres);
                          $scope.paymentdata.atwsrods='';$scope.paymentdata.atwsrodsoffer='';
                    }else if($scope.paymentdata.atwsperacre&&$scope.paymentdata.atwsperacre!==null&&$scope.paymentdata.atwsperacre!==''&&typeof($scope.paymentdata.atwsperacre)!=='undefined'&&
                      $scope.paymentdata.atwswidth&&$scope.paymentdata.atwswidth!==null&&$scope.paymentdata.atwswidth!==''&&typeof($scope.paymentdata.atwswidth)!=='undefined'&&
                      $scope.paymentdata.atwslength&&$scope.paymentdata.atwslength!==null&&$scope.paymentdata.atwslength!==''&&typeof($scope.paymentdata.atwslength)!=='undefined'){
                          $scope.paymentdata.additionalworkspacecost = $scope.paymentdata.atwsperacre*(($scope.paymentdata.atwswidth*$scope.paymentdata.atwslength)/43560);
                            $scope.paymentdata.atwsrods='';$scope.paymentdata.atwsrodsoffer='';
                      };
                      };
                      $scope.updateATWSRods = function(){
                      if($scope.paymentdata.atwsrods&&$scope.paymentdata.atwsrods!==null&&$scope.paymentdata.atwsrods!==''&&typeof($scope.paymentdata.atwsrods)!=='undefined'){
                          $scope.paymentdata.additionalworkspacecost = $scope.paymentdata.atwsrodsoffer*($scope.paymentdata.atwsrods);
                          $scope.paymentdata.atwslength = '';$scope.paymentdata.atwslength='';
                          $scope.paymentdata.atwsacres = '';  $scope.paymentdata.atwsperacre = ''

                    }
                      };
                      $scope.updateDamagesCost = function(){
                        var damagesYearOne = ((($scope.paymentdata.damageswidth*$scope.paymentdata.damageslength)/43560)*$scope.paymentdata.unitsperacre*$scope.paymentdata.unitprice);
                        $scope.paymentdata.damagescost = damagesYearOne+(damagesYearOne*.75)+(damagesYearOne*.50);
                      };
                      $scope.updateOtherCost = function(){
                        $scope.paymentdata.othercost= $scope.paymentdata.othercosttotal;

                      }

                      $scope.updateValvesCost = function(){
                        $scope.paymentdata.valvescost = $scope.paymentdata.valvesoffer*(($scope.paymentdata.valveswidth*$scope.paymentdata.valveslength)/43560);

                      };

                      $scope.inactiveStatus= activePaymentStatus.$value;

                      $scope.toggleInactive = function(){
                        $scope.inactiveStatus = !$scope.inactiveStatus;
                        if($scope.inactiveStatus){
                          $scope.paymentdata.inactive = true;
                        }else{
                          $scope.paymentdata.inactive = false;
                        }
                      };
                      $scope.exportData=(function() {
                        $timeout(function(){
                          var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FCalculation_Worksheet.xlsx?alt=media&token=8cadd3d3-afb1-4351-b47b-222e79bed798";
                          var req = new XMLHttpRequest();
                          req.open("GET", file, true);
                          req.responseType = "arraybuffer";

                          if($scope.paymentdata.easementlength&&$scope.paymentdata.easementlength!==null&&$scope.paymentdata.easementlength!==''&&typeof($scope.paymentdata.easementlength)!==''){var easementlength = $scope.paymentdata.easementlength;}else{easementlength=0};
                          if($scope.paymentdata.easementwidth&&$scope.paymentdata.easementwidth!==null&&$scope.paymentdata.easementwidth!==''&&typeof($scope.paymentdata.easementwidth)!==''){var easementwidth = $scope.paymentdata.easementwidth;}else{easementwidth=0};
                          if($scope.paymentdata.twswidth&&$scope.paymentdata.twswidth!==null&&$scope.paymentdata.twswidth!==''&&typeof($scope.paymentdata.twswidth)!==''){var twswidth = $scope.paymentdata.twswidth;}else{twswidth=0};
                          if($scope.paymentdata.atwswidth&&$scope.paymentdata.atwswidth!==null&&$scope.paymentdata.atwswidth!==''&&typeof($scope.paymentdata.atwswidth)!==''){var atwswidth = $scope.paymentdata.atwswidth;}else{atwswidth=0};
                          if($scope.paymentdata.twslength&&$scope.paymentdata.twslength!==null&&$scope.paymentdata.twslength!==''&&typeof($scope.paymentdata.twslength)!==''){var twslength = $scope.paymentdata.twslength;}else{twslength=0};
                          if($scope.paymentdata.atwslength&&$scope.paymentdata.atwslength!==null&&$scope.paymentdata.atwslength!==''&&typeof($scope.paymentdata.atwslength)!==''){var atwslength = $scope.paymentdata.atwslength;}else{atwslength=0};

                          req.onreadystatechange = function () {
                              if (req.readyState === 4 && req.status === 200){
                                  XlsxPopulate.fromDataAsync(req.response)
                                      .then(function (workbook) {

                          workbook.sheet(0).cell("B7").value(
                          $scope.paymentdata.checkno
                          );
                          workbook.sheet(0).cell("B8").value(
                            $scope.paymentdata.checkdate
                          );
                          workbook.sheet(0).cell("B14").value(
                            $scope.tract.tract
                          );
                          var sectwprng;
                          if($scope.tract.section!==null&&typeof($scope.tract.section)!=='undefined'&&$scope.tract.section!==''&&
                              $scope.tract.township!==null&&typeof($scope.tract.township)!=='undefined'&&$scope.tract.township!==''&&
                              $scope.tract.range!==null&&$scope.tract.range!==''&&typeof($scope.tract.range)!=='undefined'){sectwprng = $scope.tract.section+'-'+$scope.tract.township+'-'+$scope.tract.range}
                              else{sectwprng = ''};

                          workbook.sheet(0).cell("B15").value(
                            sectwprng
                          );
                          workbook.sheet(0).cell("B16").value(
                            $scope.tract.legaldescription
                          );
                          workbook.sheet(0).cell("B17").value(
                            $scope.tract.county + ', OK'
                          );
                          workbook.sheet(0).cell("B16").value(
                            $scope.paymentdata.checkdate
                          );
                          if($scope.paymentdata.ownerpayeename!==null&&typeof($scope.paymentdata.ownerpayeename)!=='undefined'&&$scope.paymentdata.ownerpayeename!==''){
                            workbook.sheet(0).cell("B22").value(
                              $scope.paymentdata.ownerpayeename
                            )
                          }else{
                              workbook.sheet(0).cell("B22").value(
                                $scope.ownername
                              );
                            };
                        if($scope.paymentdata.ownerpayeeaddress!==null&&typeof($scope.paymentdata.ownerpayeeaddress)!=='undefined'&&$scope.paymentdata.ownerpayeeaddress!==''){
                              workbook.sheet(0).cell("B23").value(
                                $scope.paymentdata.ownerpayeeaddress
                              )
                        }else{
                                workbook.sheet(0).cell("B23").value(
                                  $scope.address
                                );
                              };
                              if($scope.paymentdata.ownerpayeecity!==null&&typeof($scope.paymentdata.ownerpayeecity)!=='undefined'&&$scope.paymentdata.ownerpayeecity!==''){
                                    workbook.sheet(0).cell("B24").value(
                                      $scope.paymentdata.ownerpayeecity
                                    )
                              }else{
                                      workbook.sheet(0).cell("B24").value(
                                        $scope.city
                                      );
                                    };
                            if($scope.paymentdata.ownerpayeestate!==null&&typeof($scope.paymentdata.ownerpayeestate)!=='undefined'&&$scope.paymentdata.ownerpayeestate!==''){
                                          workbook.sheet(0).cell("B25").value(
                                            $scope.paymentdata.ownerpayeestate
                                          )
                            }else{
                                            workbook.sheet(0).cell("B25").value(
                                              $scope.state
                                            );
                                          };
                            if($scope.paymentdata.ownerpayeezip!==null&&typeof($scope.paymentdata.ownerpayeezip)!=='undefined'&&$scope.paymentdata.ownerpayeezip!==''){
                                                workbook.sheet(0).cell("B26").value(
                                                  $scope.paymentdata.ownerpayeezip
                                                )
                            }else{
                                                  workbook.sheet(0).cell("B26").value(
                                                    $scope.zip
                                                  );
                                                };

                        workbook.sheet(1).cell("B11").value(
                            easementwidth                        );
                        workbook.sheet(1).cell("E11").value(
                          easementlength
                        );
                        workbook.sheet(1).cell("E12").value(
                          $scope.paymentdata.offerperacre
                        );
                        workbook.sheet(1).cell("B18").value(
twswidth                        );
                        workbook.sheet(1).cell("E18").value(
twslength                        );
                        workbook.sheet(1).cell("E19").value(
                          $scope.paymentdata.twsperacre
                        );
                        workbook.sheet(1).cell("B25").value(
atwswidth                        );
                        workbook.sheet(1).cell("E25").value(
atwslength                        );
                        workbook.sheet(1).cell("E26").value(
                          $scope.paymentdata.atwsperacre
                        );
                        workbook.sheet(1).cell("B32").value(
                          $scope.paymentdata.damageswidth
                        );
                        workbook.sheet(1).cell("E32").value(
                          $scope.paymentdata.damageslength
                        );
                        workbook.sheet(1).cell("B33").value(
                          $scope.paymentdata.damagestype
                        );
                        workbook.sheet(1).cell("E33").value(
                          $scope.paymentdata.croptype
                        );
                        workbook.sheet(1).cell("H33").value(
                          $scope.paymentdata.unitofmeasure
                        );
                        workbook.sheet(1).cell("B34").value(
                          $scope.paymentdata.unitsperacre
                        );
                        workbook.sheet(1).cell("E34").value(
                          $scope.paymentdata.unitprice
                        );
                        workbook.sheet(1).cell("B40").value(
                          $scope.paymentdata.accessdescription
                        );
                        workbook.sheet(1).cell("B41").value(
                          $scope.paymentdata.accesswidth
                        );
                        workbook.sheet(1).cell("E41").value(
                          $scope.paymentdata.accesslength
                        );
                        workbook.sheet(1).cell("E42").value(
                          $scope.paymentdata.accessoffer
                        );
                        workbook.sheet(1).cell("B47").value(
                          $scope.paymentdata.otherdescription
                        );
                        workbook.sheet(1).cell("B48").value(
                          $scope.paymentdata.othercosttotal
                        );
                                                  // var dataRange = (3 + landownersArray.length).toString();
                          // workbook.sheet(0).range("A3:I4").style("border","medium");
                          // workbook.sheet(0).range("A4:I"+dataRange).style("border",true);


                          workbook.outputAsync()
                              .then(function (blob) {
                                  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                      // If IE, you must uses a different method.
                                      window.navigator.msSaveOrOpenBlob(blob, "Calculation Worksheet.xlsx");
                                  } else {
                                      var url = window.URL.createObjectURL(blob);
                                      var a = document.createElement("a");
                                      document.body.appendChild(a);
                                      a.href = url;
                                      a.download = "Calculation Worksheet.xlsx";
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                  }
                              });
                                      });
                              }
                          };

                          req.send();
                        },3000);
                                        });
                                    });
    })
      });
            }
              )
        })



        $scope.togglePaymentsAccordion = function(){
          $scope.PaymentsExpanded = !$scope.PaymentsExpanded;
        };
        $scope.toggleROWAccordion = function(){
          $scope.ROWExpanded = !$scope.ROWExpanded;
        };
        $scope.toggleTWSAccordion = function(){
          $scope.TWSExpanded = !$scope.TWSExpanded;
        };
        $scope.toggleATWSAccordion = function(){
          $scope.ATWSExpanded = !$scope.ATWSExpanded;
        };
        $scope.toggleDamagesAccordion = function(){
          $scope.DamagesExpanded = !$scope.DamagesExpanded;
        };
        $scope.toggleAccessAccordion = function(){
          $scope.AccessExpanded = !$scope.AccessExpanded;
        };
        $scope.toggleValvesAccordion = function(){
          $scope.ValvesExpanded = !$scope.ValvesExpanded;
        };
        $scope.toggleOtherAccordion = function(){
          $scope.OtherExpanded = !$scope.OtherExpanded;
        };
        $scope.toggleGrandTotalAccordion = function(){
          $scope.GrandTotalExpanded = !$scope.GrandTotalExpanded;
        };

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

      }])

      .factory('TenantPayment', ['$firebaseObject', 'Ref', 'ROW',
        function($firebaseObject, Ref, ROW) {
          return function(tenantpaymentid) {

            var t = tenantpaymentid;

            var tenantpaymentRef = Ref.child('tracts').child(t);
            var tenantpaymentObj = $firebaseObject(tenantpaymentRef);

            return tenantpaymentObj;
          };
        }
      ])
      .controller('TenantPaymentCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
          '$routeParams', 'Tract', 'Tenant', 'TenantPayment', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'ROW', 'WeldImages',
        function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
            $routeParams, Tract, Tenant, TenantPayment, $window, $location, user, LOCATIONS, openPost, ROW, WeldImages) {

          new Tenant($routeParams.tenantid).$bindTo($scope, 'tenant');
          new Tract($routeParams.tractid).$bindTo($scope, 'tract');
          new TenantPayment($routeParams.tenantpaymentid).$bindTo($scope, 'record')

          $scope.togglePaymentsAccordion = function(){
            $scope.PaymentsExpanded = !$scope.PaymentsExpanded;
          };
          $scope.toggleROWAccordion = function(){
            $scope.ROWExpanded = !$scope.ROWExpanded;
          };
          $scope.toggleTWSAccordion = function(){
            $scope.TWSExpanded = !$scope.TWSExpanded;
          };
          $scope.toggleATWSAccordion = function(){
            $scope.ATWSExpanded = !$scope.ATWSExpanded;
          };
          $scope.toggleDamagesAccordion = function(){
            $scope.DamagesExpanded = !$scope.DamagesExpanded;
          };
          $scope.toggleAccessAccordion = function(){
            $scope.AccessExpanded = !$scope.AccessExpanded;
          };
          $scope.toggleOtherAccordion = function(){
            $scope.OtherExpanded = !$scope.OtherExpanded;
          };
          $scope.toggleGrandTotalAccordion = function(){
            $scope.GrandTotalExpanded = !$scope.GrandTotalExpanded;
          };

            var obj = $firebaseArray(Ref.child('tracts').child($routeParams.tractid).child('landowners'));
            obj.$loaded()
              .catch(alert)
              .then(function() {
                var landownerKeys = [];
                var ownerInfoArray = [];
                var ownerNames = [];

                obj.forEach(function(x){
                  // var arr = Object.keys(x).map(function (key) { return x[key]; });
                  //              arr.forEach(function(z){
                  //                    ownerNames.push(z)
                  //                })

                    // var ownerRef = $firebaseObject(Ref.child('landowners').child(x));
                    //
                    //   ownerNames.push(ownerRef)
console.log(x.ownername)
if(x.inactive!==true){
landownerKeys.push(x.ownername);
}

});
landownerKeys.forEach(function(k){
  var key = $firebaseObject(Ref.child('landowners').child(k));
  key.$loaded().then(function(){
    ownerNames.push(key.name)
  })

})
$scope.landowners = ownerNames




    //JOIN function using extend
                    // Ref.child('tracts').child($routeParams.tractid).child('landowners').child(y).once('value', function(tractSnap){
                    //   Ref.child('landowners').child(tractSnap.key).once('value',function(ownerSnap){
                    //
                    //       ownerInfoArray.push(extend({}, tractSnap.val(), ownerSnap.val()) );
                    //   });
                    // });


          });
          Ref.child('tracts').once('value',function(snapshot) {
            var obj = $firebaseArray(Ref.child('tracts'));
                obj.$loaded()
                  .catch(alert)
                  .then(function() {
                    var tenantid = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('tenants').child($scope.tenant.$id));
                    tenantid.$bindTo($scope, "tenantdata");
                    tenantid.$loaded()
                    .catch(alert)
                    .then(function () {
                      $scope.tenantname = $scope.tenantdata.name;
                      $scope.street = $scope.tenantdata.street;
                      $scope.city = $scope.tenantdata.city;
                      $scope.state = $scope.tenantdata.state;
                      $scope.zip = $scope.tenantdata.zip;
                      $scope.taxid = $scope.tenantdata.taxid;
                      $scope.addPaymentTotals = function(a, b, c, d, e, f){
                        return Number(a)+Number(b)+Number(c)+Number(d)+Number(e)+Number(f);
                      };
                    $scope.tenantDetails = tenantid;

                    var paymentid = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('tenants').child($scope.tenant.$id).child('payments').child($scope.record.$id));
                    var activePaymentStatus = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('tenants').child($scope.tenant.$id).child('payments').child($scope.record.$id).child('inactive'));

                    paymentid.$bindTo($scope,"paymentdata");
                    paymentid.$loaded().catch(alert).then(function () {
                        $scope.addNewPayment = function() {
                          var p = Ref.child('tracts').child($scope.tract.$id).child('tenants').child($scope.tenant.$id).child('payments').push();
                          $location.path('/tracts/'+$scope.tract.$id+'/tenants/'+$scope.tenant.$id+'/payments/'+p.key)
                        };

                        //get total acres
                        $scope.getAcres = function(width, length){
                          if(width===null||typeof(width)==='undefined'||width===''||isNaN(width)||length===null||typeof(length)==='undefined'||length===''||isNaN(length)){
                               return ''}else{
                           return ((width*length)/43560)
                           }
                         }
                        //get total rods
                        $scope.getRods = function(length){
                        return (length/16.5)
                        }
                        //get offer per rod
                        $scope.getRodOffer  = function(perAcreOffer,acres,rods){
                        return ((perAcreOffer*acres)/rods)
                        }
                        //get subtotal
                        $scope.getSubTotal  = function(perAcreOffer,acres){
                          if(perAcreOffer===null||typeof(perAcreOffer)==='undefined'||perAcreOffer===''||isNaN(perAcreOffer)||acres===null||typeof(acres)==='undefined'||acres===''||isNaN(acres)){
                               return ''}else{
                          return (perAcreOffer*acres)
                           }
                          }
                        //get damages per acre
                        $scope.getDamageCost  = function(price, units){
                          if(price===null||typeof(price)==='undefined'||price===''||isNaN(price)||units===null||typeof(units)==='undefined'||units===''||isNaN(units)){
                               return ''}else{
                           return (price*units)
                           }
                        }
                        //get 1st Year Valuation
                        $scope.yearOneCost  = function(pricePerAcre,totalAcres){
                          if(pricePerAcre===null||typeof(pricePerAcre)==='undefined'||pricePerAcre===''||isNaN(pricePerAcre)){
                            return ''}else{
                        return (pricePerAcre*totalAcres*1.0)
                        }
                      }
                      //get 2nd Year Valuation
                    $scope.yearTwoCost  = function(pricePerAcre,totalAcres){
                      if(pricePerAcre===null||typeof(pricePerAcre)==='undefined'||pricePerAcre===''||isNaN(pricePerAcre)){
                        return ''}else{
                    return (pricePerAcre*totalAcres*.75)
                    }
                      }
                    //get 3rd Year Valuation
                    $scope.yearThreeCost  = function(pricePerAcre,totalAcres){
                      if(pricePerAcre===null||typeof(pricePerAcre)==='undefined'||pricePerAcre===''||isNaN(pricePerAcre)){
                        return ''}else{
                    return (pricePerAcre*totalAcres*.50)
                    }
                  };
                    //get total Damage Valuation
                    $scope.extendedDamageCost = function(yearOne, yearTwo, yearThree){
                    return (Number(yearOne)+Number(yearTwo)+Number(yearThree))
                    }
                  //get Grand Total
                    $scope.getGrandTotal = function(){
                    // var totalAmount = $scope.paymentdata.rowcost+$scope.paymentdata.temporaryworkspacecost+$scope.paymentdata.additionalworkspacecost+$scope.paymentdata.accesscost+$scope.paymentdata.damagescost+$scope.paymentdata.othercost;
                    var damagesRef = $scope.paymentdata.damagescost;
                    var otherRef = $scope.paymentdata.othercost;

                    if(damagesRef!==null&&damagesRef!==''&&typeof(damagesRef)!=='undefined'){
                      var damages = damagesRef;
                    }else{
                      damages = 0;
                    };
                    if(otherRef!==null&&otherRef!==''&&typeof(otherRef)!=='undefined'){
                      var other = otherRef;
                    }else{
                      other = 0;
                    };
                    return Number(Number(damages.toFixed(2))+Number(other.toFixed(2)))
                  };

                    $scope.updateDamagesCost = function(){
                    var damagesYearOne = ((($scope.paymentdata.damageswidth*$scope.paymentdata.damageslength)/43560)*$scope.paymentdata.unitsperacre*$scope.paymentdata.unitprice);
                    $scope.paymentdata.damagescost = damagesYearOne+(damagesYearOne*.75)+(damagesYearOne*.50);
                    };
                    $scope.updateOtherCost = function(){
                    $scope.paymentdata.othercost= $scope.paymentdata.othercosttotal;
                                             }
                    $scope.inactiveStatus= activePaymentStatus.$value;

                    $scope.toggleInactive = function(){
                    $scope.inactiveStatus = !$scope.inactiveStatus;
                    if($scope.inactiveStatus){
                      $scope.paymentdata.inactive = true;
                      }else{
                      $scope.paymentdata.inactive = false;
                      }
                      };
                    });
    })
              }
                )
                $scope.exportData=(function() {
                  $timeout(function(){
                    var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FCalculation_Worksheet.xlsx?alt=media&token=90a3382d-7e8a-4b59-9d3e-32220612e333";
                    var req = new XMLHttpRequest();
                    req.open("GET", file, true);
                    req.responseType = "arraybuffer";
                    req.onreadystatechange = function () {
                        if (req.readyState === 4 && req.status === 200){
                            XlsxPopulate.fromDataAsync(req.response)
                                .then(function (workbook) {

                    workbook.sheet(0).cell("B7").value(
                    $scope.paymentdata.checkno
                    );
                    workbook.sheet(0).cell("B8").value(
                      $scope.paymentdata.checkdate
                    );
                    workbook.sheet(0).cell("B14").value(
                      $scope.tract.tract
                    );
                    var sectwprng;
                    if($scope.tract.section!==null&&typeof($scope.tract.section)!=='undefined'&&$scope.tract.section!==''&&
                        $scope.tract.township!==null&&typeof($scope.tract.township)!=='undefined'&&$scope.tract.township!==''&&
                        $scope.tract.range!==null&&$scope.tract.range!==''&&typeof($scope.tract.range)!=='undefined'){sectwprng = $scope.tract.section+'-'+$scope.tract.township+'-'+$scope.tract.range}
                        else{sectwprng = ''};

                    workbook.sheet(0).cell("B15").value(
                      sectwprng
                    );
                    workbook.sheet(0).cell("B16").value(
                      $scope.tract.legaldescription
                    );
                    workbook.sheet(0).cell("B17").value(
                      $scope.tract.county + ', OK'
                    );
                    workbook.sheet(0).cell("B16").value(
                      $scope.paymentdata.checkdate
                    );
                    if($scope.paymentdata.tenantpayeename!==null&&typeof($scope.paymentdata.tenantpayeename)!=='undefined'&&$scope.paymentdata.tenantpayeename!==''){
                      workbook.sheet(0).cell("B22").value(
                        $scope.paymentdata.tenantpayeename
                      )
                    }else{
                        workbook.sheet(0).cell("B22").value(
                          $scope.tenantname
                        );
                      };
                  if($scope.paymentdata.tenantpayeeaddress!==null&&typeof($scope.paymentdata.tenantpayeeaddress)!=='undefined'&&$scope.paymentdata.tenantpayeeaddress!==''){
                        workbook.sheet(0).cell("B23").value(
                          $scope.paymentdata.tenantpayeeaddress
                        )
                  }else{
                          workbook.sheet(0).cell("B23").value(
                            $scope.address
                          );
                        };
                        if($scope.paymentdata.tenantpayeecity!==null&&typeof($scope.paymentdata.tenantpayeecity)!=='undefined'&&$scope.paymentdata.tenantpayeecity!==''){
                              workbook.sheet(0).cell("B24").value(
                                $scope.paymentdata.tenantpayeecity
                              )
                        }else{
                                workbook.sheet(0).cell("B24").value(
                                  $scope.city
                                );
                              };
                      if($scope.paymentdata.tenantpayeestate!==null&&typeof($scope.paymentdata.tenantpayeestate)!=='undefined'&&$scope.paymentdata.tenantpayeestate!==''){
                                    workbook.sheet(0).cell("B25").value(
                                      $scope.paymentdata.tenantpayeestate
                                    )
                      }else{
                                      workbook.sheet(0).cell("B25").value(
                                        $scope.state
                                      );
                                    };
                      if($scope.paymentdata.tenantpayeezip!==null&&typeof($scope.paymentdata.tenantpayeezip)!=='undefined'&&$scope.paymentdata.tenantpayeezip!==''){
                                          workbook.sheet(0).cell("B26").value(
                                            $scope.paymentdata.tenantpayeezip
                                          )
                      }else{
                                            workbook.sheet(0).cell("B26").value(
                                              $scope.zip
                                            );
                                          };

                  workbook.sheet(1).cell("B32").value(
                    $scope.paymentdata.damageswidth
                  );
                  workbook.sheet(1).cell("E32").value(
                    $scope.paymentdata.damageslength
                  );
                  workbook.sheet(1).cell("B33").value(
                    $scope.paymentdata.damagestype
                  );
                  workbook.sheet(1).cell("E33").value(
                    $scope.paymentdata.croptype
                  );
                  workbook.sheet(1).cell("H33").value(
                    $scope.paymentdata.unitofmeasure
                  );
                  workbook.sheet(1).cell("B34").value(
                    $scope.paymentdata.unitsperacre
                  );
                  workbook.sheet(1).cell("E34").value(
                    $scope.paymentdata.unitprice
                  );

                  workbook.sheet(1).cell("B47").value(
                    $scope.paymentdata.otherdescription
                  );
                  workbook.sheet(1).cell("B48").value(
                    $scope.paymentdata.othercosttotal
                  );
                                            // var dataRange = (3 + landownersArray.length).toString();
                    // workbook.sheet(0).range("A3:I4").style("border","medium");
                    // workbook.sheet(0).range("A4:I"+dataRange).style("border",true);


                    workbook.outputAsync()
                        .then(function (blob) {
                            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                // If IE, you must uses a different method.
                                window.navigator.msSaveOrOpenBlob(blob, "Calculation_Worksheet.xlsx");
                            } else {
                                var url = window.URL.createObjectURL(blob);
                                var a = document.createElement("a");
                                document.body.appendChild(a);
                                a.href = url;
                                a.download = "Calculation_Worksheet.xlsx";
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                            }
                        });
                                });
                        }
                    };

                    req.send();
                  },1000);
                                  });
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

        }])

      .factory('Tenant', ['$firebaseObject', 'Ref', 'ROW',
        function($firebaseObject, Ref, ROW) {
          return function(tenantid) {

            var t = tenantid;

            var tenantRef = Ref.child('tracts').child(t);
            var tenantObj = $firebaseObject(tenantRef);

                  return tenantObj;
                };
            }
            ])

  .controller('TenantCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
          '$routeParams', 'Tract', 'Tenant', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'ROW', 'WeldImages',
        function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
            $routeParams, Tract, Tenant, $window, $location, user, LOCATIONS, openPost, ROW, WeldImages) {

          new Tenant($routeParams.tenantid).$bindTo($scope, 'tenant');
          new Tract($routeParams.tractid).$bindTo($scope, 'tract');

          //toggle Accordions
          $scope.toggleTenantDetailsAccordion = function(){
            $scope.TenantDetailsExpanded = !$scope.TenantDetailsExpanded;
          };
          $scope.togglePaymentsAccordion = function(){
            $scope.PaymentsExpanded = !$scope.PaymentsExpanded;
          };


          var inactiveRef = Ref.child('tracts').child($routeParams.tractid).child('tenants').child($routeParams.tenantid);
          var inactiveStatus = inactiveRef.child('inactive');
          $scope.inactiveStatus = $firebaseObject(inactiveStatus);

          Ref.child('tracts').once('value',function(snapshot) {
            var obj = $firebaseArray(Ref.child('tracts'));
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

                    var tenantid = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('tenants').child($scope.tenant.$id));
                    tenantid.$bindTo($scope, "tenantdata");

                    tenantid.$loaded()
                    .catch(alert)
                    .then(function () {

                    $scope.tenantDetails = tenantid;
                    $scope.addNewPayment = function() {
                      var p = Ref.child('tracts').child($scope.tract.$id).child('tenants').child($scope.tenant.$id).child('payments').push();
                      $location.path('/tracts/'+$scope.tract.$id+'/tenants/'+$scope.tenant.$id+'/payments/'+p.key)
                    };
                    $scope.checkInactive = function(id){
                      if (id === true){
                        return true
                      }
                      else {
                        return false
                      };
                    };
                    var filteredPayments = [];
                    var inactivePayments = [];

                    var payments = $firebaseArray(Ref.child('tracts').child($scope.tract.$id).child('tenants').child($scope.tenant.$id).child('payments').orderByChild('checkdate'));
                    payments.$loaded().catch(alert).then(function () {

                    payments.forEach(function(x){
                      if(x.inactive!==true){
                        filteredPayments.push(x)
                      };
                        inactivePayments.push(x)
                      });

                    $scope.payments = filteredPayments;
                    $scope.numberOfPayments = filteredPayments.length;


                      if (typeof($scope.inactivePaymentFilter) === true)  {
                        $scope.inactivePaymentFilter = true;
                      }

                      //create arrays for each payment category

                      var damagesArray = [];
                      var otherArray = [];
                      var totalArray = [];
                      //loop through payments and push category values to master arrays
                      filteredPayments.forEach(function(p){
                      if(p.damagescost!==null&&typeof(p.damagescost)!=='undefined'&&p.damagescost!==''){damagesArray.push(p.damagescost)}else{damagesArray.push(0)};
                        if(p.othercost!==null&&typeof(p.othercost)!=='undefined'&&p.othercost!==''){otherArray.push(p.othercost)}else{otherArray.push(0)};
                        })
                      //get sum of each payment category array
                      function getSum(total, num) {
                          return total + num;};
                      if(damagesArray.length>0){
                        var totalDamagesCost = damagesArray.reduce(getSum).toFixed(2)
                      }else{
                        totalDamagesCost=''};
                        if(otherArray.length>0){
                          var totalOtherCost = otherArray.reduce(getSum).toFixed(2)
                        }else{
                          totalOtherCost=''};
                      if(totalDamagesCost===''||totalOtherCost===''){
                        var grandTotalCost = ''
                      }else{
                        grandTotalCost=Number(totalDamagesCost)+Number(totalOtherCost);
                      };
                      //apply array totals to scope

                      $scope.totalDamagesCost = totalDamagesCost;
                      $scope.totalOtherCost = totalOtherCost;
                      $scope.paymentTotal = totalDamagesCost+totalOtherCost;
                      $scope.grandTotal = grandTotalCost;

                    $scope.toggleInactivePayment=function(){
                      $scope.inactivePaymentFilter = !$scope.inactivePaymentFilter;

                      if($scope.inactivePaymentFilter){
                        $scope.payments = inactivePayments;
                        $scope.numberOfPayments = inactivePayments.length;
                        //create arrays for each payment category
                        var damagesArray = [];
                        var otherArray = [];
                        var totalArray = [];
                        //loop through payments and push category values to master arrays
                        inactivePayments.forEach(function(p){

                          if(p.damagescost!==null&&typeof(p.damagescost)!=='undefined'&&p.damagescost!==''){damagesArray.push(p.damagescost)}else{damagesArray.push(0)};
                          if(p.othercost!==null&&typeof(p.othercost)!=='undefined'&&p.othercost!==''){otherArray.push(p.othercost)}else{otherArray.push(0)};
                        })
                        //get sum of each payment category array
                        function getSum(total, num) {
                            return total + num;};
                            if(damagesArray.length>0){
                              var totalDamagesCost = damagesArray.reduce(getSum).toFixed(2)
                            }else{
                              totalDamagesCost=''};
                              if(otherArray.length>0){
                                var totalOtherCost = otherArray.reduce(getSum).toFixed(2)
                              }else{
                                totalOtherCost=''};
                            if(totalDamagesCost===''||totalOtherCost===''){
                              var grandTotalCost = ''
                            }else{
                              grandTotalCost=Number(totalDamagesCost)+Number(totalOtherCost);
                            };
                        //apply array totals to scope
                        $scope.totalDamagesCost = totalDamagesCost;
                        $scope.totalOtherCost = totalOtherCost;
                        $scope.subTotal = function(){
                          return $scope.totalDamagesCost+$scope.totalOtherCost
                        }
                        $scope.grandTotal = grandTotalCost;
                      }else{
                        $scope.payments = filteredPayments;
                        $scope.numberOfPayments = filteredPayments.length;
                        //create arrays for each payment category
                        var damagesArray = [];
                        var otherArray = [];
                        var totalArray = [];
                        //loop through payments and push category values to master arrays
                        filteredPayments.forEach(function(p){
                          if(p.damagescost!==null&&typeof(p.damagescost)!=='undefined'&&p.damagescost!==''){damagesArray.push(p.damagescost)}else{damagesArray.push(0)};
                          if(p.othercost!==null&&typeof(p.othercost)!=='undefined'&&p.othercost!==''){otherArray.push(p.othercost)}else{otherArray.push(0)};
                        })
                        //get sum of each payment category array
                        function getSum(total, num) {
                            return total + num;};
                            if(damagesArray.length>0){
                              var totalDamagesCost = damagesArray.reduce(getSum).toFixed(2)
                            }else{
                              totalDamagesCost=''};
                              if(otherArray.length>0){
                                var totalOtherCost = otherArray.reduce(getSum).toFixed(2)
                              }else{
                                totalOtherCost=''};
                            if(totalDamagesCost===''||totalOtherCost===''){
                              var grandTotalCost = ''
                            }else{
                              grandTotalCost=Number(totalDamagesCost)+Number(totalOtherCost);
                            };
                        //apply array totals to scope

                        $scope.totalDamagesCost = totalDamagesCost;
                        $scope.totalOtherCost = totalOtherCost;
                        $scope.subTotal = function(){
                          return $scope.totalDamagesCost+$scope.totalOtherCost
                        }
                        $scope.grandTotal = grandTotalCost;
                    }

                    }
                });
    })
              }
                )

          })
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

    }
  ])

  .factory('Easement', ['$firebaseObject', 'Ref', 'ROW',
    function($firebaseObject, Ref, ROW) {
      return function(easementid) {

        var e = easementid;
        // if (landownerid === "new") {
        //   o = Ref.child('tracts').push().key;
        //
        // }
        var easementRef = Ref.child('tracts').child(e);
        var easementObj = $firebaseObject(easementRef);


        return easementObj;

      };


    }

  ])
  .controller('EasementCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
          '$routeParams', 'Tract', 'Easement', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'ROW', 'WeldImages',
        function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
            $routeParams, Tract, Easement, $window, $location, user, LOCATIONS, openPost, ROW, WeldImages) {

          new Easement($routeParams.easementid).$bindTo($scope, 'easement');
          new Tract($routeParams.tractid).$bindTo($scope, 'tract');

          //toggle Accordions
          $scope.toggleEasementDetailsAccordion = function(){
            $scope.EasementDetailsExpanded = !$scope.EasementDetailsExpanded;
          };

          var inactiveRef = Ref.child('tracts').child($routeParams.tractid).child('easements').child($routeParams.easementid);
          var inactiveStatus = inactiveRef.child('inactive');
          $scope.inactiveStatus = $firebaseObject(inactiveStatus);

          Ref.child('tracts').once('value',function(snapshot) {
            var obj = $firebaseArray(Ref.child('tracts'));
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

                    var easementid = $firebaseObject(Ref.child('tracts').child($scope.tract.$id).child('easements').child($scope.easement.$id));
                    easementid.$bindTo($scope, "easementdata");

                    easementid.$loaded()
                    .catch(alert)
                    .then(function () {

                    $scope.easementDetails = easementid;


    })

              }
                )

          })


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
        isFirstDisabled: false
      };


    }
  ])

  .factory('ContactReport', ['$firebaseObject', 'Ref', 'ROW',
    function($firebaseObject, Ref, ROW) {
      return function(contactreportid) {

        var c = contactreportid;
        // if (landownerid === "new") {
        //   o = Ref.child('tracts').push().key;
        //
        // }
        var contactReportRef = Ref.child('contactreports').child(c);
        var contactReportObj = $firebaseObject(contactReportRef);


        return contactReportObj;

      };


    }

  ])

  .controller('ContactReportCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
          '$routeParams', 'Tract', 'ContactReport', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'ROW', 'WeldImages',
        function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
            $routeParams, Tract, ContactReport, $window, $location, user, LOCATIONS, openPost, ROW, WeldImages) {

          new ContactReport($routeParams.contactreportid).$bindTo($scope, 'report');
          new Tract($routeParams.tractid).$bindTo($scope, 'tract');

          //toggle Accordions
          $scope.toggleContactReportDetailsAccordion = function(){
            $scope.ContactReportDetailsExpanded = !$scope.ContactReportDetailsExpanded;
          };
          var personObj=[];

          var inactiveRef = Ref.child('contactreports').child($routeParams.tractid).child($routeParams.contactreportid);
          var inactiveStatus = inactiveRef.child('inactive');
          $scope.inactiveStatus = $firebaseObject(inactiveStatus);

          Ref.child('tracts').once('value',function(snapshot) {
            var obj = $firebaseArray(Ref.child('tracts'));
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
  //get landowners for drop-down list
var ownerArray = [];
  var tractOwnersRef = $firebaseArray(Ref.child('tracts').child($routeParams.tractid).child('landowners'));
  tractOwnersRef.$loaded()
  .catch(alert)
  .then(function(){

    tractOwnersRef.forEach(function(x){
      if(x.inactive!==true){
      var landownerInfo = $firebaseObject(Ref.child('landowners').child(x.ownername));
      landownerInfo.$loaded()
      .catch(alert)
      .then(function(){
          landownerInfo.persontype='Owner';
ownerArray.push(landownerInfo);
      })
}
      })

    });

var tenantRef = $firebaseArray(Ref.child('tracts').child($routeParams.tractid).child('tenants'));
tenantRef.$loaded()
.catch(alert)
.then(function(){
  tenantRef.forEach(function(y){
    y.persontype='Tenant';
    ownerArray.push(y);
  })
})
$scope.owners = ownerArray
  //end get landowners
                  var contactreport = $firebaseObject(Ref.child('contactreports').child($routeParams.tractid).child($routeParams.contactreportid));
                  contactreport.$bindTo($scope, "contactReportData");

                  contactreport.$loaded()
                  .catch(alert)
                  .then(function () {


$scope.contactReportDetails = contactreport;


})
                })

          Ref.child('agents').once('value',function(snapshot) {

            var obj = $firebaseArray(Ref.child('agents').orderByChild('department').equalTo('RIGHT-OF-WAY'));

            obj.$loaded()
              .catch(alert)
              .then(function() {
                $scope.fieldagents = obj;
          }
            )
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
      $scope.insertCurrentDate = function(field){
        $scope.contactReportData[field] = moment().format('MM/DD/YYYY');
      };
      $scope.insertCurrentTime = function(field){
        $scope.contactReportData[field] = moment().format('LT');
      };

      $scope.oneAtATime = true;
      $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
      };

$scope.printContactReport = function(){


var tractRef = $firebaseObject(Ref.child('tracts').child($routeParams.tractid));
tractRef.$loaded().catch(alert).then(function(){

  if(tractRef.tract!==null&&typeof(tractRef.tract)!=='undefined'&&tractRef.tract!==''){var tract = tractRef.tract}else{tract=''};
  if(tractRef.owner!==null&&typeof(tractRef.owner)!=='undefined'&&tractRef.owner!==''){var assessedowner = tractRef.owner}else{assessedowner=''};
  if(tractRef.state!==null&&typeof(tractRef.state)!=='undefined'&&tractRef.state!==''){var state = tractRef.state}else{state=''};
  if(tractRef.city!==null&&typeof(tractRef.city)!=='undefined'&&tractRef.city!==''){var city = tractRef.city}else{city=''};
  if(tractRef.county!==null&&typeof(tractRef.county)!=='undefined'&&tractRef.county!==''){var county = tractRef.county}else{county=''};

var contactReportRef = $firebaseObject(Ref.child('contactreports').child($routeParams.tractid).child($routeParams.contactreportid));
contactReportRef.$loaded().catch(alert).then(function(){

  if(contactReportRef.fieldoffice!==null&&typeof(contactReportRef.fieldoffice)!=='undefined'&&contactReportRef.fieldoffice!==''){var fieldoffice = contactReportRef.fieldoffice.toUpperCase()}else{fieldoffice=''};
  if(contactReportRef.remarks!==null&&typeof(contactReportRef.remarks)!=='undefined'&&contactReportRef.remarks!==''){var remarks = contactReportRef.remarks.toUpperCase()}else{remarks=''};
  if(contactReportRef.subject!==null&&typeof(contactReportRef.subject)!=='undefined'&&contactReportRef.subject!==''){var subject = contactReportRef.subject.toUpperCase()}else{subject=''};
  if(contactReportRef.contactdate!==null&&typeof(contactReportRef.contactdate)!=='undefined'&&contactReportRef.contactdate!==''){var date = contactReportRef.contactdate}else{date=''};
  if(contactReportRef.contacttime!==null&&typeof(contactReportRef.contacttime)!=='undefined'&&contactReportRef.contacttime!==''){var time = contactReportRef.contacttime}else{time=''};
  if(contactReportRef.duration!==null&&typeof(contactReportRef.duration)!=='undefined'&&contactReportRef.duration!==''){var duration = contactReportRef.duration+' MINUTES'}else{duration=''};
  if(contactReportRef.result!==null&&typeof(contactReportRef.result)!=='undefined'&&contactReportRef.result!==''){var result = contactReportRef.result}else{result=''};
  if(contactReportRef.method!==null&&typeof(contactReportRef.method)!=='undefined'&&contactReportRef.method!==''){var method = contactReportRef.method}else{method=''};
  if (contactReportRef.result === 'SUCCESSFUL'){var successful = 'Checked'}
    else {successful = 'Unchecked'};
  if (contactReportRef.result === 'UNSUCCESSFUL'){var unsuccessful = 'Checked'}
    else {unsuccessful = 'Unchecked'};
  if (contactReportRef.method === 'PHONE'){var byphone = 'Checked'}
    else {byphone = 'Unchecked'};
  if (contactReportRef.method === 'IN PERSON'){var inperson = 'Checked'}
    else {inperson = 'Unchecked'};
  if (contactReportRef.location === 'PHONE'){var locationPhone = 'Checked'}
    else {locationPhone = 'Unchecked'};
  if (contactReportRef.location === 'ON-SITE'){var locationOnSite = 'Checked'}
    else {locationOnSite = 'Unchecked'};
  if (contactReportRef.location === 'RESIDENCE'){var locationResidence = 'Checked'}
    else {locationResidence = 'Unchecked'};
  if (contactReportRef.location === 'OFFICE'){var locationOffice = 'Checked'}
    else {locationOffice = 'Unchecked'};
  if (contactReportRef.location === 'OTHER'){var locationOther = 'Checked'}
    else {locationOther = 'Unchecked'};
  if (contactReportRef.phase === 'SURVEY'){var phaseSurvey = 'Checked'}
    else {phaseSurvey = 'Unchecked'};
  if (contactReportRef.phase === 'ACQUISITION'){var phaseAcquisition = 'Checked'}
    else {phaseAcquisition = 'Unchecked'};
  if (contactReportRef.phase === 'CONSTRUCTION'){var phaseConstruction = 'Checked'}
    else {phaseConstruction = 'Unchecked'};
  if (contactReportRef.phase === 'POST-CONSTRUCTION'){var phasePostConstruction = 'Checked'}
    else {phasePostConstruction = 'Unchecked'};
  if (contactReportRef.phase === 'DIGOUT'){var phaseDigout = 'Checked'}
    else {phaseDigout = 'Unchecked'};
  if (contactReportRef.phase === 'MAINTENANCE'){var phaseMaintenance = 'Checked'}
    else {phaseMaintenance = 'Unchecked'};
  if (contactReportRef.phase === 'TESTING'){var phaseTesting = 'Checked'}
    else {phaseTesting = 'Unchecked'};
  if (contactReportRef.phase === 'CP'){var phaseCP = 'Checked'}
    else {phaseCP = 'Unchecked'};
  if (contactReportRef.phase === 'OTHER'){var phaseOther = 'Checked'}
    else {phaseOther = 'Unchecked'};
  if(contactReportRef.alsopresent!==null&&typeof(contactReportRef.alsopresent)!=='undefined'&&contactReportRef.alsopresent!==''){var alsopresent = contactReportRef.alsopresent.toUpperCase()}else{alsopresent=''};
  if(contactReportRef.rowagent!==null&&typeof(contactReportRef.rowagent)!=='undefined'&&contactReportRef.rowagent!==''){var rowagent = contactReportRef.rowagent.toUpperCase()}else{rowagent=''};
  if(contactReportRef.contactperson!==null&&typeof(contactReportRef.contactperson)!=='undefined'&&contactReportRef.contactperson!==''){var contacted = contactReportRef.contactperson.toUpperCase()}else{contacted=''};

if($scope.contactReportData.contactperson!==null&&typeof($scope.contactReportData.contactperson)!=='undefined'){
  var contactTenantRef=$firebaseArray(Ref.child('tracts').child($routeParams.tractid).child('tenants').child($scope.contactReportData.contactperson));
  var contactOwnerRef=$firebaseArray(Ref.child('tracts').child($routeParams.tractid).child('landowners').orderByChild('ownername').equalTo($scope.contactReportData.contactperson));

$scope.selectedPerson='';
  contactOwnerRef.$loaded().catch(alert).then(function(){

    if (contactOwnerRef.length>0){
      var ownerInfo = $firebaseObject(Ref.child('landowners').child(contactOwnerRef[0].ownername));
  ownerInfo.$loaded().catch(alert).then(function(){
$scope.selectedPerson = ownerInfo.name;
$scope.address = ownerInfo.address;
$scope.city = ownerInfo.city;
$scope.state = ownerInfo.state;
$scope.zip = ownerInfo.zip;
if(ownerInfo.phone1!==null&&typeof(ownerInfo.phone1)!=='undefined'){var phone1=ownerInfo.phone1}else{
  phone1=''};
$scope.phone1 = phone1;
if(ownerInfo.phone2!==null&&typeof(ownerInfo.phone2)!=='undefined'){var phone2=ownerInfo.phone2}else{
  phone2=''};
$scope.phone2 = phone2;
if(ownerInfo.email!==null&&typeof(ownerInfo.email)!=='undefined'){var email=ownerInfo.email}else{
  email=''};
$scope.email = email;

$scope.personType = 'Owner';
  })

};
  contactTenantRef.$loaded().catch(alert).then(function(){

    if(contactTenantRef.length>0){
      contactTenantRef.forEach(function(x){
        if (x.$id==='name'){$scope.selectedPerson=x.$value};
        if (x.$id==='street'){$scope.address = x.$value};
        if (x.$id==='city'){$scope.city = x.$value};
        if (x.$id==='state'){$scope.state = x.$value};
        if (x.$id==='zip'){$scope.zip = x.$value};
        if (x.$id==='phone1'){$scope.phone1 = x.$value};
        if (x.$id==='phone2'){$scope.phone2 = x.$value};
        if (x.$id==='email'){$scope.email = x.$value};
        $scope.personType = 'Tenant';
      })
      console.log($scope.personType)

  }

if($scope.personType==='Tenant'){var isTenant="Checked"}else{
  isTenant="Unchecked"
};
if($scope.personType==='Owner'){var isOwner="Checked"}else{
  isOwner="Unchecked"
};

    var dd = {
        content:[
          {table: {
            widths:['50%','50%'],
            body:[
            [{image:'logo',width:50,border:[false,false,false,false]},{text: '', alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
          ]
                  }
          },

          { text: [
                    {text:'CONTACT REPORT ',alignment: 'center', bold:true}
                  ]
                    , margin:[4,0,0,0]
          },
      '\n\n',

          {   table: {
            widths:['15%','15%', '20%','50%'],
            body: [
              [
              {text:'Tract Number:',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:tract, border:[false,false,false,true],alignment:'center', bold:false, fontSize:'11'},
              {text:'  Assessed Owner:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:assessedowner,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'}
            ]
          ]
              },

            alignment: 'center',

          },
          '\n',
          {   table: {
            widths:['7%','7%','10%','26%','15%','35%'],
            body: [
              [
              {text:'State:',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:state,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'  County:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:county,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'  Field Office:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:fieldoffice,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'}
            ]
          ]
              },
            alignment: 'center',
          },
          '\n',
          {   table: {
            widths:['10%','50%','7%','13%','7%','13%'],
            body: [
              [
              {text:'Subject:',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:subject,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'  Date:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:date,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'Time:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:time,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'}
            ]
          ]
              },
            alignment: 'center',
          },
          '\n','\n',
          {   table: {
            widths:['11%','10%','3%','15%','3%','16%','3%','22%','3%'],
            body: [
              [
              {text:'Phase:',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:'Survey:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: phaseSurvey, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Acquisition:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: phaseAcquisition, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Construction:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: phaseConstruction, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Post Construction:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: phasePostConstruction, width: 10, border:[false,false,false,true], alignment:'left'}
            ]
          ]
              },
            alignment: 'center',
          },

          {   table: {
            widths:['12%','10%','3%','17%','3%','15%','3%','10%','3%','15%','3%'],
            body: [
              [
              {text:'',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:'Digout:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: phaseDigout, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Maintenance:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: phaseMaintenance, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Testing:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: phaseTesting, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'CP:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: phaseCP, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Other:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: phaseOther, width: 10, border:[false,false,false,true], alignment:'left'}
              ]
          ]
              },
            alignment: 'center',
          },
          '\n','\n',
          {   table: {
            widths:['12%','10%','3%','15%','3%','17%','3%','13%','3%','13%','3%'],
            body: [
              [
              {text:'Location: ',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:' Phone:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: locationPhone, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'On-Site:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: locationOnSite, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Residence:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: locationResidence, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Office:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: locationOffice, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Other:',border:[false],alignment:'right',bold:false, fontSize:'11'},
              {image: locationOther, width: 10, border:[false,false,false,true], alignment:'left'}
            ]
          ]
              },
            alignment: 'center',
          },
          '\n','\n',

          {   table: {
            widths:['12%','18%','15%','3%','17%','3%','13%','3%','13%','3%'],
            body: [
              [
              {text:'Duration:',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:duration,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'Successful:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {image: successful, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Unsuccessful:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {image: unsuccessful, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'In Person:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {image: inperson, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'By Phone:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {image: byphone, width: 10, border:[false,false,false,true], alignment:'left'}
            ]
          ]
              },
            alignment: 'center',
          },
          '\n', '\n',
          {   table: {
            widths:['22%','43%','15%','3%','9%','3%'],
            body: [
              [
              {text:'Person Contacted:',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:$scope.selectedPerson, border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'Land Owner',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {image: isOwner, width: 10, border:[false,false,false,true], alignment:'left'},
              {text:'Tenant:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {image: isTenant, width: 10, border:[false,false,false,true], alignment:'left'},
            ]
          ]
              },
            alignment: 'center',
          },
          '\n',
          {   table: {
            widths:['10%','35%','5%','20%','10%','5%','5%','10%'],
            body: [
              [
              {text:'Address:',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:$scope.address,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'City:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:$scope.city,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'State:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:$scope.state,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'Zip:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:$scope.zip,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'}
            ]
          ]
              },
            alignment: 'center',
          },
          '\n',
          {   table: {
            widths:['10%','17%','15%','17%','10%','31%'],
            body: [
              [
              {text:'Phone 1:',border:[false],alignment:'left',bold:true, fontSize:'11'},
              {text:$scope.phone1,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'Phone 2:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:$scope.phone2,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
              {text:'E-Mail:',border:[false],alignment:'right',bold:true, fontSize:'11'},
              {text:$scope.email,border:[false,false,false,true],alignment:'left',bold:false, fontSize:'9'}

            ]
          ]
              },
            alignment: 'center',
          },
    '\n','\n',
    {   table: {
      widths:['15%','85%'],
      body: [
        [
        {text:'Also Present:',border:[false],alignment:'left',bold:true, fontSize:'11'},
        {text:alsopresent,border:[false,false,false,true],alignment:'left',bold:false, fontSize:'11'}

      ]
    ]
        },

      alignment: 'center',

    },
    '\n',

    {   table: {
      widths:['20%','80%'],
      body: [
        [
        {text:'Right-of-Way Agent:',border:[false],alignment:'left',bold:true, fontSize:'11'},
        {text:rowagent,border:[false,false,false,true],alignment:'left',bold:false, fontSize:'11'}

      ]
    ]
        },

      alignment: 'center',

    },
        '\n','\n',
    {   table: {
      widths:['30%','65%'],
      body: [
        [{text:'REMARKS:',bold: true, alignment: 'left',border:[false]},{text: '', alignment:'left', bold: true, border:[false]}]
      ]
    },
      alignment: 'center',
    },

    {
          table: {
            widths:[-5,'100%'],
            body: [

              [
                {text:' ', color:'white',border:[false]},
                {
                rowSpan: 10,
                border: [true,true,true,true],
                text: remarks
                }
              ],

              [{text:' ',color:'white', border:[false]}],
              [{text:' ', color:'white', border: [false]}],
              [{text:' ', color:'white', border: [false]}],
              [{text:' ', color:'white', border: [false]}],
              [{text:' ', color:'white', border: [false]}],
              [{text:' ', color:'white', border: [false]}],
              [{text:' ', color:'white', border: [false]}],
              [{text:' ', color:'white', border: [false]}],
              [{text:' ', color:'white', border: [false]}],


            ]
          }
    }


        ],
    pageMargins: [40,15,40,25],

    images:{
        logo:'data:image/png;base64,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',
        Unchecked:'data:image/png;base64,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',
      Checked:'data:image/png;base64,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',

    }
            };


            // pdfMake.createPdf(dd).download('surveypermissionform.pdf');
            pdfMake.createPdf(dd).download('Contact Report.pdf');
});

});

}else{
  var dd = {
      content:[
        {table: {
          widths:['50%','50%'],
          body:[
          [{image:'logo',width:50,border:[false,false,false,false]},{text: '', alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
        ]
                }
        },

        { text: [
                  {text:'CONTACT REPORT ',alignment: 'center', bold:true}
                ]
                  , margin:[4,0,0,0]
        },
    '\n\n',

        {   table: {
          widths:['15%','15%', '20%','50%'],
          body: [
            [
            {text:'Tract Number:',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:tract, border:[false,false,false,true],alignment:'center', bold:false, fontSize:'11'},
            {text:'  Assessed Owner:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:assessedowner,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'}
          ]
        ]
            },

          alignment: 'center',

        },
        '\n',
        {   table: {
          widths:['7%','7%','10%','26%','15%','35%'],
          body: [
            [
            {text:'State:',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:state,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'  County:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:county,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'  Field Office:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:fieldoffice,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'}
          ]
        ]
            },
          alignment: 'center',
        },
        '\n',
        {   table: {
          widths:['10%','50%','7%','13%','7%','13%'],
          body: [
            [
            {text:'Subject:',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:subject,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'  Date:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:date,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'Time:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:time,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'}
          ]
        ]
            },
          alignment: 'center',
        },
        '\n','\n',
        {   table: {
          widths:['11%','10%','3%','15%','3%','16%','3%','22%','3%'],
          body: [
            [
            {text:'Phase:',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:'Survey:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: phaseSurvey, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Acquisition:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: phaseAcquisition, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Construction:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: phaseConstruction, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Post Construction:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: phasePostConstruction, width: 10, border:[false,false,false,true], alignment:'left'}
          ]
        ]
            },
          alignment: 'center',
        },

        {   table: {
          widths:['12%','10%','3%','17%','3%','15%','3%','10%','3%','15%','3%'],
          body: [
            [
            {text:'',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:'Digout:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: phaseDigout, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Maintenance:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: phaseMaintenance, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Testing:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: phaseTesting, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'CP:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: phaseCP, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Other:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: phaseOther, width: 10, border:[false,false,false,true], alignment:'left'}
            ]
        ]
            },
          alignment: 'center',
        },
        '\n','\n',
        {   table: {
          widths:['12%','10%','3%','15%','3%','17%','3%','13%','3%','13%','3%'],
          body: [
            [
            {text:'Location: ',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:' Phone:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: locationPhone, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'On-Site:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: locationOnSite, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Residence:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: locationResidence, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Office:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: locationOffice, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Other:',border:[false],alignment:'right',bold:false, fontSize:'11'},
            {image: locationOther, width: 10, border:[false,false,false,true], alignment:'left'}
          ]
        ]
            },
          alignment: 'center',
        },
        '\n','\n',

        {   table: {
          widths:['12%','18%','15%','3%','17%','3%','13%','3%','13%','3%'],
          body: [
            [
            {text:'Duration:',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:duration,border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'Successful:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {image: successful, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Unsuccessful:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {image: unsuccessful, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'In Person:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {image: inperson, width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'By Phone:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {image: byphone, width: 10, border:[false,false,false,true], alignment:'left'}
          ]
        ]
            },
          alignment: 'center',
        },
        '\n', '\n',
        {   table: {
          widths:['22%','43%','15%','3%','9%','3%'],
          body: [
            [
            {text:'Person Contacted:',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:'', border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'Land Owner',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {image: 'Unchecked', width: 10, border:[false,false,false,true], alignment:'left'},
            {text:'Tenant:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {image: 'Unchecked', width: 10, border:[false,false,false,true], alignment:'left'},
          ]
        ]
            },
          alignment: 'center',
        },
        '\n',
        {   table: {
          widths:['10%','35%','5%','20%','10%','5%','5%','10%'],
          body: [
            [
            {text:'Address:',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:'',border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'City:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:'',border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'State:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:'',border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'Zip:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:'',border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'}
          ]
        ]
            },
          alignment: 'center',
        },
        '\n',
        {   table: {
          widths:['10%','17%','15%','17%','10%','31%'],
          body: [
            [
            {text:'Phone 1:',border:[false],alignment:'left',bold:true, fontSize:'11'},
            {text:'',border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'Phone 2:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:'',border:[false,false,false,true],alignment:'center',bold:false, fontSize:'11'},
            {text:'E-Mail:',border:[false],alignment:'right',bold:true, fontSize:'11'},
            {text:'',border:[false,false,false,true],alignment:'left',bold:false, fontSize:'9'}

          ]
        ]
            },
          alignment: 'center',
        },
  '\n','\n',
  {   table: {
    widths:['15%','85%'],
    body: [
      [
      {text:'Also Present:',border:[false],alignment:'left',bold:true, fontSize:'11'},
      {text:alsopresent,border:[false,false,false,true],alignment:'left',bold:false, fontSize:'11'}

    ]
  ]
      },

    alignment: 'center',

  },
  '\n',

  {   table: {
    widths:['20%','80%'],
    body: [
      [
      {text:'Right-of-Way Agent:',border:[false],alignment:'left',bold:true, fontSize:'11'},
      {text:rowagent,border:[false,false,false,true],alignment:'left',bold:false, fontSize:'11'}

    ]
  ]
      },

    alignment: 'center',

  },
      '\n','\n',
  {   table: {
    widths:['30%','65%'],
    body: [
      [{text:'REMARKS:',bold: true, alignment: 'left',border:[false]},{text: '', alignment:'left', bold: true, border:[false]}]
    ]
  },
    alignment: 'center',
  },

  {
        table: {
          widths:[-5,'100%'],
          body: [

            [
              {text:'0', color:'white',border:[false]},
              {
              rowSpan: 10,
              border: [true,true,true,true],
              text: remarks
              }
            ],

            [{text:'0',color:'white', border:[false]}],
            [{text:'0', color:'white', border: [false]}],
            [{text:'0', color:'white', border: [false]}],
            [{text:'0', color:'white', border: [false]}],
            [{text:'0', color:'white', border: [false]}],
            [{text:'0', color:'white', border: [false]}],
            [{text:'0', color:'white', border: [false]}],
            [{text:'0', color:'white', border: [false]}],
            [{text:'0', color:'white', border: [false]}],


          ]
        }
  }


      ],
  pageMargins: [40,15,40,25],

  images:{
      logo:'data:image/png;base64,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',
      Unchecked:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAIVAQMAAAATfgmBAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAACHDwAAjA8AAP1SAACBQAAAfXkAAOmLAAA85QAAGcxzPIV3AAAACXBIWXMAAC4hAAAuIQEHW/z/AAAK0HpUWHRSYXcgcHJvZmlsZSB0eXBlIGljYwAAeNqteEsOKLmN5D5P4SME/+RxKIoCGhhgBnP/xSzee1Vlu7psD1rLEIOkqCCVyO///N///f7rf+33t7/97W9Cqh8AYDR1vHz9gQkA4Nc3NNhYQ5lhaWXNQMwCYAAFwAEhAPicXEICek3UTfFzaampMEJ+uMJfrOfXPwD0C7jCV9PA+Even67vPzMncgkEx4/MyX7iIp+rW4jLj438eTSfiNDAL8L75Uid/fyGM/QX/gX/KOOPDcrfCPFHnOd3R3/E9bcAn6tfX/8Z4VexA65+XX/h8xPPDA9z+4mL/gyQ/oV7uUX82Lg/Caw+YX69fuDv90yvm1P8KIViftl/oW4u/sNQ5VdVJ9jU+Ceg8oOQGI8/xz//bwihbpHxu67EXyAq2MvDM5TB6cLFEJL6pCQZmm4RPm6hoXwNTi5+nIJdGSr+/AacfKMA4O9u+3cdEf9SMP/UtLiQlLg4X2Fe+U22/6Csn8zvP6f+jyj79/VbE//R0RMj/N5zRD7zj4b/yuHfZeTvB1Py/WgiKfyZQ+cqADiRBgCUt78/M2T90QF4P3rv+Lx/vKWfyfuvcfN5hoYGpPnxi4iI4PVyc+H9Tar/fFu/ufjh4fvPXfwP3dqfH5H3+5XgP6uIoerm7hTmE8r4JVkXfz7+woIZIQGnz8WNwfdfTWfevw75/fsx/zrkv6zRf1OTMXZzdwt283X53Bj2c7h5+Xr87PV19Qr18ufL8PL9q67804z+Od6/Dvf9e/H+P3T0dzP8h4al9S1Aao8XIMwjBSB7ZwAoCc4HQGxqf7H+ufd0UObAr8fQgt7G3z0Cf8jo3xtinL9eSg7x8vjDPFIxNmW4hAWH/x3xt9EPA9AAHkAKUAG0AAvACfD9AGFAApDzg6kGaAP6AFPACrAFXABPwC8QDEQAMUASkP4BeX586pQB1UA9oBXoAnqBw8AJ4AwwBIwDc4AL4BpwD7D4gDVgD/AAPAfeAYFACBAuiAREBaIHYgPxAQmDJEGyIDWQzgcyBlmBHCAPkC8oDBQDSgHlARWDqkFNoC7QIdAp0BBoCnTpA90CLYG2QI9Br8EQMAZMCqYLZgfzA0uClcB6wKZgu2APcNAHjgangnPBleBmcA/4OHgIPAd8DbwA7wE/gwAQHAg5hAnC94NIQlQg+iDWEHdIMCQWkg0phzRDeiGnIROQK5AFZAfyCgr/oCRQBpQvVA5UE2oGdYEGQWOhOdBqaCf0OHQUegW6BH2Avv1guDAaGB+YNEwLZgnzgEXA0mHlsHbYMdgY7BpsDfYcDoeTf3AOuARcE24F94bHgefA68L7wQfwS/AV+DMEAkGF4IOQi9D3IZwQoYh0RBWiB3Ee4jJiDfESiYOkhxRGqiOtkb7IZGQ5svtDnkVeRm4g30ERUGwoaZQ+lCsqCpUP1Yo6jZqHWkO9gyZCc3xouWhTtDc6CV2J7kWPoe+gn+Dg4DDjSOEY4XjhJHAqcQ5wJj+cJZxXGGIMN0YFY4MJw+RiOjADzC3ME1xcXHZcBa41bihu7ofbhTuCexf3JZYEy4vVwrpi42HrYI9jL2N38VB4bHhKeLZ40R9eOd4RvHl4OwQUgZ2gQnAixBLqEE4RbhCeEZEQCRHpI/JLlPMRdRNNEW0SI4jZidWIXYlTiVuIR4hXSCAkLCQqJC4kKSStJGMfyRopnJSDVIvUmzQPaV/SWdIHMmIyUTJzskiyOmTnki3IIeTsH7kWuQ95PvLD5NfJX1PQpVCicKPIouiluEzxgpIOpYLSjTKbst9HeY3y9Y+Ro0blh6qI6gTVvdRQam5qI+oI6lrqMeodOqR05NBx+ehk0zlM5zYNmIabxpgmDk0LzQzNM7q0dDXoBuhW0R2hu0NLTqv4aL1pS2nP0m7RI6EnS8+LXim98+htM8gYSgwfRiVjlPHARMOk+TGFMTUxzTK9w8zBbMaczNyP+V4WNIskiztLKcswywMrPVa9rDEfax/W22woNkk2T7YKtgm2F+wc7BbsGewn2Dc5KDm0OKI5+nDc+ThxOeVxBnE2c17lgnNJcvnhqst1wQ3mFuP25K7DPY8PmI84H6+PT10+l3hgPFI8vjzNPDf4Yvgq8Q3n24fvEi85rw5vMu8J3l1+rB8/a35F/Cb4vRWICXwErYJ7hIiFtIWShU4LPRbmFnYRriN8VQT3E1EXiSdyUuSRKB9RN9Fa0ZtiJGJ6xTLEhsXeFZcQDxbvFd+SYP0kHBI1EjckSSUNkjmSk1IwKWWpeFJnpF5Ji0uHSh+W3ieHrxw/n5xuOZsyHDJuMq0yK3KZ5TrJbZK7kGXIOmQbsgt5TPKc5DXLW/4ULApXRbtiQ4lLyVupR2lXWaAcrHxM+YWKtEpclYEqRFVDNftTnVUjVjNTq1a7q86s7qHeR/1BQ0wjjsZAE6apR7NI84YWXS2XT6tL60FbQjuu9qgejB4TPdV6lnW4dYJ1TusF69XWW6L3ji6bru+ne+LHY6mlr0TfvQYOQ5DhHCO4kcGojtG6sZBxjPGECYmJPZPuz+S5qbJpPtN7zDjNwsyGzfHMbcy7zF9YqFoUWyws+VnGtZxjRf1ZeVmdtEZYm1u3Wz+zo2anzM6ajZhNus11uxx2I+1O2VLb+tie+9nDs+dk74gD5rBwdDveOOlzanZ65qzlXOP84KLiUuGyx1XhWvq5brnJdSt223CX617svukh16PEY8tTnme5546Xile11yNvTe96n/cLP/r8dPh5z8fCp59fpF+H31O+xL5+fEf90fqL9HcpwCeQHlh8QdJBZUEPwXqC20NAIXZDToaS/vi3NRPGGZYWthQuG14n/GWE+RdxJJIo0jdyJoo7KitqI1o9ui0ONI5LnOEYppikmKW4SnGbYkFfrHPscDyWeKnx1hIaic4kdJKfpLnJguTi5KcpFimnU+mmJlJXvjSNtD7p2PTg9BsZcjLqZUIzvTJns0SyqrLeZrtmT+cR5CnP8+bLccmZziuUtzLve7nuubP5xPPVFuAF38L1InlFncVExdHFKyV6v5LjpYzS7NKnZfbKpspFy+tVoCvCKhaVOpUnq1irClVvqj2rr311lOv0q6Gpyap5Ude17uVaRW1vPbr18tR73fBq3GzSaDrezN5c/rXAW8Jb1lvNWyfaJNu62qnb87S/2+Hbseg07hztkujq6qbpzvf1AfcJ67PVY9Nz0Ve178levr1N/cj75TkADsIOtg85Dl0/rOfw8HdE8kjvUbajNcdIjmUfBx2POv5wwvPE4qTVyUuntE8Nn5Zz+tg5vN85HWeYztQ5l+zcfGfRZ1PPvnde9HnPBoHBzpDH0MqwveF7RixHrn6jRqOzY3rGJsfVx0cmlCbOm5Q7eWZKeurUtOT0iTnic47PiM0c++aKzT02Kz57fJ7EvJMXUhenL8lcOntZ3uWhK6pXxq9qXZ1zTffape+62fWbN2xuLG663ty85XPr0e3w2+/ck7gDu5N9L+He8rs0d5vv4/ru67cQX5y7pLo0s2yyfM+Ky8qe1ZDVN2up67jr5Rv0Nro2hTfPfFvqWxfbdrbX9gT2vLOTvpdob80u5+7RfYp9Mw+WD2uPgh+99zjne0L1pOOp6NPhZ4Znd5/7ff7Oi+yXVC87X0m+mnht8XrjnYg3iDeV37tc755+q+ftnff8vvfe9/8AG3f2urpXz04AAAADUExURQAAAKd6PdoAAAABdFJOUwBA5thmAAAAAWJLR0QAiAUdSAAAAEtJREFUGBntwQENAAAAwqD3T20ON6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATgzSSQABDRedRwAAAAt0RVh0VGl0bGUAQmxhbmvH9KIsAAAAAElFTkSuQmCC',
    Checked:'data:image/png;base64,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',

  }
          };
  // pdfMake.createPdf(dd).download('surveypermissionform.pdf');
  pdfMake.createPdf(dd).download('Contact Report.pdf');





};

})

})

};//end of printReport function

});

    }
  ])
