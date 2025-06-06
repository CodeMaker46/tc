"use client";
import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import { useDarkMode } from "../../context/DarkModeContext";

export function WorldMap({
  dots = [],
  lineColor = "#0ea5e9"
}) {
  const svgRef = useRef(null);
  const { darkMode } = useDarkMode();

  // Memoize the map instance
  const map = useMemo(() => new DottedMap({ height: 100, grid: "diagonal" }), []);

  // Memoize the SVG map
  const svgMap = useMemo(() => map.getSVG({
    radius: 0.22,
    color: darkMode ? "#FFFFFF40" : "#00000040",
    shape: "circle",
    backgroundColor: darkMode ? "black" : "white",
  }), [darkMode, map]);

  // Memoize the projectPoint function
  const projectPoint = useMemo(() => (lat, lng) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  }, []);

  // Memoize the createCurvedPath function
  const createCurvedPath = useMemo(() => (start, end) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  }, []);

  // Memoize the dots data
  const dotsData = useMemo(() => dots.map(dot => ({
    start: projectPoint(dot.start.lat, dot.start.lng),
    end: projectPoint(dot.end.lat, dot.end.lng)
  })), [dots, projectPoint]);

  return (
    <div className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        {dotsData.map((dot, i) => (
          <g key={`path-group-${i}`}>
            <motion.path
              d={createCurvedPath(dot.start, dot.end)}
              fill="none"
              stroke="url(#path-gradient)"
              strokeWidth="1"
              initial={{
                pathLength: 0,
              }}
              animate={{
                pathLength: 1,
              }}
              transition={{
                duration: 1,
                delay: 0.5 * i,
                ease: "easeOut",
              }}
              key={`start-upper-${i}`}
            />
          </g>
        ))}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dotsData.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <circle
                cx={dot.start.x}
                cy={dot.start.y}
                r="2"
                fill={lineColor}
              />
              <circle
                cx={dot.start.x}
                cy={dot.start.y}
                r="2"
                fill={lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="2"
                  to="8"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
            <g key={`end-${i}`}>
              <circle
                cx={dot.end.x}
                cy={dot.end.y}
                r="2"
                fill={lineColor}
              />
              <circle
                cx={dot.end.x}
                cy={dot.end.y}
                r="2"
                fill={lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="2"
                  to="8"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
