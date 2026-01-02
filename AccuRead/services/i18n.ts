export type Language = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'pa';

export interface TranslationKeys {
  // Common
  ok: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  back: string;
  next: string;
  previous: string;
  loading: string;
  error: string;
  success: string;
  retry: string;
  close: string;
  
  // Navigation
  home: string;
  camera: string;
  history: string;
  dashboard: string;
  export: string;
  settings: string;
  
  // Camera Screen
  align_meter: string;
  hold_steady: string;
  adjust_angle: string;
  poor_quality: string;
  capturing: string;
  processing: string;
  getting_location: string;
  extracting_reading: string;
  
  // Results
  meter_reading: string;
  serial_number: string;
  confidence: string;
  location: string;
  timestamp: string;
  edit_field: string;
  submit_reading: string;
  retake_photo: string;
  reading_saved: string;
  
  // Authentication
  welcome_back: string;
  create_account: string;
  sign_in: string;
  sign_up: string;
  sign_out: string;
  email: string;
  password: string;
  confirm_password: string;
  forgot_password: string;
  reset_password: string;
  sign_in_with_google: string;
  sign_up_with_google: string;
  no_account: string;
  have_account: string;
  
  // Dashboard
  analytics: string;
  insights: string;
  total_readings: string;
  this_month: string;
  avg_confidence: string;
  most_active_meter: string;
  reading_trends: string;
  energy_consumption: string;
  no_data_available: string;
  
  // Export
  export_data: string;
  export_format: string;
  date_range: string;
  sort_by: string;
  export_readings: string;
  export_completed: string;
  export_failed: string;
  
  // Settings
  language: string;
  select_language: string;
  theme: string;
  notifications: string;
  about: string;
  version: string;
  
  // Errors
  network_error: string;
  camera_error: string;
  location_error: string;
  permission_denied: string;
  file_not_found: string;
  invalid_data: string;
  
  // Hindi specific
  meter_par_line_karein: string;
  dhire_rahein: string;
  angle_sahi_karein: string;
  quality_kharab_hai: string;
  
  // Regional language names
  english: string;
  hindi: string;
  bengali: string;
  telugu: string;
  marathi: string;
  tamil: string;
  gujarati: string;
  punjabi: string;
}

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Common
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    retry: 'Retry',
    close: 'Close',
    
    // Navigation
    home: 'Home',
    camera: 'Camera',
    history: 'History',
    dashboard: 'Dashboard',
    export: 'Export',
    settings: 'Settings',
    
    // Camera Screen
    align_meter: 'Align meter with guide',
    hold_steady: 'Hold steady',
    adjust_angle: 'Adjust angle',
    poor_quality: 'Poor quality',
    capturing: 'Capturing...',
    processing: 'Processing...',
    getting_location: 'Getting location...',
    extracting_reading: 'Extracting meter reading...',
    
    // Results
    meter_reading: 'Meter Reading',
    serial_number: 'Serial Number',
    confidence: 'Confidence',
    location: 'Location',
    timestamp: 'Timestamp',
    edit_field: 'Edit Field',
    submit_reading: 'Submit Reading',
    retake_photo: 'Retake Photo',
    reading_saved: 'Reading saved successfully!',
    
    // Authentication
    welcome_back: 'Welcome Back',
    create_account: 'Create Account',
    sign_in: 'Sign In',
    sign_up: 'Sign Up',
    sign_out: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirm_password: 'Confirm Password',
    forgot_password: 'Forgot Password?',
    reset_password: 'Reset Password',
    sign_in_with_google: 'Sign in with Google',
    sign_up_with_google: 'Sign up with Google',
    no_account: "Don't have an account?",
    have_account: 'Already have an account?',
    
    // Dashboard
    analytics: 'Analytics',
    insights: 'Insights',
    total_readings: 'Total Readings',
    this_month: 'This Month',
    avg_confidence: 'Avg Confidence',
    most_active_meter: 'Most Active Meter',
    reading_trends: 'Reading Trends',
    energy_consumption: 'Energy Consumption',
    no_data_available: 'No data available',
    
    // Export
    export_data: 'Export Data',
    export_format: 'Export Format',
    date_range: 'Date Range',
    sort_by: 'Sort By',
    export_readings: 'Export Readings',
    export_completed: 'Export completed successfully!',
    export_failed: 'Export failed',
    
    // Settings
    language: 'Language',
    select_language: 'Select Language',
    theme: 'Theme',
    notifications: 'Notifications',
    about: 'About',
    version: 'Version',
    
    // Errors
    network_error: 'Network error',
    camera_error: 'Camera error',
    location_error: 'Location error',
    permission_denied: 'Permission denied',
    file_not_found: 'File not found',
    invalid_data: 'Invalid data',
    
    // Hindi specific
    meter_par_line_karein: '',
    dhire_rahein: '',
    angle_sahi_karein: '',
    quality_kharab_hai: '',
    
    // Language names
    english: 'English',
    hindi: 'हिन्दी',
    bengali: 'বাংলা',
    telugu: 'తెలుగు',
    marathi: 'मराठी',
    tamil: 'தமிழ்',
    gujarati: 'ગુજરાતી',
    punjabi: 'ਪੰਜਾਬੀ',
  },
  
  hi: {
    // Common
    ok: 'ठीक है',
    cancel: 'रद्द करें',
    save: 'सेव करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    back: 'पीछे',
    next: 'अगला',
    previous: 'पिछला',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    retry: 'फिर से कोशिश करें',
    close: 'बंद करें',
    
    // Navigation
    home: 'होम',
    camera: 'कैमरा',
    history: 'इतिहास',
    dashboard: 'डैशबोर्ड',
    export: 'निर्यात',
    settings: 'सेटिंग्स',
    
    // Camera Screen
    align_meter: 'मीटर को गाइड के साथ लाइन में करें',
    hold_steady: 'स्थिर रहें',
    adjust_angle: 'कोण समायोजित करें',
    poor_quality: 'खराब गुणवत्ता',
    capturing: 'कैप्चर हो रहा है...',
    processing: 'प्रोसेसिंग...',
    getting_location: 'लोकेशन प्राप्त हो रही है...',
    extracting_reading: 'मीटर रीडिंग निकाली जा रही है...',
    
    // Results
    meter_reading: 'मीटर रीडिंग',
    serial_number: 'सीरियल नंबर',
    confidence: 'विश्वास',
    location: 'लोकेशन',
    timestamp: 'समय',
    edit_field: 'फील्ड संपादित करें',
    submit_reading: 'रीडिंग जमा करें',
    retake_photo: 'फोटो फिर से लें',
    reading_saved: 'रीडिंग सफलतापूर्वक सेव हो गई!',
    
    // Authentication
    welcome_back: 'वापसी पर स्वागत',
    create_account: 'खाता बनाएं',
    sign_in: 'साइन इन',
    sign_up: 'साइन अप',
    sign_out: 'साइन आउट',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirm_password: 'पासवर्ड की पुष्टि करें',
    forgot_password: 'पासवर्ड भूल गए?',
    reset_password: 'पासवर्ड रीसेट करें',
    sign_in_with_google: 'Google के साथ साइन इन करें',
    sign_up_with_google: 'Google के साथ साइन अप करें',
    no_account: 'खाता नहीं है?',
    have_account: 'पहले से ही खाता है?',
    
    // Dashboard
    analytics: 'एनालिटिक्स',
    insights: 'इनसाइट्स',
    total_readings: 'कुल रीडिंग्स',
    this_month: 'इस महीने',
    avg_confidence: 'औसत विश्वास',
    most_active_meter: 'सबसे सक्रिय मीटर',
    reading_trends: 'रीडिंग ट्रेंड्स',
    energy_consumption: 'ऊर्जा खपत',
    no_data_available: 'कोई डेटा उपलब्ध नहीं',
    
    // Export
    export_data: 'डेटा निर्यात करें',
    export_format: 'निर्यात प्रारूप',
    date_range: 'दिनांक सीमा',
    sort_by: 'इसके अनुसार क्रमबद्ध करें',
    export_readings: 'रीडिंग्स निर्यात करें',
    export_completed: 'निर्यात सफलतापूर्वक पूर्ण हुआ!',
    export_failed: 'निर्यात विफल',
    
    // Settings
    language: 'भाषा',
    select_language: 'भाषा चुनें',
    theme: 'थीम',
    notifications: 'सूचनाएं',
    about: 'के बारे में',
    version: 'संस्करण',
    
    // Errors
    network_error: 'नेटवर्क त्रुटि',
    camera_error: 'कैमरा त्रुटि',
    location_error: 'लोकेशन त्रुटि',
    permission_denied: 'अनुमति नामंजूर',
    file_not_found: 'फाइल नहीं मिली',
    invalid_data: 'अमान्य डेटा',
    
    // Hindi specific
    meter_par_line_karein: 'मीटर पर लाइन करें',
    dhire_rahein: 'धीरे रहें',
    angle_sahi_karein: 'एंगल सही करें',
    quality_kharab_hai: 'क्वालिटी खराब है',
    
    // Language names
    english: 'English',
    hindi: 'हिन्दी',
    bengali: 'বাংলা',
    telugu: 'తెలుగు',
    marathi: 'मराठी',
    tamil: 'தமிழ்',
    gujarati: 'ગુજરાતી',
    punjabi: 'ਪੰਜਾਬੀ',
  },
  
  bn: {
    // Bengali translations (key entries for brevity)
    ok: 'ঠিক আছে',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ করুন',
    delete: 'মুছুন',
    edit: 'সম্পাদনা করুন',
    back: 'পিছনে',
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    camera: 'ক্যামেরা',
    home: 'হোম',
    dashboard: 'ড্যাশবোর্ড',
    settings: 'সেটিংস',
    language: 'ভাষা',
    english: 'English',
    hindi: 'हिन्दी',
    bengali: 'বাংলা',
    telugu: 'తెలుగు',
    marathi: 'मराठी',
    tamil: 'தமிழ்',
    gujarati: 'ગુજરાતી',
    punjabi: 'ਪੰਜਾਬੀ',
    // ... add all other keys
  } as any,
  
  te: {
    // Telugu translations
    ok: 'సరే',
    cancel: 'రద్దు చేయండి',
    save: 'సేవ్ చేయండి',
    camera: 'కెమెరా',
    home: 'హోమ్',
    english: 'English',
    hindi: 'हिन्दी',
    bengali: 'বাংলা',
    telugu: 'తెలుగు',
    // ... add all other keys
  } as any,
  
  mr: {
    // Marathi translations
    ok: 'ठीक आहे',
    cancel: 'रद्द करा',
    save: 'जतन करा',
    camera: 'कॅमेरा',
    home: 'होम',
    english: 'English',
    hindi: 'हिन्दी',
    marathi: 'मराठी',
    // ... add all other keys
  } as any,
  
  ta: {
    // Tamil translations
    ok: 'சரி',
    cancel: 'ரத்து',
    save: 'சேமிக்கவும்',
    camera: 'கேமரா',
    home: 'முகப்பு',
    english: 'English',
    hindi: 'हिन्दी',
    tamil: 'தமிழ்',
    // ... add all other keys
  } as any,
  
  gu: {
    // Gujarati translations
    ok: 'બરાબર',
    cancel: 'રદ કરો',
    save: 'સાચવો',
    camera: 'કેમેરા',
    home: 'હોમ',
    english: 'English',
    hindi: 'हिन्दी',
    gujarati: 'ગુજરાતી',
    // ... add all other keys
  } as any,
  
  pa: {
    // Punjabi translations
    ok: 'ਠੀਕ ਹੈ',
    cancel: 'ਰੱਦ ਕਰੋ',
    save: 'ਸੇਵ ਕਰੋ',
    camera: 'ਕੈਮਰਾ',
    home: 'ਹੋਮ',
    english: 'English',
    hindi: 'हिन्दी',
    punjabi: 'ਪੰਜਾਬੀ',
    // ... add all other keys
  } as any,
};

export class I18nService {
  private static instance: I18nService;
  private currentLanguage: Language = 'en';

  static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  translate(key: keyof TranslationKeys): string {
    const translation = translations[this.currentLanguage]?.[key];
    return translation || translations.en[key] || key;
  }

  // Helper method for formatted strings
  format(key: keyof TranslationKeys, params: Record<string, string | number>): string {
    let text = this.translate(key);
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, String(value));
    });
    return text;
  }

  // Get all available languages
  getAvailableLanguages(): Array<{ code: Language; name: string; nativeName: string }> {
    return [
      { code: 'en', name: 'English', nativeName: translations.en.english },
      { code: 'hi', name: 'Hindi', nativeName: translations.hi.hindi },
      { code: 'bn', name: 'Bengali', nativeName: translations.bn.bengali },
      { code: 'te', name: 'Telugu', nativeName: translations.te.telugu },
      { code: 'mr', name: 'Marathi', nativeName: translations.mr.marathi },
      { code: 'ta', name: 'Tamil', nativeName: translations.ta.tamil },
      { code: 'gu', name: 'Gujarati', nativeName: translations.gu.gujarati },
      { code: 'pa', name: 'Punjabi', nativeName: translations.pa.punjabi },
    ];
  }

  // Check if RTL language
  isRTL(): boolean {
    // Currently none of the supported languages are RTL
    // Add support for Arabic, Urdu, etc. if needed
    return false;
  }

  // Get text direction
  getTextDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }
}

export const i18n = I18nService.getInstance();

// React hook for using translations
export const useTranslation = () => {
  const currentLanguage = i18n.getCurrentLanguage();
  
  return {
    t: (key: keyof TranslationKeys) => i18n.translate(key),
    format: (key: keyof TranslationKeys, params: Record<string, string | number>) => 
      i18n.format(key, params),
    currentLanguage,
    setLanguage: (language: Language) => i18n.setLanguage(language),
    isRTL: i18n.isRTL(),
    textDirection: i18n.getTextDirection(),
    availableLanguages: i18n.getAvailableLanguages(),
  };
};
