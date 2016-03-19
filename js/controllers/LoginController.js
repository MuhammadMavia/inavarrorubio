angular.module('MetronicApp').controller('LoginController', function($rootScope, $scope, $http, $timeout) {
      var ref = new Firebase("https://ahead-guest.firebaseio.com/");
      console.log(ref);

      $scope.doLogin = function(user){
        ref.authWithPassword({
          email    : user.email,
          password : user.password
        }, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            console.log("Authenticated successfully with payload:", authData);
          }
        });
      }

});
