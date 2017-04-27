// SF RCQ as a Service
// Traffic Controller Demo

// In this example, traffic at an intersection is simulated by using the service fabric reliable concurrent queue. 

// Entities:
//     - Cars
//     - 2 Traffic Lights
//     - 2 Lanes

// Workflow:
//     - Client randomly generates cars at each of the traffic lights. Each 'car' message is enqueued in the SF RCQ service in
//       one of two lanes
//     - Once the traffic light turns green for either of the lanes, enqueue a 'move car' message. 
//     - When a 'move car' message is dequeued, decrement the car count for that given lanes

self.importScripts('entities.js');
var trafficGenVar;

self.addEventListener(
    'message', 
    function(e) {
        if (e.data['cmd'] == 'generateTraffic')
        {
            // Start generating traffic every 1000 seconds
            trafficGenVar = setInterval(generateTraffic, 1000);

            self.postMessage(
                {
                    'cmd':'generateTraffic',
                    'status':'started'
                });
        }
        if(e.data['cmd'] == 'stopTraffic'){
            clearInterval(trafficGenVar);
        }
        else if (e.data['cmd'] == 'getTraffic')
        {
            self.postMessage('Returning traffic');
            self.postMessage(
            {
                'cmd':'getTraffic',
                'values': getTraffic()
            });
        }
        else if (e.data['cmd'] == 'updateStopLight')
        {
            self.postMessage('Updating stop light');
            self.postMessage(
            {
                'cmd':'updateStopLight',
                'values': updateStopLight(e.data['lane1'], e.data['lane2'])
            });
        }   
        else
        {
          self.postMessage(e.data);
        }
    }, 
    false);

var testQueue = []; // The queue is maintained in js locally for testing

// Generate cars and add them to the SF RCQ
function generateTraffic()
{
    var lane = getRandomInt(1, 3);
    var newCar = 
        new Car(
            lane == 1 ? 
                TrafficLight.Lane1 : 
                TrafficLight.Lane2);
    
    // Replace the test queue with the RCQ API calls
    testQueue.push(newCar);
}

// Get the current traffic from the RCQ
function getTraffic()
{
    // Replace with a dequeue API call
    var currentTraffic = testQueue;
    testQueue = [];   
    return currentTraffic;
}

function updateStopLight(lane1, lane2)
{
    var laneStatus = {
        lane1Light : lane1,
        lane2Light : lane2
    }

    var i = getRandomInt(1, 1000);
    console.log("updateStopLight - light 1 " + laneStatus.lane1Light + " light 2 " + laneStatus.lane2Light);
    if (laneStatus.lane1Light == "Red" &&  laneStatus.lane2Light == "Red")
    {
        laneStatus.lane1Light = "Green";
        laneStatus.lane2Light = "Red";   
    }
    else if (laneStatus.lane1Light == "Red" && laneStatus.lane2Light == "Green")
    {
        laneStatus.lane1Light = "Green";
        laneStatus.lane2Light = "Red";   
    }
    else
    {
        laneStatus.lane1Light = "Red";
        laneStatus.lane2Light = "Green";
    }

    return laneStatus;
}