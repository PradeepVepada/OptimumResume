The Resume-Matcher MCP integrates resume tailoring and optimization directly into Open Cowork, 
enabling AI agents to upload resumes, configure AI providers, and generate job-matched PDFs 
without manual intervention. To use it: 
(1) clone the repo,
(2) install dependencies 
(npm install in resume-matcher-mcp), 
(3) add the MCP server config to Open Cowork's 
~/.open-cowork/mcp-servers.json, 
(4) restart Open Cowork to access resume management tools.

Instructions:

# 1. Clone/Extract both folders
cd Resume-Matcher/apps/backend
cp .env.example .env  # Add API key
uv sync
uv run app

# 2. In another terminal
cd Resume-Matcher/apps/frontend
npm install
npm run dev

# 3. For MCP (separate terminal)
cd resume-matcher-mcp
npm install
node server.js

# 4. Configure Open Cowork
# Add MCP server config to ~/.open-cowork/mcp-servers.json
