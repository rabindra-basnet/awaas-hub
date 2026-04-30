"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

type Language = "en" | "np";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string | string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "aawashub-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language;
    if (stored && (stored === "en" || stored === "np")) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string): string | string[] => {
      const keys = key.split(".");
      let value: any = translations[language];

      for (const k of keys) {
        if (value === undefined) return key;
        value = value[k];
      }

      return value ?? key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}

// Translation dictionary
export const translations = {
  en: {
    nav: {
      home: "Home",
      properties: "Properties",
      about: "About",
      blog: "Blog",
      contact: "Contact",
      login: "Login",
      register: "Signup",
    },
    hero: {
      headline: "Find Your Perfect",
      subheadline: "Property in",
      defaultCity: "Nepal",
      description:
        "Explore verified homes, apartments, and land with real-time location visibility.",
      searchPlaceholder: "Kathmandu, Lalitpur, Pokhara, ...",
      searchButton: "Search",
      useLocation: "Use my current location",
      locating: "Locating...",
    },
    features: {
      title: "Why Choose AawasHub?",
      subtitle: "Nepal's most trusted property marketplace",
      verifiedListings: {
        title: "Verified Listings",
        description:
          "Every property is verified by our team to ensure authenticity and quality.",
      },
      secureTransactions: {
        title: "Secure Transactions",
        description:
          "Your data and transactions are protected with bank-level security.",
      },
      wideSelection: {
        title: "Wide Selection",
        description: "Find apartments, houses, commercial spaces across Nepal.",
      },
    },
    properties: {
      title: "Featured Properties",
      subtitle: "Latest verified properties",
      viewAll: "View All",
      verified: "Verified",
      beds: "Beds",
      baths: "Baths",
      pricePrefix: "NPR",
    },
    cta: {
      title: "Ready to Find Your Dream Property?",
      subtitle:
        "Join thousands of satisfied customers who found their perfect home with AawasHub",
      getStarted: "Get Started Now",
      learnMore: "Learn More",
    },
    footer: {
      company: "AawasHub",
      tagline: "Your trusted partner in finding the perfect property in Nepal.",
      quickLinks: "Quick Links",
      support: "Support",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      contact: "Contact",
      address: "Kathmandu, Nepal",
      email: "contact@aawashub.com",
      phone: "+977 1 234 5678",
      copyright: "All rights reserved.",
    },
    language: {
      en: "English",
      np: "नेपाली",
      switchTo: "Switch to",
    },
  },
  np: {
    nav: {
      home: "गृहपृष्ठ",
      properties: "सम्पत्तिहरू",
      about: "हाम्रोबारे",
      blog: "ब्लग",
      contact: "सम्पर्क",
      login: "लगइन",
      register: "दर्ता",
    },
    hero: {
      headline: "आफ्नो उत्कृष्ट घर",
      subheadline: "यहाँ आफ्नो सपनाको सम्पत्ति खोज्नुहोस्",
      defaultCity: "नेपाल",
      description:
        "प्रमाणित घर, अपार्टमेन्ट र जमिन वास्तविक समय स्थान दृश्यता सहित अन्वेषण गर्नुहोस्।",
      searchPlaceholder: "काठमाडौं, ललितपुर, पोखरा, ...",
      searchButton: "खोज्नुहोस्",
      useLocation: "मेरो वर्तमान स्थान प्रयोग गर्नुहोस्",
      locating: "स्थान पत्ता लगाइँदै...",
    },
    features: {
      title: "किन आवासहब छान्ने?",
      subtitle: "नेपालको सबैभन्दा विश्वसनीय सम्पत्ति बजार",
      verifiedListings: {
        title: "प्रमाणित सूचीहरू",
        description:
          "प्रत्येक सम्पत्ति हाम्रो टोलीद्वारा प्रमाणित छ ताकि प्रामाणिकता र गुणस्तर सुनिश्चित होस्।",
      },
      secureTransactions: {
        title: "सुरक्षित कारोबार",
        description:
          "तपाईंको डाटा र कारोबार बैंक-स्तरको सुरक्षासँग सुरक्षित छन्।",
      },
      wideSelection: {
        title: "विशाल छनोट",
        description:
          "नेपालभर अपार्टमेन्ट, घर, व्यावसायिक स्थानहरू फेला पार्नुहोस्।",
      },
    },
    properties: {
      title: "विशेष सम्पत्तिहरू",
      subtitle: "नवीनतम प्रमाणित सम्पत्तिहरू",
      viewAll: "सबै हेर्नुहोस्",
      verified: "प्रमाणित",
      beds: "शय्या",
      baths: "बाथरूम",
      pricePrefix: "रु.",
    },
    cta: {
      title: "आफ्नो सपनाको सम्पत्ति खोज्न तयार हुनुहुन्छ?",
      subtitle:
        "हजारौं सन्तुष्ट ग्राहकहरू जसले आवासहबसँग आफ्नो उत्तम घर फेला पारे",
      getStarted: "अहिले सुरु गर्नुहोस्",
      learnMore: "थप जान्नुहोस्",
    },
    footer: {
      company: "आवासहब",
      tagline: "नेपालमा उत्तम सम्पत्ति खोज्न तपाईंको विश्वसनीय साथी।",
      quickLinks: "द्रुत लिङ्कहरू",
      support: "सहयोग",
      contact: "सम्पर्क",
      address: "काठमाडौं, नेपाल",
      terms: "सेवाका सर्तहरू",
      privacy: "गोपनीयता नीति",
      email: "contact@aawashub.com",
      phone: "+९७७ १ २३४ ५६७८",
      copyright: "सर्वाधिकार सुरक्षित।",
    },
    language: {
      en: "English",
      np: "नेपाली",
      switchTo: "मा स्विच गर्नुहोस्",
    },
  },
};
