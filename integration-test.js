#!/usr/bin/env node

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 Logo MCP 集成测试\n');

class MCPIntegrationTest {
  constructor() {
    this.testResults = [];
    this.server = null;
  }

  // 测试1: 验证NPX安装
  async testNpxInstallation() {
    console.log('1️⃣ 测试NPX安装...');
    try {
      // 模拟npx安装测试
      const result = await this.runCommand('npm', ['pack']);
      if (result.success) {
        console.log('   ✅ 包打包成功');
        this.testResults.push({ test: 'NPX安装', status: 'PASS' });
        return true;
      }
    } catch (error) {
      console.log(`   ❌ NPX安装测试失败: ${error.message}`);
      this.testResults.push({ test: 'NPX安装', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // 测试2: MCP服务器启动
  async testMCPServerStart() {
    console.log('2️⃣ 测试MCP服务器启动...');
    try {
      this.server = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const startupPromise = new Promise((resolve, reject) => {
        let output = '';
        
        this.server.stderr.on('data', (data) => {
          output += data.toString();
          if (output.includes('Logo MCP服务器已启动')) {
            resolve(true);
          }
        });

        this.server.on('error', reject);
        
        setTimeout(() => reject(new Error('启动超时')), 5000);
      });

      await startupPromise;
      console.log('   ✅ MCP服务器启动成功');
      this.testResults.push({ test: 'MCP服务器启动', status: 'PASS' });
      return true;
    } catch (error) {
      console.log(`   ❌ MCP服务器启动失败: ${error.message}`);
      this.testResults.push({ test: 'MCP服务器启动', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // 测试3: 工具列表获取
  async testToolsList() {
    console.log('3️⃣ 测试工具列表获取...');
    try {
      const response = await this.sendMCPMessage('tools/list');
      
      if (response.result && response.result.tools && response.result.tools.length >= 2) {
        const toolNames = response.result.tools.map(t => t.name);
        if (toolNames.includes('extract_logo') && toolNames.includes('analyze_logo_candidates')) {
          console.log('   ✅ 工具列表正确');
          console.log(`   📋 找到工具: ${toolNames.join(', ')}`);
          this.testResults.push({ test: '工具列表获取', status: 'PASS' });
          return true;
        }
      }
      
      throw new Error('工具列表不完整');
    } catch (error) {
      console.log(`   ❌ 工具列表获取失败: ${error.message}`);
      this.testResults.push({ test: '工具列表获取', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // 测试4: Logo提取功能
  async testLogoExtraction() {
    console.log('4️⃣ 测试Logo提取功能...');
    try {
      const response = await this.sendMCPMessage('tools/call', {
        name: 'extract_logo',
        arguments: {
          url: 'https://www.google.com',
          format: 'png',
          size: 64
        }
      });

      if (response.result && response.result.content) {
        console.log('   ✅ Logo提取功能正常');
        this.testResults.push({ test: 'Logo提取功能', status: 'PASS' });
        return true;
      }
      
      throw new Error('Logo提取响应格式错误');
    } catch (error) {
      console.log(`   ❌ Logo提取功能失败: ${error.message}`);
      this.testResults.push({ test: 'Logo提取功能', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // 测试5: 候选项分析功能
  async testCandidateAnalysis() {
    console.log('5️⃣ 测试候选项分析功能...');
    try {
      const response = await this.sendMCPMessage('tools/call', {
        name: 'analyze_logo_candidates',
        arguments: {
          url: 'https://www.apple.com'
        }
      });

      if (response.result && response.result.content) {
        console.log('   ✅ 候选项分析功能正常');
        this.testResults.push({ test: '候选项分析功能', status: 'PASS' });
        return true;
      }
      
      throw new Error('候选项分析响应格式错误');
    } catch (error) {
      console.log(`   ❌ 候选项分析功能失败: ${error.message}`);
      this.testResults.push({ test: '候选项分析功能', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // 测试6: 配置文件生成
  async testConfigGeneration() {
    console.log('6️⃣ 测试配置文件生成...');
    try {
      // 生成Claude Desktop配置
      const claudeConfig = {
        mcpServers: {
          "logo-mcp": {
            command: "npx",
            args: ["logo-mcp"]
          }
        }
      };

      // 生成Cursor配置
      const cursorConfig = `# Logo MCP 集成
使用logo-mcp工具提取网站Logo：
- extract_logo: 提取并优化Logo
- analyze_logo_candidates: 分析Logo候选项

示例用法：
请帮我提取 https://www.google.com 的Logo`;

      // 保存配置文件
      writeFileSync('claude-config.json', JSON.stringify(claudeConfig, null, 2));
      writeFileSync('cursor-config.txt', cursorConfig);

      console.log('   ✅ 配置文件生成成功');
      console.log('   📁 claude-config.json - Claude Desktop配置');
      console.log('   📁 cursor-config.txt - Cursor配置');
      
      this.testResults.push({ test: '配置文件生成', status: 'PASS' });
      return true;
    } catch (error) {
      console.log(`   ❌ 配置文件生成失败: ${error.message}`);
      this.testResults.push({ test: '配置文件生成', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // 发送MCP消息
  async sendMCPMessage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = Date.now();
      const message = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      let responseData = '';
      
      const dataHandler = (data) => {
        responseData += data.toString();
        const lines = responseData.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line);
              if (response.id === id) {
                this.server.stdout.removeListener('data', dataHandler);
                resolve(response);
                return;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      };

      this.server.stdout.on('data', dataHandler);
      this.server.stdin.write(JSON.stringify(message) + '\n');

      setTimeout(() => {
        this.server.stdout.removeListener('data', dataHandler);
        reject(new Error('响应超时'));
      }, 10000);
    });
  }

  // 运行命令
  async runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { stdio: 'pipe' });
      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(error || `命令执行失败，退出码: ${code}`));
        }
      });
    });
  }

  // 生成测试报告
  generateReport() {
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const totalTests = this.testResults.length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        successRate: `${successRate}%`
      },
      tests: this.testResults,
      recommendations: []
    };

    // 添加建议
    if (successRate < 100) {
      report.recommendations.push('部分测试失败，请检查错误信息并修复');
    }
    if (successRate >= 80) {
      report.recommendations.push('系统基本可用，可以进行发布');
    }
    if (successRate === 100) {
      report.recommendations.push('所有测试通过，系统完全可用');
    }

    writeFileSync('integration-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 测试报告:');
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过数: ${passedTests}`);
    console.log(`   失败数: ${totalTests - passedTests}`);
    console.log(`   成功率: ${successRate}%`);
    console.log(`   报告文件: integration-test-report.json`);

    return successRate === 100;
  }

  // 清理资源
  cleanup() {
    if (this.server) {
      this.server.kill('SIGTERM');
      console.log('\n🧹 清理完成');
    }
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.testNpxInstallation();
      await this.testMCPServerStart();
      await this.testToolsList();
      await this.testLogoExtraction();
      await this.testCandidateAnalysis();
      await this.testConfigGeneration();
      
      const allPassed = this.generateReport();
      
      if (allPassed) {
        console.log('\n🎉 所有集成测试通过！系统可以发布。');
      } else {
        console.log('\n⚠️  部分测试失败，建议修复后再发布。');
      }
      
      return allPassed;
    } finally {
      this.cleanup();
    }
  }
}

// 运行集成测试
const tester = new MCPIntegrationTest();
tester.runAllTests().catch(console.error);