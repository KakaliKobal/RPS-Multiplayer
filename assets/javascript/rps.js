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
firebase.database.enableLogging(true, true)
var whoami;

if (localStorage.name) {
	whoami = localStorage.name;
	database.ref("users/" + whoami).once('value', function(snapshot) {
		if (snapshot.val() == null) {
			localStorage.removeItem(name);
			$('#set-name').show();
		} else {
			$('#type-chat').removeAttr("disabled");
		}
	})
} else {
	$('#set-name').show();
}


$('#add-name').on("click", function(event) {
	event.preventDefault();
	var name = $("#fill-name").val().trim();
  	whoami = name.charAt(0).toUpperCase() + name.slice(1);

  	database.ref('users/' + whoami).set({
  		wins: 0,
  		choice: "",
  		losses: 0
  	});
  	$('#set-name').hide();
  	localStorage.name = whoami;

	$('#type-chat').removeAttr("disabled");
});

$('.choice').on("click", function() {
	choice = $(this).text();
	$('.choice').off('click');
	database.ref('users/' + whoami).update({choice: choice});

});

// Firebase watcher + initial loader HINT: .on("value")
database.ref().on("value", function(snapshot) {
	if (snapshot.val().chatlog) {
		chatLog = snapshot.val().chatlog;
	} else {
		chatLog = [];
	}
	// Log everything that's coming out of snapshot

	if (snapshot.val().users) {
		updateUsersName(snapshot.val().users);
		updateChatLog(chatLog);
	}

	if (snapshot.val().users && moreThanOne(snapshot.val().users)) {
		$('#choices').show();
		$('#set-name').hide();
		$('#type-chat').attr("disabled", "disabled");
		
		if (snapshot.val().users[whoami].choice !== "")
			checkForWin(snapshot.val().users);
	}
	


	

// Handle the errors
}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
});

function moreThanOne(users) {
	if (Object.keys(users).length > 1) {return true} else {return false}
}

function updateUsersName(users) {
	names = Object.keys(users);
	names.forEach(function(item) {
		if (item == whoami) {
			$('#player-1-name').text(item);
		} else {
			$('#player-2-name').text(item);
		}
	})

}

function checkForWin(users) {
	console.log("Checking for win!");
	opponentChoice = getOpponentChoice(users);
	myChoice = users[whoami]['choice'];
	if (opponentChoice === "") return
	wins = users[whoami]['wins'];
	losses = users[whoami]['losses'];

	if ((myChoice === "Rock") || (myChoice === "Paper") || (myChoice === "Scissors")) {

        if ((myChoice === "Rock") && (opponentChoice === "Scissors")) {
          wins++;
        } else if ((myChoice === "Rock") && (opponentChoice === "Paper")) {
          losses++;
        } else if ((myChoice === "Scissors") && (opponentChoice === "Rock")) {
          losses++;
        } else if ((myChoice === "Scissors") && (opponentChoice === "Paper")) {
          wins++;
        } else if ((myChoice === "Paper") && (opponentChoice === "Rock")) {
          wins++;
        } else if ((myChoice === "Paper") && (opponentChoice === "Scissors")) {
          losses++;
        }
        database.ref('users/' + whoami).update({
	  		wins: wins,
	  		choice: "",
	  		losses: losses
	  	});
    }

}

function getOpponentChoice(users) {
	opponentChoice = "";
	names = Object.keys(users);
	names.forEach(function(item) {
		if (item !== whoami) {
			opponentChoice = users[item]['choice'];
		}
	})
	return opponentChoice;
}

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