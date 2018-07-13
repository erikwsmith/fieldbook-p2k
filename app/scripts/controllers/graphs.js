'use strict';
/**
 * @ngdoc function
 * @name mts.fieldbook.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */

angular.module('mts.fieldbook')
.controller('SurveyPermissionsGraphCtrl', ['$firebaseArray','$firebaseObject','$firebaseAuth','$scope', '$location','$timeout', 'Ref', 'LOCATIONS', 'user', 'Auth', 'ROW','WORKSPACE',

  function ($firebaseArray, $firebaseObject, $firebaseAuth, $scope, $location, $timeout, Ref, LOCATIONS, user, Auth, WORKSPACE, ROW) {
var augustArray=[];
var midAugustArray = [];
var septemberArray=[];
var midSeptemberArray = [];



var surveydata=[0];
var barchartsurveydata=[];

var tractObj = $firebaseObject(Ref.child('tracts'));
tractObj.$loaded()
.catch(alert)
.then(function() {

var linegraphArray=[];
var barchartArray=[];

var today = new Date();
var surveypermissionArray = [];
tractObj.forEach(function(x){
  var surveyDate=x.surveypermission;
  var surveyApproved=x.surveypermissionapproved;
  if(surveyDate!==null&&typeof(surveyDate)!=='undefined'&&surveyDate!==''&&surveyApproved!==null&&typeof(surveyApproved)!=='undefined'&&surveyApproved!==''){surveypermissionArray.push(new Date(x.surveypermission))};
});

surveypermissionArray.forEach(function(s){
  if(s<=new Date("08/15/2018")){augustArray.push(s)};
  if(s<=new Date("08/31/2018")){midAugustArray.push(s)};
  if(s<=new Date("09/15/2018")){midSeptemberArray.push(s)};
  if(s<=new Date("09/30/2018")){septemberArray.push(s)};

console.log(s)


})
if(today<=new Date("08/01/2018")){surveydata.push(augustArray.length)};
if(today>=new Date("08/15/2018")){surveydata.push(midAugustArray.length)};
if(today>=new Date("09/15/2018")){surveydata.push(midSeptemberArray.length)};
if(today>=new Date("09/30/2018")){surveydata.push(septemberArray.length)};



if(today<=new Date("08/01/2018")){barchartsurveydata.push(augustArray.length)};
if(today>=new Date("08/15/2018")){barchartsurveydata.push(midAugustArray.length)};
if(today>=new Date("09/15/2018")){barchartsurveydata.push(midSeptemberArray.length)};
if(today>=new Date("09/30/2018")){barchartsurveydata.push(septemberArray.length)};





var ctx = document.getElementById('myChart').getContext('2d');
var ctx2 = document.getElementById('myChart2').getContext('2d');

var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    //The data for our dataset
        data: {
            labels: ["8/1/18","8/15/18","8/31/18","9/15/18","9/30/18"],
            datasets: [{
                label: "Projected",
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0,336,672,1008,1344],
                fill:false,

            },
            {
                label: "Actual",
                backgroundColor: '#0099ff',
                borderColor: '#0099ff',
                data: surveydata,
                fill:false
            },


          ]
        },

    // Configuration options go here
    options: {
      maintainAspectRatio:false,
      responsive:true,

    title:{
      display:true,
      text: 'Survey Permission Progress',
      fontSize: 16,
      padding: 10
    },
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true,
                fontStyle: 'bold',

            }
        }]
    },
    animation:{
      onComplete: function(){
        linegraphArray.push(chart.toBase64Image());
      },
      duration: 1500
    }
}
});
var chart2 = new Chart(ctx2, {
    // The type of chart we want to create
    type: 'bar',

    //The data for our dataset
        data: {
            labels: ["8/1/18 - 8/15/18","8/16/18 - 8/31/18","9/1/18 - 9/15/18","9/16/18 - 9/30/18"],
            datasets: [{
                label: "Projected",
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [336,672,1008,1344],
                fill:false,

            },
            {
                label: "Actual",
                backgroundColor: '#0099ff',
                borderColor: '#0099ff',
                data: barchartsurveydata,
                fill:false
            },


          ]
        },

    // Configuration options go here
    options: {
    maintainAspectRatio:false,
    responsive:true,
    title:{
      display:true,
      text: 'Survey Permission Progress',
      fontSize: 16,
      padding: 10
    },
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true,
                fontStyle: 'bold'
            }
        }]
    },
    animation:{
      onComplete: function(){
        barchartArray.push(chart2.toBase64Image());
      },
      duration: 1500
    }
}
});
//print Graphs
var currentdate =  new Date().toLocaleDateString();
var dd = {

footer: function(currentPage, pageCount) {
 return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
content: [
  {table: {
    widths:['50%','50%'],
    body:[
    [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
  ]
          }
  },

  {text: 'Boardwalk P2K Project - Survey Permission Graphs', style: 'header', alignment: 'center'},
  {image: 'lineGraph',margin: [30,60,0,30],width:1050,height:400},

  {image: 'barChart',margin: [30,60,0,30],width:1050,height:400, style: 'secondpage',pageBreak: 'before'}

],
pageOrientation: 'landscape',
pageSize: 'A3',
pageMargins: [30,15,30,40],

styles: {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 20]
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
    color: 'white',
    fillColor: 'blue',
    alignment: 'center'
  },
  secondpage: {
    margin: [0,120,0,0]
  }
},
defaultStyle: {
  // alignment: 'justify'
},
images: {
  logo: 'data:image/png;base64,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'
,
  lineGraph: linegraphArray,
  barChart: barchartArray

}

}

$scope.printGraphs = function(){
  pdfMake.createPdf(dd).download('Survey Permission Graphs.pdf');
}


});





}
])
.controller('TitleSearchGraphCtrl', ['$firebaseArray','$firebaseObject','$firebaseAuth','$scope', '$location','$timeout', 'Ref', 'LOCATIONS', 'user', 'Auth', 'ROW','WORKSPACE',


  function ($firebaseArray, $firebaseObject, $firebaseAuth, $scope, $location, $timeout, Ref, LOCATIONS, user, Auth, WORKSPACE, ROW) {
var titleArray = [];
var titledata = [0];
var barcharttitledata = [];
var augustArray=[];
var midAugustArray=[];
var septemberArray=[];
var midSeptemberArray=[];
var octoberArray=[];
var midOctoberArray=[];

var tractObj = $firebaseObject(Ref.child('tracts'));
tractObj.$loaded()
.catch(alert)
.then(function() {

  var linegraphArray = [];
  var barchartArray = [];

  tractObj.forEach(function(x){
    var titleDate=x.titlecomplete;
    var titleApproved=x.titleapproved;
    if(titleDate!==null&&typeof(titleDate)!=='undefined'&&titleDate!==''&&titleApproved!==null&&typeof(titleApproved)!=='undefined'&&titleApproved!==''){titleArray.push(new Date(x.titlecomplete))};
  });
var today = new Date();

titleArray.forEach(function(s){

  if(s<=new Date("08/15/2018")){augustArray.push(s)};
  if(s<=new Date("08/31/2018")){midAugustArray.push(s)};
  if(s<=new Date("09/15/2018")){septemberArray.push(s)};
  if(s<=new Date("09/30/2018")){midSeptemberArray.push(s)};
  if(s<=new Date("10/15/2018")){octoberArray.push(s)};
  if(s<=new Date("10/31/2018")){midOctoberArray.push(s)};




})
if(today<=new Date("08/15/2018")){titledata.push(augustArray.length)};
if(today>=new Date("08/16/2018")){titledata.push(midAugustArray.length)};
if(today>=new Date("09/01/2018")){titledata.push(septemberArray.length)};
if(today>=new Date("09/15/2018")){titledata.push(midSeptemberArray.length)};
if(today>=new Date("10/01/2018")){titledata.push(octoberArray.length)};
if(today>=new Date("10/31/2018")){titledata.push(midOctoberArray.length)};

if(today<=new Date("08/15/2018")){barcharttitledata.push(augustArray.length)};
if(today>=new Date("08/16/2018")){barcharttitledata.push(midAugustArray.length)};
if(today>=new Date("09/01/2018")){barcharttitledata.push(septemberArray.length)};
if(today>=new Date("09/15/2018")){barcharttitledata.push(midSeptemberArray.length)};
if(today>=new Date("10/01/2018")){barcharttitledata.push(octoberArray.length)};
if(today>=new Date("10/31/2018")){barcharttitledata.push(midOctoberArray.length)};



var ctx = document.getElementById('myChart').getContext('2d');
var ctx2 = document.getElementById('myChart2').getContext('2d');

var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    //The data for our dataset
        data: {
            labels: ["8/1/18","8/15/18","8/31/18","9/15/18","9/30/18","10/15/18","10/31/18"],
            datasets: [{
                label: "Projected",
                backgroundColor: '#6A5ACD',
                borderColor: '#6A5ACD',
                data: [0,224,448,672,896,1120,1344],
                fill:false,

            },
            {
                label: "Actual",
                backgroundColor: '#20B2AA',
                borderColor: '#20B2AA',
                data: titledata,
                fill:false
            },


          ]
        },

    // Configuration options go here
    options: {
      maintainAspectRatio:false,
      responsive:true,
      padding: 10,

    title:{
      display:true,
      text: 'Title Search Progress',
      fontSize: 16,
      padding: 10
    },
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true,
                fontStyle: 'bold'
            }
        }]
    },
    animation:{
      onComplete: function(){
        linegraphArray.push(chart.toBase64Image());
      },
      duration: 1500
    }
}
});
var chart2 = new Chart(ctx2, {
    // The type of chart we want to create
    type: 'bar',

    //The data for our dataset
        data: {
            labels: ["8/1/18 - 8/15/18","8/16/18 - 8/31/18","9/1/18 - 9/15/18","9/16/18 - 9/30/18","10/1/18 - 10/15/18","10/16/18 - 10/31/18"],
            datasets: [{
                label: "Projected",
                backgroundColor: '#6A5ACD',
                borderColor: '#6A5ACD',
                data: [224,448,672,896,1120,1344],
                fill:false,

            },
            {
                label: "Actual",
                backgroundColor: '#20B2AA',
                borderColor: '#20B2AA',
                data: barcharttitledata,
                fill:false
            },


          ]
        },

    // Configuration options go here
    options: {
    maintainAspectRatio:false,
    responsive:true,
    title:{
      display:true,
      text: 'Title Search Progress',
      fontSize: 16,
    },

    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true,
                fontStyle: 'bold',

            }
        }]
    },
    animation:{
      onComplete: function(){
        barchartArray.push(chart2.toBase64Image());
      },
      duration: 1500
    }
}
});
//print Graphs
var currentdate =  new Date().toLocaleDateString();
var dd = {
  footer: function(currentPage, pageCount) {
   return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
content: [
  {table: {
    widths:['50%','50%'],
    body:[
    [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
  ]
          }
  },

  {text: 'Boardwalk P2K Project - Title Search Graphs', style: 'header', alignment: 'center'},
  {image: 'lineGraph',margin: [30,60,0,30],width:1050,height:400},

  {image: 'barChart',margin: [30,60,0,30],width:1050,height:400, style: 'secondpage',pageBreak: 'before'}

],
pageOrientation: 'landscape',
pageSize: 'A3',
pageMargins: [30,15,30,40],

styles: {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 20]
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
    color: 'white',
    fillColor: 'blue',
    alignment: 'center'
  },
  secondpage: {
    margin: [0,120,0,0]
  }
},
defaultStyle: {
  // alignment: 'justify'
},
images: {
  logo:'data:image/png;base64,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'
,
  lineGraph: linegraphArray,
  barChart: barchartArray

}

}

$scope.printGraphs = function(){
  pdfMake.createPdf(dd).download('Title Search Graphs.pdf');
}



});

}
])
.controller('AcquisitionGraphCtrl', ['$firebaseArray','$firebaseObject','$firebaseAuth','$scope', '$location','$timeout', 'Ref', 'LOCATIONS', 'user', 'Auth', 'ROW','WORKSPACE',


  function ($firebaseArray, $firebaseObject, $firebaseAuth, $scope, $location, $timeout, Ref, LOCATIONS, user, Auth, WORKSPACE, ROW) {

var augustArray=[];
var septemberArray=[];
var octoberArray=[];
var novemberArray=[];
var decemberArray=[];
var januaryArray=[];
var februaryArray=[];
var marchArray=[];
var acquisitiondata=[0];
var barchartacquisitiondata=[];
var acquisitionArray = [];

var tractObj = $firebaseObject(Ref.child('tracts'));
tractObj.$loaded()
.catch(alert)
.then(function() {

  var linegraphArray = [];
  var barchartArray = [];
var today = new Date();
tractObj.forEach(function(x){
  var acquiredDate=x.acquireddate;
  var acquisitionApproved=x.acquisitionapproved;
  if(acquiredDate!==null&&typeof(acquiredDate)!=='undefined'&&acquiredDate!==''&&acquisitionApproved!==null&&typeof(acquisitionApproved)!=='undefined'&&acquisitionApproved!==''){acquisitionArray.push(new Date(x.acquireddate))};
});
acquisitionArray.forEach(function(s){
  // if(s<=new Date("04/30/2017")){aprilArray.push(s)};
  // if(s<=new Date("05/31/2017")){mayArray.push(s)};
  // if(s<=new Date("06/31/2017")){juneArray.push(s)};
  // if(s<=new Date("07/31/2017")){julyArray.push(s)};
  if(s<=new Date("08/31/2018")){augustArray.push(s)};
  if(s<=new Date("09/30/2018")){septemberArray.push(s)};
  if(s<=new Date("10/31/2018")){octoberArray.push(s)};
  if(s<=new Date("11/30/2018")){novemberArray.push(s)};
  if(s<=new Date("12/31/2018")){decemberArray.push(s)};
  if(s<=new Date("01/31/2019")){januaryArray.push(s)};
  if(s<=new Date("02/28/2019")){februaryArray.push(s)};
  if(s<=new Date("03/31/2019")){marchArray.push(s)};


})
// if(today>=new Date("04/01/2017")){acquisitiondata.push(aprilArray.length)};
// if(today>=new Date("05/01/2017")){acquisitiondata.push(mayArray.length)};
// if(today>=new Date("06/01/2017")){acquisitiondata.push(juneArray.length)};
// if(today>=new Date("07/01/2017")){acquisitiondata.push(julyArray.length)};
if(today<=new Date("08/31/2018")){acquisitiondata.push(augustArray.length)};
if(today>=new Date("09/01/2018")){acquisitiondata.push(septemberArray.length)};
if(today>=new Date("10/01/2018")){acquisitiondata.push(octoberArray.length)};
if(today>=new Date("11/01/2018")){acquisitiondata.push(novemberArray.length)};
if(today>=new Date("12/01/2018")){acquisitiondata.push(decemberArray.length)};
if(today>=new Date("01/01/2019")){acquisitiondata.push(januaryArray.length)};
if(today>=new Date("02/01/2019")){acquisitiondata.push(februaryArray.length)};
if(today>=new Date("03/01/2019")){acquisitiondata.push(marchArray.length)};


// if(today>=new Date("04/01/2017")){barchartacquisitiondata.push(aprilArray.length)};
// if(today>=new Date("05/01/2017")){barchartacquisitiondata.push(mayArray.length)};
// if(today>=new Date("06/01/2017")){barchartacquisitiondata.push(juneArray.length)};
// if(today>=new Date("07/01/2017")){barchartacquisitiondata.push(julyArray.length)};
if(today<=new Date("08/31/2018")){barchartacquisitiondata.push(augustArray.length)};
if(today>=new Date("09/01/2018")){barchartacquisitiondata.push(septemberArray.length)};
if(today>=new Date("10/01/2018")){barchartacquisitiondata.push(octoberArray.length)};
if(today>=new Date("11/01/2018")){barchartacquisitiondata.push(novemberArray.length)};
if(today>=new Date("12/01/2018")){barchartacquisitiondata.push(decemberArray.length)};
if(today>=new Date("01/01/2019")){barchartacquisitiondata.push(januaryArray.length)};
if(today>=new Date("02/01/2019")){barchartacquisitiondata.push(februaryArray.length)};
if(today>=new Date("03/01/2019")){barchartacquisitiondata.push(marchArray.length)};

var ctx = document.getElementById('myChart').getContext('2d');
var ctx2 = document.getElementById('myChart2').getContext('2d');

var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    //The data for our dataset
        data: {
            labels: ["8/1/18","8/31/18","9/30/18", "10/31/18", "11/30/18", "12/31/18","1/31/19","2/28/19","3/31/19"],
            datasets: [{
                label: "Projected",
                backgroundColor: 'rgb(85,180,176)',
                borderColor: 'rgb(85,180,176)',
                data: [0,168,336,504,672,840,1008,1176,1344],
                fill:false,

            },
            {
                label: "Actual",
                backgroundColor: '#0c69b2',
                borderColor: '#0c69b2',
                data: acquisitiondata,
                fill:false
            },


          ]
        },

    // Configuration options go here
    options: {
      maintainAspectRatio:false,
      responsive:true,
      padding: 10,

    title:{
      display:true,
      text: 'Acquisition Progress',
      fontSize: 16,
      padding: 10
    },
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true,
                fontStyle: 'bold'
            }
        }]
    },
    animation:{
      onComplete: function(){
        linegraphArray.push(chart.toBase64Image());
      },
      duration: 1500
    }
}
});
var chart2 = new Chart(ctx2, {
    // The type of chart we want to create
    type: 'bar',

    //The data for our dataset
        data: {
            labels: ["August","September","October","November","December","January", "February","March"],
            datasets: [{
                label: "Projected",
                backgroundColor: 'rgb(85,180,176)',
                borderColor: 'rgb(85,180,176)',
                data: [168,336,504,672,840,1008,1176,1344],
                fill:false,

            },
            {
                label: "Actual",
                backgroundColor: '#0c69b2',
                borderColor: '#0c69b2',
                data: barchartacquisitiondata,
                fill:false
            },


          ]
        },

    // Configuration options go here
    options: {
    maintainAspectRatio:false,
    responsive:true,
    title:{
      display:true,
      text: 'Acquisition Progress',
      fontSize: 16,
    },

    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true,
                fontStyle: 'bold',

            }
        }]
    },
    animation:{
      onComplete: function(){
        barchartArray.push(chart2.toBase64Image());
      },
      duration: 1500
    }
}
});

//print Graphs
var currentdate =  new Date().toLocaleDateString();
var dd = {
  footer: function(currentPage, pageCount) {
   return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},

content: [
  {table: {
    widths:['50%','50%'],
    body:[
    [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
  ]
          }
  },

  {text: 'Boardwalk P2K Project - Acquisition Progress Graphs', style: 'header', alignment: 'center'},
  {image: 'lineGraph',margin: [30,60,0,30],width:1050,height:400},

  {image: 'barChart',margin: [30,60,0,30],width:1050,height:400, style: 'secondpage',pageBreak: 'before'}

],
pageOrientation: 'landscape',
pageSize: 'A3',
pageMargins: [30,15,30,40],

styles: {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 20]
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
    color: 'white',
    fillColor: 'blue',
    alignment: 'center'
  },
  secondpage: {
    margin: [0,120,0,0]
  }
},
defaultStyle: {
  // alignment: 'justify'
},
images: {
  logo:'data:image/png;base64,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'
,
  lineGraph: linegraphArray,
  barChart: barchartArray

}

}

$scope.printGraphs = function(){
  pdfMake.createPdf(dd).download('Acquisition Progress Graphs.pdf');
}

});





}
])
.controller('CostAnalysisGraphCtrl', ['$firebaseArray','$firebaseObject','$firebaseAuth','$scope', '$location','$timeout', 'Ref', 'LOCATIONS', 'user', 'Auth', 'ROW','WORKSPACE',


  function ($firebaseArray, $firebaseObject, $firebaseAuth, $scope, $location, $timeout, Ref, LOCATIONS, user, Auth, WORKSPACE, ROW) {

var aprilArray=[];
var mayArray=[];
var juneArray=[];
var julyArray=[];
var augustArray=[];
var septemberArray=[];
var octoberArray=[];
var novemberArray=[];
var decemberArray=[];
var januaryArray=[];
var februaryArray=[];
var marchArray=[];
var costdata=[0];

var tractObj = $firebaseObject(Ref.child('tracts'));
tractObj.$loaded()
.catch(alert)
.then(function() {
var today = new Date();

var paymentsObj=[];
var linegraphArray = [];
var pieChartArray = [];

var dollarsArray=[];
var sumArray=[];
var finalsumArray = [];
var overallRowCostArray=[];
var overallTemporaryWorkspaceArray=[];
var overallATWSArray=[];
var overallAccessArray=[];
var overallDamagesArray=[];
var overallOtherCostArray=[];
var overallGrandTotalArray=[];


//loop through all tracts
tractObj.forEach(function(t){
  var landownersArray=[];
  var tractPaymentsArray=[];
  var checksArray = [];
  var paymentCategoriesArray=[];

if(t.landowners){
landownersArray.push(t.landowners)
};
if(t.tenants){
  landownersArray.push(t.tenants);
}

landownersArray.forEach(function(o){

var arr = Object.keys(o).map(function (key) { return o[key]; });
arr.forEach(function(x){
if(x.payments){
  checksArray.push(x.payments)
};
})
});

checksArray.forEach(function(c){
  var arr = Object.keys(c).map(function (key) { return c[key]; });
  arr.forEach(function(z){
    if(z.inactive!==true){
paymentCategoriesArray.push(z)
};
  })

});
var rowArray = [];
var temporaryworkspaceArray = [];
var additionalworkspaceArray = [];
var accessArray = [];
var damagesArray = [];
var otherArray = [];
var totalArray = [];
var grandTotalArray=[];
//get sum of each payment category array
function getSum(total, num) {
return total + num;};
paymentCategoriesArray.forEach(function(p){
  //create arrays for each payment category

  if(p.rowcost!==null&&typeof(p.rowcost)!=='undefined'&&p.rowcost!==''){rowArray.push(p.rowcost);grandTotalArray.push(p.rowcost)}else{rowArray.push(0);grandTotalArray.push(0)};
  if(p.temporaryworkspacecost!==null&&typeof(p.temporaryworkspacecost)!=='undefined'&&p.temporaryworkspacecost!==''){temporaryworkspaceArray.push(p.temporaryworkspacecost);grandTotalArray.push(p.temporaryworkspacecost)}else{temporaryworkspaceArray.push(0);grandTotalArray.push(0)};
  if(p.additionalworkspacecost!==null&&typeof(p.additionalworkspacecost)!=='undefined'&&p.additionalworkspacecost!==''){additionalworkspaceArray.push(p.additionalworkspacecost);grandTotalArray.push(p.additionalworkspacecost)}else{additionalworkspaceArray.push(0);grandTotalArray.push(0)};
  if(p.accesscost!==null&&typeof(p.accesscost)!=='undefined'&&p.accesscost!==''){accessArray.push(p.accesscost);grandTotalArray.push(p.accesscost)}else{accessArray.push(0);grandTotalArray.push(0)};
  if(p.damagescost!==null&&typeof(p.damagescost)!=='undefined'&&p.damagescost!==''){damagesArray.push(p.damagescost);grandTotalArray.push(p.damagescost)}else{damagesArray.push(0);grandTotalArray.push(0)};
  if(p.othercost!==null&&typeof(p.othercost)!=='undefined'&&p.othercost!==''){otherArray.push(p.othercost);grandTotalArray.push(p.othercost)}else{otherArray.push(0);grandTotalArray.push(0)};

  if(rowArray.length>0){var totalRowCost=rowArray.reduce(getSum).toFixed(2)};
  t.rowcost=totalRowCost;
  if(temporaryworkspaceArray.length>0){var totalTemporaryWorkspaceCost=temporaryworkspaceArray.reduce(getSum).toFixed(2)};
  t.temporaryworkspacecost=totalTemporaryWorkspaceCost;
  if(additionalworkspaceArray.length>0){var totalATWSCost=additionalworkspaceArray.reduce(getSum).toFixed(2)};
  t.additionalworkspacecost=totalATWSCost;
  if(accessArray.length>0){var totalAccessCost=accessArray.reduce(getSum).toFixed(2)};
  t.accesscost=totalAccessCost;
  if(damagesArray.length>0){var totalDamagesCost=damagesArray.reduce(getSum).toFixed(2)};
  t.damagescost=totalDamagesCost;
  if(otherArray.length>0){var totalOtherCost=otherArray.reduce(getSum).toFixed(2)};
  t.othercost=totalOtherCost;
  if(grandTotalArray.length>0){var grandtotal=grandTotalArray.reduce(getSum).toFixed(2)};
  t.grandtotal=grandtotal;

  })
dollarsArray.push(t);

//get grand totals for each category

var overallCostsArray=[];

checksArray.forEach(function(g){
  var arr = Object.keys(g).map(function (key) { return g[key]; });
  arr.forEach(function(f){
    if(f.inactive!==true){
  overallCostsArray.push(f)}
  })
})
    overallCostsArray.forEach(function(i){
    if(i.rowcost!==null && typeof(i.rowcost)!=='undefined' && i.rowcost!==''){overallRowCostArray.push(i.rowcost);overallGrandTotalArray.push(i.rowcost)} else {overallRowCostArray.push(0);overallGrandTotalArray.push(0)};
    if(i.temporaryworkspacecost!==null && typeof(i.temporaryworkspacecost)!=='undefined' && i.temporaryworkspacecost!==''){overallTemporaryWorkspaceArray.push(i.temporaryworkspacecost); overallGrandTotalArray.push(i.temporaryworkspacecost)} else {overallTemporaryWorkspaceArray.push(0);overallGrandTotalArray.push(0)};
    if(i.additionalworkspacecost!==null && typeof(i.additionalworkspacecost)!=='undefined' && i.additionalworkspacecost!==''){overallATWSArray.push(i.additionalworkspacecost); overallGrandTotalArray.push(i.additionalworkspacecost)} else {overallATWSArray.push(0);overallGrandTotalArray.push(0)};
    if(i.accesscost!==null && typeof(i.accesscost)!=='undefined' && i.accesscost!==''){overallAccessArray.push(i.accesscost); overallGrandTotalArray.push(i.accesscost)} else {overallAccessArray.push(0);overallGrandTotalArray.push(0)};
    if(i.damagescost!==null && typeof(i.damagescost)!=='undefined' && i.damagescost!==''){overallDamagesArray.push(i.damagescost); overallGrandTotalArray.push(i.damagescost)} else {overallDamagesArray.push(0);overallGrandTotalArray.push(0)};
    if(i.othercost!==null && typeof(i.othercost)!=='undefined' && i.othercost!==''){overallOtherCostArray.push(i.othercost); overallGrandTotalArray.push(i.othercost)} else {overallOtherCostArray.push(0);overallGrandTotalArray.push(0)};

    });


              function getSum(total, num) {
                  return total + num;
              };

              $scope.overallTemporaryWorkspaceArray = overallTemporaryWorkspaceArray.reduce(getSum).toFixed(2);
              $scope.overallATWSArray = overallATWSArray.reduce(getSum).toFixed(2);
              $scope.overallAccessArray = overallAccessArray.reduce(getSum).toFixed(2);
              $scope.overallDamagesArray = overallDamagesArray.reduce(getSum).toFixed(2);
              $scope.overallOtherCostArray = overallOtherCostArray.reduce(getSum).toFixed(2);
              $scope.overallGrandTotalArray = overallGrandTotalArray.reduce(getSum).toFixed(2);
              $scope.overallRowCostArray = overallRowCostArray.reduce(getSum).toFixed(2);



              overallCostsArray.forEach(function(i){
              if (i.rowcost!==null&&typeof(i.rowcost)!=='undefined'&&i.rowcost!==''){var row = i.rowcost}else{row=0};
              if (i.temporaryworkspacecost!==null&&typeof(i.temporaryworkspacecost)!=='undefined'&&i.temporaryworkspacecost!==''){var tempworkspace = i.temporaryworkspacecost}else{tempworkspace=0};
              if (i.additionalworkspacecost!==null&&typeof(i.additionalworkspacecost)!=='undefined'&&i.additionalworkspacecost!==''){var atws = i.additionalworkspacecost}else{atws=0};
              if (i.accesscost!==null&&typeof(i.accesscost)!=='undefined'&&i.accesscost!==''){var access = i.accesscost}else{access=0};
              if (i.damagescost!==null&&typeof(i.damagescost)!=='undefined'&&i.damagescost!==''){var damages = i.damagescost}else{damages=0};
              if (i.othercost!==null&&typeof(i.othercost)!=='undefined'&&i.othercost!==''){var other = i.othercost}else{other=0};

              i.grandtotalamount=Number(row+tempworkspace+atws+access+damages+other);

              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("04/30/2017")){aprilArray.push(i.grandtotalamount)}else{aprilArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("05/31/2017")){mayArray.push(i.grandtotalamount)}else{mayArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("06/30/2017")){juneArray.push(i.grandtotalamount)}else{juneArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("07/31/2017")){julyArray.push(i.grandtotalamount)}else{julyArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("08/31/2017")){augustArray.push(i.grandtotalamount)}else{augustArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("09/30/2017")){septemberArray.push(i.grandtotalamount)}else{septemberArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("10/31/2017")){octoberArray.push(i.grandtotalamount)}else{octoberArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("11/30/2017")){novemberArray.push(i.grandtotalamount)}else{novemberArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("12/31/2017")){decemberArray.push(i.grandtotalamount)}else{decemberArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("01/31/2018")){januaryArray.push(i.grandtotalamount)}else{januaryArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("02/28/2018")){februaryArray.push(i.grandtotalamount)}else{februaryArray.push(0)};
              if (i.checkdate!==null&&typeof(i.checkdate)!=='undefined'&&i.checkdate!==''&&new Date(i.checkdate)<=new Date("03/31/2018")){marchArray.push(i.grandtotalamount)}else{marchArray.push(0)};

              });

})//ends tractObj loop

function getSum(total, num) {
    return total + num;
};
if(today>=new Date("04/01/2017")){costdata.push(aprilArray.reduce(getSum).toFixed(2))};
if(today>=new Date("05/01/2017")){costdata.push(mayArray.reduce(getSum).toFixed(2))};
if(today>=new Date("06/01/2017")){costdata.push(juneArray.reduce(getSum).toFixed(2))};
if(today>=new Date("07/01/2017")){costdata.push(julyArray.reduce(getSum).toFixed(2))};
if(today>=new Date("08/01/2017")){costdata.push(augustArray.reduce(getSum).toFixed(2))};
if(today>=new Date("09/01/2017")){costdata.push(septemberArray.reduce(getSum).toFixed(2))};
if(today>=new Date("10/01/2017")){costdata.push(octoberArray.reduce(getSum).toFixed(2))};
if(today>=new Date("11/01/2017")){costdata.push(novemberArray.reduce(getSum).toFixed(2))};
if(today>=new Date("12/01/2017")){costdata.push(decemberArray.reduce(getSum).toFixed(2))};
if(today>=new Date("01/01/2018")){costdata.push(januaryArray.reduce(getSum).toFixed(2))};
if(today>=new Date("02/01/2018")){costdata.push(februaryArray.reduce(getSum).toFixed(2))};
if(today>=new Date("03/01/2018")){costdata.push(marchArray.reduce(getSum).toFixed(2))};

var ctx = document.getElementById('myChart').getContext('2d');
var ctx2 = document.getElementById('myChart2').getContext('2d');

var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    //The data for our dataset
        data: {
            labels: ["4/1/17","4/30/17","5/31/17","6/30/17","7/31/17","8/31/17", "9/30/17", "10/31/17", "11/30/17", "12/31/17", "1/31/18","2/28/18","3/31/18"],
            datasets: [{
                label: "Projected",
                backgroundColor: '#DD4132',
                borderColor: '#DD4132',
                data: [0,1250000,2500000,3750000,5000000,6250000,7500000,8750000,10000000,11250000,12500000,13750000,15000000],
                fill:false,

            },
            {
                label: "Actual",
                backgroundColor: '#20B2AA',
                borderColor: '#20B2AA',
                data: costdata,
                fill:false
            },


          ]
        },

    // Configuration options go here
    options: {
      maintainAspectRatio:false,
      responsive:true,
      padding: 10,

    title:{
      display:true,
      text: 'Cost Analysis',
      fontSize: 20,
      padding: 10
    },
    legend:{
      labels:{
        fontSize: 13,
}
      },
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true,
                fontStyle: 'bold',
                callback: function(label){
                  return "$"+label.toLocaleString();
                }

            }
        }]
    },

  tooltips:  {
    callbacks: {
    label: function(tooltipItem, data) {
        return '$'+tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
},


  },
  animation:{
    onComplete: function(){
      linegraphArray.push(chart.toBase64Image());
    },
    duration: 1500
  },

}
});

//end of chart 1

//start chart 2
var chart2 = new Chart(ctx2, {
    // The type of chart we want to create
    type: 'pie',


    //The data for our dataset
        data: {
            datasets: [{
                data: [$scope.overallRowCostArray, $scope.overallTemporaryWorkspaceArray,$scope.overallATWSArray,  $scope.overallAccessArray,$scope.overallDamagesArray,$scope.overallOtherCostArray],
                backgroundColor: ['#0099ff',"#ff6f69","#ffcc5c","#92a8d1","#8000FF","#80ff80"],
                borderColor: 'black',
                borderWidth: .5

            }],

            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: [
                'Right of Way:  $'+$scope.overallRowCostArray.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
                'Temporary Workspace:  $'+$scope.overallTemporaryWorkspaceArray.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
                'ATWS:  $'+$scope.overallATWSArray.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
                'Access:  $'+$scope.overallAccessArray.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
                'Damages:  $'+$scope.overallDamagesArray.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
                'Other:  $'+$scope.overallOtherCostArray.replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
            ]
        },

    // Configuration options go here
    options: {
    maintainAspectRatio:false,
    responsive:true,
    title:{
      display:true,
      text: 'Cost Analysis',
      fontSize: 20
    },
    legend:{
      labels:{
        fontSize: 15,
        fontStyle: 'bold'

      },


        position:'top'


    },
    animation:{
      onComplete: function(){
        pieChartArray.push(chart2.toBase64Image());
      },
      duration: 1500
    },
    tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var allData = data.datasets[tooltipItem.datasetIndex].data;
                        var tooltipLabel = data.labels[tooltipItem.index];
                        var tooltipData = allData[tooltipItem.index];
                        var total = 0;
                        for (var i in allData) {
                            total += allData[i];
                        }
                        var tooltipPercentage = Math.round((tooltipData / total) * 100);
                        return tooltipLabel;
                    }
}
}
}
});

//print Graphs
var currentdate =  new Date().toLocaleDateString();
var dd = {
  footer: function(currentPage, pageCount) {
   return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
content: [
  {table: {
    widths:['50%','50%'],
    body:[
    [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
  ]
          }
  },

  {text: 'Boardwalk P2K Project - Cost Analysis Graphs', style: 'header', alignment: 'center'},
  {image: 'lineGraph',margin: [30,60,0,30],width:1050,height:400},

  {image: 'pieChart',width:1140, style: 'secondpage',pageBreak: 'before'}

],
pageOrientation: 'landscape',
pageSize: 'A3',
pageMargins: [30,15,30,40],

styles: {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 20]
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
    color: 'white',
    fillColor: 'blue',
    alignment: 'center'
  },
  secondpage: {
    margin: [0,120,0,0]
  }
},
defaultStyle: {
  // alignment: 'justify'
},
images: {
  logo:'data:image/png;base64,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'
,
  lineGraph: linegraphArray,
  pieChart: pieChartArray

}

}

$scope.printGraphs = function(){
  pdfMake.createPdf(dd).download('Cost Analysis Graphs.pdf');
}


});




}
])
;
