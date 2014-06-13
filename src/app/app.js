(function(angular) {
	'use strict';

	angular.module('SPAngular', []).controller('SPAngular.ShellController',
		function($scope) {
			var vm = $scope.vm = {};
			vm.hello = 'HELLO SPANGULAR!';
		}
	);

})(window.angular);

