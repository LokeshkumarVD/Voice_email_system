// Speech recognition setup
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;

const actionFeedback = document.getElementById("actionFeedback");
const greeting = document.getElementById("greeting");

// Commands and corresponding actions
const commands = {
  "compose": () => {
    handleCommand("compose", "Opening Compose...");
    setTimeout(() => window.location.href = "compose.html", 2000);
  },
  "inbox": () => {
    handleCommand("inbox", "Opening Inbox...");
    setTimeout(() => window.location.href = "inbox.html", 2000);
  },
  "sent": () => {
    handleCommand("sent", "Opening Sent Mail...");
    setTimeout(() => window.location.href = "sent.html", 2000);
  },
  "starred": () => {
    handleCommand("starred", "Opening Starred...");
    setTimeout(() => window.location.href = "starred.html", 2000);
  },
  "trash": () => {
    handleCommand("trash", "Opening Trash...");
    setTimeout(() => window.location.href = "trash.html", 2000);
  },
  "archive": () => {
    handleCommand("archive", "Opening Archive...");
    setTimeout(() => window.location.href = "archive.html", 2000);
  },
  "logout": () => {
    speak("Logging out. Goodbye!");
    actionFeedback.textContent = "Logging out...";
    setTimeout(() => window.location.href = "index.html", 2500);
  }
};

// Voice greeting on page load
window.onload = () => {
  const user = localStorage.getItem("username") || "User";
  greeting.textContent = `Welcome, ${user}!`;
  speak(`Welcome ${user}. Please say a command like Compose, Inbox, Sent, Starred, Trash, Archive, or Logout.`);
  recognition.start();
};

// Text-to-speech function
function speak(message) {
  const synth = window.speechSynthesis;
  synth.cancel();  // Prevent overlapping speech
  const utter = new SpeechSynthesisUtterance(message);
  synth.speak(utter);
}

// Handle voice recognition result
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
  recognition.start(); // Restart after end
};

// Utility functions
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
