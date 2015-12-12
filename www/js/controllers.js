angular.module('ngantriApp.controllers', [])

.controller('IntroCtrl', function($scope, $rootScope, $state) {
  // Called to navigate to the main app
  var startApp = function() {
    $state.go('login');

    // Set a flag that we finished the tutorial
    window.localStorage['didTutorial'] = true;
  };
  //No this is silly
  // Check if the user already did the tutorial and skip it if so
  if(window.localStorage['didTutorial'] === "true") {
    console.log('Skip intro');
    startApp();
  }
})

.controller('LoginCtrl', function($scope, $state, $rootScope, $firebaseAuth, $window, $log, User) {
  $scope.toIntro = function(){
    window.localStorage['didTutorial'] = "false";
    $state.go('intro');
  }

  $rootScope.checkSession();

  $scope.user = {
    email: "",
    password: "",
    referral: ""
  };
  $scope.validateUser = function() {
    $rootScope.show('Please wait.. Authenticating');
    var email = this.user.email;
    var password = this.user.password;
    if (!email || !password) {
      $rootScope.notify("Please enter valid credentials");
      return false;
    }

    $rootScope.auth.$authWithPassword({
      email: email,
      password: password
    }).then(function(user) {
      $rootScope.hide();
      console.log(user);
      console.log('user.uid' + user.uid);
      var user_login = new Firebase($rootScope.baseUrl + 'user_data/' + user.uid);//$scope.users.$getRecord(refUser.$id);
      user_login.once("value", function(data) {
        // user authenticated with Firebase
        var user_login_data = data.val();
        console.log('user-Login');
        console.log(user_login_data);
        window.localStorage['user_id'] = user.uid;
        $state.go('home.home');
      });

    }, function(error) {
      $rootScope.hide();
      if (error.code == 'INVALID_EMAIL') {
        $rootScope.notify('Invalid Email Address');
      } else if (error.code == 'INVALID_PASSWORD') {
        $rootScope.notify('Invalid Password');
      } else if (error.code == 'INVALID_USER') {
        $rootScope.notify('Invalid User');
      } else {
        $rootScope.notify('Oops something went wrong. Please try again later');
      }
    });
  }
})

.controller('RegCtrl', function($scope, $state, $rootScope, $firebaseAuth, $window, $firebaseObject, User) {
      $scope.toIntro = function () {
        window.localStorage['didTutorial'] = "false";
        $state.go('intro');
      }
      $scope.user = {
        email: "",
        password: "",
        name: "",
        phone: "",
        referral: "",
        role: ""
      };
      $scope.createUser = function () {
        var email = this.user.email;
        var password = this.user.password;
        var name = this.user.name;
        var phone = this.user.phone;
        var referral = this.user.referral;

        if (!email || !password) {
          $rootScope.notify("Please enter valid credentials");
          return false;
        }
        $rootScope.show('Please wait.. Registering');

        $rootScope.auth.$createUser({'email':email, 'password':password}).then(function (userData) {
          $rootScope.hide();
          console.log("User " + userData.uid + " created successfully!");

          var user = {
            name: name,
            phone: phone,
            referral: referral,
            created: Date.now(),
            updated: Date.now()
          };

          var refUserData = new Firebase($rootScope.baseUrl + 'user_data/' + userData.uid);
          refUserData.once("value", function(data){
            refUserData.set(user);
            var data = data.val();
            window.localStorage['user_id'] = refUserData.key();
            if (referral == '') {
              $window.location.href = ('#/registerschool');
            } else {
              $window.location.href = ('#/home');
            }
          });
        }, function (error) {
          $rootScope.hide();
          if (error.code == 'INVALID_EMAIL') {
            $rootScope.notify('Invalid Email Address');
          } else if (error.code == 'EMAIL_TAKEN') {
            $rootScope.notify('Email Address already taken');
          } else {
            $rootScope.notify('Oops something went wrong. Please try again later');
          }
        })
      }
    })
.controller('ChooseSchoolCtrl', function($scope, $log, $rootScope, $state, School, User) {
  $log.info('ChooseSchoolCtrl');
  $scope.userChooseSchool = {
    school_name: "",
    long: "",
    lat: "",
    class_name: ""
  };

  $scope.schools = School;

  $scope.createSchool = function() {
    var school_name = this.userChooseSchool.school_name;
    var class_name = this.userChooseSchool.class_name;
    var lat = this.userChooseSchool.lat;
    var long = this.userChooseSchool.long;

    if (!school_name || !class_name) {
      $rootScope.notify("Please enter valid school information");
      return false;
    }
    $rootScope.show('Harap sabar..mempersiapkan data sekolah');
    var school = $scope.schools.$add({'name': school_name, 'lat': lat, 'long': long}).then(function(refSchool) {
      var user_id = window.localStorage['user_id'];
      var school_id = refSchool.key();

      //associate user with school
      var user = User.$getRecord(user_id);
      user.school_id = school_id;
      var rand = "" + new Array(5).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36);})
      user.referral = rand.toUpperCase();
      user.role = 'teacher'; // <== HERE!
      User.$save(user);
      window.localStorage['user_role'] = user.role;
      window.localStorage['user_referral'] = user.referral;
      $rootScope.hide();
      $state.go('home.home');
    });
  }
})
.controller('HomeCtrl', function($scope, $rootScope, $firebase) {
  console.log('HomeCtrl created');
  $scope.user_role = window.localStorage['user_role'];
  $scope.user_referral = window.localStorage['user_referral'];

    })
.controller('ProfileCtrl', function($scope, $state, $rootScope, $window, $ionicPopup, $log, $cordovaSocialSharing, $firebase){
  var regUserDataRef = new Firebase($rootScope.baseUrl + 'user_data/' + window.localStorage['user_id']);
  regUserDataRef.once("value", function(data){
    $scope.user = data.val();
  });
  $scope.sendReferralSms = function() {
    $cordovaSocialSharing.share('Halo, ini adalah invitasi untuk men-download aplikasi SayangJuara yang bisa di download di http://jadijuara.com. Gunakan kode referral ini saat registrasi ' + $rootScope.user.referral  +'. Salam hormat, ' + $rootScope.user.name);
  }
  // A confirm dialog
   $scope.logoutConfirm = function() {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Are you sure?',
       template: '',
       cancelText: 'Cancel',
       cancelType: '',
       okText: 'Log Out',
       okType: 'button-positive'
     });
     confirmPopup.then(function(res) {
       if(res) {
         $scope.logout()
       } else {
         console.log('You are not sure');
       }
     });
   };
});