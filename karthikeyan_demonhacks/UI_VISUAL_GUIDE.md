# 🎨 LoopTour - Interactive UI Visual Guide

## 🎯 PREFERENCE FORM (NEW!)

### Multi-Step Wizard
```
┌──────────────────────────────────────────────────┐
│  🗺️ LoopTour                                      │
│  Create your personalized walking tour          │
├──────────────────────────────────────────────────┤
│  Progress: ████░░░░░░░░░░░░░░░░ (Step 1 of 4)  │
├──────────────────────────────────────────────────┤
│                                                   │
│                    ⏱️                             │
│    How much time do you have?                    │
│    Select your available time for the tour      │
│                                                   │
│              ┌──────────────┐                    │
│              │      60      │ minutes            │
│              └──────────────┘                    │
│                                                   │
│              ━━━━━━━━━━━━━                        │
│              30      60    120    240            │
│                                                   │
│         [Quick] [Moderate] [Full] [Deep]        │
│                                                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  [← Previous]                      [Next →]      │
│                                                   │
│  Background: Animated purple blobs floating ✨   │
└──────────────────────────────────────────────────┘
```

### Interest Selection Step
```
┌──────────────────────────────────────────────────┐
│  Progress: ████████░░░░░░░░░░░░░░ (Step 2 of 4)│
├──────────────────────────────────────────────────┤
│                                                   │
│              ✨                                   │
│    What interests you?                           │
│    Pick one or more interests                   │
│                                                   │
│  ┌──────────┐  ┌──────────┐                      │
│  │ 🏛️      │  │ 🍽️      │  ┌──────────┐        │
│  │ History │  │ Food &   │  │ 🎨 Art &│        │
│  │         │  │ Dining ✓ │  │ Culture │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ 🌳      │  │ ☕      │  │ 🛍️     │      │
│  │ Nature  │  │ Coffee  │  │Shopping│      │
│  │         │  │Shops ✓  │  │        │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                   │
│  ┌──────────┐  ┌──────────┐                      │
│  │ 📸      │  │ 🏗️      │                      │
│  │Photography│ │Architecture│                   │
│  │         │  │        │                        │
│  └──────────┘  └──────────┘                      │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## 🗺️ INTERACTIVE MAP (NEW!)

### Mapbox GL Rendering
```
┌─────────────────────────────────────────┐
│  🔍 Navigation          [+] [-] 🧭     │
│                                         │
│  ╔════════════════════════════════╗    │
│  ║                                ║    │
│  ║         Mapbox Map             ║    │
│  ║  🛤️ Blue polyline route       ║    │
│  ║                                ║    │
│  ║      ①  Purple marker         ║    │
│  ║    /   \                       ║    │
│  ║   ②  ③④  Purple markers      ║    │
│  ║   │    │                       ║    │
│  ║   ⑤    ⑥ Pink marker (active) ║    │ Pulsing
│  ║        (has glow aura)         ║    │ Animation
│  ║                                ║    │
│  ║  Map styling: Clean, minimal   ║    │
│  ║  Color: Streets with custom    ║    │
│  ║          styling               ║    │
│  ║                                ║    │
│  ╚════════════════════════════════╝    │
│                                         │
│  🛤️ Route toggle [MAP CONTROLS]       │
│                                         │
│  ⚠️ Mapbox token warning (if missing)  │
└─────────────────────────────────────────┘
```

### Marker States
```
Default (Purple):
    ◉
   / \
  O   O    → Normal stop marker
   \ /      Size: 40px
    ◉

Hover (Purple Enlarged):
    ◉◉◉
   ◉◉◉◉◉  → Scales to 1.2x
  ◉◉◉◉◉◉   Size: 48px
   ◉◉◉◉◉    Shadow increases

Active (Pink with Pulse):
    ◉◉◉◉◉
   ◉◉◉◉◉◉◉  → Current stop
  ◉◉◉◉◉◉◉◉◉  Size: 50px
   ◉◉◉◉◉◉◉   Pulsing glow
    ◉◉◉◉◉
     ◉◉◉
```

---

## 📋 TOUR DISPLAY WITH TABS

### Overview Tab
```
┌────────────────────────────────────────────────┐
│ ← Back    🗺️ Your LoopTour   ⏱️60m 📍8km      │
├────────────────────────────────────────────────┤
│                                                │
│ [📋 Overview]  [🛑 Stops]  [⚙️ Adjust]       │
│                                                │
│ ┌──────────────────────────────────────────┐ │
│ │ 📊 TOUR OVERVIEW                         │ │
│ │ (Purple gradient background)             │ │
│ │                                          │ │
│ │ "Experience the vibrant heart of        │ │
│ │  Chicago with this expertly curated    │ │
│ │  tour blending art, history and urban  │ │
│ │  culture..."                            │ │
│ └──────────────────────────────────────────┘ │
│                                                │
│ ┌──────────────────────────────────────────┐ │
│ │         ②                                 │ │
│ │ Millennium Park                          │ │
│ │ 🎨 Art  🏛️ Architecture                  │ │
│ │                                          │ │
│ │ "The iconic Cloud Gate sculpture by     │ │
│ │  Anish Kapoor creates playful           │ │
│ │  reflections of the Chicago skyline."   │ │
│ │                                          │ │
│ │ ⏱️ 20 min        👥 Medium (yellow)     │ │
│ │                                          │ │
│ │ ➡️ Next: Art Institute                  │ │
│ └──────────────────────────────────────────┘ │
│                                                │
│ Progress: ████░░░░░░░░ 2 of 6 stops          │
│                                                │
└────────────────────────────────────────────────┘
```

### Stops Tab (Carousel Grid)
```
┌────────────────────────────────────────────────┐
│ [📋 Overview]  [🛑 Stops]  [⚙️ Adjust]       │
│                                                │
│ ┌──────────────────┐  ┌──────────────────┐   │
│ │       ①          │  │   ②  ← ACTIVE   │   │
│ │ Riverfront       │  │ Millennium Park  │   │
│ │ Coffee & Art     │  │ Art, Arch. ✓    │   │
│ │ ⏱️ 15m           │  │ ⏱️ 20m          │   │
│ └──────────────────┘  └──────────────────┘   │
│                                                │
│ ┌──────────────────┐  ┌──────────────────┐   │
│ │       ③          │  │       ④          │   │
│ │ Cloud Gate       │  │ Grant Park       │   │
│ │ Architecture     │  │ Nature & History │   │
│ │ ⏱️ 25m           │  │ ⏱️ 30m          │   │
│ └──────────────────┘  └──────────────────┘   │
│                                                │
│ [More stops...] (Scrollable)                  │
│                                                │
└────────────────────────────────────────────────┘
```

### Adjust Tab (Quick Buttons)
```
┌────────────────────────────────────────────────┐
│ [📋 Overview]  [🛑 Stops]  [⚙️ Adjust]       │
│                                                │
│ ┌──────────────────┐  ┌──────────────────┐   │
│ │     ⏱️           │  │      🍽️          │   │
│ │  I'm Tired       │  │  More Food       │   │
│ │  Shorten tour    │  │  Add food spots  │   │
│ └──────────────────┘  └──────────────────┘   │
│                                                │
│ ┌──────────────────┐  ┌──────────────────┐   │
│ │     ☕           │  │     🤫          │   │
│ │ Coffee Break     │  │ Less Crowded     │   │
│ │ Add coffee shops │  │ Avoid busy areas │   │
│ └──────────────────┘  └──────────────────┘   │
│                                                │
│ ✓ Tour updated!  (Success notification)      │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 📐 LAYOUT BREAKDOWN

### Desktop (>1024px)
```
┌─────────────────────────────────────────────────────┐
│ ← Back  🗺️ LoopTour  ⏱️60m 📍8km                   │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│                      │  [📋] [🛑] [⚙️]              │
│      Map             │                              │
│     (50%)            │   Details Tab                │
│                      │   (50%)                      │
│                      │                              │
│                      │  Content:                    │
│                      │  - Overview                  │
│                      │  - Stops carousel            │
│                      │  - Adjustments               │
│                      │                              │
└──────────────────────┴──────────────────────────────┘
```

### Tablet (768-1024px)
```
┌──────────────────────────────────┐
│ ← Back  🗺️ LoopTour  [Stats]    │
├──────────────────────────────────┤
│       Map (60vh)                 │
├──────────────────────────────────┤
│ [📋] [🛑] [⚙️]                   │
│ Details Tab (40vh, scrollable)   │
└──────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────┐
│ ← LoopTour [St]  │
├──────────────────┤
│   Map (50vh)     │
├──────────────────┤
│[📋][🛑][⚙️]     │
│ Details (scroll) │
└──────────────────┘
```

---

## 🎨 COLOR & STYLING EXAMPLES

### Button States
```
Normal State:
┌─────────────────┐
│ Next Step →     │ (Purple gradient #667eea → #764ba2)
└─────────────────┘

Hover State:
┌─────────────────┐
│ Next Step →     │ (Larger shadow, scale up 2px)
└─────────────────┘

Active State:
┌─────────────────┐
│ Next Step →     │ (Darker, pressed appearance)
└─────────────────┘

Disabled State:
┌─────────────────┐
│ Next Step →     │ (50% opacity, cursor: not-allowed)
└─────────────────┘
```

### Card Examples
```
Tour Summary Card:
┌──────────────────────────────────┐
│ 📊 TOUR OVERVIEW                 │ (Purple gradient bg)
│                                  │ (White text)
│ "Experience the vibrant heart..." │
└──────────────────────────────────┘

Stop Hero Card:
┌──────────────────────────────────┐
│         ②                        │ (Number badge)
│ Millennium Park                  │ (Large heading)
│ 🎨 Art • 🏛️ Architecture        │ (Tag pills)
│                                  │
│ "The iconic Bean sculpture..."  │
│                                  │
│ ⏱️ 20 min    👥 Medium           │ (Metadata)
│                                  │
│ ➡️ Next: Art Institute           │ (Next preview)
└──────────────────────────────────┘

Stop Grid Card:
┌──────────────────┐
│       ②          │ (Active - purple gradient bg)
│ Millennium Park  │ (White text)
│ Art • Arch.      │ (Categories)
│ ⏱️ 20m           │ (Time badge)
└──────────────────┘
```

---

## 🎭 Animation Timeline

### Page Load
```
0ms:     Form slides up from bottom
0ms:     Background blobs appear (opacity: 0→1)
300ms:   Header fades in
500ms:   Content fully visible

Ongoing: Blobs float continuously (8s cycle)
         - Blob 1: 0s delay
         - Blob 2: 2s delay
         - Blob 3: 4s delay
```

### Tab Switch
```
0ms:     Current content fades out
100ms:   Content fully hidden
100ms:   New content fades in
300ms:   Animation complete
```

### Marker Interaction
```
On Hover:     Marker scales 1.2x (0.3s ease)
On Click:     Marker pulses (infinite 2s loop)
On Leave:     Marker scales back to 1x (0.3s ease)
```

---

## 📊 Responsive Examples

### Form on Mobile
```
┌─────────────────┐
│ 🗺️ LoopTour     │ (Smaller heading)
│ Create tour     │
├─────────────────┤
│ Progress: ████░ │
│ Step 1 of 4     │
├─────────────────┤
│       ⏱️         │ (Centered icon)
│ Time needed?    │
│                 │
│  [60] minutes   │
│                 │
│ ━━━━━━━━━━━━    │
│                 │
│ Buttons (full   │
│  width, 2x2):   │
│ [Q] [Mo]        │
│ [Fu] [De]       │
├─────────────────┤
│[← Prev][Next→]  │
│ [1][2][3][4]    │
└─────────────────┘
```

---

## 🎯 Interactive Elements Checklist

✅ **Buttons**: All have hover scale + shadow
✅ **Cards**: Hover lifts up (-2px) + shadow
✅ **Tabs**: Active tab has purple underline
✅ **Markers**: Hover → scale 1.2x, Click → pulse
✅ **Inputs**: Focus → border color changes
✅ **Sliders**: Thumb has gradient + glow
✅ **Text**: All has proper contrast
✅ **Links**: Purple, underline on hover
✅ **Icons**: Emoji for quick recognition
✅ **Feedback**: Success message appears/disappears

---

**Every interaction is smooth, every animation is purpose-driven, every design choice is intentional.** 🎨✨

Made for user delight and engagement! 🚀
