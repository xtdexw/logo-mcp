import sharp from 'sharp';

export class LogoOptimizer {
  async convertToPNG(buffer: Buffer, targetSize: number = 256): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(targetSize, targetSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({
          quality: 90,
          compressionLevel: 6,
          adaptiveFiltering: true
        })
        .toBuffer();
    } catch (error) {
      throw new Error(`PNG转换失败: ${error}`);
    }
  }

  async optimizeSVG(buffer: Buffer): Promise<Buffer> {
    try {
      let svgContent = buffer.toString('utf-8');
      
      // 基础SVG优化
      svgContent = this.cleanSVGContent(svgContent);
      svgContent = this.optimizeSVGAttributes(svgContent);
      
      return Buffer.from(svgContent, 'utf-8');
    } catch (error) {
      throw new Error(`SVG优化失败: ${error}`);
    }
  }

  private cleanSVGContent(svgContent: string): string {
    // 移除注释
    svgContent = svgContent.replace(/<!--[\s\S]*?-->/g, '');
    
    // 移除不必要的空白字符
    svgContent = svgContent.replace(/\s+/g, ' ');
    
    // 移除空的属性
    svgContent = svgContent.replace(/\s+[a-zA-Z-]+=""\s*/g, ' ');
    
    return svgContent.trim();
  }

  private optimizeSVGAttributes(svgContent: string): string {
    // 确保SVG有正确的viewBox
    if (!svgContent.includes('viewBox') && svgContent.includes('width') && svgContent.includes('height')) {
      const widthMatch = svgContent.match(/width="(\d+)"/);
      const heightMatch = svgContent.match(/height="(\d+)"/);
      
      if (widthMatch && heightMatch) {
        const width = widthMatch[1];
        const height = heightMatch[1];
        svgContent = svgContent.replace(
          /<svg([^>]*)>/,
          `<svg$1 viewBox="0 0 ${width} ${height}">`
        );
      }
    }
    
    return svgContent;
  }

  async enhanceImage(buffer: Buffer, format: string): Promise<Buffer> {
    try {
      if (format === 'svg') {
        return this.optimizeSVG(buffer);
      }
      
      // 对于位图格式，进行基础增强
      return await sharp(buffer)
        .sharpen()
        .normalize()
        .toBuffer();
    } catch (error) {
      throw new Error(`图像增强失败: ${error}`);
    }
  }

  async createMultipleFormats(buffer: Buffer, originalFormat: string, targetSize: number = 256) {
    const results: { format: string; buffer: Buffer; size: number }[] = [];
    
    try {
      // PNG格式
      const pngBuffer = await this.convertToPNG(buffer, targetSize);
      results.push({
        format: 'png',
        buffer: pngBuffer,
        size: targetSize
      });
      
      // 如果原始是SVG，保留优化后的SVG
      if (originalFormat === 'svg') {
        const optimizedSvg = await this.optimizeSVG(buffer);
        results.push({
          format: 'svg',
          buffer: optimizedSvg,
          size: 0 // SVG是矢量格式
        });
      }
      
      // WebP格式（现代浏览器支持）
      try {
        const webpBuffer = await sharp(buffer)
          .resize(targetSize, targetSize, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: 90 })
          .toBuffer();
        
        results.push({
          format: 'webp',
          buffer: webpBuffer,
          size: targetSize
        });
      } catch {
        // WebP转换失败时忽略
      }
      
      return results;
    } catch (error) {
      throw new Error(`多格式转换失败: ${error}`);
    }
  }

  async generateFavicons(buffer: Buffer): Promise<{ size: number; buffer: Buffer }[]> {
    const faviconSizes = [16, 32, 48, 64, 128, 256];
    const favicons: { size: number; buffer: Buffer }[] = [];
    
    for (const size of faviconSizes) {
      try {
        const faviconBuffer = await sharp(buffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toBuffer();
        
        favicons.push({ size, buffer: faviconBuffer });
      } catch (error) {
        console.warn(`生成 ${size}x${size} favicon失败:`, error);
      }
    }
    
    return favicons;
  }
}