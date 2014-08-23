angular.module('docular.controllers', [
    'docular.services',
    'docular.directives'
])
    .controller('AppController', ['$scope', function ($scope) {
            
    }])        
    .controller('IndexPageController', [
            '$scope', 'group', 'documents', 'dataFilter', '$injector', '$route', '$controller',
            function ($scope, group, documents, dataFilter, $injector, $route, $controller) {
        
        $scope.group = group;
        $scope.groups = group.groups;
        $scope.groupId = group.groupId;
        $scope.documents = documents;
        $scope.dataFilter = dataFilter;
        
        $scope.hiddenItems = {};
        $scope.toggleItem = function (id) {
            $scope.hiddenItems[id] = !$scope.hiddenItems[id];
            localStorage.setItem('toggle-' + id, !$scope.hiddenItems[id]);
        };
        $scope.getItemToggleStatus = function (id) {
            var r = JSON.parse(localStorage.getItem('toggle-' + id));
            return r === null ? true : r;
        };
        
        var documentationItem;
        if($route.current.params.name) {
            documentationItem = dataFilter(documents, {name: $route.current.params.name, root: $route.current.params.root});
            if(!documentationItem.length) {
                documentationItem = dataFilter(documents, {name: $route.current.params.name});
            }
            if(documentationItem.length) {
                if(documentationItem.length > 1) { console.warn("Found multiple for ", $route.current.params.name); }
                documentationItem = documentationItem[0];
            } else {
                documentationItem = null;
            }
            console.log(documentationItem);
        }
        
        $scope.documentationItem = documentationItem;
        if(!documentationItem) {
            $scope.isIndex = true;
        } else {
            $scope.controller = 'docular.plugin.' + documentationItem.handler + '.documentationController', {$scope: $scope.$new()};
            $scope.includeUrl = 'resources/plugins/' + documentationItem.handler + '/documentationPartial.html';
        }
        
        $scope.fetchDocumentItems = function (module) {
            var items = dataFilter(documents, {level: 1, root: module.id});
            var itemGroups = [], itemGroupIndexes = {};
            for(var i = 0, l = items.length; i < l; i++) {
                var item = items[i];
                if(itemGroupIndexes[item.type] === undefined) {
                    itemGroupIndexes[item.type] = itemGroups.length;
                    itemGroups.push({
                        type: item.type,
                        items: []
                    });
                }
                itemGroups[itemGroupIndexes[item.type]].items.push(item);
            }
            itemGroups = itemGroups.sort(function (a, b) {
                if(a.type > b.type) {
                    return 1;
                } else if (a.type < b.type) {
                    return -1;
                }
                return 0;
            })
            return itemGroups;
        }
        
        $scope.sortedDocuments = {};
        var rootLevelDocs = $scope.rootLevelDocs = dataFilter(documents, {level: 0});
        for(var i = 0, l = rootLevelDocs.length; i < l; i++) {
            $scope.sortedDocuments[rootLevelDocs[i].id] = $scope.fetchDocumentItems(rootLevelDocs[i]);
        }
        
    }]);