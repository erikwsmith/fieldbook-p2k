//https://github.com/romelgomez/angular-firebase-image-upload
//http://compact.github.io/angular-bootstrap-lightbox/

'use strict';

angular.module('mts.fieldbook')
  .controller('EnvironmentalPhotosCtrl', ['$scope','$rootScope', '$q', 'photoService', 'Ref', 'Storage','$firebaseObject', '$routeParams', 'EnvironmentalPermit','Weld', 'Lightbox', 'IMAGETYPES', 'WORKSPACE', 'WeldImages',
    function ($scope,$rootScope,$q,photoService, Ref, Storage, $firebaseObject, $routeParams, EnvironmentalPermit, Weld, Lightbox, IMAGETYPES, WORKSPACE, WeldImages) {

    new EnvironmentalPermit($routeParams.environmentalpermitid).$bindTo($scope, 'permit');

    $scope.local = {};
    var weldImagesReference = Ref.child('images').child($routeParams.environmentalpermitid);
      var docStorageReference = Storage.child('images').child($routeParams.environmentalpermitid);
    $scope.local.weldImages = new WeldImages(weldImagesReference);


    if ($routeParams.environmentalpermitid !== photoService.getParentID() && photoService.getParentID() !== '') {
      photoService.clearAllFiles();
    }

    var fileType = (typeof($routeParams.fileType) === 'undefined') ? 'images' : $routeParams.fileType;

    photoService.setPath($routeParams.environmentalpermitid, fileType);

    photoService.files().then(function(_files_) {
      $scope.photos  = _files_;
    });

    $scope.filesLength  = function(){
      return photoService.filesLength();
    };

    $scope.queueFiles = function(){
      return photoService.queueFiles();
    };

    $scope.progressInstances = {};
    $scope.imageTypes = IMAGETYPES;

    $scope.uploadFiles = function(){
      photoService.files().then(function(files) {
        angular.forEach(files,function(photoObject,reference){
          if(photoObject.inServer === false){
            $scope.progressInstances[reference] = $q.when(photoService.upload(photoObject,reference));
          }
        });
      });
    };

    $scope.openLightboxModal = function (key) {
      Lightbox.openModal($scope.photos, key);
    };




$scope.getURL = function (key, value) {
    docStorageReference.child(key).child(value.fileName).getDownloadURL().then(function(url) {

      $scope.url= url;
      window.location = url;

    })
};



    // $scope.authorizedOr = function(roles){
    //   var isAuthorised = false;
    //   if ($rootScope.user && $rootScope.user.roles) {
    //     for (var i=0; i < roles.length; i++){
    //       if ($rootScope.user.roles.split(',').indexOf(roles[i]) !== -1) {
    //         isAuthorised = true;
    //       }
    //     }
    //   }
    //   return isAuthorised;
    // }

    photoService.filesInServer();

    $rootScope.$on('mts.photo-url-updated', function (event, data) {
        $scope.$apply();
    });


  }]);
