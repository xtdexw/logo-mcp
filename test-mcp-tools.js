#!/usr/bin/env node

import { spawn } from 'child_process';
import { EventEmitter } from 'events';

class MCPTestClient extends EventEmitter {
  constructor() {
    super();
    this.server = null;
    this.messageId = 0;
    this.responses = new Map();
  }

  async start() {
    console.log('🚀 启动MCP服务器...');
    
    this.server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.id && this.responses.has(response.id)) {
            const resolve = this.responses.get(response.id);
            this.responses.delete(response.id);
            resolve(response);
          }
        } catch (e) {
          // 忽略非JSON响应
        }
      }
    });

    this.server.stderr.on('data', (data) => {
      const message = data.toString();
      if (message.includes('Logo MCP服务器已启动')) {
        console.log('✅ MCP服务器已启动');
        this.emit('ready');
      }
    });

    this.server.on('error', (error) => {
      console.error('❌ 服务器错误:', error);
    });

    // 等待服务器启动
    await new Promise((resolve) => {
      this.once('ready', resolve);
      setTimeout(() => {
        console.log('⚠️  服务器启动超时，继续测试...');
        resolve();
      }, 3000);
    });
  }

  async sendMessage(method, params = {}) {
    const id = ++this.messageId;
    const message = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.responses.set(id, resolve);
      
      this.server.stdin.write(JSON.stringify(message) + '\n');
      
      // 超时处理
      setTimeout(() => {
        if (this.responses.has(id)) {
          this.responses.delete(id);
          reject(new Error('请求超时'));
        }
      }, 10000);
    });
  }

  async testListTools() {
    console.log('\n📋 测试工具列表...');
    try {
      const response = await this.sendMessage('tools/list');
      
      if (response.result && response.result.tools) {
        console.log(`✅ 找到 ${response.result.tools.length} 个工具:`);
        response.result.tools.forEach(tool => {
          console.log(`   - ${tool.name}: ${tool.description}`);
        });
        return true;
      } else {
        console.log('❌ 工具列表响应格式错误');
        return false;
      }
    } catch (error) {
      console.log(`❌ 工具列表测试失败: ${error.message}`);
      return false;
    }
  }

  async testExtractLogo() {
    console.log('\n🎯 测试Logo提取...');
    try {
      const response = await this.sendMessage('tools/call', {
        name: 'extract_logo',
        arguments: {
          url: 'https://www.google.com',
          format: 'png',
          size: 64
        }
      });

      if (response.result) {
        console.log('✅ Logo提取测试成功');
        console.log('   响应内容:', response.result.content?.[0]?.text?.substring(0, 100) + '...');
        return true;
      } else if (response.error) {
        console.log(`❌ Logo提取失败: ${response.error.message}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Logo提取测试失败: ${error.message}`);
      return false;
    }
  }

  async testAnalyzeCandidates() {
    console.log('\n🔍 测试Logo候选项分析...');
    try {
      const response = await this.sendMessage('tools/call', {
        name: 'analyze_logo_candidates',
        arguments: {
          url: 'https://www.apple.com'
        }
      });

      if (response.result) {
        console.log('✅ Logo候选项分析测试成功');
        console.log('   响应内容:', response.result.content?.[0]?.text?.substring(0, 100) + '...');
        return true;
      } else if (response.error) {
        console.log(`❌ Logo候选项分析失败: ${response.error.message}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Logo候选项分析测试失败: ${error.message}`);
      return false;
    }
  }

  async stop() {
    if (this.server) {
      this.server.kill('SIGTERM');
      console.log('\n🔚 MCP服务器已关闭');
    }
  }
}

async function runTests() {
  console.log('🧪 MCP工具测试开始\n');
  
  const client = new MCPTestClient();
  
  try {
    await client.start();
    
    const results = {
      listTools: await client.testListTools(),
      extractLogo: await client.testExtractLogo(),
      analyzeCandidates: await client.testAnalyzeCandidates()
    };
    
    console.log('\n📊 测试结果总结:');
    console.log(`   工具列表: ${results.listTools ? '✅' : '❌'}`);
    console.log(`   Logo提取: ${results.extractLogo ? '✅' : '❌'}`);
    console.log(`   候选项分析: ${results.analyzeCandidates ? '✅' : '❌'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 测试通过率: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 所有测试通过！MCP系统工作正常。');
    } else {
      console.log('\n⚠️  部分测试失败，请检查错误信息。');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  } finally {
    await client.stop();
  }
}

runTests().catch(console.error);