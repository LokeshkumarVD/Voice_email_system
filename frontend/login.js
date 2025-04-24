window.onload = () => {
    const synth = window.speechSynthesis;
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
  
    const fieldValues = {
      email: "",
      password: ""
    };
  
    const speak = (text, callback) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = callback;
      synth.speak(utterance);
    };
  
    const updateSpeechResult = (text) => {
      document.getElementById("speechResult").innerText = `You said: ${text}`;
    };
  
    const listen = (callback) => {
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        updateSpeechResult(transcript);
        callback(transcript);
      };
    };
  
    const processSpeechInput = (text) => {
      const replacements = {
        " at ": "@",
        " dot ": ".",
        " underscore ": "_",
        " dash ": "-",
        " plus ": "+",
        " hash ": "#",
        " dollar ": "$",
        " percent ": "%",
        " star ": "*",
        " asterisk ": "*",
        " exclamation ": "!",
        " exclamation mark ": "!",
        " question ": "?",
        " question mark ": "?",
        " space ": " ",
        " comma ": ",",
        " colon ": ":",
        " semicolon ": ";",
        " slash ": "/",
        " backslash ": "\\",
        " equal ": "=",
        " equals ": "=",
        " quote ": "\"",
        " apostrophe ": "'",
        " bracket open ": "[",
        " bracket close ": "]",
        " brace open ": "{",
        " brace close ": "}",
        " parenthesis open ": "(",
        " parenthesis close ": ")",
        " greater than ": ">",
        " less than ": "<",
        " pipe ": "|"
      };
  
      let processed = " " + text + " ";
      for (const [word, symbol] of Object.entries(replacements)) {
        const regex = new RegExp(word, 'gi');
        processed = processed.replace(regex, ` ${symbol} `);
      }
  
      return processed.trim().replace(/\s+/g, '');
    };
  
    const fillEmail = () => {
      speak("Please say your email address", () => {
        listen((response) => {
          if (response.includes("forgot password")) {
            handleForgotPassword();
            return;
          }
  
          const processedEmail = processSpeechInput(response);
          fieldValues.email = processedEmail;
          document.getElementById("email").value = processedEmail;
          fillPassword();
        });
      });
    };
  
    const fillPassword = () => {
      speak("Now please say your password", () => {
        listen((response) => {
          const processedPassword = processSpeechInput(response);
          fieldValues.password = processedPassword;
          document.getElementById("password").value = "*".repeat(processedPassword.length);
          confirmLogin();
        });
      });
    };
  
    const confirmLogin = () => {
      speak(`You said your email is ${fieldValues.email}. Do you want to continue? Say yes or no.`, () => {
        listen((answer) => {
          if (answer.includes("yes")) {
            speak("Logging you in now", () => {
              performLogin();
            });
          } else {
            speak("Okay, let's try again", () => {
              fieldValues.email = "";
              fieldValues.password = "";
              fillEmail();
            });
          }
        });
      });
    };
  
    const performLogin = () => {
      // Future: Send email and password to Django backend for verification
      window.location.href = "dashboard.html";
    };
  
    const handleForgotPassword = () => {
      speak("You selected forgot password. Please say your registered email.", () => {
        listen((emailInput) => {
          const processedEmail = processSpeechInput(emailInput);
          fieldValues.email = processedEmail;
          speak(`You said ${processedEmail}. Say yes to continue or no to retry.`, () => {
            listen((confirm) => {
              if (confirm.includes("yes")) {
                resetPassword();
              } else {
                handleForgotPassword();
              }
            });
          });
        });
      });
    };
  
    const resetPassword = () => {
      speak("Please say your new password.", () => {
        listen((newPassword) => {
          const processedNew = processSpeechInput(newPassword);
          speak("Please confirm your new password.", () => {
            listen((confirmPassword) => {
              const processedConfirm = processSpeechInput(confirmPassword);
              if (processedNew === processedConfirm) {
                fieldValues.password = processedNew;
                speak("Password reset successful. Redirecting to login page.", () => {
                  // Future: Send updated password to backend
                  window.location.href = "dashboard.html";
                });
              } else {
                speak("Passwords did not match. Let's try again.", () => {
                  resetPassword();
                });
              }
            });
          });
        });
      });
    };
  
    document.getElementById("loginForm").addEventListener("submit", (e) => e.preventDefault());
  
    // Start login on load
    fillEmail();
  };
  