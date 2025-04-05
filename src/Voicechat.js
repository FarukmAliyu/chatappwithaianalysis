import React, { useState } from 'react';

const VoiceChat = () => {
  const [message, setMessage] = useState('');
  const [listening, setListening] = useState(false);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  // Start voice recognition
  const handleVoiceInput = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognition.start();
  };

  // Text-to-speech
  const handleSpeak = () => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(message);
    synth.speak(utter);
  };

  return (
    <div className="p-4 rounded-xl shadow-md bg-white w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">🎤 Voice Chat</h2>
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md"
        rows="4"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Speak or type your message..."
      />
      <div className="flex gap-3 mt-3">
        <button
          onClick={handleVoiceInput}
          className={`px-4 py-2 rounded-md font-medium ${listening ? 'bg-red-500' : 'bg-blue-500'} text-white`}
        >
          {listening ? 'Listening...' : '🎙️ Speak'}
        </button>
        <button
          onClick={handleSpeak}
          className="px-4 py-2 rounded-md bg-green-500 text-white font-medium"
        >
          🔊 Speak It
        </button>
      </div>
    </div>
  );
};

export default VoiceChat;
