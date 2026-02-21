import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/layout/LandingNav";
import { Activity, Brain, Bell, Salad, Watch, Shield, Heart, Users, Stethoscope } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";
import { motion } from "framer-motion";

const features = [
  { icon: Watch, title: "Wearable Integration", description: "Seamlessly sync data from your smartwatch and fitness trackers for real-time health monitoring." },
  { icon: Brain, title: "Predictive Risk Modeling", description: "AI-powered analysis identifies potential health risks before they become serious issues." },
  { icon: Activity, title: "Virtual Health Assistant", description: "24/7 AI companion for symptom triage, health questions, and personalized guidance." },
  { icon: Bell, title: "Smart Alerts", description: "Intelligent notifications for anomalies in your vitals and medication reminders." },
  { icon: Salad, title: "Diet & Lifestyle Coaching", description: "Personalized meal plans and activity recommendations tailored to your health goals." },
  { icon: Shield, title: "Data Privacy", description: "Enterprise-grade encryption ensures your health data stays private and secure." },
];

const useCases = [
  { icon: Heart, title: "Chronic Disease Management", description: "Monitor and manage conditions like diabetes and hypertension with AI-driven insights." },
  { icon: Users, title: "Elderly Care", description: "Remote monitoring for aging family members with automatic alerts to caregivers." },
  { icon: Stethoscope, title: "Clinical Decision Support", description: "Help doctors make faster, data-driven decisions with comprehensive patient dashboards." },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Activity className="h-4 w-4" /> AI-Powered Health Platform
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                Your <span className="gradient-text">Preventive Health</span> Companion
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mb-8">
                Harness the power of AI to predict health risks, monitor vitals in real-time, and receive personalized wellness guidance — all in one platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="gradient-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline">View Demo</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img src={heroImage} alt="AI Health Platform Illustration" className="w-full rounded-2xl shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to take control of your health, powered by cutting-edge AI technology.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-6 rounded-xl border border-border bg-background hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Use Cases</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Designed for patients, families, and healthcare providers alike.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center p-8 rounded-2xl bg-card border border-border"
              >
                <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                  <uc.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{uc.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{uc.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="gradient-primary rounded-3xl p-8 md:p-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Health?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Join thousands of users who are already using AI to stay ahead of health risks.
            </p>
            <Link to="/register">
              <Button size="lg" variant="hero-outline">Get Started Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold">
            <Activity className="h-5 w-5 text-primary" /> HealthAI
          </div>
          <p className="text-sm text-muted-foreground">© 2024 HealthAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
