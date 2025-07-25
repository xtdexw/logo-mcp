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
            description: '从指定网站URL提取Logo图标',
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
    const { url, optimize = true, format = 'both', size = 256 } = args;

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
    
    // 下载并处理Logo
    const logoData = await this.logoExtractor.downloadLogo(bestLogo);
    
    let result = {
      url: url,
      logoUrl: bestLogo.url,
      type: bestLogo.type,
      source: bestLogo.source,
      originalSize: logoData.originalSize,
      originalFormat: logoData.format,
      files: [] as any[],
    };

    // 根据格式要求处理图片
    if (format === 'png' || format === 'both') {
      const pngData = await this.logoOptimizer.convertToPNG(logoData.buffer, size);
      result.files.push({
        format: 'png',
        size: size,
        data: pngData.toString('base64'),
        optimized: optimize,
      });
    }

    if (format === 'svg' || format === 'both') {
      if (logoData.format === 'svg') {
        let svgData = logoData.buffer;
        if (optimize) {
          svgData = await this.logoOptimizer.optimizeSVG(logoData.buffer);
        }
        result.files.push({
          format: 'svg',
          data: svgData.toString('utf-8'),
          optimized: optimize,
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `成功提取Logo！\n网站: ${url}\nLogo来源: ${bestLogo.source}\n格式: ${result.files.map(f => f.format).join(', ')}\n原始尺寸: ${logoData.originalSize?.width || '未知'}x${logoData.originalSize?.height || '未知'}`,
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