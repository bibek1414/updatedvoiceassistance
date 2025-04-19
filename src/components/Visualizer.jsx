 // src/components/Visualizer.jsx
  import { useState, useEffect } from 'react';
  
  const Visualizer = ({ isActive }) => {
    const [bars, setBars] = useState([]);
    
    // Create bars on mount
    useEffect(() => {
      // Create 50 bars with initial height
      const initialBars = Array(50).fill(5); // 5px height for each bar
      setBars(initialBars);
    }, []);
    
    // Animation effect
    useEffect(() => {
      let animationFrameId;
      
      if (isActive) {
        const animateBars = () => {
          const newBars = bars.map(() => Math.floor(Math.random() * 95) + 5);
          setBars(newBars);
          animationFrameId = requestAnimationFrame(animateBars);
        };
        
        animationFrameId = requestAnimationFrame(animateBars);
      } else {
        // Reset bars when not active
        setBars(Array(50).fill(5));
      }
      
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }, [isActive]);
    
    return (
      <div className="visualizer">
        <div className="visualizer-bars">
          {bars.map((height, index) => (
            <div 
              key={index} 
              className="bar" 
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      </div>
    );
  };
  
  export default Visualizer;