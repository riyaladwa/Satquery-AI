import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  bcp47: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-US', flag: 'EN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN', flag: 'HI' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN', flag: 'KN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN', flag: 'TA' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN', flag: 'TE' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN', flag: 'ML' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN', flag: 'MR' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN', flag: 'BN' }
];

export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    product: 'Product',
    howItWorks: 'How it Works',
    capabilities: 'Capabilities',
    reports: 'Reports',
    dashboard: 'Dashboard',
    history: 'History',
    startAnalyzing: 'Start Analyzing',
    exploreSatQuery: 'Explore SatQuery',
    askSatQuery: 'Ask SatQuery',
    queryPlaceholder: 'What would you like to know about this image?',
    singleImage: 'Single Image',
    bitemporal: 'Bi-temporal',
    opticalSar: 'Optical + SAR',
    visualEvidence: 'Visual Evidence Grounding',
    confidence: 'Confidence',
    reliability: 'Reliability',
    playVoice: 'Play Voice Answer',
    pauseVoice: 'Pause Voice',
    resumeVoice: 'Resume Voice',
    officialPdfReport: 'Official PDF Report',
    engineOnline: 'Engine Online',
    heroTag: 'Ask questions. Understand satellite imagery.',
    heroHeading: 'Ask questions about satellite imagery.',
    heroSubtitle: 'SatQuery AI transforms complex remote-sensing imagery into understandable answers, visual evidence, and actionable insights.'
  },
  hi: {
    product: 'उत्पाद',
    howItWorks: 'यह कैसे काम करता है',
    capabilities: 'क्षमताएं',
    reports: 'रिपोर्ट्स',
    dashboard: 'डैशबोर्ड',
    history: 'इतिहास',
    startAnalyzing: 'विश्लेषण शुरू करें',
    exploreSatQuery: 'SatQuery देखें',
    askSatQuery: 'SatQuery से पूछें',
    queryPlaceholder: 'आप इस उपग्रह छवि के बारे में क्या जानना चाहते हैं?',
    singleImage: 'एकल छवि',
    bitemporal: 'द्वि-कालिक',
    opticalSar: 'ऑप्टिकल + एसएआर',
    visualEvidence: 'दृश्य साक्ष्य ग्राउंडिंग',
    confidence: 'विश्वास स्कोर',
    reliability: 'विश्वसनीयता',
    playVoice: 'आवाज में उत्तर सुनें',
    pauseVoice: 'आवाज रोकें',
    resumeVoice: 'आवाज जारी रखें',
    officialPdfReport: 'आधिकारिक पीडीएफ रिपोर्ट',
    engineOnline: 'इंजन सक्रिय',
    heroTag: 'प्रश्न पूछें। उपग्रह चित्रों को समझें।',
    heroHeading: 'उपग्रह चित्रों के बारे में सीधे प्रश्न पूछें।',
    heroSubtitle: 'SatQuery AI जटिल रिमोट सेंसिंग डेटा को स्पष्ट उत्तरों, दृश्य साक्ष्यों और उपयोगी जानकारियों में बदलता है।'
  },
  kn: {
    product: 'ಉತ್ಪನ್ನ',
    howItWorks: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    capabilities: 'ಸಾಮರ್ಥ್ಯಗಳು',
    reports: 'ವರದಿಗಳು',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    history: 'ಇತಿಹಾಸ',
    startAnalyzing: 'ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ',
    exploreSatQuery: 'SatQuery ಅನ್ವೇಷಿಸಿ',
    askSatQuery: 'SatQuery ಗೆ ಕೇಳಿ',
    queryPlaceholder: 'ಈ ಉಪಗ್ರಹ ಚಿತ್ರದ ಬಗ್ಗೆ ನೀವು ಏನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?',
    singleImage: 'ಏಕ ಚಿತ್ರ',
    bitemporal: 'ದ್ವಿ-ಕಾಲಿಕ',
    opticalSar: 'ಆಪ್ಟಿಕಲ್ + SAR',
    visualEvidence: 'ದೃಶ್ಯ ಪುರಾವೆ ಗ್ರೌಂಡಿಂಗ್',
    confidence: 'ವಿಶ್ವಾಸಾರ್ಹತೆ',
    reliability: 'ನಿಖರತೆ',
    playVoice: 'ಧ್ವನಿ ಉತ್ತರ ಆಲಿಸಿ',
    pauseVoice: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
    resumeVoice: 'ಧ್ವನಿ ಮುಂದುವರಿಸಿ',
    officialPdfReport: 'ಅಧಿಕೃತ PDF ವರದಿ',
    engineOnline: 'ಎಂಜಿನ್ ಸಕ್ರಿಯ',
    heroTag: 'ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ. ಉಪಗ್ರಹ ಚಿತ್ರಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.',
    heroHeading: 'ಉಪಗ್ರಹ ಚಿತ್ರಗಳ ಬಗ್ಗೆ ನೇರವಾಗಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.',
    heroSubtitle: 'SatQuery AI ಸಂಕೀರ್ಣ ರಿಮೋಟ್ ಸೆನ್ಸಿಂಗ್ ಚಿತ್ರಗಳನ್ನು ಸ್ಪಷ್ಟ ಉತ್ತರಗಳು, ದೃಶ್ಯ ಪುರಾವೆಗಳು ಮತ್ತು ನಿಖರ ಮಾಹಿತಿಗಳಿಗೆ ಪರಿವರ್ತಿಸುತ್ತದೆ.'
  },
  ta: {
    product: 'தயாரிப்பு',
    howItWorks: 'செயல்படும் விதம்',
    capabilities: 'திறன்கள்',
    reports: 'அறிக்கைகள்',
    dashboard: 'முகப்பு பலகை',
    history: 'வரலாறு',
    startAnalyzing: 'பகுப்பாய்வைத் தொடங்கு',
    exploreSatQuery: 'SatQuery ஆராய்க',
    askSatQuery: 'SatQuery இடம் கேளுங்கள்',
    queryPlaceholder: 'இந்த செயற்கைக்கோள் படம் பற்றி நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?',
    singleImage: 'ஒற்றைப் படம்',
    bitemporal: 'இரு-கால மாறுபாடு',
    opticalSar: 'ஆப்டிகல் + SAR',
    visualEvidence: 'காட்சி சான்றுகள்',
    confidence: 'நம்பகத்தன்மை',
    reliability: 'துல்லியம்',
    playVoice: 'குரல் பதிலை இயக்கு',
    pauseVoice: 'குரலை இடைநிறுத்து',
    resumeVoice: 'குரலைத் தொடர்க',
    officialPdfReport: 'அதிகாரப்பூர்வ PDF அறிக்கை',
    engineOnline: 'இயந்திரம் தயார்',
    heroTag: 'கேள்விகள் கேளுங்கள். செயற்கைக்கோள் படங்களைப் புரிந்து கொள்ளுங்கள்.',
    heroHeading: 'செயற்கைக்கோள் படங்களைப் பற்றி கேள்விகள் கேளுங்கள்.',
    heroSubtitle: 'SatQuery AI சிக்கலான தொலை நுண்ணுணர்வுத் தரவை எளிய பதில்கள் மற்றும் காட்சி ஆதாரங்களாக மாற்றுகிறது.'
  },
  te: {
    product: 'ఉత్పత్తి',
    howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    capabilities: 'సామర్థ్యాలు',
    reports: 'నివేదికలు',
    dashboard: 'డాష్‌బోర్డ్',
    history: 'చరిత్ర',
    startAnalyzing: 'విశ్లేషణ ప్రారంభించండి',
    exploreSatQuery: 'SatQuery అన్వేషించండి',
    askSatQuery: 'SatQuery ని అడగండి',
    queryPlaceholder: 'ఈ ఉపగ్రహ చిత్రం గురించి మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?',
    singleImage: 'ఒకే చిత్రం',
    bitemporal: 'ద్వి-కాలిక మార్పు',
    opticalSar: 'ఆప్టికల్ + SAR',
    visualEvidence: 'దృశ్య ఆధారాలు',
    confidence: 'నమ్మకం',
    reliability: 'ఖచ్చితత్వం',
    playVoice: 'వాయిస్ సమాధానం వినండి',
    pauseVoice: 'ఆపండి',
    resumeVoice: 'కొనసాగించండి',
    officialPdfReport: 'అధికారిక PDF నివేదిక',
    engineOnline: 'ఇంజన్ సిద్ధంగా ఉంది',
    heroTag: 'ప్రశ్నలు అడగండి. ఉపగ్రహ చిత్రాలను అర్థం చేసుకోండి.',
    heroHeading: 'ఉపగ్రహ చిత్రాల గురించి ప్రశ్నలు అడగండి.',
    heroSubtitle: 'SatQuery AI సంక్లిష్ట రిమోట్ సెన్సింగ్ డేటాను స్పష్టమైన సమాధానాలు మరియు ఆధారాలుగా మారుస్తుంది.'
  },
  ml: {
    product: 'ഉൽപ്പന്നം',
    howItWorks: 'പ്രവർത്തനരീതി',
    capabilities: 'സവിശേഷതകൾ',
    reports: 'റിപ്പോർട്ടുകൾ',
    dashboard: 'ഡാഷ്ബോർഡ്',
    history: 'ചരിത്രം',
    startAnalyzing: 'വിശകലനം ആരംഭിക്കുക',
    exploreSatQuery: 'SatQuery കാണുക',
    askSatQuery: 'SatQuery യോട് ചോദിക്കൂ',
    queryPlaceholder: 'ഈ ഉപഗ്രഹ ചിത്രത്തെക്കുറിച്ച് എന്താണ് അറിയേണ്ടത്?',
    singleImage: 'ഒറ്റ ചിത്രം',
    bitemporal: 'ദ്വി-കാല മാറ്റം',
    opticalSar: 'ഒപ്റ്റിക്കൽ + SAR',
    visualEvidence: 'ദൃശ്യ തെളിവുകൾ',
    confidence: 'വിശ്വാസ്യത',
    reliability: 'കൃത്യത',
    playVoice: 'ശബ്ദത്തിൽ കേൾക്കുക',
    pauseVoice: 'നിർത്തുക',
    resumeVoice: 'തുടരുക',
    officialPdfReport: 'ഔദ്യോഗിക PDF റിപ്പോർട്ട്',
    engineOnline: 'എഞ്ചിൻ തയ്യാറാണ്',
    heroTag: 'ചോദ്യങ്ങൾ ചോദിക്കൂ. ഉപഗ്രഹ ചിത്രങ്ങൾ മനസ്സിലാക്കൂ.',
    heroHeading: 'ഉപഗ്രഹ ചിത്രങ്ങളെക്കുറിച്ച് ചോദ്യങ്ങൾ ചോദിക്കൂ.',
    heroSubtitle: 'SatQuery AI സങ്കീർണ്ണമായ റിമോട്ട് സെൻസിംഗ് ഡാറ്റയെ ലളിതമായ ഉത്തരങ്ങളാക്കി മാറ്റുന്നു.'
  },
  mr: {
    product: 'उत्पादन',
    howItWorks: 'हे कसे कार्य करते',
    capabilities: 'क्षमता',
    reports: 'अहवाल',
    dashboard: 'डॅशबोर्ड',
    history: 'इतिहास',
    startAnalyzing: 'विश्लेषण सुरू करा',
    exploreSatQuery: 'SatQuery एक्सप्लोर करा',
    askSatQuery: 'SatQuery ला विचारा',
    queryPlaceholder: 'या उपग्रह प्रतिमेबद्दल तुम्हाला काय जाणून घ्यायचे आहे?',
    singleImage: 'एकल प्रतिमा',
    bitemporal: 'द्वि-कालिक बदल',
    opticalSar: 'ऑप्टिकल + SAR',
    visualEvidence: 'दृश्य पुरावे',
    confidence: 'विश्वास',
    reliability: 'विश्वसनीयता',
    playVoice: 'आवाजात उत्तर ऐका',
    pauseVoice: 'आवाज थांबवा',
    resumeVoice: 'आवाज सुरू ठेवा',
    officialPdfReport: 'अधिकृत PDF अहवाल',
    engineOnline: 'इंजिन ऑनलाइन',
    heroTag: 'प्रश्न विचारा. उपग्रह प्रतिमा समजून घ्या.',
    heroHeading: 'उपग्रह प्रतिमांबद्दल थेट प्रश्न विचारा.',
    heroSubtitle: 'SatQuery AI क्लिष्ट रिमोट सेन्सिंग डेटा सोप्या उत्तरांमध्ये आणि दृश्य पुराव्यांमध्ये बदलते.'
  },
  bn: {
    product: 'পণ্য',
    howItWorks: 'এটি যেভাবে কাজ করে',
    capabilities: 'সক্ষমতা',
    reports: 'রিপোর্ট',
    dashboard: 'ড্যাশবোর্ড',
    history: 'ইতিহাস',
    startAnalyzing: 'বিশ্লেষণ শুরু করুন',
    exploreSatQuery: 'SatQuery অন্বেষণ করুন',
    askSatQuery: 'SatQuery-কে জিজ্ঞাসা করুন',
    queryPlaceholder: 'এই স্যাটেলাইট চিত্র সম্পর্কে আপনি কী জানতে চান?',
    singleImage: 'একক চিত্র',
    bitemporal: 'দ্বি-কালিক পরিবর্তন',
    opticalSar: 'অপটিক্যাল + এসএআর',
    visualEvidence: 'ভিজ্যুয়াল প্রমাণ',
    confidence: 'আত্মবিশ্বাস',
    reliability: 'নির্ভরযোগ্যতা',
    playVoice: 'ভয়েস উত্তর শুনুন',
    pauseVoice: 'ভয়েস থামান',
    resumeVoice: 'চালিয়ে যান',
    officialPdfReport: 'অফিসিয়াল পিডিএফ রিপোর্ট',
    engineOnline: 'ইঞ্জিন অনলাইন',
    heroTag: 'প্রশ্ন করুন। স্যাটেলাইট চিত্র বুঝুন।',
    heroHeading: 'স্যাটেলাইট চিত্র সম্পর্কে প্রশ্ন করুন।',
    heroSubtitle: 'SatQuery AI জটিল রিমোট সেন্সিং ডেটাকে স্পষ্ট উত্তর এবং চাক্ষুষ প্রমাণে রূপান্তরিত করে।'
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  currentLanguageOption: LanguageOption;
  languages: LanguageOption[];
  speechStatus: 'idle' | 'playing' | 'paused';
  currentSpokenText: string;
  speak: (text: string, langCode?: string) => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  stopSpeech: () => void;
  replaySpeech: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('satquery_language') || 'en';
  });

  const [speechStatus, setSpeechStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [currentSpokenText, setCurrentSpokenText] = useState<string>('');
  const lastSpokenRef = useRef<{ text: string; langCode: string }>({ text: '', langCode: 'en' });

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const setLanguage = (newLang: string) => {
    setLanguageState(newLang);
    localStorage.setItem('satquery_language', newLang);
    if (speechStatus !== 'idle') {
      stopSpeech();
    }
  };

  const t = (key: string): string => {
    if (UI_TRANSLATIONS[language] && UI_TRANSLATIONS[language][key]) {
      return UI_TRANSLATIONS[language][key];
    }
    if (UI_TRANSLATIONS.en && UI_TRANSLATIONS.en[key]) {
      return UI_TRANSLATIONS.en[key];
    }
    return key;
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeechStatus('idle');
  };

  const pauseSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && speechStatus === 'playing') {
      window.speechSynthesis.pause();
      setSpeechStatus('paused');
    }
  };

  const resumeSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && speechStatus === 'paused') {
      window.speechSynthesis.resume();
      setSpeechStatus('playing');
    }
  };

  const speak = (text: string, langCode?: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const targetLang = langCode || language;
    lastSpokenRef.current = { text, langCode: targetLang };
    setCurrentSpokenText(text);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langOpt = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[0];
    utterance.lang = langOpt.bcp47;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang === langOpt.bcp47 || v.lang.startsWith(targetLang)
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setSpeechStatus('playing');
    };

    utterance.onend = () => {
      setSpeechStatus('idle');
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis event:', e);
      setSpeechStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const replaySpeech = () => {
    if (lastSpokenRef.current.text) {
      speak(lastSpokenRef.current.text, lastSpokenRef.current.langCode);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageOption,
        languages: SUPPORTED_LANGUAGES,
        speechStatus,
        currentSpokenText,
        speak,
        pauseSpeech,
        resumeSpeech,
        stopSpeech,
        replaySpeech,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
