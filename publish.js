const { execSync } = require('child_process');

console.log('🚀 Logo MCP 发布脚本\n');

// 检查NPM登录状态
function checkNpmLogin() {
  try {
    const username = execSync('npm whoami', { encoding: 'utf-8' }).trim();
    console.log(`✅ NPM已登录，用户: ${username}`);
    return username;
  } catch (error) {
    console.log('❌ 请先完成NPM登录');
    console.log('1. 在浏览器中打开: https://www.npmjs.com/login?next=/login/cli/6696923b-9fac-455c-bcde-00be777d7206');
    console.log('2. 使用您的账户登录');
    console.log('3. 登录完成后重新运行此脚本');
    return null;
  }
}

// 检查包名是否可用
function checkPackageAvailability(packageName) {
  try {
    execSync(`npm view ${packageName}`, { stdio: 'pipe' });
    console.log(`⚠️  包名 ${packageName} 已被使用`);
    return false;
  } catch (error) {
    console.log(`✅ 包名 ${packageName} 可用`);
    return true;
  }
}

// 构建项目
function buildProject() {
  try {
    console.log('🔨 构建项目...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 构建成功');
    return true;
  } catch (error) {
    console.log('❌ 构建失败');
    return false;
  }
}

// 发布到NPM
function publishToNpm() {
  try {
    console.log('📦 发布到NPM...');
    execSync('npm publish --access public', { stdio: 'inherit' });
    console.log('✅ 发布成功！');
    return true;
  } catch (error) {
    console.log('❌ 发布失败，可能的原因：');
    console.log('   - 包名已被使用');
    console.log('   - 版本号重复');
    console.log('   - 网络问题');
    return false;
  }
}

// 主发布流程
function publish() {
  console.log('📋 开始发布流程...\n');

  // 确保使用官方NPM源
  try {
    console.log('🔧 确认NPM源...');
    execSync('npm config set registry https://registry.npmjs.org/', { stdio: 'inherit' });
    console.log('✅ NPM源设置完成');
  } catch (error) {
    console.log('⚠️  NPM源设置警告，继续执行...');
  }

  // 检查NPM登录
  const username = checkNpmLogin();
  if (!username) return;

  // 检查包名可用性
  const packageName = 'logo-mcp';
  const isAvailable = checkPackageAvailability(packageName);
  
  if (!isAvailable) {
    console.log('\n💡 建议的替代包名：');
    console.log(`   - @${username}/logo-mcp`);
    console.log('   - logo-mcp-extractor');
    console.log('   - website-logo-mcp');
    console.log('\n请修改 package.json 中的 name 字段，然后重新运行此脚本');
    return;
  }

  // 构建项目
  if (!buildProject()) return;

  // 发布
  const success = publishToNpm();

  if (success) {
    console.log('\n🎉 发布完成！');
    console.log(`📦 包名: ${packageName}`);
    console.log(`👤 发布者: ${username}`);
    console.log(`🔗 NPM页面: https://www.npmjs.com/package/${packageName}`);
    console.log('\n📖 用户使用方式：');
    console.log(`   npx ${packageName}`);
    console.log(`   npm install -g ${packageName}`);
    console.log('\n🔧 MCP客户端配置：');
    console.log('   Claude Desktop: 添加到 claude_desktop_config.json');
    console.log('   Cursor: 创建 .cursorrules 文件');
    console.log('   其他客户端: 使用 npx logo-mcp 作为命令');
  }
}

publish();