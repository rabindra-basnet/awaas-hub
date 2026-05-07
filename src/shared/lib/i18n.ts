export const locales = ["en", "ne"] as const;
export type Locale = (typeof locales)[number];

export const translations = {
  en: {
    nav: {
      properties: "Properties",
      howItWorks: "How it works",
      signIn: "Sign in",
      getStarted: "Get started",
      dashboard: "Dashboard",
    },
    hero: {
      badge: "🇳🇵 Nepal's trusted real estate platform",
      title: "Find your perfect",
      titleHighlight: "home in Nepal",
      subtitle: "Browse verified properties — houses, land, and apartments across Nepal, all in one place.",
      browseCta: "Browse Properties",
      listCta: "List your property",
      stats: {
        properties: "Properties",
        verified: "Verified Listings",
        users: "Happy Users",
      },
    },
    featured: {
      title: "Featured Properties",
      subtitle: "Verified listings ready for viewing",
      viewAll: "View all",
    },
    howItWorks: {
      title: "How it works",
      subtitle: "From search to signing — we make finding your next property simple.",
      steps: [
        {
          title: "Browse listings",
          description: "Search verified properties across Nepal filtered by location, price, and category.",
        },
        {
          title: "Verified quality",
          description: "Every listing is reviewed and verified by our team before going public.",
        },
        {
          title: "Book a viewing",
          description: "Schedule property viewings, inspections, or legal reviews directly from the platform.",
        },
        {
          title: "Close the deal",
          description: "Connect with owners, negotiate, and finalize your purchase with confidence.",
        },
      ],
    },
    cta: {
      title: "Ready to find your next property?",
      subtitle: "Join thousands of buyers and sellers on Nepal's most trusted real estate platform.",
      primary: "Create free account",
      secondary: "Browse listings",
    },
    footer: {
      rights: "All rights reserved.",
    },
  },

  ne: {
    nav: {
      properties: "सम्पत्तिहरू",
      howItWorks: "कसरी काम गर्छ",
      signIn: "साइन इन",
      getStarted: "सुरु गर्नुहोस्",
      dashboard: "ड्यासबोर्ड",
    },
    hero: {
      badge: "🇳🇵 नेपालको भरोसेमान घर-जग्गा प्लेटफर्म",
      title: "आफ्नो सपनाको",
      titleHighlight: "घर खोज्नुहोस्",
      subtitle: "नेपालभरका प्रमाणित घर, जग्गा र अपार्टमेन्टहरू एकै ठाउँमा हेर्नुहोस्।",
      browseCta: "सम्पत्ति हेर्नुहोस्",
      listCta: "सम्पत्ति सूचीकृत गर्नुहोस्",
      stats: {
        properties: "सम्पत्तिहरू",
        verified: "प्रमाणित सूची",
        users: "खुसी प्रयोगकर्ता",
      },
    },
    featured: {
      title: "विशेष सम्पत्तिहरू",
      subtitle: "हेर्नका लागि तयार प्रमाणित सूचीहरू",
      viewAll: "सबै हेर्नुहोस्",
    },
    howItWorks: {
      title: "कसरी काम गर्छ",
      subtitle: "खोजीदेखि सम्झौतासम्म — हामी तपाईंको अर्को सम्पत्ति फेला पार्न सजिलो बनाउँछौं।",
      steps: [
        {
          title: "सूचीहरू हेर्नुहोस्",
          description: "स्थान, मूल्य र श्रेणीले फिल्टर गरी नेपालभरका प्रमाणित सम्पत्तिहरू खोज्नुहोस्।",
        },
        {
          title: "प्रमाणित गुणस्तर",
          description: "सार्वजनिक हुनुअघि हाम्रो टोलीद्वारा हरेक सूची समीक्षा र प्रमाणित गरिएको छ।",
        },
        {
          title: "भ्रमण बुक गर्नुहोस्",
          description: "प्लेटफर्मबाटै सम्पत्ति भ्रमण, निरीक्षण वा कानूनी समीक्षा तालिका बनाउनुहोस्।",
        },
        {
          title: "सम्झौता गर्नुहोस्",
          description: "मालिकहरूसँग जोडिनुहोस्, वार्ता गर्नुहोस् र आत्मविश्वासका साथ खरिद अन्तिम गर्नुहोस्।",
        },
      ],
    },
    cta: {
      title: "अर्को सम्पत्ति खोज्न तयार हुनुहुन्छ?",
      subtitle: "नेपालको सबैभन्दा भरोसेमान घर-जग्गा प्लेटफर्ममा हजारौं खरिदकर्ता र विक्रेताहरूसँग सामेल हुनुहोस्।",
      primary: "नि:शुल्क खाता बनाउनुहोस्",
      secondary: "सूचीहरू हेर्नुहोस्",
    },
    footer: {
      rights: "सर्वाधिकार सुरक्षित।",
    },
  },
} satisfies Record<Locale, unknown>;

export type Translations = (typeof translations)["en"];
