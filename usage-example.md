# Logo MCP 使用示例

## 配置MCP客户端

将以下配置添加到您的MCP客户端配置文件中：

```json
{
  "mcpServers": {
    "logo-mcp": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/logo-mcp",
      "env": {}
    }
  }
}
```

## 使用示例

### 1. 提取网站Logo

```json
{
  "tool": "extract_logo",
  "arguments": {
    "url": "https://www.google.com",
    "optimize": true,
    "format": "both",
    "size": 256
  }
}
```

### 2. 分析Logo候选项

```json
{
  "tool": "analyze_logo_candidates",
  "arguments": {
    "url": "https://www.apple.com"
  }
}
```

## 测试网站列表

以下是一些适合测试的网站：

- https://www.google.com - 经典的Google Logo
- https://www.apple.com - 高质量的Apple Logo
- https://github.com - GitHub的Octocat Logo
- https://www.microsoft.com - Microsoft Logo
- https://www.baidu.com - 百度Logo
- https://www.tencent.com - 腾讯Logo
- https://www.alibaba.com - 阿里巴巴Logo

## 常见问题

### Q: 为什么某些网站无法提取Logo？
A: 可能的原因包括：
- 网站使用了反爬虫机制
- 网站的Logo是通过CSS背景图片实现的
- 网站没有标准的favicon或meta标签
- 网络连接问题

### Q: 如何提高Logo提取的成功率？
A: 系统已经实现了多种提取策略：
- HTML link标签检测
- Apple Touch Icon检测
- OpenGraph图像检测
- 常见路径扫描
- 页面Logo图像识别

### Q: 支持哪些图像格式？
A: 输入支持：PNG, JPG, SVG, ICO, WebP, GIF
   输出支持：PNG, SVG

### Q: 如何自定义评分算法？
A: 可以修改 `src/logo-extractor.ts` 中的评分函数：
- `calculateFaviconScore()`
- `calculateAppleIconScore()`
- `calculateLogoImageScore()`
- `calculateCommonPathScore()`