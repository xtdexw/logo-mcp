#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { LogoExtractor } from './logo-extractor.js';
import { LogoOptimizer } from './logo-optimizer.js';
class LogoMCPServer {
    server;
    logoExtractor;
    logoOptimizer;
    constructor() {
        this.server = new Server({
            name: 'logo-mcp',
            version: '1.0.0',
        });
        this.logoExtractor = new LogoExtractor();
        this.logoOptimizer = new LogoOptimizer();
        this.setupToolHandlers();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'extract_logo',
                        description: '从指定网站URL提取Logo图标链接',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                url: {
                                    type: 'string',
                                    description: '要提取Logo的网站URL',
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
            }
            catch (error) {
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
    async handleExtractLogo(args) {
        const { url } = args;
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
                        text: `未能从网站 ${url} 找到任何Logo图标。`,
                    },
                ],
            };
        }
        // 选择最佳Logo
        const bestLogo = this.logoExtractor.selectBestLogo(candidates);
        // 直接返回Logo链接信息
        const responseData = {
            message: 'Logo提取成功，已返回可直接下载的Logo链接。',
            websiteUrl: url,
            logoUrl: bestLogo.url,
            logoType: bestLogo.type,
            logoSource: bestLogo.source,
            logoScore: bestLogo.score,
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(responseData, null, 2),
                },
            ],
        };
    }
    async handleAnalyzeCandidates(args) {
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
export default LogoMCPServer;
const server = new LogoMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map