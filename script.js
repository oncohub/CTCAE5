angular.module('ctcaeApp', ['ionic', 'jett.ionic.filter.bar', 'ui.router'])
    .controller('HomeCtrl', ["$scope", "$timeout", "$state", "sharedService", "$ionicScrollDelegate", "$ionicFilterBar", "$ionicSideMenuDelegate", function ($scope, $timeout, $state, sharedService, $ionicScrollDelegate, $ionicFilterBar, $ionicSideMenuDelegate) {
        $scope.shareData = sharedService;
        $scope.$on('$ionicView.beforeLeave', function (e) {
                document.getElementById('filterBar').style.display = 'none';
        });
        $scope.$on('$ionicView.beforeEnter', function (e) {
                $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
                document.getElementById('filterBar').style.display = 'inherit';
        });
        $scope.shareData.aeList = ctcae;
        $scope.socTitle = 'All';

        if (!$scope.shareData.flags) {
            $scope.shareData.flags = {};
        }

        $scope.shareData.socList = $scope.shareData.aeList.map(function (element) {
            return element.soc;
        }).filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });

        var divAdded = [];
        for (i in $scope.shareData.socList) {
            var pos = ctcae.map(function (element) {
                return element.soc;
            }).indexOf($scope.shareData.socList[i]);
            divAdded.unshift(pos);
        }
        for (i in divAdded) {
            $scope.shareData.aeList.splice(divAdded[i], 0, {
                term: $scope.shareData.aeList[divAdded[i]].soc,
                soc: false
            });
        }
        $scope.getItemHeight = function (item) {
            return item.soc ? 44 : 30;
        };

        $scope.shareData.getAe = function () {
            if ($scope.shareData.search) {
                return $scope.shareData.aeList.filter(function (item) {
                    return !item.soc || ["term", "meddra", "g1", "g2", "g3", "g4", "g5", "def", "nav"].some(function (val) {
                        return item[val].toLowerCase().indexOf($scope.shareData.search.toLowerCase()) > -1
                    });
                }).filter(function (item, index, self) {
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

        $scope.shareData.encode = function (string) {
                var i = String(string).length,
                    a = [];
                while (i--) {
                    var iC = string[i].charCodeAt();
                    if (iC === 38) {
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

        $scope.flagging = function (meddra, e) {
            e.preventDefault();
            e.stopPropagation();
            if (!$scope.shareData.flags[meddra]) {
                $scope.shareData.flags[meddra] = true;
            } else {
                delete $scope.shareData.flags[meddra];
            }
            $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
        }


        $scope.getItem = function (meddra, e) {
            if (meddra) {
                $scope.shareData.detail = $scope.shareData.aeList.filter(function (item) {
                    return item.meddra === meddra;
                });
                $state.go('tabs.detail');
            }
        }

        $scope.getSoc = function (soc) {
            if (soc) {
                $scope.socTitle = soc;
                $scope.shareData.aeList = ctcae.filter(function (item) {
                    return item.soc === soc;
                });
                $scope.shareData.aeList.unshift({
                    term: soc,
                    soc: false
                })
            } else {
                $scope.socTitle = 'All';
                $scope.shareData.aeList = ctcae;
            }
            $ionicSideMenuDelegate.toggleLeft();
            $timeout(function () {
                $ionicScrollDelegate.scrollTop(false);
            }, 300)
        }

        $scope.getFlag = function () {
            $scope.shareData.aeList = ctcae.filter(function (item) {
                for (i in this) {
                    if (this[i] === item.meddra) {
                        return item;
                    }
                }
            }, Object.keys($scope.shareData.flags));
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
                    soc: false
                });
            }
            $scope.socTitle = '<i class="icon ion-ios-checkmark-outline red-flag head"></i>Flagged';

            $ionicSideMenuDelegate.toggleLeft();
            $timeout(function () {
                $ionicScrollDelegate.scrollTop(false);
            }, 300)
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
    }])

    .controller('DetailCtrl', ["$scope", "sharedService", function ($scope, sharedService) {
        $scope.shareData = sharedService;

    }])
    .controller('SearchCtrl', ["$scope", "sharedService", function ($scope, sharedService) {
        $scope.shareData = sharedService;

    }])
    .controller('InfoCtrl', ["$scope", "sharedService", "$ionicPopup", function ($scope, sharedService) {
        $scope.shareData = sharedService;
    }])

    .config(["$stateProvider", "$urlRouterProvider", "$ionicConfigProvider", function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
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
                        templateUrl: "home.html"
                    }
                }
            })
            .state('tabs.detail', {
                url: "/detail",
                views: {
                    'tabs-home': {
                        templateUrl: "detail.html"
                    }
                }
            })
            .state('tabs.info', {
                url: "/info",
                views: {
                    'tabs-info': {
                        templateUrl: "info.html"
                    }
                }
            });
        $urlRouterProvider.otherwise("/tabs/home");
        // note that you can also chain configs
        $ionicConfigProvider.navBar.positionPrimaryButtons('left');
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.tabs.style('standard');
        $ionicConfigProvider.navBar.alignTitle('left');
        $ionicConfigProvider.backButton.text('');
        $ionicConfigProvider.backButton.previousTitleText('');
    }]).factory("sharedService", function () {
        return {
            text: 'sharedService'
        };
    }).filter('highlight', ["$sce", function ($sce) {
        return function (text, phrase) {
            if (text) {
                if (phrase) {
                    text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                        '<span class="highlighted">$1</span>');
                }
            }
            return $sce.trustAsHtml(text);
        }
    }]);