# Logo MCP Server

一个基于 Model Context Protocol (MCP) 的 Logo 提取服务器，可以从任何网站提取高质量的 Logo 图标。

## 功能特性

- 🎯 **智能Logo识别** - 自动识别网站中的Logo元素
- 🔍 **多种提取策略** - 支持favicon、meta标签、图片分析等多种方式
- 🎨 **AI优化处理** - 可选的Logo优化和增强功能
- 📐 **多格式输出** - 支持PNG、SVG格式输出
- 🔧 **灵活配置** - 可自定义输出尺寸和格式
- 🚀 **MCP协议** - 完全兼容Model Context Protocol标准

## 安装

### 作为MCP服务器使用

```bash
npx @pickstar-2025/logo-mcp
```

### 本地开发安装

```bash
git clone https://github.com/xtdexw/logo-mcp.git
cd logo-mcp
npm install
npm run build
```

## 使用方法

### MCP工具调用

该服务器提供两个主要的MCP工具：

#### 1. extract_logo - 提取Logo

```json
{
  "tool": "extract_logo",
  "arguments": {
    "url": "https://example.com",
    "optimize": true,
    "format": "both",
    "size": 256
  }
}
```

**参数说明：**
- `url` (必需): 要提取Logo的网站URL
- `optimize` (可选): 是否进行AI优化处理，默认为true
- `format` (可选): 输出格式，可选值：`png`、`svg`、`both`，默认为`both`
- `size` (可选): 输出图片尺寸（像素），默认为256

#### 2. analyze_logo_candidates - 分析Logo候选项

```json
{
  "tool": "analyze_logo_candidates",
  "arguments": {
    "url": "https://example.com"
  }
}
```

**参数说明：**
- `url` (必需): 要分析的网站URL

### 命令行使用

```bash
# 提取Logo
node cli.js extract https://example.com

# 分析Logo候选项
node cli.js analyze https://example.com
```

## MCP配置

在你的MCP客户端配置文件中添加：

```json
{
  "mcpServers": {
    "logo-mcp": {
      "command": "npx",
      "args": ["@pickstar-2025/logo-mcp"]
    }
  }
}
```

## 技术架构

- **TypeScript** - 类型安全的开发体验
- **MCP Protocol** - 标准化的模型上下文协议
- **Puppeteer** - 网页内容抓取和分析
- **Sharp** - 高性能图像处理
- **AI优化** - 智能Logo识别和优化

## 开发

### 构建项目

```bash
npm run build
```

### 运行测试

```bash
npm test
```

### 启动开发服务器

```bash
npm run dev
```

## API参考

### LogoExtractor类

主要的Logo提取类，提供以下方法：

- `extractLogo(url, options)` - 提取指定网站的Logo
- `analyzeCandidates(url)` - 分析网站的所有Logo候选项

### LogoOptimizer类

Logo优化处理类：

- `optimize(logoData, options)` - 优化Logo质量和格式
- `resize(logoData, size)` - 调整Logo尺寸

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交Issue和Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的Logo提取功能
- 实现MCP协议兼容
- 添加AI优化功能

## 支持

如果你遇到任何问题，请：

1. 查看 [Issues](https://github.com/xtdexw/logo-mcp/issues)
2. 提交新的Issue描述问题
3. 联系维护者

---

Made with ❤️ by CodeBuddy
