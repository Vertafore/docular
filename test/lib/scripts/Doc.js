var Doc = require('../../../lib/scripts/Doc');
console.log(Doc)
exports.getModuleInfo = function (test) {
    var getModuleInfo = Doc.prototype.getModuleInfo;
    
    test.deepEqual(getModuleInfo.apply({id: 'vf.core.Class.factory_Class'}), {
        module: 'vf.core.Class',
        section: 'factory',
        item: 'Class',
        subItem: null
    });
    
    test.deepEqual(getModuleInfo.apply({id: 'vf.services.LocalStorage', docType: 'service'}), {
        module: 'vf.services.LocalStorage',
        section: 'service',
        item: 'LocalStorage',
        subItem: null
    });
    
    test.deepEqual(getModuleInfo.apply({id: 'vf.widgets.behaviors.PullToRefresh.directive_vfPullable'}), {
        module: 'vf.widgets.behaviors.PullToRefresh',
        section: 'directive',
        item: 'vfPullable',
        subItem: null
    });
    
    test.deepEqual(getModuleInfo.apply({id: '$animate', docType: 'provider'}), {
        module: '$animate',
        section: 'provider',
        item: '$animate',
        subItem: null
    });
    
    
    test.deepEqual(getModuleInfo.apply({id: 'form.FormController', docType: 'type'}), {
        module: 'form.FormController',
        section: 'type',
        item: 'FormController',
        subItem: null
    });
    
    test.deepEqual(getModuleInfo.apply({id: 'form.FormController_$rollbackViewValue', docType: 'method'}), {
        module: 'form.FormController',
        section: 'method',
        item: '$rollbackViewValue',
        subItem: null
    });
    
    test.deepEqual(getModuleInfo.apply({id: 'ngModel.NgModelController_$setValidity', docType: 'method'}), {
        module: 'ngModel.NgModelController',
        section: 'method',
        item: '$setValidity',
        subItem: null
    });
    
    test.deepEqual(getModuleInfo.apply({id: 'ngMobile.directive_ngTap'}), {
        module: 'ngMobile',
        section: 'directive',
        item: 'ngTap',
        subItem: null
    });
    
    test.deepEqual(getModuleInfo.apply({id: '$exceptionHandlerProvider_mode', docType: 'method'}), {
        module: '$exceptionHandlerProvider',
        section: 'method',
        item: 'mode',
        subItem: null
    });
    
    test.deepEqual(getModuleInfo.apply({id: 'angular.isString', docType: 'function'}), {
        module: 'angular',
        section: 'function',
        item: 'isString',
        subItem: null
    });
    
    test.done();
}