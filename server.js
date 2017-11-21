///////////////////////////////////////Imports
const Firebase=require('firebase');
const SerialPort=require('serialport');
const Xbee=require('xbee-api');
const readline=require('readline');
const {StringDecoder}=require('string_decoder');
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

const serialport=new SerialPort('/dev/tty.usbserial-A51F2158',{baudRate: 9600});
//const Readline = serialport.parsers.readline;
const userID='DJvMhRfvALc3SyUzbQeCdNGVNcl2';// set this equal to something that changes with each xbee
const database=Firebase.database();
const decoder = new StringDecoder('utf8');

///////////////////////////////////////

///////////////////////////////////////Functions and Console.logs
serialport.on('readable',function(chunk) {
  //console.log('Data', serialport.read([8]));
  let date=new Date();
  let data=serialport.read([8]);
  console.log('Data', data);
  let unqId;
  let value;
  if (data==null){
    unqId=null;
    value=null;
  }
  else {
    unqId=data.slice(0,6).toString();
    value=data.slice(6,8).toString();
    if(value=="on"){
      value=1;
    }
    else if(value=="of"){
      value=0
    }
    database.ref('Users/'+ userID + '/GardenZones/My Garden/Sensors/'+unqId).update({
      data: value,
      icon: 'opacity',
      id: unqId,
      title: 'Moisture Sensor 1',
      type: 'moisture',
});
    database.ref('Users/'+ userID +'/History/'+ unqId+"/"+date).set({
      data:value
    })
  }
  console.log('Unique id:',unqId);
  console.log('Value:',value);
});


///////////////////////////////////////


