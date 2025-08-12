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
    shellUrl: any;
    templateUrl: any;
    basename: any;
    isProduction: boolean;
  };
};
export declare const currentConfig: {
  shellUrl: any;
  templateUrl: any;
  basename: any;
  isProduction: boolean;
};
