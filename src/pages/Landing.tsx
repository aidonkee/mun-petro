import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Globe, Mic, FileText, ScrollText, Vote, BookOpen,
  ClipboardCheck, Users, Sparkles, ArrowRight, GraduationCap,
  Shield, BarChart3, Rocket, CheckCircle2, ChevronRight
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Opening Speeches",
    description: "Delegates craft and deliver opening speeches representing their assigned country's position. Voice recording and timed practice tools included.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "Position Papers",
    description: "Write structured position papers with background research, country stance, proposed solutions, and cited sources — all in a guided editor.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: ScrollText,
    title: "Resolution Builder",
    description: "Collaboratively draft UN-style resolutions with preambulatory and operative clauses. Add sponsors, co-sponsors, and signatories.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Vote,
    title: "Voting & Amendments",
    description: "Propose friendly and unfriendly amendments, vote on resolutions, and track all voting records transparently.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: BookOpen,
    title: "Rules Quiz",
    description: "Interactive quizzes on MUN rules of procedure — motions, points, and parliamentary protocol. Timed with instant feedback.",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    icon: ClipboardCheck,
    title: "Self-Reflection",
    description: "After the conference, delegates reflect on their contributions, procedure effectiveness, and areas for improvement.",
    gradient: "from-indigo-500 to-violet-600",
  },
];

const adminFeatures = [
  {
    icon: Users,
    title: "Student Management",
    description: "Bulk-create delegate accounts, assign countries and committees, and manage the entire class roster.",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    icon: BarChart3,
    title: "Assessment Dashboard",
    description: "View all delegate submissions, track completion status, and grade speeches, papers, and resolutions with rubric-based scoring.",
    gradient: "from-cyan-500 to-teal-600",
  },
  {
    icon: Sparkles,
    title: "AI-Powered GPPR Grading",
    description: "Upload assessment criteria and up to 20 student works at once. AI analyzes each work against your criteria and provides detailed feedback.",
    gradient: "from-pink-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Quiz Configuration",
    description: "Create custom quizzes with multiple-choice questions, set time limits, passing scores, and control retake policies.",
    gradient: "from-amber-500 to-red-500",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
              MUN Platform
            </span>
          </div>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/25">
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-violet-400/30 to-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-[-10%] w-[400px] h-[400px] bg-gradient-to-br from-pink-400/25 to-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-gradient-to-br from-cyan-400/20 to-teal-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-cyan-100 text-violet-700 text-sm font-medium mb-8">
            <GraduationCap className="w-4 h-4" />
            Educational Simulation Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-violet-600 via-cyan-600 to-pink-600 bg-clip-text text-transparent">
              Model United Nations
            </span>
          </h1>

          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              <strong>MUN</strong> stands for <strong>Model United Nations</strong> — an academic simulation where students role-play as delegates of UN member states, debating real-world issues, drafting resolutions, and practicing diplomacy.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["Diplomacy", "Public Speaking", "Critical Thinking", "Collaboration", "Research"].map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-200 text-sm font-medium text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-lg px-8 py-6 shadow-xl shadow-violet-500/25 hover:opacity-90 hover:shadow-2xl transition-all">
                Get Started <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-violet-200 hover:bg-violet-50">
                Explore Features <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* What is MUN? */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 via-cyan-50/30 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Simulate", desc: "Take on the role of a UN delegate representing a real country in committee sessions.", icon: Globe, gradient: "from-violet-500 to-purple-600" },
              { title: "Debate", desc: "Discuss pressing global issues — from climate change to human rights — following parliamentary procedure.", icon: Mic, gradient: "from-cyan-500 to-blue-600" },
              { title: "Resolve", desc: "Draft and vote on resolutions that propose real solutions to international challenges.", icon: ScrollText, gradient: "from-pink-500 to-rose-600" },
            ].map((item) => (
              <div key={item.title} className="group relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-border/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delegate Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 text-sm font-medium mb-4">
              <Users className="w-4 h-4" /> For Delegates
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">
                Everything a Delegate Needs
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From writing speeches to voting on resolutions — a complete toolkit for every step of the MUN experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-border/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin / Teacher Features */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-pink-50/30 to-amber-50/40 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-violet-100 text-pink-700 text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" /> For Teachers
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                Powerful Admin Tools
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage students, grade submissions, configure quizzes, and leverage AI to speed up assessment workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {adminFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-border/50 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feature.gradient}`} />
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-500 to-pink-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { step: "1", title: "Teacher Creates the Conference", desc: "Set up committees, assign countries, and invite students with auto-generated accounts.", gradient: "from-violet-500 to-purple-600" },
              { step: "2", title: "Delegates Prepare", desc: "Research your country, write a position paper, and practice your opening speech with the built-in tools.", gradient: "from-cyan-500 to-blue-600" },
              { step: "3", title: "Simulate the Conference", desc: "Deliver speeches, propose motions, draft resolutions, debate amendments, and cast votes.", gradient: "from-pink-500 to-rose-600" },
              { step: "4", title: "Assess & Reflect", desc: "Teachers grade with AI assistance. Delegates complete self-reflections. Everyone grows.", gradient: "from-amber-500 to-orange-600" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-cyan-600 to-pink-600" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Ready to Start Your MUN Journey?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join the platform trusted by teachers and students for an immersive Model United Nations experience.
              </p>
              <Link to="/login">
                <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 text-lg px-10 py-6 shadow-2xl font-bold">
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
              MUN Platform
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MUN Platform. Built for educators and students.
          </p>
        </div>
      </footer>
    </div>
  );
}
