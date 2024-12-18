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
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer 
} from "recharts";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import InsightsIcon from "@mui/icons-material/Insights";

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
  const messageEndRef = useRef(null);

  const { transcript, resetTranscript } = useSpeechRecognition();

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

  const sendMessage = () => {
    if (message.trim()) {
      const msg = `${username}: ${message}`;
      socket.emit("chat message", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
      updateAnalytics(message);
      setMessage("");
      resetTranscript();
    }
  };

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      updateAnalytics(msg);
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
          </Tabs>
        </Box>

        {dashboardTab === 0 && (
          <Container
            maxWidth="sm"
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              height: "80vh",
            }}
          >
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              <ChatBubbleOutlineIcon /> Chat Room
            </Typography>
            <Paper
              elevation={3}
              style={{
                padding: "1rem",
                flex: 1,
                overflowY: "auto",
                marginBottom: "10px",
              }}
            >
              <Box>
                {messages.map((msg, index) => (
                  <Typography key={index} variant="body2">
                    {msg}
                  </Typography>
                ))}
                <div ref={messageEndRef} />
              </Box>
            </Paper>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                borderTop: "1px solid #ccc",
                paddingTop: "10px",
              }}
            >
              <TextField
                variant="outlined"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <Button
                variant="contained"
                color="primary"
                onClick={sendMessage}
                sx={{ height: "fit-content" }}
              >
                Send
              </Button>
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
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#8884d8"
                  name="Sentiment Score"
                />
              </LineChart>
            </ResponsiveContainer>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              <SentimentSatisfiedAltIcon sx={{ marginRight: 1 }} />
              Sentiment trends help visualize user moods and engagement over time.
            </Typography>
          </DashboardTab>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Welcome to the Chat App
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
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box sx={{ marginTop: 3 }}>
          {tabValue === 0 ? (
            <Button variant="contained" fullWidth onClick={handleLogin}>
              Login
            </Button>
          ) : (
            <Button variant="contained" fullWidth onClick={handleSignUp}>
              Sign Up
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default App;
