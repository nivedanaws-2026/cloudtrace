import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import EvidenceIntegrity from "@/components/landing/EvidenceIntegrity";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustEveryByte from "@/components/landing/TrustEveryByte";
import Architecture from "@/components/landing/Architecture";
import Footer from "@/components/landing/Footer";
import { Cta } from "@/components/landing/Cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <EvidenceIntegrity />
        <Features />
        <HowItWorks />
        <TrustEveryByte />
        <Architecture />
        <Cta />
      </main>
      <Footer />
    </>
  );
}