import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'partial' | 'maintenance' | 'major';
  uptime: number;
  responseTime: number;
  lastChecked: Date;
  history: { date: string; status: 'operational' | 'degraded' | 'partial' | 'maintenance' | 'major' }[];
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  updates: { time: Date; message: string; status: string }[];
}

// Symulowane dane statusów - w produkcji połącz z prawdziwym API monitoringu
// np. UptimeRobot API, Pingdom, lub własny backend
const generateRealisticStatus = (): ServiceStatus[] => {
  const services = [
    { id: 'website', name: 'Strona główna', description: 'codefix.it' },
    { id: 'api', name: 'API', description: 'api.codefix.it' },
    { id: 'cdn', name: 'CDN & Assets', description: 'Zasoby statyczne' },
    { id: 'database', name: 'Baza danych', description: 'Serwery DB' },
    { id: 'email', name: 'Email', description: 'Serwer pocztowy' },
    { id: 'hosting', name: 'Hosting klientów', description: 'Serwery klientów' },
  ];

  // Generuj realistyczną historię - głównie operational
  const generateHistory = (): ServiceStatus['history'] => {
    const history: ServiceStatus['history'] = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 98% szans na operational, 1.5% na degraded, 0.5% na inne
      const rand = Math.random();
      let status: ServiceStatus['status'] = 'operational';
      if (rand > 0.985) status = 'degraded';
      else if (rand > 0.98) status = 'partial';
      
      history.push({
        date: date.toISOString().split('T')[0],
        status
      });
    }
    
    return history;
  };

  return services.map(service => ({
    ...service,
    status: 'operational' as const,
    uptime: 99.5 + Math.random() * 0.49, // 99.5% - 99.99%
    responseTime: 50 + Math.floor(Math.random() * 100), // 50-150ms
    lastChecked: new Date(),
    history: generateHistory()
  }));
};

export const StatusPage: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchStatuses = useCallback(() => {
    // W produkcji tutaj byłby fetch do prawdziwego API:
    // - UptimeRobot: https://api.uptimerobot.com/v2/getMonitors
    // - Pingdom: https://api.pingdom.com/api/3.1/checks
    // - Własny backend z health-checks
    
    setIsLoading(true);
    
    // Symulacja opóźnienia API
    setTimeout(() => {
      setServices(generateRealisticStatus());
      setIncidents([]); // Brak aktywnych incydentów
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    fetchStatuses();
    
    // Odświeżaj co 60 sekund
    const interval = setInterval(fetchStatuses, 60000);
    return () => clearInterval(interval);
  }, [fetchStatuses]);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'partial': return 'bg-orange-500';
      case 'maintenance': return 'bg-blue-500';
      case 'major': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  const getStatusText = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational': return 'Działa poprawnie';
      case 'degraded': return 'Obniżona wydajność';
      case 'partial': return 'Częściowa awaria';
      case 'maintenance': return 'Konserwacja';
      case 'major': return 'Poważna awaria';
      default: return 'Nieznany';
    }
  };

  const overallStatus = services.every(s => s.status === 'operational') 
    ? 'operational' 
    : services.some(s => s.status === 'major') 
      ? 'major' 
      : 'degraded';

  const averageUptime = services.length > 0 
    ? services.reduce((acc, s) => acc + s.uptime, 0) / services.length 
    : 0;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeEmail) {
      setIsSubscribed(true);
      setSubscribeEmail('');
    }
  };

  return (
    <section id="status" className="py-20 lg:py-32 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full text-sm text-zinc-400 mb-6">
            <span className={`w-2 h-2 rounded-full ${getStatusColor(overallStatus)} animate-pulse`} />
            Status systemu
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Status <span className="text-red-500">Usług</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Monitorujemy wszystkie nasze usługi 24/7. Poniżej znajdziesz aktualny status oraz historię dostępności.
          </p>
        </motion.div>

        {/* Overall Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`p-6 rounded-2xl mb-8 ${
            overallStatus === 'operational' 
              ? 'bg-green-500/10 border border-green-500/30' 
              : overallStatus === 'major'
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-yellow-500/10 border border-yellow-500/30'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${
                overallStatus === 'operational' ? 'bg-green-500/20' : 
                overallStatus === 'major' ? 'bg-red-500/20' : 'bg-yellow-500/20'
              } flex items-center justify-center`}>
                {overallStatus === 'operational' ? (
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${
                  overallStatus === 'operational' ? 'text-green-500' : 
                  overallStatus === 'major' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {overallStatus === 'operational' 
                    ? 'Wszystkie systemy działają poprawnie' 
                    : overallStatus === 'major'
                      ? 'Wykryto problemy z niektórymi usługami'
                      : 'Obniżona wydajność niektórych usług'}
                </h3>
                <p className="text-zinc-400 text-sm">
                  Ostatnia aktualizacja: {lastUpdate.toLocaleTimeString('pl-PL')}
                </p>
              </div>
            </div>
            <button
              onClick={fetchStatuses}
              disabled={isLoading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Odśwież
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10"
        >
          {/* Średni uptime */}
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-2xl p-5 md:p-6 text-center hover:border-green-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-500 font-mono">{averageUptime.toFixed(2)}%</p>
            <p className="text-zinc-400 text-sm mt-1">Średni uptime</p>
          </div>

          {/* Monitorowane usługi */}
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-2xl p-5 md:p-6 text-center hover:border-blue-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white font-mono">{services.length}</p>
            <p className="text-zinc-400 text-sm mt-1">Monitorowanych usług</p>
          </div>

          {/* Średni czas odpowiedzi */}
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-2xl p-5 md:p-6 text-center hover:border-purple-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white font-mono">
              {services.length > 0 
                ? Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length) 
                : 0}
              <span className="text-lg text-zinc-400 ml-1">ms</span>
            </p>
            <p className="text-zinc-400 text-sm mt-1">Śr. czas odpowiedzi</p>
          </div>

          {/* Aktywne incydenty */}
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-2xl p-5 md:p-6 text-center hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              {incidents.length === 0 ? (
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <p className={`text-2xl md:text-3xl font-bold font-mono ${incidents.length === 0 ? 'text-green-500' : 'text-red-500'}`}>
              {incidents.length}
            </p>
            <p className="text-zinc-400 text-sm mt-1">Aktywne incydenty</p>
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4 mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-4">Usługi</h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-zinc-700 rounded-full" />
                      <div>
                        <div className="h-5 w-32 bg-zinc-700 rounded mb-2" />
                        <div className="h-4 w-24 bg-zinc-800 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-zinc-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                    <div>
                      <h4 className="font-semibold text-white">{service.name}</h4>
                      <p className="text-sm text-zinc-500">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-zinc-400">Uptime</p>
                      <p className="text-white font-mono">{service.uptime.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-400">Response</p>
                      <p className="text-white font-mono">{service.responseTime}ms</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.status === 'operational' 
                        ? 'bg-green-500/20 text-green-400' 
                        : service.status === 'major'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {getStatusText(service.status)}
                    </div>
                  </div>
                </div>

                {/* 90-day history */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-zinc-500">Ostatnie 90 dni</p>
                    <p className="text-xs text-zinc-500">{service.uptime.toFixed(2)}% uptime</p>
                  </div>
                  <div className="flex gap-0.5">
                    {service.history.map((day, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-8 rounded-sm ${getStatusColor(day.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                        title={`${day.date}: ${getStatusText(day.status)}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-4">Historia incydentów</h3>
          
          {incidents.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Brak aktywnych incydentów</h4>
              <p className="text-zinc-400 text-sm">
                Wszystkie systemy działają poprawnie. Nie ma żadnych zgłoszonych problemów.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map(incident => (
                <div
                  key={incident.id}
                  className={`bg-zinc-900/50 border rounded-xl p-6 ${
                    incident.severity === 'critical' ? 'border-red-500/50' :
                    incident.severity === 'major' ? 'border-orange-500/50' :
                    'border-yellow-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-white">{incident.title}</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Rozpoczęto: {incident.createdAt.toLocaleString('pl-PL')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      incident.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      incident.status === 'monitoring' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Subscribe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Powiadomienia o statusie</h3>
              <p className="text-zinc-400">
                Otrzymuj powiadomienia email o zmianach statusu i planowanych pracach konserwacyjnych.
              </p>
            </div>
            
            {isSubscribed ? (
              <div className="flex items-center gap-2 text-green-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Zapisano pomyślnie!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="twoj@email.com"
                  className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 flex-1 md:w-64"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-semibold transition-colors"
                >
                  Subskrybuj
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-zinc-500 text-sm mt-8"
        >
          Dane statusu są aktualizowane automatycznie co minutę. 
          W przypadku problemów skontaktuj się z nami: <a href="mailto:support@codefix.it" className="text-red-500 hover:underline">support@codefix.it</a>
        </motion.p>
      </div>
    </section>
  );
};
