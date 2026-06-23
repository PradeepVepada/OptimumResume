#!/usr/bin/env node

// Simple test script to verify MCP server responds to tool listing
import { spawn } from 'child_process';
import path from 'path';

const serverPath = path.join(process.cwd(), 'server.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

// Send MCP request to list tools
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

server.stdin.write(JSON.stringify(request) + '\n');

let output = '';
server.stdout.on('data', (data) => {
  output += data.toString();
  // Try to parse the response
  try {
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        const response = JSON.parse(line);
        if (response.id === 1) {
          console.log('MCP Server Response:');
          console.log(JSON.stringify(response, null, 2));
          console.log('\nTools available:');
          if (response.result && response.result.tools) {
            response.result.tools.forEach(tool => {
              console.log(`- ${tool.name}: ${tool.description}`);
            });
          }
          server.kill();
          process.exit(0);
        }
      }
    }
  } catch (e) {
    // Not complete JSON yet, wait for more data
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

setTimeout(() => {
  console.log('Timeout waiting for response');
  server.kill();
  process.exit(1);
}, 5000);
