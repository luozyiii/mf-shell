export type RemoteKeys =
  | 'template/routes'
  | 'template/Dashboard'
  | 'template/Feature1'
  | 'template/Feature2'
  | 'template/Settings';
type PackageType<T> = T extends 'template/Settings'
  ? typeof import('template/Settings')
  : T extends 'template/Feature2'
    ? typeof import('template/Feature2')
    : T extends 'template/Feature1'
      ? typeof import('template/Feature1')
      : T extends 'template/Dashboard'
        ? typeof import('template/Dashboard')
        : T extends 'template/routes'
          ? typeof import('template/routes')
          : any;
