//https://github.com/romelgomez/angular-firebase-image-upload
//http://compact.github.io/angular-bootstrap-lightbox/

'use strict';

angular.module('mts.fieldbook')
  .controller('FileUploadController', ['$scope','$rootScope','$q','fileService', 'Ref', '$firebaseObject', '$routeParams', 'Weld', 'Lightbox', 'IMAGETYPES', 'WORKSPACE', 'WeldImages',
    function ($scope,$rootScope,$q,fileService, Ref, $firebaseObject, $routeParams, Weld, Lightbox, IMAGETYPES, WORKSPACE, WeldImages) {

    new Weld($routeParams.weldid).$bindTo($scope, 'weld');

    $scope.local = {};
    var weldImagesReference = Ref.child(WORKSPACE).child('images').child($routeParams.weldid);
    $scope.local.weldImages = new WeldImages(weldImagesReference);


    if ($routeParams.weldid !== fileService.getParentID() && fileService.getParentID() !== '') {
      fileService.clearAllFiles();
    }

    var fileType = (typeof($routeParams.fileType) === 'undefined') ? 'images' : $routeParams.fileType;

    fileService.setPath($routeParams.weldid, fileType);

    fileService.files().then(function(_files_) {
      $scope.files  = _files_;
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
      Lightbox.openModal($scope.files, key);
    };

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

    fileService.filesInServer();

    $rootScope.$on('mts.file-url-updated', function (event, data) {
        $scope.$apply();
    });

  }]);
