# Logo MCP 部署指南

## 系统要求

- Node.js 18+ 
- npm 或 yarn
- 支持MCP协议的客户端

## 安装步骤

### 1. 克隆项目
```bash
git clone <repository-url>
cd logo-mcp
```

### 2. 安装依赖
```bash
npm install
```

### 3. 构建项目
```bash
npm run build
```

### 4. 测试系统
```bash
# 使用CLI工具测试
npm run cli https://www.google.com

# 或者运行内置测试
npm run test-extraction
```

## MCP客户端配置

### Claude Desktop配置

在 `%APPDATA%\Claude\claude_desktop_config.json` (Windows) 或 `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) 中添加：

```json
{
  "mcpServers": {
    "logo-mcp": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "D:\\Code\\logo-mcp",
      "env": {}
    }
  }
}
```

### Cursor配置

在项目根目录创建 `.cursorrules` 文件：

```
# Logo MCP 集成
当用户需要提取网站Logo时，使用logo-mcp服务器的工具：
- extract_logo: 提取并优化Logo
- analyze_logo_candidates: 分析Logo候选项
```

### 其他MCP客户端

参考各客户端的MCP配置文档，使用以下基本配置：
- 命令: `node`
- 参数: `["dist/index.js"]`
- 工作目录: Logo MCP项目路径

## 使用方法

### 1. 基础Logo提取
```json
{
  "tool": "extract_logo",
  "arguments": {
    "url": "https://example.com"
  }
}
```

### 2. 高级Logo提取
```json
{
  "tool": "extract_logo",
  "arguments": {
    "url": "https://example.com",
    "optimize": true,
    "format": "both",
    "size": 512
  }
}
```

### 3. Logo候选项分析
```json
{
  "tool": "analyze_logo_candidates",
  "arguments": {
    "url": "https://example.com"
  }
}
```

## 故障排除

### 常见问题

1. **构建失败**
   - 检查Node.js版本是否为18+
   - 删除node_modules重新安装: `rm -rf node_modules && npm install`

2. **MCP连接失败**
   - 检查配置文件路径是否正确
   - 确认dist/index.js文件存在
   - 查看客户端错误日志

3. **Logo提取失败**
   - 检查网络连接
   - 确认目标网站可访问
   - 某些网站可能有反爬虫机制

4. **图像处理错误**
   - 确认sharp库正确安装
   - 在Windows上可能需要安装Visual Studio Build Tools

### 调试模式

启用详细日志：
```bash
DEBUG=* node dist/index.js
```

### 性能优化

1. **内存使用**
   - 大图片处理时注意内存限制
   - 可以调整图片处理尺寸

2. **网络超时**
   - 默认超时10秒，可在代码中调整
   - 网络不稳定时增加重试机制

## 开发指南

### 项目结构
```
logo-mcp/
├── src/
│   ├── index.ts              # MCP服务器主入口
│   ├── logo-extractor.ts     # Logo提取逻辑
│   ├── logo-optimizer.ts     # 图像优化处理
│   └── test.ts              # 测试文件
├── dist/                     # 编译输出
├── cli.js                   # 命令行工具
├── start.js                 # 启动脚本
└── README.md
```

### 添加新功能

1. **新的Logo检测策略**
   - 在 `logo-extractor.ts` 中添加新的提取方法
   - 更新评分算法

2. **新的图像处理功能**
   - 在 `logo-optimizer.ts` 中添加处理方法
   - 考虑性能和内存使用

3. **新的MCP工具**
   - 在 `index.ts` 中注册新工具
   - 添加相应的处理函数

### 测试

```bash
# 运行单元测试
npm test

# 手动测试特定网站
npm run cli https://example.com

# 批量测试
npm run test-extraction
```

## 生产部署

### Docker部署

创建 `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 系统服务

创建systemd服务文件 `/etc/systemd/system/logo-mcp.service`:
```ini
[Unit]
Description=Logo MCP Server
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/logo-mcp
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 监控和日志

### 日志配置
- 使用winston或类似日志库
- 配置日志轮转
- 监控错误率和性能指标

### 健康检查
- 添加健康检查端点
- 监控内存和CPU使用
- 设置告警机制

## 安全考虑

1. **输入验证**
   - 验证URL格式
   - 限制请求频率
   - 防止SSRF攻击

2. **资源限制**
   - 限制图片大小
   - 设置处理超时
   - 内存使用监控

3. **网络安全**
   - 使用HTTPS
   - 配置防火墙
   - 定期更新依赖