var socket = io();
console.log('socket: ', socket);
var createButton = document.querySelector('#createButton');
var roomInput = document.querySelector('#roomInput');
createButton.addEventListener('click', function(){
  console.log('Typed Room name: ', roomInput.value);
  socket.emit('create_or_join', roomInput.value);

});
socket.on('created', function(room ,id){
  console.log('created: ', room, id);
  var xmlhttp = new XMLHttpRequest();
  var url = "http://localhost:3000/rooms";
  xmlhttp.onreadystatechange = function(){
    if(this.readyState === 4 && this.status === 200){
      var myArr = JSON.parse(this.responseText);
      console.log('myArr: ', myArr);
      showRooms(myArr);
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
});
socket.on('joined', function(room, id){
  console.log('joined: ', room, id);
});




function showRooms(arr){
  var out = "";
  var i;
  for(i = 0 ; i < arr.length ; i++){
    out += '<a href="' + '">' + 'ROOM' + arr[i] + '</a><br>';
  }
  document.getElementById("rooms").innerHTML = out;
}

