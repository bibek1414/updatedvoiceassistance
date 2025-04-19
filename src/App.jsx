// src/App.jsx
import { useState, useEffect } from 'react';
import Header from './components/Header';
import AssistantInterface from './components/AssistantInterface';
import CommandList from './components/CommandList';
import TasksContainer from './components/TasksContainer';
import MusicPlayer from './components/MusicPlayer';
import Notification from './components/Notification';
import { loadEnvVariables } from './utils/envLoader';
import './App.css';

// Sample music playlist and files database
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
  const [env, setEnv] = useState({});
  const [tasks, setTasks] = useState([]);
  const [conversation, setConversation] = useState([{
    text: "Hello, I'm your voice assistant. How can I help you today?",
    sender: 'assistant'
  }]);
  const [isListening, setIsListening] = useState(false);
  const [musicState, setMusicState] = useState({
    isPlaying: false,
    currentTrackIndex: 0,
    currentTrack: 'No track selected'
  });
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // Load environment variables
      const envVars = await loadEnvVariables();
      setEnv(envVars);
      
      // Welcome message
      setTimeout(() => {
        speak("Hello, I'm your voice assistant. How can I help you today?");
      }, 1000);
    };

    initApp();
  }, []);

  // Function to add a message to the conversation
  const addMessage = (text, sender) => {
    setConversation(prev => [...prev, { text, sender }]);
  };

  // Function to respond to user
  const respond = (message) => {
    addMessage(message, 'assistant');
    speak(message);
  };

  // Text-to-speech function
  const speak = (text) => {
    const synth = window.speechSynthesis;
    
    if (synth.speaking) {
      console.log('Speech already in progress');
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  // Process voice commands
  const processCommand = (command) => {
    command = command.toLowerCase().trim();
    
    // Time inquiry
    if (command.includes("what time") || command.includes("current time")) {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      respond(`The current time is ${timeString}`);
    }
    
    // Weather inquiry
    else if (command.includes("weather")) {
      // Check if ENV has a valid API key
      if (!env.WEATHER_API_KEY) {
        respond("Weather feature is not configured. Please add your API key to the .env file.");
        return;
      }
      
      // Check if a location is specified
      let location = "New York"; // Default city
      
      // Try to extract location from command
      const locationMatches = command.match(/weather (?:in|for|at) (.+)/i);
      if (locationMatches && locationMatches[1]) {
        location = locationMatches[1].trim();
      }
      
      getWeatherData(location);
    }
    
    // Scheduling tasks
    else if (command.includes("schedule") || command.includes("remind") || command.includes("set reminder")) {
      scheduleTask(command);
    }
    
    // Show tasks
    else if (command.includes("show my tasks") || command.includes("show tasks") || command.includes("list tasks")) {
      listTasks();
    }
    
    // Music controls
    else if (command.includes("play music")) {
      playMusic();
    }
    else if (command.includes("pause music") || command.includes("stop music")) {
      pauseMusic();
    }
    else if (command.includes("next song") || command.includes("skip song") || command.includes("skip track")) {
      skipTrack();
    }
    
    // File search
    else if (command.includes("search for") || command.includes("find file")) {
      searchFiles(command);
    }
    
    // General questions/conversation
    else if (command.includes("hello") || command.includes("hi jarvis")) {
      respond("Hello! How may I assist you today?");
    }
    
    // Help command
    else if (command.includes("help") || command.includes("what can you do")) {
      respond("I can tell you the time, schedule tasks, play music, search for files, and answer general questions. Try saying 'What time is it' or 'Schedule a meeting at 3 PM'.");
    }
    
    // General questions
    else if (command.includes("what is") || command.includes("who is") || command.includes("how to") || command.includes("tell me about")) {
      answerQuestion(command);
    }
    
    // Default response
    else {
      respond("I'm not sure how to respond to that. You can ask me about the time, weather, schedule tasks, play music, or search for files.");
    }
  };

  // Weather data function
  const getWeatherData = (city) => {
    respond(`Getting weather for ${city}...`);
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${env.WEATHER_API_KEY}`;
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const temp = Math.round(data.main.temp);
        const tempF = Math.round(temp * 9/5 + 32);
        const condition = data.weather[0].description;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        
        const weatherResponse = `The current weather in ${data.name} is ${condition} with a temperature of ${temp}°C (${tempF}°F). The humidity is ${humidity}% and wind speed is ${windSpeed} meters per second.`;
        
        respond(weatherResponse);
      })
      .catch(error => {
        console.error('Weather fetch error:', error);
        respond(`I'm sorry, I couldn't get weather information for ${city}. Please try again or try another city.`);
      });
  };

  // Schedule a task
  const scheduleTask = (command) => {
    // Extract task and time from command
    let taskDetails = null;
    
    // Try different regex patterns to extract time and task
    const patterns = [
      /schedule\s+(a|an)?\s*(.+)\s+(?:at|for)\s+(.+)/i,
      /remind\s+(?:me)?\s+(?:to)?\s+(.+)\s+(?:at|for)\s+(.+)/i,
      /set\s+(?:a)?\s*reminder\s+(?:for)?\s+(.+)\s+(?:at|for)\s+(.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        // The task and time positions vary based on the pattern
        const taskText = match[match.length - 2];
        const timeText = match[match.length - 1];
        
        if (taskText && timeText) {
          taskDetails = { task: taskText, time: timeText };
          break;
        }
      }
    }
    
    // If no match was found using regex patterns, try a simpler approach
    if (!taskDetails) {
      // Look for "at" or "for" keywords
      const atIndex = command.indexOf(" at ");
      const forIndex = command.indexOf(" for ");
      
      if (atIndex > 0) {
        const task = command.substring(0, atIndex).replace(/schedule|remind me to|set reminder/gi, "").trim();
        const time = command.substring(atIndex + 4).trim();
        taskDetails = { task, time };
      } else if (forIndex > 0) {
        const task = command.substring(0, forIndex).replace(/schedule|remind me to|set reminder/gi, "").trim();
        const time = command.substring(forIndex + 5).trim();
        taskDetails = { task, time };
      }
    }
    
    if (taskDetails) {
      // Convert time string to Date object
      const timeDate = parseTimeString(taskDetails.time);
      
      if (timeDate) {
        // Add task to the list
        const taskId = Date.now().toString();
        const task = {
          id: taskId,
          text: taskDetails.task,
          time: timeDate,
          timeString: timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setTasks(prevTasks => [...prevTasks, task]);
        
        // Set timeout for task reminder
        const now = new Date();
        const delay = timeDate - now;
        
        if (delay > 0) {
          setTimeout(() => {
            displayNotification(`Reminder: ${task.text}`);
            speak(`Reminder: ${task.text}`);
          }, delay);
        }
        
        respond(`Task scheduled: ${taskDetails.task} at ${task.timeString}`);
      } else {
        respond("I couldn't understand the time. Please try again with a clearer time format like '3 PM' or '15:30'.");
      }
    } else {
      respond("I couldn't understand the task details. Please try again with a format like 'Schedule a meeting at 3 PM'.");
    }
  };

  // Parse time string to Date object
  const parseTimeString = (timeStr) => {
    timeStr = timeStr.toLowerCase();
    const now = new Date();
    let hours = 0;
    let minutes = 0;
    
    // Try to parse common time formats
    if (timeStr.includes(':')) {
      // Format: 3:30 PM or 15:30
      const timeParts = timeStr.split(':');
      hours = parseInt(timeParts[0], 10);
      
      // Extract minutes and remove any non-digit characters
      const minutesPart = timeParts[1].replace(/\D/g, '');
      minutes = parseInt(minutesPart, 10);
      
      // Adjust for AM/PM
      if (timeStr.includes('pm') && hours < 12) {
        hours += 12;
      } else if (timeStr.includes('am') && hours === 12) {
        hours = 0;
      }
    } else {
      // Format: 3 PM, 3PM, etc.
      const hourMatch = timeStr.match(/\d+/);
      if (hourMatch) {
        hours = parseInt(hourMatch[0], 10);
        
        // Adjust for AM/PM
        if (timeStr.includes('pm') && hours < 12) {
          hours += 12;
        } else if (timeStr.includes('am') && hours === 12) {
          hours = 0;
        }
      } else {
        // Handle special cases like "noon", "midnight"
        if (timeStr.includes('noon')) {
          hours = 12;
        } else if (timeStr.includes('midnight')) {
          hours = 0;
        } else {
          return null;
        }
      }
    }
    
    // Create a new Date object with the parsed time
    const timeDate = new Date(now);
    timeDate.setHours(hours, minutes, 0, 0);
    
    // If the time is already past for today, set it for tomorrow
    if (timeDate < now) {
      timeDate.setDate(timeDate.getDate() + 1);
    }
    
    return timeDate;
  };

  // List all tasks
  const listTasks = () => {
    if (tasks.length === 0) {
      respond("You have no scheduled tasks.");
      return;
    }
    
    // Sort tasks by time
    const sortedTasks = [...tasks].sort((a, b) => a.time - b.time);
    
    let taskMessage = "Here are your scheduled tasks: ";
    sortedTasks.forEach((task, index) => {
      taskMessage += `${index + 1}. ${task.text} at ${task.timeString}. `;
    });
    
    respond(taskMessage);
  };

  // Play music
  const playMusic = () => {
    setMusicState(prev => ({
      isPlaying: true,
      currentTrackIndex: prev.currentTrackIndex,
      currentTrack: musicPlaylist[prev.currentTrackIndex]
    }));
    respond(`Playing ${musicPlaylist[musicState.currentTrackIndex]}`);
  };

  // Pause music
  const pauseMusic = () => {
    if (musicState.isPlaying) {
      setMusicState(prev => ({
        ...prev,
        isPlaying: false
      }));
      respond("Music paused");
    } else {
      respond("No music is currently playing");
    }
  };

  // Skip to next track
  const skipTrack = () => {
    if (musicState.isPlaying) {
      const nextIndex = (musicState.currentTrackIndex + 1) % musicPlaylist.length;
      setMusicState({
        isPlaying: true,
        currentTrackIndex: nextIndex,
        currentTrack: musicPlaylist[nextIndex]
      });
      respond(`Skipped to next track: ${musicPlaylist[nextIndex]}`);
    } else {
      respond("No music is currently playing");
    }
  };

  // Search for files
  const searchFiles = (command) => {
    const query = command.replace(/search for|find file|find|search/gi, "").trim();
    
    if (!query) {
      respond("Please specify what file you're looking for.");
      return;
    }
    
    // Search in our sample files
    const results = sampleFiles.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (results.length > 0) {
      let response = `I found ${results.length} file${results.length > 1 ? 's' : ''} matching "${query}": `;
      results.forEach((file, index) => {
        response += `${index + 1}. ${file.name} (${file.type.toUpperCase()}) located at ${file.path}. `;
      });
      respond(response);
    } else {
      respond(`No files found matching "${query}". Please try a different search term.`);
    }
  };

  // Answer general questions
  const answerQuestion = (command) => {
    const question = command.toLowerCase();
    
    // Sample predefined answers
    if (question.includes("your name")) {
      respond("My name is JARVIS, which stands for Just A Rather Very Intelligent System.");
    }
    else if (question.includes("who created you")) {
      respond("I was created as a web-based voice assistant to help with various tasks.");
    }
    else if (question.includes("what can you do")) {
      respond("I can help you schedule tasks, play music, search for files, and answer general questions. You can also ask me about the time.");
    }
    else {
      respond("I don't have enough information to answer that question accurately. In a full implementation, I would connect to a knowledge base or language model to provide better answers.");
    }
  };

  // Show notification
  const displayNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  return (
    <div className="container">
      <Header />
      
      <AssistantInterface 
        conversation={conversation}
        isListening={isListening}
        setIsListening={setIsListening}
        processCommand={processCommand}
        addMessage={addMessage}
      />
      
      <CommandList />
      
      <TasksContainer 
        tasks={tasks}
        speak={speak}
      />
      
      <MusicPlayer 
        musicState={musicState}
        playMusic={playMusic}
        pauseMusic={pauseMusic}
        skipTrack={skipTrack}
      />
      
      <Notification 
        message={notificationMessage}
        show={showNotification}
      />
    </div>
  );
}

export default App;