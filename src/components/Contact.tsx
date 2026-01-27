import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, MapPin, Send, CheckCircle, Github, Clock, 
  MessageSquare, Calculator, FileText, ChevronRight,
  Check
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// ==================== TYPES ====================
interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  budget: string;
  projectType: string;
  estimatedPrice: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface Feature {
  id: string;
  name: { pl: string; en: string };
  price: number;
  time: number;
  icon: string;
  category: string;
}

// ==================== DATA ====================
const projectTypes = [
  { id: 'landing', name: { pl: 'Landing Page', en: 'Landing Page' }, basePrice: 1500, baseTime: 7, icon: '📄' },
  { id: 'website', name: { pl: 'Strona firmowa', en: 'Business Website' }, basePrice: 3000, baseTime: 14, icon: '🌐' },
  { id: 'ecommerce', name: { pl: 'Sklep online', en: 'E-commerce' }, basePrice: 6000, baseTime: 30, icon: '🛒' },
  { id: 'webapp', name: { pl: 'Aplikacja webowa', en: 'Web Application' }, basePrice: 8000, baseTime: 45, icon: '💻' },
  { id: 'redesign', name: { pl: 'Redesign strony', en: 'Website Redesign' }, basePrice: 2500, baseTime: 14, icon: '🔄' },
  { id: 'wordpress', name: { pl: 'Motyw WordPress', en: 'WordPress Theme' }, basePrice: 4000, baseTime: 21, icon: '📝' },
];

const features: Feature[] = [
  // Design
  { id: 'custom-design', name: { pl: 'Custom design UI/UX', en: 'Custom UI/UX Design' }, price: 2000, time: 7, icon: '🎨', category: 'design' },
  { id: 'animations', name: { pl: 'Animacje', en: 'Animations' }, price: 1000, time: 3, icon: '✨', category: 'design' },
  { id: 'responsive', name: { pl: 'Responsywność premium', en: 'Premium Responsive' }, price: 800, time: 2, icon: '📱', category: 'design' },
  
  // Funkcjonalności
  { id: 'auth', name: { pl: 'System logowania', en: 'Login System' }, price: 1500, time: 5, icon: '🔐', category: 'features' },
  { id: 'payments', name: { pl: 'Płatności online', en: 'Online Payments' }, price: 2000, time: 7, icon: '💳', category: 'features' },
  { id: 'admin', name: { pl: 'Panel administracyjny', en: 'Admin Panel' }, price: 2500, time: 10, icon: '⚙️', category: 'features' },
  { id: 'newsletter', name: { pl: 'Newsletter', en: 'Newsletter' }, price: 800, time: 2, icon: '📧', category: 'features' },
  
  // Integracje
  { id: 'analytics', name: { pl: 'Google Analytics', en: 'Google Analytics' }, price: 500, time: 1, icon: '📈', category: 'integrations' },
  { id: 'seo', name: { pl: 'Optymalizacja SEO', en: 'SEO Optimization' }, price: 1500, time: 3, icon: '🎯', category: 'integrations' },
  { id: 'multilang', name: { pl: 'Wielojęzyczność', en: 'Multi-language' }, price: 2000, time: 5, icon: '🌍', category: 'integrations' },
];

const urgencyOptions = [
  { id: 'normal', name: { pl: 'Standardowy', en: 'Standard' }, multiplier: 1, icon: '🐢', desc: { pl: 'Normalne tempo', en: 'Normal pace' } },
  { id: 'fast', name: { pl: 'Przyspieszony', en: 'Fast' }, multiplier: 1.3, icon: '🐇', desc: { pl: '-25% czasu', en: '-25% time' } },
  { id: 'urgent', name: { pl: 'Pilny', en: 'Urgent' }, multiplier: 1.5, icon: '🚀', desc: { pl: '-50% czasu', en: '-50% time' } },
];

// ==================== COMPONENT ====================
export function Contact() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'form' | 'calculator'>('form');
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    budget: "",
    projectType: "",
    estimatedPrice: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Calculator state
  const [selectedType, setSelectedType] = useState(projectTypes[0]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [urgency, setUrgency] = useState(urgencyOptions[0]);

  // Translations
  const t = {
    pl: {
      badge: "Kontakt",
      title: "Porozmawiajmy o",
      titleHighlight: "Twoim projekcie",
      subtitle: "Masz pomysł na stronę lub aplikację? Skontaktuj się ze mną, a wspólnie omówimy szczegóły.",
      tabForm: "Formularz kontaktowy",
      tabCalculator: "Kalkulator wyceny",
      contactInfo: "Dane kontaktowe",
      email: "Email",
      phone: "Telefon",
      location: "Lokalizacja",
      github: "GitHub",
      fastResponse: "Szybka odpowiedź",
      fastResponseDesc: "Odpowiadam w ciągu 24h w dni robocze. Pilne sprawy? Zadzwoń!",
      freeConsultation: "Bezpłatna konsultacja",
      freeConsultationDesc: "Pierwsza rozmowa jest zawsze bezpłatna - bez zobowiązań.",
      formName: "Imię i nazwisko",
      formEmail: "Email",
      formPhone: "Telefon (opcjonalnie)",
      formBudget: "Budżet",
      formBudgetPlaceholder: "Wybierz przedział",
      formSubject: "Temat",
      formSubjectPlaceholder: "np. Strona firmowa, Sklep...",
      formMessage: "Wiadomość",
      formMessagePlaceholder: "Opisz swój projekt, cele i oczekiwania...",
      formSubmit: "Wyślij wiadomość",
      formSubmitting: "Wysyłanie...",
      formSuccess: "Wiadomość wysłana!",
      formSuccessDesc: "Dziękuję za kontakt. Odpowiem najszybciej jak to możliwe.",
      formResponseTime: "Odpowiadam zwykle w ciągu 24h",
      required: "wymagane",
      // Validation
      errorName: "Imię jest wymagane",
      errorEmail: "Email jest wymagany",
      errorEmailInvalid: "Podaj prawidłowy email",
      errorMessage: "Wiadomość jest wymagana",
      errorMessageLength: "Minimum 10 znaków",
      // Calculator
      calcProjectType: "Typ projektu",
      calcFeatures: "Funkcjonalności",
      calcFeaturesSelected: "wybrano",
      calcUrgency: "Termin realizacji",
      calcSummary: "Podsumowanie",
      calcBasePrice: "Cena bazowa",
      calcFeaturesPrice: "Funkcje",
      calcPriority: "Priorytet",
      calcEstimatedPrice: "Szacowana cena",
      calcTime: "Czas realizacji",
      calcDays: "dni roboczych",
      calcSendRequest: "Wyślij zapytanie z tą wyceną",
      calcNote: "* Ceny są orientacyjne",
      calcCategoryDesign: "Design",
      calcCategoryFeatures: "Funkcjonalności",
      calcCategoryIntegrations: "Integracje",
    },
    en: {
      badge: "Contact",
      title: "Let's talk about",
      titleHighlight: "Your project",
      subtitle: "Have an idea for a website or app? Contact me and we'll discuss the details together.",
      tabForm: "Contact Form",
      tabCalculator: "Price Calculator",
      contactInfo: "Contact Info",
      email: "Email",
      phone: "Phone",
      location: "Location",
      github: "GitHub",
      fastResponse: "Fast Response",
      fastResponseDesc: "I respond within 24h on business days. Urgent? Call me!",
      freeConsultation: "Free Consultation",
      freeConsultationDesc: "First conversation is always free - no obligations.",
      formName: "Full name",
      formEmail: "Email",
      formPhone: "Phone (optional)",
      formBudget: "Budget",
      formBudgetPlaceholder: "Select range",
      formSubject: "Subject",
      formSubjectPlaceholder: "e.g. Business website, Store...",
      formMessage: "Message",
      formMessagePlaceholder: "Describe your project, goals and expectations...",
      formSubmit: "Send message",
      formSubmitting: "Sending...",
      formSuccess: "Message sent!",
      formSuccessDesc: "Thank you for reaching out. I'll respond as soon as possible.",
      formResponseTime: "Usually respond within 24h",
      required: "required",
      errorName: "Name is required",
      errorEmail: "Email is required",
      errorEmailInvalid: "Enter a valid email",
      errorMessage: "Message is required",
      errorMessageLength: "Minimum 10 characters",
      calcProjectType: "Project Type",
      calcFeatures: "Features",
      calcFeaturesSelected: "selected",
      calcUrgency: "Timeline",
      calcSummary: "Summary",
      calcBasePrice: "Base price",
      calcFeaturesPrice: "Features",
      calcPriority: "Priority",
      calcEstimatedPrice: "Estimated price",
      calcTime: "Delivery time",
      calcDays: "business days",
      calcSendRequest: "Send request with this estimate",
      calcNote: "* Prices are estimates",
      calcCategoryDesign: "Design",
      calcCategoryFeatures: "Features",
      calcCategoryIntegrations: "Integrations",
    }
  };

  const text = t[language];

  // Calculator logic
  const calculation = useMemo(() => {
    const basePrice = selectedType.basePrice;
    const baseTime = selectedType.baseTime;
    
    const featuresPrice = selectedFeatures.reduce((sum, id) => {
      const feature = features.find(f => f.id === id);
      return sum + (feature?.price || 0);
    }, 0);
    
    const featuresTime = selectedFeatures.reduce((sum, id) => {
      const feature = features.find(f => f.id === id);
      return sum + (feature?.time || 0);
    }, 0);
    
    const subtotal = basePrice + featuresPrice;
    const total = Math.round(subtotal * urgency.multiplier);
    const time = Math.round((baseTime + featuresTime) / urgency.multiplier);
    
    return { basePrice, featuresPrice, subtotal, total, time };
  }, [selectedType, selectedFeatures, urgency]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = text.errorName;
    }

    if (!formData.email.trim()) {
      newErrors.email = text.errorEmail;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = text.errorEmailInvalid;
    }

    if (!formData.message.trim()) {
      newErrors.message = text.errorMessage;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = text.errorMessageLength;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        budget: "",
        projectType: "",
        estimatedPrice: "",
      });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSendEstimate = () => {
    const selectedFeatureNames = selectedFeatures
      .map(id => features.find(f => f.id === id)?.name[language])
      .filter(Boolean)
      .join(', ');
    
    setFormData(prev => ({
      ...prev,
      subject: selectedType.name[language],
      message: language === 'pl' 
        ? `Interesuje mnie: ${selectedType.name[language]}\n\nWybrane funkcje: ${selectedFeatureNames || 'Brak'}\n\nSzacowana cena: ${calculation.total.toLocaleString()} PLN\nSzacowany czas: ${calculation.time} dni\n\nDodatkowe informacje:\n`
        : `I'm interested in: ${selectedType.name[language]}\n\nSelected features: ${selectedFeatureNames || 'None'}\n\nEstimated price: ${calculation.total.toLocaleString()} PLN\nEstimated time: ${calculation.time} days\n\nAdditional info:\n`,
      budget: calculation.total <= 3000 ? '1500-3000' : calculation.total <= 6000 ? '3000-6000' : calculation.total <= 10000 ? '6000-10000' : '10000+',
    }));
    setActiveTab('form');
  };

  const contactInfo = [
    {
      icon: Mail,
      label: text.email,
      value: "wwwcodefixit@gmail.com",
      href: "mailto:wwwcodefixit@gmail.com",
    },
    {
      icon: Phone,
      label: text.phone,
      value: "+48 883 667 943",
      href: "tel:+48883667943",
    },
    {
      icon: MapPin,
      label: text.location,
      value: language === 'pl' ? "Warszawa, Polska" : "Warsaw, Poland",
      href: null,
    },
    {
      icon: Github,
      label: text.github,
      value: "wwwCodeFixIT",
      href: "https://github.com/wwwCodeFixIT",
    },
  ];

  const categoryLabels: Record<string, string> = {
    design: text.calcCategoryDesign,
    features: text.calcCategoryFeatures,
    integrations: text.calcCategoryIntegrations,
  };

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-red-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-red-500 text-sm font-semibold tracking-widest uppercase mb-4">
            {text.badge}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {text.title} <span className="text-red-500">{text.titleHighlight}</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            {text.subtitle}
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-zinc-900/50 border border-zinc-800 rounded-2xl p-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'form'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText size={18} />
              {text.tabForm}
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'calculator'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calculator size={18} />
              {text.tabCalculator}
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                {/* Contact Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-6">{text.contactInfo}</h3>
                    <div className="space-y-4">
                      {contactInfo.map((item) => (
                        <motion.div
                          key={item.label}
                          whileHover={{ x: 5 }}
                          className="group"
                        >
                          {item.href ? (
                            <a
                              href={item.href}
                              target={item.href.startsWith('http') ? '_blank' : undefined}
                              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05] hover:border-red-600/30 transition-all duration-300"
                            >
                              <div className="w-12 h-12 rounded-lg bg-red-600/10 flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                                <item.icon className="w-5 h-5 text-red-500" />
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">{item.label}</div>
                                <div className="text-white font-medium group-hover:text-red-500 transition-colors">
                                  {item.value}
                                </div>
                              </div>
                            </a>
                          ) : (
                            <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                              <div className="w-12 h-12 rounded-lg bg-red-600/10 flex items-center justify-center">
                                <item.icon className="w-5 h-5 text-red-500" />
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">{item.label}</div>
                                <div className="text-white font-medium">{item.value}</div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-green-500" />
                      <h4 className="font-semibold text-green-400">{text.fastResponse}</h4>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {text.fastResponseDesc}
                    </p>
                  </div>

                  {/* Free Consultation */}
                  <div className="p-6 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-xl border border-red-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageSquare className="w-5 h-5 text-red-500" />
                      <h4 className="font-semibold text-red-400">{text.freeConsultation}</h4>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {text.freeConsultationDesc}
                    </p>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-3">
                  <div className="relative p-8 bg-gradient-to-b from-white/[0.05] to-transparent rounded-2xl border border-white/[0.05]">
                    {isSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                          className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
                        >
                          <CheckCircle className="w-10 h-10 text-green-500" />
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-2">{text.formSuccess}</h3>
                        <p className="text-gray-400">{text.formSuccessDesc}</p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                              {text.formName} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-white/[0.03] border ${
                                errors.name ? "border-red-500" : "border-white/[0.1]"
                              } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors`}
                              placeholder="Jan Kowalski"
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                              {text.formEmail} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-white/[0.03] border ${
                                errors.email ? "border-red-500" : "border-white/[0.1]"
                              } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors`}
                              placeholder="jan@firma.pl"
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                              {text.formPhone}
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                              placeholder="+48 123 456 789"
                            />
                          </div>

                          <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                              {text.formBudget}
                            </label>
                            <select
                              id="budget"
                              name="budget"
                              value={formData.budget}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors"
                            >
                              <option value="" className="bg-zinc-900">{text.formBudgetPlaceholder}</option>
                              <option value="1500-3000" className="bg-zinc-900">1 500 - 3 000 PLN</option>
                              <option value="3000-6000" className="bg-zinc-900">3 000 - 6 000 PLN</option>
                              <option value="6000-10000" className="bg-zinc-900">6 000 - 10 000 PLN</option>
                              <option value="10000+" className="bg-zinc-900">10 000+ PLN</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                            {text.formSubject}
                          </label>
                          <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                            placeholder={text.formSubjectPlaceholder}
                          />
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                            {text.formMessage} <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            rows={5}
                            value={formData.message}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-white/[0.03] border ${
                              errors.message ? "border-red-500" : "border-white/[0.1]"
                            } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none`}
                            placeholder={text.formMessagePlaceholder}
                          />
                          {errors.message && (
                            <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                          )}
                        </div>

                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/30"
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                              {text.formSubmitting}
                            </>
                          ) : (
                            <>
                              <Send size={20} />
                              {text.formSubmit}
                            </>
                          )}
                        </motion.button>

                        <p className="text-center text-gray-500 text-sm">
                          {text.formResponseTime}
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Selection */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Project Type */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">1</span>
                      {text.calcProjectType}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {projectTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedType.id === type.id
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800/50'
                          }`}
                        >
                          <span className="text-2xl">{type.icon}</span>
                          <h4 className="text-white font-medium mt-2 text-sm">{type.name[language]}</h4>
                          <p className="text-zinc-500 text-xs mt-1">
                            {language === 'pl' ? 'od' : 'from'} {type.basePrice.toLocaleString()} zł
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">2</span>
                      {text.calcFeatures}
                      <span className="ml-auto text-sm text-zinc-500">
                        {selectedFeatures.length} {text.calcFeaturesSelected}
                      </span>
                    </h3>
                    
                    <div className="space-y-6">
                      {Object.entries(groupedFeatures).map(([category, featureList]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-zinc-400 mb-3">{categoryLabels[category]}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {featureList.map(feature => (
                              <button
                                key={feature.id}
                                onClick={() => toggleFeature(feature.id)}
                                className={`p-3 rounded-lg border transition-all text-left flex items-center gap-2 ${
                                  selectedFeatures.includes(feature.id)
                                    ? 'border-red-500 bg-red-500/10'
                                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800/30'
                                }`}
                              >
                                <span className="text-lg">{feature.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-white text-xs font-medium truncate">{feature.name[language]}</h5>
                                  <p className="text-zinc-500 text-xs">+{feature.price.toLocaleString()} zł</p>
                                </div>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  selectedFeatures.includes(feature.id)
                                    ? 'border-red-500 bg-red-500'
                                    : 'border-zinc-600'
                                }`}>
                                  {selectedFeatures.includes(feature.id) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">3</span>
                      {text.calcUrgency}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {urgencyOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setUrgency(option)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            urgency.id === option.id
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800/50'
                          }`}
                        >
                          <span className="text-2xl">{option.icon}</span>
                          <h4 className="text-white font-medium mt-2 text-sm">{option.name[language]}</h4>
                          <p className="text-zinc-500 text-xs mt-1">{option.desc[language]}</p>
                          {option.multiplier > 1 && (
                            <p className="text-red-400 text-xs mt-1">
                              +{Math.round((option.multiplier - 1) * 100)}% {language === 'pl' ? 'ceny' : 'price'}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Summary */}
                <div className="lg:sticky lg:top-24 h-fit">
                  <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      📊 {text.calcSummary}
                    </h3>

                    {/* Selected Type */}
                    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg mb-4">
                      <span className="text-2xl">{selectedType.icon}</span>
                      <div>
                        <h4 className="text-white font-medium text-sm">{selectedType.name[language]}</h4>
                        <p className="text-zinc-500 text-xs">{selectedType.basePrice.toLocaleString()} zł</p>
                      </div>
                    </div>

                    {/* Selected Features */}
                    {selectedFeatures.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm text-zinc-400 mb-2">
                          {language === 'pl' ? 'Wybrane funkcje:' : 'Selected features:'}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedFeatures.map(id => {
                            const feature = features.find(f => f.id === id);
                            return feature ? (
                              <span key={id} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
                                {feature.icon} {feature.name[language]}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Calculation */}
                    <div className="border-t border-zinc-800 pt-4 mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">{text.calcBasePrice}:</span>
                        <span className="text-white">{calculation.basePrice.toLocaleString()} zł</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">{text.calcFeaturesPrice}:</span>
                        <span className="text-white">+{calculation.featuresPrice.toLocaleString()} zł</span>
                      </div>
                      {urgency.multiplier > 1 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">{text.calcPriority}:</span>
                          <span className="text-red-400">+{Math.round((urgency.multiplier - 1) * calculation.subtotal).toLocaleString()} zł</span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="border-t border-zinc-800 pt-4 mt-4">
                      <div className="flex justify-between items-end">
                        <span className="text-zinc-400">{text.calcEstimatedPrice}:</span>
                        <div className="text-right">
                          <span className="text-3xl font-bold text-white">{calculation.total.toLocaleString()}</span>
                          <span className="text-zinc-400 ml-1">zł</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-zinc-400 text-sm">{text.calcTime}:</span>
                        <span className="text-red-400 font-medium">~{calculation.time} {text.calcDays}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <motion.button
                      onClick={handleSendEstimate}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-6 py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                    >
                      {text.calcSendRequest}
                      <ChevronRight size={18} />
                    </motion.button>
                    
                    <p className="text-xs text-zinc-500 text-center mt-3">
                      {text.calcNote}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
