#!/usr/bin/env node

import { LogoExtractor } from './dist/logo-extractor.js';
import { LogoOptimizer } from './dist/logo-optimizer.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法: node cli.js <网站URL> [输出目录]');
    console.log('示例: node cli.js https://www.google.com ./logos');
    process.exit(1);
  }

  const url = args[0];
  const outputDir = args[1] || './logos';
  
  console.log(`🚀 开始提取Logo: ${url}`);
  
  try {
    const extractor = new LogoExtractor();
    const optimizer = new LogoOptimizer();
    
    // 提取候选项
    console.log('📍 正在分析网站...');
    const candidates = await extractor.extractLogoCandidates(url);
    
    if (candidates.length === 0) {
      console.log('❌ 未找到任何Logo候选项');
      return;
    }
    
    console.log(`✅ 找到 ${candidates.length} 个Logo候选项`);
    
    // 显示所有候选项
    candidates.forEach((candidate, index) => {
      console.log(`   ${index + 1}. ${candidate.source} (评分: ${candidate.score})`);
      console.log(`      URL: ${candidate.url}`);
    });
    
    // 选择最佳Logo
    const bestLogo = extractor.selectBestLogo(candidates);
    console.log(`\n🎯 选择最佳Logo: ${bestLogo.source} (评分: ${bestLogo.score})`);
    
    // 下载Logo
    console.log('📥 正在下载Logo...');
    const logoData = await extractor.downloadLogo(bestLogo);
    console.log(`✅ 下载完成 (格式: ${logoData.format}, 大小: ${logoData.buffer.length} bytes)`);
    
    // 创建输出目录
    const { mkdirSync } = await import('fs');
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (e) {
      // 目录可能已存在
    }
    
    // 保存原始文件
    const domain = new URL(url).hostname.replace('www.', '');
    const originalExt = logoData.format === 'svg' ? 'svg' : 'png';
    const originalPath = join(outputDir, `${domain}-original.${originalExt}`);
    
    writeFileSync(originalPath, logoData.buffer);
    console.log(`💾 原始Logo已保存: ${originalPath}`);
    
    // 生成优化版本
    if (logoData.format === 'svg') {
      const optimizedSvg = await optimizer.optimizeSVG(logoData.buffer);
      const optimizedPath = join(outputDir, `${domain}-optimized.svg`);
      writeFileSync(optimizedPath, optimizedSvg);
      console.log(`🎨 优化SVG已保存: ${optimizedPath}`);
    }
    
    // 生成PNG版本
    const pngData = await optimizer.convertToPNG(logoData.buffer, 256);
    const pngPath = join(outputDir, `${domain}-256x256.png`);
    writeFileSync(pngPath, pngData);
    console.log(`🖼️  PNG版本已保存: ${pngPath}`);
    
    // 生成多尺寸favicon
    console.log('🔄 正在生成多尺寸favicon...');
    const favicons = await optimizer.generateFavicons(logoData.buffer);
    
    favicons.forEach(({ size, buffer }) => {
      const faviconPath = join(outputDir, `${domain}-${size}x${size}.png`);
      writeFileSync(faviconPath, buffer);
      console.log(`   💎 ${size}x${size} favicon已保存: ${faviconPath}`);
    });
    
    console.log('\n✨ Logo提取完成！');
    console.log(`📁 输出目录: ${outputDir}`);
    
  } catch (error) {
    console.error('❌ 提取失败:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);