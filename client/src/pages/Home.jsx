export function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-cyan-50 to-slate-100 flex flex-col items-center px-4">
      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto mt-16 mb-12">
        <div className="bg-white rounded-3xl shadow-xl p-10 md:p-16 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-700 mb-4 text-center">
            Unified AI Healthcare Platform
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-6 text-center">
            Proactive health management powered by AI, wearables, and virtual assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex flex-col items-center">
              <span className="text-slate-800 font-medium mt-2">Vitals Monitoring</span>
              <span className="text-xs text-slate-500">Heart Rate, BP, Glucose, Sleep</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-800 font-medium mt-2">Predictive Analytics</span>
              <span className="text-xs text-slate-500">Smart Alerts & Risk Detection</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-800 font-medium mt-2">Virtual Assistant</span>
              <span className="text-xs text-slate-500">Diet, Coaching, Reminders</span>
            </div>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center text-cyan-700 font-semibold text-lg">
            Shifting healthcare from <b>reactive treatment</b> to <b>proactive prevention</b> using AI.
          </div>
        </div>
      </section>
      <section className="w-full max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-cyan-700 mb-4">Platform Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <li className="flex items-start gap-4">
              <div>
                <span className="font-semibold text-slate-800">Smart Alerts</span>
                <p className="text-sm text-slate-600">Instant notifications for health risks, medication, and lifestyle reminders.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div>
                <span className="font-semibold text-slate-800">Personalized Diet & Coaching</span>
                <p className="text-sm text-slate-600">AI-driven recommendations for nutrition, exercise, and daily habits.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div>
                <span className="font-semibold text-slate-800">Medication Reminders</span>
                <p className="text-sm text-slate-600">Timely alerts for prescriptions and adherence tracking.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-2xl">🩺</span>
              <div>
                <span className="font-semibold text-slate-800">Symptom Guidance</span>
                <p className="text-sm text-slate-600">Virtual assistant helps with symptom-based advice and triage.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-cyan-700 mb-4">Supported Use Cases</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-2">
            <li>Chronic disease management (diabetes, hypertension)</li>
            <li>Elderly care with fall detection</li>
            <li>Post-operative recovery monitoring</li>
            <li>Mental health tracking</li>
            <li>Pediatric health support</li>
          </ul>
        </div>
      </section>


      <section className="w-full max-w-4xl mx-auto mb-16">
        <div className="bg-cyan-700 rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <h3 className="text-2xl font-bold text-white mb-2">Ready to shift to proactive healthcare?</h3>
          <p className="text-white text-lg mb-4">Sign up or explore the dashboard to see your health insights.</p>
          <div className="flex gap-4">
            <a href="/signup" className="bg-white text-cyan-700 font-semibold px-6 py-2 rounded-xl shadow hover:bg-cyan-50 transition">Get Started</a>
            <a href="/dashboard" className="bg-cyan-50 text-cyan-700 font-semibold px-6 py-2 rounded-xl shadow hover:bg-white transition">View Dashboard</a>
          </div>
        </div>
      </section>
    </main>
  );
}