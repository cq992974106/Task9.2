const mongoose = require('mongoose');
const Light = require('./models/Light')
const mqtt = require('mqtt')
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
require('events').EventEmitter.defaultMaxListeners = 0

//mongoose.connect("mongodb://localhost:27017/sit314DB",{useNewUrlParser:true})
mongoose.connect("mongodb+srv://chenqiang:Cq668471@sit314.hnfqz.mongodb.net/sit314DB?retryWrites=true&w=majority")

function insert(id,area,location,locationBrightness,state,mode){

    var light =  new Light({
      id: id,
      area: area,
      location: location,
      locationBrightness: locationBrightness,
      state: state,
      mode: mode
      }
            );
    light.save(function(err,res){
        if(err){
            console.log(err);
        }
        else{
            console.log(res);
        }
    })
    }

    //insert light
    /*for(var a=0;a<4;a++){
    for(var i=0;i<10;i++)
    {
        const low = 0;
        const high = 100;
        brightness = Math.floor(Math.random() * (high - low) + low);
        var id = "light"+(i+1);
        var area = "area"+(a+1);
        var location ="location"+(i+1);
        var state = "off";
        var mode = "manual";
        insert(id,area,location,brightness,state,mode);
    }
}*/
    mqttFunction();
   setInterval(lightTest, 5000);

    function lightTest(){
    for(var a=0;a<4;a++){
    //var mode = "automatic";
    for(var i=0;i<10;i++){
    const low = 0;
    const high = 100;
    var area ="area"+(a+1);
    var State = "off";
    brightness = Math.floor(Math.random() * (high - low) + low);
    var id = "light"+(i+1);

    if(brightness>=50)
    {
        State = "off";
    }
    else
    {
        State="on";
    }
      //if the mode is manual, it will not switch the light automatically
      findMode(area,id,brightness,State);
      //console.log(area);
    }
}
}

function findMode(area,id,brightness,State){
    Light.findOne(
        {id:id,area:area},function (err, light){
  
            if(err) { 
                console.log(err);
          }
          
           if(!light) {
            console.log("light not existed");
        }
            if(light.mode == "manual"){
                light.locationBrightness=brightness;
                light.save();
            }
            else
            {    //console.log(area);
                light.locationBrightness=brightness;
                light.state=State;
                light.save();
               
            }
          }
          
    )
}

function mqttFunction()
{
    var topic="/light";
    var message="The client start to send info to the DB";
    
    client.on('connect', () =>
    {
     //console.log('mqtt connected');
    client.publish(topic, message);
    console.log('published to Topic: ' + topic + " with Message: " +message);
}); 
}

