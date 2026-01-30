# 📦 Export/Import Guide

## New Buttons in Header:

- **💾 Save** - Save to browser localStorage (auto-saves every 10s)
- **📂 Load** - Load from browser localStorage
- **⬇️ Export** - Download session as JSON file
- **⬆️ Import** - Upload JSON file to load session
- **🗑️ New** - Clear and start fresh (tablet only)

---

## ⬇️ Export Your Session

### How to Export:
1. Click the **⬇️ Export** button in the header
2. A `.json` file will download automatically
3. Filename format: `LoopStudio-YYYY-MM-DD.json`

### What Gets Exported:
✅ All sequencer patterns (drums & bass)  
✅ All looper recordings (4 tracks)  
✅ BPM and bar settings  
✅ All synth parameters (bass, kick, lead)  
✅ Current tab selection  
✅ Timestamp for organization  

### Why Export?
- **Backup**: Keep safe copies of your best projects
- **Share**: Send your tracks to friends
- **Cross-device**: Move projects between phone/tablet/computer
- **Archive**: Organize multiple projects in folders

---

## ⬆️ Import a Session

### How to Import:
1. Click the **⬆️ Import** button
2. Choose a `.json` file from your device
3. Session loads instantly with confirmation message

### Features:
- ✅ **Validates** file format before loading
- ✅ **Saves to localStorage** automatically after import
- ✅ **Error messages** if file is invalid
- ✅ **Success confirmation** when loaded

---

## 💡 Use Cases

### Scenario 1: Share Your Beat
```
1. Create an awesome beat
2. Click ⬇️ Export
3. Send the .json file to a friend
4. Friend clicks ⬆️ Import
5. They have your exact beat!
```

### Scenario 2: Work on Multiple Projects
```
1. Create "Project A" and Export
2. Click 🗑️ New to start fresh
3. Create "Project B" and Export
4. Import "Project A" when you want to work on it
5. Switch between projects anytime!
```

### Scenario 3: Backup Your Work
```
1. Create amazing patterns
2. Click ⬇️ Export regularly
3. Store files in cloud (Google Drive, Dropbox, etc.)
4. Never lose your work!
```

### Scenario 4: Cross-Device Workflow
```
1. Start beat on phone during commute
2. Export the session
3. Send file to yourself (email, AirDrop, etc.)
4. Import on tablet at home
5. Continue with better workflow!
```

---

## 📂 File Management Tips

### Organize Your Files:
```
My Projects/
├── Loop Studio/
│   ├── Dark Psytrance 2026-01-30.json
│   ├── Forest Groove 2026-01-29.json
│   ├── Hi-Tech Banger 2026-01-28.json
│   └── Backups/
│       ├── Dark Psytrance v1.json
│       └── Dark Psytrance v2.json
```

### Best Practices:
1. **Export before major changes** - keep versions
2. **Rename files** with descriptive names
3. **Regular backups** - export to cloud storage
4. **Version control** - add v1, v2, v3 to filenames
5. **Share freely** - JSON files are small (~50KB)

---

## 🔄 Export vs Save

| Feature | 💾 Save | ⬇️ Export |
|---------|---------|-----------|
| Location | Browser only | Downloads file |
| Backup | Lost if browser cleared | Permanent file |
| Share | Cannot share | Can share |
| Cross-device | No | Yes |
| Auto | Yes (every 10s) | Manual |
| Cloud | No | You can upload |

**Pro Tip**: Use both!
- Let **Save** auto-save while working
- Click **Export** when done to create backup

---

## ✨ Live Now!

Visit: **https://yanivorion.github.io/loop-studio/**

Wait 1-2 minutes, then hard refresh: `Cmd + Shift + R`

Your sessions are now portable! 🎵📦✨
