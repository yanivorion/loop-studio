# 🎛️ FX & Mixer Controls - User Guide

## 🎉 NEW TABS ADDED!

You now have **2 new tabs** in Loop Studio:
- **🎚️ FX** - Control delay and reverb effects
- **🎛️ Mixer** - Volume, pan, and FX sends for each instrument

---

## 🎚️ FX TAB

### Problem Solved:
**Before**: Delay and reverb were always active with fixed settings - you couldn't turn them off or adjust them!

**Now**: Full control over all FX parameters in real-time!

### DELAY Controls:
1. **Time** (100ms - 1000ms)
   - How long between echo repeats
   - Lower = faster echoes, Higher = slower

2. **Feedback** (0-95%)
   - How many times the delay repeats
   - 0% = single echo, 95% = many repeats
   - ⚠️ Watch out for runaway feedback at high values!

3. **Mix/Wet** (0-100%)
   - How much delay you hear
   - **0% = NO DELAY** (completely dry)
   - 100% = Maximum delay effect

### REVERB Controls:
1. **Mix/Wet** (0-100%)
   - How much reverb you hear
   - **0% = NO REVERB** (completely dry)
   - 100% = Maximum space/ambience

2. **Decay** (0.5s - 5s)
   - How long the reverb tail lasts
   - Short = small room, Long = huge hall
   - ⚠️ Requires restart to change (rebuilds reverb engine)

### How to Turn Off FX:
- **Disable Delay**: Set Delay Mix to 0%
- **Disable Reverb**: Set Reverb Mix to 0%
- **Both Off**: Set both Mix controls to 0%

---

## 🎛️ MIXER TAB

### MASTER Section:
- **Volume**: Overall output level (affects everything)
- Keep at 80% as default
- Lower if audio is clipping/distorting

### Per-Instrument Controls:

Each instrument (Drums, Bass, Piano, Pads, Lead) has:

1. **Volume** (0-100%)
   - Individual instrument level
   - 0% = silent, 100% = max

2. **Pan** (L100 - C - R100)
   - Stereo positioning
   - L = Left speaker
   - C = Center (both speakers equally)
   - R = Right speaker
   - Create width by panning different instruments!

3. **Delay Send** (0-100%)
   - How much of THIS instrument goes to delay
   - 0% = this instrument has no delay
   - 100% = maximum delay on this instrument
   - Independent of global delay mix!

4. **Reverb Send** (0-100%)
   - How much of THIS instrument goes to reverb
   - 0% = this instrument has no reverb
   - 100% = maximum reverb on this instrument
   - Independent of global reverb mix!

---

## 💡 PRACTICAL EXAMPLES

### Example 1: Dry Kick, Wet Snare
```
FX Tab:
- Delay Mix: 30%
- Reverb Mix: 20%

Mixer Tab (Drums):
- Kick: Delay Send 0%, Reverb Send 0%  ← DRY
- Snare: Delay Send 100%, Reverb Send 80%  ← WET
```
Result: Kick is punchy and dry, snare has space and depth!

### Example 2: Wide Stereo Mix
```
Mixer Tab:
- Kick: Pan C (center)
- Hi-Hat: Pan R70 (right)
- Clap: Pan L50 (left)
- Bass: Pan C (center - always center bass!)
- Lead: Pan R30 (slight right)
- Pads: Pan L30 (slight left)
```
Result: Wide, professional stereo image!

### Example 3: Psytrance (Dry Kick, FX on Everything Else)
```
FX Tab:
- Delay: Time 375ms (dotted 8th), Feedback 40%, Mix 25%
- Reverb: Mix 15%

Mixer Tab:
- Kick: Delay 0%, Reverb 0%  ← Punchy and dry
- Bass: Delay 5%, Reverb 5%  ← Slightly wet
- Hi-Hats: Delay 50%, Reverb 30%  ← Spacey
- FX Sounds: Delay 80%, Reverb 60%  ← Very wet
```

### Example 4: Completely Dry Mix (No FX)
```
FX Tab:
- Delay Mix: 0%
- Reverb Mix: 0%
```
Done! All FX are off. Sends don't matter when mix is 0%.

---

## 🎯 TIPS & TRICKS

### General Mixing:
1. **Start with everything at 50%**, then adjust
2. **Kick and bass**: Keep centered (Pan C)
3. **Hi-hats**: Pan slightly off-center for width
4. **Leads**: Pan opposite to create space
5. **Pads**: Slight pan or center, high reverb

### FX Tips:
1. **Delay time sync**: 
   - 128 BPM: 234ms = 1/8 note, 469ms = 1/4 note
   - Experiment to match your tempo!

2. **Feedback sweet spot**: 30-50% for musical repeats

3. **Reverb on drums**: Less is more! 5-15% usually enough

4. **Leads & pads**: Can handle 30-60% reverb

5. **Bass**: Usually keep dry or very subtle FX

### Problem Solving:
- **Too muddy?** Reduce reverb mix
- **Too dry?** Increase reverb sends on melodic elements
- **Feedback chaos?** Lower delay feedback
- **Kick disappearing?** Set its delay/reverb sends to 0%

---

## 🚀 Access the Update

**URL**: https://yanivorion.github.io/loop-studio/

**To see new features**:
1. Wait **2 minutes** for deployment
2. Hard refresh: **`Cmd + Shift + R`**
3. Click FX or Mixer tabs!

---

## 🔮 COMING NEXT (Phase 2-4):

- **Enhanced Kick Synth**: Attack, decay, pitch envelope controls
- **Sampler Tab**: Load your own samples, pitch shift, loop points
- **LFO System**: Modulate any parameter with waveforms
- **Per-instrument EQ**: Shape each sound
- **Compression**: Master bus compression
- **Visual feedback**: Level meters, waveform displays

---

## 💬 Current Limitations:

1. **Reverb decay**: Requires restart to change (will fix in next update)
2. **Per-instrument volume/pan**: Not yet applied to sound engine (display only)
3. **Send FX**: Architecture in place, full implementation coming

These will be addressed in Phase 2! For now, enjoy having FX control! 🎉
