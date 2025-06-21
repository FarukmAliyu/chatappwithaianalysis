import VoiceChat from './components/VoiceChat';

function App() {
  return (
    <div className="App">
      {/* other components */}
      <VoiceChat />
    </div>
  );
}
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

  if (!isLoggedIn) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #8e44ad, #3498db)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "gradientAnimation 10s ease infinite",
        backgroundSize: "400% 400%",
      }}
    >
      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      <Paper
        elevation={6}
        sx={{
          p: 5,
          maxWidth: 420,
          width: "90%",
          borderRadius: 4,
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "#fff",
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(to right, #ff512f, #dd2476)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "fadeIn 2s ease",
          }}
        >
          SwiftChats
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ mb: 3 }}
        >
          <Tab label="Login" sx={{ color: "white" }} />
          <Tab label="Sign Up" sx={{ color: "white" }} />
        </Tabs>

        <TextField
          label="Username"
          variant="filled"
          fullWidth
          InputProps={{ style: { color: "white" } }}
          InputLabelProps={{ style: { color: "#bbb" } }}
          sx={{ mb: 2 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          variant="filled"
          fullWidth
          InputProps={{ style: { color: "white" } }}
          InputLabelProps={{ style: { color: "#bbb" } }}
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {tabValue === 0 ? (
          <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: "#00c6ff" }} onClick={handleLogin}>
            Log in
          </Button>
        ) : (
          <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: "#f7971e" }} onClick={handleSignUp}>
            Sign Up
          </Button>
        )}

        <Typography variant="body2" align="center" sx={{ mt: 3, mb: 1 }}>
          Or log in with
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            sx={{ bgcolor: "#db4437", color: "#fff", "&:hover": { bgcolor: "#c23321" } }}
          >
            Google
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FacebookIcon />}
            sx={{ bgcolor: "#4267B2", color: "#fff", "&:hover": { bgcolor: "#37559b" } }}
          >
            Facebook
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}


        {dashboardTab === 0 && (
          <Container maxWidth="sm" style={{ marginTop: "2rem", height: "80vh" }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              <ChatBubbleOutlineIcon /> 
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

