# Logo MCP 发布和集成指南

## 1. 准备发布到NPM

### 1.1 更新package.json
```json
{
  "name": "@your-username/logo-mcp",
  "version": "1.0.0",
  "description": "基于AI MCP协议的网站Logo自动提取系统",
  "main": "dist/index.js",
  "type": "module",
  "bin": {
    "logo-mcp": "dist/index.js"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "package.json"
  ],
  "keywords": [
    "mcp",
    "logo",
    "extraction",
    "ai",
    "model-context-protocol",
    "favicon",
    "brand"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/logo-mcp.git"
  },
  "homepage": "https://github.com/your-username/logo-mcp#readme",
  "bugs": {
    "url": "https://github.com/your-username/logo-mcp/issues"
  },
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.2 创建.npmignore文件
```
src/
*.ts
tsconfig.json
test-*.js
verify-*.js
cli.js
start.js
logos/
.git/
.codebuddy/
node_modules/
```

### 1.3 发布到NPM
```bash
# 构建项目
npm run build

# 登录NPM
npm login

# 发布
npm publish --access public
```

## 2. 创建GitHub仓库

### 2.1 初始化Git仓库
```bash
git init
git add .
git commit -m "Initial commit: Logo MCP系统"
```

### 2.2 创建GitHub仓库并推送
```bash
# 在GitHub上创建仓库后
git remote add origin https://github.com/your-username/logo-mcp.git
git branch -M main
git push -u origin main
```

### 2.3 创建Release
在GitHub上创建Release，包含：
- 版本标签 (v1.0.0)
- 发布说明
- 使用示例

## 3. 标准化MCP配置

### 3.1 创建标准配置文件
```json
{
  "name": "logo-mcp",
  "description": "网站Logo自动提取系统",
  "version": "1.0.0",
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://github.com/your-username/logo-mcp",
  "installation": {
    "npm": "npx @your-username/logo-mcp",
    "git": "git clone https://github.com/your-username/logo-mcp.git"
  },
  "configuration": {
    "command": "npx",
    "args": ["@your-username/logo-mcp"],
    "env": {}
  },
  "tools": [
    {
      "name": "extract_logo",
      "description": "从指定网站URL提取Logo图标"
    },
    {
      "name": "analyze_logo_candidates",
      "description": "分析网站的所有Logo候选项"
    }
  ]
}
```

### 3.2 更新README.md添加标准安装说明
```markdown
## 安装方式

### 方式1: NPM包 (推荐)
```bash
npx @your-username/logo-mcp
```

### 方式2: 本地安装
```bash
npm install -g @your-username/logo-mcp
logo-mcp
```

### 方式3: 源码安装
```bash
git clone https://github.com/your-username/logo-mcp.git
cd logo-mcp
npm install
npm run build
npm start
```

## MCP客户端配置

### Claude Desktop
```json
{
  "mcpServers": {
    "logo-mcp": {
      "command": "npx",
      "args": ["@your-username/logo-mcp"]
    }
  }
}
```

### Cursor
在项目根目录创建 `.cursorrules` 文件：
```
# Logo MCP 集成
使用logo-mcp工具提取网站Logo：
- extract_logo: 提取并优化Logo
- analyze_logo_candidates: 分析Logo候选项
```

### CodeBuddy
在项目中添加MCP配置：
```json
{
  "mcp": {
    "servers": {
      "logo-mcp": {
        "command": "npx",
        "args": ["@your-username/logo-mcp"]
      }
    }
  }
}
```
```

## 4. 创建集成示例

### 4.1 Claude Desktop集成示例
```json
{
  "mcpServers": {
    "logo-mcp": {
      "command": "npx",
      "args": ["@your-username/logo-mcp"],
      "env": {}
    }
  }
}
```

### 4.2 Cursor集成示例
创建 `.cursor/mcp.json`:
```json
{
  "servers": {
    "logo-mcp": {
      "command": "npx",
      "args": ["@your-username/logo-mcp"]
    }
  }
}
```

### 4.3 通用MCP客户端配置
```json
{
  "name": "logo-mcp",
  "command": "npx",
  "args": ["@your-username/logo-mcp"],
  "description": "网站Logo提取工具",
  "tools": ["extract_logo", "analyze_logo_candidates"]
}
```

## 5. 文档和示例

### 5.1 创建详细的API文档
```markdown
# API 文档

## extract_logo

提取网站Logo并进行优化处理。

### 参数
- `url` (string, 必需): 网站URL
- `optimize` (boolean, 可选): 是否优化，默认true
- `format` (string, 可选): 输出格式 'png'|'svg'|'both'
- `size` (number, 可选): 输出尺寸，默认256

### 示例
```json
{
  "tool": "extract_logo",
  "arguments": {
    "url": "https://www.google.com",
    "format": "both",
    "size": 256
  }
}
```

### 返回值
```json
{
  "url": "https://www.google.com",
  "logoUrl": "https://www.google.com/favicon.ico",
  "files": [
    {
      "format": "png",
      "data": "base64编码数据",
      "size": 256
    }
  ]
}
```
```

### 5.2 创建使用示例
```javascript
// 使用示例
const logoMCP = require('@your-username/logo-mcp');

// 提取Logo
const result = await logoMCP.extractLogo({
  url: 'https://www.google.com',
  format: 'png',
  size: 256
});

console.log('Logo提取成功:', result);
```

## 6. 测试和验证

### 6.1 创建自动化测试
```bash
# 添加到package.json scripts
"test:integration": "node test/integration.js",
"test:mcp": "node test/mcp-client.js"
```

### 6.2 CI/CD配置 (.github/workflows/test.yml)
```yaml
name: Test Logo MCP
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test:integration
      - run: npm run test:mcp
```

## 7. 发布清单

### 发布前检查
- [ ] 代码构建成功
- [ ] 所有测试通过
- [ ] README.md完整
- [ ] package.json信息正确
- [ ] LICENSE文件存在
- [ ] .npmignore配置正确
- [ ] GitHub仓库创建
- [ ] 版本号更新

### 发布步骤
1. `npm run build` - 构建项目
2. `npm test` - 运行测试
3. `git tag v1.0.0` - 创建版本标签
4. `git push --tags` - 推送标签
5. `npm publish` - 发布到NPM
6. 在GitHub创建Release

### 发布后验证
- [ ] NPM包可以正常安装
- [ ] `npx @your-username/logo-mcp` 正常运行
- [ ] MCP客户端可以正常连接
- [ ] 工具调用正常工作

## 8. 维护和更新

### 版本管理
```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 小版本 (1.0.0 -> 1.1.0)
npm version minor

# 大版本 (1.0.0 -> 2.0.0)
npm version major
```

### 持续集成
- 设置GitHub Actions自动测试
- 配置自动发布流程
- 监控包的下载量和使用情况

## 9. 社区推广

### 提交到MCP目录
- 提交到官方MCP服务器列表
- 在MCP社区分享
- 创建使用教程和视频

### 文档和支持
- 维护详细的文档
- 及时回复Issues
- 收集用户反馈并改进

完成以上步骤后，您的Logo MCP就可以像其他专业MCP工具一样被各种客户端正常使用了！