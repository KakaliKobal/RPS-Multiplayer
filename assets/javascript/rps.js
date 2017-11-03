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
firebase.database.enableLogging(false);
var whoami;
var timeout;

if (localStorage.name) {
	whoami = localStorage.name;
	database.ref("users/" + whoami).once('value', function(snapshot) {
		if (snapshot.val() == null) {
			localStorage.removeItem(name);
			$('#set-name').show();
		} else {
			updateOnlineInfo();
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
  	updateOnlineInfo();

	$('#type-chat').removeAttr("disabled");
});

$('.choice').on("click", clickChoice);



// Firebase watcher + initial loader HINT: .on("value")
database.ref().on("value", function(snapshot) {
	if (snapshot.val().chatlog) {
		chatLog = snapshot.val().chatlog;
	} else {
		chatLog = [];
	}

	users = snapshot.val().users;
	if (users) {
		opponent = getOpponent(users);
		now = new Date();
		if (opponent && !(users[opponent]['connections'])) {
			console.log("Detected opponent leaving");
			// if (!timeout) 
			timeout = setTimeout(clearUser, 3000, opponent);
		} 
		updateUsersName(users);
		updateChatLog(chatLog);
	}
	if (getOpponentChoice(users) !== "") {
		$('#player-2-has-choosen').text("I have decided, waiting for you!");
	}
	if (users[whoami]['choice'] !== "") {
		$('#player-1-has-choosen').text("You chose: " + users[whoami]['choice'])
	}

	if (users && moreThanOne(users)) {
		$('#choices').show();
		$('#set-name').hide();
		
		$('#type-chat').removeAttr("disabled");
		if (users[whoami].choice !== "")
			checkForWin(users);
	} else {
		$('#type-chat').attr("disabled", "disabled");
	}
	


	

// Handle the errors
}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
});

function clearUser(opponent) {
	console.log('ClearUser');
	// clearTimeout(timeout);
	database.ref("users").once('value', function(snapshot) {
		if (!(snapshot.val()[opponent])) return
		if (!(snapshot.val()[opponent]["connections"])) {
			console.log("Removing opponent!");
			database.ref('users/' + whoami + "/choice").set("");
			database.ref('users/' + opponent).remove();
			database.ref('chatlog').set("");
			$('#player-2-name').text("Waiting for Player 2");
			$('#player-1-has-choose').text('Please pick:');
			$('.winner-loser').text("Opponent has left, wait for new player")
		}
	});
}

function clickChoice() {
	choice = $(this).text();
	$('.choice').off('click');
	database.ref('users/' + whoami).update({choice: choice});
	$('#choices').hide();
}

function moreThanOne(users) {
	if (Object.keys(users).length > 1) {return true} else {return false}
}

function updateUsersName(users) {
	names = Object.keys(users);
	names.forEach(function(name) {
		if (name == whoami) {
			$('#player-1-name').text(name);
			$('#player-1-win').text("Wins: " + users[name]['wins']);
			$('#player-1-loss').text("Losses: " + users[name]['losses']);
		} else {
			$('#player-2-name').text(name);
			$('#player-2-win').text("Wins: " + users[name]['wins']);
			$('#player-2-loss').text("Losses: " + users[name]['losses']);


		}
	})

}

function checkForWin(users) {
	win = false;
	tie = false;
	opponentChoice = getOpponentChoice(users);
	myChoice = users[whoami]['choice'];
	if (opponentChoice === "") {
		return
	}
	wins = users[whoami]['wins'];
	losses = users[whoami]['losses'];

	if ((myChoice === "Rock") || (myChoice === "Paper") || (myChoice === "Scissors")) {

        if ((myChoice === "Rock") && (opponentChoice === "Scissors")) {
          win = true;
        } else if ((myChoice === "Rock") && (opponentChoice === "Paper")) {
          win = false;
        } else if ((myChoice === "Scissors") && (opponentChoice === "Rock")) {
          win = false;
        } else if ((myChoice === "Scissors") && (opponentChoice === "Paper")) {
          win = true;
        } else if ((myChoice === "Paper") && (opponentChoice === "Rock")) {
          win = true;
        } else if ((myChoice === "Paper") && (opponentChoice === "Scissors")) {
          win = false;
        } else if (myChoice === opponentChoice) {
        	tie = true;
        }
        if (win) {
        	wins++;
        	$('.winner-loser').html("<p> You Won that game <br />Your opponent chose " + opponentChoice + "!</p>");
        } else if (tie) {
        	console.log("Game tied!");
        	$('.winner-loser').html("<p> Game Tied!</p>");
        } else {
        	losses++;
        	$('.winner-loser').html("<p> You Lost that game <br />Your opponent chose " + opponentChoice + "!</p>");
        }

        database.ref('users/' + whoami).update({
	  		wins: wins,
	  		choice: "",
	  		losses: losses
	  	});
	  	$('#player-2-has-choosen').text("Choosing.....");
	  	$('#player-1-has-choosen').text("Please pick:");
	  	$('#choices').show();
	  	$('.choice').on("click", clickChoice);
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

function getOpponent(users) {
	names = Object.keys(users);
	opponent = "";
	names.forEach(function(item) {
		if (item !== whoami) opponent = item;
	});
	return opponent;
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

function sendMessage(event) {
	event.preventDefault();
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

function updateOnlineInfo() {
	//  Taken from firebase docs https://firebase.google.com/docs/database/web/offline-capabilities
	// since I can connect from multiple devices or browser tabs, we store each connection instance separately
	// any time that connectionsRef's value is null (i.e. has no children) I am offline
	var myConnectionsRef = firebase.database().ref('users/' + whoami + '/connections');

	// stores the timestamp of my last disconnect (the last time I was seen online)
	var lastOnlineRef = firebase.database().ref('users/' + whoami + '/lastOnline');

	var connectedRef = firebase.database().ref('.info/connected');
	connectedRef.on('value', function(snap) {
	  if (snap.val() === true) {
	    // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
	    var con = myConnectionsRef.push();

	    // When I disconnect, remove this device
	    con.onDisconnect().remove();

	    // Add this device to my connections list
	    // this value could contain info about the device or a timestamp too
	    con.set(true);
	  }
	});
}

