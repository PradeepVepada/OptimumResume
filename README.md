# OptimumResume

An intelligent resume optimization system that combines AI-powered resume tailoring with MCP (Model Context Protocol) integration for seamless automation in Open Cowork and other AI agents.

**Live Demo**: Visit http://localhost:3000 after setup  
**GitHub Repo**: https://github.com/PradeepVepada/OptimumResume

---

## 🎯 Overview

OptimumResume consists of three integrated components:

1. **Resume-Matcher**: Full-stack application (backend + frontend) for resume analysis and AI-powered tailoring
2. **Resume-Matcher MCP**: Model Context Protocol wrapper enabling AI agent integration
3. **Open Cowork Integration**: Connect to AI agents for automated resume optimization

---

## ✨ Features

### Core Resume Features
- 📄 **Resume Upload**: Support for PDF and DOCX formats
- 🎯 **Job Description Analysis**: Input job descriptions for tailoring
- 🤖 **AI-Powered Optimization**: Generate resume versions optimized for specific roles
- 📊 **Resume Scoring**: Match percentage and keyword analysis
- 📋 **Cover Letter Generation**: Auto-generate cover letters based on job descriptions
- 🎨 **Multiple Templates**: Professional, modern, and custom PDF templates
- 🌍 **Multi-Language Support**: English, Spanish, Chinese, Japanese, Portuguese

### MCP Integration
- 🔗 **Open Cowork Compatible**: Direct AI agent integration
- ⚡ **Real-time Configuration**: Configure LLM providers on-the-fly
- 🔐 **Secure API**: Stdio transport with error handling
- 📦 **Modular Architecture**: Independent MCP server

---

## 📋 Prerequisites

Before installation, ensure you have:

| Tool | Version | Installation |
|------|---------|--------------|
| **Node.js** | 22+ | [nodejs.org](https://nodejs.org) |
| **Python** | 3.13+ | [python.org](https://python.org) |
| **uv** | Latest | [astral.sh/uv](https://docs.astral.sh/uv/getting-started/installation/) |
| **Git** | Any | [git-scm.com](https://git-scm.com) |

### AI Provider (choose one)
- **OpenAI**: GPT-4o, GPT-5 Nano
- **Anthropic**: Claude Haiku 4.5
- **Google Gemini**: Gemini 3 Flash
- **Local**: Ollama (free)
- **Other**: OpenRouter, DeepSeek, etc.

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/PradeepVepada/OptimumResume.git
cd OptimumResume
```

### 2. Setup Backend

Navigate to the backend directory:

```bash
cd Resume-Matcher/apps/backend
```

Copy environment template and configure:

```bash
cp .env.example .env
```

Edit `.env` with your AI provider details:

```env
# AI Provider Configuration
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
LLM_API_KEY=sk-your-actual-api-key-here

# Server Settings
HOST=0.0.0.0
PORT=8000
FRONTEND_BASE_URL=http://localhost:3000
REQUEST_TIMEOUT_SECONDS=600

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://0.0.0.0:3000"]
```

Install Python dependencies:

```bash
uv sync
```

Start backend server (keep terminal open):

```bash
uv run app
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 3. Setup Frontend

Open a **new terminal** and navigate to frontend:

```bash
cd Resume-Matcher/apps/frontend
```

Create local environment file:

```bash
# Copy from template
cp .env.sample .env.local
```

Edit `.env.local` to add timeout and API configuration:

```env
NEXT_PUBLIC_API_URL=/
NEXT_PUBLIC_REQUEST_TIMEOUT_MS=600000
```

Install Node dependencies:

```bash
npm install
```

Start frontend dev server:

```bash
npm run dev
```

Expected output:
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
```

### 4. Setup MCP Server (for Open Cowork)

Open a **third terminal**:

```bash
cd resume-matcher-mcp
```

Install MCP dependencies:

```bash
npm install
```

(Optional) Create `.env` if you need custom backend URL:

```env
RESUME_MATCHER_API=http://localhost:8000/api/v1
RESUME_OUTPUT_DIR=./generated-resumes
```

The MCP server will be started later when configured in Open Cowork.

---

## 🔧 Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | — | AI provider (openai, anthropic, gemini, ollama, etc.) |
| `LLM_MODEL` | — | Model name (e.g., gpt-4o, claude-haiku-4-5) |
| `LLM_API_KEY` | — | API key for your provider |
| `LLM_API_BASE` | — | Custom API endpoint (optional, for local/self-hosted) |
| `HOST` | 0.0.0.0 | Server host |
| `PORT` | 8000 | Server port |
| `FRONTEND_BASE_URL` | http://localhost:3000 | Frontend URL for PDF generation |
| `REQUEST_TIMEOUT_SECONDS` | 240 | Timeout for AI operations (increase for slow LLMs) |
| `CORS_ORIGINS` | ["http://localhost:3000"] | Allowed frontend origins |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | / | Backend API URL (/ for same-origin proxy) |
| `NEXT_PUBLIC_REQUEST_TIMEOUT_MS` | 240000 | Timeout in ms (must match backend * 1000) |

---

## 🌐 Accessing the Application

Once both services are running:

| URL | Description |
|-----|-------------|
| **http://localhost:3000** | Main Resume-Matcher dashboard |
| **http://localhost:3000/settings** | Configure AI provider |
| **http://localhost:8000/api/v1/health** | Backend health check |
| **http://localhost:8000/docs** | Interactive API documentation |

### First-Time Setup Checklist

1. ✅ Open http://localhost:3000
2. ✅ Go to Settings page
3. ✅ Select your AI provider
4. ✅ Enter API key
5. ✅ Click "Test Connection" to verify
6. ✅ Upload your first resume
7. ✅ Paste a job description
8. ✅ Click "Tailor Resume"

---

## 🤖 Open Cowork MCP Integration

### Add MCP Server to Open Cowork

For **AIDotNet/OpenCowork** (`~/.open-cowork/mcp-servers.json`):

```json
[
  {
    "id": "resume-matcher",
    "name": "Resume Matcher",
    "enabled": true,
    "transport": "stdio",
    "command": "node",
    "args": ["C:\\Users\\YourUsername\\Den\\Jobs\\resume_make\\resume-matcher-mcp\\server.js"],
    "env": {
      "RESUME_MATCHER_API": "http://localhost:8000/api/v1",
      "RESUME_OUTPUT_DIR": "C:\\Users\\YourUsername\\Den\\Jobs\\resume_make\\resume-matcher-mcp\\generated-resumes"
    },
    "createdAt": 1719145600000,
    "description": "Resume tailoring and optimization via Resume-Matcher API"
  }
]
```

**Replace paths** with your actual installation directory.

### Use in Open Cowork

After restarting Open Cowork, ask the AI agent:

```
"Upload my resume at C:\path\to\resume.pdf and tailor it for the Google Software Engineer role"
```

### Available MCP Tools

| Tool | Purpose |
|------|---------|
| `health_check` | Verify API connectivity |
| `configure_llm` | Set AI provider (provider, model, apiKey) |
| `upload_resume` | Upload resume file (PDF/DOCX) |
| `list_resumes` | List all uploaded resumes |
| `get_resume` | Get resume details by ID |
| `upload_job_description` | Add job description for tailoring |
| `tailor_resume` | Generate optimized resume |
| `download_resume_pdf` | Export as PDF with template choice |

---

## 🐳 Docker Deployment (Optional)

Deploy without local Node/Python installation:

```bash
cd Resume-Matcher
docker compose up -d
```

Access at http://localhost:3000 (both frontend and backend in same container)

---

## 📊 Supported AI Providers

### Cloud Providers

**OpenAI**
```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
LLM_API_KEY=sk-...
```

**Anthropic**
```env
LLM_PROVIDER=anthropic
LLM_MODEL=claude-haiku-4-5-20251001
LLM_API_KEY=sk-ant-...
```

**Google Gemini**
```env
LLM_PROVIDER=gemini
LLM_MODEL=gemini/gemini-3-flash-preview
LLM_API_KEY=...
```

### Local AI (Free)

**Ollama**
```env
LLM_PROVIDER=ollama
LLM_MODEL=gemma3:4b
LLM_API_BASE=http://localhost:11434
```

[Download Ollama](https://ollama.com) and run: `ollama pull gemma3:4b`

---

## 🐛 Troubleshooting

### "Failed to fetch" Error in Frontend

**Problem**: Frontend can't connect to backend

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/api/v1/health`
2. Check `.env.local` has `NEXT_PUBLIC_API_URL=/`
3. Restart frontend: Kill process on port 3000 and run `npm run dev`

### Backend Won't Start

**Problem**: `ModuleNotFoundError` or connection errors

**Solution**:
1. Ensure `uv sync` completed: `uv sync`
2. Check `.env` file is configured
3. Verify API key is valid
4. Check port 8000 is not in use: `netstat -ano | findstr :8000`

### MCP Server Can't Connect

**Problem**: Open Cowork can't reach MCP server

**Solution**:
1. Verify path in config points to correct `server.js`
2. Ensure `node_modules` installed: `npm install`
3. Check backend is running on 8000
4. Verify `RESUME_MATCHER_API` env var in MCP config

### PDF Download Fails

**Problem**: "Cannot connect to frontend for PDF generation"

**Solution**:
1. Ensure frontend is running on port 3000
2. Update `FRONTEND_BASE_URL` if using different port
3. Add frontend URL to `CORS_ORIGINS`

---

## 📦 Project Structure

```
OptimumResume/
├── Resume-Matcher/                 # Main application
│   ├── apps/backend/              # Python FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py            # Entry point
│   │   │   ├── config.py          # Config & env
│   │   │   ├── database.py        # TinyDB
│   │   │   ├── llm.py             # AI integration
│   │   │   ├── routers/           # API endpoints
│   │   │   ├── services/          # Business logic
│   │   │   └── schemas/           # Data models
│   │   ├── .env.example           # Config template
│   │   └── pyproject.toml         # Python deps
│   │
│   └── apps/frontend/              # Next.js React frontend
│       ├── app/                    # Pages & routes
│       ├── components/             # React components
│       ├── lib/                    # Utilities & API client
│       ├── .env.sample             # Config template
│       └── package.json            # Node deps
│
├── resume-matcher-mcp/             # MCP wrapper for AI agents
│   ├── server.js                  # MCP server
│   ├── package.json               # Node deps
│   ├── .env                       # Backend URL config
│   ├── README.md                  # MCP documentation
│   └── generated-resumes/         # Output directory
│
├── .gitignore                      # Git ignore rules
├── open-cowork-mcp-config.json    # Sample MCP config
└── README.md                       # This file
```

---

## 🔄 Workflow

### For Resume-Matcher Web UI

1. Open http://localhost:3000
2. Configure AI provider in Settings
3. Upload master resume
4. Enter job description
5. View AI suggestions
6. Download tailored PDF

### For Open Cowork Automation

1. Ask AI agent to upload and tailor resume
2. Specify job description verbally
3. Agent handles all steps automatically
4. Download optimized PDF

---

## 🤝 Sharing with Others

### Package for Friend

1. Clone your GitHub repo
2. Tell friend to follow this README
3. **Don't share** `.env` files with real API keys
4. Friend creates their own `.env` with their API key

### Quick Share Command

```bash
# Your friend runs:
git clone https://github.com/PradeepVepada/OptimumResume.git
cd OptimumResume
# Then follow installation steps above
```

---

## 📚 Additional Resources

- **Resume-Matcher Docs**: [GitHub](https://github.com/srbhr/Resume-Matcher)
- **MCP Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Open Cowork**: [GitHub](https://github.com/AIDotNet/OpenCowork)
- **API Documentation**: http://localhost:8000/docs (when backend running)

---

## 🆘 Getting Help

- **Check logs**: Terminal where backend/frontend are running
- **Test health**: `curl http://localhost:8000/api/v1/health`
- **Clear cache**: Delete `.next/` and restart frontend
- **Reset data**: Delete `Resume-Matcher/apps/backend/data/` folder

---

## 📝 License

This project combines:
- **Resume-Matcher**: Apache-2.0
- **MCP Wrapper**: MIT

See individual projects for license details.

---

## 🎉 Success!

Your resume optimization system is ready. Start with the **First-Time Setup Checklist** above and enjoy AI-powered resume tailoring!

**Questions?** Check the troubleshooting section or review the log output in your terminals.
