# Loop Studio 🎵

Professional mobile/tablet music production studio with step sequencer, drums, bass synths, piano, pads, lead, and looper - featuring psytrance/hi-tech presets.

## Features

- **Step Sequencer**: Program drum patterns and bass lines with up to 4 bars
- **Loop Recorder**: Record and layer multiple instrument tracks in real-time
- **Drum Machine**: 8 synthesized drum sounds (kick, snare, clap, hat, open hat, tom, perc, snap)
- **Bass Synth**: 9 psytrance/hi-tech bass presets with adjustable parameters
- **Piano**: Full chromatic piano with harmonic synthesis
- **Pad Synth**: 6 atmospheric chord pads
- **Lead Synth**: Monophonic lead with multiple waveforms
- **FX**: Built-in delay and reverb

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Tap to Start** - Initialize the audio engine (required for iOS)
2. **Choose an instrument tab** - Drums, Bass, Piano, Pads, Lead, or Sequencer
3. **Play sounds** - Tap pads to trigger sounds
4. **Use the looper** - Record button (●) to start recording, play button to playback
5. **Program patterns** - Use the Seq tab to create rhythmic patterns

## Mobile Optimization

- Optimized for touch interaction on mobile and tablet
- Responsive design adapts to screen size
- iOS audio context handling
- **Note for iPhone users**: Turn OFF silent mode for audio playback

## Tech Stack

- React 18
- Vite
- Web Audio API
- Pure CSS (no framework dependencies)

## License

MIT
