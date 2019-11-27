'use strict';
var apiHost = 'http://localhost:3100';

angular.module('allKeyApp')
  .controller('MainCtrl', function ($scope, $routeParams, $route,$http, $q) {

    var page = $routeParams.id || 1;
    var pageFix = new BigNumber(page).minus(1);
    var numberPerPage = 16;
    var statInt = pageFix.times(numberPerPage);

    var maxInt = new BigNumber('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16).toString(10);
    var maxPage = new BigNumber('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16).dividedBy(numberPerPage).toFixed(0).toString(10);

    var items = [];
    var i = 1;
    var timer = setInterval(function () {
      var int = statInt.plus(i).toString(10);
      if (int >= 1 && new BigNumber(int).lte(maxInt)) {
        items[i - 1] = util.intToBitcoinAddress(int);
      } else {
        clearInterval(timer);
      }
      $scope.items = items;
      $scope.$apply();
      if (i >= numberPerPage) {
        clearInterval(timer);
      }
      i++;
    }, 1);


    $scope.isLoading = false;
    $scope.page = page;
    $scope.maxPage = maxPage;
    $scope.prev = pageFix.toString(10);
    $scope.next = pageFix.plus(2).toString(10);

    $scope.toTop = function () {
      $scope.searchInput = '';
      $(window).scrollTop(0);
    };
    $scope.searchInput = '';
    $scope.reloadPage = function () {
      $route.reload();
    };

    ///////////////////////////////////////////////////////////////
    var findInDatabase = function findInDatabase(value){
      var url = apiHost+'/object/'+value;
      var def = $q.defer();
      $http.get(url).then(function(response) {
        console.info(response.data);
        $scope.items = response.data;
        def.resolve(response);
      }, function(reason) {
        console.error(['error',reason]);
        def.reject(reason);
      });
      return def.promise;
    };
    // findInDatabase('12XbfB9SUGAFKWQhPtm2bV7VJPM6YytBds');
    ///////////////////////////////////////////////////////////////

    $scope.findAll = function () {
      $scope.isLoading = true;
      if ($scope.searchInput === '') {
        $scope.isLoading = false;
        return;
      }
      if ($scope.items.length < 2) {
        var response = $scope.items[0];
        var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
          response.privateKey === $scope.searchInput;
        if (check) {
          $scope.isLoading = false;
          return;
        }
      } else {
        $scope.items.forEach(value => {
          var response = value;
          var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
            response.privateKey === $scope.searchInput;
          if (check) {
            $scope.items = [response];
            $scope.isLoading = false;
          }
        });
      }

      if ($scope.searchInput.length > 34) {
        var result = util.privateKeyToBitcoinAddress($scope.searchInput);
        if (result) {
          console.info({
            result: result,
            note: 'find by key'
          });
          $scope.items = [result];
          $scope.isLoading = false;
        }
      } else  {
        $scope.isLoading = true;

        var found = false;
        // $scope.storage.forEach((value, index) => {
        //   var response = value;
        //   var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
        //     response.privateKey === $scope.searchInput;
        //   if (check) {
        //     $scope.items = [response];
        //     $scope.isLoading = false;
        //     found = true;
        //     console.info('found and index = ',index);
        //   }
        // });

        // find in database
        // findInDatabase($scope.searchInput);

        $scope.isLoading = true;

        // timer
        var i2 = 1;
        var timer2 = setInterval(function () {
          var int = statInt.plus(i2).toString(10);
          if (int >= 1 && new BigNumber(int).lte(maxInt)) {
              var response = util.intToBitcoinAddress(int);
              var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
                response.privateKey === $scope.searchInput;
              if (check) {
                $scope.items = [response];
                $scope.isLoading = false;
                found = true;
                console.info('found and index = ', i2);
              }
          } else {
            clearInterval(timer2);
          }
          $scope.$apply();
          i2++;
        }, 0);

      }
    };

    /////////////////////////////////////////////////////


    var postApi = function postApi(data){
      var url = apiHost+'/object';
      var def = $q.defer();
      $http({
        method: 'POST',
        url: url,
        dataType: 'json',
        data: data,
        headers: { "Content-Type": "application/json" }
      }).then(function(result) {
        def.resolve('ok');
      }, function(error) {
        def.reject('error');
      });
      return def.promise;
    };

    var runTimer = function (count) {
      var counter = count>1?count:1;
      $scope.storage = [];
      var timer2 = setInterval(function () {
        var int = statInt.plus(counter).toString(10);
        if (int >= 1 && new BigNumber(int).lte(maxInt)) {
          var result  =util.intToBitcoinAddress(int);
          var object = {
            privateKey: result.privateKey ,
            addressCompressed: result.addressCompressed,
            addressUnCompressed: result.addressUnCompressed,
            index:counter,
          };
          //
          postApi(object).then(response=>{
            // console.info('success',response);
          },reason => {
            // console.error('error',reason);
          });
          //
          $scope.storage.push(object);
        } else {
          clearInterval(timer);
        }
        $scope.$apply();
        if (counter >= 1000000000) {
          console.info('counter',counter);
          console.info('storage length',$scope.storage.length);
          console.info('last elem',$scope.storage[$scope.storage.length-1]);
          clearInterval(timer2);
        }
        counter++;
      }, 0.5);
    };
    // runTimer(0);
    ///////////////////////


    var countDocuments = function countDocuments() {
      var url = apiHost+'/object/count';
      var def = $q.defer();
      $http.get(url).then(function(response) {
        console.info(['success',response.data]);
        runTimer(response.data.count+1);
        def.resolve(response.data.count);
      }, function(reason) {
        console.error(['error',reason]);
        def.reject(reason);
      });
      return def.promise;
    };
    // countDocuments();
    /////////////////////////


  });
