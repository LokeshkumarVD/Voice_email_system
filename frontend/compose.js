// compose.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const toInput = document.getElementById('to');
    const subjectInput = document.getElementById('subject');
    const bodyInput = document.getElementById('body');
    const sendBtn = document.getElementById('sendBtn');
    const discardBtn = document.getElementById('discardBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceFeedback = document.getElementById('voiceFeedback');
    
    // Speech Recognition and Synthesis
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;
    
    if (!SpeechRecognition) {
        voiceFeedback.textContent = "Speech recognition not supported in this browser.";
        return;
    }
    
    const mainRecognition = new SpeechRecognition();
    mainRecognition.continuous = true;
    mainRecognition.interimResults = false;
    mainRecognition.lang = 'en-US';
    
    // System state
    let currentField = null;
    let isListening = false;
    let currentRecognition = null;

    // Initialize voice system - AUTOMATICALLY SPEAK HELP ON LOAD
    function initVoiceSystem() {
        speakHelp(() => {
            startMainListening();
        });
    }

    // Text-to-speech function with callback
    function speak(text, callback = null) {
        if (synth.speaking) {
            synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        voiceFeedback.textContent = text;
        
        utterance.onend = function() {
            if (callback) callback();
        };
        
        synth.speak(utterance);
    }

    // Email validation function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Start main continuous listening
    function startMainListening() {
        currentRecognition = mainRecognition;
        try {
            mainRecognition.start();
            isListening = true;
            voiceStatus.textContent = "Voice: Listening";
            voiceStatus.classList.add('listening');
            speak("I'm listening for your commands");
        } catch (e) {
            console.error("Recognition start error:", e);
            setTimeout(startMainListening, 1000);
        }
    }

    // Stop current recognition
    function stopCurrentListening() {
        if (currentRecognition) {
            currentRecognition.stop();
            isListening = false;
            voiceStatus.textContent = "Voice: Processing";
            voiceStatus.classList.remove('listening');
        }
    }

    // Process voice commands
    function processCommand(command) {
        command = command.toLowerCase().trim();
        console.log("Command received:", command);
        
        // Handle field input if we're expecting it
        if (currentField) {
            handleFieldInput(command);
            return;
        }
        
        // Handle main commands
        if (command.match(/^(add recipient|to|recipient|send to)/i)) {
            promptForInput(toInput, "Please say the recipient's email address");
        }
        else if (command.match(/^(subject|title|email subject)/i)) {
            promptForInput(subjectInput, "Please say the subject of your email");
        }
        else if (command.match(/^(message|body|email body|content)/i)) {
            promptForInput(bodyInput, "Please dictate your message");
        }
        else if (command.match(/^(send|send email|dispatch|mail it)/i)) {
            confirmAndSendEmail();
        }
        else if (command.match(/^(discard|clear|delete email)/i)) {
            discardEmail();
        }
        else if (command.match(/^(help|commands|what can i say)/i)) {
            speakHelp();
        }
        else if (command.match(/^(stop listening|stop voice|turn off voice)/i)) {
            stopCurrentListening();
            speak("Voice input stopped. Say 'Start listening' to resume.");
        }
        else if (command.match(/^(start listening|resume voice)/i)) {
            startMainListening();
        }
        else {
            speak("Sorry, I didn't understand that. Say 'Help' for available commands.");
        }
    }

    // Unified input handling for all fields
    function promptForInput(field, promptText) {
        currentField = field;
        
        // Stop main listening to avoid interference
        stopCurrentListening();
        
        // Speak prompt and start dedicated input recognition
        speak(promptText, () => {
            const inputRecognition = new SpeechRecognition();
            inputRecognition.lang = 'en-US';
            currentRecognition = inputRecognition;
            
            inputRecognition.onresult = (event) => {
                const userInput = event.results[0][0].transcript;
                handleFieldInput(userInput);
            };
            
            inputRecognition.onerror = (event) => {
                console.error("Input recognition error:", event.error);
                currentField = null;
                startMainListening();
            };
            
            inputRecognition.start();
        });
    }

    function handleFieldInput(command) {
        if (command === 'cancel' || command === 'nevermind') {
            speak("Input cancelled");
        } else {
            // Process input based on current field
            let processedInput = command;
            
            if (currentField === toInput) {
                // Convert spoken email format to proper format
                processedInput = command.replace(/ at /g, '@')
                                       .replace(/ dot /g, '.')
                                       .replace(/\s*gmail\s*/g, 'gmail.com')
                                       .replace(/\s*outlook\s*/g, 'outlook.com')
                                       .replace(/\s*yahoo\s*/g, 'yahoo.com')
                                       .replace(/\s*hotmail\s*/g, 'hotmail.com');
                
                // Validate email format
                if (!validateEmail(processedInput)) {
                    speak("That doesn't appear to be a valid email address. Please try again.");
                    return;
                }
            }
            
            currentField.value = processedInput;
            speak(`Added to ${currentField.previousElementSibling.textContent}`);
        }
        
        currentField = null;
        startMainListening();
    }

    async function confirmAndSendEmail() {
        if (!toInput.value) {
            speak("Please add at least one recipient before sending");
            return;
        }
        
        // Validate email again before sending
        if (!validateEmail(toInput.value)) {
            speak("The recipient email address is not valid. Please correct it before sending.");
            return;
        }
        
        const confirmed = await getConfirmation(
            `Confirm sending email to ${toInput.value} with subject "${subjectInput.value}"? ` +
            `Message starts with: "${bodyInput.value.substring(0, 50)}". ` +
            `Say 'Confirm send' to proceed or 'Cancel' to abort`
        );
        
        if (confirmed) {
            sendEmail();
        } else {
            speak("Email sending cancelled");
        }
    }

    function getConfirmation(message) {
        return new Promise((resolve) => {
            // Stop current listening
            stopCurrentListening();
            
            // Speak confirmation and start dedicated recognition
            speak(message, () => {
                const confirmRecognition = new SpeechRecognition();
                confirmRecognition.lang = 'en-US';
                currentRecognition = confirmRecognition;
                
                confirmRecognition.onresult = (event) => {
                    const response = event.results[0][0].transcript.toLowerCase();
                    resolve(response.includes('confirm') || response.includes('yes') || response.includes('send'));
                    startMainListening();
                };
                
                confirmRecognition.onerror = (event) => {
                    console.error("Confirmation error:", event.error);
                    resolve(false);
                    startMainListening();
                };
                
                confirmRecognition.start();
            });
        });
    }

    function sendEmail() {
        speak("Sending email to " + toInput.value + "...");
        
        // In a real implementation, this would call your backend
        const emailData = {
            to: toInput.value,
            subject: subjectInput.value,
            body: bodyInput.value,
            timestamp: new Date().toISOString()
        };
        
        console.log("Email data being sent:", emailData);
        
        // Simulate API call
        setTimeout(() => {
            speak("Email sent successfully to " + toInput.value);
            resetForm();
        }, 2000);
        
        // In a real app, you would:
        // fetch('/api/send-email', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(emailData)
        // })
        // .then(response => {
        //     if (response.ok) {
        //         speak("Email sent successfully to " + toInput.value);
        //         resetForm();
        //     } else {
        //         speak("Failed to send email. Please try again.");
        //     }
        // })
        // .catch(error => {
        //     console.error("Error sending email:", error);
        //     speak("An error occurred while sending the email.");
        // });
    }

    async function discardEmail() {
        if (!toInput.value && !subjectInput.value && !bodyInput.value) {
            speak("There's nothing to discard");
            return;
        }
        
        const confirmed = await getConfirmation(
            "Are you sure you want to discard this email? Say 'Confirm' to proceed or 'Cancel' to abort"
        );
        
        if (confirmed) {
            resetForm();
            speak("Email discarded");
        } else {
            speak("Discard cancelled");
        }
    }

    // AUTOMATICALLY READ ON PAGE LOAD
    function speakHelp(callback = null) {
        speak(
            "Welcome to Voice Email Compose. Available commands: " +
            "'Add recipient' to add an email address. " +
            "'Subject' to set email subject. " +
            "'Message' to compose email body. " +
            "'Send email' when ready to send. " +
            "'Discard email' to clear the email. " +
            "'Stop listening' to pause voice input. " +
            "'Start listening' to resume voice input. " +
            "'Help' to repeat these commands.",
            callback
        );
    }

    function resetForm() {
        toInput.value = '';
        subjectInput.value = '';
        bodyInput.value = '';
        currentField = null;
    }

    // Event listeners
    mainRecognition.onresult = function(event) {
        if (!currentField) {  // Only process if not expecting field input
            processCommand(event.results[0][0].transcript);
        }
    };
    
    mainRecognition.onerror = function(event) {
        console.error('Recognition error:', event.error);
        voiceFeedback.textContent = `Error: ${event.error}`;
        if (event.error === 'no-speech') {
            startMainListening();
        }
    };
    
    mainRecognition.onend = function() {
        if (isListening && currentRecognition === mainRecognition) {
            setTimeout(startMainListening, 500);
        }
    };
    
    // Button event listeners (for accessibility)
    sendBtn.addEventListener('click', function() {
        speak("Please use voice commands to send emails. Say 'Send email' when ready.");
    });
    
    discardBtn.addEventListener('click', function() {
        speak("Please use voice commands to discard emails. Say 'Discard email' to clear.");
    });
    
    // Initialize the system (will auto-speak help)
    initVoiceSystem();
});