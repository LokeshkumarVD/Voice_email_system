window.onload = () => {
    const fields = [
      { id: 'firstName', prompt: 'Please say your first name' },
      { id: 'lastName', prompt: 'Please say your last name' },
      { id: 'username', prompt: 'Please say your desired email username' },
      { id: 'password', prompt: 'Please say your password' },
      { id: 'confirmPassword', prompt: 'Please confirm your password' },
    ];
  
    const synth = window.speechSynthesis;
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
  
    let currentField = 0;
    let fieldValues = {};
  
    const speak = (text, callback) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = callback;
      synth.speak(utterance);
    };
  
    const updateSpeechResult = (text) => {
      const resultDiv = document.getElementById('speechResult');
      resultDiv.innerText = `You said: ${text}`;
    };
  
    const spokenToSymbol = {
      'at': '@',
      'dot': '.',
      'underscore': '_',
      'dash': '-',
      'hyphen': '-',
      'plus': '+',
      'hash': '#',
      'star': '*',
      'asterisk': '*',
      'dollar': '$',
      'percent': '%',
      'and': '&',
      'ampersand': '&',
      'exclamation': '!',
      'exclamation mark': '!',
      'question mark': '?',
      'comma': ',',
      'colon': ':',
      'semicolon': ';',
      'slash': '/',
      'backslash': '\\',
      'equal': '=',
      'equal sign': '=',
      'quote': '"',
      'single quote': "'",
      'space': ' '
    };
  
    const handleCapitalization = (words) => {
      const result = [];
      let capitalizeNext = false;
  
      for (let word of words) {
        if (word === "capital") {
          capitalizeNext = true;
        } else {
          if (capitalizeNext && word.length === 1 && /^[a-z]$/.test(word)) {
            result.push(word.toUpperCase());
          } else {
            result.push(spokenToSymbol[word] || word);
          }
          capitalizeNext = false;
        }
      }
      return result.join("");
    };
  
    const listen = (callback) => {
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const words = transcript.trim().split(" ");
        const processed = handleCapitalization(words);
        callback(processed);
      };
    };
  
    const validateUsername = (username) => /^[a-zA-Z0-9._]+$/.test(username);
    const validatePassword = (password) =>
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#^()_+])[A-Za-z\d@$!%*?&#^()_+]{8,}$/.test(password);
  
    const fillField = () => {
      if (currentField >= fields.length) {
        confirmInputs();
        return;
      }
  
      const field = fields[currentField];
      speak(field.prompt, () => {
        listen((response) => {
          updateSpeechResult(response);
  
          if (field.id === 'username' && !validateUsername(response)) {
            speak("Invalid username. Use only letters, numbers, dots or underscores.", fillField);
            return;
          }
  
          if (field.id === 'password' && !validatePassword(response)) {
            speak("Weak password. Use at least 8 characters with letters, numbers, and symbols.", fillField);
            return;
          }
  
          const input = document.getElementById(field.id);
          input.value = response;
          fieldValues[field.id] = response;
  
          currentField++;
          fillField();
        });
      });
    };
  
    const confirmInputs = () => {
      const summary = `You said: Your name is ${fieldValues.firstName} ${fieldValues.lastName}. 
        Your username is ${fieldValues.username}. Your password has been saved. 
        Do you want to continue? Please say yes or no.`;
  
      speak(summary, () => {
        listen((confirmation) => {
          if (confirmation.includes("yes")) {
            speak("Creating your account and redirecting to dashboard.", () => {
              performSignup();
            });
          } else {
            speak("Okay, let's start again.", () => {
              currentField = 0;
              fieldValues = {};
              fillField();
            });
          }
        });
      });
    };
  
    const performSignup = () => {
      const password = fieldValues.password || '';
      const confirmPassword = fieldValues.confirmPassword || '';
  
      if (password !== confirmPassword) {
        speak("Passwords do not match. Please repeat your password.", () => {
          currentField = 3;
          fillField();
        });
        return;
      }
  
      const email = `${fieldValues.username}@mailbox.com`;
  
      speak(`Thank you ${fieldValues.firstName}. Your account with email ${email} is being created.`, () => {
        // ✅ Redirect to dashboard
        window.location.href = "dashboard.html";
      });
    };
  
    // Start on page load
    fillField();
  
    // Prevent default form submission
    document.getElementById('signupForm').addEventListener('submit', function (e) {
      e.preventDefault();
    });
  };
  