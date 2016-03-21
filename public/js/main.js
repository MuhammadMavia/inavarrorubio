/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    "firebase"
]);

MetronicApp.run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
          console.log(fromState);
            var firebaseToken = localStorage.getItem("firebase:session::ahead-guest");
            if (toState.name.slice(0, toState.name.indexOf(".")) === "app" && !firebaseToken) {
                event.preventDefault();
                $state.go("login")
            }
            else if (toState.name === "login" && firebaseToken) {
                event.preventDefault();
                $state.go(fromState.name)
            }
        })
    })


/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);


/********************************************
 BEGIN: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/
/**
`$controller` will no longer look for controllers on `window`.
The old behavior of looking on `window` for controllers was originally intended
for use in examples, demos, and toy apps. We found that allowing global controller
functions encouraged poor practices, so we resolved to disable this behavior by
default.

To migrate, register your controllers with modules rather than exposing them
as globals:

Before:

```javascript
function MyController() {
  // ...
}
```

After:

```javascript
angular.module('myApp', []).controller('MyController', [function() {
  // ...
}]);

Although it's not recommended, you can re-enable the old behavior like this:

```javascript
angular.module('myModule').config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
**/

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: './assets',
        globalPath: './assets/global',
        layoutPath: './assets/layouts/layout',
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function() {
        //App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
    });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller('QuickSidebarController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
       setTimeout(function(){
            QuickSidebar.init(); // init quick sidebar
        }, 2000)
    });
}]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/login");

    $stateProvider

        // App

        .state('app', {
            url: "/app",
            templateUrl: "views/app.html",
            data: {pageTitle: 'App Template'},

        })
        // Login
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            data: {pageTitle: 'Login Template'},
            controller: "LoginController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: ['js/controllers/DashboardController.js',
                            'js/controllers/LoginController.js',
                        ]
                    });
                }]
            }
        })

        // Dashboard
        .state('app.dashboard', {
            url: "/dashboard",
            views: {
               'AppContent': {
                 templateUrl: "views/dashboard.html",
                 data: {pageTitle: 'Admin Dashboard Template'},
                 controller: "DashboardController",
                 resolve: {
                     deps: ['$ocLazyLoad', function($ocLazyLoad) {
                         return $ocLazyLoad.load({
                             name: 'MetronicApp',
                             insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                             files: ['js/controllers/DashboardController.js',
                                 './assets/global/plugins/morris/morris.css',
                                 './assets/global/plugins/morris/morris.min.js',
                                 './assets/global/plugins/morris/raphael-min.js',
                                 './assets/global/plugins/jquery.sparkline.min.js',
                                 './assets/pages/scripts/dashboard.min.js',
                                 'js/controllers/DashboardController.js',
                             ]
                         });
                     }]
                 }
               }
           }
        })

        // AngularJS plugins
        .state('app.fileupload', {
            url: "/file_upload",
            views: {
                   'AppContent': {
                          templateUrl: "views/file_upload.html",
                          data: {pageTitle: 'AngularJS File Upload'},
                          controller: "GeneralPageController",
                          resolve: {
                              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                  return $ocLazyLoad.load([{
                                      name: 'angularFileUpload',
                                      files: ['js/controllers/DashboardController.js',
                                          './assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js',
                                      ]
                                  }, {
                                      name: 'MetronicApp',
                                      files: ['js/controllers/DashboardController.js',
                                          'js/controllers/GeneralPageController.js'
                                      ]
                                  }]);
                              }]
                          }
                        }
                      }
                    })

        // UI Select
        .state('app.uiselect', {
            url: "/ui_select",
            views: {
               'AppContent': {
                    templateUrl: "views/ui_select.html",
                    data: {pageTitle: 'AngularJS Ui Select'},
                    controller: "UISelectController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                name: 'ui.select',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/angularjs/plugins/ui-select/select.min.css',
                                    './assets/global/plugins/angularjs/plugins/ui-select/select.min.js'
                                ]
                            }, {
                                name: 'MetronicApp',
                                files: ['js/controllers/DashboardController.js',
                                    'js/controllers/UISelectController.js'
                                ]
                            }]);
                        }]
                    }
                  }
                }
        })

        // UI Bootstrap
        .state('app.uibootstrap', {
            url: "/ui_bootstrap.html",
            views: {
               'AppContent': {
                    templateUrl: "views/ui_bootstrap.html",
                    data: {pageTitle: 'AngularJS UI Bootstrap'},
                    controller: "GeneralPageController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                name: 'MetronicApp',
                                files: ['js/controllers/DashboardController.js',
                                    'js/controllers/GeneralPageController.js'
                                ]
                            }]);
                        }]
                    }
                  }
                }
        })

        // Tree View
        .state('app.tree', {
            url: "/tree",
            views: {
               'AppContent': {
                    templateUrl: "views/tree.html",
                    data: {pageTitle: 'jQuery Tree View'},
                    controller: "GeneralPageController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/jstree/dist/themes/default/style.min.css',

                                    './assets/global/plugins/jstree/dist/jstree.min.js',
                                    './assets/pages/scripts/ui-tree.min.js',
                                    'js/controllers/GeneralPageController.js'
                                ]
                            }]);
                        }]
                    }
                  }
                }
        })

        // Form Tools
        .state('app.formtools', {
            url: "/form-tools",
            views: {
               'AppContent': {
                    templateUrl: "views/form_tools.html",
                    data: {pageTitle: 'Form Tools'},
                    controller: "GeneralPageController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                    './assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                                    './assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css',
                                    './assets/global/plugins/typeahead/typeahead.css',

                                    './assets/global/plugins/fuelux/js/spinner.min.js',
                                    './assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                    './assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                    './assets/global/plugins/jquery.input-ip-address-control-1.0.min.js',
                                    './assets/global/plugins/bootstrap-pwstrength/pwstrength-bootstrap.min.js',
                                    './assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
                                    './assets/global/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js',
                                    './assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
                                    './assets/global/plugins/typeahead/handlebars.min.js',
                                    './assets/global/plugins/typeahead/typeahead.bundle.min.js',
                                    './assets/pages/scripts/components-form-tools-2.min.js',

                                    'js/controllers/GeneralPageController.js'
                                ]
                            }]);
                        }]
                    }
                  }
                }
        })

        // Date & Time Pickers
        .state('app.pickers', {
            url: "/pickers",
            views: {
               'AppContent': {
                    templateUrl: "views/pickers.html",
                    data: {pageTitle: 'Date & Time Pickers'},
                    controller: "GeneralPageController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/clockface/css/clockface.css',
                                    './assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                    './assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                                    './assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css',
                                    './assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    './assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',

                                    './assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                    './assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                                    './assets/global/plugins/clockface/js/clockface.js',
                                    './assets/global/plugins/moment.min.js',
                                    './assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js',
                                    './assets/global/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.js',
                                    './assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

                                    './assets/pages/scripts/components-date-time-pickers.min.js',

                                    'js/controllers/GeneralPageController.js'
                                ]
                            }]);
                        }]
                    }
                  }
                }
        })

        // Custom Dropdowns
        .state('app.dropdowns', {
            url: "/dropdowns",
            views: {
               'AppContent': {
                    templateUrl: "views/dropdowns.html",
                    data: {pageTitle: 'Custom Dropdowns'},
                    controller: "GeneralPageController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                    './assets/global/plugins/select2/css/select2.min.css',
                                    './assets/global/plugins/select2/css/select2-bootstrap.min.css',

                                    './assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                    './assets/global/plugins/select2/js/select2.full.min.js',

                                    './assets/pages/scripts/components-bootstrap-select.min.js',
                                    './assets/pages/scripts/components-select2.min.js',

                                    'js/controllers/GeneralPageController.js'
                                ]
                            }]);
                        }]
                    }
                  }
                }
        })

        // Advanced Datatables
        .state('app.datatablesAdvanced', {
            url: "/datatables/managed.html",
            views: {
               'AppContent': {
                    templateUrl: "views/datatables/managed.html",
                    data: {pageTitle: 'Advanced Datatables'},
                    controller: "GeneralPageController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/datatables/datatables.min.css',
                                    './assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                                    './assets/global/plugins/datatables/datatables.all.min.js',

                                    './assets/pages/scripts/table-datatables-managed.min.js',

                                    'js/controllers/GeneralPageController.js'
                                ]
                            });
                        }]
                    }
                  }
                }
        })

        // Ajax Datetables
        .state('app.datatablesAjax', {
            url: "/datatables/ajax.html",
            views: {
               'AppContent': {
                    templateUrl: "views/datatables/ajax.html",
                    data: {pageTitle: 'Ajax Datatables'},
                    controller: "GeneralPageController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/datatables/datatables.min.css',
                                    './assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                    './assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',

                                    './assets/global/plugins/datatables/datatables.all.min.js',
                                    './assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                    './assets/global/scripts/datatable.js',

                                    'js/scripts/table-ajax.js',
                                    'js/controllers/GeneralPageController.js'
                                ]
                            });
                        }]
                    }
                  }
                }
        })

        // User Profile
        .state("app.profile", {
            url: "/profile",
            views: {
               'AppContent': {
                    templateUrl: "views/profile/main.html",
                    data: {pageTitle: 'User Profile'},
                    controller: "UserProfileController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                    './assets/pages/css/profile.css',

                                    './assets/global/plugins/jquery.sparkline.min.js',
                                    './assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                    './assets/pages/scripts/profile.min.js',

                                    'js/controllers/UserProfileController.js'
                                ]
                            });
                        }]
                    }
                  }
                }
        })

        // Ahead Profile Generator
        .state("app.generator", {
            url: "/generator",
            views: {
               'AppContent': {
                    templateUrl: "views/generator.html",
                    data: {pageTitle: 'Profile Generator'},
                    controller: "GeneratorController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/morris/morris.css',
                                    './assets/global/plugins/morris/morris.min.js',
                                    './assets/global/plugins/morris/raphael-min.js',
                                    './assets/global/plugins/jquery.sparkline.min.js',

                                    './assets/pages/scripts/dashboard.min.js',
                                    'js/controllers/GeneratorController.js'
                                ]
                            });
                        }]
                    }
                  }
                }
        })

        // Ahead Services
        .state("app.services", {
            url: "/services",
            views: {
               'AppContent': {
                  templateUrl: "views/services.html",
                  data: {pageTitle: 'Ahead Services'},
                  controller: "ServicesController",
                  resolve: {
                      deps: ['$ocLazyLoad', function($ocLazyLoad) {
                          return $ocLazyLoad.load({
                              name: 'MetronicApp',
                              insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                              files: ['js/controllers/DashboardController.js',
                                  './assets/global/plugins/morris/morris.css',
                                  './assets/global/plugins/morris/morris.min.js',
                                  './assets/global/plugins/morris/raphael-min.js',
                                  './assets/global/plugins/jquery.sparkline.min.js',

                                  './assets/pages/scripts/dashboard.min.js',
                                  'js/controllers/ServicesController.js'
                              ]
                          });
                      }]
                  }
                }
              }
        })

        // Ahead Contact
        .state("app.contact", {
            url: "/contact",
            views: {
               'AppContent': {
                  templateUrl: "views/contact.html",
                  data: {pageTitle: 'Ahead Contact'},
                  controller: "ContactController",
                  resolve: {
                      deps: ['$ocLazyLoad', function($ocLazyLoad) {
                          return $ocLazyLoad.load({
                              name: 'MetronicApp',
                              insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                              files: ['js/controllers/DashboardController.js',
                                  "./assets/pages/css/contact.min.css",
                                  "./assets/pages/scripts/contact.js",

                                  'js/controllers/ContactController.js',

                              ]
                          });
                      }]
                  }
                }
              }
        })

        // Ahead FAQ
        .state("app.faq", {
            url: "/faq",
            views: {
               'AppContent': {
                    templateUrl: "views/faq.html",
                    data: {pageTitle: 'Ahead FAQ'},
                    controller: "FAQController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',

                                    './assets/pages/css/faq.min.css',
                                    'js/controllers/FAQController.js',
                                ]
                            });
                        }]
                    }
                  }
                }
        })

        // Ahead News
        .state("app.news", {
            url: "/news",
            views: {
               'AppContent': {
                  templateUrl: "views/news.html",
                  data: {pageTitle: 'Ahead News'},
                  controller: "NewsController",
                  resolve: {
                      deps: ['$ocLazyLoad', function($ocLazyLoad) {
                          return $ocLazyLoad.load({
                              name: 'MetronicApp',
                              insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                              files: ['js/controllers/DashboardController.js',
                                  './assets/global/plugins/morris/morris.css',
                                  './assets/global/plugins/morris/morris.min.js',
                                  './assets/global/plugins/morris/raphael-min.js',
                                  './assets/global/plugins/jquery.sparkline.min.js',
                                  'js/controllers/DashboardController.js',
                                  './assets/pages/scripts/dashboard.min.js',
                                  'js/controllers/NewsController.js',
                              ]
                          });
                      }]
                  }
                }
              }
        })

        // Ahead My Saved Services
        .state("app.savedservices", {
            url: "/savedservices",
            views: {
               'AppContent': {
                    templateUrl: "views/savedservices.html",
                    data: {pageTitle: 'My Saved Services'},
                    controller: "SavedservicesController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/morris/morris.css',
                                    './assets/global/plugins/morris/morris.min.js',
                                    './assets/global/plugins/morris/raphael-min.js',
                                    './assets/global/plugins/jquery.sparkline.min.js',

                                    './assets/pages/scripts/dashboard.min.js',
                                    'js/controllers/SavedservicesController.js',
                                ]
                            });
                        }]
                    }
                  }
                }
        })

        // Ahead My Saved Profiles
        .state("app.savedprofiles", {
            url: "/savedprofiles",
            views: {
               'AppContent': {
                    templateUrl: "views/savedprofiles.html",
                    data: {pageTitle: 'My Saved Profiles'},
                    controller: "SavedprofilesController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/morris/morris.css',
                                    './assets/global/plugins/morris/morris.min.js',
                                    './assets/global/plugins/morris/raphael-min.js',
                                    './assets/global/plugins/jquery.sparkline.min.js',

                                    './assets/pages/scripts/dashboard.min.js',
                                    'js/controllers/SavedprofilesController.js',
                                ]
                            });
                        }]
                    }
                  }
                }
        })

        // User Profile Dashboard
        .state("app.profile.dashboard", {
            url: "/dashboard",
             views: {
                'ProfileContent': {
                        templateUrl: "views/profile/dashboard.html",
                        data: {pageTitle: 'User Profile'}
                      }
                    }
        })

        // User Profile Account
        .state("app.profile.account", {
            url: "/account",
            views: {
               'ProfileContent': {
                    templateUrl: "views/profile/account.html",
                    data: {pageTitle: 'User Account'}
                  }
                }
        })

        // User Profile Help
        .state("app.profile.help", {
            url: "/help",
            views: {
               'ProfileContent': {
                    templateUrl: "views/profile/help.html",
                    data: {pageTitle: 'User Help'}
                  }
                }
        })

        // Todo
        .state('app.todo', {
            url: "/todo",
            views: {
               'AppContent': {
                    templateUrl: "views/todo.html",
                    data: {pageTitle: 'Todo'},
                    controller: "TodoController",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'MetronicApp',
                                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                                files: ['js/controllers/DashboardController.js',
                                    './assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                    './assets/apps/css/todo-2.css',
                                    './assets/global/plugins/select2/css/select2.min.css',
                                    './assets/global/plugins/select2/css/select2-bootstrap.min.css',

                                    './assets/global/plugins/select2/js/select2.full.min.js',

                                    './assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',

                                    './assets/apps/scripts/todo-2.min.js',

                                    'js/controllers/TodoController.js'
                                ]
                            });
                        }]
                    }
                  }
                }
        })

}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", function($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view
}]);
