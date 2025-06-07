import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const faqItems = [
  {
    question: "How does the toll calculator determine the best route?",
    answer: "Our toll calculator uses advanced algorithms to analyze various factors such as distance, estimated travel time, toll charges, and road conditions to suggest the most optimal routes. It considers real-time traffic data and integrates with mapping services to provide accurate and efficient routes."
  },
  {
    question: "What types of logistics services does Mahindra Logistics offer?",
    answer: "We offer a comprehensive suite of logistics services, including integrated logistics, freight forwarding, warehousing, express delivery, and last-mile connectivity. Our solutions are tailored to meet the diverse needs of our clients."
  },
  {
    question: "How can I calculate toll costs for different vehicle types?",
    answer: "Absolutely! The calculator allows you to select various vehicle types, such as cars, trucks, and motorcycles. Toll charges can vary significantly based on vehicle class, and our system ensures you get accurate costs for your specific vehicle."
  },
  {
    question: "How can I track my shipment with Mahindra Logistics?",
    answer: "Mahindra Logistics provides real-time tracking services for all shipments. You can track your consignment through our online portal or dedicated customer service channels by entering your unique tracking ID."
  },
  {
    question: "Is there an option to calculate tolls for a multi-stop trip?",
    answer: "Currently, the calculator is designed for single origin-destination trips. For multi-stop trips, you would need to calculate tolls for each segment of your journey separately. We are continuously working on adding more advanced features, and multi-stop support is a planned enhancement."
  },
  {
    question: "What are the benefits of choosing Mahindra Logistics for my business?",
    answer: "Choosing Mahindra Logistics ensures reliable and cost-effective logistics solutions, access to a robust network, technological integration for visibility, and a commitment to customer satisfaction. We help businesses achieve operational excellence and competitive advantage."
  },
  {
    question: "Does Mahindra Logistics provide solutions for specific industries?",
    answer: "Yes, we cater to a wide range of industries including automotive, engineering, consumer goods, e-commerce, and pharmaceuticals. Our industry-specific expertise allows us to design and implement highly specialized logistics solutions."
  },
  {
    question: "How does Mahindra Logistics ensure safety and compliance?",
    answer: "Safety and compliance are paramount at Mahindra Logistics. We adhere to stringent safety protocols, regular training programs, and all regulatory requirements. Our operations are designed to ensure the secure and compliant movement of goods."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          FAQ
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out
                ${openIndex === index ? 'border-2 border-red-600 dark:border-red-500' : 'border border-gray-200 dark:border-neutral-700 hover:shadow-lg'}
              `}
            >
              <button
                className="flex justify-between items-center w-full text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                  {item.question}
                </span>
                <Plus
                  className={`w-6 h-6 text-gray-600 dark:text-gray-400 transform transition-transform duration-300
                    ${openIndex === index ? 'rotate-45 text-red-600 dark:text-red-500' : ''}
                  `}
                />
              </button>
              {openIndex === index && (
                <div className="mt-4 text-gray-600 dark:text-gray-300">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 