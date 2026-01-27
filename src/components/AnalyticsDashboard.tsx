import { motion } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';

export function AnalyticsDashboard() {
  const { stats, refreshStats } = useAnalytics();

  const mainStats = [
    { label: 'Odwiedzający', value: stats.totalVisitors, icon: '👥', change: '+12%' },
    { label: 'Odsłony', value: stats.totalPageViews, icon: '👁️', change: '+8%' },
    { label: 'Dziś', value: stats.uniqueVisitorsToday, icon: '📅', change: '+5%' },
    { label: 'Bounce Rate', value: `${stats.bounceRate}%`, icon: '📊', change: '-3%' },
  ];

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const deviceIcons: Record<string, string> = {
    desktop: '🖥️',
    tablet: '📱',
    mobile: '📲',
  };

  return (
    <section id="analytics" className="py-20 lg:py-32 relative overflow-hidden bg-neutral-950">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400 mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Real-time Analytics
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Analytics <span className="text-red-500">Dashboard</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Statystyki odwiedzin strony w czasie rzeczywistym. Dane zbierane lokalnie.
          </p>
        </motion.div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mainStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Visitors Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Odwiedziny (ostatnie 7 dni)</h3>
              <button
                onClick={refreshStats}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                🔄
              </button>
            </div>
            
            <div className="h-48 flex items-end gap-2">
              {stats.visitorsByDay.map((day, index) => {
                const maxVisitors = Math.max(...stats.visitorsByDay.map(d => d.visitors), 1);
                const height = (day.visitors / maxVisitors) * 100;
                const pageViewHeight = (day.pageViews / Math.max(...stats.visitorsByDay.map(d => d.pageViews), 1)) * 100;
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center gap-1 h-40">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="w-1/3 bg-red-500 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group"
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {day.visitors} odwiedzających
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${pageViewHeight}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.05 }}
                        className="w-1/3 bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group"
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {day.pageViews} odsłon
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-gray-400">Odwiedzający</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-gray-400">Odsłony</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Session Duration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold mb-4">Średni czas sesji</h3>
              <div className="text-4xl font-bold text-red-500 mb-2">
                {formatDuration(stats.averageSessionDuration)}
              </div>
              <div className="text-gray-500 text-sm">na wizytę</div>
            </motion.div>

            {/* Devices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold mb-4">Urządzenia</h3>
              <div className="space-y-3">
                {stats.deviceBreakdown.length > 0 ? (
                  stats.deviceBreakdown.map((device) => (
                    <div key={device.device}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2">
                          <span>{deviceIcons[device.device] || '💻'}</span>
                          <span className="capitalize">{device.device}</span>
                        </span>
                        <span className="text-gray-500">{device.percentage}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${device.percentage}%` }}
                          viewport={{ once: true }}
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    Brak danych
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Top Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-bold mb-4">🔥 Najpopularniejsze strony</h3>
            {stats.topPages.length > 0 ? (
              <div className="space-y-3">
                {stats.topPages.map((page, index) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono text-sm">
                        #{index + 1}
                      </span>
                      <span className="truncate max-w-[200px]">{page.path || '/'}</span>
                    </div>
                    <span className="text-red-500 font-semibold">{page.views}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Zbieranie danych...
              </div>
            )}
          </motion.div>

          {/* Top Referrers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-bold mb-4">🔗 Źródła ruchu</h3>
            {stats.topReferrers.length > 0 ? (
              <div className="space-y-3">
                {stats.topReferrers.map((referrer, index) => (
                  <div
                    key={referrer.source}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono text-sm">
                        #{index + 1}
                      </span>
                      <span>{referrer.source}</span>
                    </div>
                    <span className="text-blue-500 font-semibold">{referrer.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Brak danych o źródłach ruchu
              </div>
            )}
          </motion.div>
        </div>

        {/* Real-time indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Dane aktualizowane na żywo
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AnalyticsDashboard;
