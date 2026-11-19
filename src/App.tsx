import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Categories } from "./components/Categories";
import { Featured } from "./components/Featured";
import { Brands } from "./components/Brands";
import { Services } from "./components/Services";
import { WhyUs } from "./components/WhyUs";
import { Gallery } from "./components/Gallery";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
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
        <Categories />
        <Featured />
        <Brands />
        <Services />
        <WhyUs />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </EnquiryProvider>
  );
}
