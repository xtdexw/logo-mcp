#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LogoExtractor } from './logo-extractor.js';
import { LogoOptimizer } from './logo-optimizer.js';

class LogoMCPServer {
  private server: Server;
  private logoExtractor: LogoExtractor;
  private logoOptimizer: LogoOptimizer;

  constructor() {
    this.server = new Server({
      name: 'logo-mcp',
      version: '1.0.0',
    });

    this.logoExtractor = new LogoExtractor();
    this.logoOptimizer = new LogoOptimizer();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'extract_logo',
            description: '从指定网站URL提取Logo图标并保存到本地文件',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: '要提取Logo的网站URL',
                },
                optimize: {
                  type: 'boolean',
                  description: '是否对Logo进行AI优化处理',
                  default: true,
                },
                format: {
                  type: 'string',
                  enum: ['png', 'svg', 'both'],
                  description: '输出格式选择',
                  default: 'both',
                },
                size: {
                  type: 'number',
                  description: '输出图片尺寸（像素）',
                  default: 256,
                },
                outputDir: {
                  type: 'string',
                  description: '输出目录路径',
                  default: './logo',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'analyze_logo_candidates',
            description: '分析网站的所有Logo候选项并返回详细信息',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: '要分析的网站URL',
                },
              },
              required: ['url'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'extract_logo':
            return await this.handleExtractLogo(args);
          case 'analyze_logo_candidates':
            return await this.handleAnalyzeCandidates(args);
          default:
            throw new Error(`未知的工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
            },
          ],
        };
      }
    });
  }

  private async handleExtractLogo(args: any) {
    const { url, optimize = true, format = 'both', size = 256, outputDir = './logo' } = args;

    if (!url || typeof url !== 'string') {
      throw new Error('请提供有效的网站URL');
    }

    // 提取Logo候选项
    const candidates = await this.logoExtractor.extractLogoCandidates(url);
    
    if (candidates.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `未能从网站 ${url} 找到任何Logo图标。请检查网站是否可访问或是否包含Logo。`,
          },
        ],
      };
    }

    // 选择最佳Logo
    const bestLogo = this.logoExtractor.selectBestLogo(candidates);
    
    // 创建输出目录
    const fs = await import('fs');
    const path = await import('path');
    const axios = await import('axios');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成文件名（基于域名）
    const domain = new URL(url).hostname.replace(/^www\./, '');
    const timestamp = Date.now();
    
    let result = {
      url: url,
      logoUrl: bestLogo.url,
      type: bestLogo.type,
      source: bestLogo.source,
      savedFiles: [] as any[],
    };

    try {
      // 直接从logoUrl下载文件
      const response = await axios.default.get(bestLogo.url, { 
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const buffer = Buffer.from(response.data);
      
      // 检测文件格式
      const contentType = response.headers['content-type'] || '';
      let fileExtension = 'png'; // 默认
      if (contentType.includes('svg')) {
        fileExtension = 'svg';
      } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
        fileExtension = 'jpg';
      } else if (contentType.includes('png')) {
        fileExtension = 'png';
      }
      
      // 保存原始文件
      const fileName = `${domain}-logo-${timestamp}.${fileExtension}`;
      const filePath = path.join(outputDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      
      result.savedFiles.push({
        format: fileExtension,
        fileName: fileName,
        filePath: path.resolve(filePath),
        fileSize: buffer.length,
        optimized: false,
      });
      
    } catch (downloadError) {
      throw new Error(`下载Logo失败: ${downloadError instanceof Error ? downloadError.message : '未知错误'}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `成功提取并保存Logo！\n网站: ${url}\nLogo来源: ${bestLogo.source}\n保存位置: ${outputDir}\n文件数量: ${result.savedFiles.length}`,
        },
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleAnalyzeCandidates(args: any) {
    const { url } = args;

    if (!url || typeof url !== 'string') {
      throw new Error('请提供有效的网站URL');
    }

    const candidates = await this.logoExtractor.extractLogoCandidates(url);
    
    if (candidates.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `未能从网站 ${url} 找到任何Logo候选项。`,
          },
        ],
      };
    }

    const analysis = {
      url: url,
      totalCandidates: candidates.length,
      candidates: candidates.map((candidate, index) => ({
        index: index + 1,
        url: candidate.url,
        type: candidate.type,
        source: candidate.source,
        score: candidate.score,
        attributes: candidate.attributes,
      })),
      recommended: this.logoExtractor.selectBestLogo(candidates),
    };

    return {
      content: [
        {
          type: 'text',
          text: `Logo候选项分析完成！\n网站: ${url}\n找到 ${candidates.length} 个候选项\n推荐使用: ${analysis.recommended.source} (评分: ${analysis.recommended.score})`,
        },
        {
          type: 'text',
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Logo MCP服务器已启动');
  }
}

const server = new LogoMCPServer();
server.run().catch(console.error);