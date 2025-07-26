#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 测试Logo MCP本地保存功能...\n');

// 创建测试目录
const testDir = './test-logo-output';
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
  console.log(`✅ 创建测试目录: ${testDir}`);
}

// 测试MCP工具
const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'extract_logo',
    arguments: {
      url: 'https://cloud.tencent.com',
      format: 'png',
      size: 256,
      outputDir: testDir
    }
  }
};

console.log('📤 发送测试请求...');
console.log(JSON.stringify(testRequest, null, 2));

const mcp = spawn('npx', ['@pickstar-2025/logo-mcp@latest'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

mcp.stdin.write(JSON.stringify(testRequest) + '\n');
mcp.stdin.end();

let output = '';
mcp.stdout.on('data', (data) => {
  output += data.toString();
});

mcp.on('close', (code) => {
  console.log('\n📥 MCP响应:');
  console.log(output);
  
  // 检查文件是否已保存
  console.log('\n🔍 检查保存的文件...');
  const files = fs.readdirSync(testDir);
  if (files.length > 0) {
    console.log('✅ 成功保存文件:');
    files.forEach(file => {
      const filePath = path.join(testDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  - ${file} (${stats.size} bytes)`);
    });
  } else {
    console.log('❌ 没有找到保存的文件');
  }
});

mcp.stderr.on('data', (data) => {
  console.error('错误:', data.toString());
});