angular.module('app')
    .controller('HomeCtrl', function($scope, $http) {

        $scope.loading = true;
        console.log($scope)
        $scope.setup = function() {

            $http.get('/api/vehicle')
                .then(function(response) {
                    $scope.model = response.data;
                    //$scope,loading = false;

                }, function(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        }

        $scope.setup();



    })
