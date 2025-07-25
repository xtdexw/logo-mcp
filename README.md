# Logo MCP - 基于AI MCP协议的网站Logo提取系统

一个智能的网站Logo提取系统，基于Model Context Protocol (MCP) 构建，能够自动识别并提取网站的Logo图标。

## 功能特性

- 🔍 **智能识别**: 支持多种Logo获取方式
  - HTML link标签 (favicon, icon)
  - Apple Touch Icon
  - OpenGraph协议图像
  - 页面中的Logo图像元素
  - 常见favicon路径检测

- 🎯 **智能选择**: 当存在多个Logo候选项时，自动选择最符合主视觉的版本
  - 基于尺寸、格式、来源的评分系统
  - 优先选择SVG矢量格式
  - 智能去重和排序

- 🖼️ **格式支持**: 
  - 输入: PNG, JPG, SVG, ICO, WebP, GIF
  - 输出: PNG, SVG
  - AI优化处理

- ⚡ **错误处理**: 完善的错误处理机制，友好的错误提示

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd logo-mcp

# 安装依赖
npm install

# 构建项目
npm run build
```

## 使用方法

### 作为MCP服务器运行

```bash
npm start
```

### 开发模式

```bash
npm run dev
```

## MCP工具

### 1. extract_logo - 提取网站Logo

从指定网站URL提取Logo图标。

**参数:**
- `url` (必需): 要提取Logo的网站URL
- `optimize` (可选): 是否对Logo进行AI优化处理，默认为true
- `format` (可选): 输出格式选择 ('png', 'svg', 'both')，默认为'both'
- `size` (可选): 输出图片尺寸（像素），默认为256

**示例:**
```json
{
  "name": "extract_logo",
  "arguments": {
    "url": "https://www.google.com",
    "optimize": true,
    "format": "both",
    "size": 256
  }
}
```

**返回结果:**
```json
{
  "url": "https://www.google.com",
  "logoUrl": "https://www.google.com/favicon.ico",
  "type": "favicon",
  "source": "HTML link标签",
  "originalSize": {"width": 32, "height": 32},
  "originalFormat": "ico",
  "files": [
    {
      "format": "png",
      "size": 256,
      "data": "base64编码的图片数据",
      "optimized": true
    },
    {
      "format": "svg",
      "data": "SVG内容",
      "optimized": true
    }
  ]
}
```

### 2. analyze_logo_candidates - 分析Logo候选项

分析网站的所有Logo候选项并返回详细信息。

**参数:**
- `url` (必需): 要分析的网站URL

**示例:**
```json
{
  "name": "analyze_logo_candidates",
  "arguments": {
    "url": "https://www.apple.com"
  }
}
```

**返回结果:**
```json
{
  "url": "https://www.apple.com",
  "totalCandidates": 5,
  "candidates": [
    {
      "index": 1,
      "url": "https://www.apple.com/favicon.ico",
      "type": "favicon",
      "source": "HTML link标签",
      "score": 85,
      "attributes": {"sizes": "32x32", "type": "image/x-icon"}
    }
  ],
  "recommended": {
    "url": "https://www.apple.com/apple-touch-icon.png",
    "type": "apple-touch-icon",
    "source": "Apple Touch Icon",
    "score": 95
  }
}
```

## 评分系统

系统使用智能评分算法来选择最佳Logo：

### Favicon评分 (基础分60)
- 尺寸加分: ≥128px (+30), ≥64px (+20), ≥32px (+10)
- 格式加分: SVG (+20), PNG (+15)

### Apple Touch Icon评分 (基础分80)
- 尺寸加分: ≥180px (+20), ≥120px (+15), ≥76px (+10)

### Logo图像评分 (基础分50)
- Alt属性: 包含"logo" (+25), "brand" (+15), "company" (+10)
- Class属性: 包含"logo" (+20), "brand" (+15)
- 路径: 包含"logo" (+15), "brand" (+10), SVG格式 (+10)

### 常见路径评分
- `/logo.svg`: 95分
- `/logo.png`: 90分
- `/assets/logo.svg`: 90分
- `/apple-touch-icon.png`: 85分
- `/assets/logo.png`: 85分

## 技术架构

- **TypeScript**: 类型安全的开发体验
- **MCP SDK**: Model Context Protocol支持
- **Cheerio**: HTML解析和DOM操作
- **Axios**: HTTP请求处理
- **Sharp**: 图像处理和优化
- **URL Parse**: URL解析和处理

## 错误处理

系统包含完善的错误处理机制：

- 网络超时处理 (10秒超时)
- 重定向跟踪 (最多5次)
- 图像格式验证
- 友好的错误消息
- 优雅降级处理

## 开发

### 项目结构

```
logo-mcp/
├── src/
│   ├── index.ts              # MCP服务器主入口
│   ├── logo-extractor.ts     # Logo提取核心逻辑
│   └── logo-optimizer.ts     # 图像优化处理
├── dist/                     # 编译输出目录
├── package.json
├── tsconfig.json
└── README.md
```

### 开发命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 启动
npm start

# 测试
npm test
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！