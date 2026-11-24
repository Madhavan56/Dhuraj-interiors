import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Services } from "./components/Services";
import { WhyUs } from "./components/WhyUs";
import { Gallery } from "./components/Gallery";
import { Projects } from "./components/Projects";
import { Testimonials } from "./components/Testimonials";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { MobileActionBar } from "./components/MobileActionBar";
import { EnquiryProvider } from "./context/EnquiryContext";

export default function App() {
  return (
    <EnquiryProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-plum-900 focus:px-5 focus:py-3 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Services />
        <WhyUs />
        <Gallery />
        <Projects />
        <Testimonials />
        <Contact />
      </main>
      {/* Leaves room for the sticky mobile action bar so it never covers the footer. */}
      <div className="pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0">
        <Footer />
      </div>
      <FloatingWhatsApp />
      <MobileActionBar />
    </EnquiryProvider>
  );
}
