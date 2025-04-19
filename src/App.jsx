import { useState, useEffect } from 'react';
import Header from './components/Header';
import AssistantInterface from './components/AssistantInterface';
import CommandList from './components/CommandList';
import TasksContainer from './components/TasksContainer';
import MusicPlayer from './components/MusicPlayer';
import Notification from './components/Notification';
import { loadEnvVariables } from './utils/envLoader';
import './App.css';

// Constants
const musicPlaylist = [
  "Imagine Dragons - Believer",
  "Adele - Hello",
  "Ed Sheeran - Shape of You",
  "The Weeknd - Blinding Lights",
  "Dua Lipa - Levitating"
];

const sampleFiles = [
  { name: "quarterly_report.pdf", path: "/documents/work/quarterly_report.pdf", type: "pdf" },
  { name: "vacation_photos.zip", path: "/photos/vacation_photos.zip", type: "zip" },
  { name: "project_proposal.docx", path: "/documents/project_proposal.docx", type: "docx" },
  { name: "budget_2023.xlsx", path: "/documents/finance/budget_2023.xlsx", type: "xlsx" },
  { name: "presentation.pptx", path: "/documents/presentation.pptx", type: "pptx" }
];

function App() {
  // State
  const [env, setEnv] = useState({});
  const [tasks, setTasks] = useState([]);
  const [conversation, setConversation] = useState([{
    text: "Initializing voice assistant...",
    sender: 'assistant'
  }]);
  const [isListening, setIsListening] = useState(false);
  const [musicState, setMusicState] = useState({
    isPlaying: false,
    currentTrackIndex: 0,
    currentTrack: 'No track selected'
  });
  const [notification, setNotification] = useState({
    message: '',
    show: false
  });

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const envVars = await loadEnvVariables();
        setEnv(envVars);
        
        // Update initial message once ready
        setConversation([{
          text: "Hello, I'm your voice assistant. How can I help you today?",
          sender: 'assistant'
        }]);
        
        speak("Hello, I'm your voice assistant. How can I help you today?");
      } catch (error) {
        console.error('Initialization error:', error);
        showNotificationMessage("Failed to initialize some features");
      }
    };

    initializeApp();
  }, []);

  // Helper functions
  const addMessage = (text, sender) => {
    setConversation(prev => [...prev, { text, sender }]);
  };

  const respond = (message) => {
    addMessage(message, 'assistant');
    speak(message);
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel(); // Cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    synth.speak(utterance);
  };

  const showNotificationMessage = (message, duration = 3000) => {
    setNotification({ message, show: true });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), duration);
  };

  // Command processing
  const processCommand = (command) => {
    command = command.toLowerCase().trim();
    

    try {
      if (command.includes("time") || command.includes("current time")) {
        handleTimeCommand();
      } 
      else if (command.includes("weather")) {
        handleWeatherCommand(command);
      }
      else if (command.includes("schedule") || command.includes("remind") || command.includes("set reminder")) {
        handleTaskCommand(command);
      }
      else if (command.includes("task") || command.includes("todo")) {
        handleTaskListCommand();
      }
      else if (command.includes("play music")) {
        handleMusicCommand('play');
      }
      else if (command.includes("pause music") || command.includes("stop music")) {
        handleMusicCommand('pause');
      }
      else if (command.includes("next song") || command.includes("skip")) {
        handleMusicCommand('next');
      }
      else if (command.includes("search") || command.includes("find file")) {
        handleFileSearch(command);
      }
      else if (command.includes("hello") || command.includes("hi")) {
        respond("Hello! How can I assist you today?");
      }
      else if (command.includes("help") || command.includes("what can you do")) {
        respond("I can tell time, weather, manage tasks, play music, and search files. Try saying 'What's the weather?' or 'Play music'.");
      }
      else {
        respond("I didn't understand that. Try asking about time, weather, or tasks.");
      }
    } catch (error) {
      console.error('Command processing error:', error);
      respond("Sorry, I encountered an error processing your request.");
    }
  };

  // Command handlers
  const handleTimeCommand = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    respond(`The current time is ${timeString}`);
  };

  const handleWeatherCommand = (command) => {
    const apiKey = env.WEATHER_API_KEY || import.meta.env.VITE_WEATHER_API_KEY;
    if (!apiKey) {
      respond("Weather service is currently unavailable.");
      return;
    }
  
    let location = extractLocationFromCommand(command);
    getWeatherData(location, apiKey);
  };
  
  const extractLocationFromCommand = (command) => {
    // Extract location by searching for patterns like "weather in X" or "weather of X"
    let location = "New York"; // Default location
    
    // Check for "weather in/of/for/at X" pattern
    const locationMatch = command.match(/weather (?:in|of|for|at) (.+?)(?:\?|$)/i);
    if (locationMatch && locationMatch[1]) {
      location = locationMatch[1].trim();
    }
    
    // Check for "X weather" pattern (less common)
    else if (command.match(/(.+?) weather/i)) {
      location = command.match(/(.+?) weather/i)[1].trim();
    }
    
    // If command contains "today" or other words, try to extract location
    else if (command.includes("weather")) {
      const possibleLocation = command
        .replace(/what'?s|get|check|the|weather|today|now|current|for|in|of|at|\?/gi, '')
        .trim();
      
      if (possibleLocation) {
        location = possibleLocation;
      }
    }
    
    
    
    return location;
  };

  const getWeatherData = async (city, apiKey) => {
    respond(`Checking weather for ${city}...`);
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const weatherInfo = formatWeatherData(data);
      respond(weatherInfo);
    } catch (error) {
      console.error('Weather fetch error:', error);
      respond(`Sorry, I couldn't get weather for ${city}. Please try another location.`);
    }
  };

  const formatWeatherData = (data) => {
    const tempC = Math.round(data.main.temp);
    const tempF = Math.round(tempC * 9/5 + 32);
    return `Current weather in ${data.name}: ${data.weather[0].description}, 
            ${tempC}°C (${tempF}°F), 
            Humidity: ${data.main.humidity}%, 
            Wind: ${data.wind.speed} m/s`;
  };

  const handleTaskCommand = (command) => {
    const taskDetails = parseTaskCommand(command);
    if (!taskDetails) {
      respond("I didn't understand the task details. Try saying 'Remind me to call John at 3 PM'");
      return;
    }

    const task = createTask(taskDetails);
    setTasks(prev => [...prev, task]);
    scheduleTaskReminder(task);
    respond(`Task added: ${task.text} at ${task.timeString}`);
  };

  const parseTaskCommand = (command) => {
    const patterns = [
      /(?:schedule|remind me to|set reminder for) (.+?) (?:at|for) (.+)/i,
      /(?:schedule|remind me|set reminder) (.+)/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return {
          task: match[1].trim(),
          time: match[2]?.trim() || 'now'
        };
      }
    }
    return null;
  };

  const createTask = ({ task, time }) => {
    const timeDate = parseTimeString(time) || new Date();
    return {
      id: Date.now().toString(),
      text: task,
      time: timeDate,
      timeString: timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const parseTimeString = (timeStr) => {
    // Implementation remains the same as your original
    // ... (your existing time parsing logic)
  };

  const scheduleTaskReminder = (task) => {
    const now = new Date();
    const delay = task.time - now;
    
    if (delay > 0) {
      setTimeout(() => {
        const reminderMsg = `Reminder: ${task.text}`;
        respond(reminderMsg);
        showNotificationMessage(reminderMsg);
      }, delay);
    }
  };

  const handleTaskListCommand = () => {
    if (tasks.length === 0) {
      respond("You have no scheduled tasks.");
      return;
    }

    const taskList = tasks
      .sort((a, b) => a.time - b.time)
      .map((task, i) => `${i + 1}. ${task.text} at ${task.timeString}`)
      .join('. ');

    respond(`Your tasks: ${taskList}`);
  };

  const handleMusicCommand = (action) => {
    switch (action) {
      case 'play':
        setMusicState({
          isPlaying: true,
          currentTrackIndex: musicState.currentTrackIndex,
          currentTrack: musicPlaylist[musicState.currentTrackIndex]
        });
        respond(`Now playing: ${musicPlaylist[musicState.currentTrackIndex]}`);
        break;
        
      case 'pause':
        setMusicState(prev => ({ ...prev, isPlaying: false }));
        respond("Music paused");
        break;
        
      case 'next':
        const nextIndex = (musicState.currentTrackIndex + 1) % musicPlaylist.length;
        setMusicState({
          isPlaying: true,
          currentTrackIndex: nextIndex,
          currentTrack: musicPlaylist[nextIndex]
        });
        respond(`Playing next track: ${musicPlaylist[nextIndex]}`);
        break;
    }
  };

  const handleFileSearch = (command) => {
    const query = command.replace(/search for|find file|find|search/gi, "").trim();
    if (!query) {
      respond("Please specify what you're searching for.");
      return;
    }

    const results = sampleFiles.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length > 0) {
      const resultText = results
        .map((file, i) => `${i + 1}. ${file.name} (${file.type})`)
        .join(', ');
      respond(`Found ${results.length} files: ${resultText}`);
    } else {
      respond(`No files found matching "${query}"`);
    }
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <AssistantInterface 
          conversation={conversation}
          isListening={isListening}
          setIsListening={setIsListening}
          processCommand={processCommand}
          addMessage={addMessage}
        />
        
        <div className="features-container">
          <CommandList />
          <TasksContainer tasks={tasks} />
          <MusicPlayer 
            musicState={musicState}
            onPlay={() => handleMusicCommand('play')}
            onPause={() => handleMusicCommand('pause')}
            onNext={() => handleMusicCommand('next')}
          />
        </div>
      </main>
      
      <Notification 
        message={notification.message}
        show={notification.show}
      />
    </div>
  );
}

export default App;