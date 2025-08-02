
    export type RemoteKeys = 'template/App';
    type PackageType<T> = T extends 'template/App' ? typeof import('template/App') :any;