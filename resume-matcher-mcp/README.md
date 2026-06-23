# Resume Matcher MCP Server

This is a Model Context Protocol (MCP) server that wraps the [Resume-Matcher](https://github.com/srbhr/Resume-Matcher) API, allowing AI agents like Open Cowork to interact with the resume tailoring service.

## Features

- **Health Check**: Verify API connectivity
- **Resume Management**: Upload, list, and retrieve resumes
- **Job Description Handling**: Upload job descriptions for tailoring
- **AI-Powered Tailoring**: Generate optimized resumes for specific job roles
- **PDF Export**: Download tailored resumes as PDFs with various templates
- **LLM Configuration**: Configure AI providers (OpenAI, Anthropic, Gemini, etc.)

## Prerequisites

1. **Resume-Matcher Backend**: Must be running on `http://localhost:8000/api/v1`
2. **Node.js**: v18 or higher
3. **Open Cowork**: Desktop AI agent application

## Quick Start

### 1. Start the Resume-Matcher Backend

```bash
cd ../Resume-Matcher/apps/backend
cp .env.example .env  # Configure your AI provider
uv sync
uv run app
```

### 2. Start the MCP Server

```bash
cd resume-matcher-mcp
node server.js
```

The server will start on stdio transport and connect to the Resume-Matcher API.

### 3. Configure Open Cowork

Add the following configuration to your Open Cowork MCP settings:

#### For AIDotNet Open Cowork (`~/.open-cowork/mcp-servers.json`):

```json
[
  {
    "id": "resume-matcher",
    "name": "Resume Matcher",
    "enabled": true,
    "transport": "stdio",
    "command": "node",
    "args": ["C:\\Users\\vprad\\Den\\Jobs\\resume_make\\resume-matcher-mcp\\server.js"],
    "env": {
      "RESUME_MATCHER_API": "http://localhost:8000/api/v1",
      "RESUME_OUTPUT_DIR": "C:\\Users\\vprad\\Den\\Jobs\\resume_make\\resume-matcher-mcp\\generated-resumes"
    },
    "createdAt": 1719145600000,
    "description": "Resume tailoring and optimization via Resume-Matcher API"
  }
]
```

#### For OfficeCowork (`config/mcp_servers.json`):

```json
{
  "mcp_servers": {
    "resume-matcher": {
      "command": "node",
      "args": ["C:\\Users\\vprad\\Den\\Jobs\\resume_make\\resume-matcher-mcp\\server.js"],
      "env": {
        "RESUME_MATCHER_API": "http://localhost:8000/api/v1",
        "RESUME_OUTPUT_DIR": "C:\\Users\\vprad\\Den\\Jobs\\resume_make\\resume-matcher-mcp\\generated-resumes"
      },
      "transport": "stdio",
      "timeout": 30,
      "enabled": true,
      "capabilities": ["health_check", "upload_resume", "list_resumes", "get_resume", "upload_job_description", "tailor_resume", "download_resume_pdf", "configure_llm"]
    }
  }
}
```

## Available Tools

Once connected, Open Cowork can use these tools:

| Tool | Description |
|------|-------------|
| `health_check` | Check if the Resume-Matcher API is running |
| `upload_resume` | Upload a resume (PDF/DOCX) and get a resume_id |
| `list_resumes` | List all stored resumes |
| `get_resume` | Get detailed resume information |
| `upload_job_description` | Upload a job description for tailoring |
| `tailor_resume` | AI-optimize resume for a specific job |
| `download_resume_pdf` | Export tailored resume as PDF |
| `configure_llm` | Configure AI provider settings |

## Usage Examples

### Basic Workflow

1. **Configure LLM** (first time only):
   ```
   Use configure_llm with provider: "openai", model: "gpt-4o", apiKey: "sk-..."
   ```

2. **Upload Resume**:
   ```
   Use upload_resume with filePath: "C:\\path\\to\\resume.pdf"
   ```

3. **Upload Job Description**:
   ```
   Use upload_job_description with jobDescription: "Software Engineer at..."
   ```

4. **Tailor Resume**:
   ```
   Use tailor_resume with resumeId: "abc123", jobId: "def456"
   ```

5. **Download PDF**:
   ```
   Use download_resume_pdf with resumeId: "abc123", template: "swiss-single"
   ```

### In Open Cowork Chat

You can ask Open Cowork natural language requests like:

- "Upload my resume and tailor it for the Google Software Engineer position"
- "Create a PDF of my tailored resume using the modern template"
- "Show me all my resumes and their IDs"

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RESUME_MATCHER_API` | `http://localhost:8000/api/v1` | Resume-Matcher API base URL |
| `RESUME_OUTPUT_DIR` | `./generated-resumes` | Directory for downloaded PDFs |

## Troubleshooting

### MCP Server Won't Start

1. Ensure Node.js v18+ is installed: `node --version`
2. Install dependencies: `npm install`
3. Check if port 8000 is in use: `netstat -ano | findstr :8000`

### Open Cowork Can't Connect

1. Verify the MCP server is running: `node server.js`
2. Check the configuration file path is correct
3. Ensure the `command` and `args` in the config point to the correct server.js path

### API Connection Failed

1. Ensure Resume-Matcher backend is running on port 8000
2. Check the `RESUME_MATCHER_API` environment variable
3. Verify network connectivity: `curl http://localhost:8000/api/v1/health`

## Development

### Testing the MCP Server

Run the test script to verify the server responds:

```bash
node test.js
```

### Adding New Tools

1. Add tool definition in `setupToolHandlers()` method
2. Implement the corresponding method in the `ResumeMatcherMCP` class
3. Add case to the switch statement in `CallToolRequestSchema` handler

## License

This MCP server wrapper is provided as-is, following the Resume-Matcher project's Apache-2.0 license.