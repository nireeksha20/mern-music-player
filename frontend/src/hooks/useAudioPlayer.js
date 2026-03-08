import { useReducer, useState, useRef } from "react";

const initialAudioState = {
  isPlaying: false,
  isLoading: false,
  isMuted: false,
  volume: 1,
  loopEnabled: false,
  shuffleEnabled: false,
  playbackSpeed: 1,
  currentIndex: null,
  currentSong: null,
  currentTime: 0,
};

// Reducer
function audioReducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, isLoading: true };

    case "PLAY":
      return { ...state, isPlaying: true, isLoading: false };

    case "PAUSE":
      return { ...state, isPlaying: false };

    case "MUTE":
      return { ...state, isMuted: true };

    case "UNMUTE":
      return { ...state, isMuted: false };

    case "SET_VOLUME":
      return { ...state, volume: action.payload };

    case "TOGGLE_LOOP":
      return {
        ...state,
        loopEnabled: !state.loopEnabled,
        shuffleEnabled: false,
      };

    case "TOGGLE_SHUFFLE":
      return {
        ...state,
        shuffleEnabled: !state.shuffleEnabled,
        loopEnabled: false,
      };

    case "SET_CURRENT_TRACK":
      return {
        ...state,
        currentIndex: action.payload.index,
        currentSong: action.payload.song,
        isLoading: true,
      };

    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };

    case "SET_PLAYBACK_SPEED":
      return { ...state, playbackSpeed: action.payload };

    default:
      return state;
  }
}

const useAudioPlayer = (songs) => {
  const [audioState, dispatch] = useReducer(audioReducer, initialAudioState);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const previousVolumeRef = useRef(1);

  // Play a song at a specific index
  const playSongAtIndex = (index) => {
    if (!songs || songs.length === 0) return;
    if (index < 0 || index >= songs.length) return;

    const song = songs[index];
    const audio = audioRef.current;
    if (!audio) return;

    dispatch({
      type: "SET_CURRENT_TRACK",
      payload: { index, song },
    });

    dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
    dispatch({ type: "LOADING" });

    audio.src = song.audio || song.url;
    audio.currentTime = 0;
    audio.playbackRate = audioState.playbackSpeed;

    audio
      .play()
      .then(() => dispatch({ type: "PLAY" }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Play Error", err);
        }
      });
  };

  // Play / Pause
  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => dispatch({ type: "PLAY" }))
        .catch((e) => console.error("Play error", e));
    } else {
      audio.pause();
      dispatch({ type: "PAUSE" });
    }
  };

  // Next song
  const handleNext = () => {
    if (!songs.length) return;

    if (audioState.currentIndex === null) {
      playSongAtIndex(0);
      return;
    }

    if (audioState.shuffleEnabled && songs.length > 1) {
      let randomIndex = audioState.currentIndex;
      while (randomIndex === audioState.currentIndex) {
        randomIndex = Math.floor(Math.random() * songs.length);
      }
      playSongAtIndex(randomIndex);
      return;
    }

    const nextIndex = (audioState.currentIndex + 1) % songs.length;
    playSongAtIndex(nextIndex);
  };

  // Previous song
  const handlePrev = () => {
    if (!songs.length) return;

    if (audioState.currentIndex === null) {
      playSongAtIndex(0);
      return;
    }

    const prevIndex =
      (audioState.currentIndex - 1 + songs.length) % songs.length;
    playSongAtIndex(prevIndex);
  };

  // Audio events
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    dispatch({
      type: "SET_CURRENT_TIME",
      payload: audio.currentTime || 0,
    });
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || 0);
    audio.playbackRate = audioState.playbackSpeed;
    audio.volume = audioState.volume;
    audio.muted = audioState.isMuted;

    dispatch({ type: "PLAY" });
  };

  const handleEnded = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioState.loopEnabled) {
      audio.currentTime = 0;
      audio.play().then(() => {
        dispatch({ type: "PLAY" });
        dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
      });
    } else {
      handleNext();
    }
  };

  // Controls
  const handleToggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioState.isMuted) {
      const restoreVolume = previousVolumeRef.current || 1;
      audio.muted = false;
      audio.volume = restoreVolume;
      dispatch({ type: "UNMUTE" });
      dispatch({ type: "SET_VOLUME", payload: restoreVolume });
    } else {
      previousVolumeRef.current = audioState.volume || 1;
      audio.muted = true;
      audio.volume = 0;
      dispatch({ type: "MUTE" });
      dispatch({ type: "SET_VOLUME", payload: 0 });
    }
  };

  const handleToggleLoop = () => dispatch({ type: "TOGGLE_LOOP" });
  const handleToggleShuffle = () => dispatch({ type: "TOGGLE_SHUFFLE" });

  const handleChangeSpeed = (speed) => {
    const audio = audioRef.current;
    dispatch({ type: "SET_PLAYBACK_SPEED", payload: speed });
    if (audio) audio.playbackRate = speed;
  };

  const handleSeek = (time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    dispatch({ type: "SET_CURRENT_TIME", payload: time });
  };

  const handleChangeVolume = (volume) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (volume > 0) previousVolumeRef.current = volume;

    audio.volume = volume;
    dispatch({ type: "SET_VOLUME", payload: volume });

    if (volume === 0) {
      audio.muted = true;
      dispatch({ type: "MUTE" });
    } else if (audioState.isMuted) {
      audio.muted = false;
      dispatch({ type: "UNMUTE" });
    }
  };

  return {
    audioRef,

    currentIndex: audioState.currentIndex,
    currentSong: audioState.currentSong,
    isPlaying: audioState.isPlaying,
    currentTime: audioState.currentTime,
    isLoading: audioState.isLoading,
    duration,

    isMuted: audioState.isMuted,
    loopEnabled: audioState.loopEnabled,
    shuffleEnabled: audioState.shuffleEnabled,
    playbackSpeed: audioState.playbackSpeed,
    volume: audioState.volume,

    playSongAtIndex,
    handleTogglePlay,
    handleNext,
    handlePrev,

    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,

    handleToggleMute,
    handleToggleLoop,
    handleToggleShuffle,
    handleChangeSpeed,
    handleSeek,
    handleChangeVolume,
  };
};

export default useAudioPlayer;
