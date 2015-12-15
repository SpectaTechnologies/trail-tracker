angular.module('app',[
'ngRoute','ui.router'
])
angular.module('app')
    .controller('ErrorCtrl', function($scope, $rootScope) {
        $scope.hello = "this is from the controller hello"
        console.log($scope.hello)



    })

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

angular.module('app')
    .controller('LoginCtrl', function($scope, UserSvc, $location) {        
        $scope.login = function(username, password) {
            UserSvc.login(username, password)
                .then(function(response) {
                    console.log("printing response")
                    console.log(response.data)
                    $scope.$emit('login', response.data)
                    $location.path('/home')

                })
        }
    })

angular.module('app')
    .controller('masterCtrl', function($scope, $rootScope, $route) {
        console.log("masterCtrl");


        $scope.$on('login', function(_, user) {
            console.log("Logged In");
            $scope.currentUser = user
            $rootScope.currentUser = user            
            localStorage.setItem('logged_user', $rootScope.currentUser.username)
        })
    })

angular.module('app')
.controller('PostsCtrl',function($scope,PostsSvc){ 
  PostsSvc.fetch()
 	.success(function (posts){
 		$scope.posts = posts

 	})
	
 	 $scope.addPost = function () {
          if ($scope.postBody) {
            PostsSvc.create({
              /*username: 'vishalRanjan',*/
              body:     $scope.postBody              
            }).success(function (post) {
              //$scope.posts.unshift(post)
              $scope.postBody = null
            })
          }
        }

    $scope.$on('ws:new_post',function(_,post){
    $scope.$apply(function(){
      $scope.posts.unshift(post)
    })
  })
 
})

 
angular.module('app')
.service('PostsSvc', function($http){
   this.fetch = function () {   	
     return $http.get('/api/posts')
   }
   this.create = function (post){
   	
      return $http.post('/api/posts',post)
   }
 })
angular.module('app')
.controller('RegisterCtrl',function($scope,UserSvc ,$location){
	$scope.register = function(name,username,password){
		UserSvc.register(name,username,password)
		.then(function(response){			
			$scope.$emit('login',response.data)
			$location.path('/home')
		})
		.catch(function (err){
			console.log(err)
		})
	}

})

angular.module('app')
.service('segment', function($http,$window,$location){
  
     return {
        getData: function($q, $http) {
            console.log("here");
            return 2
        }
    };

})
angular.module('app')
.config(function($stateProvider, $urlRouterProvider){
 
    $urlRouterProvider.otherwise('/');
 
    $stateProvider
    .state('app',{
        url: '/',
        views: {
            'header': {
                templateUrl: '/nav.html'
            },
            'content': {
                templateUrl: '/login.html' ,
                controller: 'LoginCtrl'
            }
        }
    })

    .state('app.login',{
        url: '/login',
        views: {
            'header': {
                templateUrl: '/nav.html'
            },
            'content': {
                templateUrl: '/login.html',
                controller: 'LoginCtrl'

            }
        }
    })
 
    .state('app.register', {
        url: 'register',
        views: {
            'content@': {
                templateUrl: 'register.html',
                controller: 'RegisterCtrl'
            }
        }
 
    })
 
    .state('app.home', {
        url: 'home',
        views: {
            'content@': {
                templateUrl: 'users/home.html',
                controller: 'HomeCtrl'
            }
        }
 
    })

     .state('app.home.vehicles', {
        url: '/vehicles/new',
        views: {
            'content@': {
                templateUrl: 'vehicles/newVehicle.html',
                controller: 'VehiclesNewInfoCtrl'
            }
        }
 
    })

     .state('app.home.details', {
        url: '/vehicles/:id',        
 
        views: {
            'content@': {
                templateUrl: 'vehicles/editVehicle.html',
                controller: 'VehiclesEditInfoCtrl'        
            }
        }
 
    })

     .state('app.home.map', {
        url: '/vehicles/map/:id',        
 
        views: {
            'content@': {
                templateUrl: 'vehicles/mapVehicle.html',
                controller: 'VehiclesEditMapCtrl'        
            }
        }
 
    })


    
 
    
 
});

/*.config(function($routeProvider,$locationProvider) {
	$routeProvider
	.when('/',{controller:'LoginCtrl',templateUrl:'login.html'})	
	.when('/posts',{controller:'PostsCtrl',templateUrl:'posts.html'})
	.when('/register',{controller:'RegisterCtrl',templateUrl:'register.html'})
	.when('/home',{controller:'HomeCtrl',templateUrl:'users/home.html'})	
	.when('/vehicles/new/info',{controller:'VehiclesNewInfoCtrl',templateUrl:'vehicles/new/info.html'})	
	.when('/vehicles/edit/:deviceId/info',{controller:'VehiclesEditInfoCtrl',templateUrl:'vehicles/edit/info.html'})	
	.when('/vehicles/edit/:deviceId/map',{controller:'VehiclesEditMapCtrl',templateUrl:'vehicles/edit/map.html'})	
	.when('/401',{controller:'ErrorCtrl',templateUrl:'errors/401.html'})	

	$locationProvider.html5Mode(true)
	
})*/

angular.module('app')
.service('UserSvc', function($http,$window,$location){
	var svc = this
	svc.getUser= function(){
		return $http.get('api/users')
	}

	svc.login = function(username,password){
	 return $http.post('api/sessions',{
			username : username, password : password
		}).then(function(val){			
			svc.token = val.data
			$window.sessionStorage["user_token"] = JSON.stringify(svc.token)
			$http.defaults.headers.common['x-auth'] = val.data
			return svc.getUser()
		}).catch(function(response) {
  			console.error('Gists error', response.status, response.data);
  			$location.path('/401')
		})
		.finally(function() {
		  console.log("finally finished gists");
		});	
	}


	svc.register = function (name,username,password){
		return $http.post('api/users',{
			name : name, username : username, password : password
		}).then(function(val){			
			//return val;			
			return svc.login(username,password) 

		})
	}

})
angular.module('app')
.controller('VehiclesEditInfoCtrl',function($scope,$http,$location,$stateParams){ 
 

$scope.setup = function(){
	console.log($stateParams)
	$http.get('/api/vehicle/'+$stateParams.id)
	.then(function(response) {
	    $scope.model = response.data;
	    console.log($scope.model)

	  }, function(response) {
	    console.log(response)
	  });
	
}

$scope.setup();
 
 
 
})

 
angular.module('app')
    .controller('VehiclesEditMapCtrl', function($scope, $http, $location, $stateParams) {

        $scope.markOnMap = function(lat, long) {
            console.log(long)
            $scope.myCenter = new google.maps.LatLng(lat, long);
            $scope.mapOptions = {
                center: new google.maps.LatLng(lat, long),
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP

            }

            $scope.map = new google.maps.Map(document.getElementById('googleMap'), $scope.mapOptions);


            $scope, marker = new google.maps.Marker({
                position: $scope.myCenter
            });

            marker.setMap($scope.map);
        }




        $scope.setup = function() {
            console.log($stateParams.id);
            $http.get('/api/vehicle/location/' + $stateParams.id)
                .then(function(response) {
                    console.log(response.data)
                    $scope.model = response.data
                    $scope.markOnMap(response.data.latitude, response.data.longitude);


                }, function(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        }

        $scope.setup();

        socket.on("location_updated", function(data) {
            console.log("data from the server", data);
            $scope.test = data;
            $scope.latitude = data.latitude;
            $scope.longitude = data.longitude;
            $scope.markOnMap($scope.latitude, $scope.longitude);            

            //$scope.setup();
        });


    })

angular.module('app')
.controller('VehiclesNewInfoCtrl',function($scope,$http,$location){ 
 

$scope.saveVehicleDetails = function(){
	console.log("in controller 2")
	console.log($scope.dev_id + $scope.v_number)
	 

	$http.post('/api/vehicle',{
		dev_id: $scope.dev_id,
        v_number: $scope.v_number,
        driver_name : $scope.driver_name,
        sos_number : $scope.sos_number                       
	})
	.then(function(response) {
	    console.log(response)
	    $location.path('/home')

	  }, function(response) {
	    console.log(response)
	  });
	
}
 
 
 
})

 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImVycm9yLmN0cmwuanMiLCJob21lLmN0cmwuanMiLCJsb2dpbi5jdHJsLmpzIiwibWFzdGVyQ3RybC5qcyIsInBvc3RzLmN0cmwuanMiLCJwb3N0cy5zdmMuanMiLCJyZWdpc3Rlci5jdHJsLmpzIiwicm91dGVTZWdtZW50LmpzIiwicm91dGVzLmpzIiwidXNlci5zdmMuanMiLCJ2ZWhpY2xlcy9lZGl0L2luZm8uanMiLCJ2ZWhpY2xlcy9lZGl0L21hcC5qcyIsInZlaGljbGVzL25ldy9pbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdhcHAnLFtcbiduZ1JvdXRlJywndWkucm91dGVyJ1xuXSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignRXJyb3JDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlKSB7XG4gICAgICAgICRzY29wZS5oZWxsbyA9IFwidGhpcyBpcyBmcm9tIHRoZSBjb250cm9sbGVyIGhlbGxvXCJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmhlbGxvKVxuXG5cblxuICAgIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwKSB7XG5cbiAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUpXG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAkaHR0cC5nZXQoJy9hcGkvdmVoaWNsZScpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgLy8kc2NvcGUsbG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2FsbGVkIGFzeW5jaHJvbm91c2x5IGlmIGFuIGVycm9yIG9jY3Vyc1xuICAgICAgICAgICAgICAgICAgICAvLyBvciBzZXJ2ZXIgcmV0dXJucyByZXNwb25zZSB3aXRoIGFuIGVycm9yIHN0YXR1cy5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG5cblxuXG4gICAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFVzZXJTdmMsICRsb2NhdGlvbikgeyAgICAgICAgXG4gICAgICAgICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgICAgICAgICAgVXNlclN2Yy5sb2dpbih1c2VybmFtZSwgcGFzc3dvcmQpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcmludGluZyByZXNwb25zZVwiKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2xvZ2luJywgcmVzcG9uc2UuZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9ob21lJylcblxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ21hc3RlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRyb3V0ZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1hc3RlckN0cmxcIik7XG5cblxuICAgICAgICAkc2NvcGUuJG9uKCdsb2dpbicsIGZ1bmN0aW9uKF8sIHVzZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9nZ2VkIEluXCIpO1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRVc2VyID0gdXNlclxuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IHVzZXIgICAgICAgICAgICBcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsb2dnZWRfdXNlcicsICRyb290U2NvcGUuY3VycmVudFVzZXIudXNlcm5hbWUpXG4gICAgICAgIH0pXG4gICAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLmNvbnRyb2xsZXIoJ1Bvc3RzQ3RybCcsZnVuY3Rpb24oJHNjb3BlLFBvc3RzU3ZjKXsgXG4gIFBvc3RzU3ZjLmZldGNoKClcbiBcdC5zdWNjZXNzKGZ1bmN0aW9uIChwb3N0cyl7XG4gXHRcdCRzY29wZS5wb3N0cyA9IHBvc3RzXG5cbiBcdH0pXG5cdFxuIFx0ICRzY29wZS5hZGRQb3N0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICgkc2NvcGUucG9zdEJvZHkpIHtcbiAgICAgICAgICAgIFBvc3RzU3ZjLmNyZWF0ZSh7XG4gICAgICAgICAgICAgIC8qdXNlcm5hbWU6ICd2aXNoYWxSYW5qYW4nLCovXG4gICAgICAgICAgICAgIGJvZHk6ICAgICAkc2NvcGUucG9zdEJvZHkgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSkuc3VjY2VzcyhmdW5jdGlvbiAocG9zdCkge1xuICAgICAgICAgICAgICAvLyRzY29wZS5wb3N0cy51bnNoaWZ0KHBvc3QpXG4gICAgICAgICAgICAgICRzY29wZS5wb3N0Qm9keSA9IG51bGxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAkc2NvcGUuJG9uKCd3czpuZXdfcG9zdCcsZnVuY3Rpb24oXyxwb3N0KXtcbiAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUucG9zdHMudW5zaGlmdChwb3N0KVxuICAgIH0pXG4gIH0pXG4gXG59KVxuXG4gIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uc2VydmljZSgnUG9zdHNTdmMnLCBmdW5jdGlvbigkaHR0cCl7XG4gICB0aGlzLmZldGNoID0gZnVuY3Rpb24gKCkgeyAgIFx0XG4gICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvcG9zdHMnKVxuICAgfVxuICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbiAocG9zdCl7XG4gICBcdFxuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcG9zdHMnLHBvc3QpXG4gICB9XG4gfSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLGZ1bmN0aW9uKCRzY29wZSxVc2VyU3ZjICwkbG9jYXRpb24pe1xuXHQkc2NvcGUucmVnaXN0ZXIgPSBmdW5jdGlvbihuYW1lLHVzZXJuYW1lLHBhc3N3b3JkKXtcblx0XHRVc2VyU3ZjLnJlZ2lzdGVyKG5hbWUsdXNlcm5hbWUscGFzc3dvcmQpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1x0XHRcdFxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2dpbicscmVzcG9uc2UuZGF0YSlcblx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvaG9tZScpXG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycil7XG5cdFx0XHRjb25zb2xlLmxvZyhlcnIpXG5cdFx0fSlcblx0fVxuXG59KVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uc2VydmljZSgnc2VnbWVudCcsIGZ1bmN0aW9uKCRodHRwLCR3aW5kb3csJGxvY2F0aW9uKXtcbiAgXG4gICAgIHJldHVybiB7XG4gICAgICAgIGdldERhdGE6IGZ1bmN0aW9uKCRxLCAkaHR0cCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJoZXJlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgfVxuICAgIH07XG5cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpe1xuIFxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiBcbiAgICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwJyx7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgJ2hlYWRlcic6IHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9uYXYuaHRtbCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY29udGVudCc6IHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sb2dpbi5odG1sJyAsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICAuc3RhdGUoJ2FwcC5sb2dpbicse1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgJ2hlYWRlcic6IHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9uYXYuaHRtbCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY29udGVudCc6IHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sb2dpbi5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuIFxuICAgIC5zdGF0ZSgnYXBwLnJlZ2lzdGVyJywge1xuICAgICAgICB1cmw6ICdyZWdpc3RlcicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAnY29udGVudEAnOiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdyZWdpc3Rlci5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gXG4gICAgfSlcbiBcbiAgICAuc3RhdGUoJ2FwcC5ob21lJywge1xuICAgICAgICB1cmw6ICdob21lJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3VzZXJzL2hvbWUuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDdHJsJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gXG4gICAgfSlcblxuICAgICAuc3RhdGUoJ2FwcC5ob21lLnZlaGljbGVzJywge1xuICAgICAgICB1cmw6ICcvdmVoaWNsZXMvbmV3JyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZlaGljbGVzL25ld1ZlaGljbGUuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1ZlaGljbGVzTmV3SW5mb0N0cmwnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiBcbiAgICB9KVxuXG4gICAgIC5zdGF0ZSgnYXBwLmhvbWUuZGV0YWlscycsIHtcbiAgICAgICAgdXJsOiAnL3ZlaGljbGVzLzppZCcsICAgICAgICBcbiBcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZlaGljbGVzL2VkaXRWZWhpY2xlLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdWZWhpY2xlc0VkaXRJbmZvQ3RybCcgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gXG4gICAgfSlcblxuICAgICAuc3RhdGUoJ2FwcC5ob21lLm1hcCcsIHtcbiAgICAgICAgdXJsOiAnL3ZlaGljbGVzL21hcC86aWQnLCAgICAgICAgXG4gXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAnY29udGVudEAnOiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd2ZWhpY2xlcy9tYXBWZWhpY2xlLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdWZWhpY2xlc0VkaXRNYXBDdHJsJyAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiBcbiAgICB9KVxuXG5cbiAgICBcbiBcbiAgICBcbiBcbn0pO1xuXG4vKi5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0JHJvdXRlUHJvdmlkZXJcblx0LndoZW4oJy8nLHtjb250cm9sbGVyOidMb2dpbkN0cmwnLHRlbXBsYXRlVXJsOidsb2dpbi5odG1sJ30pXHRcblx0LndoZW4oJy9wb3N0cycse2NvbnRyb2xsZXI6J1Bvc3RzQ3RybCcsdGVtcGxhdGVVcmw6J3Bvc3RzLmh0bWwnfSlcblx0LndoZW4oJy9yZWdpc3Rlcicse2NvbnRyb2xsZXI6J1JlZ2lzdGVyQ3RybCcsdGVtcGxhdGVVcmw6J3JlZ2lzdGVyLmh0bWwnfSlcblx0LndoZW4oJy9ob21lJyx7Y29udHJvbGxlcjonSG9tZUN0cmwnLHRlbXBsYXRlVXJsOid1c2Vycy9ob21lLmh0bWwnfSlcdFxuXHQud2hlbignL3ZlaGljbGVzL25ldy9pbmZvJyx7Y29udHJvbGxlcjonVmVoaWNsZXNOZXdJbmZvQ3RybCcsdGVtcGxhdGVVcmw6J3ZlaGljbGVzL25ldy9pbmZvLmh0bWwnfSlcdFxuXHQud2hlbignL3ZlaGljbGVzL2VkaXQvOmRldmljZUlkL2luZm8nLHtjb250cm9sbGVyOidWZWhpY2xlc0VkaXRJbmZvQ3RybCcsdGVtcGxhdGVVcmw6J3ZlaGljbGVzL2VkaXQvaW5mby5odG1sJ30pXHRcblx0LndoZW4oJy92ZWhpY2xlcy9lZGl0LzpkZXZpY2VJZC9tYXAnLHtjb250cm9sbGVyOidWZWhpY2xlc0VkaXRNYXBDdHJsJyx0ZW1wbGF0ZVVybDondmVoaWNsZXMvZWRpdC9tYXAuaHRtbCd9KVx0XG5cdC53aGVuKCcvNDAxJyx7Y29udHJvbGxlcjonRXJyb3JDdHJsJyx0ZW1wbGF0ZVVybDonZXJyb3JzLzQwMS5odG1sJ30pXHRcblxuXHQkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSlcblx0XG59KSovXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5zZXJ2aWNlKCdVc2VyU3ZjJywgZnVuY3Rpb24oJGh0dHAsJHdpbmRvdywkbG9jYXRpb24pe1xuXHR2YXIgc3ZjID0gdGhpc1xuXHRzdmMuZ2V0VXNlcj0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCdhcGkvdXNlcnMnKVxuXHR9XG5cblx0c3ZjLmxvZ2luID0gZnVuY3Rpb24odXNlcm5hbWUscGFzc3dvcmQpe1xuXHQgcmV0dXJuICRodHRwLnBvc3QoJ2FwaS9zZXNzaW9ucycse1xuXHRcdFx0dXNlcm5hbWUgOiB1c2VybmFtZSwgcGFzc3dvcmQgOiBwYXNzd29yZFxuXHRcdH0pLnRoZW4oZnVuY3Rpb24odmFsKXtcdFx0XHRcblx0XHRcdHN2Yy50b2tlbiA9IHZhbC5kYXRhXG5cdFx0XHQkd2luZG93LnNlc3Npb25TdG9yYWdlW1widXNlcl90b2tlblwiXSA9IEpTT04uc3RyaW5naWZ5KHN2Yy50b2tlbilcblx0XHRcdCRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXSA9IHZhbC5kYXRhXG5cdFx0XHRyZXR1cm4gc3ZjLmdldFVzZXIoKVxuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0dpc3RzIGVycm9yJywgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5kYXRhKTtcbiAgXHRcdFx0JGxvY2F0aW9uLnBhdGgoJy80MDEnKVxuXHRcdH0pXG5cdFx0LmZpbmFsbHkoZnVuY3Rpb24oKSB7XG5cdFx0ICBjb25zb2xlLmxvZyhcImZpbmFsbHkgZmluaXNoZWQgZ2lzdHNcIik7XG5cdFx0fSk7XHRcblx0fVxuXG5cblx0c3ZjLnJlZ2lzdGVyID0gZnVuY3Rpb24gKG5hbWUsdXNlcm5hbWUscGFzc3dvcmQpe1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCdhcGkvdXNlcnMnLHtcblx0XHRcdG5hbWUgOiBuYW1lLCB1c2VybmFtZSA6IHVzZXJuYW1lLCBwYXNzd29yZCA6IHBhc3N3b3JkXG5cdFx0fSkudGhlbihmdW5jdGlvbih2YWwpe1x0XHRcdFxuXHRcdFx0Ly9yZXR1cm4gdmFsO1x0XHRcdFxuXHRcdFx0cmV0dXJuIHN2Yy5sb2dpbih1c2VybmFtZSxwYXNzd29yZCkgXG5cblx0XHR9KVxuXHR9XG5cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uY29udHJvbGxlcignVmVoaWNsZXNFZGl0SW5mb0N0cmwnLGZ1bmN0aW9uKCRzY29wZSwkaHR0cCwkbG9jYXRpb24sJHN0YXRlUGFyYW1zKXsgXG4gXG5cbiRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCl7XG5cdGNvbnNvbGUubG9nKCRzdGF0ZVBhcmFtcylcblx0JGh0dHAuZ2V0KCcvYXBpL3ZlaGljbGUvJyskc3RhdGVQYXJhbXMuaWQpXG5cdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdCAgICAkc2NvcGUubW9kZWwgPSByZXNwb25zZS5kYXRhO1xuXHQgICAgY29uc29sZS5sb2coJHNjb3BlLm1vZGVsKVxuXG5cdCAgfSwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0ICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxuXHQgIH0pO1xuXHRcbn1cblxuJHNjb3BlLnNldHVwKCk7XG4gXG4gXG4gXG59KVxuXG4gIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ1ZlaGljbGVzRWRpdE1hcEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICRzdGF0ZVBhcmFtcykge1xuXG4gICAgICAgICRzY29wZS5tYXJrT25NYXAgPSBmdW5jdGlvbihsYXQsIGxvbmcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGxvbmcpXG4gICAgICAgICAgICAkc2NvcGUubXlDZW50ZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdCwgbG9uZyk7XG4gICAgICAgICAgICAkc2NvcGUubWFwT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobGF0LCBsb25nKSxcbiAgICAgICAgICAgICAgICB6b29tOiAxMCxcbiAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJHNjb3BlLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dvb2dsZU1hcCcpLCAkc2NvcGUubWFwT3B0aW9ucyk7XG5cblxuICAgICAgICAgICAgJHNjb3BlLCBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJHNjb3BlLm15Q2VudGVyXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbWFya2VyLnNldE1hcCgkc2NvcGUubWFwKTtcbiAgICAgICAgfVxuXG5cblxuXG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJHN0YXRlUGFyYW1zLmlkKTtcbiAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS92ZWhpY2xlL2xvY2F0aW9uLycgKyAkc3RhdGVQYXJhbXMuaWQpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsID0gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubWFya09uTWFwKHJlc3BvbnNlLmRhdGEubGF0aXR1ZGUsIHJlc3BvbnNlLmRhdGEubG9uZ2l0dWRlKTtcblxuXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2FsbGVkIGFzeW5jaHJvbm91c2x5IGlmIGFuIGVycm9yIG9jY3Vyc1xuICAgICAgICAgICAgICAgICAgICAvLyBvciBzZXJ2ZXIgcmV0dXJucyByZXNwb25zZSB3aXRoIGFuIGVycm9yIHN0YXR1cy5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG5cbiAgICAgICAgc29ja2V0Lm9uKFwibG9jYXRpb25fdXBkYXRlZFwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRhdGEgZnJvbSB0aGUgc2VydmVyXCIsIGRhdGEpO1xuICAgICAgICAgICAgJHNjb3BlLnRlc3QgPSBkYXRhO1xuICAgICAgICAgICAgJHNjb3BlLmxhdGl0dWRlID0gZGF0YS5sYXRpdHVkZTtcbiAgICAgICAgICAgICRzY29wZS5sb25naXR1ZGUgPSBkYXRhLmxvbmdpdHVkZTtcbiAgICAgICAgICAgICRzY29wZS5tYXJrT25NYXAoJHNjb3BlLmxhdGl0dWRlLCAkc2NvcGUubG9uZ2l0dWRlKTsgICAgICAgICAgICBcblxuICAgICAgICAgICAgLy8kc2NvcGUuc2V0dXAoKTtcbiAgICAgICAgfSk7XG5cblxuICAgIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5jb250cm9sbGVyKCdWZWhpY2xlc05ld0luZm9DdHJsJyxmdW5jdGlvbigkc2NvcGUsJGh0dHAsJGxvY2F0aW9uKXsgXG4gXG5cbiRzY29wZS5zYXZlVmVoaWNsZURldGFpbHMgPSBmdW5jdGlvbigpe1xuXHRjb25zb2xlLmxvZyhcImluIGNvbnRyb2xsZXIgMlwiKVxuXHRjb25zb2xlLmxvZygkc2NvcGUuZGV2X2lkICsgJHNjb3BlLnZfbnVtYmVyKVxuXHQgXG5cblx0JGh0dHAucG9zdCgnL2FwaS92ZWhpY2xlJyx7XG5cdFx0ZGV2X2lkOiAkc2NvcGUuZGV2X2lkLFxuICAgICAgICB2X251bWJlcjogJHNjb3BlLnZfbnVtYmVyLFxuICAgICAgICBkcml2ZXJfbmFtZSA6ICRzY29wZS5kcml2ZXJfbmFtZSxcbiAgICAgICAgc29zX251bWJlciA6ICRzY29wZS5zb3NfbnVtYmVyICAgICAgICAgICAgICAgICAgICAgICBcblx0fSlcblx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0ICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxuXHQgICAgJGxvY2F0aW9uLnBhdGgoJy9ob21lJylcblxuXHQgIH0sIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdCAgICBjb25zb2xlLmxvZyhyZXNwb25zZSlcblx0ICB9KTtcblx0XG59XG4gXG4gXG4gXG59KVxuXG4gIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
