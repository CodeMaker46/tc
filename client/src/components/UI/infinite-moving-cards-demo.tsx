"use client";

import React from "react";
import { InfiniteMovingCards } from "./infinite-moving-cards";

export default function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[20rem] w-full rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "The toll calculation feature on the Mahindra Logistics platform is incredibly accurate. It has significantly optimized our route planning and cost management.",
    name: "Ankit Sharma",
    title: "Operations Head",
    image: "https://randomuser.me/api/portraits/men/50.jpg",
    alt: "Ankit Sharma profile picture",
  },
  {
    quote:
      "As a driver, I find the Mahindra Logistics platform's toll calculation invaluable. It helps me avoid unexpected costs and plan my trips more efficiently.",
    name: "Deepak Kumar",
    title: "Long-Haul Driver",
    image: "https://randomuser.me/api/portraits/men/51.jpg",
    alt: "Deepak Kumar profile picture",
  },
  {
    quote:
      "The seamless integration of toll calculation within the Mahindra Logistics platform has revolutionized our fleet management. Highly recommend it!",
    name: "Pooja Singh",
    title: "Fleet Manager",
    image: "https://randomuser.me/api/portraits/women/52.jpg",
    alt: "Pooja Singh profile picture",
  },
  {
    quote:
      "Mahindra Logistics' commitment to efficiency is evident in their platform's precise toll calculations. It's a game-changer for reducing our operational expenses.",
    name: "Rajeshwari Devi",
    title: "Logistics Analyst",
    image: "https://randomuser.me/api/portraits/women/53.jpg",
    alt: "Rajeshwari Devi profile picture",
  },
  {
    quote:
      "The real-time toll data and route optimization on the Mahindra Logistics platform are unmatched. It truly helps us deliver on time and within budget.",
    name: "Siddharth Verma",
    title: "Supply Chain Director",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
    alt: "Siddharth Verma profile picture",
  },
  {
    quote:
      "I'm thoroughly impressed with the toll calculation accuracy and the overall user experience of the Mahindra Logistics platform. It's an essential tool for us.",
    name: "Kavita Rao",
    title: "Transport Coordinator",
    image: "https://randomuser.me/api/portraits/women/55.jpg",
    alt: "Kavita Rao profile picture",
  },
  {
    quote:
      "The insights from the toll calculation feature on Mahindra Logistics' platform have enabled us to make smarter decisions and improve our profitability significantly.",
    name: "Vivek Gupta",
    title: "Business Development Manager",
    image: "https://randomuser.me/api/portraits/men/56.jpg",
    alt: "Vivek Gupta profile picture",
  },
  {
    quote:
      "As a team lead, I can confirm that the Mahindra Logistics platform's toll calculation saves us hours of manual work and provides reliable data for our operations.",
    name: "Shruti Deshmukh",
    title: "Team Lead, Dispatch",
    image: "https://randomuser.me/api/portraits/women/57.jpg",
    alt: "Shruti Deshmukh profile picture",
  },
]; 