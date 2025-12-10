import React, { createContext, useContext, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- 📖 DICTIONARY (SHABD-KOSH) ---
const resources = {
  en: {
    translation: {
      // Navbar
      "app.name": "StudentSathi",
      "nav.dashboard": "Dashboard",
      "nav.rooms": "Find Room",
      "nav.mess": "Mess & Food",
      "nav.transport": "Transport",
      "nav.chill": "Chill Zone",
      "nav.login": "Login",
      "nav.register": "Register",
      "nav.logout": "Logout",
      "nav.profile": "Edit Profile",

      // Dashboard
      "dash.welcome": "Welcome",
      "dash.searchPlaceholder": "Search 'Hostel', 'Mess', 'Books'...",
      "dash.quickAccess": "Explore Campus",
      "dash.trending": "Trending Now",
      
      // Cards
      "card.room": "Find Room",
      "card.roomDesc": "No Brokerage",
      "card.mess": "Mess / Food",
      "card.messDesc": "Ghar Jaisa Khana",
      "card.transport": "Transport",
      "card.transportDesc": "Auto/Van Routes",
      "card.roommate": "Roommate",
      "card.roommateDesc": "Find Partner",
      "card.wiki": "City Wiki",
      "card.wikiDesc": "City Guide",
      "card.bazaar": "Bazaar",
      "card.bazaarDesc": "Buy & Sell",
      "card.events": "Chill Zone",
      "card.eventsDesc": "Fun & Events"
    }
  },
  hi: {
    translation: {
      // Navbar
      "app.name": "स्टूडेंट साथी",
      "nav.dashboard": "डैशबोर्ड",
      "nav.rooms": "कमरा खोजें",
      "nav.mess": "मेस और खाना",
      "nav.transport": "आने-जाने की सुविधा",
      "nav.chill": "मस्ती ज़ोन",
      "nav.login": "लॉगिन",
      "nav.register": "रजिस्टर",
      "nav.logout": "लॉगआउट",
      "nav.profile": "प्रोफाइल बदलें",

      // Dashboard
      "dash.welcome": "स्वागत है",
      "dash.searchPlaceholder": "खोजें 'हॉस्टल', 'मेस', 'किताबें'...",
      "dash.quickAccess": "सुविधाएं (Services)",
      "dash.trending": "शहर में चल रहा है 🔥",

      // Cards
      "card.room": "कमरा खोजें",
      "card.roomDesc": "बिना दलाली",
      "card.mess": "मेस / टिफिन",
      "card.messDesc": "घर जैसा स्वाद",
      "card.transport": "ट्रांसपोर्ट",
      "card.transportDesc": "ऑटो/वैन रूट",
      "card.roommate": "रूममेट",
      "card.roommateDesc": "साथी ढूँढें",
      "card.wiki": "सिटी गाइड",
      "card.wikiDesc": "शहर की जानकारी",
      "card.bazaar": "बाज़ार",
      "card.bazaarDesc": "खरीदें और बेचें",
      "card.events": "चिल ज़ोन",
      "card.eventsDesc": "पार्टी और इवेंट्स"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default English
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

const LocaleContext = createContext();

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider = ({ children }) => {
  const [isHindi, setIsHindi] = useState(false);

  const toggleLanguage = () => {
    const newLang = isHindi ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
    setIsHindi(!isHindi);
  };

  return (
    <LocaleContext.Provider value={{ isHindi, toggleLanguage }}>
      {children}
    </LocaleContext.Provider>
  );
};