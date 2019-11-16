'use strict';

/**
 * @ngdoc function
 * @name allKeyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the allKeyApp
 */
angular.module('allKeyApp')
  .controller('MainCtrl', function ($scope, $routeParams, $route,$timeout) {

    var page = $routeParams.id || 1;
    var pageFix = new BigNumber(page).minus(1);
    var numberPerPage = 16;
    var statInt = pageFix.times(numberPerPage);

    var maxInt = new BigNumber('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16).toString(10);
    var maxPage = new BigNumber('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16).dividedBy(numberPerPage).toFixed(0).toString(10);

    var items = [];
    // for (var i = 1; i <= numberPerPage; i++) {
    // 	var int = statInt.plus(i).toString(10);
    // 	var int16 = statInt.plus(i).toString(16);

    // 	if (int >= 1 && new BigNumber(int).lte(maxInt)) {
    // 		items[i] = util.intToBitcoinAddress(int);
    // 	}

    // }

    // $scope.items = items;

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

    $scope.search = function(){
      $scope.findAll();
    };

    $scope.findAll = function () {
      $scope.isLoading = true;

      if($scope.searchInput === ''){
        $scope.isLoading = false;
        return;
      }

      if ($scope.items.length <2) {
        var response = $scope.items[0];
        var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
          response.privateKey === $scope.searchInput;
        if(check){
          $scope.isLoading = false;
          return;
        }
      } else {
        $scope.items.forEach(value => {
          var response = value;
          var check = response.addressUnCompressed === $scope.searchInput || response.addressCompressed === $scope.searchInput ||
            response.privateKey === $scope.searchInput;
          if(check){
            $scope.items = [response];
            $scope.isLoading = false;
            return;
          }
        });
      }

      var response = {};
      var found = false;

      // console.info(['search =',$scope.searchInput]);
      var i = 1;
      var timer = setInterval(function () {
        // console.log(i);
        var int = statInt.plus(i).toString(10);
        var int16 = statInt.plus(i).toString(16);

        if (int >= 1 && new BigNumber(int).lte(maxInt)) {
          response = util.intToBitcoinAddress(int);
          // console.info(['response =',response]);
        } else {
          console.info(['not found',int,maxInt,i]);
          $scope.isLoading = false;
          clearInterval(timer);
        }
        if(response!==null && response!==undefined){
          if(response.addressUnCompressed === $scope.searchInput){
            $scope.items = [response];
            found =true;
            $scope.isLoading = false;
            $scope.$apply();
            clearInterval(timer);
          }
          if(response.addressCompressed === $scope.searchInput){
            $scope.items = [response];
            found = true;
            $scope.isLoading = false;
            $scope.$apply();
            clearInterval(timer);
          }
          if(response.privateKey === $scope.searchInput){
            $scope.items = [response];
            found = true;
            $scope.isLoading = false;
            $scope.$apply();
            clearInterval(timer);
          }
        }
        i++;

        var timeout = $timeout( function(){
          $scope.isLoading = false;
          clearInterval(timer);
          clearTimeout(timeout);
          if(!found){
            console.error('good bye  : not found');
            $scope.reloadPage();
          }
        }, 180000 );
      }, 1);
    };


  });
