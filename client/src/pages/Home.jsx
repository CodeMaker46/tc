import { Link } from 'react-router-dom';
import { useEffect,useState } from 'react';
export default function Home() {
  const [name, setName] = useState('');
  const [token,setToken]=useState('');
  useEffect(() => {
    setName(localStorage.getItem('name'));
    setToken(localStorage.getItem('token'));
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {name && <h1 className="text-3xl font-bold pb-7">Welcome, {name}</h1>}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8">
            Plan your routes smarter
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Save toll costs and time with our toll calculator.
          </p>
          <Link
            to={token ? "/calculator" : "/auth"}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Try Calculator
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
  
      {/* How it Works Section */}
      <section className="py-16 px-4 bg-white dark:bg-dark-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              title: "Enter Location",
              description: "Simply input your start and end points to begin planning your route.",
              icon: (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </>
              )
            }, {
              title: "Compare Routes",
              description: "Get multiple route options with detailed toll costs and travel times.",
              icon: (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </>
              )
            }, {
              title: "Choose Best Route",
              description: "Select the most efficient route based on your preferences.",
              icon: (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </>
              )
            }].map(({ title, description, icon }, index) => (
              <div key={index} className="p-6 rounded-xl bg-gray-50 dark:bg-dark-bg">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
  
      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Key Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
              title: "Cost Savings",
              text: "Find the most economical routes to reduce your toll expenses.",
              path: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            }, {
              title: "Time Efficiency",
              text: "Optimize your journey with the fastest available routes.",
              path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            }, {
              title: "Voice Assistant",
              text: "Hands-free operation for safe and convenient route planning.",
              path: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            }].map(({ title, text, path }, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  
      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white dark:bg-dark-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What Truckers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "This tool has saved me thousands in toll costs. The route suggestions are always spot on!",
                name: "Rajesh Kumar",
                role: "Long-haul Trucker"
              },
              {
                quote: "The voice assistant feature is a game-changer. I can plan routes safely while on the move.",
                name: "Amit Singh",
                role: "Fleet Manager"
              },
              {
                quote: "The AI suggestions help me make better decisions about which routes to take.",
                name: "Priya Patel",
                role: "Transport Coordinator"
              }
            ].map(({ quote, name, role }, index) => (
              <div key={index} className="p-6 bg-gray-50 dark:bg-dark-bg rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">"{quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                    <p className="text-sm text-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 