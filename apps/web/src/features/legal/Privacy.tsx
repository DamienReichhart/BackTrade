import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LegalPageLayout } from "./components";

/**
 * Privacy Policy page component
 *
 * Displays comprehensive privacy policy explaining how BackTrade collects, uses, and protects user data
 */
export function Privacy() {
    return (
        <div>
            <Header />

            <LegalPageLayout
                title="Privacy Policy"
                lastUpdated="January 15, 2025"
            >
                <h2>1. Introduction</h2>
                <p>
                    BackTrade ("we," "our," or "us") is committed to protecting
                    your privacy. This Privacy Policy explains how we collect,
                    use, disclose, and safeguard your information when you use
                    our trading platform and related services.
                </p>

                <h2>2. Information We Collect</h2>
                <h3>2.1 Account Information</h3>
                <p>
                    When you create an account, we collect the following
                    information:
                </p>
                <ul>
                    <li>
                        <strong>Email address:</strong> Required for account
                        creation and authentication
                    </li>
                    <li>
                        <strong>Password:</strong> Stored as a hashed value
                        (never in plain text)
                    </li>
                </ul>

                <h3>2.2 Authentication and Session Data</h3>
                <p>
                    When you log in, we automatically collect session
                    information for security purposes:
                </p>
                <ul>
                    <li>IP address</li>
                    <li>Browser user agent string</li>
                    <li>Device information</li>
                </ul>
                <p>
                    We also store JWT authentication tokens in cookies to
                    maintain your login session.
                </p>

                <h3>2.3 Subscription and Billing Data</h3>
                <p>For subscription management, we collect:</p>
                <ul>
                    <li>
                        <strong>Stripe customer ID:</strong> Identifier linking
                        your account to Stripe for payment processing
                    </li>
                    <li>
                        <strong>Subscription information:</strong> Active
                        subscription status, billing period dates, and
                        cancellation preferences
                    </li>
                    <li>
                        <strong>Stripe webhook events:</strong> Payment events
                        received from Stripe for subscription management
                    </li>
                </ul>
                <p>
                    <strong>Note:</strong> We do not store payment card details
                    or billing addresses. All payment information is handled
                    directly by Stripe, our payment processor. Please refer to
                    Stripe's privacy policy for information about how they
                    handle your payment data.
                </p>

                <h3>2.4 Local Storage and Browser Data</h3>
                <p>
                    We store the following preferences in your browser's local
                    storage to enhance your experience:
                </p>
                <ul>
                    <li>
                        <strong>Chart preferences:</strong> Grid line
                        visibility, time display settings, and chart timeframe
                    </li>
                    <li>
                        <strong>Indicator settings:</strong> Custom indicator
                        configurations and display preferences
                    </li>
                </ul>
                <p>
                    This data is stored locally on your device and is not
                    transmitted to our servers.
                </p>

                <h2>3. How We Use Your Information</h2>
                <p>
                    We use the collected information for the following purposes:
                </p>
                <ul>
                    <li>
                        <strong>Service Provision:</strong> To provide,
                        maintain, and improve our backtesting and trading
                        simulation platform
                    </li>
                    <li>
                        <strong>Account Management:</strong> To create and
                        manage your account, authenticate your identity, and
                        maintain your login sessions
                    </li>
                    <li>
                        <strong>Trading Simulation:</strong> To store and
                        process your trading sessions, positions, and
                        transactions for backtesting purposes
                    </li>
                    <li>
                        <strong>Analytics and Reporting:</strong> To calculate
                        and display trading performance metrics, equity curves,
                        and session analytics
                    </li>
                    <li>
                        <strong>Subscription Management:</strong> To manage your
                        subscription, process payments through Stripe, and
                        enforce subscription limits
                    </li>
                    <li>
                        <strong>Email Communication:</strong> To send you
                        transactional emails including welcome emails, login
                        notifications, password reset instructions, and account
                        deletion confirmations
                    </li>
                    <li>
                        <strong>Security:</strong> To protect against fraud,
                        abuse, and security threats by monitoring session
                        activity and IP addresses
                    </li>
                    <li>
                        <strong>Legal Compliance:</strong> To comply with
                        applicable laws and regulations
                    </li>
                </ul>

                <h2>4. Information Sharing and Disclosure</h2>
                <h3>4.1 Third-Party Service Providers</h3>
                <p>
                    We share limited information with the following third-party
                    service providers:
                </p>
                <ul>
                    <li>
                        <strong>Stripe:</strong> We share your email address and
                        Stripe customer ID with Stripe for payment processing
                        and subscription management. Stripe handles all payment
                        card information directly and does not share card
                        details with us. Please review Stripe's privacy policy
                        at{" "}
                        <a
                            href="https://stripe.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://stripe.com/privacy
                        </a>
                    </li>
                    <li>
                        <strong>Hostinger:</strong> We use Hostinger service to
                        send transactional emails. Your email address is shared
                        with this provider solely for the purpose of delivering
                        emails. See Hostinger's privacy policy at{" "}
                        <a
                            href="https://www.hostinger.com/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://www.hostinger.com/privacy-policy
                        </a>
                    </li>
                    <li>
                        <strong>Cloudflare:</strong> We use Cloudflare to
                        securely route and transmit data between your device and
                        our servers. All data transmitted through our
                        application, including authentication credentials,
                        session data, and trading information, passes through
                        Cloudflare's infrastructure. Cloudflare may process
                        network-level data such as IP addresses, request
                        metadata, and connection information as part of their
                        service. Please review Cloudflare's privacy policy at{" "}
                        <a
                            href="https://www.cloudflare.com/privacy/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://www.cloudflare.com/privacy/
                        </a>
                    </li>
                </ul>
                <p>
                    <strong>Important:</strong> We do not use third-party
                    analytics services, advertising networks, or tracking
                    services. We do not share your data with data brokers or
                    sell your information to third parties.
                </p>

                <h3>4.2 Legal Requirements</h3>
                <p>
                    We may disclose your information if required by law or if we
                    believe such action is necessary to:
                </p>
                <ul>
                    <li>Comply with legal obligations</li>
                    <li>Protect our rights and property</li>
                    <li>Prevent fraud or abuse</li>
                    <li>Protect the safety of our users</li>
                </ul>

                <h2>5. Data Retention</h2>
                <p>
                    We retain your personal information for as long as necessary
                    to fulfill the purposes outlined in this Privacy Policy,
                    unless a longer retention period is required or permitted by
                    law. Specifically:
                </p>
                <ul>
                    <li>
                        <strong>Account information:</strong> Retained while
                        your account is active. When you delete your account,
                        all associated data is permanently deleted.
                    </li>
                    <li>
                        <strong>Trading session data:</strong> Retained as long
                        as your account is active. This includes sessions,
                        positions, transactions, and analytics data.
                    </li>
                    <li>
                        <strong>User session data:</strong> Retained for
                        security and authentication purposes while your account
                        is active.
                    </li>
                    <li>
                        <strong>Password reset codes:</strong> Automatically
                        deleted after expiration (typically 1 hour) or after
                        successful password reset.
                    </li>
                    <li>
                        <strong>Stripe webhook events:</strong> Retained for
                        subscription management and audit purposes.
                    </li>
                </ul>

                <h2>6. Your Rights and Choices</h2>
                <h3>6.1 Access and Control</h3>
                <p>You have the right to:</p>
                <ul>
                    <li>Access and review your personal information</li>
                    <li>Correct inaccurate or incomplete information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to certain processing activities</li>
                    <li>Request data portability</li>
                </ul>

                <h3>6.2 Communication Preferences</h3>
                <p>
                    We only send transactional emails (welcome emails, login
                    notifications, password resets, account deletion
                    confirmations). These emails are essential for account
                    security and cannot be disabled. We do not send marketing
                    emails or promotional communications.
                </p>

                <h2>7. Cookies and Tracking Technologies</h2>
                <p>We use cookies for the following purposes:</p>
                <ul>
                    <li>
                        <strong>Authentication cookies:</strong> We store JWT
                        access and refresh tokens in cookies to maintain your
                        login session. These cookies are essential for the
                        platform to function.
                    </li>
                </ul>
                <p>
                    <strong>Important:</strong> We do not use tracking cookies,
                    advertising cookies, or third-party analytics cookies. We do
                    not use cookies to track your browsing behavior outside of
                    our platform.
                </p>
                <p>
                    You can control cookie preferences through your browser
                    settings, but disabling authentication cookies will prevent
                    you from logging in and using our services.
                </p>

                <h2>8. International Data Transfers</h2>
                <p>
                    Your information may be transferred to and processed in
                    countries other than your country of residence, including:
                </p>
                <ul>
                    <li>
                        <strong>Stripe:</strong> Payment processing data is
                        handled by Stripe, which may process data in various
                        countries. Please refer to Stripe's privacy policy for
                        details.
                    </li>
                    <li>
                        <strong>Cloudflare:</strong> Data transmitted through
                        Cloudflare Tunnel may be processed in various countries
                        as part of Cloudflare's global network infrastructure.
                        Please refer to Cloudflare's privacy policy for details.
                    </li>
                    <li>
                        <strong>Cloud Infrastructure:</strong> Our servers and
                        databases may be located in countries outside your
                        jurisdiction.
                    </li>
                </ul>
                <p>
                    We ensure appropriate safeguards are in place to protect
                    your information in accordance with applicable data
                    protection laws.
                </p>

                <h2>9. Children's Privacy</h2>
                <p>
                    Our services are not intended for individuals under the age
                    of 18. We do not knowingly collect personal information from
                    children under 18. If we become aware that we have collected
                    personal information from a child under 18, we will take
                    steps to delete such information.
                </p>

                <h2>10. European Union Privacy Rights</h2>
                <p>
                    If you are located in the European Union, you have rights
                    under the General Data Protection Regulation (GDPR),
                    including the right to access, rectify, erase, restrict
                    processing, data portability, and object to processing of
                    your personal information.
                </p>

                <h2>11. Changes to This Privacy Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time to
                    reflect changes in our practices or for other operational,
                    legal, or regulatory reasons. We will notify you of any
                    material changes by posting the new Privacy Policy on this
                    page and updating the "Last Updated" date. We encourage you
                    to review this Privacy Policy periodically to stay informed
                    about how we protect your information.
                </p>

                <h2>12. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy or our
                    privacy practices, please contact us at:
                </p>
                <ul>
                    <li>Email: contact@damien-reichhart.fr</li>
                </ul>

                <p>
                    <strong>Effective Date:</strong> January 15, 2026
                </p>
            </LegalPageLayout>

            <Footer />
        </div>
    );
}
