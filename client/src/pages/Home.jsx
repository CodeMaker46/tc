import { Link } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import InfiniteMovingCardsDemo from '../components/UI/infinite-moving-cards-demo';
import HowItWorksDisplay from '../components/UI/HowItWorksDisplay';
import FlipWordsDemo from '../components/UI/flip-words-demo';
import FAQSection from '../components/UI/FAQSection';

// Lazy load the WorldMap component
const WorldMap = lazy(() => import('../components/UI/world-map').then(module => ({ default: module.WorldMap })));

export default function Home() {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const darkMode = useDarkMode();

  useEffect(() => {
    setName(localStorage.getItem('name'));
    setToken(localStorage.getItem('token'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-red-100 py-8">
      {/* Hero Section */}
      <section className="pt-16 pb-16 px-4 bg-gray-50 dark:bg-black text-gray-900 dark:text-red-100">
        <div className="max-w-7xl mx-auto text-center">
          {name && null}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8">
            Plan routes, <span className="text-gray-500">Hello {name || 'Trucker'}!</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-white mb-12 max-w-3xl mx-auto">
            Experience seamless route planning with integrated toll calculation. All in one powerful platform.
          </p>
          <Link
            to={token ? "/calculator" : "/auth"}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-100"
          >
            Start Calculating Now
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* WorldMap Section (Intra-India Only)
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Intra-India Connectivity</h2>
          <div className="w-full h-100 flex items-center justify-center rounded-xl overflow-hidden">
            <Suspense fallback={<div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />}>
              <WorldMap
                dots={[
                  { start: { lat: 19.0760, lng: 72.8777 }, end: { lat: 28.6139, lng: 77.2090 } }, // Mumbai → Delhi
                  { start: { lat: 12.9716, lng: 77.5946 }, end: { lat: 17.3850, lng: 78.4867 } }, // Bengaluru → Hyderabad
                  { start: { lat: 13.0827, lng: 80.2707 }, end: { lat: 22.5726, lng: 88.3639 } }, // Chennai → Kolkata
                  { start: { lat: 23.0225, lng: 72.5714 }, end: { lat: 19.0760, lng: 72.8777 } }, // Ahmedabad → Mumbai
                  { start: { lat: 28.6139, lng: 77.2090 }, end: { lat: 12.9716, lng: 77.5946 } }, // Delhi → Bengaluru
                ]}
                lineColor={darkMode ? "#ef4444" : "#cccccc"}
              />
            </Suspense>
          </div>
        </div>
      </section> */}

      {/* Professional Details Section with FlipWords */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Why Choose Us?
          </h2>
          <FlipWordsDemo />
        </div>
      </section>

      {/* How It Works */}
      <HowItWorksDisplay />

      {/* What Truckers Say*/}

      <section className="py-4 px-0">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          What Truckers Say
        </h2>
        <div className="w-screen  ">
          <InfiniteMovingCardsDemo />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}
