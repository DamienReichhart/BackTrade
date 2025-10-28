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
        lastUpdated="October 28, 2025"
      >
      <h2>1. Introduction</h2>
      <p>
        BackTrade ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our trading platform and related services.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>2.1 Personal Information</h3>
      <p>
        We may collect personal information that you voluntarily provide to us, including:
      </p>
      <ul>
        <li>Name and contact information (email address, phone number)</li>
        <li>Account credentials and authentication information</li>
        <li>Payment and billing information</li>
        <li>Profile information and preferences</li>
        <li>Communication records (support tickets, feedback)</li>
      </ul>

      <h3>2.2 Trading and Financial Data</h3>
      <p>
        To provide our services, we collect:
      </p>
      <ul>
        <li>Trading activity and transaction history</li>
        <li>Portfolio holdings and performance data</li>
        <li>Market analysis and research preferences</li>
        <li>Backtesting results and strategy data</li>
        <li>Risk management settings and alerts</li>
      </ul>

      <h3>2.3 Technical Information</h3>
      <p>
        We automatically collect certain technical information, including:
      </p>
      <ul>
        <li>Device information (IP address, browser type, operating system)</li>
        <li>Usage data (pages visited, features used, time spent)</li>
        <li>Cookies and similar tracking technologies</li>
        <li>Log files and error reports</li>
        <li>Performance metrics and analytics data</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>
        We use the collected information for the following purposes:
      </p>
      <ul>
        <li><strong>Service Provision:</strong> To provide, maintain, and improve our trading platform</li>
        <li><strong>Account Management:</strong> To create and manage your account and authenticate your identity</li>
        <li><strong>Personalization:</strong> To customize your experience and provide relevant content</li>
        <li><strong>Communication:</strong> To send you updates, notifications, and support communications</li>
        <li><strong>Analytics:</strong> To analyze usage patterns and improve our services</li>
        <li><strong>Security:</strong> To protect against fraud, abuse, and security threats</li>
        <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
      </ul>

      <h2>4. Information Sharing and Disclosure</h2>
      <h3>4.1 Third-Party Service Providers</h3>
      <p>
        We may share your information with trusted third-party service providers who assist us in:
      </p>
      <ul>
        <li>Payment processing and billing</li>
        <li>Data storage and cloud services</li>
        <li>Analytics and performance monitoring</li>
        <li>Customer support and communication</li>
        <li>Security and fraud prevention</li>
      </ul>

      <h3>4.2 Legal Requirements</h3>
      <p>
        We may disclose your information if required by law or if we believe such action is necessary to:
      </p>
      <ul>
        <li>Comply with legal obligations</li>
        <li>Protect our rights and property</li>
        <li>Prevent fraud or abuse</li>
        <li>Protect the safety of our users</li>
      </ul>

      <h3>4.3 Business Transfers</h3>
      <p>
        In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
      </p>
      <ul>
        <li>Encryption of data in transit and at rest</li>
        <li>Regular security assessments and updates</li>
        <li>Access controls and authentication mechanisms</li>
        <li>Employee training on data protection</li>
        <li>Incident response procedures</li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>
        We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Specifically:
      </p>
      <ul>
        <li>Account information is retained while your account is active</li>
        <li>Trading data is retained for regulatory compliance purposes</li>
        <li>Communication records are retained for customer support purposes</li>
        <li>Analytics data may be retained in aggregated form</li>
      </ul>

      <h2>7. Your Rights and Choices</h2>
      <h3>7.1 Access and Control</h3>
      <p>
        You have the right to:
      </p>
      <ul>
        <li>Access and review your personal information</li>
        <li>Correct inaccurate or incomplete information</li>
        <li>Request deletion of your personal information</li>
        <li>Object to certain processing activities</li>
        <li>Request data portability</li>
      </ul>

      <h3>7.2 Communication Preferences</h3>
      <p>
        You can manage your communication preferences by:
      </p>
      <ul>
        <li>Updating your account settings</li>
        <li>Unsubscribing from marketing emails</li>
        <li>Adjusting notification preferences</li>
        <li>Contacting our support team</li>
      </ul>

      <h2>8. Cookies and Tracking Technologies</h2>
      <p>
        We use cookies and similar technologies to enhance your experience. You can control cookie preferences through your browser settings, but disabling cookies may affect the functionality of our services.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
      </p>

      <h2>10. Children's Privacy</h2>
      <p>
        Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
      </p>

      <h2>11. European Union Privacy Rights</h2>
      <p>
        If you are located in the European Union, you have rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal information.
      </p>

      <h2>12. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
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
