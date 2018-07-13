'use strict';
/**
 * @ngdoc function
 * @name mts.fieldbook.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */

angular.module('mts.fieldbook')
  .controller('WeldsCtrl', function ($scope, $rootScope, $location, Ref, $firebaseArray, $timeout, LOCATIONS, WORKSPACE) {
    // synchronize a read-only, synchronized array of messages, limit to most recent 10
    var weldsRefFiltered =  Ref.child(WORKSPACE).child('welds').orderByChild('isDelivered').startAt(null).endAt(false);
    var weldsRef =  Ref.child(WORKSPACE).child('welds');
    $scope.welds = $firebaseArray(weldsRefFiltered);
    // display any errors
    $scope.welds.$loaded().catch(alert);

    $scope.orderByField = 'stationing';
    $scope.reverseSort = true;
    $scope.showFilters=false;

    $scope.local= {};
    $scope.local.locationslist = LOCATIONS;

    if (typeof($rootScope.weldSearch) === 'undefined' || $rootScope.weldSearch === null) {
      $rootScope.weldSearch = {};
    }
    if (typeof($rootScope.weldSearch.datePicker) === 'undefined' || $rootScope.weldSearch.datePicker === null) {
      $rootScope.weldSearch.datePicker = {};
      $rootScope.weldSearch.datePicker.date = {startDate: null, endDate: null};
    }
    if (typeof($rootScope.weldSearch.sectionFilter) === 'undefined' || $rootScope.weldSearch.sectionFilter === null) {
      $rootScope.weldSearch.sectionFilter = '';
    }
    if (typeof($rootScope.weldSearch.locationFilter) === 'undefined' || $rootScope.weldSearch.locationFilter === null) {
      $rootScope.weldSearch.locationFilter = '';
    }
    if (typeof($rootScope.weldSearch.auditedFilter) === 'undefined' || $rootScope.weldSearch.auditedFilter === null) {
      $rootScope.weldSearch.auditedFilter = false;
    }
    if (typeof($rootScope.weldSearch.deliveredFilter) === 'undefined' || $rootScope.weldSearch.deliveredFilter === null) {
      $rootScope.weldSearch.deliveredFilter = false;
    }

    $scope.toggleDelivered = function( criteria ) {

      $rootScope.weldSearch.deliveredFilter = !$rootScope.weldSearch.deliveredFilter;
      $scope.welds.$destroy();
      if ($rootScope.weldSearch.deliveredFilter) {
        $scope.welds = $firebaseArray(weldsRef);
      } else {
        $scope.welds = $firebaseArray(weldsRefFiltered);
      }

    }

    $scope.criteriaMatch = function( criteria ) {
      return function( weld ) {
        var criteriaSatisfied = (typeof(criteria) === 'undefined' || criteria === '' || (typeof(weld.weldno) !== 'undefined' ? weld.weldno.toString().indexOf(criteria) > -1 : false) || (typeof(weld.jointus) !== 'undefined' ? weld.jointus.toString().indexOf(criteria) > -1 : false) || (typeof(weld.jointds) !== 'undefined' ? weld.jointds.toString().indexOf(criteria) > -1 : false) );
        var completeFilterSatisfied = true;
        var locationFilterSatisfied = true;
        var auditedFilterSatisfied = true;

        if ($rootScope.weldSearch.datePicker.date.startDate) {
          completeFilterSatisfied = false;
          if ( ($rootScope.weldSearch.sectionFilter === '' || $rootScope.weldSearch.sectionFilter === 'sect4date') &&  typeof(weld.sect4date) !== 'undefined' && $rootScope.weldSearch.datePicker.date.startDate <= Date.parse(weld.sect4date)  && $rootScope.weldSearch.datePicker.date.endDate >= Date.parse(weld.sect4date) ) {
            completeFilterSatisfied = true;
          }
          if ( ($rootScope.weldSearch.sectionFilter === '' || $rootScope.weldSearch.sectionFilter === 'sect5date') &&  typeof(weld.sect5date) !== 'undefined' && $rootScope.weldSearch.datePicker.date.startDate <= Date.parse(weld.sect5date)  && $rootScope.weldSearch.datePicker.date.endDate >= Date.parse(weld.sect5date) ) {
            completeFilterSatisfied = true;
          }
        }

        if ($rootScope.weldSearch.locationFilter !== '' &&  ((typeof(weld.location) !== 'undefined' && weld.location != $rootScope.weldSearch.locationFilter) || typeof(weld.location) === 'undefined')  ) {
          locationFilterSatisfied = false;
        }

        if (!$rootScope.weldSearch.auditedFilter && weld.auditstations && (weld.auditstations.station4 || weld.auditstations.station5 || weld.auditstations.station6 || weld.auditstations.station7 || weld.auditstations.station8 || weld.auditstations.station9)) {
          auditedFilterSatisfied = false;
        }


        return (criteriaSatisfied && completeFilterSatisfied && locationFilterSatisfied && auditedFilterSatisfied);
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

    $scope.filterComplete = function(scope) {
      var startDate = scope.model.startDate;
      var endDate = scope.model.endDate;

    }

    $scope.addNewWeld = function() {
      var r = Ref.child(WORKSPACE).child('welds').push().key;
      $location.path('/welds/' + r);
    }

    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }
  })
  .factory('Weld', ['$firebaseObject', 'Ref', 'WORKSPACE',
    function($firebaseObject, Ref, WORKSPACE) {
      return function(weldid) {
        // create a reference to the database where we will store our data

        // if (weldid === "new") {
        //   var weldRef = Ref.child(WORKSPACE).child('welds').push();

        // } else {

        //   var weldRef = Ref.child(WORKSPACE).child('welds').child(weldid);

        // }

        var w = weldid;
        if (weldid === "new") {
          w = Ref.child(WORKSPACE).child('welds').push().key;

        }
        var weldRef = Ref.child(WORKSPACE).child('welds').child(w);
        var weldObj = $firebaseObject(weldRef);

        weldObj.$loaded().then(function(){
          if ( (typeof weldObj.blastabrtype === 'undefined' || weldObj.blastabrtype === '') && (!weldObj.isSect4Complete) ) {
            weldObj.blastabrtype = 'BLACK BEAUTY'
          }
          if ( (typeof weldObj.blastabrsize === 'undefined' || weldObj.blastabrsize === '') && (!weldObj.isSect4Complete) ) {
            weldObj.blastabrsize = 'FINE'
          }
          if ( (typeof weldObj.coattype === 'undefined' || weldObj.coattype === '') && (!weldObj.isSect4Complete) ) {
            weldObj.coattype = 'SP-2888'
          }
          if ( (typeof weldObj.blastpreheatmethod === 'undefined' || weldObj.blastpreheatmethod === '') && (!weldObj.isSect4Complete) ) {
            weldObj.blastpreheatmethod = 'PROPANE TORCH'
          }

          if ( (typeof weldObj.coatapplicationmethod === 'undefined' || weldObj.coatapplicationmethod === '') && (!weldObj.isSect5Complete) ) {
            weldObj.coatapplicationmethod = 'Brush'
          }
          if ( (typeof weldObj.coatmixingratio === 'undefined' || weldObj.coatmixingratio === '') && (!weldObj.isSect5Complete) ) {
            weldObj.coatmixingratio = '3:1'
          }
          if ( (typeof weldObj.coatcomponentatemp === 'undefined' || weldObj.coatcomponentatemp === '') && (!weldObj.isSect5Complete) ) {
            weldObj.coatcomponentatemp = 'N/A'
          }
          if ( (typeof weldObj.coatcomponentapressure === 'undefined' || weldObj.coatcomponentapressure === '') && (!weldObj.isSect5Complete) ) {
            weldObj.coatcomponentapressure = 'N/A'
          }
          if ( (typeof weldObj.coatcomponentbtemp === 'undefined' || weldObj.coatcomponentbtemp === '') && (!weldObj.isSect5Complete) ) {
            weldObj.coatcomponentbtemp = 'N/A'
          }
          if ( (typeof weldObj.coatcomponentbpressure === 'undefined' || weldObj.coatcomponentbpressure === '') && (!weldObj.isSect5Complete) ) {
            weldObj.coatcomponentbpressure = 'N/A'
          }

          if ( (typeof weldObj.coatenvcheck === 'undefined' || weldObj.coatenvcheck === '') && (!weldObj.isSect5Complete) ) {
            weldObj.coatenvcheck = 'Tie-In'
          }
          if ( (typeof weldObj.blastenvcheck === 'undefined' || weldObj.blastenvcheck === '') && (!weldObj.isSect4Complete) ) {
            weldObj.blastenvcheck = 'Tie-In'
          }
          if ( (typeof weldObj.blasttestex === 'undefined' || weldObj.blasttestex === '') && (!weldObj.isSect4Complete) ) {
            weldObj.blasttestex = 'Tie-In'
          }




        });

        return weldObj;
      };
    }
  ])
  .factory('WeldImages', ['$firebaseArray', 'IMAGETYPES',
    function($firebaseArray, IMAGETYPES) {

      var WeldImages = $firebaseArray.$extend({
        getMissingImageTypes: function() {
          var uploadedTypes = [];
          var missingTypes = [];

          angular.forEach(this.$list, function(rec) {
            if ((typeof(rec.isDeleted) === 'undefined' || !rec.isDeleted) && typeof(rec.imageType) !== 'undefined' && uploadedTypes.indexOf(rec.imageType) == -1) {
              uploadedTypes.push(rec.imageType);
            }

          });

          for(var j = 0; j < IMAGETYPES.length; j++) {
            if (uploadedTypes.indexOf(IMAGETYPES[j]) == -1)
               missingTypes.push(IMAGETYPES[j]);

          }

          return missingTypes;
        }
      });

      return function(ref) {
        return new WeldImages(ref);
      }
    }
  ])
  .controller('WeldCtrl', ['$scope', '$rootScope', 'Ref', 'Storage', '$q', '$firebaseObject', '$firebaseArray', '$timeout',
      '$routeParams', 'Weld', '$window', '$location', 'user', 'LOCATIONS', 'openPost', 'WORKSPACE', 'WeldImages',
    function ($scope, $rootScope, Ref, Storage, $q, $firebaseObject, $firebaseArray, $timeout,
        $routeParams, Weld, $window, $location, user, LOCATIONS, openPost, WORKSPACE, WeldImages) {
      // synchronize a read-only, synchronized array of messages, limit to most recent 10
      //$scope.weldid = $routeParams.sleeveid;
      $scope.local={};
      $scope.blastweathertime = Date();
      $scope.local.duplicateweld = false;

      new Weld($routeParams.weldid).$bindTo($scope, 'weld').then(function(){

        $scope.$watch('weld', function(newValue, oldValue) {
          if (typeof($scope.weld.weldno) !== 'undefined' && typeof($scope.weld.createDateTime) === 'undefined')
            $scope.weld.createDateTime = moment(Date()).format('L LT');
        });

        $scope.$watch('weld.weldno', function(newValue, oldValue) {
          if (newValue !== '') {
            Ref.child(WORKSPACE).child('welds').orderByChild('weldno').equalTo(newValue).once("value", function(snap) {
              if (snap.exists()) {
                var welds = snap.val();
                var weldKeys = Object.keys(welds);
                if (weldKeys.length > 1) {
                  $timeout(function(){
                    $scope.local.duplicateweld = true;
                  },300);
                }
              } else {
                  $timeout(function(){
                    $scope.local.duplicateweld = false;
                  },300);
              }
            });
          }
        });

      });

      function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
      }

      $scope.datepickerOptions = {
        format: 'mm/dd/yyyy',
        autoclose: true,
        weekStart: 0,
        enableOnReadonly: false,
        todayBtn: 'linked',
        todayHighlight: true,
        keyboardNavigation: false
      };

      $scope.oneAtATime = true;
      $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
      };

      $scope.local = {};
      $scope.local.locationslist = LOCATIONS;

      $scope.local.sect4error = [];
      $scope.local.sect5error = [];

      //validation patterns
      $scope.local.validation = {onlyNumbers: /^\d+$/};

      var weldImagesReference = Ref.child(WORKSPACE).child('images').child($routeParams.weldid);
      $scope.local.weldImages = new WeldImages(weldImagesReference);

      $scope.verifToday = function( fields, idfield, currentVal ) {
        return function( verif ) {
          var daysRange = $rootScope.verificationsDaysRange;
          var days = ((typeof daysRange === 'undefined' || daysRange === null) ? 1 : daysRange) - 1;

          var criteriaSatisfied = false;
          if (verif[idfield] == currentVal) {
            return true;
          }
          angular.forEach(fields, function(item){
            var today = new Date().setHours(0,0,0,0);
            if ( typeof(verif[item]) !== 'undefined' && Date.parse(verif[item]) > (today - (86400000 * days) ))   {
              criteriaSatisfied = true;
            }
          });
          return criteriaSatisfied;
        };
      };


      $scope.calcDiamFromCirc = function(c) {
        return (c) ? c / Math.PI : 0;
      }

      var timeDiff = function(dt1, dt2, val, uom) {
        try {
          var t1 = moment(dt1, 'h:mm A');
          var t2 = moment(dt2, 'h:mm A');
          var diff = t2.diff(t1, uom);
          return (diff >= val && diff > 0);
        }
        catch(e){
        return false;}
      }

      $scope.insertMyName = function(field){
        $scope.weld[field] = $rootScope.user.name;
      }

      $scope.insertCurrentTime = function(field){
        $scope.weld[field] = moment().format('LT');
      }



      $scope.authorized = function(role){
        if ($rootScope.user && $rootScope.user.roles)
          return ($rootScope.user.roles.split(',').indexOf(role) !== -1);
        else
          return false;
      }
      $scope.authorizedOr = function(roles){
        var isAuthorised = false;
        if ($rootScope.user && $rootScope.user.roles) {
          for (var i=0; i < roles.length; i++){
            if ($rootScope.user.roles.split(',').indexOf(roles[i]) !== -1) {
              isAuthorised = true;
            }
          }
        }
        return isAuthorised;
      }

      $scope.openReport = function(report){
        var base = 'http://localhost:8888';
        if ($location.host() !== 'localhost') {
          var base = 'https://mts-apps.mertechserv.com';
        }

        var id = $routeParams.weldid;

        var workspaceImagesReference = Ref.child(WORKSPACE).child('images').child(id);
        var storageImagesReference = Storage.child(WORKSPACE).child('images').child(id);

        var workspaceImages = $firebaseArray(workspaceImagesReference);
        var imagesURL = [];


        function getDownloadUrls(fileObject, type) {

          var imageName = fileObject.name;
          if (typeof(imageName) === 'undefined' && typeof(type) === 'undefined') {
            imageName = 'thumbnails/w600xh600.png';
            type = 'thumb600';
          } else if (type === 'thumb600') {
            imageName = 'thumbnails/w600xh600.png';
          } else if (type === 'thumb200') {
            imageName = 'thumbnails/w200xh200.png';
          }

          return storageImagesReference.child(fileObject.$id).child(imageName).getDownloadURL().then(function(url) {
              imagesURL.push({id: fileObject.$id, url: url});
          }).catch(function(error) {
            //console.log(error);
            if (typeof(type) === 'undefined') {
              return getDownloadUrls(fileObject, 'thumb600');
            } else if (typeof(type) !== 'undefined' && type === 'thumb600') {
              return getDownloadUrls(fileObject, 'thumb200');
            }
          });
        }

        workspaceImages.$loaded().then(function(){
          $q.all(workspaceImages.map(function(val) {
                  if (typeof(val.isDeleted) === 'undefined' || !val.isDeleted) {
                      // Do something
                      return getDownloadUrls(val);  // Don't wait for anything
                  }
          }))
          .then(function(){
              openPost('POST', base + '/MTSInspect/' + report, {uid: user.uid, weldpk: $routeParams.weldid, imageURLs: imagesURL}, '_blank');
          })
          .catch(function(err) {
            console.log(imagesURL);
            openPost('POST', base + '/MTSInspect/' + report, {uid: user.uid, weldpk: $routeParams.weldid}, '_blank');
          });
        });


        //  $window.open(base + '/MTSInspect/' + report + ( (report.indexOf('?') < 0) ? '?' : ''  ) + 'weldpk=' + $routeParams.weldid + '&uid='+user.uid, '_blank');
      };

      $scope.fillDefaultDesc = function(obj, src, srcValue, dest, destValue) {
        if (obj[src] && obj[src] === srcValue && (!obj[dest] || obj[dest] === ''))
          obj[dest] = destValue;
      }

      $scope.completeSection = function(idx, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (idx === 4) {
          $scope.local.sect4error = [];
          $scope.weld.isSect4Complete = ! $scope.weld.isSect4Complete;

        } else if (idx === 5) {
          $scope.local.sect5error = [];
          $scope.weld.isSect5Complete = ! $scope.weld.isSect5Complete;
        }

      };

      $scope.auditSection = function(idx, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        if (typeof($scope.weld.auditstations) === 'undefined') {
          $scope.weld.auditstations = {};
        }
        $scope.weld.auditstations['station'+idx] = !$scope.weld.auditstations['station'+idx];
      };

      $scope.setDragSection = function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.weld.dragsection = !$scope.weld.dragsection;
      };


      $scope.qcSection = function(idx, approved, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        var username = user.email.split('@')[0];

        if (idx === 4) {
          if (!approved && !$scope.weld.sect4rejdate && $scope.weld.isSect4Complete)
            $scope.weld.isSect4Complete = null;
          $scope.weld.sect4qaqcdate = (approved && !$scope.weld.sect4qaqcdate) ? new Date().toLocaleDateString() : null;
          $scope.weld.sect4rejdate = (!approved && !$scope.weld.sect4rejdate) ? new Date().toLocaleDateString() : null;
          $scope.weld.sect4qaqcuser = (approved && !$scope.weld.sect4qaqcuser) ? username : null;
          $scope.weld.sect4rejuser = (!approved && !$scope.weld.sect4rejuser) ? username : null;
        }  else if (idx === 5) {
          if (!approved && !$scope.weld.sect5rejdate && $scope.weld.isSect5Complete)
            $scope.weld.isSect5Complete = null;
          $scope.weld.sect5qaqcdate = (approved && !$scope.weld.sect5qaqcdate) ? new Date().toLocaleDateString() : null;
          $scope.weld.sect5rejdate = (!approved && !$scope.weld.sect5rejdate) ? new Date().toLocaleDateString() : null;
          $scope.weld.sect5qaqcuser = (approved && !$scope.weld.sect5qaqcuser) ? username : null;
          $scope.weld.sect5rejuser = (!approved && !$scope.weld.sect5rejuser) ? username : null;
        };

      };

    }
  ]);
