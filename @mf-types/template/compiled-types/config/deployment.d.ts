export declare const deploymentConfig: {
    shellApp: {
        development: string;
        production: string;
    };
    templateApp: {
        development: string;
        production: string;
    };
    basename: {
        development: string;
        production: string;
    };
    getCurrentConfig(): {
        shellUrl: string;
        templateUrl: string;
        basename: string;
        isProduction: boolean;
    };
};
export declare const currentConfig: {
    shellUrl: string;
    templateUrl: string;
    basename: string;
    isProduction: boolean;
};
