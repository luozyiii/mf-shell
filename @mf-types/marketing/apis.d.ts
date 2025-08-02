
    export type RemoteKeys = 'marketing/App';
    type PackageType<T> = T extends 'marketing/App' ? typeof import('marketing/App') :any;