export function Home() {
  const stats = [
    { label: 'Users', value: '1,234' },
    { label: 'Projects', value: '42' },
    { label: 'Tasks', value: '789' },
    { label: 'Completed', value: '95%' },
  ]

  const features = [
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Track your progress and metrics in real-time.',
    },
    {
      icon: '⚡',
      title: 'Performance',
      description: 'Lightning-fast performance for optimal productivity.',
    },
    {
      icon: '🔒',
      title: 'Security',
      description: 'Enterprise-grade security to protect your data.',
    },
    {
      icon: '🎨',
      title: 'Design',
      description: 'Beautiful and intuitive user interface.',
    },
  ]

  const recentActivity = [
    { action: 'Project created', time: '2 hours ago' },
    { action: 'Task completed', time: '4 hours ago' },
    { action: 'Team member joined', time: '1 day ago' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-2xl bg-linear-to-r from-[#BB243E] to-[#8B1A2E] p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-white/90">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[rgba(17,24,39,0.12)] bg-white p-6 hover:shadow-soft transition"
          >
            <p className="text-sm text-[#6B7280] mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-[#111827]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-2xl font-bold text-[#111827] mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-[rgba(17,24,39,0.12)] bg-white p-6 hover:shadow-soft transition"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#6B7280]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-[#111827] mb-4">Recent Activity</h2>
        <div className="rounded-xl border border-[rgba(17,24,39,0.12)] bg-white divide-y divide-[rgba(17,24,39,0.12)]">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 flex justify-between items-center hover:bg-[#FEFEFE] transition">
              <p className="text-[#111827]">{activity.action}</p>
              <p className="text-sm text-[#6B7280]">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-xl border border-[#BB243E]/20 bg-[#BB243E]/5 p-8 text-center">
        <h3 className="text-xl font-bold text-[#111827] mb-2">Ready to get started?</h3>
        <p className="text-[#6B7280] mb-4">Create your first project and start tracking today.</p>
        <button className="inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#BB243E]/30 disabled:opacity-50 disabled:pointer-events-none h-10 px-6 text-sm bg-[#BB243E] text-white hover:brightness-95">
          Create Project
        </button>
      </div>
    </div>
  )
}
