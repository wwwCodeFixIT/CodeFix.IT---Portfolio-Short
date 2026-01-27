import { motion } from 'framer-motion';
import { useGitHubStats } from '../hooks/useGitHubStats';
import { useSettings } from '../context/SettingsContext';

export function GitHubStats() {
  const { isConfigured } = useSettings();
  const {
    user,
    repos,
    contributions,
    languages,
    totalCommits,
    totalPRs,
    totalIssues,
    totalStars,
    currentStreak,
    longestStreak,
    isLoading,
    error,
    lastUpdated,
    refetch,
  } = useGitHubStats();

  const topRepos = repos
    .filter(r => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  const topLanguages = Object.entries(languages).slice(0, 6);

  const statCards = [
    { label: 'Commits', value: totalCommits, icon: '📝' },
    { label: 'Pull Requests', value: totalPRs, icon: '🔀' },
    { label: 'Issues', value: totalIssues, icon: '🐛' },
    { label: 'Gwiazdki', value: totalStars, icon: '⭐' },
    { label: 'Repozytoria', value: repos.filter(r => !r.fork).length, icon: '📦' },
    { label: 'Followers', value: user?.followers || 0, icon: '👥' },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  if (error && !user) {
    return (
      <section id="github" className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              GitHub <span className="text-red-500">Stats</span>
            </h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md mx-auto mt-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Spróbuj ponownie
              </button>
            </div>
            <p className="text-gray-500 mt-4 text-sm">
              Skonfiguruj nazwę użytkownika w <code className="text-red-400">src/config/settings.ts</code>
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="github" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Aktywny na GitHub
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            GitHub <span className="text-red-500">Activity</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Prawdziwe statystyki z mojego konta GitHub. Dane aktualizowane automatycznie.
          </p>

          {lastUpdated && (
            <p className="text-gray-600 text-sm mt-4">
              Ostatnia aktualizacja: {lastUpdated.toLocaleTimeString()}
              <button
                onClick={refetch}
                className="ml-2 text-red-500 hover:text-red-400 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? '⏳' : '🔄'} Odśwież
              </button>
            </p>
          )}
        </motion.div>

        {/* Loading state */}
        {isLoading && !user && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {user && (
          <>
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-6 mb-8 max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-6">
                <img
                  src={user.avatar_url}
                  alt={user.name || user.login}
                  className="w-20 h-20 rounded-full border-2 border-red-500"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{user.name || user.login}</h3>
                  <p className="text-gray-400">@{user.login}</p>
                  {user.bio && <p className="text-gray-500 text-sm mt-1">{user.bio}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {user.location && <span>📍 {user.location}</span>}
                    {user.company && <span>🏢 {user.company}</span>}
                  </div>
                </div>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                >
                  Zobacz profil →
                </a>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors"
                >
                  <span className="text-2xl mb-2 block">{stat.icon}</span>
                  <div className="text-2xl font-bold text-red-500">
                    {formatNumber(stat.value)}
                  </div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Streaks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 text-center border border-orange-500/20"
              >
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-3xl font-bold">{currentStreak} dni</div>
                <div className="text-gray-400">Aktualna seria</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 text-center border border-purple-500/20"
              >
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-3xl font-bold">{longestStreak} dni</div>
                <div className="text-gray-400">Najdłuższa seria</div>
              </motion.div>
            </div>

            {/* Contribution Graph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 rounded-2xl p-6 mb-12 overflow-hidden"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📊</span> Contribution Graph
                <span className="text-sm font-normal text-gray-500 ml-auto">
                  Ostatnie 365 dni
                </span>
              </h3>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-[3px] min-w-max">
                  {/* Podziel na tygodnie */}
                  {Array.from({ length: 52 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const contribIndex = weekIndex * 7 + dayIndex;
                        const contrib = contributions[contribIndex];
                        if (!contrib) return null;

                        const colors = [
                          'bg-white/5',
                          'bg-green-900/50',
                          'bg-green-700/70',
                          'bg-green-500',
                          'bg-green-400',
                        ];

                        return (
                          <motion.div
                            key={contribIndex}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: contribIndex * 0.001 }}
                            className={`w-3 h-3 rounded-sm ${colors[contrib.level]} cursor-pointer hover:ring-2 hover:ring-white/30 transition-all`}
                            title={`${contrib.date}: ${contrib.count} contributions`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 text-sm text-gray-500">
                <span>Mniej</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-white/5 rounded-sm" />
                  <div className="w-3 h-3 bg-green-900/50 rounded-sm" />
                  <div className="w-3 h-3 bg-green-700/70 rounded-sm" />
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <div className="w-3 h-3 bg-green-400 rounded-sm" />
                </div>
                <span>Więcej</span>
              </div>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 rounded-2xl p-6 mb-12"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>💻</span> Top Languages
              </h3>
              <div className="space-y-4">
                {topLanguages.map(([lang, data], index) => (
                  <motion.div
                    key={lang}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="font-medium">{lang}</span>
                      </div>
                      <span className="text-gray-500">{data.percentage}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${data.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Top Repos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>📌</span> Pinned Repositories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topRepos.map((repo, index) => (
                  <motion.a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="block bg-white/5 rounded-xl p-5 border border-white/10 hover:border-red-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold group-hover:text-red-500 transition-colors truncate pr-2">
                        {repo.name}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full whitespace-nowrap">
                        {repo.language || 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {repo.description || 'Brak opisu'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        ⭐ {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        🍴 {repo.forks_count}
                      </span>
                      {repo.open_issues_count > 0 && (
                        <span className="flex items-center gap-1">
                          🐛 {repo.open_issues_count}
                        </span>
                      )}
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Config hint */}
        {!isConfigured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
          >
            <p className="text-yellow-400">
              ⚠️ Skonfiguruj swoją nazwę użytkownika GitHub w pliku:
            </p>
            <code className="text-sm text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded mt-2 inline-block">
              src/config/settings.ts
            </code>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default GitHubStats;
