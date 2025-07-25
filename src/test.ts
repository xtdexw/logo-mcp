import { LogoExtractor } from './logo-extractor.js';
import { LogoOptimizer } from './logo-optimizer.js';

async function testLogoExtraction() {
  const extractor = new LogoExtractor();
  const optimizer = new LogoOptimizer();

  console.log('🚀 开始测试Logo提取系统...\n');

  const testUrls = [
    'https://www.google.com',
    'https://www.apple.com',
    'https://github.com',
    'https://www.microsoft.com',
    'https://www.baidu.com'
  ];

  for (const url of testUrls) {
    try {
      console.log(`📍 测试网站: ${url}`);
      
      // 提取候选项
      const candidates = await extractor.extractLogoCandidates(url);
      console.log(`   找到 ${candidates.length} 个Logo候选项`);
      
      if (candidates.length > 0) {
        // 选择最佳Logo
        const bestLogo = extractor.selectBestLogo(candidates);
        console.log(`   最佳选择: ${bestLogo.source} (评分: ${bestLogo.score})`);
        console.log(`   Logo URL: ${bestLogo.url}`);
        
        // 尝试下载Logo
        try {
          const logoData = await extractor.downloadLogo(bestLogo);
          console.log(`   ✅ 成功下载Logo (格式: ${logoData.format}, 大小: ${logoData.buffer.length} bytes)`);
          
          // 如果是小文件，尝试优化
          if (logoData.buffer.length < 1024 * 1024) { // 小于1MB
            if (logoData.format === 'svg') {
              const optimized = await optimizer.optimizeSVG(logoData.buffer);
              console.log(`   🎨 SVG优化完成 (原始: ${logoData.buffer.length} -> 优化: ${optimized.length} bytes)`);
            } else {
              const pngData = await optimizer.convertToPNG(logoData.buffer, 128);
              console.log(`   🖼️  PNG转换完成 (大小: ${pngData.length} bytes)`);
            }
          }
        } catch (downloadError) {
          console.log(`   ❌ 下载失败: ${downloadError}`);
        }
      } else {
        console.log('   ⚠️  未找到Logo候选项');
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ❌ 测试失败: ${error}\n`);
    }
  }

  console.log('✨ 测试完成！');
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testLogoExtraction().catch(console.error);
}

export { testLogoExtraction };