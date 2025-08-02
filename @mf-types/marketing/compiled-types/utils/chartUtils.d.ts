/**
 * Chart utilities for handling null values and tooltip formatting
 */
/**
 * Check if a value is valid (not null, undefined, or NaN)
 * @param value - The value to check
 * @returns true if the value is valid, false otherwise
 */
export declare function isValidValue(value: any): boolean;
/**
 * Safe tooltip formatter that handles null values
 * @param datum - Chart data point
 * @param name - Display name for the tooltip
 * @param formatter - Optional formatter function for the value
 * @returns Formatted tooltip object
 */
export declare function safeTooltipFormatter(datum: any, name: string, formatter?: (value: any) => string): {
    name: string;
    value: string;
};
/**
 * Create a safe tooltip configuration for charts
 * @param name - Display name for the tooltip
 * @param formatter - Optional formatter function for the value
 * @returns Tooltip configuration object
 */
export declare function createSafeTooltip(name: string, formatter?: (value: any) => string): {
    formatter: (datum: any) => {
        name: string;
        value: string;
    };
};
/**
 * Filter chart data to remove entries with null/undefined values
 * @param data - Array of chart data objects
 * @param valueField - The field name to check for valid values (default: 'value')
 * @returns Filtered array with only valid data points
 */
export declare function filterValidData<T extends Record<string, any>>(data: T[], valueField?: string): T[];
/**
 * Safe chart data getter with null value filtering
 * @param data - Chart data array
 * @param valueField - The field name to check for valid values (default: 'value')
 * @returns Filtered and validated chart data
 */
export declare function getSafeChartData<T extends Record<string, any>>(data: T[] | undefined | null, valueField?: string): T[];
