angular.module('firebase.config', [])
  .constant('FBURL', 'https://fieldbook-p2k.firebaseio.com')
  .constant('FBAUTHDOMAIN', 'fieldbook-p2k.firebaseapp.com')
  .constant('FBKEY', 'AIzaSyDQxCDGBgOITlVv22QED-rSSjCgOxfG2VI')
  .constant('FBSTORAGEBUCKET', 'fieldbook-p2k.appspot.com')

  .constant('WORKSPACE', 'workspace_1')
  .constant('ROW', 'fieldbook-p2k')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password'])

  .constant('loginRedirectPath', '/login');
