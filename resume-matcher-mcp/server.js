#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import FormData from "form-data";

// Configuration
const API_BASE = process.env.RESUME_MATCHER_API || "http://localhost:8000/api/v1";
const OUTPUT_DIR =
  process.env.RESUME_OUTPUT_DIR || path.join(process.cwd(), "generated-resumes");

class ResumeMatcherMCP {
  constructor() {
    this.server = new Server(
      { name: "resume-matcher", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "health_check",
          description: "Check if the Resume-Matcher API is running and healthy.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "upload_resume",
          description:
            "Upload a resume (PDF or DOCX) to Resume-Matcher. Returns a resume_id for later use.",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Absolute path to the resume PDF or DOCX file",
              },
            },
            required: ["filePath"],
          },
        },
        {
          name: "list_resumes",
          description: "List all resumes stored in Resume-Matcher.",
          inputSchema: {
            type: "object",
            properties: {
              includeMaster: {
                type: "boolean",
                description: "Include the master resume in the list",
                default: false,
              },
            },
          },
        },
        {
          name: "get_resume",
          description: "Get resume details by resume_id.",
          inputSchema: {
            type: "object",
            properties: {
              resumeId: { type: "string", description: "The resume ID" },
            },
            required: ["resumeId"],
          },
        },
        {
          name: "upload_job_description",
          description:
            "Upload a job description. Returns a job_id for tailoring resumes.",
          inputSchema: {
            type: "object",
            properties: {
              jobDescription: {
                type: "string",
                description: "The full job description text",
              },
              resumeId: {
                type: "string",
                description: "Optional resume_id to associate with this job",
              },
            },
            required: ["jobDescription"],
          },
        },
        {
          name: "tailor_resume",
          description:
            "Tailor a resume to match a job description using AI. This generates an improved version optimized for the specific role.",
          inputSchema: {
            type: "object",
            properties: {
              resumeId: { type: "string", description: "The resume ID to tailor" },
              jobId: { type: "string", description: "The job description ID" },
            },
            required: ["resumeId", "jobId"],
          },
        },
        {
          name: "download_resume_pdf",
          description:
            "Download a tailored resume as PDF. Saves to the generated-resumes folder.",
          inputSchema: {
            type: "object",
            properties: {
              resumeId: { type: "string", description: "The resume ID to download" },
              template: {
                type: "string",
                description: "Template to use: swiss-single, swiss-two-column, modern, modern-two-column, latex, clean, or vivid",
                default: "swiss-single",
              },
              filename: {
                type: "string",
                description: "Custom filename for the saved PDF (without extension)",
                default: "resume",
              },
            },
            required: ["resumeId"],
          },
        },
        {
          name: "configure_llm",
          description:
            "Configure the LLM provider for Resume-Matcher. Must be done before tailoring resumes.",
          inputSchema: {
            type: "object",
            properties: {
              provider: {
                type: "string",
                description: "LLM provider: openai, anthropic, gemini, deepseek, ollama, openai_compatible, openrouter",
              },
              model: { type: "string", description: "Model name (e.g. gpt-4o, claude-haiku-4-5-20251001)" },
              apiKey: { type: "string", description: "API key for the provider (not needed for Ollama)" },
              apiBase: {
                type: "string",
                description: "Custom API base URL (for Ollama or openai_compatible)",
              },
            },
            required: ["provider", "model"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "health_check":
          return await this.healthCheck();
        case "upload_resume":
          return await this.uploadResume(request.params.arguments);
        case "list_resumes":
          return await this.listResumes(request.params.arguments);
        case "get_resume":
          return await this.getResume(request.params.arguments);
        case "upload_job_description":
          return await this.uploadJobDescription(request.params.arguments);
        case "tailor_resume":
          return await this.tailorResume(request.params.arguments);
        case "download_resume_pdf":
          return await this.downloadResumePDF(request.params.arguments);
        case "configure_llm":
          return await this.configureLLM(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async apiCall(endpoint, method = "GET", body = null, isFormData = false) {
    const options = {
      method,
      headers: {},
    };

    if (body && !isFormData) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    } else if (body && isFormData) {
      options.body = body;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${text}`);
    }

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  async healthCheck() {
    try {
      const result = await this.apiCall("/health");
      return {
        content: [
          {
            type: "text",
            text: `✅ Resume-Matcher API is healthy\n\nStatus: ${result.status}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ API is not reachable: ${error.message}` }],
        isError: true,
      };
    }
  }

  async uploadResume(args) {
    try {
      const { filePath } = args;

      if (!filePath) throw new Error("filePath is required");

      const fileBuffer = await fs.readFile(filePath);
      const fileName = path.basename(filePath);

      const form = new FormData();
      form.append("file", fileBuffer, { filename: fileName, contentType: this.getMimeType(fileName) });

      const result = await this.apiCall("/resumes/upload", "POST", form, true);

      return {
        content: [
          {
            type: "text",
            text:
              `✅ **Resume uploaded successfully!**\n\n` +
              `📄 **Resume ID:** ${result.resume_id}\n` +
              `📋 **Status:** ${result.processing_status}\n` +
              `📁 **Master:** ${result.is_master ? "Yes" : "No"}\n\n` +
              `Use the resume_id with **tailor_resume** or **download_resume_pdf**.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `❌ **Upload failed:** ${error.message}` },
        ],
        isError: true,
      };
    }
  }

  async listResumes(args) {
    try {
      const { includeMaster = false } = args;
      const result = await this.apiCall(`/resumes/list?include_master=${includeMaster}`);

      let text = "📋 **Your Resumes:**\n\n";
      if (result.data && result.data.length > 0) {
        for (const r of result.data) {
          const tag = r.is_master ? " ⭐ MASTER" : "";
          const title = r.title || r.filename || "Untitled";
          text += `- **${title}** (ID: ${r.resume_id})${tag}\n`;
        }
      } else {
        text += "No resumes found. Upload one first with **upload_resume**.";
      }

      return { content: [{ type: "text", text }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
        isError: true,
      };
    }
  }

  async getResume(args) {
    try {
      const { resumeId } = args;
      const result = await this.apiCall(`/resumes?resume_id=${resumeId}`);
      return {
        content: [
          {
            type: "text",
            text: `📄 **Resume Details:**\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
        isError: true,
      };
    }
  }

  async uploadJobDescription(args) {
    try {
      const { jobDescription, resumeId } = args;

      if (!jobDescription) throw new Error("jobDescription is required");

      const body = {
        job_descriptions: [jobDescription],
      };
      if (resumeId) body.resume_id = resumeId;

      const result = await this.apiCall("/jobs/upload", "POST", body);

      return {
        content: [
          {
            type: "text",
            text:
              `✅ **Job description uploaded!**\n\n` +
              `🆔 **Job ID:** ${result.job_id[0]}\n\n` +
              `Use this job_id with **tailor_resume** along with a resume_id.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
        isError: true,
      };
    }
  }

  async tailorResume(args) {
    try {
      const { resumeId, jobId } = args;

      if (!resumeId || !jobId) throw new Error("resumeId and jobId are required");

      const result = await this.apiCall("/resumes/improve", "POST", {
        resume_id: resumeId,
        job_id: jobId,
      });

      const preview = result.data?.resume_preview;
      const warnings = result.data?.warnings || [];

      let text = `✅ **Resume tailored successfully!**\n\n`;
      text += `🆔 **New Resume ID:** ${result.data?.resume_id}\n`;
      text += `💼 **Job ID:** ${result.data?.job_id}\n`;

      if (warnings.length > 0) {
        text += `\n⚠️ **Warnings:**\n`;
        for (const w of warnings) text += `- ${w}\n`;
      }

      text += `\nUse **download_resume_pdf** with resume_id \`${result.data?.resume_id}\` to get the PDF.`;

      return { content: [{ type: "text", text }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ **Tailoring failed:** ${error.message}` }],
        isError: true,
      };
    }
  }

  async downloadResumePDF(args) {
    try {
      const { resumeId, template = "swiss-single", filename = "resume" } = args;

      // Ensure output directory exists
      await fs.mkdir(OUTPUT_DIR, { recursive: true });

      const params = new URLSearchParams({ template });
      const response = await fetch(
        `${API_BASE}/resumes/${resumeId}/pdf?${params}`,
        { method: "GET" }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`PDF generation failed (${response.status}): ${text}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const timestamp = new Date().toISOString().split("T")[0];
      const safeFilename = filename.replace(/[<>:"|?*]/g, "_");
      const outputPath = path.join(OUTPUT_DIR, `${safeFilename}-${timestamp}.pdf`);

      await fs.writeFile(outputPath, buffer);

      return {
        content: [
          {
            type: "text",
            text:
              `✅ **PDF downloaded successfully!**\n\n` +
              `📄 **File:** ${outputPath}\n` +
              `📏 **Size:** ${(buffer.length / 1024).toFixed(2)} KB\n` +
              `🎨 **Template:** ${template}\n`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ **Download failed:** ${error.message}` }],
        isError: true,
      };
    }
  }

  async configureLLM(args) {
    try {
      const { provider, model, apiKey, apiBase } = args;

      const body = { provider, model };
      if (apiKey) body.api_key = apiKey;
      if (apiBase) body.api_base = apiBase;

      const result = await this.apiCall("/config/llm", "PATCH", body);

      return {
        content: [
          {
            type: "text",
            text:
              `✅ **LLM configured!**\n\n` +
              `🔧 **Provider:** ${provider}\n` +
              `🤖 **Model:** ${model}\n` +
              (apiBase ? `🌐 **API Base:** ${apiBase}\n` : "") +
              `\nYou can now use **tailor_resume** to generate AI-tailored resumes.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ **Configuration failed:** ${error.message}` }],
        isError: true,
      };
    }
  }

  getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
      ".pdf": "application/pdf",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".doc": "application/msword",
    };
    return types[ext] || "application/octet-stream";
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Resume Matcher MCP server running on stdio");
  }
}

const server = new ResumeMatcherMCP();
server.run().catch(console.error);
