angular.module('docular.controllers', [
    'docular.services',
    'docular.directives'
])
    .controller('AppController', ['$scope', function ($scope) {
            
    }])        
    .controller('IndexPageController', ['$scope', 'config', '$route', 'group', 'documents', function ($scope, config, $route, group, documents) {
        console.log(documents)
        $scope.groups = group.groups;
        $scope.groupId = group.groupId;
        
    }]);