import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import WhyChooseUs from '../components/WhyChooseUs';
import HowItWorks from '../components/HowItWorks';
import PricingSection from '../components/PricingSection';
import BookingForm from '../components/BookingForm';
import ReviewsSection from '../components/ReviewsSection';
import FaqSection from '../components/FaqSection';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import OrderTrackingModal from '../components/OrderTrackingModal';
import FireworksCanvas from '../components/FireworksCanvas';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';

export default function HomePage() {
  const { theme } = useTheme();
  const { activeOffer } = useConfig();
  const [selectedService, setSelectedService] = useState('');
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingRef, setTrackingRef] = useState('');
  const isDiwali = theme === 'diwali';

  const handleSelectService = (serviceName) => {
    setSelectedService(serviceName);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenTracking = (ref = '') => {
    setTrackingRef(typeof ref === 'string' ? ref : '');
    setTrackingModalOpen(true);
  };

  return (
    <div className="home-page-wrap">
      {/* Background Diwali Crackers Animation */}
      {isDiwali && <FireworksCanvas enabled={true} />}
      <WhatsAppFloat />
      <Header onOpenTracking={handleOpenTracking} />
      <main>
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Services Section */}
        <ServicesSection onSelectService={handleSelectService} />

        {/* 3. Dedicated Full-Width Why Choose Us Section */}
        <WhyChooseUs />

        {/* 4. Sequential 4-Step How It Works */}
        <HowItWorks />

        {/* 5. Transparent Starting Price List (With Clean Most Popular Badge) */}
        <PricingSection onSelectService={handleSelectService} />

        {/* 6. Dedicated Full-Width Book Your Pickup Section */}
        <BookingForm
          selectedServiceFromParent={selectedService}
          onOpenTracking={handleOpenTracking}
        />

        {/* 7. Verified Reviews Section */}
        <ReviewsSection />

        {/* 8. Frequently Asked Questions */}
        <FaqSection />
      </main>
      <Footer onOpenTracking={handleOpenTracking} />

      {/* Global 9-Stage Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        initialRef={trackingRef}
      />
    </div>
  );
}
