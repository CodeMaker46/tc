import React, { useState } from 'react';
import RouteCard from './RouteCard';

const sampleRoutes = [
  {
    routeIndex: 0,
    name: "NH48 via Mumbai-Pune Expressway",
    type: "fastest",
    duration: "4 hours 12 mins",
    cost: 620.5,
    distance: "280.6 km",
    tolls: ["Kalamboli", "Talegaon", "Khed Shivapur"]
  },
  {
    routeIndex: 1,
    name: "NH60 via Nashik",
    type: "cheapest",
    duration: "5 hours 45 mins",
    cost: 310.75,
    distance: "320.2 km",
    tolls: ["Nashik Phata", "Sinnar", "Sangamner"]
  },
  {
    routeIndex: 2,
    name: "NH160 via Ahmednagar",
    type: "best",
    duration: "5 hours 5 mins",
    cost: 450.0,
    distance: "295.3 km",
    tolls: ["Narayangaon", "Shirur"]
  }
];

const HowItWorksDisplay = () => {
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  return (
    <section className="py-16 px-4 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          How It Works
        </h2>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Route Cards Display */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Source: Mumbai, Destination: Delhi</h3>
            </div>
            {sampleRoutes.map((route, index) => (
              <RouteCard
                key={index}
                route={route}
                isSelected={selectedRouteIndex === index}
                onSelect={() => setSelectedRouteIndex(index)}
              />
            ))}
          </div>

          {/* Steps */}
          <div className="lg:w-1/2">
            <div className="space-y-8">
              {[
                { title: "Enter Origin & Destination", description: "Input your starting point and desired destination." },
                { title: "Get Route Options", description: "Receive multiple route suggestions with estimated tolls and travel times." },
                { title: "Select & Navigate", description: "Choose the best route for your needs and proceed with your journey." }
              ].map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">{index + 1}.</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                    <p className="text-gray-600 dark:text-white">{step.description}</p>
                  </div>
                </div>
              ))}

              {/* add here map */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksDisplay; 