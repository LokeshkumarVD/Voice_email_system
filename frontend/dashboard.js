// Speech recognition
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;

const actionFeedback = document.getElementById("actionFeedback");
const greeting = document.getElementById("greeting");

const commands = {
  "compose": () => handleCommand("compose", "Opening Compose..."),
  "inbox": () => handleCommand("inbox", "Opening Inbox..."),
  "sent": () => handleCommand("sent", "Opening Sent Mail..."),
  "starred": () => handleCommand("starred", "Opening Starred..."),
  "trash": () => handleCommand("trash", "Opening Trash..."),
  "archive": () => handleCommand("archive", "Opening Archive..."),
  "logout": () => {
    speak("Logging out. Goodbye!");
    actionFeedback.textContent = "Logging out...";
    setTimeout(() => window.location.href = "index.html", 2500);
  }
};

// Voice greeting
window.onload = () => {
  const user = localStorage.getItem("username") || "User";
  greeting.textContent = `Welcome, ${user}!`;
  speak(`Welcome ${user}. Please say a command like compose, inbox, sent, or logout.`);
  recognition.start();
};

// Text-to-Speech
function speak(message) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(message);
  synth.speak(utter);
}

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
  actionFeedback.textContent = `Heard: "${transcript}"`;

  for (let cmd in commands) {
    if (transcript.includes(cmd)) {
      commands[cmd]();
      break;
    }
  }
};

recognition.onerror = (event) => {
  actionFeedback.textContent = `Error: ${event.error}`;
};

recognition.onend = () => {
  recognition.start();
};

function handleCommand(id, message) {
  highlightToolbar(id);
  speak(message);
  actionFeedback.textContent = message;
}

function highlightToolbar(id) {
  document.querySelectorAll(".toolbar li").forEach(li => li.style.backgroundColor = '');
  const item = document.getElementById(id);
  if (item) item.style.backgroundColor = "#d2e3fc";
}
