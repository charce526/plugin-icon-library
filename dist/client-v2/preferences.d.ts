export type Preferences = {
    favorites: string[];
    recent: string[];
};
export declare function readPreferences(scope: string): Preferences;
export declare function writePreferences(scope: string, data: Preferences): void;
