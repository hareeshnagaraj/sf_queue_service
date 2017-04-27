/// <reference path="angular.js" />
angular.module('RcqDemoApp', [])
    .controller('MainCtrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
        $scope.incomingTrafficTimer;
        $scope.outgoingLane1Timer;
        $scope.outgoingLane2Timer;
        $scope.stopLightTimer;

        // Scope variables
        $scope.showDebugView = false;
        $scope.intersection = 
        {
            lane1 : [],
            lane2 : []
        };

        $scope.lane1Light = "Red";
        $scope.lane2Light = "Red";

        // Traffic generation worker 
        $scope.Worker = new Worker('./js/traffic.js');

        // Worker listeners
        $scope.Worker.addEventListener('message', function(e) {
          if (e.data['cmd'] != null)
          {
            if (e.data['cmd'] == 'generateTraffic')
            {
                console.log('Generate traffic response : ' + e.data['status']);
            }
            else if (e.data['cmd'] == 'getTraffic'){
                $scope.UpdateTraffic(e.data['values']);
            }
            else if (e.data['cmd'] == 'updateStopLight'){
                $scope.lane1Light = e.data['values'].lane1Light;
                $scope.lane2Light = e.data['values'].lane2Light;
            }
          }
        },
        false);

        // Scoped functions
        $scope.UpdateTraffic = function(values)
        {
            for(var i = 0; i < values.length; i++)
            {
                var currentCar = values[i];
                if(currentCar.lane == TrafficLight.Lane1)
                {
                    $scope.intersection.lane1.push(currentCar);
                }
                else if (currentCar.lane == TrafficLight.Lane2)
                {
                    $scope.intersection.lane2.push(currentCar);
                }
            }
        }

        $scope.StartTraffic = function()
        {
            // Start traffic generation
            // This enqueues operations into the RCQ service
            $scope.Worker.postMessage(
            {
                'cmd': 'generateTraffic',
            });

            // Start traffic retrieval
            // This dequeues operations from the RCQ service
            $scope.incomingTrafficTimer = $interval(getTraffic, 10);

            // Start stoplight updates
            // This indicates which lane should be dequeued
            $scope.stopLightTimer = $interval(updateStopLight, 2000);

            // Remove items from each lane based on hte traffic light status
            $scope.outgoingLane1Timer = 
                $interval(
                function () {
                    $scope.UpdateLane1();
                }, 
                2000);

            $scope.outgoingLane2Timer = 
                $interval(
                function () {
                    $scope.UpdateLane2();
                }, 
                2000);
        }

        $scope.UpdateLane1 = function(maxDuration)
        {
            if($scope.lane1Light == "Green" && 
                $scope.intersection.lane1.length > 0)
            {
                var carsToRemove = 
                    getRandomInt(
                        1,
                        $scope.intersection.lane1.length);

                $scope.intersection.lane1 = 
                    $scope.intersection.lane1.slice(carsToRemove * -1);
                console.log("lane 1 removed: " + carsToRemove + " cars");
                return;
            }
        }

        $scope.UpdateLane2 = function(maxDuration)
        {
            if($scope.lane2Light == "Green" && 
                $scope.intersection.lane2.length > 0)
            {
                var carsToRemove = 
                    getRandomInt(
                        1,
                        $scope.intersection.lane1.length);

                $scope.intersection.lane2 = 
                    $scope.intersection.lane2.slice(carsToRemove * -1);
                console.log("lane 2 removed: " + carsToRemove + " cars");
                return;
            }
        }

        $scope.StopTraffic = function()
        {
            $scope.Worker.postMessage(
            {
                'cmd': 'stopTraffic',
            });

            $interval.cancel($scope.incomingTrafficTimer);
            $interval.cancel($scope.stopLightTimer);
            $interval.cancel($scope.outgoingLane1Timer);
            $interval.cancel($scope.outgoingLane2Timer);
        }

        function isTimedOut(startTime, maxDuration){
            if(Date.now() - startTime > maxDuration){
                return true;
            }

            return false;
        }

        // Update the stop lights
        function updateStopLight()
        {
            $scope.Worker.postMessage(
            {
                'cmd': 'updateStopLight',
                'lane1' : $scope.lane1Light,
                'lane2' : $scope.lane2Light
            });
        }

        // Get the latest traffic
        function getTraffic()
        {
            $scope.Worker.postMessage(
            {
                'cmd': 'getTraffic',
            });
        }
        
    }]);

