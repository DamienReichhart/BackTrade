/**
 * Email Template Data Types
 *
 * Type definitions for all email template data structures
 */

/** Base data included in all email templates */
export interface BaseEmailData {
    /** Current year for footer copyright */
    year?: number;
}

/** Data required for the registration welcome email template */
export interface RegisterEmailData extends BaseEmailData {
    /** User's display name or email */
    username: string;
    /** URL to the dashboard */
    dashboardUrl: string;
}

/** Data required for the login notification email template */
export interface LoginEmailData extends BaseEmailData {
    /** User's display name or email */
    username: string;
    /** Formatted login date and time */
    loginDate: string;
    /** Device type (e.g., "Windows PC", "iPhone 15") */
    device: string;
    /** Browser name (e.g., "Chrome 120", "Safari 17") */
    browser: string;
    /** URL to secure account / change password */
    secureAccountUrl: string;
}
