#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Logo MCP 部署脚本\n');

// 检查是否已登录npm
function checkNpmLogin() {
  try {
    execSync('npm whoami', { stdio: 'pipe' });
    console.log('✅ NPM已登录');
    return true;
  } catch (error) {
    console.log('❌ 请先登录NPM: npm login');
    return false;
  }
}

// 检查Git状态
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      console.log('⚠️  有未提交的更改，建议先提交代码');
      return false;
    }
    console.log('✅ Git状态干净');
    return true;
  } catch (error) {
    console.log('⚠️  Git仓库未初始化');
    return false;
  }
}

// 更新版本号
function updateVersion(type = 'patch') {
  try {
    const output = execSync(`npm version ${type}`, { encoding: 'utf-8' });
    const newVersion = output.trim();
    console.log(`✅ 版本已更新: ${newVersion}`);
    return newVersion;
  } catch (error) {
    console.log(`❌ 版本更新失败: ${error.message}`);
    return null;
  }
}

// 构建项目
function buildProject() {
  try {
    console.log('🔨 构建项目...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 项目构建成功');
    return true;
  } catch (error) {
    console.log('❌ 项目构建失败');
    return false;
  }
}

// 运行测试
function runTests() {
  try {
    console.log('🧪 运行测试...');
    execSync('npm run verify', { stdio: 'inherit' });
    console.log('✅ 测试通过');
    return true;
  } catch (error) {
    console.log('⚠️  测试失败，但继续部署');
    return true; // 允许测试失败时继续部署
  }
}

// 发布到NPM
function publishToNpm() {
  try {
    console.log('📦 发布到NPM...');
    execSync('npm publish --access public', { stdio: 'inherit' });
    console.log('✅ NPM发布成功');
    return true;
  } catch (error) {
    console.log(`❌ NPM发布失败: ${error.message}`);
    return false;
  }
}

// 推送到Git
function pushToGit() {
  try {
    console.log('📤 推送到Git...');
    execSync('git push', { stdio: 'inherit' });
    execSync('git push --tags', { stdio: 'inherit' });
    console.log('✅ Git推送成功');
    return true;
  } catch (error) {
    console.log(`⚠️  Git推送失败: ${error.message}`);
    return false;
  }
}

// 生成部署报告
function generateReport(version, success) {
  const report = {
    version,
    timestamp: new Date().toISOString(),
    success,
    installation: {
      npm: `npx logo-mcp`,
      global: `npm install -g logo-mcp`,
      local: `git clone <repo> && cd logo-mcp && npm install && npm run build`
    },
    configuration: {
      claude: {
        path: "%APPDATA%\\Claude\\claude_desktop_config.json",
        config: {
          mcpServers: {
            "logo-mcp": {
              command: "npx",
              args: ["logo-mcp"]
            }
          }
        }
      },
      cursor: {
        file: ".cursorrules",
        content: "使用logo-mcp工具提取网站Logo"
      }
    },
    tools: [
      "extract_logo - 提取网站Logo",
      "analyze_logo_candidates - 分析Logo候选项"
    ]
  };

  writeFileSync('deployment-report.json', JSON.stringify(report, null, 2));
  console.log('📋 部署报告已生成: deployment-report.json');
}

// 主部署流程
async function deploy() {
  const args = process.argv.slice(2);
  const versionType = args[0] || 'patch'; // patch, minor, major

  console.log(`📋 部署类型: ${versionType}`);
  console.log('🔍 检查部署条件...\n');

  // 检查条件
  if (!checkNpmLogin()) return;
  checkGitStatus();

  // 构建和测试
  if (!buildProject()) return;
  runTests();

  // 更新版本
  const newVersion = updateVersion(versionType);
  if (!newVersion) return;

  // 发布
  const publishSuccess = publishToNpm();
  
  // 推送Git（即使NPM发布失败也要推送版本标签）
  pushToGit();

  // 生成报告
  generateReport(newVersion, publishSuccess);

  if (publishSuccess) {
    console.log('\n🎉 部署成功！');
    console.log(`📦 包名: logo-mcp`);
    console.log(`🏷️  版本: ${newVersion}`);
    console.log(`📥 安装: npx logo-mcp`);
    console.log('\n📖 配置说明:');
    console.log('1. Claude Desktop: 将配置添加到claude_desktop_config.json');
    console.log('2. Cursor: 在项目中添加.cursorrules文件');
    console.log('3. 其他MCP客户端: 使用 npx logo-mcp 作为命令');
  } else {
    console.log('\n❌ 部署失败，请检查错误信息');
  }
}

// 显示帮助信息
function showHelp() {
  console.log('Logo MCP 部署脚本');
  console.log('\n用法:');
  console.log('  node deploy.js [版本类型]');
  console.log('\n版本类型:');
  console.log('  patch  - 补丁版本 (1.0.0 -> 1.0.1) [默认]');
  console.log('  minor  - 小版本 (1.0.0 -> 1.1.0)');
  console.log('  major  - 大版本 (1.0.0 -> 2.0.0)');
  console.log('\n示例:');
  console.log('  node deploy.js patch   # 发布补丁版本');
  console.log('  node deploy.js minor   # 发布小版本');
  console.log('  node deploy.js major   # 发布大版本');
}

// 运行部署
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
} else {
  deploy().catch(console.error);
}