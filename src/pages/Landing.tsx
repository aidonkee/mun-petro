import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PiMicrophoneStageFill,
  PiScrollFill,
  PiGavelFill,
  PiChalkboardTeacherFill,
  PiStudentFill,
  PiGlobeFill,
  PiHandshakeFill,
  PiLightningFill,
  PiBrainFill,
  PiNotePencilFill,
  PiClipboardTextFill,
  PiUsersThreeFill,
  PiChartBarFill,
  PiMagicWandFill,
  PiSlidersHorizontalFill,
  PiArrowRightBold,
  PiFlagBannerFill,
  PiChatCircleTextFill,
  PiStarFourFill,
  PiBookOpenTextFill,
} from "react-icons/pi";
import { useState, useEffect } from "react";

const ROTATING_WORDS = ["Diplomacy", "Debate", "Solutions", "Leadership"];

function RotatingText() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-all duration-300 ${
        fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {ROTATING_WORDS[index]}
    </span>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden selection:bg-fuchsia-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5">
        <div className="absolute inset-0 bg-[#0a0a1a]/80 backdrop-blur-2xl" />
        <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PiGlobeFill className="w-7 h-7 text-fuchsia-400" />
            <span className="text-lg font-black tracking-tight">
              MUN<span className="text-fuchsia-400">.</span>platform
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#what" className="hover:text-white transition-colors">What is MUN</a>
            <a href="#delegates" className="hover:text-white transition-colors">For Delegates</a>
            <a href="#teachers" className="hover:text-white transition-colors">For Teachers</a>
            <a href="#how" className="hover:text-white transition-colors">How it Works</a>
          </div>
          <Link to="/login">
            <Button className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white text-sm font-bold px-5 rounded-full">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-fuchsia-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] bg-amber-500/8 rounded-full blur-[80px]" />
        </div>
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-medium tracking-wide uppercase mb-8">
              <PiStarFourFill className="w-3 h-3" />
              Educational Simulation
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tight mb-8">
              Model
              <br />
              United
              <br />
              <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Nations
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-xl leading-relaxed mb-4">
              An academic simulation where students become diplomats — representing real countries, debating global issues, and crafting resolutions in the style of the United Nations.
            </p>

            <p className="text-2xl md:text-3xl font-bold text-white/80 mb-10">
              Where students practice{" "}
              <span className="text-fuchsia-400">
                <RotatingText />
              </span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/login">
                <Button className="bg-white text-[#0a0a1a] hover:bg-white/90 text-base font-bold px-8 py-6 rounded-full">
                  Start Now <PiArrowRightBold className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#what">
                <Button variant="outline" className="border-white/20 text-white/70 hover:text-white hover:bg-white/5 text-base px-8 py-6 rounded-full">
                  Learn More
                </Button>
              </a>
            </div>
          </div>

          {/* Side floating stats */}
          <div className="hidden lg:flex flex-col gap-4 absolute right-6 top-1/2 -translate-y-1/2">
            {[
              { label: "Skills", items: ["Public Speaking", "Research", "Negotiation"] },
            ].map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <div
                    key={item}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-white/60"
                  >
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is MUN */}
      <section id="what" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
            <div>
              <span className="text-fuchsia-400 text-sm font-bold tracking-widest uppercase mb-4 block">
                // What is MUN
              </span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                Diplomacy as a
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                  classroom experience
                </span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed">
                Model United Nations transforms learning into action. Students research real global issues, represent actual countries, and work through the same procedures used at the real UN — motions, caucuses, resolutions, and votes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: PiGlobeFill, title: "Simulate", desc: "Represent a real UN member state in committee sessions", color: "fuchsia" },
                { icon: PiChatCircleTextFill, title: "Debate", desc: "Discuss climate, security, human rights using parliamentary rules", color: "cyan" },
                { icon: PiScrollFill, title: "Draft", desc: "Write resolutions proposing solutions to global challenges", color: "amber" },
                { icon: PiHandshakeFill, title: "Negotiate", desc: "Build coalitions, amend clauses, and reach consensus", color: "emerald" },
              ].map((item) => {
                const colorMap: Record<string, string> = {
                  fuchsia: "border-fuchsia-500/20 bg-fuchsia-500/5 hover:bg-fuchsia-500/10",
                  cyan: "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10",
                  amber: "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10",
                  emerald: "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
                };
                const iconColorMap: Record<string, string> = {
                  fuchsia: "text-fuchsia-400",
                  cyan: "text-cyan-400",
                  amber: "text-amber-400",
                  emerald: "text-emerald-400",
                };
                return (
                  <div
                    key={item.title}
                    className={`p-6 rounded-2xl border transition-colors duration-300 ${colorMap[item.color]}`}
                  >
                    <item.icon className={`w-8 h-8 mb-4 ${iconColorMap[item.color]}`} />
                    <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Delegate Features — staggered layout */}
      <section id="delegates" className="py-32 px-6 relative">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-cyan-600/8 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto">
          <span className="text-cyan-400 text-sm font-bold tracking-widest uppercase mb-4 block">
            // For Delegates
          </span>
          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-4 max-w-2xl">
            Your complete
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
              MUN toolkit
            </span>
          </h2>
          <p className="text-white/40 text-lg mb-16 max-w-xl">
            Every tool you need from preparation to the final vote — all in one place.
          </p>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {[
              { icon: PiMicrophoneStageFill, title: "Opening Speeches", desc: "Craft and deliver your country's opening statement. Practice with voice recording and a built-in timer.", accent: "fuchsia" },
              { icon: PiNotePencilFill, title: "Position Papers", desc: "Structured editor for background, country position, alternative viewpoints, proposed solutions, and sources.", accent: "cyan" },
              { icon: PiScrollFill, title: "Resolution Drafting", desc: "Build UN-format resolutions with preambulatory and operative clauses. Add sponsors and signatories.", accent: "amber" },
              { icon: PiGavelFill, title: "Voting & Amendments", desc: "Propose friendly or unfriendly amendments, vote for/against/abstain, and track all records.", accent: "emerald" },
              { icon: PiBookOpenTextFill, title: "Rules Quiz", desc: "Timed interactive quizzes on MUN procedure — motions, points of order, right of reply, and more.", accent: "fuchsia" },
              { icon: PiClipboardTextFill, title: "Self-Reflection", desc: "Post-conference reflection on contributions, procedure effectiveness, and growth areas.", accent: "cyan" },
            ].map((feature, i) => {
              const accentMap: Record<string, { border: string; icon: string; dot: string }> = {
                fuchsia: { border: "border-fuchsia-500/15", icon: "text-fuchsia-400", dot: "bg-fuchsia-400" },
                cyan: { border: "border-cyan-500/15", icon: "text-cyan-400", dot: "bg-cyan-400" },
                amber: { border: "border-amber-500/15", icon: "text-amber-400", dot: "bg-amber-400" },
                emerald: { border: "border-emerald-500/15", icon: "text-emerald-400", dot: "bg-emerald-400" },
              };
              const a = accentMap[feature.accent];
              return (
                <div
                  key={feature.title}
                  className={`group flex gap-5 p-6 rounded-2xl border ${a.border} bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 ${i % 2 === 1 ? "md:translate-y-8" : ""}`}
                >
                  <div className="shrink-0 mt-1">
                    <feature.icon className={`w-7 h-7 ${a.icon}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                      {feature.title}
                      <span className={`w-1.5 h-1.5 rounded-full ${a.dot} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teacher / Admin Features */}
      <section id="teachers" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] bg-amber-500/8 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3 lg:sticky lg:top-32 lg:self-start">
              <span className="text-amber-400 text-sm font-bold tracking-widest uppercase mb-4 block">
                // For Teachers
              </span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                Admin tools that
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-fuchsia-400">
                  actually help
                </span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed">
                Manage your entire MUN conference and GPPR assessments from one dashboard.
              </p>
            </div>

            <div className="lg:w-2/3 space-y-5">
              {[
                { icon: PiUsersThreeFill, title: "Student Management", desc: "Bulk-create delegate accounts with auto-generated credentials. Assign countries, committees, and manage the full class roster from a single view.", accent: "fuchsia" },
                { icon: PiChartBarFill, title: "Assessment Dashboard", desc: "Track every delegate's progress across speeches, position papers, resolutions, quizzes, and self-reflections. Rubric-based grading with detailed feedback.", accent: "cyan" },
                { icon: PiMagicWandFill, title: "AI-Powered GPPR Grading", desc: "Upload your assessment criteria first — the AI learns your rubric. Then upload up to 20 student works at once. Get criterion-by-criterion scores and written feedback for each student.", accent: "amber" },
                { icon: PiSlidersHorizontalFill, title: "Quiz Builder", desc: "Create custom multiple-choice quizzes. Set time limits, passing thresholds, and retake policies. Questions auto-shuffle for each attempt.", accent: "emerald" },
              ].map((feature) => {
                const accentMap: Record<string, { border: string; icon: string; bg: string }> = {
                  fuchsia: { border: "border-fuchsia-500/20", icon: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
                  cyan: { border: "border-cyan-500/20", icon: "text-cyan-400", bg: "bg-cyan-500/10" },
                  amber: { border: "border-amber-500/20", icon: "text-amber-400", bg: "bg-amber-500/10" },
                  emerald: { border: "border-emerald-500/20", icon: "text-emerald-400", bg: "bg-emerald-500/10" },
                };
                const a = accentMap[feature.accent];
                return (
                  <div
                    key={feature.title}
                    className={`p-8 rounded-2xl border ${a.border} bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
                        <feature.icon className={`w-6 h-6 ${a.icon}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-white/40 leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works — horizontal timeline */}
      <section id="how" className="py-32 px-6 relative">
        <div className="relative max-w-7xl mx-auto">
          <span className="text-emerald-400 text-sm font-bold tracking-widest uppercase mb-4 block">
            // How it works
          </span>
          <h2 className="text-4xl md:text-6xl font-black mb-20">
            Four steps to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              conference day
            </span>
          </h2>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-fuchsia-500/40 via-cyan-500/40 to-emerald-500/40" />

            {[
              { num: "01", title: "Setup", desc: "Teacher creates the conference, assigns countries and committees, generates student accounts.", color: "fuchsia" },
              { num: "02", title: "Prepare", desc: "Delegates research their country, write position papers, and rehearse opening speeches.", color: "cyan" },
              { num: "03", title: "Simulate", desc: "Deliver speeches, raise motions, caucus, draft resolutions, propose amendments, and vote.", color: "amber" },
              { num: "04", title: "Assess", desc: "Teachers grade with AI assistance. Delegates complete self-reflections. Everyone grows.", color: "emerald" },
            ].map((step) => {
              const colorMap: Record<string, { num: string; dot: string }> = {
                fuchsia: { num: "text-fuchsia-400", dot: "bg-fuchsia-400 shadow-fuchsia-400/50" },
                cyan: { num: "text-cyan-400", dot: "bg-cyan-400 shadow-cyan-400/50" },
                amber: { num: "text-amber-400", dot: "bg-amber-400 shadow-amber-400/50" },
                emerald: { num: "text-emerald-400", dot: "bg-emerald-400 shadow-emerald-400/50" },
              };
              const c = colorMap[step.color];
              return (
                <div key={step.num} className="relative text-center md:text-left">
                  <div className={`w-4 h-4 rounded-full ${c.dot} shadow-lg mx-auto md:mx-0 mb-6`} />
                  <span className={`text-5xl font-black ${c.num} opacity-30 block mb-2`}>
                    {step.num}
                  </span>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto relative">
          <div className="relative rounded-[2rem] overflow-hidden p-12 md:p-20">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 via-purple-700 to-cyan-700" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-[-50%] right-[-20%] w-[60%] h-[200%] bg-white/5 rotate-12 blur-sm" />

            <div className="relative">
              <PiFlagBannerFill className="w-12 h-12 text-white/30 mb-6" />
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
                Ready to run
                <br />
                your conference?
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-lg">
                Join educators who use this platform to bring Model United Nations to life in their classrooms.
              </p>
              <Link to="/login">
                <Button className="bg-white text-purple-900 hover:bg-white/90 text-base font-bold px-10 py-6 rounded-full">
                  Get Started <PiArrowRightBold className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PiGlobeFill className="w-5 h-5 text-fuchsia-400" />
            <span className="font-bold tracking-tight">
              MUN<span className="text-fuchsia-400">.</span>platform
            </span>
          </div>
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} Built for educators and students.
          </p>
        </div>
      </footer>
    </div>
  );
}
