angular.module('docular.controllers', [
    'docular.services',
    'docular.directives'
])
    .controller('AppController', ['$scope', function ($scope) {
            
    }])        
    .controller('IndexPageController', [
            '$scope', 'config', 'group', 'documents', 'documentation', 'dataFilter',
            function ($scope, config, group, documents, documentationProvider, dataFilter) {
        
        $scope.groups = group.groups;
        $scope.groupId = group.groupId;
        $scope.documents = documents;
        $scope.dataFilter = dataFilter;
    }]);