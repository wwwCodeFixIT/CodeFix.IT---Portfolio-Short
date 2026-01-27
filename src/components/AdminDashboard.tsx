import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  replied: boolean;
  starred: boolean;
}

interface DashboardStats {
  totalVisits: number;
  todayVisits: number;
  totalMessages: number;
  unreadMessages: number;
  avgSessionTime: string;
  bounceRate: number;
  topPages: { page: string; visits: number }[];
  visitsChart: { date: string; visits: number }[];
  deviceStats: { device: string; percentage: number }[];
}

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'portfolio' | 'analytics'>('overview');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = localStorage.getItem('codefix-messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Demo messages
      const demoMessages: Message[] = [
        {
          id: '1',
          name: 'Jan Kowalski',
          email: 'jan@example.com',
          phone: '+48 123 456 789',
          subject: 'Zapytanie o stronę firmową',
          message: 'Dzień dobry, chciałbym zlecić wykonanie strony internetowej dla mojej firmy. Proszę o kontakt w celu omówienia szczegółów.',
          date: new Date().toISOString(),
          read: false,
          replied: false,
          starred: false,
        },
        {
          id: '2',
          name: 'Anna Nowak',
          email: 'anna@example.com',
          subject: 'Redesign sklepu',
          message: 'Witam, posiadam sklep internetowy, który wymaga odświeżenia. Czy moglibyśmy porozmawiać o możliwościach współpracy?',
          date: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          replied: false,
          starred: true,
        },
      ];
      setMessages(demoMessages);
      localStorage.setItem('codefix-messages', JSON.stringify(demoMessages));
    }

    // Generate stats
    const analyticsData = localStorage.getItem('codefix-analytics');
    const visits = analyticsData ? JSON.parse(analyticsData) : [];
    
    const today = new Date().toDateString();
    const todayVisits = visits.filter((v: any) => new Date(v.timestamp).toDateString() === today).length;

    setStats({
      totalVisits: Math.max(visits.length, 127),
      todayVisits: Math.max(todayVisits, 12),
      totalMessages: messages.length || 2,
      unreadMessages: messages.filter(m => !m.read).length || 1,
      avgSessionTime: '2:34',
      bounceRate: 32,
      topPages: [
        { page: 'Strona główna', visits: 89 },
        { page: 'Portfolio', visits: 45 },
        { page: 'Usługi', visits: 38 },
        { page: 'Kontakt', visits: 27 },
        { page: 'Kalkulator', visits: 19 },
      ],
      visitsChart: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('pl-PL', { weekday: 'short' }),
        visits: Math.floor(Math.random() * 30) + 10,
      })),
      deviceStats: [
        { device: 'Desktop', percentage: 58 },
        { device: 'Mobile', percentage: 35 },
        { device: 'Tablet', percentage: 7 },
      ],
    });
  }, [messages.length]);

  const markAsRead = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem('codefix-messages', JSON.stringify(updated));
  };

  const toggleStar = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, starred: !m.starred } : m);
    setMessages(updated);
    localStorage.setItem('codefix-messages', JSON.stringify(updated));
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem('codefix-messages', JSON.stringify(updated));
    setSelectedMessage(null);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Przegląd', icon: '📊' },
    { id: 'messages' as const, label: 'Wiadomości', icon: '📧', badge: messages.filter(m => !m.read).length },
    { id: 'portfolio' as const, label: 'Portfolio', icon: '💼' },
    { id: 'analytics' as const, label: 'Analityka', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">
                <span className="text-red-500">Admin</span> Dashboard
              </h1>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                ● Online
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="Odśwież">
                🔄
              </button>
              <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="Ustawienia">
                ⚙️
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-500/20 text-red-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Wszystkie wizyty', value: stats.totalVisits, icon: '👁️', color: 'blue' },
                  { label: 'Wizyty dziś', value: stats.todayVisits, icon: '📅', color: 'green' },
                  { label: 'Wiadomości', value: stats.totalMessages, icon: '📧', color: 'purple' },
                  { label: 'Nieprzeczytane', value: stats.unreadMessages, icon: '🔔', color: 'red' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stat.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                        stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Visits Chart */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Wizyty (7 dni)</h3>
                  <div className="flex items-end gap-2 h-40">
                    {stats.visitsChart.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.visits / 40) * 100}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg min-h-[20px]"
                        />
                        <span className="text-xs text-zinc-500">{day.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Stats */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Urządzenia</h3>
                  <div className="space-y-4">
                    {stats.deviceStats.map((device, i) => (
                      <div key={device.device}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{device.device}</span>
                          <span className="text-zinc-400">{device.percentage}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${device.percentage}%` }}
                            transition={{ delay: i * 0.2, duration: 0.5 }}
                            className={`h-full rounded-full ${
                              i === 0 ? 'bg-red-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Najpopularniejsze strony</h3>
                <div className="space-y-3">
                  {stats.topPages.map((page, i) => (
                    <div key={page.page} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                        {i + 1}
                      </span>
                      <span className="flex-1">{page.page}</span>
                      <span className="text-zinc-400">{page.visits} wizyt</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Messages List */}
              <div className="lg:col-span-1 bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                  <h3 className="font-semibold">Wiadomości ({messages.length})</h3>
                </div>
                <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                      <span className="text-4xl block mb-2">📭</span>
                      Brak wiadomości
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          markAsRead(msg.id);
                        }}
                        className={`w-full p-4 text-left hover:bg-zinc-800/50 transition-colors ${
                          selectedMessage?.id === msg.id ? 'bg-zinc-800/50' : ''
                        } ${!msg.read ? 'bg-red-500/5' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {!msg.read && (
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                          <span className="font-medium text-white">{msg.name}</span>
                          {msg.starred && <span className="text-yellow-500">⭐</span>}
                        </div>
                        <p className="text-sm text-zinc-400 truncate">{msg.subject}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {new Date(msg.date).toLocaleDateString('pl-PL')}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Message Detail */}
              <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
                {selectedMessage ? (
                  <>
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{selectedMessage.subject}</h3>
                        <p className="text-sm text-zinc-400">
                          Od: {selectedMessage.name} ({selectedMessage.email})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStar(selectedMessage.id)}
                          className="p-2 hover:bg-zinc-800 rounded-lg"
                          title="Oznacz gwiazdką"
                        >
                          {selectedMessage.starred ? '⭐' : '☆'}
                        </button>
                        <button
                          onClick={() => deleteMessage(selectedMessage.id)}
                          className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg"
                          title="Usuń"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-4 mb-6 text-sm">
                        <span className="text-zinc-400">
                          📧 {selectedMessage.email}
                        </span>
                        {selectedMessage.phone && (
                          <span className="text-zinc-400">
                            📱 {selectedMessage.phone}
                          </span>
                        )}
                        <span className="text-zinc-400">
                          📅 {new Date(selectedMessage.date).toLocaleString('pl-PL')}
                        </span>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-zinc-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                      <div className="mt-8 flex gap-3">
                        <a
                          href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all inline-flex items-center gap-2"
                        >
                          <span>📧</span> Odpowiedz
                        </a>
                        {selectedMessage.phone && (
                          <a
                            href={`tel:${selectedMessage.phone}`}
                            className="px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors inline-flex items-center gap-2"
                          >
                            <span>📱</span> Zadzwoń
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 p-8">
                    <div className="text-center">
                      <span className="text-6xl block mb-4">📬</span>
                      <p>Wybierz wiadomość z listy</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Zarządzanie projektami</h3>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2">
                  <span>+</span> Dodaj projekt
                </button>
              </div>
              
              <div className="text-center py-12 text-zinc-500">
                <span className="text-6xl block mb-4">🚧</span>
                <p className="text-lg mb-2">Edytor portfolio w przygotowaniu</p>
                <p className="text-sm">
                  Aktualnie projekty można edytować w pliku <code className="bg-zinc-800 px-2 py-1 rounded">src/data/portfolio.ts</code>
                </p>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && stats && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h4 className="text-zinc-400 text-sm mb-2">Śr. czas sesji</h4>
                  <p className="text-3xl font-bold">{stats.avgSessionTime}</p>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h4 className="text-zinc-400 text-sm mb-2">Bounce rate</h4>
                  <p className="text-3xl font-bold">{stats.bounceRate}%</p>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h4 className="text-zinc-400 text-sm mb-2">Strony / sesja</h4>
                  <p className="text-3xl font-bold">3.2</p>
                </div>
              </div>
              
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Źródła ruchu</h3>
                <div className="space-y-3">
                  {[
                    { source: 'Google (organic)', visits: 45, color: 'bg-blue-500' },
                    { source: 'Bezpośrednie', visits: 32, color: 'bg-green-500' },
                    { source: 'Social Media', visits: 18, color: 'bg-purple-500' },
                    { source: 'Referral', visits: 5, color: 'bg-orange-500' },
                  ].map((source) => (
                    <div key={source.source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{source.source}</span>
                        <span className="text-zinc-400">{source.visits}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${source.color}`}
                          style={{ width: `${source.visits}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
