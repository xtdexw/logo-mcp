const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试提取华为云logo
async function testHuaweiLogo() {
  console.log('开始测试华为云logo提取...');
  
  // 创建logo目录
  const logoDir = './logo';
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }
  
  // 启动MCP服务器进程
  const mcpProcess = spawn('node', ['src/index.ts'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // 发送MCP请求
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'extract_logo',
      arguments: {
        url: 'https://www.huaweicloud.com',
        optimize: true,
        format: 'both',
        size: 256,
        outputDir: './logo'
      }
    }
  };
  
  mcpProcess.stdin.write(JSON.stringify(request) + '\n');
  
  mcpProcess.stdout.on('data', (data) => {
    console.log('MCP响应:', data.toString());
  });
  
  mcpProcess.stderr.on('data', (data) => {
    console.error('MCP错误:', data.toString());
  });
  
  // 等待5秒后检查结果
  setTimeout(() => {
    mcpProcess.kill();
    
    // 检查logo目录中的文件
    const files = fs.readdirSync(logoDir);
    console.log('logo目录中的文件:', files);
    
    if (files.length > 0) {
      console.log('✅ 成功保存logo文件！');
      files.forEach(file => {
        const filePath = path.join(logoDir, file);
        const stats = fs.statSync(filePath);
        console.log(`- ${file}: ${stats.size} bytes`);
      });
    } else {
      console.log('❌ 没有找到保存的logo文件');
    }
  }, 5000);
}

testHuaweiLogo().catch(console.error);