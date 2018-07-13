'use strict';
/**
 * @ngdoc overview
 * @name mts.fieldbook:routes
 * @description
 * # routes.js
 *
 * Configure routes for use with Angular, and apply authentication security
 * Add new routes using `yo angularfire:route` with the optional --auth-required flag.
 *
 * Any controller can be secured so that it will only load if user is logged in by
 * using `whenAuthenticated()` in place of `when()`. This requires the user to
 * be logged in to view this route, and adds the current user into the dependencies
 * which can be injected into the controller. If user is not logged in, the promise is
 * rejected, which is handled below by $routeChangeError
 *
 * Any controller can be forced to wait for authentication to resolve, without necessarily
 * requiring the user to be logged in, by adding a `resolve` block similar to the one below.
 * It would then inject `user` as a dependency. This could also be done in the controller,
 * but abstracting it makes things cleaner (controllers don't need to worry about auth state
 * or timing of displaying its UI components; it can assume it is taken care of when it runs)
 *
 *   resolve: {
 *     user: ['Auth', function(Auth) {
 *       return Auth.$getAuth();
 *     }]
 *   }
 *
 */
angular.module('mts.fieldbook')

/**
 * Adds a special `whenAuthenticated` method onto $routeProvider. This special method,
 * when called, invokes Auth.$requireSignIn() service (see Auth.js).
 *
 * The promise either resolves to the authenticated user object and makes it available to
 * dependency injection (see AccountCtrl), or rejects the promise if user is not logged in,
 * forcing a redirect to the /login page
 */
  .config(['$routeProvider', 'SECURED_ROUTES', function($routeProvider, SECURED_ROUTES) {
    // credits for this idea: https://groups.google.com/forum/#!msg/angular/dPr9BpIZID0/MgWVluo_Tg8J
    // unfortunately, a decorator cannot be use here because they are not applied until after
    // the .config calls resolve, so they can't be used during route configuration, so we have
    // to hack it directly onto the $routeProvider object
    $routeProvider.whenAuthenticated = function(path, route) {
      route.resolve = route.resolve || {};
      route.resolve.user = ['Auth', function(Auth) {
        return Auth.$requireSignIn();
      }];
      $routeProvider.when(path, route);
      SECURED_ROUTES[path] = true;
      return $routeProvider;
    };
  }])

  .config(function($locationProvider) {
    $locationProvider.html5Mode(false).hashPrefix('');
  })

  // configure views; whenAuthenticated adds a resolve method to ensure users authenticate
  // before trying to access that route
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .whenAuthenticated('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })

      .whenAuthenticated('/property_tracts', {
        templateUrl: 'views/tracts/property_tracts.html',
        controller: 'LineListCtrl'
      })

      .whenAuthenticated('/tracts/:tractid', {
        templateUrl: 'views/tracts/tract.html',
        controller: 'TractCtrl'
      })
      .whenAuthenticated('/landowners', {
        templateUrl: 'views/landowners/owners.html',
        controller: 'LandOwnerRecordsCtrl'
      })
      .whenAuthenticated('/landowners/:ownerid', {
        templateUrl: 'views/landowners/landowner_details.html',
        controller: 'LandOwnerDetailsCtrl'
      })
      .whenAuthenticated('/tracts/:tractid/landowners/:landownerid', {
        templateUrl: 'views/tracts/landowners.html',
        controller: 'LandOwnerCtrl'
      })
      .whenAuthenticated('/tracts/:tractid/tenants/:tenantid', {
        templateUrl: 'views/tracts/tenants.html',
        controller: 'TenantCtrl'
      })
      .whenAuthenticated('/tracts/:tractid/easements/:easementid', {
        templateUrl: 'views/tracts/easements.html',
        controller: 'EasementCtrl'
      })
      .whenAuthenticated('/tracts/:tractid/contactreports/:contactreportid', {
        templateUrl: 'views/tracts/contactreport.html',
        controller: 'ContactReportCtrl'
      })
      .whenAuthenticated('/tracts/:tractid/landowners/:landownerid/payments/:landownerpaymentid', {
        templateUrl: 'views/tracts/landownerpayment.html',
        controller: 'LandOwnerPaymentCtrl'
      })
      .whenAuthenticated('/tracts/:tractid/tenants/:tenantid/payments/:tenantpaymentid', {
        templateUrl: 'views/tracts/tenantpayment.html',
        controller: 'TenantPaymentCtrl'
      })
      .whenAuthenticated('/tracts/photos/:tractid', {
        templateUrl: 'views/tracts/photoUpload.html',
        controller: 'PhotoUploadController'
        })

        .whenAuthenticated('/tracts/documents/:tractid', {
          templateUrl: 'views/tracts/docsUpload.html',
          controller: 'TractDocsController'
          })
      .whenAuthenticated('/main', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .whenAuthenticated('/welds', {
        templateUrl: 'views/welds/welds.html',
        controller: 'WeldsCtrl'
      })
      .whenAuthenticated('/welds/:weldid', {
        templateUrl: 'views/welds/weld.html',
        controller: 'WeldCtrl'
      })
      .whenAuthenticated('/welds/files/:weldid', {
        templateUrl: 'views/welds/fileUpload.html',
        controller: 'FileUploadController'
      })

      .whenAuthenticated('/welds/gis/:weldid', {
        templateUrl: 'views/welds/gis.html',
        controller: 'WeldGISCtrl'
      })
      .whenAuthenticated('/maptest', {
        templateUrl: 'views/maptest.html',
        controller: 'GISCtrl'
      })

      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .whenAuthenticated('/account', {
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl'
      })
      .whenAuthenticated('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .whenAuthenticated('/reports', {
        templateUrl: 'views/reports.html',
        controller: 'ReportsCtrl'
      })
      .whenAuthenticated('/management_reports', {
        templateUrl: 'views/management_reports.html',
        controller: 'ManagementReportsCtrl'
      })
      .whenAuthenticated('/management_reports/ROW_Agents', {
        templateUrl: 'views/tools/ROW_Agents.html',
        controller: 'ManagementReportsCtrl'
      })
      .whenAuthenticated('/conctact_report', {
        templateUrl: 'views/contact_report.html',
        controller: 'ContactReportsCtrl'
      })
      .whenAuthenticated('/surveypermissiongraph', {
        templateUrl: 'views/graphs/surveypermissiongraph.html',
        controller: 'SurveyPermissionsGraphCtrl'
      })
      .whenAuthenticated('/acquisitiongraph', {
        templateUrl: 'views/graphs/acquisitiongraph.html',
        controller: 'AcquisitionGraphCtrl'
      })
      .whenAuthenticated('/tools/projectlinelist', {
        templateUrl: 'views/tools/projectlinelist.html',
        controller: 'MasterLineListCtrl'
      })
      .whenAuthenticated('/tools/tractsreport', {
        templateUrl: 'views/tools/tractsreport.html',
        controller: 'PropertiesReportCtrl'
      })
      .whenAuthenticated('/tools/landownersreport', {
        templateUrl: 'views/tools/landownersreport.html',
        controller: 'LandOwnersReportCtrl'
      })
      .whenAuthenticated('/titlesearchgraph', {
        templateUrl: 'views/graphs/titlesearchgraph.html',
        controller: 'TitleSearchGraphCtrl'
      })
      .whenAuthenticated('/costanalysisgraph', {
        templateUrl: 'views/graphs/costanalysisgraph.html',
        controller: 'CostAnalysisGraphCtrl'
      })
      .whenAuthenticated('/tools/titleprogressreport', {
        templateUrl: 'views/tools/titleprogressreport.html',
        controller: 'TitleProgressReportCtrl'
      })
      .whenAuthenticated('/tools/costanalysisreport', {
        templateUrl: 'views/tools/costanalysisreport.html',
        controller: 'CostReportCtrl'
      })
      .whenAuthenticated('/tools/acquisitionreport', {
        templateUrl: 'views/tools/acquisitionreport.html',
        controller: 'AcquisitionReportCtrl'
      })
      .whenAuthenticated('/tools/surveypermissionsreport', {
        templateUrl: 'views/tools/surveypermissionsreport.html',
        controller: 'SurveyPermissionsReportCtrl'
      })
      .whenAuthenticated('/permitstracker', {
        templateUrl: 'views/tools/permitstracker.html',
        controller: 'PermitsReportCtrl'
      })
      .whenAuthenticated('/constructionlinelist', {
        templateUrl: 'views/tools/constructionlinelist.html',
        controller: 'ConstructionLineListCtrl'
      })

      .whenAuthenticated('/tools/weldscrosscheck', {
        templateUrl: 'views/tools/weldscrosscheck.html',
        controller: 'WeldsCrossCheckCtrl'
      })
      // .whenAuthenticated('/tools/surveypermissionreport', {
      //   templateUrl: 'views/tools/surveypermissionreport.html',
      //   controller: 'WeldsCrossCheckCtrl'
      // })
      .whenAuthenticated('/civil_permits', {
        templateUrl: 'views/civil_permits/civil_permits.html',
        controller: 'CivilPermitsCtrl'
      })
      .whenAuthenticated('/civil_permits/:civilpermitid', {
        templateUrl: 'views/civil_permits/civilpermit.html',
        controller: 'CivilPermitCtrl'
      })
      .whenAuthenticated('/civil_permits/documents/:civilpermitid', {
        templateUrl: 'views/civil_permits/civildocs.html',
        controller: 'CivilDocsCtrl'
      })
      .whenAuthenticated('/civil_permits/photos/:civilpermitid', {
        templateUrl: 'views/civil_permits/civilphotos.html',
        controller: 'CivilPhotosCtrl'
      })
      .whenAuthenticated('/environmental_permits', {
        templateUrl: 'views/environmental_permits/environmental_permits.html',
        controller: 'EnvironmentalPermitsCtrl'
      })
      .whenAuthenticated('/environmental_permits/:environmentalpermitid', {
        templateUrl: 'views/environmental_permits/environmental_permit.html',
        controller: 'EnvironmentalPermitCtrl'
      })
      .whenAuthenticated('/environmental_permits/documents/:environmentalpermitid', {
        templateUrl: 'views/environmental_permits/environmentaldocs.html',
        controller: 'EnvironmentalDocsCtrl'
      })
      .whenAuthenticated('/environmental_permits/photos/:environmentalpermitid', {
        templateUrl: 'views/environmental_permits/environmentalphotos.html',
        controller: 'EnvironmentalPhotosCtrl'
      })
      .whenAuthenticated('/utility_permits', {
        templateUrl: 'views/utility_permits/utility_permits.html',
        controller: 'UtilityPermitsCtrl'
      })
      .whenAuthenticated('/utility_permits/:utilitypermitid', {
        templateUrl: 'views/utility_permits/utility_permit.html',
        controller: 'UtilityPermitCtrl'
      })
      .whenAuthenticated('/utility_permits/documents/:utilitypermitid', {
        templateUrl: 'views/utility_permits/utilitydocs.html',
        controller: 'UtilityDocsCtrl'
      })
      .whenAuthenticated('/utility_permits/photos/:utilitypermitid', {
        templateUrl: 'views/utility_permits/utilityphotos.html',
        controller: 'UtilityPhotosCtrl'
      })
      .whenAuthenticated('/personnel', {
        templateUrl: 'views/personnel/personnel_list.html',
        controller: 'PersonnelCtrl'
      })
      .whenAuthenticated('/personnel/:agentid', {
        templateUrl: 'views/personnel/personnel.html',
        controller: 'FieldAgentCtrl'
      })
      .whenAuthenticated('/map_zoom/:mapid', {
        templateUrl: 'views/map_zoom.html',
        controller: 'MapZoomCtrl'
      })
      .otherwise({redirectTo: '/'});
  }])

  .config(function (LightboxProvider) {
    LightboxProvider.getImageUrl = function (image) {
      if (image.fullImg && image.fullImg !== 'images/loading.jpeg'){
        return image.fullImg;
      }
      else{
        return image.preview;
      }
    };

    LightboxProvider.getImageCaption = function (image) {
      return image.fileName;
    };
  })
  .config(function (localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('mtsinspect')
      .setStorageType('sessionStorage')
      .setNotify(true, true)
  })

  /**
   * Apply some route security. Any route's resolve method can reject the promise with
   * "AUTH_REQUIRED" to force a redirect. This method enforces that and also watches
   * for changes in auth status which might require us to navigate away from a path
   * that we can no longer view.
   */
  .run(['$rootScope', '$location', 'Auth', 'SECURED_ROUTES', 'loginRedirectPath', 'Ref', '$firebaseObject',
    function($rootScope, $location, Auth, SECURED_ROUTES, loginRedirectPath, Ref, $firebaseObject) {
      // watch for login status changes and redirect if appropriate
      Auth.$onAuthStateChanged(check);

      // some of our routes may reject resolve promises with the special {authRequired: true} error
      // this redirects to the login page whenever that is encountered
      $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
        if( err === 'AUTH_REQUIRED' ) {
          $location.path(loginRedirectPath);
        }
      });

      function check(user) {
        if( !user && authRequired($location.path()) ) {
          $location.path(loginRedirectPath);
        }

        if (user) {
          $rootScope.user = {};
          $rootScope.user.email = user.email;
          $rootScope.user.uid = user.uid;
          var profile = $firebaseObject(Ref.child('users/'+user.uid));

          profile.$loaded().then(function(data){
            $rootScope.user.name = (data.name) ? data.name : '';
            $rootScope.user.title = (data.title) ? data.title : '';
            $rootScope.user.picture = (data.picture) ? data.picture : '';
            $rootScope.user.roles = (data.roles) ? data.roles : '';

            $rootScope.$broadcast('security:userloaded', {
              roles: $rootScope.user.roles
            });
          });
        }


      }

      function authRequired(path) {
        return SECURED_ROUTES.hasOwnProperty(path);
      }
    }
  ])
  .run(function($rootScope, $location, Ref) {
      $rootScope.location = $location;

      var connectRef = Ref.child('.info').child('connected'); //new $window.Firebase(FBURL + '/.info/connected'); //Ref.child('.info').child('connected');
      connectRef.on("value", function(snap) {
        if (snap.val() === true) {
          $rootScope.$broadcast('firebase:connectionChanged', {
            connected: true
          });
        } else {
          $rootScope.$broadcast('firebase:connectionChanged', {
            connected: false
          });
        }
      });
  })
  // used by route security
  .constant('SECURED_ROUTES', {});
