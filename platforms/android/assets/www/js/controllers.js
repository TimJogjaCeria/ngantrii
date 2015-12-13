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
<<<<<<< HEAD
        if(user_login_data.role == "Guru" || user_login_data.role == "Wali Murid"){
          $state.go('teacher.home');
        }else{
          $state.go('home.home');
        }

=======
        $state.go('home.home');
>>>>>>> jadijuara
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

.controller('RegCtrl', function($scope, $state, $rootScope, $firebaseAuth, $window, $firebaseObject, User, ReferralCode) {
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

        //check who refer this user, and possibly fill its school information
        //TODO: how to make the referral code unique. Simple: use phone number
          var refer_by_user = null;
          var role = 'Guru';

          //now change the role here
          if(referral != ''){
            var user_by_referral = ReferralCode.$getRecord(referral);
            var refer_by_user = User.$getRecord(user_by_referral.user_id);

            //then the user is ortu
            if(refer_by_user.role == 'Guru')
            {
              //ortu stil has their own referral code to be passed to their kids
              var rand = "" + new Array(5).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36);})
              referral = rand.toUpperCase();
              role = 'Wali Murid';
              //TODO ini kok ada ngeflat referral disini tho? harusnya terpusat!
              var refReferral = new Firebase($rootScope.baseUrl + 'referral_code/' + referral);
              refReferral.once("value", function(data){
                refReferral.set({'user_id': userData.uid});
              });
            } else if(refer_by_user.role == 'Wali Murid'){
              //Siswa ga bs mendaftarkan orang lain dengan referral code dirinya
              role = 'Siswa';
              referral = '';
            }
          }
          var user = {
            name: name,
            phone: phone,
            referral: referral,
            role: role,
            created: Date.now(),
            updated: Date.now()
          };

          console.log('role');
          console.log(role);

          var refUserData = new Firebase($rootScope.baseUrl + 'user_data/' + userData.uid);
          refUserData.once("value", function(data){
            refUserData.set(user);
            var data = data.val();
            //TODO: this is after login action. We only set logged user.uid (from auth)
            window.localStorage['user_id'] = refUserData.key();
            console.log('role2');
            console.log(role);

            if (role == 'Guru') {
              console.log('here');
              $state.go('registerschool');
            }if (role == 'Wali Murid' || role == 'Siswa') {
              $rootScope.refer_by_user = refer_by_user;
              $state.go('showreferralinfo');
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

  .controller('ShowReferralInfoCtrl', function($scope, $rootScope){
    $scope.refer_by_user = $rootScope.refer_by_user;
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

  //TODO only called when teacher/parent register
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

      //associate teacher with school
      var user = User.$getRecord(user_id);
      user.school_id = school_id;
      //TODO make this into function
      var rand = "" + new Array(5).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36);})
      user.referral = rand.toUpperCase();
      user.role = 'Guru'; // <== TODO  mungkin ga manfaat, dihapus bisa sepertinya
      User.$save(user);
      window.localStorage['user_role'] = user.role;
      window.localStorage['user_referral'] = user.referral;
      $rootScope.hide();

      //TODO Flattened user key and referral
      var refReferral = new Firebase($rootScope.baseUrl + 'referral_code/' + user.referral);
      refReferral.once("value", function(data){
        refReferral.set({'user_id': user_id});
      });
      $state.go('home.home');
    });
  }
})
<<<<<<< HEAD
  .controller('HomeCtrl', function($scope, $state, $rootScope, $firebase, SyncService) {
=======
  //TODO ini home nyampur tiga role. Harusnya dipisah2 dong
  .controller('HomeCtrl', function($scope, $state, $rootScope, $firebase, $cordovaDialogs, $cordovaSocialSharing, SyncService) {
>>>>>>> jadijuara
    console.log('HomeCtrl created');

    var regUserDataRef = new Firebase($rootScope.baseUrl + 'user_data/' + window.localStorage['user_id']);
    regUserDataRef.once("value", function(data){
      $scope.user = data.val();
    });

    var refMatpelAktif = new Firebase($rootScope.baseUrl + 'mata_pelajaran/semester_aktif');
    refMatpelAktif.once("value", function(data){
      $scope.matapelajaran = data.val();
      $scope.$apply();
    });
<<<<<<< HEAD

    //TODO Pisahkan antara guru siswa dan ortu
    $scope.syncMataPelajaranAktif = function(){
      SyncService.getMataPelajaranAktif().then(function(resp){
        console.log(resp.data.data);
        var matpel_aktif = resp.data.data;
        matpel_aktif.forEach(function(matpel){
          console.log('matpel');
          console.log(matpel);
          var regUserDataRef = new Firebase($rootScope.baseUrl + 'mata_pelajaran/semester_aktif/' + matpel.id);
          regUserDataRef.once("value", function(data){
            regUserDataRef.set(matpel);
          });
        })
        $rootScope.notify('Mata pelajaran aktif pada semester ini sudah disinkronisasikan')
      });
    }

    $scope.doRefresh = function() {
      console.log('refresh');
    }

    $scope.trackMatpel = function(matpel_id){
      console.log('matpel_id');
      console.log(matpel_id);
    }

  })

.controller('HomeCourseListCtrl',function($scope, $rootScope, $stateParams, Course, Users){
  $scope.courseList = [];
  $scope.course = Course();

  $scope.course.$loaded()
    .then(function(){
      angular.forEach($scope.course, function(l) {
        var user = Users(l['user_id']);
        user.$loaded().then(function(){
          l['name'] = user['name']
          $scope.courseList.push(l)
        })
      })
    });

  // var regUserDataRef = new Firebase($rootScope.baseUrl + 'course/');
  // regUserDataRef.once("value", function(data){
  //   for(i in data.val()){
  //     console.log(i)
  //   }
  // });
})

.controller('HomeCourseDetailCtrl', function($scope, $stateParams, Chapters){
  var chapter = Chapters($stateParams.course)
  chapter.$loaded().then(function(){
    $scope.chapter = chapter;
    console.log(chapter.chapter)
    i = 0
    $.each(chapter.chapter, function(index, value) {
        if(value.id==$stateParams.id){
          $scope.content = value.content
        }
        i++;
    });
    id = parseInt($stateParams.id)

    if(id < i){
      $scope.next = id + 1
    }else{
      $scope.next = false
    }
    $scope.course_title = chapter.course_title;
  })
})

=======

    //TODO Pisahkan antara guru siswa dan ortu
    $scope.syncMataPelajaranAktif = function(){
      SyncService.getMataPelajaranAktif().then(function(resp){
        console.log(resp.data.data);
        var matpel_aktif = resp.data.data;
        matpel_aktif.forEach(function(matpel){
          console.log('matpel');
          console.log(matpel);
          var regUserDataRef = new Firebase($rootScope.baseUrl + 'mata_pelajaran/semester_aktif/' + matpel.id);
          regUserDataRef.once("value", function(data){
            regUserDataRef.set(matpel);
          });
        })
        $rootScope.notify('Mata pelajaran aktif pada semester ini sudah disinkronisasikan')
      });
    }

    $scope.broadcastPengumuman = function(){
      console.log('Pengumuman');
      $cordovaDialogs.prompt('Silahkan, mengetikkan pengumuman disini', 'Sayang Juara', ['Cancel', 'Add'], '')
        .then(function (result) {
          if(result.buttonIndex == 2) {
            $cordovaSocialSharing.share(result.input1);
          }
        }
      );
    }

    $scope.doRefresh = function() {
      console.log('refresh');
    }

    $scope.trackMatpel = function(matpel_id){
      console.log('matpel_id');
      console.log(matpel_id);
      $state.go('tracktime', {'id': matpel_id});
    }

  })
.controller('TrackTime', function($scope, $rootScope, $state, $stateParams){
    console.log('TrackTime');

    $scope.timerRunning = true;
    $scope.matpel_id = $stateParams.id;

    $scope.startTrack = function (){
      $scope.$broadcast('timer-start');
      $scope.timerRunning = true;
    };

    $scope.stopTrack = function (){
      $scope.$broadcast('timer-stop');
      $scope.timerRunning = false;
    };

    $scope.$on('timer-stopped', function (event, data){
      console.log('Timer Stopped - data = ', data);
      var refTrackTime = new Firebase($rootScope.baseUrl + 'mata_pelajaran/semester_aktif/' + $scope.matpel_id);
      refTrackTime.once("value", function(trackTime){
        var existing_data = trackTime.val();
        existing_data.total_time = data; //TODO only last value saved, not accumulated
        console.log('existing_data');
        console.log(existing_data);

        refTrackTime.set(existing_data);
        $rootScope.notify('Terimakasih ya sudah belajar selama ' + data.hours + ' jam, ' + data.minutes + ' menit, ' + data.seconds + ' detik. :)');
        $state.go('home.home');
      });
    });

    $scope.recordVoice = function(){
      console.log('Record voice');
      // capture callback
      var captureSuccess = function(mediaFiles) {
        var i, path, len;
        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
          path = mediaFiles[i].fullPath;
          // do something interesting with the file
        }
      };

// capture error callback
      var captureError = function(error) {
        navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
      };

// start audio capture
      navigator.device.capture.captureAudio(captureSuccess, captureError, {limit:2});
    }

    $scope.playAll = function() {
      console.log('Play all recorded voice based on active course');
    }
  })
>>>>>>> jadijuara
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
<<<<<<< HEAD

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

.controller('TeacherCourseListCtrl',function($scope, $rootScope, $state, $ionicPopup, Course){
  $scope.courseList = Course()
  // $scope.$apply();
  // if($scope.courseList.length <= 0){
  //   var alertPopup = $ionicPopup.alert({
  //     title: 'Oops!',
  //     template: 'Anda belum memiliki kursus sama sekali. Silahkan membuat yang baru.',
  //     buttons: [{
  //       type: 'button-positive',
  //       text: 'Buat Baru'
  //     }]
  //   });
  //   alertPopup.then(function(res) {
  //    $state.go("teacher.courseChapterCreate")
  //   });
  // }
}).controller('TeacherChapterListCtrl', function($scope, $stateParams, Chapter){
  $chapterList = Chapter($stateParams.course)
})
.controller('TeacherChapterCreateCtrl', function($scope, Course, Chapter, $state){
  $scope.course = Course
  $scope.loading = false

  $scope.save = function(){
    $scope.loading = true
    $scope.course().$add({user_id: window.localStorage['user_id'], course_title: this.course_title}).then(function(refCourse){
      var course_id = refCourse.key();
      Chapter(course_id).$add({content: $('.fr-view').html(), id: 1}).then(function(refChapter){
        $scope.loading = false;
        $state.go('teacher.courseChapter.continue',{course: course_id, id: 2});
      })
    })
  }
})
.controller('TeacherChapterContinueCtrl', function($scope, Course, Chapter, $state, $stateParams){
  $scope.course = Course
  $scope.loading = false

  $scope.save = function(){
    $scope.loading = true
    Chapter($stateParams.course).$add({content: $('.fr-view').html(), id: $stateParams.id}).then(function(refChapter){
      $scope.loading = false;
      $state.go('teacher.courseChapter.continue',{course: $stateParams.course, id: parseInt($stateParams.id) + 1});
    })
  }
})
.controller('TeacherChapterDetectCtrl', function($scope, Chapter, $stateParams, Course){
  var chapter = Chapter($stateParams.course)
  chapter.$loaded().then(function(){
    console.log(chapter)
    $scope.chapters = chapter
  })
})
.controller('TeacherChapterEditCtrl',function($scope, $stateParams, Chapter){


})

.controller('GmapCtrl', function($scope){
  $scope.map = { center: { latitude: -0.7893, longitude: 114 }, zoom: 4 };
  var onSuccess = function(position) {
    $scope.map.center = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    };
    $scope.map.zoom = 10;
    $scope.$apply();
  }
  $scope.markers = [
    {
      latitude: -0.7893, longitude: 114,
      id: 0,
      "options": {labelContent: '<p>SMAN 1 Yogyakarta</p><span>5</span>',
          labelClass: "marker-labels"},
      show: true
    }
  ]
});

=======
});
>>>>>>> jadijuara
