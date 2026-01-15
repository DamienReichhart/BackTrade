/**
 * Mail Message Types
 *
 * Type definitions for mail messages sent through RabbitMQ.
 * These types are used by both the API (for queuing) and Worker (for processing).
 */

import { z } from "zod";

/**
 * Email Template Data Types
 *
 * Type definitions for all email template data structures
 */

/** Base data type for all email templates (allows any string keys) */
export interface BaseEmailData {
    [key: string]: unknown;
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

/**
 * Mail template types
 */
export const MailTemplateTypeSchema = z.enum([
    "welcome",
    "login-notification",
    "account-deleted",
    "password-reset",
]);
export type MailTemplateType = z.infer<typeof MailTemplateTypeSchema>;

/**
 * Base email data schema (common fields for all email types)
 */
const BaseEmailDataSchema = z.object({
    /** Recipient email address */
    to: z.string().email(),
    /** Email subject */
    subject: z.string().min(1),
});

/**
 * Welcome email data schema
 */
const WelcomeEmailDataSchema = BaseEmailDataSchema.extend({
    /** User's display name or email */
    username: z.string().min(1),
    /** URL to the dashboard */
    dashboardUrl: z.string().url(),
});

/**
 * Login notification email data schema
 */
const LoginNotificationEmailDataSchema = BaseEmailDataSchema.extend({
    /** User's display name or email */
    username: z.string().min(1),
    /** Formatted login date and time */
    loginDate: z.string().min(1),
    /** Device type (e.g., "Windows PC", "iPhone 15") */
    device: z.string().min(1),
    /** Browser name (e.g., "Chrome 120", "Safari 17") */
    browser: z.string().min(1),
    /** URL to secure account / change password */
    secureAccountUrl: z.string().url(),
});

/**
 * Account deleted email data schema
 */
const AccountDeletedEmailDataSchema = BaseEmailDataSchema.extend({
    /** User's display name or email */
    username: z.string().min(1),
    /** Formatted deletion date and time */
    deletionDate: z.string().min(1),
});

/**
 * Password reset email data schema
 */
const PasswordResetEmailDataSchema = BaseEmailDataSchema.extend({
    /** User's display name or email */
    username: z.string().min(1),
    /** Password reset verification code */
    resetCode: z.string().min(1),
    /** Code expiration time in minutes */
    expirationMinutes: z.number().int().positive(),
});

/**
 * Union schema for all email data types (without template discriminator)
 */
export const EmailDataSchema = z.union([
    WelcomeEmailDataSchema,
    LoginNotificationEmailDataSchema,
    AccountDeletedEmailDataSchema,
    PasswordResetEmailDataSchema,
]);

/**
 * Mail message schema with separated template and emailData
 */
export const MailMessageDataSchema = z.object({
    /** Template type identifier */
    template: MailTemplateTypeSchema,
    /** Email data specific to the template type */
    emailData: EmailDataSchema,
});

/**
 * Mail message data type
 */
export type MailMessageData = z.infer<typeof MailMessageDataSchema>;

/**
 * Email data type (union of all email data types)
 */
export type EmailData = z.infer<typeof EmailDataSchema>;

/**
 * Welcome email data type
 */
export type WelcomeEmailData = z.infer<typeof WelcomeEmailDataSchema>;

/**
 * Login notification email data type
 */
export type LoginNotificationEmailData = z.infer<
    typeof LoginNotificationEmailDataSchema
>;

/**
 * Account deleted email data type
 */
export type AccountDeletedEmailData = z.infer<
    typeof AccountDeletedEmailDataSchema
>;

/**
 * Password reset email data type
 */
export type PasswordResetEmailData = z.infer<
    typeof PasswordResetEmailDataSchema
>;
