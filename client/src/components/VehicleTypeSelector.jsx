// const VehicleTypeSelector = ({ selectedType, onChange, vehicleTypes }) => {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-3">
//         Vehicle Type
//       </label>
//       <div className="grid grid-cols-3 gap-4">
//         {vehicleTypes.map((type) => (
//           <button
//             key={type.id}
//             type="button"
//             onClick={() => onChange(type.id)}
//             className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all bg-white
//               ${selectedType === type.id
//                 ? 'border-blue-500 bg-blue-50 text-blue-700'
//                 : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700'
//               }`}
//           >
//             {type.id === 'car' && (
//               <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16v-4m0 0V8m0 4h8m-8 0H4m8-4h4a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2h4z" />
//               </svg>
//             )}
//             {type.id === 'pickup' && (
//               <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
//               </svg>
//             )}
//             {type.id === 'truck' && (
//               <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
//               </svg>
//             )}
//             <span className="text-sm font-medium">{type.label}</span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default VehicleTypeSelector; 