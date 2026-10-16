/** Mixed V1/V2 pages may render icons through different public runtime registries. */
export declare function createIconRegistration(app: any, primary: (icons: Record<string, any>) => void): (components: Record<string, any>) => void;
