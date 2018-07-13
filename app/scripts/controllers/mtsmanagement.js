'use strict';

angular.module('mts.fieldbook')
  .controller('MTSManagementCtrl', ['Ref', 'Auth', '$firebaseObject','$scope', '$timeout','$rootScope', '$location', '$route',
    function (Ref,  Auth, $firebaseObject, $scope, $rootScope,$location, $timeout, $route) {
//get userID

// $scope.isHidden=false;
//
//
// Auth.$onAuthStateChanged(function(authData){
//   var uid= authData.uid;
//
// var userObj = $firebaseObject(Ref.child('users').child(uid).child('roles'));
// userObj.$loaded()
//       .catch(alert)
//       .then(function(){
//
//
//         console.log(userObj.$value);
//         var role = userObj.$value;
//
//         if(userObj.$value==="manager"||userObj.$value==="admin"){$scope.isHidden=true}else{$scope.isHidden = false}
//
// });
// })




// if($scope.roles.includes("manager")){$scope.isHidden="true"}else{$scope.isHidden="false"};

// var authData = $scope.authObj.$getAuth();
//               var userObj = $firebaseObject(Ref.child('users').child(authData.uid));
//               userObj.$loaded()
//                     .catch(alert)
//                     .then(function(){
//
//             $scope.userName = userObj.name;
//             $scope.userRoles = userObj.roles;
//           });
//end userID

    }
])

.controller('ManagementReportsCtrl', ['Ref', 'Auth', '$firebaseArray','$firebaseObject','$scope', '$timeout','$rootScope', '$location', '$route', '$filter',
  function (Ref,  Auth, $firebaseArray, $firebaseObject, $scope, $rootScope,$location, $timeout, $route, $filter) {

var agentArray=[];
var excelArray = [];
var agentRefFiltered = $firebaseArray(Ref.child('agents').orderByChild('department').equalTo('RIGHT-OF-WAY'));
agentRefFiltered.$loaded().catch(alert).then(function(){



agentRefFiltered.forEach(function(thisAgent){
if(thisAgent.inactive!==true){



var contactReports = [];
var agentReports = [];

var contactReportsRef = $firebaseArray(Ref.child('contactreports').orderByChild('inactive').startAt(null).endAt(false));
contactReportsRef.$loaded().catch(alert).then(function(){
contactReportsRef.forEach(function (x) {

contactReports.push(x)
});
var myReports = [];

contactReports.forEach(function(y){
  var arr = Object.keys(y).map(function(key){
    return y[key];
  });
  arr.forEach(function(z){
    myReports.push(z)

  })
});
myReports.forEach(function (c){
  if (c !== null && typeof(c)!=='undefined' && c.inactive!==true && c.rowagent === thisAgent.name){
    agentReports.push(c)}
})

var tractRef = $firebaseArray(Ref.child('tracts').orderByChild('inactive').startAt(null).endAt(false));
tractRef.$loaded().catch(alert).then(function(){

var titleSearchArray = [];
var surveyPermissions = [];
var acquiredArray = [];

tractRef.forEach(function(a){
if (a.titleagent===thisAgent.name&&a.titlecomlplete!==null&&typeof(a.titlecomplete)!=='undefined'&&a.titlecomplete!==''){
  titleSearchArray.push(a)};
if (a.acquisitionagent===thisAgent.name&&a.acquireddate!==null&&typeof(a.acquireddate)!=='undefined'&&a.acquireddate!==''){
  acquiredArray.push(a)};
  if (a.surveyagent===thisAgent.name&&a.surveypermission!==null&&typeof(a.surveypermission)!=='undefined'&&a.surveypermission!==''){
    surveyPermissions.push(a)};

})
thisAgent.contactreports = agentReports.length;

thisAgent.acquisitions = acquiredArray.length;
thisAgent.titlecomplete = titleSearchArray.length;
thisAgent.surveyPermissions = surveyPermissions.length;
})

})





agentArray.push(thisAgent);
};
})
$scope.agents = agentArray;



$scope.exportData=(function() {
  agentArray.forEach(function(x){
    excelArray.push([x.name,x.contactreports,x.titlecomplete,x.surveyPermissions,x.acquisitions])
  })

    var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FROWAgentsProgress.xlsx?alt=media&token=8dc481d7-4a25-485f-ac7a-dbbe3f78a941";
    var req = new XMLHttpRequest();
    req.open("GET", file, true);
    req.responseType = "arraybuffer";
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200){
            XlsxPopulate.fromDataAsync(req.response)
                .then(function (workbook) {


    workbook.sheet(0).cell("A5").value(
      excelArray
    );
    var dataRange = (4 + excelArray.length).toString();
    workbook.sheet(0).range("A4:E4").style("border","medium");
    workbook.sheet(0).range("A5:E"+dataRange).style("border",true);


    workbook.outputAsync()
        .then(function (blob) {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // If IE, you must uses a different method.
                window.navigator.msSaveOrOpenBlob(blob, "ROW Agents Progress.xlsx");
            } else {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = url;
                a.download = "ROW Agents Progress.xlsx";
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        });
                });
        }
    };

    req.send();

              });
$scope.currentPage = 0;
$scope.pageSize = 100;
$scope.numberOfPages=function(){
     return Math.ceil($scope.agents.length/$scope.pageSize);
 };
});


 $scope.orderByField = 'name';
 $scope.reverseSort = false;

 $scope.orderBy = function(fld, e) {
   if (e) {
     e.preventDefault();
     e.stopPropagation();
   }

   $scope.orderByField=fld;
   $scope.reverseSort = !$scope.reverseSort;
 }

 $scope.error = function (e) {
   /* DO SOMETHING WHEN ERROR IS THROWN */
   console.log(e);
 }





}
])
