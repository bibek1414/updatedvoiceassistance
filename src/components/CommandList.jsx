// src/components/CommandList.jsx
  const CommandList = () => {
    return (
      <div className="command-list">
        <h3>Available Commands</h3>
        <ul>
          <li>"What time is it?" - Get the current time</li>
          <li>"What's the weather like?" - Get weather information</li>
          <li>"Schedule a [task] at [time]" - Create a reminder</li>
          <li>"Show my tasks" - List all scheduled tasks</li>
          <li>"Play music" - Start playing music</li>
          <li>"Pause music" or "Stop music" - Pause music playback</li>
          <li>"Search for [file name]" - Search for local files</li>
          <li>"Ask [question]" - Ask any question for information</li>
        </ul>
      </div>
    );
  };
  
  export default CommandList;