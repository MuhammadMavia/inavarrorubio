angular.module('MetronicApp').controller('LoginController', function($rootScope, $state, $scope, $http, $timeout) {
      var ref = new Firebase("https://ahead-guest.firebaseio.com/");
      $scope.doLogin = function(user){
        ref.authWithPassword({
          email    : user.email,
          password : user.password
        }, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            $state.go("app.dashboard")
            console.log("Authenticated successfully with payload:", authData);
          }
        });
      }

});
