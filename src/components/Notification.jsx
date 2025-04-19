
  import { useEffect, useRef } from 'react';
  
  const Notification = ({ message, show }) => {
    const notificationRef = useRef(null);
    
    useEffect(() => {
      if (show && notificationRef.current) {
        notificationRef.current.classList.add('show');
      } else if (notificationRef.current) {
        notificationRef.current.classList.remove('show');
      }
    }, [show]);
    
    return (
      <div className="notification" ref={notificationRef}>
        {message}
      </div>
    );
  };
  
  export default Notification;