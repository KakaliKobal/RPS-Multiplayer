var config = {
    apiKey: "AIzaSyBC5G9E8Gqidb41VIT_1wz_wEq0mGNy1s4",
    authDomain: "rps-multiplayer-5fec0.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-5fec0.firebaseio.com"
    projectId: "rps-multiplayer-5fec0",
    storageBucket: "rps-multiplayer-5fec0.appspot.com",
    messagingSenderId: "413398297945"
};
firebase.initializeApp(config);

var database = firebase.database();


var game = {
	players : [
	],
	chat: []
}

game['players'][0]['name'] = "Player 1"

$("#add-name").on("click", function(event) {
	event.preventDefault();
	var name = $("#fill-name").val().trim();
  	name = name.charAt(0).toUpperCase() + name.slice(1);
  	
})


