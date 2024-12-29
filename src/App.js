import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { io } from "socket.io-client";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import InsightsIcon from "@mui/icons-material/Insights";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";

const socket = io("http://localhost:5000");

const DashboardTab = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "400px",
  overflow: "auto",
}));

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dashboardTab, setDashboardTab] = useState(0);
  const [analytics, setAnalytics] = useState([]);
  const [miniGame, setMiniGame] = useState(false);
  const [gameWord, setGameWord] = useState("");
  const [gameHint, setGameHint] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const messageEndRef = useRef(null);

  const { transcript, resetTranscript } = useSpeechRecognition();

  const synth = window.speechSynthesis; // Speech Synthesis API

  const speakMessage = (text) => {
    if (!synth) {
      console.error("SpeechSynthesis is not supported in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1;
    utterance.rate = 1;
    synth.speak(utterance);
  };

  const analyzeSentiment = (text) => {
    const positiveWords = ["great", "good", "love", "amazing", "excellent"];
    const negativeWords = ["bad", "sad", "angry", "hate", "terrible"];
    let score = 0;

    text.split(" ").forEach((word) => {
      if (positiveWords.includes(word.toLowerCase())) score++;
      if (negativeWords.includes(word.toLowerCase())) score--;
    });

    return score;
  };

  const updateAnalytics = (msg) => {
    const sentimentScore = analyzeSentiment(msg);
    const updatedAnalytics = [...analytics];
    const timestamp = new Date().toLocaleTimeString();
    updatedAnalytics.push({ timestamp, sentiment: sentimentScore, message: msg });
    setAnalytics(updatedAnalytics);
  };

  const words = [
    { word: "cat", hint: "It's a common household pet" },
    { word: "river", hint: "A flowing body of water" },
    { word: "sun", hint: "Shines bright during the day" },
  ];

  const startGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setGameWord(randomWord.word.toLowerCase());
    setGameHint(randomWord.hint);
    setMiniGame(true);
    sendChatMessage(`Bot: Let's play a game! Guess the word: ${randomWord.hint}`);
  };

  const checkGuess = (guess) => {
    if (guess.toLowerCase() === gameWord) {
      sendChatMessage(`Bot: Correct! 🎉 The word was: ${gameWord}`);
      setLeaderboard((prev) => [...prev, { user: username || "You", score: 1 }]);
      setMiniGame(false);
    } else {
      sendChatMessage(`Bot: Not quite! Try again. Hint: ${gameHint}`);
    }
  };

  const sendChatMessage = (msg) => {
    socket.emit("chat message", msg);
    setMessages((prevMessages) => [...prevMessages, msg]);
  };

  const sendMessage = () => {
    if (message.trim()) {
      if (miniGame) {
        checkGuess(message);
      } else {
        sendChatMessage(`${username}: ${message}`);
        updateAnalytics(message);
      }
      setMessage("");
      resetTranscript();
    }
  };

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      updateAnalytics(msg);

      // Trigger voiceover for chatbot messages
      if (msg.startsWith("Bot: ")) {
        speakMessage(msg.replace("Bot: ", ""));
      }
    });

    return () => {
      socket.off("chat message");
    };
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleLogin = () => {
    if (username.trim() && password.trim()) {
      setIsLoggedIn(true);
    } else {
      alert("Please enter a username and password!");
    }
  };

  const handleSignUp = () => {
    if (username.trim() && password.trim()) {
      alert("Sign-up successful! Please log in.");
      setTabValue(0);
    } else {
      alert("Please enter a username and password!");
    }
  };

  if (isLoggedIn) {
    return (
      <Container maxWidth="lg" style={{ marginTop: "2rem" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={dashboardTab}
            onChange={(e, newTab) => setDashboardTab(newTab)}
            centered
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab icon={<ChatBubbleOutlineIcon />} label="Chat" />
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Box>

        {dashboardTab === 0 && (
          <Container maxWidth="sm" style={{ marginTop: "2rem", height: "80vh" }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              <ChatBubbleOutlineIcon /> Chat Room
            </Typography>
            <Paper elevation={3} style={{ padding: "1rem", flex: 1, overflowY: "auto" }}>
              <Box>
                {messages.map((msg, index) => (
                  <Typography key={index} variant="body2">{msg}</Typography>
                ))}
                <div ref={messageEndRef} />
              </Box>
            </Paper>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingTop: "10px" }}>
              <TextField
                variant="outlined"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={miniGame ? "Your guess..." : "Type a message..."}
              />
              <Button variant="contained" color="primary" onClick={sendMessage}>
                {miniGame ? "Guess" : "Send"}
              </Button>
              {!miniGame && (
                <Button variant="contained" color="secondary" onClick={startGame}>
                  Start Game
                </Button>
              )}
            </Box>
          </Container>
        )}

        {dashboardTab === 1 && (
          <DashboardTab>
            <Typography variant="h5" gutterBottom>
              <InsightsIcon /> Chat Performance Dashboard
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sentiment" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
            <Typography variant="body1">
              <SentimentSatisfiedAltIcon sx={{ marginRight: 1 }} />
              Sentiment trends help visualize user moods and engagement over time.
            </Typography>
          </DashboardTab>
        )}

        {dashboardTab === 2 && (
          <DashboardTab>
            <Typography variant="h5" gutterBottom>
              <NotificationsIcon /> Notifications
            </Typography>
            <Box>
              <Typography variant="body1">
                No new notifications at the moment. Stay tuned!
              </Typography>
            </Box>
          </DashboardTab>
        )}

        {dashboardTab === 3 && (
          <DashboardTab>
            <Typography variant="h5" gutterBottom>
              <SettingsIcon /> Settings
            </Typography>
            <Box>
              <Typography variant="body1">Settings are under construction. Check back soon!</Typography>
            </Box>
          </DashboardTab>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Swiftchats
      </Typography>
      <Box>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
        <Grid container spacing={2} sx={{ marginTop: 3 }}>
          <Grid item xs={12}>
            <TextField
              label="Username"
              variant="filled"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Password"
              variant="filled"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
        </Grid>
        {tabValue === 0 && (
          <Button variant="contained" fullWidth onClick={handleLogin} sx={{ marginTop: 2 }}>
            Log in
          </Button>
        )}
        {tabValue === 1 && (
          <Button variant="contained" fullWidth onClick={handleSignUp} sx={{ marginTop: 2 }}>
            Sign Up
          </Button>
        )}
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Or log in with
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              startIcon={<GoogleIcon />}
              color="error"
              sx={{ flex: 1 }}
            >
              Google
            </Button>
            <Button
              variant="contained"
              startIcon={<FacebookIcon />}
              sx={{ flex: 1 }}
            >
              Facebook
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default App;

