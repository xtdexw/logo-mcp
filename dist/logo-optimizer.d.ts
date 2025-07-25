export declare class LogoOptimizer {
    convertToPNG(buffer: Buffer, targetSize?: number): Promise<Buffer>;
    optimizeSVG(buffer: Buffer): Promise<Buffer>;
    private cleanSVGContent;
    private optimizeSVGAttributes;
    enhanceImage(buffer: Buffer, format: string): Promise<Buffer>;
    createMultipleFormats(buffer: Buffer, originalFormat: string, targetSize?: number): Promise<{
        format: string;
        buffer: Buffer;
        size: number;
    }[]>;
    generateFavicons(buffer: Buffer): Promise<{
        size: number;
        buffer: Buffer;
    }[]>;
}
//# sourceMappingURL=logo-optimizer.d.ts.map