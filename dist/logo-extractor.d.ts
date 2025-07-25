import { Buffer } from 'buffer';
export interface LogoCandidate {
    url: string;
    type: 'favicon' | 'apple-touch-icon' | 'og-image' | 'logo-image' | 'brand-image';
    source: string;
    score: number;
    attributes: Record<string, any>;
}
export interface LogoData {
    buffer: Buffer;
    format: string;
    originalSize?: {
        width: number;
        height: number;
    };
}
export declare class LogoExtractor {
    private readonly userAgent;
    extractLogoCandidates(websiteUrl: string): Promise<LogoCandidate[]>;
    private normalizeUrl;
    private extractFaviconCandidates;
    private extractAppleTouchIcons;
    private extractOpenGraphImages;
    private extractLogoImages;
    private extractCommonFaviconPaths;
    private calculateFaviconScore;
    private calculateAppleIconScore;
    private calculateLogoImageScore;
    private calculateCommonPathScore;
    private resolveUrl;
    private deduplicateAndScore;
    selectBestLogo(candidates: LogoCandidate[]): LogoCandidate;
    downloadLogo(candidate: LogoCandidate): Promise<LogoData>;
    private getImageSize;
}
//# sourceMappingURL=logo-extractor.d.ts.map