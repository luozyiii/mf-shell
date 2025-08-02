export declare const deploymentConfig: {
    shellApp: {
        development: string;
        production: string;
    };
    marketingApp: {
        development: string;
        production: string;
    };
    basename: {
        development: string;
        production: string;
    };
    getCurrentConfig(): {
        shellUrl: string;
        marketingUrl: string;
        basename: string;
        isProduction: boolean;
    };
};
export declare const currentConfig: {
    shellUrl: string;
    marketingUrl: string;
    basename: string;
    isProduction: boolean;
};
