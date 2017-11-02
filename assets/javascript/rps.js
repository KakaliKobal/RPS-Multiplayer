var config = {
    apiKey: "AIzaSyBC5G9E8Gqidb41VIT_1wz_wEq0mGNy1s4",
    authDomain: "rps-multiplayer-5fec0.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-5fec0.firebaseio.com",
    projectId: "rps-multiplayer-5fec0",
    storageBucket: "rps-multiplayer-5fec0.appspot.com",
    messagingSenderId: "413398297945"
};
firebase.initializeApp(config);

var chatLog;
var database = firebase.database();


if (localStorage.name) {
	whoami = localStorage.name;
	database.ref("users/" + whoami).once('value', function(snapshot) {
		if (snapshot.val() == null) {
			localStorage.removeItem(name);
		} else {
			$('#set-name').hide();
			$('#type-chat').removeAttr("disabled");
		}
	})
} 


$('#add-name').on("click", function(event) {
	event.preventDefault();
	var name = $("#fill-name").val().trim();
  	whoami = name.charAt(0).toUpperCase() + name.slice(1);

  	database.ref('users/' + whoami).set({
  		wins: 0,
  		choice: ""
  	});
  	$('#set-name').hide();
  	localStorage.name = whoami;

	$('#type-chat').removeAttr("disabled");
});

// Firebase watcher + initial loader HINT: .on("value")
database.ref().on("value", function(snapshot) {
	if (snapshot.val().chatlog == null) {
		chatLog = [];
	} else {
		chatLog = snapshot.val().chatlog;
	}
	// Log everything that's coming out of snapshot

	
	console.log(snapshot.val());

	updateChatLog(chatLog);

	

// Handle the errors
}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
});



function updateChatLog(chatlog) {
	if (!chatlog) return
	box = $('#chat-area')
	box.empty();
	chatText = "";
	for (i = 0; i < chatlog.length; i++) {
		chatText += chatlog[i] + "\n"
	}
	box.val(chatText);
	bottom = box.prop('scrollHeight') - box.height();
	box.scrollTop(bottom);

}

function sendMessage() {
	var message = $('#type-chat').val().trim();
	if (message == '') return

	$('#type-chat').val("");

	message = whoami + ": " + message;
	
	chatLog.push(message);

	database.ref('chatlog').set(chatLog);
}


$( document ).ready(function() {
	$('#add-chat').on("click", sendMessage);
});