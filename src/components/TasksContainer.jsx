// src/components/
  import { useState, useEffect } from 'react';
  
  const TasksContainer = ({ tasks, speak }) => {
    const [sortedTasks, setSortedTasks] = useState([]);
    
    // Sort tasks by time whenever tasks change
    useEffect(() => {
      if (tasks.length > 0) {
        const sorted = [...tasks].sort((a, b) => a.time - b.time);
        setSortedTasks(sorted);
      } else {
        setSortedTasks([]);
      }
    }, [tasks]);
    
    const handleTaskClick = (task) => {
      speak(`Task: ${task.text} at ${task.timeString}`);
    };
    
    return (
      <div className="tasks-container">
        <h3>Scheduled Tasks</h3>
        <ul className="task-list">
          {sortedTasks.length === 0 ? (
            <li>No tasks scheduled</li>
          ) : (
            sortedTasks.map(task => (
              <li 
                key={task.id} 
                className="task-item" 
                onClick={() => handleTaskClick(task)}
              >
                <span>{task.text}</span>
                <span className="task-time">{task.timeString}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  };

  export default TasksContainer;