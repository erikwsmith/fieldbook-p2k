//https://github.com/romelgomez/angular-firebase-image-upload
//http://compact.github.io/angular-bootstrap-lightbox/

'use strict';

angular.module('mts.fieldbook')
  .controller('CivilDocsCtrl', ['$scope','$rootScope', '$q', 'fileService', 'Ref', 'Storage','$firebaseObject', '$routeParams', 'CivilPermit','Weld', 'Lightbox', 'IMAGETYPES', 'WORKSPACE', 'WeldImages',
    function ($scope,$rootScope,$q,fileService, Ref, Storage, $firebaseObject, $routeParams, CivilPermit, Weld, Lightbox, IMAGETYPES, WORKSPACE, WeldImages) {

    new CivilPermit ($routeParams.civilpermitid).$bindTo($scope, 'permit');

    $scope.local = {};
    var weldImagesReference = Ref.child('documents').child($routeParams.civilpermitid);
      var docStorageReference = Storage.child('documents').child($routeParams.civilpermitid);
    $scope.local.weldImages = new WeldImages(weldImagesReference);


    if ($routeParams.civilpermitid !== fileService.getParentID() && fileService.getParentID() !== '') {
      fileService.clearAllFiles();
    }

    var fileType = (typeof($routeParams.fileType) === 'undefined') ? 'documents' : $routeParams.fileType;

    fileService.setPath($routeParams.civilpermitid, fileType);

    fileService.files().then(function(_files_) {
      $scope.docs  = _files_;
    });

    $scope.filesLength  = function(){
      return fileService.filesLength();
    };

    $scope.queueFiles = function(){
      return fileService.queueFiles();
    };

    $scope.progressInstances = {};
    $scope.imageTypes = IMAGETYPES;

    $scope.uploadFiles = function(){
      fileService.files().then(function(files) {
        angular.forEach(files,function(fileObject,reference){
          if(fileObject.inServer === false){
            $scope.progressInstances[reference] = $q.when(fileService.upload(fileObject,reference));
          }
        });
      });
    };

    $scope.openLightboxModal = function (key) {
      Lightbox.openModal($scope.docs, key);
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

    fileService.filesInServer();

    $rootScope.$on('mts.file-url-updated', function (event, data) {
        $scope.$apply();
    });

  }]);
