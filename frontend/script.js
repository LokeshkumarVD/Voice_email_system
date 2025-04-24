// Function to speak text and execute a callback after speaking
function speak(text, callback = null) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);

    // Execute callback after speech ends, if provided
    if (callback) {
        speech.onend = callback;
    }
}

// Function to start the voice prompt when clicking anywhere
function startVoicePrompt() {
    speak("Welcome to The Talking Mailbox. Let Your Voice Be Heard, Let Your Mail Be Seen.", function() {
        setTimeout(() => {
            askForChoice();
        }, 100); // Wait for 1 second before asking for a choice
    });
}

// Function to ask the user for Sign Up or Sign In
function askForChoice() {
    speak("Please say 'Sign Up' if you are a new user, or 'Sign In' if you have an existing account.", function() {
        waitForChoice();
    });
}

// Function to listen for user input (Sign Up or Sign In) with a 5-second timeout
function waitForChoice() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.maxAlternatives = 3;


    let timeout = setTimeout(() => {
        recognition.stop();
        speak("I didn't hear you. Please say 'Sign Up' or 'Sign In'.", function() {
            waitForChoice(); // Restart listening if no input is received
        });
    }, 3000); // Wait for 3 seconds before retrying

    recognition.onresult = function(event) {
        clearTimeout(timeout);
        let userChoice = event.results[0][0].transcript.toLowerCase();

        if (userChoice.includes("sign up")) {
            verifyChoice("Sign Up");
        } else if (userChoice.includes("sign in")) {
            verifyChoice("Sign In");
        } else {
            speak("I didn't understand. Please say 'Sign Up' or 'Sign In'.", function() {
                waitForChoice();
            });
        }
    };

    recognition.onerror = function() {
        clearTimeout(timeout);
        speak("There was an error understanding you. Please try again.", function() {
            waitForChoice();
        });
    };
}

// Function to verify the user's choice
function verifyChoice(choice) {
    speak(`You have chosen to ${choice}. Is this correct? Please say 'Yes' or 'No'.`, function() {
        let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.start();
        recognition.maxAlternatives = 3;


        recognition.onresult = function(event) {
            let confirmation = event.results[0][0].transcript.toLowerCase();
            if (confirmation.includes("yes")) {
                speak(`Redirecting to ${choice} page.`, function() {
                    window.location.href = choice === "Sign Up" ? 'sign-up.html' : 'login.html';
                });
            } else if (confirmation.includes("no")) {
                speak("Please choose again. Say 'Sign Up' or 'Sign In'.", function() {
                    waitForChoice();
                });
            } else {
                speak("I didn't understand. Please say 'Yes' or 'No'.", function() {
                    verifyChoice(choice);
                });
            }
        };

        recognition.onerror = function() {
            speak("I couldn't hear you. Please try again.", function() {
                verifyChoice(choice);
            });
        };
    });
}
