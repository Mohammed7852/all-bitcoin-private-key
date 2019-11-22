'use strict';

/**
 * @ngdoc function
 * @name allKeyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the allKeyApp
 */
angular.module('allKeyApp')
  .controller('MainCtrl', function ($scope, $routeParams, $route, $timeout) {

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
      var int16 = statInt.plus(i).toString(16);
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
    $scope.findByPrivateKey = function () {
      if ($scope.searchInput === '') {
        $scope.toTop();
        return;
      }
      console.log('we are in search function');
      var result = util.privateKeyToBitcoinAddress($scope.searchInput);
      $scope.items = [result];
      console.log(['result', result]);
      var btcKey = new Bitcoin.ECKey($scope.searchInput);
      btcKey.compressed = false;
      console.log([btcKey.getExportedPrivateKey()]);
    };

    $scope.reloadPage = function () {
      $route.reload();
    };

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

        var response = {};
        var found = false;

        var copy = angular.copy($scope.storage);
        console.log(['copy length =',copy.length]);
        console.log(['copy 1500 =',copy[1500]]);
        copy.forEach(value => {
          var response = value;
          var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
            response.privateKey === $scope.searchInput;
          if (check) {
            $scope.items = [response];
            $scope.isLoading = false;
            found = true;
          }
        });
        console.log(['found',found]);
        $scope.isLoading = false;
        // console.info(['search =',$scope.searchInput]);
        // $scope.$apply();
        // var i = 1;
        // setTimeout(()=>{
        //   while (true){
        //     console.log(i);
        //     // var timer = setInterval(function () {
        //     // console.log(i);
        //     var int = statInt.plus(i).toString(10);
        //     var int16 = statInt.plus(i).toString(16);
        //
        //     if (int >= 1 && new BigNumber(int).lte(maxInt)) {
        //       response = util.intToBitcoinAddress(int);
        //       console.info(response.privateKey);
        //     } else {
        //
        //       console.info(['not found', int, maxInt, i]);
        //       $scope.isLoading = false;
        //       // clearInterval(timer);
        //       break;
        //     }
        //     if (response !== null && response !== undefined) {
        //       if (response.addressUnCompressed === $scope.searchInput) {
        //         $scope.items = [response];
        //         found = true;
        //         $scope.isLoading = false;
        //         $scope.$apply();
        //         // clearInterval(timer);
        //         break;
        //       }
        //       if (response.addressCompressed === $scope.searchInput) {
        //         $scope.items = [response];
        //         found = true;
        //         $scope.isLoading = false;
        //         $scope.$apply();
        //         // clearInterval(timer);
        //         break;
        //       }
        //       if (response.privateKey === $scope.searchInput) {
        //         $scope.items = [response];
        //         found = true;
        //         $scope.isLoading = false;
        //         $scope.$apply();
        //         // clearInterval(timer);
        //         break;
        //       }
        //     }
        //     i++;
        //
        //     // var timeout = $timeout( function(){
        //     //   $scope.isLoading = false;
        //     //   clearInterval(timer);
        //     //   clearTimeout(timeout);
        //     //   if(!found){
        //     //     console.error('good bye  : not found');
        //     //     $scope.reloadPage();
        //     //   }
        //     // }, 180000 );
        //     // }, 1);
        //
        //   }
        //
        // },500);
      }


    };

    //

    $scope.findInStorage = function () {
      $scope.isLoading = true;
      console.info(['storage length = ',$scope.storage.length]);
      $scope.storage.forEach(value => {
        var response = value;
        var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
          response.privateKey === $scope.searchInput;
        if (check) {
          $scope.items = [response];
          $scope.$apply();
          $scope.isLoading = false;
        }
      });
      console.log(['found = ',$scope.items]);
      $scope.isLoading = false;
    };

    //
    $scope.storage = [];
    var counter = 1;
    var timer2 = setInterval(function () {
      var int = statInt.plus(counter).toString(10);
      if (int >= 1 && new BigNumber(int).lte(maxInt)) {
        var data = util.intToBitcoinAddress(int);
        $scope.storage.push(data);
      } else {
        clearInterval(timer2);
      }
      $scope.$apply();
      // console.log(counter);
      counter++;
    }, 0.5);

  });
