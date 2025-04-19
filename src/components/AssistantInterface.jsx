 // src/components/AssistantInterface.jsx
  import { useState, useEffect, useRef } from 'react';
  import Visualizer from './Visualizer';
  
  const AssistantInterface = ({ conversation, isListening, setIsListening, processCommand, addMessage }) => {
    const [status, setStatus] = useState('Press the microphone and speak');
    const conversationRef = useRef(null);
    const recognition = useRef(null);
  
    useEffect(() => {
      // Initialize speech recognition
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.current.continuous = false;
        recognition.current.interimResults = false;
        recognition.current.lang = 'en-US';
        
        recognition.current.onstart = function() {
          setIsListening(true);
          setStatus('Listening...');
        };
        
        recognition.current.onresult = function(event) {
          const transcript = event.results[0][0].transcript;
          console.log('Recognized:', transcript);
          addMessage(transcript, 'user');
          
          // Process the command
          processCommand(transcript);
        };
        
        recognition.current.onend = function() {
          setIsListening(false);
          setStatus('Press the microphone and speak');
        };
        
        recognition.current.onerror = function(event) {
          console.error('Recognition error:', event.error);
          setStatus(`Error: ${event.error}`);
          setIsListening(false);
        };
      } else {
        setStatus('Speech recognition not supported in this browser');
      }
      
      // Cleanup
      return () => {
        if (recognition.current) {
          recognition.current.stop();
        }
      };
    }, []);
  
    // Scroll to bottom of conversation when new messages arrive
    useEffect(() => {
      if (conversationRef.current) {
        conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
      }
    }, [conversation]);
  
    const toggleListen = () => {
      if (!recognition.current) {
        return;
      }
      
      if (isListening) {
        recognition.current.stop();
      } else {
        try {
          recognition.current.start();
        } catch (e) {
          console.error('Recognition error:', e);
          // If there's an error starting recognition, try to initialize again
          if (e.name === 'InvalidStateError') {
            recognition.current.stop();
            setTimeout(() => {
              recognition.current.start();
            }, 200);
          }
        }
      }
    };
  
    return (
      <div className="assistant-interface">
        <Visualizer isActive={isListening} />
        
        <div className="conversation" ref={conversationRef}>
          {conversation.map((message, index) => (
            <div key={index} className={`message ${message.sender}-message`}>
              {message.text}
            </div>
          ))}
        </div>
        
        <div className="controls">
          <button 
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListen}
          >
            <i>🎤</i>
          </button>
          <div className="status">{status}</div>
        </div>
      </div>
    );
  };
  
  export default AssistantInterface;