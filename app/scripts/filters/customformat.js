'use strict';

angular.module('mts.fieldbook').filter('stationfmt', function() {
  return function(input) {
    if(isNaN(input)) {
      return input;
    } else {
      input = parseInt(input);
      var strNum = input.toString();
      var il = strNum.length;

      if (il <= 2) {
        return input;
      } else {
        return strNum.substr(0, il-2) + '+' + strNum.substr(il-2, il-1);
      }

    }
  };
})
  .filter('propsFilter', function() {
    return function(items, props) {
      var out = [];

      if (angular.isArray(items)) {
        var keys = Object.keys(props);

        items.forEach(function(item) {
          var itemMatches = false;

          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };
  })
  .filter('personnelFilter', function() {
    return function(items, certField) {
      var out = [];

      if (angular.isArray(items)) {

        items.forEach(function(item) {
          var itemMatches = false;

          if (typeof item[certField] !== 'undefined' && item[certField] !== '') {
            itemMatches = true;
          }

          if (typeof item['inactiveflag'] !== 'undefined' && item['inactiveflag'] === true) {
            itemMatches = false;
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };
  })
  .factory('Applicators', function(Ref, $firebaseArray, WORKSPACE, $rootScope) {
    var Applicators = $firebaseArray.$extend({

      // override $$added to include users
      $$added: function(snap) {
        // call the super method
        var record = $firebaseArray.prototype.$$added.call(this, snap);

        record.blastkey = record.name + '|' + record.blastcert;
        record.coatkey = record.name;

        return record;
      }

    });
    return Applicators;
  })
  .filter('spaceCommas',function() {
    return function(input) {
        if (input) {
            return input.replace(/,+/g, ', ');
        }
    }
  })
  .filter('makeRange', function() {
        return function(input) {
            var lowBound, highBound;
            switch (input.length) {
            case 1:
                lowBound = 0;
                highBound = parseInt(input[0]) - 1;
                break;
            case 2:
                lowBound = parseInt(input[0]);
                highBound = parseInt(input[1]);
                break;
            default:
                return input;
            }
            var result = [];
            for (var i = lowBound; i <= highBound; i++)
                result.push(i);
            return result;
        };
    });