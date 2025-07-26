#!/usr/bin/env node
declare class LogoMCPServer {
    private server;
    private logoExtractor;
    private logoOptimizer;
    constructor();
    private setupToolHandlers;
    private handleExtractLogo;
    private handleAnalyzeCandidates;
    run(): Promise<void>;
}
export default LogoMCPServer;
//# sourceMappingURL=index.d.ts.map