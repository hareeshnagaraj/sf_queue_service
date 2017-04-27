// This entire file represents the traffic controller.

// -------------------------------------------------------------------
// Global variables
// -------------------------------------------------------------------

var trafficLightTimer = setInterval(changeTrafficLight, 30000);
var currentGreenTrafficLights = ["Lane1"]; 

var incomingQueue = //Create Queue;
var lane1 = //Create Queue;
var lane2 = //Create Queue;

// -------------------------------------------------------------------
// Controller Methods
// -------------------------------------------------------------------

// Have the controller constantly check for new data
// This calls the manageTraffic method every second to read in the new data and perform relevant work.
setInterval(manageTraffic, 1000);

// This method is called every second.
function manageTraffic() 
{
    // Check if we have any incoming messages
    var incomingMessage = RestApiCall(put parameters here);

    // If there is no incoming message, switch traffic light and reset timer.
    if (!incomingMessage)
    {
        // Do nothing
    }
    else 
    {
        var dequeueResponse = API CALL;
        var i = 0;
        // Read the first 100 incoming messages
        while (i < 100 || dequeueResponse != empty) 
        {
            // call dequeue on incomingQueue
            // If result is of lane 1, put it in lane 1

            i++;
        }
    }

    // reset the interval IF one queue is empty and one isn't ... set in favour of which lane has the car
    if () {
        clearInterval(trafficLightTimer);
        trafficLightTimer = setInterval(changeTrafficLight, 30000);
    }

    // Check which light is currently green. If so, let the first 10 cars in that lane through.
    // Note: this is not the most efficient way of checking
}

// -------------------------------------------------------------------
// API calls into service
// -------------------------------------------------------------------
