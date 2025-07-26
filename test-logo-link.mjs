import { spawn } from 'child_process';

// 测试提取Logo链接功能
function testLogoExtraction() {
  const child = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // 发送MCP请求
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "extract_logo",
      arguments: {
        url: "https://www.tencent.com"
      }
    }
  };

  child.stdin.write(JSON.stringify(request) + '\n');
  child.stdin.end();

  let output = '';
  child.stdout.on('data', (data) => {
    output += data.toString();
  });

  child.on('close', (code) => {
    console.log('测试结果:');
    console.log(output);
    console.log(`进程退出码: ${code}`);
  });

  child.stderr.on('data', (data) => {
    console.error('错误输出:', data.toString());
  });
}

console.log('开始测试Logo链接提取功能...');
testLogoExtraction();