import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Hero } from "./components/Hero";
import { FeatureCards } from "./components/FeatureCards";
import { ProductSection } from "./components/ProductSection";
import { InterfaceSection } from "./components/InterfaceSection";
import { CTASection } from "./components/CTASection";
import styles from "./Home.module.css";

/**
 * Home page component
 * 
 * Main landing page for the BackTrade application
 * Showcases product features, interface, and call-to-action
 */
export default function Home() {
  return (
    <div className={styles.home}>
      <Header />
      
      <main className={styles.main}>
        <Hero />
        <FeatureCards />
        <ProductSection />
        <InterfaceSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}
