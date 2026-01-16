import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LegalPageLayout } from "./components";

/**
 * Legal Mentions page component
 *
 * Displays legal information required by French law (LCEN) including
 * website publisher, publication director, and hosting provider details
 */
export function LegalMentions() {
    return (
        <div>
            <Header />

            <LegalPageLayout
                title="Legal Mentions"
                lastUpdated="January 15, 2026"
            >
                <p>
                    In accordance with Article 6 of French Law No. 2004-575 of
                    June 21, 2004, on confidence in the digital economy (LCEN),
                    users of the website backtrade.damien-reichhart.fr are
                    informed of the identity of the various parties involved in
                    its creation and monitoring.
                </p>

                <h2>Website Publisher</h2>
                <p>This website is published by:</p>
                <ul>
                    <li>
                        <strong>Name:</strong> Damien Reichhart
                    </li>
                    <li>
                        <strong>Status:</strong> Individual / Private person
                    </li>
                    <li>
                        <strong>Country:</strong> France
                    </li>
                    <li>
                        <strong>Email:</strong>{" "}
                        <a href="mailto:contact@damien-reichhart.fr">
                            contact@damien-reichhart.fr
                        </a>
                    </li>
                    <li>
                        <strong>Website:</strong>{" "}
                        <a
                            href="https://damien-reichhart.fr"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://damien-reichhart.fr
                        </a>
                    </li>
                </ul>

                <h2>Publication Director</h2>
                <ul>
                    <li>
                        <strong>Publication Director:</strong> Damien Reichhart
                    </li>
                    <li>
                        <strong>Contact:</strong>{" "}
                        <a href="mailto:contact@damien-reichhart.fr">
                            contact@damien-reichhart.fr
                        </a>
                    </li>
                </ul>

                <h2>Website Hosting</h2>
                <p>This website is hosted by:</p>
                <ul>
                    <li>
                        <strong>Hosting Provider:</strong> OVH SAS
                    </li>
                    <li>
                        <strong>Contact:</strong>{" "}
                        <a
                            href="https://www.ovhcloud.com/fr/terms-and-conditions/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://www.ovhcloud.com/fr/terms-and-conditions/
                        </a>
                    </li>
                </ul>
            </LegalPageLayout>

            <Footer />
        </div>
    );
}
