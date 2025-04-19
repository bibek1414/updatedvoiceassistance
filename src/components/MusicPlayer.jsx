 const MusicPlayer = ({ musicState, playMusic, pauseMusic, skipTrack }) => {
    return (
      <div className="music-player">
        <h3>Music Player</h3>
        <div className="music-controls">
          <button className="music-btn" onClick={playMusic}>Play</button>
          <button className="music-btn" onClick={pauseMusic}>Pause</button>
          <button className="music-btn" onClick={skipTrack}>Skip</button>
        </div>
        <div className="now-playing">
          {musicState.isPlaying 
            ? `Now playing: ${musicState.currentTrack}`
            : musicState.currentTrack !== 'No track selected'
              ? `Paused: ${musicState.currentTrack}`
              : 'No music playing'}
        </div>
      </div>
    );
  };
  
  export default MusicPlayer;