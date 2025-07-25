#!/usr/bin/env node

// MCP客户端测试脚本
import { spawn } from 'child_process';

console.log('🧪 测试MCP工具调用...');

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// 测试工具列表
const listToolsMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
};

// 测试Logo提取
const extractLogoMessage = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: {
    name: 'extract_logo',
    arguments: {
      url: 'https://www.google.com',
      format: 'png',
      size: 128
    }
  }
};

server.stdout.on('data', (data) => {
  const response = data.toString();
  console.log('📨 服务器响应:', response);
});

server.stderr.on('data', (data) => {
  console.log('📋 服务器日志:', data.toString());
});

// 发送测试消息
setTimeout(() => {
  console.log('📤 发送工具列表请求...');
  server.stdin.write(JSON.stringify(listToolsMessage) + '\n');
}, 1000);

setTimeout(() => {
  console.log('📤 发送Logo提取请求...');
  server.stdin.write(JSON.stringify(extractLogoMessage) + '\n');
}, 3000);

setTimeout(() => {
  console.log('🔚 测试完成，关闭服务器');
  server.kill('SIGTERM');
  process.exit(0);
}, 8000);
