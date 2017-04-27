// Entities for traffic control

var TrafficLight = {
  Lane1: 1,
  Lane2: 2,
};

// Car class 
function Car (lane, Action) {
    this.lane = lane;
    this.id = this.getId();
    this.action = Action;
}
 
Car.prototype.getInfo = function() {
    return this.lane;
};

Car.prototype.getId = function(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}