// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

<<<<<<< HEAD
angular.module('ngantriApp', ['ionic', 'ngCordova', 'firebase', 'froala', 'uiGmapgoogle-maps', 'ngantriApp.controllers'])
=======
angular.module('ngantriApp', ['ionic', 'timer', '$cordovaSocialSharing', 'angular-humanize-duration', 'ngCordova', 'firebase', 'froala', 'ngantriApp.controllers'])
>>>>>>> jadijuara

.factory('School', ['$firebaseArray', function($firebaseArray) {
    var schoolRef = new Firebase('https://ngantri.firebaseio.com/sayangjuara/school/');
    return $firebaseArray(schoolRef);
}])
.factory('User', ['$firebaseArray', function($firebaseArray) {
    var userRef = new Firebase('https://ngantri.firebaseio.com/sayangjuara/user_data/');
    return $firebaseArray(userRef);
}])
<<<<<<< HEAD
.factory('Users', ['$firebaseObject', function($firebaseObject) {
  return function(id){
    var userRef = new Firebase('https://ngantri.firebaseio.com/sayangjuara/user_data/' + id);
    return $firebaseObject(userRef);
  }

}])
.factory('Course', ['$firebaseArray', function($firebaseArray) {
  return function(id) {
    if (!id) {
      var courseRef = new Firebase('https://ngantri.firebaseio.com/course/');
    }else{
      var courseRef = new Firebase('https://ngantri.firebaseio.com/course/' + id);
    }
    return $firebaseArray(courseRef);
  };

}])

=======
>>>>>>> jadijuara
//.factory('Course', ['$firebaseArray', function($firebaseArray) {
//    var courseRef = new Firebase('https://ngantri.firebaseio.com/sayangjuara/mata_pelajaran/semester_aktif/');
//    return $firebaseArray(courseRef);
//}])
<<<<<<< HEAD

=======
>>>>>>> jadijuara
.factory('ReferralCode', ['$firebaseArray', function($firebaseArray) {
  var userRef = new Firebase('https://ngantri.firebaseio.com/sayangjuara/referral_code/');
  return $firebaseArray(userRef);
}])
<<<<<<< HEAD

.factory("Chapters", ['$firebaseArray', '$firebaseObject', function($firebaseArray,$firebaseObject) {
  return function(course,id) {
    var mode = ""
    if(id){
      mode = "/chapter/" + id
    }
    var chapterRef = new Firebase("https://ngantri.firebaseio.com/course/" + course + mode);
    return $firebaseObject(chapterRef);
  };
}])
.factory("Chapter", ['$firebaseArray','$firebaseObject', function($firebaseArray, $firebaseObject) {
  return function(id) {
    var chapterRef = new Firebase("https://ngantri.firebaseio.com/course/" + id + "/chapter/");
    return $firebaseArray(chapterRef);
  };
}])
=======
>>>>>>> jadijuara
.factory('SyncService', function($http, $log) {
    $log.info('SyncMataPelajaranAktif Factory');
    var url = 'https://raw.githubusercontent.com/TimJogjaCeria/sayangjuara-backend/master/matpel_semester_aktif.json';

    return {
      getMataPelajaranAktif: function () {
        return $http.get(url);
      }
    }
})
<<<<<<< HEAD

.factory("Maps", ['$firebaseArray', function($firebaseArray) {
  var schoolRef = new Firebase("https://ngantri.firebaseio.com/sekolah/");
  return $firebaseArray(schoolRef);
}])

.run(function($ionicPlatform, $rootScope, $firebaseAuth, $firebase, $window, $ionicLoading, $log, $stateParams) {
=======
.run(function($ionicPlatform, $rootScope, $firebaseAuth, $firebase, $window, $ionicLoading, $log) {
>>>>>>> jadijuara
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

    });
    $rootScope.$stateParams = $stateParams;
    $rootScope.baseUrl = 'https://ngantri.firebaseio.com/sayangjuara/';
        var authRef = new Firebase($rootScope.baseUrl);
        $rootScope.auth = $firebaseAuth(authRef);

        $rootScope.show = function(text) {
            $rootScope.loading = $ionicLoading.show({
                template: text ? text : 'Loading..',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        };

        $rootScope.hide = function() {
            $ionicLoading.hide();
        };

        $rootScope.notify = function(text) {
            $rootScope.show(text);
            $window.setTimeout(function() {
                $rootScope.hide();
            }, 1999);
        };

        $rootScope.logout = function() {
            $rootScope.auth.$unauth();
            $rootScope.checkSession();
        };

        $rootScope.checkSession = function() {
            var auth = new FirebaseSimpleLogin(authRef, function(error, user) {
                if (error) {
                    // no action yet.. redirect to default route
                    window.localStorage['user_id'] = null;
                    $window.location.href = '#/login';
                } else if (user) {
                    var user_login = User.$getRecord(user.uid);
                    $log.info('login ' + user_login.uid + ', role ' + user_login.role);
                    // user authenticated with Firebase
                    window.localStorage['user_id'] = user.uid;
                    window.localStorage['user_role'] = user_login.role
                    window.localStorage['user_referral'] = user_login.referral;
                    $window.location.href = ('#/home');
                } else {
                    // user is logged out
                    window.localStorage['user_id'] = null;
                    window.localStorage['user_role'] = null;
                    window.localStorage['user_referral'] = null;
                    $window.location.href = '#/login';
                }
            });
        }
})

.config(function ($compileProvider){
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

.config(function($stateProvider, $urlRouterProvider) {
  // redirect the current feature just course making
  // $urlRouterProvider.when('/teacher', '/teacher/course');
  $stateProvider.state('intro', {
    url: '/intro',
    templateUrl: 'templates/intro.html',
    controller: 'IntroCtrl'
  }).state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  }).state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegCtrl'
  }).state('registerschool', {
      url: '/registerschool',
      templateUrl: 'templates/choose_school.html',
      controller: 'ChooseSchoolCtrl'
  }).state('showreferralinfo', {
      url: '/showreferralinfo',
      templateUrl: 'templates/show_referralinfo.html',
      controller: 'ShowReferralInfoCtrl'
  }).state('home', {
    url: '/home',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  }).state('home.home', {
    url: '',
    views: {
      'home-tab': {
        controller: 'HomeCtrl',
        templateUrl: "templates/home.html"
      }
    }
  }).state('home.user', {
    url: '/user',
    views: {
      'user-tab': {
        templateUrl: "templates/user.html"
      }
    }
<<<<<<< HEAD
  })

  .state('home.courseList', {
    url: '/user-course',
    views: {
      'home-course': {
        controller: "HomeCourseListCtrl",
        templateUrl: "templates/home-course-list.html"
      }
    }
  })

  .state('home.courseDetail', {
    url: '/user-course/:course/:id',
    views: {
      'home-course': {
        controller: "HomeCourseDetailCtrl",
        templateUrl: "templates/home-course-detail.html"
      }
    }
  })

  .state('teacher', {
=======
  }).state('teacher', {
>>>>>>> jadijuara
    url: '/teacher',
    abstract: true,
    templateUrl: 'templates/teacher-tabs.html'
  })

  .state('teacher.home', {
    url: '',
    views: {
      'teacher-home': {
        controller: 'TeacherHomeCtrl',
        templateUrl: "templates/teacher-home.html"
      }
    }
  }).state('teacher.courseList', {
    url: '/course',
    views: {
      'teacher-course': {
        controller: 'TeacherCourseListCtrl',
        templateUrl: "templates/teacher-course-list.html"
      }
    }
  }).state('teacher.courseChapterList', {
    url: '/course/chapter/:id',
    views: {
      'teacher-course': {
        controller: 'TeacherChapterListCtrl',
        templateUrl: "templates/teacher-chapter-list.html"
      }
    }
  }).state('teacher.courseChapter', {
    url: '/course/chapter/create',
    abstract: true,
    views: {
      'teacher-course': {
        controller: 'TeacherChapterDetectCtrl',
        templateUrl: "templates/teacher-course-chapter.html"
      }
    }
  }).state('teacher.courseChapterCreate', {
    url: '/course/newchapter',
    views: {
      'teacher-course': {
        controller: 'TeacherChapterCreateCtrl',
        templateUrl: "templates/teacher-chapter-create.html"
      }
    }
  }).state('teacher.courseChapter.continue', {
    url: '/:course/:id',
    controller: 'TeacherChapterContinueCtrl',
    templateUrl: "templates/chapter-form.html"
  })
  .state('teacher.courseChapter.edit', {
    url: '/:course/:id/edit',
    controller: 'TeacherChapterEditCtrl',
    templateUrl: "templates/teacher-chapter-edit.html"
<<<<<<< HEAD
  })

  .state('gmap', {
    url: '/gmap',
    controller: 'GmapCtrl',
    templateUrl: "templates/gmap.html"
  });
=======
  }).state('tracktime', {
    url: '/tracktime/:id',
    templateUrl: 'templates/track_time.html',
    controller: 'TrackTime'
  })

  ;
>>>>>>> jadijuara


  // if none of the above states are matched, use this as the fallback

  $urlRouterProvider.otherwise('/login');


});
