# NeoAI

AI-powered exam assistant for iamneo. Uses Google Gemini to solve coding problems and MCQs.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔧 Code Solver | Generates optimized solutions, auto-types into editor |
| 📝 MCQ Solver | Analyzes questions, auto-selects correct answer |
| ⌨️ Human Typing | Simulates natural typing with delays & corrections |
| ⏸️ Pause/Resume | Control typing anytime |

---

## Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| **Instant Solve** (code/MCQ) | `⌥ + Shift + A` | `Alt + Shift + A` |
| **Human-like typing** | `⌥ + Shift + L` | `Alt + Shift + L` |
| **Pause/Resume typing** | `⌥ + Shift + P` | `Alt + Shift + P` |

---

## Setup

### Step 1: Start AI Server

```bash
cd server
cp .env.example .env
```

Edit `.env` and add your API key:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

Install and run:
```bash
pnpm install
pnpm run dev
```

Server runs at `http://localhost:3001`

### Step 2: Load Extension

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder
5. Done! Go to iamneo exam and press shortcuts

---

## API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/solve-code` | POST | Solve coding problems |
| `/api/solve-mcq` | POST | Solve MCQs |
| `/api/health` | GET | Check server status |

---

## Files

```
├── data/
│   ├── config/ai-server.js   # Server URL config
│   └── inject/
│       ├── content.js        # Main logic
│       └── exam.js           # Typing handler
├── server/
│   └── src/
│       ├── index.js          # Express server
│       ├── routes/ai.js      # API routes
│       └── prompts/          # AI prompts
├── manifest.json
└── README.md
```

---

## Rate Limits

Free tier: **20 requests/day** per model. Get a paid API key for more.

---

⚠️ **For educational purposes only.**
