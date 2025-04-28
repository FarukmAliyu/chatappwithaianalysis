import React from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const VoiceChat = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const handleListen = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleSend = () => {
    if (transcript.trim() !== "") {
      console.log("User Said:", transcript);
      // Here you can trigger your chatbot response!
      resetTranscript();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={handleListen}
        className={`p-3 rounded-full shadow-lg ${listening ? "bg-red-500" : "bg-green-500"} text-white mb-2`}
      >
        {listening ? "Stop 🎤" : "Speak 🎙️"}
      </button>

      <textarea
        value={transcript}
        placeholder="Voice input will appear here..."
        className="w-full p-2 border rounded mb-2"
        rows="3"
        readOnly
      />

      <button 
        onClick={handleSend}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default VoiceChat;
