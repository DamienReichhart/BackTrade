import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LegalPageLayout } from "./components";

/**
 * Terms of Service page component
 *
 * Displays comprehensive terms and conditions for using BackTrade services
 */
export function Terms() {
    return (
        <div>
            <Header />

            <LegalPageLayout
                title="Terms of Service"
                lastUpdated="October 28, 2025"
            >
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using BackTrade ("the Service"), you accept
                    and agree to be bound by the terms and provision of this
                    agreement. If you do not agree to abide by the above, please
                    do not use this service.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                    BackTrade is a comprehensive trading platform that provides:
                </p>
                <ul>
                    <li>Real-time market data and analysis tools</li>
                    <li>Trading simulation and backtesting capabilities</li>
                    <li>Portfolio management and tracking features</li>
                    <li>Educational resources and market insights</li>
                </ul>

                <h2>3. User Accounts</h2>
                <h3>3.1 Account Creation</h3>
                <p>
                    To access certain features of the Service, you must create
                    an account. You agree to:
                </p>
                <ul>
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and update your account information</li>
                    <li>Maintain the security of your password and account</li>
                    <li>
                        Accept responsibility for all activities under your
                        account
                    </li>
                </ul>

                <h3>3.2 Account Termination</h3>
                <p>
                    We reserve the right to suspend or terminate your account at
                    any time for violations of these Terms or for any other
                    reason at our sole discretion.
                </p>

                <h2>4. Acceptable Use</h2>
                <h3>4.1 Permitted Uses</h3>
                <p>
                    You may use the Service for lawful purposes only. You agree
                    not to use the Service:
                </p>
                <ul>
                    <li>
                        For any unlawful purpose or to solicit others to perform
                        unlawful acts
                    </li>
                    <li>
                        To violate any international, federal, provincial, or
                        state regulations, rules, laws, or local ordinances
                    </li>
                    <li>
                        To infringe upon or violate our intellectual property
                        rights or the intellectual property rights of others
                    </li>
                    <li>
                        To harass, abuse, insult, harm, defame, slander,
                        disparage, intimidate, or discriminate
                    </li>
                    <li>To submit false or misleading information</li>
                    <li>
                        To upload or transmit viruses or any other type of
                        malicious code
                    </li>
                </ul>

                <h3>4.2 Prohibited Activities</h3>
                <p>The following activities are strictly prohibited:</p>
                <ul>
                    <li>
                        Attempting to gain unauthorized access to any part of
                        the Service
                    </li>
                    <li>
                        Using automated systems to access the Service without
                        permission
                    </li>
                    <li>
                        Reverse engineering, decompiling, or disassembling the
                        Service
                    </li>
                    <li>
                        Creating multiple accounts to circumvent restrictions
                    </li>
                    <li>Sharing account credentials with third parties</li>
                </ul>

                <h2>5. Intellectual Property Rights</h2>
                <p>
                    The Service and its original content, features, and
                    functionality are and will remain the exclusive property of
                    BackTrade and its licensors. The Service is protected by
                    copyright, trademark, and other laws. Our trademarks and
                    trade dress may not be used in connection with any product
                    or service without our prior written consent.
                </p>

                <h2>6. Privacy Policy</h2>
                <p>
                    Your privacy is important to us. Please review our Privacy
                    Policy, which also governs your use of the Service, to
                    understand our practices.
                </p>

                <h2>7. Payment Terms</h2>
                <h3>7.1 Subscription Fees</h3>
                <p>
                    Some features of the Service require a paid subscription.
                    Subscription fees are billed in advance on a monthly or
                    annual basis and are non-refundable except as required by
                    law.
                </p>

                <h3>7.2 Price Changes</h3>
                <p>
                    We reserve the right to change our pricing at any time.
                    Price changes will be communicated to users at least 30 days
                    in advance.
                </p>

                <h2>8. Disclaimers</h2>
                <p>
                    The information on this Service is provided on an "as is"
                    basis. To the fullest extent permitted by law, BackTrade:
                </p>
                <ul>
                    <li>
                        Excludes all representations and warranties relating to
                        this Service and its contents
                    </li>
                    <li>
                        Excludes all liability for damages arising out of or in
                        connection with your use of this Service
                    </li>
                    <li>
                        Does not guarantee the accuracy, completeness, or
                        timeliness of market data
                    </li>
                    <li>
                        Is not responsible for trading losses or investment
                        decisions made based on our data
                    </li>
                </ul>

                <h2>9. Limitation of Liability</h2>
                <p>
                    In no event shall BackTrade, nor its directors, employees,
                    partners, agents, suppliers, or affiliates, be liable for
                    any indirect, incidental, special, consequential, or
                    punitive damages, including without limitation, loss of
                    profits, data, use, goodwill, or other intangible losses,
                    resulting from your use of the Service.
                </p>

                <h2>10. Indemnification</h2>
                <p>
                    You agree to defend, indemnify, and hold harmless BackTrade
                    and its licensee and licensors, and their employees,
                    contractors, agents, officers and directors, from and
                    against any and all claims, damages, obligations, losses,
                    liabilities, costs or debt, and expenses (including but not
                    limited to attorney's fees).
                </p>

                <h2>11. Termination</h2>
                <p>
                    We may terminate or suspend your account and bar access to
                    the Service immediately, without prior notice or liability,
                    under our sole discretion, for any reason whatsoever and
                    without limitation, including but not limited to a breach of
                    the Terms.
                </p>

                <h2>12. Governing Law</h2>
                <p>
                    These Terms shall be interpreted and governed by the laws of
                    France, without regard to its conflict of law provisions.
                    Our failure to enforce any right or provision of these Terms
                    will not be considered a waiver of those rights.
                </p>

                <h2>13. Changes to Terms</h2>
                <p>
                    We reserve the right, at our sole discretion, to modify or
                    replace these Terms at any time. If a revision is material,
                    we will provide at least 30 days notice prior to any new
                    terms taking effect.
                </p>

                <h2>14. Contact Information</h2>
                <p>
                    If you have any questions about these Terms of Service,
                    please contact us at:
                </p>
                <ul>
                    <li>Email: contact@damien-reichhart.fr</li>
                    <li>Address: fakeaddress</li>
                </ul>

                <p>
                    <strong>Effective Date:</strong> October 28, 2025
                </p>
            </LegalPageLayout>

            <Footer />
        </div>
    );
}
