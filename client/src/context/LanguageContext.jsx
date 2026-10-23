import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Navigation
    home: 'Home',
    services: 'Services',
    pricing: 'Pricing',
    howItWorks: 'How It Works',
    whyChooseUs: 'Why Choose Us',
    reviews: 'Reviews',
    trackOrder: 'Track Order',
    contact: 'Contact',
    bookPickup: 'Book a Pickup',
    whatsapp: 'WhatsApp',

    // Hero
    heroHeadline1: 'Fresh Clothes.',
    heroHeadline2: 'Fresh Feel.',
    heroSub: 'Professional laundry & dry cleaning service in Kanpur with free doorstep pickup & delivery.',
    servingKanpur: 'Serving Kanpur Since 2010',
    exploreServices: 'Explore Services',
    freePickupBadge: 'Free Pickup & Delivery',
    qualityCleaningBadge: 'Quality Cleaning',
    onTimeBadge: 'On-Time Service',

    // How It Works
    howItWorksTitle: 'How It Works',
    howItWorksSub: 'Experience effortless laundry care in four seamless sequential steps.',
    step1Title: 'Book Online',
    step1Desc: 'Select your laundry service and choose your preferred pickup date & time slot in 30 seconds.',
    step2Title: 'Doorstep Pickup',
    step2Desc: 'Our courteous rider arrives at your doorstep across Kanpur to collect your garments safely.',
    step3Title: 'Expert Care & Press',
    step3Desc: 'Garments are weighed, stain-treated, washed with eco-friendly detergents, and vacuum steam ironed.',
    step4Title: 'Express Delivery',
    step4Desc: 'Fresh, crisp, fragrant, and sanitized clothes delivered back to your home within 24-48 hours.',

    // Why Choose Us
    whyChooseUsTitle: 'Why Choose Us?',
    experiencedTrusted: 'Experienced & Trusted',
    experiencedSub: 'Quality service since 2010',
    safeHygienic: 'Safe & Hygienic',
    safeSub: 'Advanced cleaning methods',
    onTimeDelivery: 'On-Time Delivery',
    onTimeSub: 'Your time matters to us',
    customerSupport: 'Customer Support',
    supportSub: 'Always here to help',

    // Admin Login Portal
    adminLoginTitle: 'Admin Login',
    adminLoginSub: 'Sign in to manage laundry operations, orders & bookings',
    adminPortalBadge: 'ADMIN PORTAL',
    staffAccessOnly: 'Authorized Staff & Admin Access Only',
    workEmail: 'Work Email / Admin ID',
    password: 'Password',
    adminSignIn: 'ADMIN SIGN IN',
    accountsCreatedByAdmin: 'Protected portal. Accounts are managed by Super Admin.',
    backToWebsite: '← Back to website'
  },
  hi: {
    // Navigation
    home: 'होम',
    services: 'सेवाएँ',
    pricing: 'मूल्य',
    howItWorks: 'कार्य प्रक्रिया',
    whyChooseUs: 'हमें क्यों चुनें',
    reviews: 'समीक्षाएँ',
    trackOrder: 'ऑर्डर ट्रैक करें',
    contact: 'संपर्क',
    bookPickup: 'पिकअप बुक करें',
    whatsapp: 'व्हाट्सएप',

    // Hero
    heroHeadline1: 'ताज़ा कपड़े।',
    heroHeadline2: 'नई ताज़गी।',
    heroSub: 'कानपुर में मुफ़्त होम पिकअप और डिलीवरी के साथ सर्वश्रेष्ठ लॉन्ड्री और ड्राई क्लीनिंग सेवा।',
    servingKanpur: '2010 से कानपुर की विश्वसनीय सेवा',
    exploreServices: 'सेवाएँ देखें',
    freePickupBadge: 'मुफ़्त पिकअप और डिलीवरी',
    qualityCleaningBadge: 'प्रीमियम धुलाई',
    onTimeBadge: 'समय पर सेवा',

    // How It Works
    howItWorksTitle: 'कार्य प्रक्रिया',
    howItWorksSub: 'चार आसान चरणों में अपने कपड़े साफ़ और ताज़ा करवाएं।',
    step1Title: 'ऑनलाइन बुक करें',
    step1Desc: 'अपनी पसंद की सेवा चुनें और 30 सेकंड में पिकअप का दिन और समय स्लॉट तय करें।',
    step2Title: 'घर से पिकअप',
    step2Desc: 'हमारा डिलीवरी पार्टनर आपके पते पर आकर कपड़े सुरक्षित रूप से कलेक्ट करेगा।',
    step3Title: 'प्रीमियम धुलाई और स्टीम प्रेस',
    step3Desc: 'कपड़ों की इको-फ्रेंडली डिटर्जेंट से धुलाई और वैक्यूम स्टीम आयरन से प्रेसिंग।',
    step4Title: 'एक्सप्रेस होम डिलीवरी',
    step4Desc: 'ताज़ा, सुगंधित और प्रेस किए हुए कपड़े 24-48 घंटों में आपके घर डिलीवर।',

    // Why Choose Us
    whyChooseUsTitle: 'हमें क्यों चुनें?',
    experiencedTrusted: 'अनुभवी और विश्वसनीय',
    experiencedSub: '2010 से कानपुर का भरोसा',
    safeHygienic: 'सुरक्षित और स्वच्छ',
    safeSub: 'आधुनिक और सुरक्षित धुलाई',
    onTimeDelivery: 'समय पर डिलीवरी',
    onTimeSub: 'आपका समय हमारे लिए कीमती है',
    customerSupport: 'ग्राहक सहायता',
    supportSub: 'हर सवाल के लिए हमेशा तैयार',

    // Admin Login Portal
    adminLoginTitle: 'एडमिन लॉगिन',
    adminLoginSub: 'लॉन्ड्री ऑर्डर्स, ट्रैकिंग और संचालन प्रबंधन के लिए साइन इन करें',
    adminPortalBadge: 'एडमिन पोर्टल',
    staffAccessOnly: 'केवल अधिकृत एडमिन व स्टाफ के लिए',
    workEmail: 'वर्क ईमेल / एडमिन आईडी',
    password: 'पासवर्ड',
    adminSignIn: 'एडमिन साइन इन',
    accountsCreatedByAdmin: 'सुरक्षित पोर्टल। अकाउंट्स सुपर एडमिन द्वारा प्रबंधित हैं।',
    backToWebsite: '← वेबसाइट पर वापस जाएं'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('diwakar_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('diwakar_lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const switchLanguage = (newLang) => {
    setLang(newLang);
  };

  const t = (key) => {
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      return TRANSLATIONS[lang][key];
    }
    return TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
