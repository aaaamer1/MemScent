// import React from "react";

// type Component = { oil: string; percent: number };

// export default function RecipeCard({
//   recipe,
//   examples,
// }: {
//   recipe: { name: string; components: Component[] };
//   examples?: { name: string }[];
// }) {
//   return (
//     <div
//       className="
//         p-6 space-y-4
//         bg-white bg-opacity-10 backdrop-blur-md
//         rounded-3xl shadow-xl animate-fadeIn
//       "
//     >
//       <h2 className="text-2xl font-semibold text-white">{recipe.name}</h2>

//       <div className="grid grid-cols-3 gap-4">
//         {recipe.components.map((c) => (
//           <div
//             key={c.oil}
//             className="flex flex-col items-center bg-white bg-opacity-20 p-3 rounded-lg"
//           >
//             <span className="text-lg font-medium text-white">{c.oil}</span>
//             <span className="text-sm text-gray-200">{c.percent}%</span>
//           </div>
//         ))}
//       </div>

//       {examples && (
//         <div className="mt-4 text-gray-300 text-sm">
//           <strong>Inspiration:</strong>
//           <ul className="list-disc list-inside mt-1">
//             {examples.map((ex, i) => (
//               <li key={i}>{ex.name}</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <button className="mt-4 w-full px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded-full shadow">
//         Dispense
//       </button>
//     </div>
//   );
// }
