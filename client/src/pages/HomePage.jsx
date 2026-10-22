import React, { useState } from 'react';
import FestiveBanner from '../components/FestiveBanner';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import PricingSection from '../components/PricingSection';
import HowItWorks from '../components/HowItWorks';
import WhyChooseUs from '../components/WhyChooseUs';
import BookingForm from '../components/BookingForm';
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
      <FestiveBanner />
      <Header />
      <main>
        <Hero />
        <ServicesSection onSelectService={handleSelectService} />
        <PricingSection onSelectService={handleSelectService} />
        <HowItWorks />
        <WhyChooseUs />
        <BookingForm selectedServiceFromParent={selectedService} />
        <ReviewsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
