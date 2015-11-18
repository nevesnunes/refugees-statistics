angular.module('countriesModule', [])
    .controller('countriesCtrl', ['$scope', '$http', function($scope, $http) {

        var emigrants;
        var immigrants;
        var displayImmigrants = [];
        var i, j;

        $scope.emigrantsButtonText = "Show all";
        $scope.immigrantsButtonText = "Show all";
        $scope.showBarImmigrants = true;
        $scope.showBarEmigrants = true;

        $scope.emigrantsButton = function() {
            if ($scope.emigrantsButtonText == "Show all") {
                $scope.emigrantsButtonText = "Show top 5";
                $scope.showBarEmigrants = false;
            } else {
                $scope.emigrantsButtonText = "Show all";
                $scope.showBarEmigrants = true;
            }
        };
        $scope.immigrantsButton = function() {
            if ($scope.immigrantsButtonText == "Show all") {
                $scope.immigrantsButtonText = "Show top 5";
                $scope.showBarImmigrants = false;
            } else {
                $scope.immigrantsButtonText = "Show all";
                $scope.showBarImmigrants = true;
            }
        };

        $http.get('data/applicants_gdp.json')
            .then(function(res) {
                immigrants = res.data.data;
                for (i = 0; i < immigrants.length; i++) {
                    if (immigrants[i].year == 2015) {
                        displayImmigrants.push(immigrants[i]);
                    }
                }
                displayImmigrants.sort(function(a, b) {
                    return b.applicants - a.applicants;
                });
                /* put d3 functions here */
                genHorizontalBarchart(displayImmigrants, "verbarImmigrants");
                genVerticalBarchart(displayImmigrants,"horbarImmigrants");
            });

        $http.get('data/emigrants.json')
            .then(function(res) {
                emigrants = res.data.data;
                /* put d3 funtions here */
                genHorizontalBarchart(emigrants, "verbarEmigrants");
                // genVerticalBarchart(emigrants,"horbarEmigrants");
            });
    }]);
