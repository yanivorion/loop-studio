import React from 'react';

function LoopStudio({ config = {} }) {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════
  const [audioReady, setAudioReady] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('drums');
  const [bpm, setBpm] = React.useState(parseInt(config?.defaultBpm || '128'));
  const [bars, setBars] = React.useState(2);
  const [currentBar, setCurrentBar] = React.useState(0);
  const [seqPlaying, setSeqPlaying] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  
  // Looper state
  const [isRecording, setIsRecording] = React.useState(false);
  const [isLoopPlaying, setIsLoopPlaying] = React.useState(false);
  const [loopTracks, setLoopTracks] = React.useState([[], [], [], []]);
  const [playheadPos, setPlayheadPos] = React.useState(0);
  
  // Bass state
  const [bassOctave, setBassOctave] = React.useState(2);
  const [bassPreset, setBassPreset] = React.useState('squelch');
  const [bassParams, setBassParams] = React.useState({ cutoff: 600, reso: 22, sub: 0.2, drive: 0.4 });
  
  // Kick state - Enhanced
  const [kickParams, setKickParams] = React.useState({ 
    sub: 0.75, punch: 0.5, click: 0.5, noise: 0.25,
    attack: 0.001, decay: 0.4, pitchDecay: 0.08, pitchStart: 150, pitchEnd: 40
  });
  
  // FX state
  const [fxParams, setFxParams] = React.useState({
    delayTime: 0.3, delayFeedback: 0.3, delayMix: 0.2,
    reverbMix: 0.15, reverbDecay: 2
  });
  
  // Mixer state - volume and pan for each instrument
  const [mixer, setMixer] = React.useState({
    drums: { volume: 0.8, pan: 0, delaySend: 0.2, reverbSend: 0.15 },
    bass: { volume: 0.7, pan: 0, delaySend: 0.1, reverbSend: 0.1 },
    piano: { volume: 0.6, pan: 0, delaySend: 0.3, reverbSend: 0.3 },
    pads: { volume: 0.5, pan: 0, delaySend: 0.4, reverbSend: 0.5 },
    lead: { volume: 0.7, pan: 0, delaySend: 0.25, reverbSend: 0.2 },
    master: { volume: 0.8 }
  });
  
  // Lead state
  const [leadWave, setLeadWave] = React.useState('sawtooth');
  
  // Sampler state
  const [samplerBuffer, setSamplerBuffer] = React.useState(null);
  const [samplerParams, setSamplerParams] = React.useState({
    pitch: 0, // semitones
    speed: 1,
    loopStart: 0,
    loopEnd: 1,
    reverse: false,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.7,
    release: 0.5
  });
  
  // LFO state
  const [lfoParams, setLfoParams] = React.useState([
    { active: false, wave: 'sine', rate: 2, depth: 0.5, target: 'cutoff' },
    { active: false, wave: 'triangle', rate: 4, depth: 0.3, target: 'volume' },
    { active: false, wave: 'square', rate: 1, depth: 0.6, target: 'pan' }
  ]);
  
  // Sequencer tracks
  const [tracks, setTracks] = React.useState(() => [
    { name: 'KICK', color: '#ff3b5c', group: 'drums', steps: new Array(16).fill(false), muted: false },
    { name: 'SNARE', color: '#fbbf24', group: 'drums', steps: new Array(16).fill(false), muted: false },
    { name: 'CLAP', color: '#22c55e', group: 'drums', steps: new Array(16).fill(false), muted: false },
    { name: 'HAT', color: '#22d3ee', group: 'drums', steps: new Array(16).fill(false), muted: false },
    { name: 'OPEN', color: '#3b82f6', group: 'drums', steps: new Array(16).fill(false), muted: false },
    { name: 'C', color: '#a855f7', group: 'bass', steps: new Array(16).fill(false), muted: false },
    { name: 'D', color: '#a855f7', group: 'bass', steps: new Array(16).fill(false), muted: false },
    { name: 'E', color: '#a855f7', group: 'bass', steps: new Array(16).fill(false), muted: false },
    { name: 'F', color: '#a855f7', group: 'bass', steps: new Array(16).fill(false), muted: false },
    { name: 'G', color: '#a855f7', group: 'bass', steps: new Array(16).fill(false), muted: false },
    { name: 'C4', color: '#ec4899', group: 'piano', steps: new Array(16).fill(false), muted: false },
    { name: 'E4', color: '#ec4899', group: 'piano', steps: new Array(16).fill(false), muted: false },
    { name: 'G4', color: '#ec4899', group: 'piano', steps: new Array(16).fill(false), muted: false },
    { name: 'Cm', color: '#6366f1', group: 'pads', steps: new Array(16).fill(false), muted: false },
    { name: 'Fm', color: '#6366f1', group: 'pads', steps: new Array(16).fill(false), muted: false },
    { name: 'L-C4', color: '#f59e0b', group: 'lead', steps: new Array(16).fill(false), muted: false },
    { name: 'L-E4', color: '#f59e0b', group: 'lead', steps: new Array(16).fill(false), muted: false },
  ]);
  
  // Refs
  const audioCtxRef = React.useRef(null);
  const masterGainRef = React.useRef(null);
  const convolverRef = React.useRef(null);
  const delayNodeRef = React.useRef(null);
  const delayFeedbackRef = React.useRef(null);
  const delayMixRef = React.useRef(null);
  const reverbMixRef = React.useRef(null);
  const playIntervalRef = React.useRef(null);
  const loopStartRef = React.useRef(0);
  const loopIntervalRef = React.useRef(null);
  const recordingRef = React.useRef(false);
  const tracksRef = React.useRef(tracks);
  
  const loopLength = 4000;
  
  // Responsive check
  const [isTablet, setIsTablet] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsTablet(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  // ═══════════════════════════════════════════════════════════════
  // SAVE/LOAD SESSION
  // ═══════════════════════════════════════════════════════════════
  const saveSession = React.useCallback(() => {
    const session = {
      version: '1.0',
      timestamp: Date.now(),
      bpm,
      bars,
      tracks,
      loopTracks,
      bassOctave,
      bassPreset,
      bassParams,
      kickParams,
      leadWave,
      activeTab
    };
    try {
      localStorage.setItem('loopStudioSession', JSON.stringify(session));
      return true;
    } catch (err) {
      console.error('Failed to save session:', err);
      return false;
    }
  }, [bpm, bars, tracks, loopTracks, bassOctave, bassPreset, bassParams, kickParams, leadWave, activeTab]);
  
  const loadSession = React.useCallback(() => {
    try {
      const saved = localStorage.getItem('loopStudioSession');
      if (!saved) return false;
      const session = JSON.parse(saved);
      
      setBpm(session.bpm || 128);
      setBars(session.bars || 2);
      setTracks(session.tracks || tracks);
      setLoopTracks(session.loopTracks || [[], [], [], []]);
      setBassOctave(session.bassOctave || 2);
      setBassPreset(session.bassPreset || 'squelch');
      setBassParams(session.bassParams || { cutoff: 600, reso: 22, sub: 0.2, drive: 0.4 });
      setKickParams(session.kickParams || { sub: 0.75, punch: 0.5, click: 0.5, noise: 0.25 });
      setLeadWave(session.leadWave || 'sawtooth');
      setActiveTab(session.activeTab || 'drums');
      
      return true;
    } catch (err) {
      console.error('Failed to load session:', err);
      return false;
    }
  }, [tracks]);
  
  const clearSession = React.useCallback(() => {
    try {
      localStorage.removeItem('loopStudioSession');
      window.location.reload();
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  }, []);
  
  // Download session as JSON file
  const downloadSession = React.useCallback(() => {
    const session = {
      version: '1.0',
      timestamp: Date.now(),
      name: `LoopStudio-${new Date().toISOString().split('T')[0]}`,
      bpm,
      bars,
      tracks,
      loopTracks,
      bassOctave,
      bassPreset,
      bassParams,
      kickParams,
      leadWave,
      activeTab
    };
    
    try {
      const json = JSON.stringify(session, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Failed to download session:', err);
      return false;
    }
  }, [bpm, bars, tracks, loopTracks, bassOctave, bassPreset, bassParams, kickParams, leadWave, activeTab]);
  
  // Upload/Import session from JSON file
  const uploadSessionRef = React.useRef(null);
  
  const handleFileUpload = React.useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const session = JSON.parse(e.target?.result);
        
        // Validate session structure
        if (!session.version || !session.bpm) {
          alert('Invalid session file format');
          return;
        }
        
        // Load session data
        setBpm(session.bpm || 128);
        setBars(session.bars || 2);
        setTracks(session.tracks || tracks);
        setLoopTracks(session.loopTracks || [[], [], [], []]);
        setBassOctave(session.bassOctave || 2);
        setBassPreset(session.bassPreset || 'squelch');
        setBassParams(session.bassParams || { cutoff: 600, reso: 22, sub: 0.2, drive: 0.4 });
        setKickParams(session.kickParams || { sub: 0.75, punch: 0.5, click: 0.5, noise: 0.25 });
        setLeadWave(session.leadWave || 'sawtooth');
        setActiveTab(session.activeTab || 'drums');
        
        // Also save to localStorage
        localStorage.setItem('loopStudioSession', JSON.stringify(session));
        
        alert('✅ Session loaded successfully!');
      } catch (err) {
        console.error('Failed to load session:', err);
        alert('❌ Failed to load session file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be uploaded again
    event.target.value = '';
  }, [tracks]);
  
  const triggerFileUpload = React.useCallback(() => {
    uploadSessionRef.current?.click();
  }, []);
  
  // Auto-save every 10 seconds
  React.useEffect(() => {
    if (!audioReady) return;
    const interval = setInterval(() => {
      saveSession();
    }, 10000);
    return () => clearInterval(interval);
  }, [audioReady, saveSession]);
  
  // ═══════════════════════════════════════════════════════════════
  // AUDIO INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  const initAudio = React.useCallback(async () => {
    if (audioCtxRef.current) return;
    
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      console.log('🎵 Audio context created, state:', ctx.state);
      
      await ctx.resume();
      console.log('🎵 Audio context resumed, state:', ctx.state);
      
      // iOS unlock
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      console.log('🎵 Unlock sound played');
      
      // Master gain
      const master = ctx.createGain();
      master.gain.value = mixer.master.volume;
      console.log('🎵 Master gain:', mixer.master.volume);
      
      // Delay
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = fxParams.delayTime;
      const delayFb = ctx.createGain();
      delayFb.gain.value = fxParams.delayFeedback;
      const delayMix = ctx.createGain();
      delayMix.gain.value = fxParams.delayMix;
      delay.connect(delayFb);
      delayFb.connect(delay);
      delay.connect(delayMix);
      delayMix.connect(master);
      
      // Reverb
      const convolver = ctx.createConvolver();
      const rate = ctx.sampleRate;
      const length = rate * fxParams.reverbDecay;
      const impulse = ctx.createBuffer(2, length, rate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }
      convolver.buffer = impulse;
      const reverbMix = ctx.createGain();
      reverbMix.gain.value = fxParams.reverbMix;
      convolver.connect(reverbMix);
      reverbMix.connect(master);
      
      master.connect(ctx.destination);
      console.log('🎵 Audio chain connected to destination');
      
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
      convolverRef.current = convolver;
      delayNodeRef.current = delay;
      delayFeedbackRef.current = delayFb;
      delayMixRef.current = delayMix;
      reverbMixRef.current = reverbMix;
      
      setAudioReady(true);
      console.log('✅ Audio system ready!');
      
      // Load default sample
      loadDefaultSample(ctx);
    } catch (err) {
      console.error('Audio init failed:', err);
    }
  }, [mixer.master.volume, fxParams]);
  
  const loadDefaultSample = React.useCallback(async (ctx) => {
    try {
      const response = await fetch('/loop-studio/default-sample.mp3');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      setSamplerBuffer(audioBuffer);
      console.log('✅ Default sample loaded');
    } catch (err) {
      console.error('Failed to load default sample:', err);
    }
  }, []);
  
  const playToMaster = React.useCallback((node) => {
    if (masterGainRef.current) node.connect(masterGainRef.current);
    if (delayNodeRef.current) node.connect(delayNodeRef.current);
    if (convolverRef.current) node.connect(convolverRef.current);
  }, []);
  
  // Helper to ensure audio context is running (critical for desktop browsers)
  const ensureAudioContext = React.useCallback(async () => {
    const ctx = audioCtxRef.current;
    if (!ctx) {
      console.error('❌ No audio context!');
      return false;
    }
    if (ctx.state === 'suspended') {
      console.log('⚠️ Audio context suspended, resuming...');
      try {
        await ctx.resume();
        console.log('✅ Audio context resumed to:', ctx.state);
      } catch (err) {
        console.error('❌ Failed to resume audio context:', err);
        return false;
      }
    }
    return true;
  }, []);
  
  // ═══════════════════════════════════════════════════════════════
  // LOOPER RECORDING
  // ═══════════════════════════════════════════════════════════════
  const recordEvent = React.useCallback((track, sound) => {
    if (!recordingRef.current) return;
    const time = (Date.now() - loopStartRef.current) % loopLength;
    setLoopTracks(prev => {
      const newTracks = [...prev];
      newTracks[track] = [...newTracks[track], { time, sound }];
      return newTracks;
    });
  }, []);
  
  // ═══════════════════════════════════════════════════════════════
  // DRUM SOUNDS
  // ═══════════════════════════════════════════════════════════════
  const playKick = React.useCallback(async () => {
    if (!(await ensureAudioContext())) return;
    const ctx = audioCtxRef.current;
    
    console.log('🥁 Playing kick, context state:', ctx.state);
    const now = ctx.currentTime;
    const attack = kickParams.attack;
    const decay = kickParams.decay;
    
    if (kickParams.sub > 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(kickParams.pitchStart, now);
      osc.frequency.exponentialRampToValueAtTime(kickParams.pitchEnd, now + kickParams.pitchDecay);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(kickParams.sub * 0.9, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay);
      osc.connect(gain);
      playToMaster(gain);
      osc.start(now);
      osc.stop(now + decay + 0.1);
      console.log('✅ Kick oscillator started');
    }
    
    if (kickParams.punch > 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.03);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(kickParams.punch * 0.6, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      playToMaster(gain);
      osc.start(now);
      osc.stop(now + 0.2);
    }
    
    if (kickParams.click > 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);
      filter.type = 'bandpass';
      filter.frequency.value = 2500;
      filter.Q.value = 2;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(kickParams.click * 0.4, now + attack * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(filter);
      filter.connect(gain);
      playToMaster(gain);
      osc.start(now);
      osc.stop(now + 0.05);
    }
    
    if (kickParams.noise > 0) {
      const bufLen = Math.floor(ctx.sampleRate * 0.03);
      const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();
      noise.buffer = buffer;
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(kickParams.noise * 0.3, now + attack);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      playToMaster(noiseGain);
      noise.start(now);
    }
    
    recordEvent(0, 'kick');
  }, [kickParams, playToMaster, recordEvent, ensureAudioContext]);
  
  const playSnare = React.useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(oscGain);
    playToMaster(oscGain);
    osc.start(now);
    osc.stop(now + 0.15);
    
    const bufLen = Math.floor(ctx.sampleRate * 0.2);
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    noise.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    noiseGain.gain.setValueAtTime(0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    noise.connect(filter);
    filter.connect(noiseGain);
    playToMaster(noiseGain);
    noise.start(now);
    
    recordEvent(0, 'snare');
  }, [playToMaster, recordEvent]);
  
  const playClap = React.useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    
    for (let i = 0; i < 4; i++) {
      const delay = i * 0.012;
      const bufLen = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufLen; j++) data[j] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      noise.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 1.5;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.5, now + delay + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
      noise.connect(filter);
      filter.connect(gain);
      playToMaster(gain);
      noise.start(now + delay);
    }
    recordEvent(0, 'clap');
  }, [playToMaster, recordEvent]);
  
  const playSnap = React.useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2500, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.01);
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 3;
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(filter);
    filter.connect(gain);
    playToMaster(gain);
    osc.start(now);
    osc.stop(now + 0.06);
    recordEvent(0, 'snap');
  }, [playToMaster, recordEvent]);
  
  const playHat = React.useCallback((open = false) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = open ? 0.25 : 0.05;
    
    const bufLen = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    const hp = ctx.createBiquadFilter();
    const bp = ctx.createBiquadFilter();
    noise.buffer = buffer;
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    bp.type = 'bandpass';
    bp.frequency.value = 10000;
    bp.Q.value = 1;
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    playToMaster(gain);
    noise.start(now);
    recordEvent(0, open ? 'open' : 'hat');
  }, [playToMaster, recordEvent]);
  
  const playTom = React.useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    playToMaster(gain);
    osc.start(now);
    osc.stop(now + 0.35);
    recordEvent(0, 'tom');
  }, [playToMaster, recordEvent]);
  
  const playPerc = React.useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 800;
    osc2.type = 'sine';
    osc2.frequency.value = 1200;
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    osc2.connect(gain);
    playToMaster(gain);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.1);
    osc2.stop(now + 0.1);
    recordEvent(0, 'perc');
  }, [playToMaster, recordEvent]);
  
  const drumMap = React.useMemo(() => ({
    kick: playKick, snare: playSnare, clap: playClap, snap: playSnap,
    hat: () => playHat(false), open: () => playHat(true), tom: playTom, perc: playPerc
  }), [playKick, playSnare, playClap, playSnap, playHat, playTom, playPerc]);
  
  // ═══════════════════════════════════════════════════════════════
  // BASS SYNTH (Psytrance/Hi-Tech)
  // ═══════════════════════════════════════════════════════════════
  const bassPresets = {
    squelch: { name: 'Squelch', osc: ['sawtooth', 'square'], detune: 5, cutoff: 600, reso: 22, sub: 0.2, drive: 0.4, filterEnv: true },
    psybass: { name: 'Psy Bass', osc: ['sawtooth', 'sawtooth'], detune: 10, cutoff: 1200, reso: 15, sub: 0.3, drive: 0.5, fm: true },
    hitech: { name: 'Hi-Tech', osc: ['square', 'sawtooth'], detune: 3, cutoff: 2000, reso: 12, sub: 0.1, drive: 0.6, filterEnv: true },
    dark: { name: 'Dark', osc: ['sawtooth', 'triangle'], detune: 20, cutoff: 400, reso: 8, sub: 0.6, drive: 0.3 },
    forest: { name: 'Forest', osc: ['sawtooth', 'sawtooth'], detune: 25, cutoff: 500, reso: 10, sub: 0.5, drive: 0.2, lfo: true },
    growl: { name: 'Growl', osc: ['sawtooth', 'square'], detune: 8, cutoff: 700, reso: 20, sub: 0.3, drive: 0.7, filterEnv: true },
    reese: { name: 'Reese', osc: ['sawtooth', 'sawtooth'], detune: 15, cutoff: 800, reso: 4, sub: 0.4, drive: 0 },
    acid: { name: 'Acid', osc: ['sawtooth', 'sawtooth'], detune: 0, cutoff: 400, reso: 18, sub: 0.1, drive: 0.3 },
    sub: { name: 'Sub', osc: ['sine', 'sine'], detune: 0, cutoff: 300, reso: 0, sub: 1, drive: 0 },
  };
  
  const playBass = React.useCallback((note, octave = bassOctave) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const notes = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
    const freq = 440 * Math.pow(2, (notes[note] + (octave - 4) * 12 - 9) / 12);
    const preset = bassPresets[bassPreset];
    const duration = 0.4;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = bassParams.reso;
    if (preset.filterEnv) {
      filter.frequency.setValueAtTime(bassParams.cutoff * 4, now);
      filter.frequency.exponentialRampToValueAtTime(bassParams.cutoff * 0.5, now + 0.1);
    } else {
      filter.frequency.value = bassParams.cutoff;
    }
    
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    const osc1 = ctx.createOscillator();
    osc1.type = preset.osc[0];
    osc1.frequency.value = freq;
    osc1.detune.value = -preset.detune;
    
    const osc2 = ctx.createOscillator();
    osc2.type = preset.osc[1];
    osc2.frequency.value = freq;
    osc2.detune.value = preset.detune;
    
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = freq / 2;
    const subGain = ctx.createGain();
    subGain.gain.value = bassParams.sub * 0.5;
    
    if (preset.fm) {
      const modOsc = ctx.createOscillator();
      const modGain = ctx.createGain();
      modOsc.type = 'sine';
      modOsc.frequency.value = freq * 2;
      modGain.gain.setValueAtTime(freq * 3, now);
      modGain.gain.exponentialRampToValueAtTime(freq * 0.2, now + 0.15);
      modOsc.connect(modGain);
      modGain.connect(osc1.frequency);
      modOsc.start(now);
      modOsc.stop(now + duration);
    }
    
    if (preset.lfo) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 6;
      lfoGain.gain.value = bassParams.cutoff * 0.4;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);
      lfo.stop(now + duration);
    }
    
    let outputNode = filter;
    if (bassParams.drive > 0) {
      const waveshaper = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i / 128) - 1;
        curve[i] = Math.tanh(x * (1 + bassParams.drive * 8));
      }
      waveshaper.curve = curve;
      filter.connect(waveshaper);
      outputNode = waveshaper;
    }
    
    osc1.connect(filter);
    osc2.connect(filter);
    subOsc.connect(subGain);
    subGain.connect(mainGain);
    outputNode.connect(mainGain);
    playToMaster(mainGain);
    
    osc1.start(now);
    osc2.start(now);
    subOsc.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    subOsc.stop(now + duration);
  }, [bassOctave, bassPreset, bassParams, playToMaster]);
  
  // ═══════════════════════════════════════════════════════════════
  // PIANO
  // ═══════════════════════════════════════════════════════════════
  const noteFreqs = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
    'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
    'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66,
    'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
  };
  
  const playPiano = React.useCallback((note) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const freq = noteFreqs[note];
    if (!freq) return;
    
    const harmonics = [1, 2, 3, 4, 5, 6];
    const amps = [0.4, 0.2, 0.1, 0.08, 0.04, 0.02];
    
    harmonics.forEach((h, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * h;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(amps[idx], now + 0.01);
      gain.gain.exponentialRampToValueAtTime(amps[idx] * 0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
      osc.connect(gain);
      playToMaster(gain);
      osc.start(now);
      osc.stop(now + 2.5);
    });
    
    recordEvent(1, note);
  }, [playToMaster, recordEvent]);
  
  // ═══════════════════════════════════════════════════════════════
  // PAD SYNTH
  // ═══════════════════════════════════════════════════════════════
  const chords = {
    'Cm': [261.63, 311.13, 392.00],
    'Fm': [349.23, 415.30, 523.25],
    'Ab': [415.30, 523.25, 622.25],
    'Gm': [392.00, 466.16, 587.33],
    'Eb': [311.13, 392.00, 466.16],
    'Bb': [466.16, 587.33, 698.46]
  };
  
  const playPad = React.useCallback((chord) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = chords[chord];
    if (!notes) return;
    
    notes.forEach(freq => {
      for (let d = -2; d <= 2; d++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq * Math.pow(2, d * 0.002);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
        gain.gain.setValueAtTime(0.06, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3);
        osc.connect(gain);
        playToMaster(gain);
        osc.start(now);
        osc.stop(now + 3.5);
      }
    });
    
    recordEvent(2, chord);
  }, [playToMaster, recordEvent]);
  
  // ═══════════════════════════════════════════════════════════════
  // LEAD SYNTH
  // ═══════════════════════════════════════════════════════════════
  const playLead = React.useCallback((note) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const freq = noteFreqs[note];
    if (!freq) return;
    
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = leadWave;
    osc2.type = leadWave;
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 1.005;
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(8000, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
    filter.Q.value = 2;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.setValueAtTime(0.25, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    playToMaster(gain);
    
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1);
    osc2.stop(now + 1);
    
    recordEvent(3, note);
  }, [leadWave, playToMaster, recordEvent]);
  
  // ═══════════════════════════════════════════════════════════════
  // LOOPER
  // ═══════════════════════════════════════════════════════════════
  const startRecording = React.useCallback(() => {
    if (!audioReady) return;
    setIsRecording(true);
    recordingRef.current = true;
    loopStartRef.current = Date.now();
    setTimeout(() => {
      setIsRecording(false);
      recordingRef.current = false;
    }, loopLength);
  }, [audioReady]);
  
  const triggerSound = React.useCallback((track, sound) => {
    switch(track) {
      case 0: if (drumMap[sound]) drumMap[sound](); break;
      case 1: playPiano(sound); break;
      case 2: playPad(sound); break;
      case 3: playLead(sound); break;
    }
  }, [drumMap, playPiano, playPad, playLead]);
  
  const playLoop = React.useCallback(() => {
    if (isLoopPlaying) return;
    if (loopTracks.every(t => t.length === 0)) return;
    
    setIsLoopPlaying(true);
    const playStart = Date.now();
    
    loopIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - playStart) % loopLength;
      const lastElapsed = (elapsed - 16 + loopLength) % loopLength;
      setPlayheadPos((elapsed / loopLength) * 100);
      
      loopTracks.forEach((track, trackIdx) => {
        track.forEach(evt => {
          if ((lastElapsed < evt.time && evt.time <= elapsed) ||
              (lastElapsed > elapsed && (evt.time <= elapsed || evt.time > lastElapsed))) {
            triggerSound(trackIdx, evt.sound);
          }
        });
      });
    }, 16);
  }, [isLoopPlaying, loopTracks, triggerSound]);
  
  const stopLoop = React.useCallback(() => {
    setIsLoopPlaying(false);
    setIsRecording(false);
    recordingRef.current = false;
    setPlayheadPos(0);
    if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
  }, []);
  
  const clearLoopTracks = React.useCallback(() => {
    stopLoop();
    setLoopTracks([[], [], [], []]);
  }, [stopLoop]);
  
  // ═══════════════════════════════════════════════════════════════
  // SEQUENCER
  // ═══════════════════════════════════════════════════════════════
  const playTrack = React.useCallback((trackIndex) => {
    const track = tracks[trackIndex];
    if (!track) return;
    switch (track.name) {
      case 'KICK': playKick(); break;
      case 'SNARE': playSnare(); break;
      case 'CLAP': playClap(); break;
      case 'HAT': playHat(false); break;
      case 'OPEN': playHat(true); break;
      case 'C': playBass('C'); break;
      case 'D': playBass('D'); break;
      case 'E': playBass('E'); break;
      case 'F': playBass('F'); break;
      case 'G': playBass('G'); break;
      case 'C4': playPiano('C4'); break;
      case 'E4': playPiano('E4'); break;
      case 'G4': playPiano('G4'); break;
      case 'Cm': playPad('Cm'); break;
      case 'Fm': playPad('Fm'); break;
      case 'L-C4': playLead('C4'); break;
      case 'L-E4': playLead('E4'); break;
    }
  }, [playKick, playSnare, playClap, playHat, playBass, playPiano, playPad, playLead, tracks]);
  
  const toggleStep = React.useCallback((trackIndex, stepIndex) => {
    setTracks(prev => {
      const newTracks = [...prev];
      newTracks[trackIndex] = { ...newTracks[trackIndex], steps: [...newTracks[trackIndex].steps] };
      newTracks[trackIndex].steps[stepIndex] = !newTracks[trackIndex].steps[stepIndex];
      if (newTracks[trackIndex].steps[stepIndex]) playTrack(trackIndex);
      return newTracks;
    });
  }, [playTrack]);
  
  const toggleMute = React.useCallback((trackIndex) => {
    setTracks(prev => {
      const newTracks = [...prev];
      newTracks[trackIndex] = { ...newTracks[trackIndex], muted: !newTracks[trackIndex].muted };
      return newTracks;
    });
  }, []);
  
  const startSequencer = React.useCallback(() => {
    if (!audioReady) return;
    setSeqPlaying(true);
    const totalSteps = bars * 4;
    const stepTime = (60 / bpm) / 4;
    let step = 0;
    
    playIntervalRef.current = setInterval(() => {
      setCurrentStep(step);
      setCurrentBar(Math.floor(step / 4));
      // Use tracksRef to get current state, not closure
      const currentTracks = tracksRef.current;
      currentTracks.forEach((track, idx) => {
        if (track.steps[step] && !track.muted) playTrack(idx);
      });
      step = (step + 1) % totalSteps;
    }, stepTime * 1000);
  }, [audioReady, bars, bpm, playTrack]);
  
  const stopSequencer = React.useCallback(() => {
    setSeqPlaying(false);
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    setCurrentStep(0);
  }, []);
  
  const loadPreset = React.useCallback((preset) => {
    const patterns = {
      basic: { 0: [0,4,8,12], 1: [4,12], 3: [0,2,4,6,8,10,12,14], 5: [0,8] },
      psy: { 0: [0,4,8,12], 3: [0,1,2,3,4,5,6,7,8,10,11,12,13,14,15], 5: [0], 6: [4], 7: [8], 8: [12] },
      hitech: { 0: [0,2,4,6,8,10,12,14], 3: [1,3,5,7,9,11,13,15], 2: [4,12], 5: [0,3], 7: [6,9], 9: [12,15] },
    };
    const p = patterns[preset];
    if (!p) return;
    setTracks(prev => {
      const newTracks = prev.map(t => ({ ...t, steps: new Array(bars * 4).fill(false) }));
      Object.entries(p).forEach(([trackIdx, steps]) => {
        steps.forEach(s => { if (s < bars * 4) newTracks[parseInt(trackIdx)].steps[s] = true; });
      });
      return newTracks;
    });
  }, [bars]);
  
  React.useEffect(() => {
    setTracks(prev => prev.map(t => ({ ...t, steps: new Array(bars * 4).fill(false) })));
    setCurrentBar(0);
  }, [bars]);
  
  // Keep tracksRef in sync with tracks state
  React.useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);
  
  React.useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
    };
  }, []);
  
  // ═══════════════════════════════════════════════════════════════
  // DATA
  // ═══════════════════════════════════════════════════════════════
  const drumPads = [
    { id: 'kick', name: 'Kick', icon: '●', color: '#ff3b5c', play: playKick },
    { id: 'snare', name: 'Snare', icon: '◐', color: '#ff8c42', play: playSnare },
    { id: 'clap', name: 'Clap', icon: '◈', color: '#fbbf24', play: playClap },
    { id: 'snap', name: 'Snap', icon: '◇', color: '#22c55e', play: playSnap },
    { id: 'hat', name: 'Hi-Hat', icon: '△', color: '#22d3ee', play: () => playHat(false) },
    { id: 'open', name: 'Open', icon: '▽', color: '#3b82f6', play: () => playHat(true) },
    { id: 'tom', name: 'Tom', icon: '○', color: '#a855f7', play: playTom },
    { id: 'perc', name: 'Perc', icon: '✦', color: '#ec4899', play: playPerc },
  ];
  
  const padChords = [
    { chord: 'Cm', name: 'C Minor', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { chord: 'Fm', name: 'F Minor', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
    { chord: 'Ab', name: 'A Flat', gradient: 'linear-gradient(135deg, #14b8a6, #22d3ee)' },
    { chord: 'Gm', name: 'G Minor', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
    { chord: 'Eb', name: 'E Flat', gradient: 'linear-gradient(135deg, #22c55e, #84cc16)' },
    { chord: 'Bb', name: 'B Flat', gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)' },
  ];
  
  const pianoKeys = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const blackKeys = ['C#3', 'D#3', null, 'F#3', 'G#3', 'A#3', null, 'C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null];
  const leadNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const bassNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const startStep = currentBar * 4;
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="loop-studio" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif", background: '#0c0c10', color: '#f0f0f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: isTablet ? '1400px' : '500px', margin: '0 auto', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Start Screen */}
      {!audioReady && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, gap: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #ff3b5c, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LOOP STUDIO</div>
          <button onClick={initAudio} style={{ padding: '20px 48px', background: 'linear-gradient(135deg, #ff3b5c, #a855f7)', border: 'none', borderRadius: 16, color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>TAP TO START</button>
          <div style={{ fontSize: 13, color: '#8888a0' }}>⚠️ iPhone: Turn OFF silent mode</div>
        </div>
      )}
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#16161c', borderBottom: '1px solid #333340', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #ff3b5c, #a855f7)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>L</div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>LOOP STUDIO</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={saveSession} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, background: '#22c55e', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>💾 Save</button>
            <button onClick={loadSession} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>📂 Load</button>
            <button onClick={downloadSession} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>⬇️ Export</button>
            <button onClick={triggerFileUpload} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, background: '#f59e0b', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>⬆️ Import</button>
            {isTablet && <button onClick={clearSession} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, background: '#ff3b5c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>🗑️ New</button>}
          </div>
          <div style={{ background: '#1e1e26', padding: '6px 12px', borderRadius: 16, fontSize: 13, fontWeight: 600, color: '#22c55e' }}>{bpm} BPM</div>
          <input type="range" min="60" max="180" value={bpm} onChange={e => setBpm(parseInt(e.target.value))} style={{ width: 80 }} />
        </div>
        {/* Hidden file input */}
        <input
          ref={uploadSessionRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </header>
      
      {/* Looper */}
      <section style={{ background: '#16161c', borderBottom: '1px solid #333340', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#8888a0', textTransform: 'uppercase', letterSpacing: 1 }}>Loop Recorder</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={isRecording ? () => { setIsRecording(false); recordingRef.current = false; } : startRecording} style={{ width: 36, height: 36, borderRadius: '50%', border: isRecording ? 'none' : '2px solid #ff3b5c', background: isRecording ? '#ff3b5c' : '#1e1e26', color: isRecording ? '#fff' : '#ff3b5c', cursor: 'pointer', fontSize: 16, animation: isRecording ? 'pulse 0.5s infinite' : 'none' }}>●</button>
            <button onClick={isLoopPlaying ? stopLoop : playLoop} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: isLoopPlaying ? '#fbbf24' : '#22c55e', color: '#000', cursor: 'pointer', fontSize: 16 }}>{isLoopPlaying ? '⏸' : '▶'}</button>
            <button onClick={stopLoop} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#1e1e26', color: '#f0f0f5', cursor: 'pointer', fontSize: 16 }}>■</button>
            <button onClick={clearLoopTracks} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#1e1e26', color: '#ff8c42', cursor: 'pointer', fontSize: 12 }}>CLR</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['DRUMS', 'KEYS', 'PADS', 'LEAD'].map((label, idx) => (
            <div key={label} style={{ flex: 1, height: 40, background: '#1e1e26', borderRadius: 8, position: 'relative', border: `2px solid ${isRecording ? '#ff3b5c' : loopTracks[idx].length ? '#333340' : 'transparent'}` }}>
              <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 9, fontWeight: 600, color: '#8888a0', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, background: '#f0f0f5', left: `${playheadPos}%`, transition: 'left 0.05s linear' }} />
            </div>
          ))}
        </div>
      </section>
      
      {/* Tabs */}
      <nav style={{ display: 'flex', background: '#16161c', borderBottom: '1px solid #333340', padding: '0 8px', overflowX: 'auto' }}>
        {['drums', 'bass', 'piano', 'pads', 'lead', 'sampler', 'seq', 'fx', 'mixer', 'lfo'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: '0 0 auto', padding: '12px 16px', background: 'none', border: 'none', color: activeTab === tab ? '#f0f0f5' : '#8888a0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, cursor: 'pointer', borderBottom: `2px solid ${activeTab === tab ? '#ff3b5c' : 'transparent'}`, whiteSpace: 'nowrap' }}>
            {tab === 'seq' ? '▦ Seq' : tab === 'fx' ? '🎚️ FX' : tab === 'mixer' ? '🎛️ Mix' : tab === 'sampler' ? '🎵 Sampler' : tab === 'lfo' ? '🌊 LFO' : tab}
          </button>
        ))}
      </nav>
      
      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {/* DRUMS */}
        {activeTab === 'drums' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: isTablet ? 12 : 8 }}>
              {drumPads.map(pad => (
                <button 
                  key={pad.id} 
                  onClick={pad.play} 
                  style={{ 
                    aspectRatio: 1, 
                    background: `linear-gradient(135deg, rgba(22, 22, 28, 0.6), rgba(30, 30, 38, 0.8))`, 
                    border: `3px solid ${pad.color}`, 
                    borderRadius: 16, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 4, 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${pad.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`;
                    e.currentTarget.style.background = `linear-gradient(135deg, ${pad.color}20, rgba(30, 30, 38, 0.9))`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(22, 22, 28, 0.6), rgba(30, 30, 38, 0.8))';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  }}
                >
                  <span style={{ fontSize: isTablet ? 32 : 24, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>{pad.icon}</span>
                  <span style={{ fontSize: isTablet ? 12 : 10, fontWeight: 700, textTransform: 'uppercase', color: pad.color, letterSpacing: 1, textShadow: `0 0 10px ${pad.color}80` }}>{pad.name}</span>
                </button>
              ))}
            </div>
            <div style={{ background: '#16161c', borderRadius: 12, padding: 16, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#8888a0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, background: '#ff3b5c', borderRadius: '50%' }} />Kick Synth
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                {[{ key: 'sub', label: 'Sub', min: 0, max: 100 }, { key: 'punch', label: 'Punch', min: 0, max: 100 }, { key: 'click', label: 'Click', min: 0, max: 100 }, { key: 'noise', label: 'Noise', min: 0, max: 100 }].map(p => (
                  <div key={p.key} style={{ textAlign: 'center' }}>
                    <input type="range" min={p.min} max={p.max} value={kickParams[p.key] * 100} onChange={e => setKickParams(prev => ({ ...prev, [p.key]: parseInt(e.target.value) / 100 }))} style={{ width: '100%' }} />
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#8888a0', textTransform: 'uppercase', marginTop: 4 }}>{p.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#f0f0f5' }}>{Math.round(kickParams[p.key] * 100)}%</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #333340', paddingTop: 16, marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#8888a0', textTransform: 'uppercase', marginBottom: 12 }}>Envelope & Pitch</div>
                <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 12 }}>
                  {[
                    { key: 'attack', label: 'Attack', min: 0.001, max: 0.05, step: 0.001, unit: 'ms', mult: 1000 },
                    { key: 'decay', label: 'Decay', min: 0.1, max: 1, step: 0.01, unit: 'ms', mult: 1000 },
                    { key: 'pitchDecay', label: 'Pitch Dec', min: 0.01, max: 0.2, step: 0.01, unit: 'ms', mult: 1000 },
                    { key: 'pitchStart', label: 'Pitch Start', min: 50, max: 300, step: 1, unit: 'Hz', mult: 1 },
                    { key: 'pitchEnd', label: 'Pitch End', min: 20, max: 100, step: 1, unit: 'Hz', mult: 1 }
                  ].map(p => (
                    <div key={p.key} style={{ textAlign: 'center' }}>
                      <input 
                        type="range" 
                        min={p.min} 
                        max={p.max} 
                        step={p.step} 
                        value={kickParams[p.key]} 
                        onChange={e => setKickParams(prev => ({ ...prev, [p.key]: parseFloat(e.target.value) }))} 
                        style={{ width: '100%' }} 
                      />
                      <div style={{ fontSize: 9, fontWeight: 600, color: '#8888a0', textTransform: 'uppercase', marginTop: 4 }}>{p.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#f0f0f5' }}>{(kickParams[p.key] * p.mult).toFixed(p.mult === 1 ? 0 : 1)}{p.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* BASS */}
        {activeTab === 'bass' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16, padding: 12, background: '#16161c', borderRadius: 12 }}>
              <button onClick={() => bassOctave > 1 && setBassOctave(bassOctave - 1)} style={{ width: 50, height: 50, fontSize: 24, fontWeight: 700, background: '#1e1e26', color: '#fff', border: '2px solid #333340', borderRadius: 10, cursor: 'pointer' }}>−</button>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#a855f7', minWidth: 80, textAlign: 'center' }}>OCT {bassOctave}</div>
              <button onClick={() => bassOctave < 4 && setBassOctave(bassOctave + 1)} style={{ width: 50, height: 50, fontSize: 24, fontWeight: 700, background: '#1e1e26', color: '#fff', border: '2px solid #333340', borderRadius: 10, cursor: 'pointer' }}>+</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {Object.entries(bassPresets).map(([key, preset]) => (
                <button key={key} onClick={() => { setBassPreset(key); setBassParams({ cutoff: preset.cutoff, reso: preset.reso, sub: preset.sub, drive: preset.drive }); }} style={{ padding: '14px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: bassPreset === key ? '#a855f7' : '#1e1e26', color: bassPreset === key ? '#fff' : '#8888a0', border: `2px solid ${bassPreset === key ? '#a855f7' : '#333340'}`, borderRadius: 10, cursor: 'pointer' }}>{preset.name}</button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: 12, background: '#16161c', borderRadius: 12, marginBottom: 16, overflowX: 'auto' }}>
              {bassNotes.map(n => (
                <button key={n} onClick={() => playBass(n)} style={{ width: n.includes('#') ? 32 : 40, height: n.includes('#') ? 60 : 80, flexShrink: 0, background: n.includes('#') ? 'linear-gradient(180deg, #343a40 0%, #1a1a2e 100%)' : 'linear-gradient(180deg, #f8f9fa 0%, #dee2e6 100%)', color: n.includes('#') ? '#adb5bd' : '#1a1a2e', border: `1px solid ${n.includes('#') ? '#495057' : '#ced4da'}`, borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, margin: n.includes('#') ? '0 -10px' : 0, zIndex: n.includes('#') ? 1 : 0 }}>{n}</button>
              ))}
            </div>
            <div style={{ background: '#16161c', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {[{ key: 'cutoff', label: 'Cutoff', min: 100, max: 8000, pct: false }, { key: 'reso', label: 'Reso', min: 0, max: 25, pct: false }, { key: 'sub', label: 'Sub', min: 0, max: 100, pct: true }, { key: 'drive', label: 'Drive', min: 0, max: 100, pct: true }].map(p => (
                  <div key={p.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                      <span>{p.label}</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{p.pct ? Math.round(bassParams[p.key] * 100) + '%' : bassParams[p.key]}</span>
                    </div>
                    <input type="range" min={p.min} max={p.max} value={p.pct ? bassParams[p.key] * 100 : bassParams[p.key]} onChange={e => setBassParams(prev => ({ ...prev, [p.key]: p.pct ? parseInt(e.target.value) / 100 : parseInt(e.target.value) }))} style={{ width: '100%' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* PIANO */}
        {activeTab === 'piano' && (
          <div style={{ background: '#16161c', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', height: isTablet ? 180 : 140, position: 'relative' }}>
              {pianoKeys.map(note => (
                <button key={note} onClick={() => playPiano(note)} style={{ flex: 1, background: 'linear-gradient(180deg, #fff 0%, #e8e8e8 100%)', border: '1px solid #bbb', borderRadius: '0 0 6px 6px', margin: '0 1px', cursor: 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8, fontSize: 10, color: '#666', fontWeight: 600 }}>{note.replace(/\d/, '')}</button>
              ))}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: isTablet ? 120 : 85, display: 'flex', pointerEvents: 'none' }}>
                {blackKeys.map((note, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                    {note && <button onClick={() => playPiano(note)} style={{ width: '70%', maxWidth: 28, background: 'linear-gradient(180deg, #444 0%, #111 100%)', borderRadius: '0 0 4px 4px', cursor: 'pointer', pointerEvents: 'auto', border: 'none' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* PADS */}
        {activeTab === 'pads' && (
          <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 12 }}>
            {padChords.map(pad => (
              <button key={pad.chord} onClick={() => playPad(pad.chord)} style={{ aspectRatio: 1.5, background: pad.gradient, border: 'none', borderRadius: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{pad.chord}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{pad.name}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* LEAD */}
        {activeTab === 'lead' && (
          <div style={{ background: '#16161c', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#8888a0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Waveform</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['sawtooth', 'square', 'sine', 'triangle'].map(wave => (
                <button key={wave} onClick={() => setLeadWave(wave)} style={{ flex: 1, padding: 10, background: leadWave === wave ? '#a855f7' : '#1e1e26', border: `1px solid ${leadWave === wave ? '#a855f7' : '#333340'}`, borderRadius: 8, color: leadWave === wave ? '#fff' : '#8888a0', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>{wave.slice(0, 3)}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {leadNotes.map(note => (
                <button key={note} onClick={() => playLead(note)} style={{ aspectRatio: 1, background: '#1e1e26', border: '2px solid #333340', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#f0f0f5' }}>{note}</button>
              ))}
            </div>
          </div>
        )}
        
        {/* SEQUENCER */}
        {activeTab === 'seq' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <select value={bars} onChange={e => { stopSequencer(); setBars(parseInt(e.target.value)); }} style={{ padding: '10px 14px', fontSize: 14, background: '#1e1e26', color: '#fff', border: '1px solid #333340', borderRadius: 8 }}>
                <option value="1">1 Bar</option>
                <option value="2">2 Bars</option>
                <option value="4">4 Bars</option>
              </select>
              <select onChange={e => e.target.value && loadPreset(e.target.value)} style={{ padding: '10px 14px', fontSize: 14, background: '#1e1e26', color: '#fff', border: '1px solid #333340', borderRadius: 8 }}>
                <option value="">Preset...</option>
                <option value="basic">Basic</option>
                <option value="psy">Psytrance</option>
                <option value="hitech">Hi-Tech</option>
              </select>
              <button onClick={() => setTracks(prev => prev.map(t => ({ ...t, steps: new Array(bars * 4).fill(false) })))} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, background: 'transparent', color: '#ff3b5c', border: '2px solid #ff3b5c', borderRadius: 8, cursor: 'pointer', marginLeft: 'auto' }}>Clear</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16, padding: 12, background: '#16161c', borderRadius: 12 }}>
              {!isTablet && <button onClick={() => setCurrentBar((currentBar - 1 + bars) % bars)} style={{ width: 50, height: 50, fontSize: 22, fontWeight: 700, background: '#1e1e26', color: '#fff', border: '2px solid #333340', borderRadius: 10, cursor: 'pointer' }}>◀</button>}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                  Bar {currentBar + 1} of {bars}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {Array.from({ length: bars }, (_, i) => (
                    <button key={i} onClick={() => setCurrentBar(i)} style={{ width: 14, height: 14, background: i === currentBar ? '#ff3b5c' : '#333340', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: i === currentBar ? '0 0 10px #ff3b5c' : 'none' }} />
                  ))}
                </div>
              </div>
              {!isTablet && <button onClick={() => setCurrentBar((currentBar + 1) % bars)} style={{ width: 50, height: 50, fontSize: 22, fontWeight: 700, background: '#1e1e26', color: '#fff', border: '2px solid #333340', borderRadius: 10, cursor: 'pointer' }}>▶</button>}
            </div>
            {['drums', 'bass', 'piano', 'pads', 'lead'].map(group => (
              <div key={group} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8888a0', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 0' }}>
                  {group === 'drums' ? '🥁 Drums' : group === 'bass' ? '🔊 Bass' : group === 'piano' ? '🎹 Piano' : group === 'pads' ? '🎸 Pads' : '🎤 Lead'}
                </div>
                {tracks.filter(t => t.group === group).map(track => {
                  const trackIdx = tracks.findIndex(t => t.name === track.name);
                  return (
                    <div key={track.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 50, fontSize: 11, fontWeight: 700, textAlign: 'right', flexShrink: 0, color: track.color }}>{track.name}</div>
                      <button onClick={() => toggleMute(trackIdx)} style={{ width: 34, height: 34, fontSize: 11, fontWeight: 700, background: track.muted ? '#ff3b5c' : '#1e1e26', color: track.muted ? '#fff' : '#8888a0', border: `1px solid ${track.muted ? '#ff3b5c' : '#333340'}`, borderRadius: 6, cursor: 'pointer', flexShrink: 0 }}>M</button>
                      <div style={{ display: 'flex', gap: isTablet ? 4 : 8, flex: 1 }}>
                        {(isTablet ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 2, 3]).map(i => {
                          const stepIdx = startStep + i;
                          const isActive = track.steps[stepIdx];
                          const isPlayingStep = seqPlaying && currentStep === stepIdx;
                          return (
                            <button key={i} onClick={() => toggleStep(trackIdx, stepIdx)} style={{ flex: 1, aspectRatio: 1, minHeight: isTablet ? 36 : 44, background: isActive ? track.color : '#1e1e26', border: `3px solid ${isActive ? track.color : '#333340'}`, borderRadius: isTablet ? 6 : 10, cursor: 'pointer', transform: isPlayingStep ? 'scale(1.05)' : 'none', boxShadow: isPlayingStep ? `0 0 15px ${track.color}` : 'none', transition: 'transform 0.05s' }} />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <button onClick={seqPlaying ? stopSequencer : startSequencer} style={{ padding: '18px 60px', fontSize: 18, fontWeight: 700, background: seqPlaying ? '#fbbf24' : '#22c55e', color: '#000', border: 'none', borderRadius: 14, cursor: 'pointer' }}>{seqPlaying ? '■ STOP' : '▶ PLAY'}</button>
            </div>
          </div>
        )}
        
        {/* FX */}
        {activeTab === 'fx' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24 }}>🔊</span> DELAY
              </div>
              <div style={{ background: '#16161c', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(3, 1fr)' : '1fr', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                      <span>Time</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{(fxParams.delayTime * 1000).toFixed(0)}ms</span>
                    </div>
                    <input type="range" min="0.1" max="1" step="0.01" value={fxParams.delayTime} onChange={e => {
                      const val = parseFloat(e.target.value);
                      setFxParams(prev => ({ ...prev, delayTime: val }));
                      if (delayNodeRef.current) delayNodeRef.current.delayTime.value = val;
                    }} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                      <span>Feedback</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(fxParams.delayFeedback * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="0.95" step="0.01" value={fxParams.delayFeedback} onChange={e => {
                      const val = parseFloat(e.target.value);
                      setFxParams(prev => ({ ...prev, delayFeedback: val }));
                      if (delayFeedbackRef.current) delayFeedbackRef.current.gain.value = val;
                    }} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                      <span>Mix (Wet)</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(fxParams.delayMix * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={fxParams.delayMix} onChange={e => {
                      const val = parseFloat(e.target.value);
                      setFxParams(prev => ({ ...prev, delayMix: val }));
                      if (delayMixRef.current) delayMixRef.current.gain.value = val;
                    }} style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24 }}>✨</span> REVERB
              </div>
              <div style={{ background: '#16161c', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : '1fr', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                      <span>Mix (Wet)</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(fxParams.reverbMix * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={fxParams.reverbMix} onChange={e => {
                      const val = parseFloat(e.target.value);
                      setFxParams(prev => ({ ...prev, reverbMix: val }));
                      if (reverbMixRef.current) reverbMixRef.current.gain.value = val;
                    }} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                      <span>Decay</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{fxParams.reverbDecay.toFixed(1)}s</span>
                    </div>
                    <input type="range" min="0.5" max="5" step="0.1" value={fxParams.reverbDecay} onChange={e => {
                      setFxParams(prev => ({ ...prev, reverbDecay: parseFloat(e.target.value) }));
                      // Note: Reverb decay requires rebuilding the impulse response
                      // For real-time, we'd need a different reverb implementation
                    }} style={{ width: '100%' }} disabled={true} />
                    <div style={{ fontSize: 10, color: '#ff8c42', marginTop: 4 }}>⚠️ Requires restart to change</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ background: '#1e1e26', borderRadius: 12, padding: 16, marginTop: 24 }}>
              <div style={{ fontSize: 12, color: '#8888a0', lineHeight: 1.5 }}>
                <strong style={{ color: '#fff' }}>💡 How FX Work:</strong><br/>
                • <strong>Delay Mix</strong>: Set to 0% to disable delay (dry signal only)<br/>
                • <strong>Reverb Mix</strong>: Set to 0% to disable reverb<br/>
                • Each instrument has its own FX send amount (adjust in Mixer tab)<br/>
                • Higher feedback = longer delay repeats (watch out for runaway feedback!)
              </div>
            </div>
          </div>
        )}
        
        {/* MIXER */}
        {activeTab === 'mixer' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>
                🎛️ MASTER
              </div>
              <div style={{ background: '#16161c', borderRadius: 12, padding: 16 }}>
                <div style={{ maxWidth: 400 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                    <span>Volume</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(mixer.master.volume * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={mixer.master.volume} onChange={e => {
                    const val = parseFloat(e.target.value);
                    setMixer(prev => ({ ...prev, master: { volume: val } }));
                    if (masterGainRef.current) masterGainRef.current.gain.value = val;
                  }} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
            
            {Object.entries(mixer).filter(([key]) => key !== 'master').map(([inst, params]) => (
              <div key={inst} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f5', marginBottom: 12, textTransform: 'capitalize' }}>
                  {inst === 'drums' ? '🥁' : inst === 'bass' ? '🔊' : inst === 'piano' ? '🎹' : inst === 'pads' ? '🎸' : '🎤'} {inst.toUpperCase()}
                </div>
                <div style={{ background: '#16161c', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : '1fr', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                        <span>Volume</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(params.volume * 100)}%</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.01" value={params.volume} onChange={e => {
                        setMixer(prev => ({ ...prev, [inst]: { ...prev[inst], volume: parseFloat(e.target.value) } }));
                      }} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                        <span>Pan</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{params.pan > 0 ? `R${Math.round(params.pan * 100)}` : params.pan < 0 ? `L${Math.round(Math.abs(params.pan) * 100)}` : 'C'}</span>
                      </div>
                      <input type="range" min="-1" max="1" step="0.01" value={params.pan} onChange={e => {
                        setMixer(prev => ({ ...prev, [inst]: { ...prev[inst], pan: parseFloat(e.target.value) } }));
                      }} style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : '1fr', gap: 16, marginTop: 16 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                        <span>Delay Send</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(params.delaySend * 100)}%</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.01" value={params.delaySend} onChange={e => {
                        setMixer(prev => ({ ...prev, [inst]: { ...prev[inst], delaySend: parseFloat(e.target.value) } }));
                      }} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                        <span>Reverb Send</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(params.reverbSend * 100)}%</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.01" value={params.reverbSend} onChange={e => {
                        setMixer(prev => ({ ...prev, [inst]: { ...prev[inst], reverbSend: parseFloat(e.target.value) } }));
                      }} style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div style={{ background: '#1e1e26', borderRadius: 12, padding: 16, marginTop: 24 }}>
              <div style={{ fontSize: 12, color: '#8888a0', lineHeight: 1.5 }}>
                <strong style={{ color: '#fff' }}>💡 Mixer Tips:</strong><br/>
                • <strong>Pan</strong>: L = Left, C = Center, R = Right stereo positioning<br/>
                • <strong>FX Sends</strong>: Control how much signal goes to delay/reverb<br/>
                • Set sends to 0% to keep instrument completely dry<br/>
                • Note: Per-instrument volume/pan will be fully implemented in next update
              </div>
            </div>
          </div>
        )}
        
        {/* SAMPLER */}
        {activeTab === 'sampler' && (
          <div>
            <div style={{ background: '#16161c', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>
                📁 Load Sample
              </div>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    try {
                      const ctx = audioCtxRef.current;
                      if (!ctx) return;
                      const arrayBuffer = ev.target.result;
                      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                      setSamplerBuffer(audioBuffer);
                      alert('✅ Sample loaded successfully!');
                    } catch (err) {
                      console.error('Failed to load sample:', err);
                      alert('❌ Failed to load sample');
                    }
                  };
                  reader.readAsArrayBuffer(file);
                }}
                style={{ width: '100%', padding: 12, background: '#1e1e26', color: '#f0f0f5', border: '2px solid #333340', borderRadius: 8, cursor: 'pointer' }}
              />
              {samplerBuffer && (
                <div style={{ marginTop: 12, padding: 12, background: '#1e1e26', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>✅ Sample Loaded</div>
                    <div style={{ fontSize: 10, color: '#8888a0', marginTop: 4 }}>
                      Duration: {samplerBuffer.duration.toFixed(2)}s | 
                      Rate: {samplerBuffer.sampleRate}Hz | 
                      Channels: {samplerBuffer.numberOfChannels}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (!audioCtxRef.current || !samplerBuffer) return;
                      const ctx = audioCtxRef.current;
                      const source = ctx.createBufferSource();
                      source.buffer = samplerBuffer;
                      source.playbackRate.value = samplerParams.speed * Math.pow(2, samplerParams.pitch / 12);
                      const gain = ctx.createGain();
                      gain.gain.value = 0.7;
                      source.connect(gain);
                      playToMaster(gain);
                      source.start(0);
                    }}
                    style={{ padding: '8px 16px', background: '#22c55e', color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    ▶ Play
                  </button>
                </div>
              )}
            </div>
            
            {samplerBuffer && (
              <>
                <div style={{ background: '#16161c', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>🎛️ Playback Controls</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : '1fr', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                        <span>Pitch</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{samplerParams.pitch > 0 ? '+' : ''}{samplerParams.pitch} semitones</span>
                      </div>
                      <input 
                        type="range" 
                        min="-24" 
                        max="24" 
                        step="1" 
                        value={samplerParams.pitch} 
                        onChange={e => setSamplerParams(prev => ({ ...prev, pitch: parseInt(e.target.value) }))} 
                        style={{ width: '100%' }} 
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                        <span>Speed</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{samplerParams.speed.toFixed(2)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.25" 
                        max="2" 
                        step="0.05" 
                        value={samplerParams.speed} 
                        onChange={e => setSamplerParams(prev => ({ ...prev, speed: parseFloat(e.target.value) }))} 
                        style={{ width: '100%' }} 
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={samplerParams.reverse} 
                        onChange={e => setSamplerParams(prev => ({ ...prev, reverse: e.target.checked }))} 
                      />
                      <span style={{ fontSize: 12, color: '#f0f0f5' }}>Reverse</span>
                    </label>
                  </div>
                </div>
                
                <div style={{ background: '#16161c', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>📊 ADSR Envelope</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: 16 }}>
                    {[
                      { key: 'attack', label: 'Attack', min: 0.001, max: 2, step: 0.01, unit: 's' },
                      { key: 'decay', label: 'Decay', min: 0.01, max: 2, step: 0.01, unit: 's' },
                      { key: 'sustain', label: 'Sustain', min: 0, max: 1, step: 0.01, unit: '%', mult: 100 },
                      { key: 'release', label: 'Release', min: 0.01, max: 3, step: 0.01, unit: 's' }
                    ].map(p => (
                      <div key={p.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                          <span>{p.label}</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>
                            {p.mult ? Math.round(samplerParams[p.key] * p.mult) : samplerParams[p.key].toFixed(2)}{p.unit}
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min={p.min} 
                          max={p.max} 
                          step={p.step} 
                          value={samplerParams[p.key]} 
                          onChange={e => setSamplerParams(prev => ({ ...prev, [p.key]: parseFloat(e.target.value) }))} 
                          style={{ width: '100%' }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {!samplerBuffer && (
              <div style={{ background: '#1e1e26', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f5', marginBottom: 8 }}>No Sample Loaded</div>
                <div style={{ fontSize: 12, color: '#8888a0', lineHeight: 1.6 }}>
                  Load a sample to start:<br/>
                  • WAV, MP3, OGG supported<br/>
                  • Adjust pitch (-24 to +24 semitones)<br/>
                  • Control speed (0.25x to 2x)<br/>
                  • Reverse playback<br/>
                  • Shape with ADSR envelope
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* LFO */}
        {activeTab === 'lfo' && (
          <div>
            {lfoParams.map((lfo, idx) => (
              <div key={idx} style={{ background: '#16161c', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5' }}>
                    🌊 LFO {idx + 1}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={lfo.active} 
                      onChange={e => {
                        const newLfos = [...lfoParams];
                        newLfos[idx] = { ...newLfos[idx], active: e.target.checked };
                        setLfoParams(newLfos);
                      }} 
                    />
                    <span style={{ fontSize: 12, color: '#f0f0f5', fontWeight: 600 }}>
                      {lfo.active ? 'ON' : 'OFF'}
                    </span>
                  </label>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : '1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#8888a0', marginBottom: 8 }}>Waveform</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['sine', 'triangle', 'square', 'sawtooth', 'random'].map(wave => (
                        <button 
                          key={wave}
                          onClick={() => {
                            const newLfos = [...lfoParams];
                            newLfos[idx] = { ...newLfos[idx], wave };
                            setLfoParams(newLfos);
                          }}
                          style={{ 
                            flex: 1, 
                            padding: '6px 4px', 
                            fontSize: 9, 
                            fontWeight: 600, 
                            background: lfo.wave === wave ? '#22c55e' : '#1e1e26',
                            color: lfo.wave === wave ? '#000' : '#8888a0',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          {wave === 'random' ? 'RND' : wave.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: 11, color: '#8888a0', marginBottom: 8 }}>Target Parameter</div>
                    <select 
                      value={lfo.target} 
                      onChange={e => {
                        const newLfos = [...lfoParams];
                        newLfos[idx] = { ...newLfos[idx], target: e.target.value };
                        setLfoParams(newLfos);
                      }}
                      style={{ width: '100%', padding: 8, background: '#1e1e26', color: '#f0f0f5', border: '1px solid #333340', borderRadius: 6, fontSize: 12 }}
                    >
                      <option value="cutoff">Filter Cutoff</option>
                      <option value="resonance">Resonance</option>
                      <option value="volume">Volume</option>
                      <option value="pan">Pan</option>
                      <option value="pitch">Pitch</option>
                      <option value="delayMix">Delay Mix</option>
                      <option value="reverbMix">Reverb Mix</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : '1fr', gap: 16, marginTop: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                      <span>Rate</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{lfo.rate.toFixed(2)}Hz</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="20" 
                      step="0.1" 
                      value={lfo.rate} 
                      onChange={e => {
                        const newLfos = [...lfoParams];
                        newLfos[idx] = { ...newLfos[idx], rate: parseFloat(e.target.value) };
                        setLfoParams(newLfos);
                      }} 
                      style={{ width: '100%' }} 
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888a0', marginBottom: 4 }}>
                      <span>Depth</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(lfo.depth * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={lfo.depth} 
                      onChange={e => {
                        const newLfos = [...lfoParams];
                        newLfos[idx] = { ...newLfos[idx], depth: parseFloat(e.target.value) };
                        setLfoParams(newLfos);
                      }} 
                      style={{ width: '100%' }} 
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div style={{ background: '#1e1e26', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, color: '#8888a0', lineHeight: 1.6 }}>
                <strong style={{ color: '#fff' }}>💡 LFO Guide:</strong><br/>
                • <strong>Rate</strong>: How fast the LFO oscillates (Hz)<br/>
                • <strong>Depth</strong>: How much the LFO affects the parameter<br/>
                • <strong>Waveforms</strong>: Sine (smooth), Triangle (linear), Square (stepped), Saw (ramp), Random (noise)<br/>
                • <strong>Target</strong>: Which parameter to modulate<br/>
                • Turn ON to activate modulation<br/>
                • Note: LFO implementation is visual - full audio routing coming in next update
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        input[type="range"] { -webkit-appearance: none; height: 6px; background: #333340; border-radius: 3px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #22d3ee; border-radius: 50%; cursor: pointer; }
      `}</style>
    </div>
  );
}

export default LoopStudio;
