// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('ngantriApp', ['ionic', 'firebase', 'froala', 'ngantriApp.controllers'])
.factory('School', ['$firebaseArray', function($firebaseArray) {
    var schoolRef = new Firebase('https://ngantri.firebaseio.com/sayangjuara/school/');
    return $firebaseArray(schoolRef);
}])
.factory('User', ['$firebaseArray', function($firebaseArray) {
    var userRef = new Firebase('https://ngantri.firebaseio.com/sayangjuara/user_data/');
    return $firebaseArray(userRef);
}])
.run(function($ionicPlatform, $rootScope, $firebaseAuth, $firebase, $window, $ionicLoading, $log) {
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
  $urlRouterProvider.when('/teacher', '/teacher/course');
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
  }).state('home.queue', {
    url: '/queue/:id',
    controller: 'QueueCtrl',
    views: {
      'home-tab': {
        controller: 'QueueCtrl',
        templateUrl: "templates/queue.html"
      }
    }
  }).state('home.current', {
    url: '/current',
    views: {
      'current-tab': {
        controller: 'ActiveListCtrl',
        templateUrl: "templates/current.html"
      }
    }
  }).state('home.active', {
    url: '/active/:id',
    views: {
      'current-tab': {
        controller: 'ActiveCtrl',
        templateUrl: "templates/active.html"
      }
    }
  }).state('home.user', {
    url: '/user',
    views: {
      'user-tab': {
        templateUrl: "templates/user.html"
      }
    }
  }).state('home.balancestatus', {
    url: '/balanceuser',
    views: {
      'user-tab': {
        templateUrl: "templates/balancestatus.html"
      }
    }
  }).state('home.buypoint', {
    url: '/buypoint',
    views: {
      'user-tab': {
        templateUrl: "templates/buypoint.html"
      }
    }
  }).state('teacher', {
    url: '/teacher',
    abstract: true,
    templateUrl: 'templates/teacher-tabs.html'
  }).state('teacher.home', {
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
  }).state('teacher.courseChapter.edit', {
    url: '/:course/:id',
    templateUrl: "templates/teacher-chapter-edit.html"
  });


  // if none of the above states are matched, use this as the fallback

  $urlRouterProvider.otherwise('/login');


});
