const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadTencentLogo() {
  const logoUrl = 'https://cloudcache.tencent-cloud.com/open_proj/proj_qcloud_v2/gateway/shareicons/cloud.png';
  const outputDir = './logo';
  
  try {
    // 确保目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('正在下载腾讯云Logo...');
    const response = await axios.get(logoUrl, { 
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const buffer = Buffer.from(response.data);
    const fileName = 'tencent-cloud-logo.png';
    const filePath = path.join(outputDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    
    console.log(`✅ 成功保存腾讯云Logo到: ${path.resolve(filePath)}`);
    console.log(`📁 文件大小: ${buffer.length} 字节`);
    console.log(`🔗 原始URL: ${logoUrl}`);
    
  } catch (error) {
    console.error('❌ 下载失败:', error.message);
  }
}

downloadTencentLogo();