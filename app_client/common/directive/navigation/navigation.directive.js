(function(){
	angular
		.module("voting-app")
		.directive("navigation", navigation);
	function navigation(){
		return {
			restrict: "EA",
			templateUrl: "/common/directive/navigation/navigation.template.html"
		}
	}
})();