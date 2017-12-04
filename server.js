///////////////////////////////////////Imports
const Firebase=require('firebase');
const SerialPort=require('serialport');
const Type = require('type-of-is');
///////////////////////////////////////

///////////////////////////////////////Config and Varibles
var config = {
    apiKey: "AIzaSyDIQMP6yMBrKuwDvtRaSmhwYMMZC3FyqpY",
    authDomain: "smart-garden-ca02a.firebaseapp.com",
    databaseURL: "https://smart-garden-ca02a.firebaseio.com",
    projectId: "smart-garden-ca02a",
    storageBucket: "smart-garden-ca02a.appspot.com",
    messagingSenderId: "269607227081"
  };
Firebase.initializeApp(config);

const serialport=new SerialPort('/dev/tty.usbserial-DA01H31J',{baudRate: 9600});
//const Readline = serialport.parsers.readline;
const userID='5wISgFmavTZkpNgjdsyyqXKlNbH2';// set this equal to something that changes with each xbee
const database=Firebase.database();
const unqId = 'aur823';
var nextdata;
console.log('Listening!');
///////////////////////////////////////

///////////////////////////////////////Functions and Console.logs
serialport.on('readable',function(chunk) {
  //console.log('Data', serialport.read([8]));
  let date=new Date();
  let data=serialport.read([8]);

  let unqId;
  let value;
  let vorm;
  if (data==null){
    unqId=null;
    value=null;
  }
  else {
    console.log('Data_in', data.toString());
    vorm=data.slice(0,1).toString();
    unqId=data.slice(1,6).toString();
    value=data.slice(6,8).toString();
    //listenforchanges();
    switch(vorm){
      case "m":
        moisture(unqId,value,date);
        break;
      case "v":
        valve(unqId,value,date);
        break;
      case "a":
        valve(unqId,value,date);
        break;
      default:
        console.log(vorm+' =not m or v')
        break;
    }
    
  }
  
});

function moisture(unqId,value,date){
  database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/').once('value',function(snapshot) {
    
    if (snapshot.hasChild(unqId)) {
      console.log("vlaue ="+value);
      database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/'+unqId).update({
        data: value,
        //icon: 'opacity',
        //id: unqId,
        //title: 'Moisture Sensor 1',
        //type: 'moisture',
      });
      database.ref('Users/'+ userID +'/History/'+ unqId+"/"+date).set({
        data:value
      });
    }
  });//console.log(" is equal to "+unqId);

}
function valve(unqId,value,date){
  //let nextdata;
  //database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/'+unqId).once('value',function(snapshot) 
  //{
  //nextdata = snapshot.val().Next_data;
  //})
  fire_read_Next_data()
  console.log(nextdata);
  if(value=="on"){
    value=1;
  }
  else if(value=="of"){
    value=0
  }
  else if(value=="XB"){
      if (nextdata == 1){
        serialport.write("on")
        console.log('data_out:on');
        fire_write_data(0);
        value =1;
      }else{
        serialport.write("of")
        value =0;
        console.log('data_out:of');
        fire_write_data(0);

      }
  }
      
}
//function listenforchanges(){
  database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/').on('value',function(snapshot) {
    
    snapshot.forEach((childsnap) => {
      
        if(childsnap.val().type=='valve'){
          if (childsnap.val().data==1){
              fire_write_Next_data(1)
            }
          else if(childsnap.val().data==0){
              fire_write_Next_data(0)
            }
        }
        
        
    })
    
  });
//}
//serialport.write("here");
///////////////////////////////////////
function fire_write_Next_data(next_data) {
    database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/').once('value',function(snapshot) {
      if (snapshot.hasChild(unqId)) {

          database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/'+unqId).update({
          Next_data: next_data,
         
         });
       }
    });
}

function fire_read_Next_data() {
  database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/'+unqId).once('value',function(snapshot) {
          
          nextdata = snapshot.val().Next_data
         
     });
    
}
function fire_read_data(){
  let Data;
  database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/'+unqId).once('value',function(snapshot) {
    
          Data = snapshot.val().data
          return Data;
    
  });
}
function fire_write_data(Data){
    database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/').once('value',function(snapshot) {
      if (snapshot.hasChild(unqId)) {

          database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/'+unqId).update({
          data: Data,
         
         });
       }
    });  
}
