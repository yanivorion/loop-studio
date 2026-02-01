# Modular Instrument Architecture

## Overview
Transforming Loop Studio into a modular synthesis environment where each instrument is an independent unit with its own effect chain, settings, and state.

## Architecture Changes

### 1. Instrument Model
**OLD**: Fixed instruments with global LFO/sampler tabs
**NEW**: Each instrument instance has:
- Base sound generator (kick, hat, bass, piano, etc.)
- Optional effect chain slots:
  - LFO modulation (per-instrument)
  - Sampler processing (per-instrument)
  - Future: filters, distortion, etc.
- State management (current params + effect chain)
- Flatten capability (commit current state as new default)

### 2. Instrument Data Structure
```javascript
{
  id: 'kick-1',                    // Unique ID
  type: 'kick',                     // Instrument type
  name: 'Kick 1',                   // Display name
  params: {                         // Base parameters
    sub: 0.75,
    punch: 0.5,
    attack: 0.01,
    decay: 0.4,
    // ...
  },
  effectChain: [                    // Optional effects
    {
      type: 'lfo',
      active: true,
      wave: 'sine',
      rate: 4,
      depth: 0.5,
      target: 'pitch'               // What parameter to modulate
    },
    {
      type: 'sampler',
      active: false,
      buffer: null,
      pitch: 0,
      speed: 1
    }
  ],
  color: '#ff3b5c',                 // UI color
  muted: false,
  solo: false
}
```

### 3. Key Features

#### A. Per-Instrument Effect Chains
- Each kick, hat, bass, etc. has own LFO/sampler
- Effect chains are per-instance, not global
- Turn effects on/off per instrument
- Different LFO settings for different kicks

#### B. Duplication
- Duplicate any instrument instance
- Creates new instance with copied settings
- Independent effect chains
- Example: "Kick 1" + "Kick 2" with different LFOs

#### C. Flatten/Commit
- "Bake in" current effect state
- Saves manipulated sound as new starting point
- Example: LFO modulated kick → flatten → new default kick sound
- Clears effect chain after flatten

### 4. UI Changes

#### Instrument View (Drums Tab)
```
┌─────────────────────────────────────────┐
│ KICK 1                      [⚙️] [📋] [✓] │ ← Settings, Duplicate, Flatten
│ ┌───────────────────────────────────┐   │
│ │         ●  KICK PAD               │   │
│ └───────────────────────────────────┘   │
│                                          │
│ Base Parameters:                         │
│ [Sub] [Punch] [Click] [Noise]           │
│                                          │
│ Effect Chain:                            │
│ ┌─────────────────────────────────────┐ │
│ │ 🌊 LFO        [ON]  [⚙️ Edit]       │ │
│ │ Rate: 4Hz  Depth: 50%  Target: Pitch│ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 🎵 Sampler    [OFF] [⚙️ Edit]       │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [+ Add Effect]                           │
└─────────────────────────────────────────┘
```

#### Sequencer View
- Shows all instrument instances
- Each row = one instrument instance
- Can have "Kick 1", "Kick 2", etc.
- Mute/solo per instance

### 5. Implementation Plan

**Phase 1: Architecture Refactor**
- Create instrument instance model
- Migrate current instruments to new structure
- Per-instrument state management

**Phase 2: Per-Instrument Effects**
- LFO system per instrument
- Sampler per instrument
- Effect chain processing

**Phase 3: Duplication**
- Duplicate function
- UI for managing multiple instances
- Unique ID generation

**Phase 4: Flatten/Commit**
- Capture current processed state
- Set as new default
- Clear effect chain

**Phase 5: UI Updates**
- Expandable instrument cards
- Effect chain editor
- Instance management

### 6. Benefits

- **Flexibility**: Each sound can be unique
- **Creativity**: Infinite variations from one base sound
- **Workflow**: Professional modular approach
- **Performance**: Multiple variations without manual tweaking
- **Non-destructive**: Flatten when satisfied, experiment before

### 7. Example Use Cases

**Use Case 1: Layered Kicks**
1. Create "Kick 1" - deep sub
2. Duplicate to "Kick 2" - add punch with LFO
3. Duplicate to "Kick 3" - sampler for texture
4. All three in sequencer, different patterns

**Use Case 2: Evolving Bass**
1. Create "Bass 1" - squelch preset
2. Add LFO modulating cutoff
3. Experiment with settings
4. Happy with sound? Flatten it!
5. Now it's the new starting point
6. Add different LFO for further evolution

**Use Case 3: Multiple Hats**
1. "Hi-Hat 1" - standard
2. "Hi-Hat 2" (duplicate) - pitched up with sampler
3. "Hi-Hat 3" (duplicate) - LFO on filter
4. Three different hats, all from one base

## Next Steps

1. Refactor instrument data structure
2. Implement per-instrument effect chains
3. Add duplication UI and logic
4. Implement flatten/commit
5. Update all UI components
6. Test and deploy

This transforms Loop Studio into a true modular synthesis environment!
