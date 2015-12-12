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
      var user_login = User.$getRecord(user.uid);
      // $log.info('login ' + user_login.uid + ', role ' + user_login.role);
      // user authenticated with Firebase
      window.localStorage['user_id'] = user.uid;
      window.localStorage['user_role'] = user.role
      window.localStorage['user_referral'] = user.referral;

      $scope.user_role = window.localStorage['user_role'];
      $scope.user_referral = window.localStorage['user_referral'];

      $state.go('teacher.home');
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

.controller('RegCtrl', function($scope, $state, $rootScope, $firebaseAuth, $window) {
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
          window.localStorage['user_id'] = userData.uid;
          window.localStorage['merchantName'] = name;

          var userData = {
            name: name,
            phone: phone,
            referral: referral,
            created: Date.now(),
            updated: Date.now()

          };

          var refUserData = new Firebase($rootScope.baseUrl + 'user_data/' + window.localStorage['user_id']);
          refUserData.set(userData);

          if (referral == '') {
            console.log('here');
            $window.location.href = ('#/registerschool');
          } else {
            $window.location.href = ('#/home');
          }
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
  $scope.teacher = {
    school_name: "",
    long: "",
    lat: "",
    class_name: ""
  };

  $scope.schools = School;

  $scope.createSchool = function() {
    var school_name = this.teacher.school_name;
    var class_name = this.teacher.class_name;
    var lat = this.teacher.lat;
    var long = this.teacher.long;

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
      user.role = 'teacher';
      User.$save(user);
      window.localStorage['user_role'] = user.role;
      window.localStorage['user_referral'] = user.referral;
      $rootScope.hide();
      $state.go('home.home');
    });


    }
})
.controller('HomeCtrl', function($scope, $rootScope) {
  console.log('HomeCtrl created');
  $scope.user_role = window.localStorage['user_role'];
  $scope.user_referral = window.localStorage['user_referral'];

    })
.controller('QueueCtrl', function($scope, $state, $rootScope, $stateParams, $ionicPopup, $timeout) {
  $scope.merchantData = new Firebase($rootScope.baseUrl + 'merchant_data/'+$stateParams.id);
  $scope.$watch('merchantData', function (value) {
    regMerchantDataRef.once("value", function(data) {
      $scope.data = data.val();
      for (var k in $scope.data.user) {
          var v = $scope.data.user[k];
          if(v.user_id===window.localStorage['user_id']) {
            $state.go('home.home');
          }
      }
    });
  }, true);

  var regMerchantQueueRef = new Firebase($rootScope.baseUrl + 'merchant_queue/'+$stateParams.id);
  $scope.merchantQueue = $firebase(regMerchantQueueRef);
  $scope.$watch('merchantQueue', function (value) {
    regMerchantQueueRef.once("value", function(data) {
      total = 1;
      data.forEach(function(a){
        total++;
      });
      $scope.available_number = total;
    });
  }, true);

  var regRecordRef = new Firebase($rootScope.baseUrl + 'queue_record/'+$stateParams.id);
  $scope.queueRecord = $firebase(regRecordRef);
  $scope.$watch('queueRecord', function (value) {
    regRecordRef.once("value", function(data) {
      total = 0;
      total_time = 0;
      data.forEach(function(a){
        total_time = a.val().created_at;
        total++;
      });
      av = total_time/total;
    });
  }, true);



 // Triggered on a button click, or some other target
 $scope.showPopup = function() {
   $scope.data = {}

   // An elaborate, custom popup
   var myPopup = $ionicPopup.show({
     template: '<input type="password" ng-model="data.wifi">',
     title: 'Enter Wi-Fi Password',
     subTitle: 'Please use normal things',
     scope: $scope,
     buttons: [
       { text: 'Cancel' },
       {
         text: '<b>Save</b>',
         type: 'button-positive',
         onTap: function(e) {
           if (!$scope.data.wifi) {
             //don't allow the user to close unless he enters wifi password
             e.preventDefault();
           } else {
             return $scope.data.wifi;
           }
         }
       },
     ]
   });
   myPopup.then(function(res) {
     console.log('Tapped!', res);
   });
   $timeout(function() {
      myPopup.close(); //close the popup after 3 seconds for some reason
   }, 3000);
  };
   // A confirm dialog
   $scope.takeQueue = function() {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Take The Number',
       template: 'Are you sure you want to redeem 2 points to take this queue number?'
     });
     confirmPopup.then(function(res) {
       if(res) {
         $scope.successTakeQueue();
       } else {
         console.log('You are not sure');
       }
     });
   };

   // An alert dialog
   $scope.successTakeQueue = function() {
    regMerchantQueueRef.once("value", function(data) {
      total = 1;
      data.forEach(function(a){
        total++;
      })
      formQueue = {
        "queue" : total,
        "name" : "Guest" + total
      };
      regMerchantQueueRef.push(formQueue);
      var inputMerchantData = new Firebase($rootScope.baseUrl + 'merchant_data/'+$stateParams.id+'/user');
      inputMerchantData.push({user_id: window.localStorage['user_id'],queue_number: total });
    });
    var alertPopup = $ionicPopup.alert({
      title: 'Success!',
      template: 'You’ve taken queue number 3',
      buttons: [{
       type: 'button-positive',
       text: 'Back'
      }]
    });
    alertPopup.then(function(res) {
      console.log('Thank you for not eating my delicious ice cream cone');
    });
   };

   $scope.failTakeQueue = function() {
     var alertPopup = $ionicPopup.alert({
       title: 'Oops!',
       template: 'You can’t take this number.',
       buttons: [{
        type: 'button-positive',
        text: 'Back'
       }]
     });
     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };

   // A confirm dialog
   $scope.showFinish = function() {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Finish your job today?',
       template: ''
     });
     confirmPopup.then(function(res) {
       if(res) {
         console.log('You are sure');
         $scope.showGreat();
       } else {
         console.log('You are not sure');
       }
     });
   };

   // An alert great job
   $scope.showGreat = function() {
     var alertPopup = $ionicPopup.alert({
       title: 'You did wonderful job!<br>Congrats!',
       template: '',
       buttons: [{
        type: 'button-positive',
        text: 'Go to Home'
       }]
     });
     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };

}).controller('ActiveListCtrl', function($scope, $rootScope, $firebase) {
  $scope.merchantList = new Firebase($rootScope.baseUrl + 'merchant_data');
  $scope.$watch('merchantList', function (value) {
    regMerchantQueueRef.once("value", function(data) {
      $scope.lists = [];
      for (var k in data.val()) {
        var v = data.val()[k];
        for (var k1 in v.user) {
          var v1 = v.user[k1];
          if(v1.user_id === window.localStorage['user_id']) {
            $scope.lists.push({id: k,name: v.name,address: v.address});
          }
        }
      }


      // $scope.lists.forEach(function(a){
      //   console.log(a);
      // });
    });
  }, true);
}).controller('ActiveCtrl', function($scope, $state, $rootScope, $stateParams, $firebase, $ionicPopup, $timeout) {
  var regMerchantDataRef = new Firebase($rootScope.baseUrl + 'merchant_data/'+$stateParams.id);
  $scope.merchantData = $firebase(regMerchantDataRef);
  $scope.$watch('merchantData', function (value) {
    regMerchantDataRef.once("value", function(data) {
      $scope.data = data.val();
      for (var k in $scope.data.user) {
        var v = $scope.data.user[k];
        if(v.user_id === window.localStorage['user_id']) {
          $scope.available_number = v.queue_number;
        }
      }
    });
  }, true);

}).controller('UserCtrl', function($scope, $state, $rootScope, $window, $ionicPopup, $firebase){
  var regUserDataRef = new Firebase($rootScope.baseUrl + 'user_data/' + window.localStorage['user_id']);
  $scope.user = {};
  regUserDataRef.once("value", function(data) {
    $scope.user = data.val();
    console.log($scope.user);
  });


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

}).controller('PointListCtrl', function($scope, $state, $rootScope, $window, $firebase, $ionicPopup, $timeout) {
  var regUserDataRef = new Firebase($rootScope.baseUrl + 'user_data/' + window.localStorage['user_id']);
  $scope.data = [
    {point: 5, amount: 5000},
    {point: 10, amount: 10000},
    {point: 25, amount: 25000},
    {point: 50, amount: 50000},
    {point: 100, amount: 100000}
  ];

  // A confirm dialog
   $scope.beliConfirm = function(amount) {

     var confirmPopupBeli = $ionicPopup.confirm({
       title: 'Are you sure?',
       template: '',
       cancelText: 'Cancel',
       cancelType: '',
       okText: 'Buy',
       okType: 'button-positive'
     });
     confirmPopupBeli.then(function(res) {
       if(res) {
        regUserDataRef.once("value", function(data) {
          dd = amount/1000;
          poin_data = dd + data.val().poin;
          form_data = {
            "poin" : poin_data
          };
          // $scope.user.poin = poin_data;
          regUserDataRef.update(form_data);
          $scope.successBeliAlert(dd);
        });
       } else {
         console.log('You are not sure');
       }
     });
   };

   // An alert dialog
   $scope.successBeliAlert = function(poin) {
     var alertPopupBeli = $ionicPopup.alert({
       title: 'Congrat!',
       template: 'Your point have been added '+poin+' points. To continue please send sms up spasi sms_code to 4499',
       buttons: [{
        type: 'button-positive',
        text: 'OK'
       }]
     });
     alertPopupBeli.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };

}).controller('TeacherHomeCtrl',function(){})

.controller('TeacherCourseListCtrl',function($scope, $rootScope, $state, $ionicPopup){
  $scope.courseList = new Firebase($rootScope.baseUrl + 'course_data');
  if(typeof $scope.courseList === 'object'){
    var alertPopup = $ionicPopup.alert({
      title: 'Oops!',
      template: 'Anda belum memiliki kursus sama sekali. Silahkan membuat yang baru.',
      buttons: [{
        type: 'button-positive',
        text: 'Buat Baru'
      }]
    });
    alertPopup.then(function(res) {
     $state.go("teacher.courseChapterCreate")
    });
  }
}).controller('TeacherChapterListCtrl', function(){

})
.controller('TeacherChapterCreateCtrl', function($rootScope){

}).controller('TeacherChapterDetectCtrl', function(){

});
