(function(angular) {
	'use strict';

	angular.module('Shell').controller('Shell.Controller', 
		function($scope) {
			var vm = $scope.vm = {};
			vm.hello = 'HELLO !';
		});

})(window.angular);