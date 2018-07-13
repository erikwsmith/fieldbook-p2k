
'use strict';

angular.module('mts.fieldbook')
  .factory('fileService',['$q','rfc4122','FBURL','Ref','Storage','$firebaseObject','WORKSPACE','ROW','$rootScope',
  function($q,rfc4122,FBURL,Ref,Storage,$firebaseObject,WORKSPACE,ROW,$rootScope){

    var workspaceImagesReference = {};
    var storageDocumentReference = {};
    var workspaceImages = {};
    var parentid = '';
    var filetype = 'documents';

    /**
     * The ALL files, in queue to upload and those already in server.
     * @type {object}
     * */
    var files     = {};

    /**
     * Copy of files object, used for return the file object to its original state, which it is an empty object '{}'.
     * @type {object}
     * */
    //var filesCopy = angular.copy(files);

    /**
     * insert custom made file object in files object
     * @param {String} reference
     * @param {Object} fileObject
     **/
    var insertFile = function (reference,fileObject) {
      files[reference] = fileObject;
    };

    /**
     * insert custom made file object in files object
     * @param {String} reference
     * @param {Object} fileObject
     **/
    var clearFiles = function () {
      files = {};
    };

    /**
     * Receives the reference (UUID), and the new data object.
     * @param {String} reference is UUID string
     * @param {Object} newData
     * @return undefined
     **/
    var updateFileObj = function(reference,newData){
      angular.forEach(newData, function (value, key) {
        files[reference][key] = value;
      });
    };

    /**
     * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
     * images to fit into a certain area.
     * Source:  http://stackoverflow.com/a/14731922
     *
     * @param {Number} srcWidth Source area width
     * @param {Number} srcHeight Source area height
     * @param {Number} maxWidth Nestable area maximum available width
     * @param {Number} maxHeight Nestable area maximum available height
     * @return {Object} { width, height }
     */
    var calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight) {
      var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
      return { width: srcWidth*ratio, height: srcHeight*ratio };
    };

    /**
     Reduce imagen size and quality.
     @param {String} imagen is a base64 string
     @param {Number} width
     @param {Number} height
     @param {Number} quality from 0.1 to 1.0
     @return Promise.<String>
     **/
    var generateThumbnail = function(imagen, width, height, quality, fmt){
      var deferred          = $q.defer();
      var canvasElement     = document.createElement('canvas');
      var imagenElement     = document.createElement('img');
      imagenElement.onload  = function(){
        var  dimensions = calculateAspectRatioFit(imagenElement.width,imagenElement.height,width,height);
        canvasElement.width   = dimensions.width;
        canvasElement.height  = dimensions.height;
        var context           = canvasElement.getContext('2d');
        context.drawImage(imagenElement, 0, 0, dimensions.width, dimensions.height);

        var ort = EXIF.getTag(imagenElement,'Orientation');
        switch(ort){
          case 8:
            context.rotate(90*Math.PI/180);
            break;
          case 3:
            context.rotate(180*Math.PI/180);
            break;
          case 6:
            context.rotate(-90*Math.PI/180);
            break;
        }

        if (typeof(fmt) !== 'undefined' && fmt === 'blob') {
          canvasElement.toBlob(function(blob){
            deferred.resolve(blob);
          },'image/png');

        } else {
          deferred.resolve(canvasElement.toDataURL('image/png', quality));
        }
      };
      imagenElement.src = imagen;
      return deferred.promise;
    };

    /**
     Put images into the firebase storage.
     @param {String} imagen is a base64 string
     @param {Number} width
     @param {Number} height
     @param {Number} quality from 0.1 to 1.0
     @return Promise.<String>
     **/
    var putFilesIntoStorage = function(reference, type, data, filename){
      var deferred          = $q.defer();
      var docStoreReference, file;

      switch (type) {
        case 'document':
          docStoreReference  = storageDocumentReference.child(reference).child(filename);
          file = data;
          break;
        case 'image':
          docStoreReference  = storageDocumentReference.child(reference).child(filename);
          file = data;
          break;
        case 'w200xh200':
          docStoreReference  = storageDocumentReference.child(reference).child('thumbnails').child('w200xh200.png');
          file = new Blob([data], {type: 'image/png'});
          break;
        case 'w600xh600':
          docStoreReference  = storageDocumentReference.child(reference).child('thumbnails').child('w600xh600.png');
          file = new Blob([data], {type: 'image/png'});
          break;
      }


      var uploadTask = docStoreReference.put(file);
      uploadTask.on('state_changed', function(snapshot){
        // Observe state change events such as progress, pause, and resume
        // See below for more detail
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //console.log('Upload is ' + progress + '% done');
        deferred.notify({type:type, progress:progress});
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            //console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            //console.log('Upload is running');
            break;
        }
      }, function(error) {
        // Handle unsuccessful uploads
      }, function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        var downloadURL = uploadTask.snapshot.downloadURL;
        deferred.resolve(downloadURL);
      });

      return deferred.promise;
    };

    if (!HTMLCanvasElement.prototype.toBlob) {
     Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      value: function (callback, type, quality) {

        var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
            len = binStr.length,
            arr = new Uint8Array(len);

        for (var i=0; i<len; i++ ) {
         arr[i] = binStr.charCodeAt(i);
        }

        callback( new Blob( [arr], {type: type || 'image/png'} ) );
      }
     });
    }

    return {
      /**
       * files, to upload and in server
       * @return Promise.<Object>
       * */
      setPath: function(id,fileType){
        workspaceImagesReference = Ref.child(fileType).child(id);
        workspaceImages = $firebaseObject(workspaceImagesReference);
        storageDocumentReference = Storage.child(fileType).child(id);
        parentid = id;
        filetype = (fileType === 'documents') ? 'document' : 'image';
        return;
      },
      /**
       *
       *
       * */
      getPath: function(){
        return workspaceImagesReference;
      },
      /**
       *
       *
       * */
      getStoragePath: function(){
        return storageDocumentReference;
      },
      /**
       * files, to upload and in server
       * @return Promise.<Object>
       * */
      getParentID: function(){
        return parentid;
      },
      /**
       * files, to upload and in server
       * @return Promise.<Object>
       * */
      clearAllFiles: function(){
        clearFiles();
        return;
      },
      /**
       * files, to upload and in server
       * @return Promise.<Object>
       * */
      files: function(){
        return $q.when(files);
      },
      /**
       * how many files there are
       * @return {Number}
       * */
      filesLength : function(){
        return Object.keys(files).length;
      },
      /**
       * how many files are in queue to upload
       * @return {Boolean}
       * */
      queueFiles : function(){
        var queue = false;
        angular.forEach(files,function(file){
          if(file.inServer === false){ queue = true; }
        });
        return queue;
      },
      /**
       Receives one FILE type object, which is added or "pushed" to the files object. Later, we can get that object with the reference that return the success
       promise. The reference is UUID (https://en.wikipedia.org/wiki/Universally_unique_identifier).
       @param {File} file
       @return Promise.<String>
       **/
      newFile : function(file){
        var uuid    = rfc4122.v4();
        // creating file object
        files[uuid]          = {
          file:     file,
          fileName: file.name,
          fileSize: file.size,
          preview:  'images/loading.jpeg',
          docURL: '',
          inServer: false
        };
        return $q.when(uuid);
      },
      /**
       Receives the reference (UUID) of the FILE object in files object. Create FileReader instance to read the file with that reference.
       @param  {String} reference is UUID string.
       @return  Promise.<String> . The Reading is a base64 string.
       **/
      readFile : function(reference){
        var deferred = $q.defer();
        var reader = new FileReader();
        reader.onerror = function(error){
          // The reading operation encounter an error.
          deferred.reject(error);
        };
        reader.onload = function (loadEvent) {
          // The reading operation is successfully completed.
          deferred.resolve(loadEvent.target.result);
        };
        reader.readAsDataURL(files[reference].file);
        return deferred.promise;
      },
      updateFileObj : updateFileObj,
      /**
       Remove ALL queue files to upload.
       @return Promise.<String>
       **/
      removeQueueFiles : function(){
        angular.forEach(files,function(fileObject,reference){
          if(fileObject.inServer === false){
            delete files[reference];
          }
        });
        return $q.when('All queue files has been removed successfully.');
      },
      /**
       Remove the file with the reference provided in queue to upload or one that it is in the server.
       @return Promise.<String>
       **/
      removeFile : function(reference){
        var deferred = $q.defer();
        var fileName = files[reference].fileName;
        var message = 'The file: '+ fileName +', has been removed successfully.';
        if(files[reference].inServer){
          var imageObject = $firebaseObject(workspaceImagesReference.child(reference));
          imageObject.isDeleted = true;
          imageObject.$save().then(function(){
            delete files[reference];
            deferred.resolve(message);
          });
        }else{
          delete files[reference];
          deferred.resolve(message);
        }
        return deferred.promise;
      },

      addMeta : function(reference, field, data){
        var deferred = $q.defer();
        var fileName = files[reference].fileName;
        if(files[reference].inServer){
          var metaObj = {};
          metaObj[field] = data;
          workspaceImagesReference.child(reference).update(metaObj);
        }else{
          files[reference][field] = data;
          deferred.resolve();
        }
        return deferred.promise;
      },
      // setFireBaseUniqueIdentifier:function(uniqueIdentifier){

      // },
      upload: function (fileObject,reference) {
        var deferred = $q.defer();

        if (filetype === 'documents') {
          $q.all({
            reference: $q.when(reference),
            fileName: $q.when(fileObject.fileName),
            imageType: $q.when((fileObject.imageType) ? fileObject.imageType : ''),
            notes: $q.when((fileObject.notes) ? fileObject.notes : ''),
            // w200xh200Thumbnail: generateThumbnail(fileObject.preview,200,200,1.0),
            // w600xh600Thumbnail: generateThumbnail(fileObject.preview,600,600,1.0),
            w200xh200ThumbnailBlob: generateThumbnail(fileObject.preview,200,200,1.0,'blob'),
            // w600xh600ThumbnailBlob: generateThumbnail(fileObject.preview,600,600,1.0,'blob'),
            w800xh800ThumbnailBlob: generateThumbnail(fileObject.preview,800,800,1.0,'blob')
          }).then(function(the){

            var reference = the.reference;
            var fileName  = the.fileName;

            workspaceImages[reference]           = {};
            workspaceImages[reference].name      = fileName;
            workspaceImages[reference].isDeleted = false;
            workspaceImages[reference].imageType = the.imageType;
            workspaceImages[reference].notes = the.notes;

            $q.all({
              thumb200Upload: putFilesIntoStorage(reference, 'w200xh200', the.w200xh200ThumbnailBlob),
              // thumb600Upload: putFilesIntoStorage(reference, 'w600xh600', the.w600xh600ThumbnailBlob),
              inworkspaces: workspaceImages.$save()
            }).then(function(){
              // return $q.when(putFilesIntoStorage(reference, 'image', fileObject.file, fileName))
              return $q.when(putFilesIntoStorage(reference, 'document', the.w800xh800ThumbnailBlob, fileName))
            }).then(function(){
              updateFileObj(reference,{inServer:true});
            }, null, function(value){
              deferred.notify(value);
            }).then(function(){
              deferred.resolve();
            });


            // $q.when(putFilesIntoStorage(reference, 'image', fileObject.file, fileName)
            // ).then(
            //   putFilesIntoStorage(reference, 'w200xh200', the.w200xh200ThumbnailBlob)
            // , null, function(value){
            //   deferred.notify(value);
            // }).then(
            //   putFilesIntoStorage(reference, 'w600xh600', the.w600xh600ThumbnailBlob)
            // ).then(
            //   workspaceImages.$save()
            // ).then(function(){
            //   updateFileObj(reference,{inServer:true});
            // }).then(function(){
            //   deferred.resolve();
            // });

            // $q.all({
            //   mainImageUpload: putFilesIntoStorage(reference, 'image', fileObject.file, fileName),
            //   thumb200Upload: putFilesIntoStorage(reference, 'w200xh200', the.w200xh200ThumbnailBlob),
            //   thumb600Upload: putFilesIntoStorage(reference, 'w600xh600', the.w600xh600ThumbnailBlob),
            //   inworkspaces: workspaceImages.$save()
            // }).then(function(){
            //   updateFileObj(reference,{inServer:true});
            // }).then(function(){
            //   deferred.resolve();
            // });
          });
        } else  {
          $q.all({
            reference: $q.when(reference),
            fileName: $q.when(fileObject.fileName)
          }).then(function(the){
            var reference = the.reference;
            var fileName  = the.fileName;
            workspaceImages[reference]           = {};
            workspaceImages[reference].name      = fileName;
            workspaceImages[reference].isDeleted = false;


            $q.all({
              mainImageUpload: putFilesIntoStorage(reference, 'document', fileObject.file, fileName),
              inworkspaces: workspaceImages.$save()
            }).then(function(result){
              updateFileObj(reference,{inServer:true});
              updateFileObj(reference,{docURL:result.mainImageUpload});
            }).then(function(){
              deferred.resolve();
            });
          });
        }




        return deferred.promise;
      },
      filesInServer: function(){
        workspaceImages.$watch(function() {
          angular.forEach(workspaceImages,function(fileObj,reference){
            if(!fileObj.isDeleted){
              if(!angular.isDefined(files[reference])){
                var file = {
                  fileName: fileObj.name,
                  preview:  'images/loading.jpeg',
                  fullImg: 'images/loading.jpeg',
                  docURL: '',
                  inServer: true,
                  imageType: (fileObj.imageType) ? fileObj.imageType : '',
                  notes: (fileObj.notes) ? fileObj.notes : ''
                };
                insertFile(reference,file);

                if (filetype === 'documents') {
                  var w200xh200ThumbnailReference = storageDocumentReference.child(reference).child('thumbnails').child('w200xh200.png');
                  w200xh200ThumbnailReference.getDownloadURL().then(function(url) {
                    updateFileObj(reference,{preview:url});
                    $rootScope.$broadcast('mts.file-url-updated');
                  });

                  var fullImageReference = storageDocumentReference.child(reference).child(fileObj.name);
                  fullImageReference.getDownloadURL().then(function(url) {
                    updateFileObj(reference,{fullImg:url});
                  });
                }  else {
                  var fullImageReference = storageDocumentReference.child(reference).child(fileObj.name);
                  fullImageReference.getDownloadURL().then(function(url) {
                    updateFileObj(reference,{docURL:url});
                    $rootScope.$broadcast('mts.file-url-updated');
                  });
                  fullImageReference.getMetadata().then(function(metadata) {
                    updateFileObj(reference,{fileSize:metadata.size});
                    $rootScope.$broadcast('mts.file-url-updated');
                  });
                }

              }
            }
          });
        });
      }
    };

  }])
/**
 * The fileUpload Directive Take the last files specified by the User.
 * */
  .directive('fileUpload',['$q','fileService','$log',function($q,fileService,$log){
    return {
      restrict: 'E',
      template: '<input type="file" multiple="multiple" accept="" class="file-input">',
      replace:true,
      scope: {
        accept: "@accept"
      },
      link: function (scope,element) {
        fileService.fileInputElement = element;
        element.on('change', function (event) {
          angular.forEach(event.target.files,function(file){
            fileService.newFile(file)
              .then(function(reference){
                // read file
                return $q.all({reference: $q.when(reference), reading: fileService.readFile(reference)});
              }).then(function(the){
                // update file object
                fileService.updateFileObj(the.reference,{preview: the.reading});
              },
              function(error){
                $log.error('Error: ',error);
              });
          });
        });
      }
    };
  }])
/**
 * The fileUploadTrigger Directive Triggers click event on file Input Element.
 * */
  .directive('fileUploadTrigger',['fileService',function(fileService){
    return {
      restrict: 'A',
      link: function (scope,element) {
        element.bind('click', function () {
          fileService.fileInputElement.click();
        });
      }
    };
  }])
/**
 * The removeFiles return files object to original state.
 * */
  .directive('removeQueueFiles',['fileService',function(fileService){
    return {
      restrict: 'A',
      scope:{
        successMessage:'@'
      },
      link: function (scope,element) {
        element.bind('click', function () {
          fileService.removeQueueFiles().then(function(message){
            scope.successMessage = scope.successMessage ? scope.successMessage : message;
            //notificationService.success(scope.successMessage);
          });
        });
      }
    };
  }])
/**
 * The removeFile directive delete the specified file object in files object.
 * */
  .directive('removeFile',['fileService',function(fileService){
    return {
      restrict: 'A',
      scope:{
        successMessage:'@'
      },
      link: function (scope,element,attributes) {
        element.bind('click', function () {
          fileService.removeFile(attributes.removeFile).then(function(message){
            scope.successMessage = scope.successMessage ? scope.successMessage : message;
            //notificationService.success(scope.successMessage);
          });
        });
      }
    };
  }])
  .directive('addNotes',['fileService',function(fileService){
    return {
      restrict: 'A',
      link: function (scope,element,attributes) {
        element.bind('change', function () {
          fileService.addMeta(attributes.addNotes, 'notes', element.val());
        });
      }
    };
  }])
  .directive('addType',['fileService',function(fileService){
    return {
      restrict: 'A',
      link: function (scope,element,attributes) {
        element.bind('change', function () {
          fileService.addMeta(attributes.addType, 'imageType', element.val());
        });
      }
    };
  }]);
