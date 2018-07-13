//https://github.com/romelgomez/angular-firebase-image-upload
//http://compact.github.io/angular-bootstrap-lightbox/

'use strict';

angular.module('mts.fieldbook')

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



.controller('SurveyPermissionFormCtrl', ['$firebaseArray','$firebaseObject', '$firebaseAuth','$scope', '$routeParams','$location', 'Tract','$timeout', 'Ref', 'LOCATIONS', 'user', 'Auth', 'ROW','WORKSPACE',
  function ($firebaseArray, $firebaseObject, $firebaseAuth, $scope, $routeParams, $location, Tract, $timeout, Ref, LOCATIONS, user, Auth, WORKSPACE, ROW) {

      new Tract($routeParams.tractid).$bindTo($scope, 'tract');

      var tractsRefFiltered =  Ref.child('tracts').child($routeParams.tractid);
      var selectedTract = $firebaseObject(tractsRefFiltered);


      selectedTract.$loaded().catch(alert)
      .then(function() {
      var sequence = selectedTract.sequence;
      var owner = selectedTract.owner;
      var tract = selectedTract.tract;
      var section = selectedTract.section;
      var township = selectedTract.township;
      var range = selectedTract.range;
      var county = selectedTract.county;
      var acres = selectedTract.acres;
      var parcelid = selectedTract.parcelid;
      var granted = selectedTract.surveypermission;
      var street = selectedTract.address;
      var city = selectedTract.city;
      var state = selectedTract.state;
      var zip = selectedTract.zip;
      var phone1 = selectedTract.phone1;
      var phone2 = selectedTract.phone2;


  var dd = {
    content:[
        [	{table: {
      widths:['50%','50%'],
      body:[
      [{text:' ',border:[false,false,false,false],},{text: 'Tract No. ' + tract, decoration: 'underline', alignment:'right',margin:[0,5,5,0],border:[false,false,false,false]}]
              ],
              }}    ],
      [{text:'\n\nMERCER TECHNICAL SERVICES \n ACTING AS AGENT FOR QPS ENGINEERING, LLC \n LANDOWNER NOTIFICATION AND SURVEY PERMIT\n\n', alignment:'center',bold: true,
              }],
      [{text:'\n\nOn '+ granted + ', the owner of the herein described property grants unto QPS ENGINEERING, LLC their agents, assigns and employees, permission and license to enter my/our property, as described below, for the purpose of making surveys including the placement of stakes, line of sight clearing, geotechnical soil borings, environmental/archaeological and appraisal studies for the routing of pipeline right-of-way.\n\n', alignment:'justified',
              }],
      {text: [{text: '\n\nPROPERTY: ', bold:true},{text: 'Section '+section + ', Township '+ township + ', Range '+range+', in ' + county + ' County, Texas \n\n', alignment:'left'},
              ]},
      {text: '\nLAND OWNER: \n',bold:true},
            {text: [{text: 'Name: ', bold:true,},{text: name, margin: [300,0,0,0]}], margin: [100,0,0,0]},
            {text: [{text: 'Address: ', bold:true,},{text: street + ', '+city + ', ' + state + ' ' + zip, margin: [300,0,0,0],}], margin: [100,0,0,0]},
            {text: [{text: 'Phone 1: ', bold:true,},{text: phone1, margin: [300,0,0,0]}], margin: [100,0,0,0]},
            {text: [{text: 'Phone 2: ', bold:true,},{text: phone2, margin: [300,0,0,0]}], margin: [100,0,0,0]},
            {margin: [100,0,0,0],text: [{text: '\nSignature: ',bold:true},{text: '                                                                                                                 ',decoration: 'underline'} ]},




            ]
        };

$scope.printPDF = function(){
            // pdfMake.createPdf(dd).download('surveypermissionform.pdf');
            pdfMake.createPdf(dd).open();
        };
})





  }]);
