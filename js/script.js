angular.module('ctcaeApp', ['ionic', 'jett.ionic.filter.bar', 'ui.router'])
    .controller('HomeCtrl', ["$scope", "$timeout", "$state", "sharedService", "$ionicScrollDelegate", "$ionicFilterBar", "$ionicSideMenuDelegate", "$ionicLoading", "$ionicPopup", "$ionicListDelegate", function ($scope, $timeout, $state, sharedService, $ionicScrollDelegate, $ionicFilterBar, $ionicSideMenuDelegate, $ionicLoading, $ionicPopup, $ionicListDelegate) {
        $scope.shareData = sharedService;

        if (!$scope.shareData.flags) {
            $scope.shareData.flags = {};
        }

        $scope.shareData.secondaryOn = true; //bilingual setting

        $scope.$on('$ionicView.beforeLeave', function (e) {
            try {
                document.getElementById('filterBar').style.display = 'none';
            } catch (e) {
                console.log(e);
            }
        });
        $scope.$on('$ionicView.beforeEnter', function (e) {
            try {
                $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
                document.getElementById('filterBar').style.display = 'inherit';
            } catch (e) {
                console.log(e);
            }

        });
        $scope.$on('$ionicView.afterEnter', function () {
            var getFirstBrowserLanguage = function () {
                var nav = window.navigator,
                    browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
                    i,
                    language;

                // support for HTML 5.1 "navigator.languages"
                if (Array.isArray(nav.languages)) {
                    for (i = 0; i < nav.languages.length; i++) {
                        language = nav.languages[i];
                        if (language && language.length) {
                            return language;
                        }
                    }
                }

                // support for other well known properties in browsers
                for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
                    language = nav[browserLanguagePropertyKeys[i]];
                    if (language && language.length) {
                        return language;
                    }
                }

                return null;
            };

            $timeout(function () {
                if ($scope.shareData.secondaryOn) {
                    if (!$scope.shareData.lang) {
                        if (getFirstBrowserLanguage() === 'ja') {
                            $scope.shareData.lang = 'ja';
                            $scope.shareData.langJa = true;
                        } else {
                            $scope.shareData.lang = 'en';
                            $scope.shareData.langJa = null;
                        }
                    }
                } else {
                    $scope.shareData.lang = 'en';
                    $scope.shareData.langJa = null;
                }

            });


        });


        $scope.freezeScroll = function () {
            $ionicScrollDelegate.$getByHandle('mainScroll').getScrollView().options.scrollingY = false;
        }
        $scope.enableScroll = function () {
            $ionicScrollDelegate.$getByHandle('mainScroll').getScrollView().options.scrollingY = true;
        }

        $scope.shareData.local = {
            en: {
                all: "All",
                flagged: "Checked",
                back: "Back",
                search: "Search",
                cancel: "Cancel",
                def: "Definition",
                nav: "Navigational Note"
            },
            ja: {
                all: "すべて",
                flagged: "チェック付き",
                back: "戻る",
                search: "検索",
                cancel: "キャンセル",
                def: "定義",
                nav: "検索上の注意"
            }
        };

        $scope.shareData.aeList = ctcae;

        /*
        var meddracheck = $scope.shareData.aeList.filter(function(ele){
            return ele.meddra !== ele.meddraja;
        });
        console.log('meddracheck', meddracheck);
        */

        $scope.socTitle = {
            en: $scope.shareData.local['en']['all'],
            ja: $scope.shareData.local['ja']['all']
        };

        $scope.shareData.socList = $scope.shareData.aeList.map(function (element) {
            return {
                soc: element.soc,
                socja: element.socja
            };
        }).filter(function (x, i, self) {
            return self.map(function (val) {
                return val.soc;
            }).indexOf(x.soc) === i;
        });
        var divAdded = [];
        for (i in $scope.shareData.socList) {
            var pos = ctcae.map(function (element) {
                return element.soc;
            }).indexOf($scope.shareData.socList[i].soc);
            divAdded.unshift(pos);
        }
        for (i in divAdded) {
            $scope.shareData.aeList.splice(divAdded[i], 0, {
                term: $scope.shareData.aeList[divAdded[i]].soc,
                soc: false,
                termja: $scope.shareData.aeList[divAdded[i]].socja,
                socja: false
            });
        }
        $scope.getItemHeight = function (item) {
            return item.soc ? 44 : 30;
        };

        $scope.shareData.changeLang = function () {
            if ($scope.shareData.secondaryOn) {
                if ($scope.shareData.lang === 'ja') {
                    $scope.shareData.lang = 'en';
                } else {
                    $scope.shareData.lang = 'ja';
                    $scope.shareData.langJa = true;
                }
            } else {
                $scope.shareData.lang = 'en';
            }
        }

        $scope.showFilterBar = function () {
            if ($ionicSideMenuDelegate.isOpen()) {
                $ionicSideMenuDelegate.toggleLeft();
            }
            filterBarInstance = $ionicFilterBar.show({
                cancel: function () {
                    $scope.shareData.search = '';
                }
            });
        };

        $scope.shareData.getAe = function () {
            if ($scope.shareData.search) {
                var english = String($scope.shareData.search).split('').every(function (str) {
                    return str.charCodeAt() < 256;
                });
                console.log('english', english);
                if (!english && $scope.shareData.secondaryOn) {
                    $scope.shareData.lang = "ja";
                    $scope.shareData.langJa = true;
                    $scope.shareData.target = $scope.shareData.aeList.filter(function (item, i, self) {
                        return !item.soc || ["meddra", "termja", "g1ja", "g2ja", "g3ja", "g4ja", "g5ja", "defja", "navja"].some(function (val) {
                            return item[val].toLowerCase().indexOf($scope.shareData.search.toLowerCase()) > -1
                        });
                    });
                } else {
                    $scope.shareData.lang = "en";
                    $scope.shareData.target = $scope.shareData.aeList.filter(function (item, i, self) {
                        return !item.soc || ["meddra", "term", "g1", "g2", "g3", "g4", "g5", "def", "nav"].some(function (val) {
                            return item[val].toLowerCase().indexOf($scope.shareData.search.toLowerCase()) > -1
                        });
                    });
                }
                return $scope.shareData.target.filter(function (item, index, self) {
                    try {
                        return (!item.soc && item.term === self[index + 1].soc) || item.soc;
                    } catch (e) {
                        console.log('no data in a category');
                    }
                });
            } else {
                return $scope.shareData.aeList;
            }
        };

        $scope.shareData.encode = function (obj, key) {
            try {
                if (key) {
                    var str = String(obj[key + ($scope.shareData.lang === 'ja' ? 'ja' : '')]);
                } else {
                    var str = String(obj[key]);
                }
                var i = String(str).length,
                    a = [];
                while (i--) {
                    var iC = str[i].charCodeAt();
                    if (str[i] === "\"") {
                        a[i] = "&quot;";
                    } else if (str[i] === "&") {
                        a[i] = "&amp;";
                    } else if (iC === 62) {
                        a[i] = "&gt;";
                    } else if (iC === 60) {
                        a[i] = "&lt;";
                    } else {
                        a[i] = str[i];
                    }
                }
                return a.join('');
            } catch (e) {
                console.log(e);
            }
        };

        $scope.scrollTop = function () {
            $ionicScrollDelegate.scrollTop(false);
        };

        $scope.toggleLeft = function () {
            $ionicScrollDelegate.scrollTop(false);
            $scope.shareData.search = '';
            $ionicSideMenuDelegate.toggleLeft();
            $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
        };

        $scope.shareData.flagging = function (meddra, e) {
            e.preventDefault();
            e.stopPropagation();
            if (!$scope.shareData.flags[meddra]) {
                $scope.shareData.flags[meddra] = true;
            } else {
                delete $scope.shareData.flags[meddra];
            }
            $scope.shareData.putDb($scope.shareData.flags);
            $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
            if ($scope.socTitle.en.includes("ion-ios-checkmark")) {
                $scope.socTitle = flagTitle();
            }
        }

        function flagTitle() {
            return {
                en: '<i class="icon ion-ios-checkmark color-checkmark head"></i>' + $scope.shareData.local['en']['flagged'] + ' (' + $scope.shareData.flagNum + ')',
                ja: '<i class="icon ion-ios-checkmark color-checkmark head"></i>' + $scope.shareData.local['ja']['flagged'] + ' (' + $scope.shareData.flagNum + ')'
            };
        }

        $scope.getItem = function (meddra, e) {
            if (meddra) {
                $scope.shareData.detail = $scope.shareData.aeList.filter(function (item) {
                    return item.meddra === meddra;
                });
                $state.go('tabs.detail');
            } else {
                e.preventDefault();
            }
            $timeout(function () {
                $ionicListDelegate.closeOptionButtons();
            }, 300)
        }

        $scope.getSoc = function (arr, soc) {
            if (soc) {
                $scope.socTitle = {
                    en: arr['soc'],
                    ja: arr['socja']
                };
                $scope.shareData.aeList = ctcae.filter(function (item) {
                    return item.soc === arr.soc;
                });
                $scope.shareData.aeList.unshift({
                    term: arr['soc'],
                    soc: false,
                    termja: arr['socja'],
                    socja: false
                })
            } else {
                $scope.socTitle = {
                    en: $scope.shareData.local['en']['all'],
                    ja: $scope.shareData.local['ja']['all']
                };
                $scope.shareData.aeList = ctcae;
            }
            $ionicSideMenuDelegate.toggleLeft();
            $timeout(function () {
                $ionicScrollDelegate.scrollTop(false);
                $ionicListDelegate.closeOptionButtons();
            }, 300)
        }

        $scope.getFlag = function () {
            var meddraList = Object.keys($scope.shareData.flags);
            $scope.shareData.aeList = ctcae.filter(function (item) {
                for (i in this) {
                    if (this[i] === item.meddra) {
                        return item;
                    }
                }
            }, meddraList);
            var socList = $scope.shareData.aeList.map(function (element) {
                return element.soc;
            }).filter(function (x, i, self) {
                return self.indexOf(x) === i;
            });
            var divAdded = [];
            for (i in socList) {
                var pos = $scope.shareData.aeList.map(function (element) {
                    return element.soc;
                }).indexOf(socList[i]);
                divAdded.unshift(pos);
            }
            for (i in divAdded) {
                $scope.shareData.aeList.splice(divAdded[i], 0, {
                    term: $scope.shareData.aeList[divAdded[i]].soc,
                    soc: false,
                    termja: $scope.shareData.aeList[divAdded[i]].socja,
                    socja: false
                });
            }
            $scope.socTitle = flagTitle();

            $ionicSideMenuDelegate.toggleLeft();
            $timeout(function () {
                $ionicScrollDelegate.scrollTop(false);
            }, 300)
        }

        var dbName = 'ctcaeDB';
        var storeName = 'flagStore';

        $scope.shareData.putDb = function (value) {

            var openReq = indexedDB.open(dbName);
            openReq.onsuccess = function (event) {
                var db = event.target.result;
                var trans = db.transaction(storeName, 'readwrite');
                var store = trans.objectStore(storeName);

                var putReq = store.put({
                    id: 'flags',
                    contents: value
                });

                putReq.onsuccess = function () {
                    console.log('put data success');
                }

                trans.oncomplete = function () {
                    console.log('transaction completed');
                }
                db.close();
            }
            openReq.onerror = function (event) {
                console.log('db open error');
            }
        }

        getDb();

        function getDb() {
            var openReq = indexedDB.open(dbName);
            openReq.onupgradeneeded = function (event) {
                var db = event.target.result;
                db.createObjectStore(storeName, {
                    keyPath: 'id'
                });
            }
            openReq.onsuccess = function (event) {
                var db = event.target.result;
                var trans = db.transaction(storeName, 'readonly');
                var store = trans.objectStore(storeName);
                var getReq = store.get('flags');

                getReq.onsuccess = function (event) {
                    try {
                        $scope.shareData.flags = event.target.result.contents; // {id : 'A1', name : 'test'}
                        $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
                    } catch (e) {
                        console.log('error', e);
                    }
                }

                getReq.onerror = function (event) {
                    console.log('db not exist');
                }
            }
            openReq.onerror = function (event) {
                $scope.shareData.putDb($scope.shareData.flags);
            }
        }

        //removeDb('ctcaelite');

        $scope.shareData.dbremove = function (dbName) {
            removeDb(dbName);
        }

        function removeDb(dbName) {
            var deleteReq = indexedDB.deleteDatabase(dbName);
            deleteReq.onsuccess = function (event) {
                console.log('db delete success');

            }
            deleteReq.onerror = function () {
                console.log('db delete error');
            }
        }
        $scope.removeFlags = function () {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Uncheck All',
                template: 'Are you sure you want to uncheck all checkmarks?',
                okText: "Uncheck",
                okType: "button-assertive"
            });

            confirmPopup.then(function (res) {
                if (res) {
                    var none = {};
                    $scope.shareData.flags = none;
                    $scope.shareData.putDb(none);
                    $scope.shareData.flagNum = 0;
                    $scope.socTitle = flagTitle();
                    $ionicListDelegate.closeOptionButtons();

                } else {
                    console.log('You are not sure');
                }
            });
        }
        browsercheck();

        function browsercheck() {
            var message = false;
            if (bowser.safari) {
                message = bowser.check({
                    safari: "11.1"
                });
            } else if (bowser.ios) {
                message = bowser.check({
                    ios: "11.3"
                });
            } else if (bowser.chrome) {
                message = bowser.check({
                    chrome: "45"
                });
            } else if (bowser.android) {
                message = true;
            } else if (bowser.msedge) {
                message = bowser.check({
                    msedge: "17"
                });
            } else if (bowser.firefox) {
                message = bowser.check({
                    firefox: "44"
                });
            } else if (bowser.opera) {
                message = bowser.check({
                    opera: "32"
                });
            } else {
                message = false;
            }
            if (!message) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Browser not supported',
                    template: 'Your browser may not be compatible fully. Please consider to use the latest version of Chrome, Safari, Firefox or Edge.',
                    okText: 'Dismiss'
                });
                alertPopup.then(function (res) {
                    console.log('');
                });
            }

        }

    }])

    .controller('DetailCtrl', ["$scope", "sharedService", function ($scope, sharedService) {
        $scope.shareData = sharedService;
        $scope.shareData.ok = function () {
            alert('g');
        }
    }])
    .controller('SearchCtrl', ["$scope", "sharedService", function ($scope, sharedService) {
        $scope.shareData = sharedService;

    }])
    .controller('PsCtrl', ["$scope", "sharedService", function ($scope, sharedService) {
        $scope.shareData = sharedService;
        $scope.$on('$ionicView.enter', function (e) {
            try {
                document.getElementById('filterBar').style.display = 'none';
            } catch (e) {
                console.log(e);
            }
        });

    }])
    .controller('InfoCtrl', ["$scope", "sharedService", "$ionicPopup", function ($scope, sharedService, $ionicPopup) {
        $scope.shareData = sharedService;
        $scope.$on('$ionicView.enter', function (e) {
            try {
                document.getElementById('filterBar').style.display = 'none';
            } catch (e) {
                console.log(e);
            }
        });
        $scope.shareData.removeFlags = function () {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Uncheck All',
                template: 'Are you sure you want to uncheck all checkmarks?',
                okText: "Uncheck",
                okType: "button-assertive"
            });

            confirmPopup.then(function (res) {
                if (res) {
                    var none = {};
                    $scope.shareData.flags = none;
                    $scope.shareData.putDb(none);
                } else {
                    console.log('You are not sure');
                }
            });
        }

        $scope.shareData.unregister = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Unregister / Remove Cashe',
                template: 'Are you sure you want to unregister Service Worker and remove Cashe?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    swUnregister();
                } else {
                    console.log('You are not sure');
                }
            });
        }

    }])

    .config(["$stateProvider", "$urlRouterProvider", "$ionicFilterBarConfigProvider", function ($stateProvider, $urlRouterProvider, $ionicFilterBarConfigProvider) {

        $stateProvider
            .state('tabs', {
                url: "/tabs",
                abstract: true,
                templateUrl: "tabs.html"
            })
            .state('tabs.home', {
                url: "/home",
                views: {
                    'tabs-home': {
                        templateUrl: "templates/home.min.html"
                    }
                }
            })
            .state('tabs.detail', {
                url: "/detail",
                views: {
                    'tabs-home': {
                        templateUrl: "templates/detail.min.html"
                    }
                }
            })
            .state('tabs.info', {
                url: "/info",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/info.min.html"
                    }
                }
            })
            .state('tabs.privacy', {
                url: "/privacy",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/privacy.min.html"
                    }
                }
            })
            .state('tabs.term', {
                url: "/term",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/term.min.html"
                    }
                }
            })
            .state('tabs.third', {
                url: "/third",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/third.min.html"
                    }
                }
            })
            .state('tabs.about', {
                url: "/about",
                views: {
                    'tabs-about': {
                        templateUrl: "templates/about.min.html"
                    }
                }
            })
            .state('tabs.install', {
                url: "/install",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/install.min.html"
                    }
                }
            });
        $urlRouterProvider.otherwise("/tabs/home");
        $ionicFilterBarConfigProvider.backdrop(true);

    }]).factory("sharedService", function () {
        return {
            text: 'sharedService'
        };
    }).filter('highlight', ["$sce", function ($sce) {
        return function (text, phrase) {
            function Encode(string) {
                var i = string.length,
                    a = [];

                while (i--) {
                    var iC = string[i].charCodeAt();
                    if (string[i] === "\"") {
                        a[i] = "&quot;";
                    } else if (string[i] === "&") {
                        a[i] = "&amp;";
                    } else if (iC === 62) {
                        a[i] = "&gt;";
                    } else if (iC === 60) {
                        a[i] = "&lt;";
                    } else {
                        a[i] = string[i];
                    }
                }
                return a.join('');
            }

            function Escaping(string) {
                var i = string.length,
                    a = [];
                while (i--) {
                    if (["[", "\\", "^", "$", ".", "|", "?", "*", "+", "(", ")"].some(function (val) {
                            return val === string[i];
                        })) {
                        a[i] = "\\" + string[i];
                    } else {
                        a[i] = string[i];
                    }
                }
                return a.join('');
            }
            if (text) {
                if (phrase) {
                    text = text.replace(new RegExp('(' + Escaping(Encode(phrase)) + ')', 'gi'),
                        '<span class="highlighted">$1</span>');
                }
            }
            return $sce.trustAsHtml(text ? text.replace(/\n/g, '<br />') : "");
        }
    }]).config(["$ionicConfigProvider", function ($ionicConfigProvider) {

        // note that you can also chain configs
        $ionicConfigProvider.navBar.positionPrimaryButtons('left');
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.tabs.style('standard');
        $ionicConfigProvider.navBar.alignTitle('left');
        $ionicConfigProvider.backButton.text('');
        $ionicConfigProvider.backButton.previousTitleText('');
    }]);