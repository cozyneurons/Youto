import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/common/Navbar';
import { BackgroundRippleEffect } from '../components/ui/background-ripple-effect';
import BorderGlow from '../components/ui/BorderGlow';
import Magnet from '../components/ui/Magnet';
import ScrambledText from '../components/ui/ScrambledText';

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="page home-page relative min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section with Ripple Effect */}
        <section className="hero relative flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 overflow-hidden min-h-[80vh]">
          {/* Awesome Background */}
          <BackgroundRippleEffect />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6 pointer-events-none">
            <Magnet padding={50} magnetStrength={3} wrapperClassName="pointer-events-auto">
              <div className="hero-badge px-4 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium backdrop-blur-md shadow-sm cursor-default">
                YouTube → Structured Course
              </div>
            </Magnet>

            <h1 className="hero-title text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 drop-shadow-sm pb-2">
              Learn from YouTube,<br />
              <span className="hero-accent text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-400 dark:from-blue-400 dark:to-cyan-300">
                Actually finish it.
              </span>
            </h1>

            <ScrambledText speed={0.2} duration={1.8} className="hero-subtitle text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mt-4 leading-relaxed pointer-events-auto">
              Paste a YouTube playlist URL. Get a structured course with a visual path, AI-generated summaries, and per-lesson notes — in seconds.
            </ScrambledText>

            <div className="hero-cta pointer-events-auto flex flex-wrap justify-center gap-4 mt-8 w-full max-w-md">
              {isAuthenticated ? (
                <Link to="/upload" id="hero-cta-upload" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-400/25 transition-all active:scale-95 flex items-center justify-center gap-2">
                  Convert a Playlist
                </Link>
              ) : (
                <>
                  <Link to="/signup" id="hero-cta-signup" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-400/25 transition-all active:scale-95 flex items-center justify-center">
                    Get started free
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 backdrop-blur-md text-zinc-800 dark:text-zinc-200 font-medium transition-all active:scale-95 flex items-center justify-center">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features relative z-10 max-w-6xl mx-auto px-4 py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <BorderGlow className="h-full" glowColor="190 85 65" backgroundColor="rgba(24, 24, 27, 0.7)">
            <div className="p-6 h-full flex flex-col justify-start">
              <h3 className="text-xl font-bold mb-2">Visual Course Path</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Every video becomes a node on a winding path. See your entire course at a glance.</p>
            </div>
          </BorderGlow>

          <BorderGlow className="h-full" glowColor="200 85 65" backgroundColor="rgba(24, 24, 27, 0.7)">
            <div className="p-6 h-full flex flex-col justify-start">
              <h3 className="text-xl font-bold mb-2">Per-lesson Notes</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Write notes alongside each video. Auto-saved as you type.</p>
            </div>
          </BorderGlow>

          <BorderGlow className="h-full" glowColor="210 90 65" backgroundColor="rgba(24, 24, 27, 0.7)">
            <div className="p-6 h-full flex flex-col justify-start">
              <h3 className="text-xl font-bold mb-2">AI Summaries</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Gemini summarizes each video transcript so you know what you're about to learn.</p>
            </div>
          </BorderGlow>

          <BorderGlow className="h-full" glowColor="220 90 65" backgroundColor="rgba(24, 24, 27, 0.7)">
            <div className="p-6 h-full flex flex-col justify-start">
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Mark lessons complete. Your progress is saved and shown on the path.</p>
            </div>
          </BorderGlow>
        </section>
      </main>
    </div>
  );
}

