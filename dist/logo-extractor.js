import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { Buffer } from 'buffer';
export class LogoExtractor {
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    async extractLogoCandidates(websiteUrl) {
        try {
            const normalizedUrl = this.normalizeUrl(websiteUrl);
            const response = await axios.get(normalizedUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 10000,
                maxRedirects: 5,
            });
            const $ = cheerio.load(response.data);
            const candidates = [];
            const baseUrl = new URL(normalizedUrl);
            // 1. 提取favicon相关链接
            await this.extractFaviconCandidates($, baseUrl, candidates);
            // 2. 提取Apple Touch Icon
            await this.extractAppleTouchIcons($, baseUrl, candidates);
            // 3. 提取OpenGraph图像
            await this.extractOpenGraphImages($, baseUrl, candidates);
            // 4. 提取可能的Logo图像
            await this.extractLogoImages($, baseUrl, candidates);
            // 5. 尝试常见的favicon路径
            await this.extractCommonFaviconPaths(baseUrl, candidates);
            // 去重并评分
            return this.deduplicateAndScore(candidates);
        }
        catch (error) {
            console.error(`提取Logo候选项时出错: ${error}`);
            return [];
        }
    }
    normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        return url;
    }
    async extractFaviconCandidates($, baseUrl, candidates) {
        $('link[rel*="icon"]').each((_, element) => {
            const href = $(element).attr('href');
            const sizes = $(element).attr('sizes');
            const type = $(element).attr('type');
            if (href) {
                const absoluteUrl = this.resolveUrl(href, baseUrl);
                candidates.push({
                    url: absoluteUrl,
                    type: 'favicon',
                    source: 'HTML link标签',
                    score: this.calculateFaviconScore(sizes, type),
                    attributes: { sizes, type, rel: $(element).attr('rel') }
                });
            }
        });
    }
    async extractAppleTouchIcons($, baseUrl, candidates) {
        $('link[rel*="apple-touch-icon"]').each((_, element) => {
            const href = $(element).attr('href');
            const sizes = $(element).attr('sizes');
            if (href) {
                const absoluteUrl = this.resolveUrl(href, baseUrl);
                candidates.push({
                    url: absoluteUrl,
                    type: 'apple-touch-icon',
                    source: 'Apple Touch Icon',
                    score: this.calculateAppleIconScore(sizes),
                    attributes: { sizes, rel: $(element).attr('rel') }
                });
            }
        });
    }
    async extractOpenGraphImages($, baseUrl, candidates) {
        $('meta[property="og:image"], meta[name="og:image"]').each((_, element) => {
            const content = $(element).attr('content');
            if (content) {
                const absoluteUrl = this.resolveUrl(content, baseUrl);
                candidates.push({
                    url: absoluteUrl,
                    type: 'og-image',
                    source: 'OpenGraph协议',
                    score: 70, // 中等优先级
                    attributes: { property: $(element).attr('property') || $(element).attr('name') }
                });
            }
        });
    }
    async extractLogoImages($, baseUrl, candidates) {
        // 查找可能的Logo图像
        const logoSelectors = [
            'img[alt*="logo" i]',
            'img[src*="logo" i]',
            'img[class*="logo" i]',
            'img[id*="logo" i]',
            '.logo img',
            '#logo img',
            '.brand img',
            '.header img',
            '.navbar-brand img'
        ];
        logoSelectors.forEach(selector => {
            $(selector).each((_, element) => {
                const src = $(element).attr('src');
                const alt = $(element).attr('alt');
                const className = $(element).attr('class');
                if (src) {
                    const absoluteUrl = this.resolveUrl(src, baseUrl);
                    candidates.push({
                        url: absoluteUrl,
                        type: 'logo-image',
                        source: 'Logo图像识别',
                        score: this.calculateLogoImageScore(alt, className, src),
                        attributes: { alt, class: className, selector }
                    });
                }
            });
        });
    }
    async extractCommonFaviconPaths(baseUrl, candidates) {
        const commonPaths = [
            '/favicon.ico',
            '/favicon.png',
            '/apple-touch-icon.png',
            '/apple-touch-icon-precomposed.png',
            '/logo.png',
            '/logo.svg',
            '/assets/logo.png',
            '/assets/logo.svg',
            '/images/logo.png',
            '/images/logo.svg'
        ];
        for (const path of commonPaths) {
            const url = new URL(path, baseUrl).toString();
            try {
                const response = await axios.head(url, {
                    timeout: 3000,
                    headers: { 'User-Agent': this.userAgent }
                });
                if (response.status === 200) {
                    candidates.push({
                        url,
                        type: path.includes('apple-touch') ? 'apple-touch-icon' : 'favicon',
                        source: '常见路径检测',
                        score: this.calculateCommonPathScore(path),
                        attributes: { path, contentType: response.headers['content-type'] }
                    });
                }
            }
            catch {
                // 忽略404或其他错误
            }
        }
    }
    calculateFaviconScore(sizes, type) {
        let score = 60; // 基础分数
        if (sizes) {
            const sizeMatch = sizes.match(/(\d+)x(\d+)/);
            if (sizeMatch) {
                const size = parseInt(sizeMatch[1]);
                if (size >= 128)
                    score += 30;
                else if (size >= 64)
                    score += 20;
                else if (size >= 32)
                    score += 10;
            }
        }
        if (type) {
            if (type.includes('svg'))
                score += 20;
            else if (type.includes('png'))
                score += 15;
        }
        return Math.min(score, 100);
    }
    calculateAppleIconScore(sizes) {
        let score = 80; // Apple图标通常质量较高
        if (sizes) {
            const sizeMatch = sizes.match(/(\d+)x(\d+)/);
            if (sizeMatch) {
                const size = parseInt(sizeMatch[1]);
                if (size >= 180)
                    score += 20;
                else if (size >= 120)
                    score += 15;
                else if (size >= 76)
                    score += 10;
            }
        }
        return Math.min(score, 100);
    }
    calculateLogoImageScore(alt, className, src) {
        let score = 50; // 基础分数
        // 检查alt属性
        if (alt) {
            const altLower = alt.toLowerCase();
            if (altLower.includes('logo'))
                score += 25;
            if (altLower.includes('brand'))
                score += 15;
            if (altLower.includes('company'))
                score += 10;
        }
        // 检查class属性
        if (className) {
            const classLower = className.toLowerCase();
            if (classLower.includes('logo'))
                score += 20;
            if (classLower.includes('brand'))
                score += 15;
        }
        // 检查src路径
        if (src) {
            const srcLower = src.toLowerCase();
            if (srcLower.includes('logo'))
                score += 15;
            if (srcLower.includes('brand'))
                score += 10;
            if (srcLower.includes('.svg'))
                score += 10;
        }
        return Math.min(score, 100);
    }
    calculateCommonPathScore(path) {
        const pathScores = {
            '/favicon.ico': 70,
            '/favicon.png': 75,
            '/apple-touch-icon.png': 85,
            '/logo.png': 90,
            '/logo.svg': 95,
            '/assets/logo.png': 85,
            '/assets/logo.svg': 90,
        };
        return pathScores[path] || 60;
    }
    resolveUrl(href, baseUrl) {
        try {
            return new URL(href, baseUrl).toString();
        }
        catch {
            return href;
        }
    }
    deduplicateAndScore(candidates) {
        const uniqueCandidates = new Map();
        candidates.forEach(candidate => {
            const existing = uniqueCandidates.get(candidate.url);
            if (!existing || candidate.score > existing.score) {
                uniqueCandidates.set(candidate.url, candidate);
            }
        });
        return Array.from(uniqueCandidates.values())
            .sort((a, b) => b.score - a.score);
    }
    selectBestLogo(candidates) {
        if (candidates.length === 0) {
            throw new Error('没有可用的Logo候选项');
        }
        // 优先选择高分的SVG或高质量PNG
        const sortedCandidates = candidates.sort((a, b) => {
            // SVG格式加分
            const aIsSvg = a.url.toLowerCase().includes('.svg') || a.attributes?.type?.includes('svg');
            const bIsSvg = b.url.toLowerCase().includes('.svg') || b.attributes?.type?.includes('svg');
            if (aIsSvg && !bIsSvg)
                return -1;
            if (!aIsSvg && bIsSvg)
                return 1;
            // 按分数排序
            return b.score - a.score;
        });
        return sortedCandidates[0];
    }
    async downloadLogo(candidate) {
        try {
            const response = await axios.get(candidate.url, {
                responseType: 'arraybuffer',
                headers: { 'User-Agent': this.userAgent },
                timeout: 10000,
            });
            const buffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'] || '';
            let format = 'unknown';
            if (contentType.includes('svg'))
                format = 'svg';
            else if (contentType.includes('png'))
                format = 'png';
            else if (contentType.includes('jpeg') || contentType.includes('jpg'))
                format = 'jpeg';
            else if (contentType.includes('gif'))
                format = 'gif';
            else if (contentType.includes('webp'))
                format = 'webp';
            else if (contentType.includes('ico'))
                format = 'ico';
            return {
                buffer,
                format,
                originalSize: await this.getImageSize(buffer, format)
            };
        }
        catch (error) {
            throw new Error(`下载Logo失败: ${error}`);
        }
    }
    async getImageSize(buffer, format) {
        try {
            if (format === 'svg') {
                const svgContent = buffer.toString('utf-8');
                const widthMatch = svgContent.match(/width="(\d+)"/);
                const heightMatch = svgContent.match(/height="(\d+)"/);
                if (widthMatch && heightMatch) {
                    return {
                        width: parseInt(widthMatch[1]),
                        height: parseInt(heightMatch[1])
                    };
                }
            }
            // 对于其他格式，这里可以使用sharp库来获取尺寸
            // 但为了简化，我们暂时返回undefined
            return undefined;
        }
        catch {
            return undefined;
        }
    }
}
//# sourceMappingURL=logo-extractor.js.map