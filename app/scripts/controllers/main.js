'use strict';
var apiHost = 'http://35.223.173.40:3000';

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
      var url = apiHost+'/address/getOne';
      var def = $q.defer();
      $http({
        method: 'POST',
        url: url,
        dataType: 'json',
        data: {search:value},
        headers: { "Content-Type": "application/json" }
      }).then(function(response) {
        console.info('found in database , ' , response.data);
        $scope.items = response.data;
        $scope.isLoading = false;
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
        console.info('empty search input');
        $scope.isLoading = false;
        return;
      }
      var found = false;
      $scope.items.forEach(value => {
        var response = value;
        var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
          response.privateKey === $scope.searchInput;
        if (check) {
          found = true;
          console.info('found in this page');
          $scope.items = [response];
          $scope.isLoading = false;
        }
      });

      if(!found){
        if ($scope.searchInput.length > 34) {
          var result = util.privateKeyToBitcoinAddress($scope.searchInput);
          if (result) {
            console.info({
              result: result,
              note: 'find by key'
            });
            $scope.items = [result];
            $scope.isLoading = false;
            return;
          }
        } else  {
          // find in database
          findInDatabase($scope.searchInput);

          // timer
          // var i2 = 1;
          // var timer2 = setInterval(function () {
          //   var int = statInt.plus(i2).toString(10);
          //   if (int >= 1 && new BigNumber(int).lte(maxInt)) {
          //       var response = util.intToBitcoinAddress(int);
          //       var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
          //         response.privateKey === $scope.searchInput;
          //       if (check) {
          //         $scope.items = [response];
          //         $scope.isLoading = false;
          //         found = true;
          //         console.info('found and index = ', i2);
          //       }
          //   } else {
          //     clearInterval(timer2);
          //   }
          //   $scope.$apply();
          //   i2++;
          // }, 0);
        }
      }
    };

    /////////////////////////////////////////////////////


    var postApi = function postApi(data){
      var url = apiHost+'/address';
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
      console.info('start run timer , count = ',count);
      var counter = count>1?count:1;
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
          postApi({
            address:object
          }).then(response=>{
            // console.info('success',response);
          },reason => {
            console.error('error',reason);
          });
        } else {
          clearInterval(timer);
        }
        $scope.$apply();
        if (counter >= new BigNumber(int).gte(maxInt)) {
          console.info('counter',counter);
          clearInterval(timer2);
        }
        counter++;
      }, 0.2);
    };
    // runTimer(0);
    ///////////////////////

    var countDocuments = function countDocuments() {
      var url = apiHost+'/address/countAll';
      var def = $q.defer();
      console.info('before count data , url=',url);
      $http.get(url).then(function(response) {
        console.info('success count data , response=',response);
        var count = response.data;
        if(parseInt(count) >1){
          runTimer(response.data+1);
          def.resolve(response.data);
        } else {
          console.log('count data is <0');
          def.resolve(response.data.count);
        }


      }, function(reason) {
        console.error(['error',reason]);
        def.reject(reason);
      });
      return def.promise;
    };
    countDocuments();
    /////////////////////////


  });
