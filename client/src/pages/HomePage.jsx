import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import MidSection from '../components/MidSection';
import PricingSection from '../components/PricingSection';
import HowItWorks from '../components/HowItWorks';
import ReviewsSection from '../components/ReviewsSection';
import FaqSection from '../components/FaqSection';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

export default function HomePage() {
  const [selectedService, setSelectedService] = useState('');

  const handleSelectService = (serviceName) => {
    setSelectedService(serviceName);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-wrap">
      <WhatsAppFloat />
      <Header />
      <main>
        <Hero />
        <ServicesSection onSelectService={handleSelectService} />
        {/* 3-Column Mid Section: Why Choose Us | This Diwali Banner | Book Your Pickup */}
        <MidSection selectedServiceFromParent={selectedService} />
        {/* Customer Trust Section: 4 Stat Badges + Pooja Sharma Review Card */}
        <ReviewsSection />
        <HowItWorks />
        <PricingSection onSelectService={handleSelectService} />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}

