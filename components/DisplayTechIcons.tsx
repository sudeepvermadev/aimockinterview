// import Image from "next/image";

// import { cn, getTechLogos } from "@/lib/utils";

// const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
//   const techIcons = await getTechLogos(techStack);

//   return (
//     <div className="flex flex-row">
//       {techIcons.slice(0, 3).map(({ tech, url }, index) => (
//         <div
//           key={tech}
//           className={cn(
//             "relative group bg-dark-300 rounded-full p-2 flex flex-center",
//             index >= 1 && "-ml-3"
//           )}
//         >
//           <span className="tech-tooltip">{tech}</span>

//           <Image
//             src={url}
//             alt={tech}
//             width={100}
//             height={100}
//             className="size-5"
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default DisplayTechIcons;
// "use client";

// interface DisplayTechIconsProps {
//   techStack: string[];
// }

// // Map tech names to Devicon classes
// const techIconMap: { [key: string]: string } = {
//   react: "devicon-react-original colored",
//   "next.js": "devicon-nextjs-original colored",
//   nextjs: "devicon-nextjs-original colored",
//   node: "devicon-nodejs-plain colored",
//   "node.js": "devicon-nodejs-plain colored",
//   express: "devicon-express-original colored",
//   mongodb: "devicon-mongodb-plain colored",
//   typescript: "devicon-typescript-plain colored",
//   javascript: "devicon-javascript-plain colored",
//   tailwind: "devicon-tailwindcss-plain colored",
//   tailwindcss: "devicon-tailwindcss-plain colored",
//   html: "devicon-html5-plain colored",
//   html5: "devicon-html5-plain colored",
//   css: "devicon-css3-plain colored",
//   css3: "devicon-css3-plain colored",
//   bootstrap: "devicon-bootstrap-plain colored",
//   git: "devicon-git-plain colored",
//   github: "devicon-github-original colored",
//   docker: "devicon-docker-plain colored",
//   firebase: "devicon-firebase-plain colored",
//   prisma: "devicon-prisma-plain colored",
// };

// export default function DisplayTechIcons({ techStack }: DisplayTechIconsProps) {
//   return (
//     <div className="flex flex-wrap gap-3 justify-center mb-2">
//       {techStack.map((tech) => {
//         const key = tech.toLowerCase().replace(/\s/g, "");
//         const iconClass = techIconMap[key];

//         return iconClass ? (
//           <i key={tech} className={`${iconClass} text-3xl`} title={tech}></i>
//         ) : (
//           <span
//             key={tech}
//             className="text-gray-400 px-2 py-1 border border-gray-600 rounded"
//           >
//             {tech}
//           </span>
//         );
//       })}
//     </div>
//   );
// }


// 1. 'use client' hata diya taaki ye Server Component ban jaye
// import Image from "next/image";
// import { cn, getTechLogos } from "@/lib/utils";

// interface TechIconProps {
//   techStack: string[];
// }

// // 2. Ab ye async function sahi se kaam karega
// const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
//   const techIcons = await getTechLogos(techStack);

//   return (
//     <div className="flex flex-row items-center">
//       {techIcons.slice(0, 4).map(({ tech, url }, index) => (
//         <div
//           key={tech}
//           className={cn(
//             "relative group bg-gray-800 rounded-full p-1.5 border border-gray-700 flex items-center justify-center",
//             index >= 1 && "-ml-3" // Overlapping effect
//           )}
//         >
//           {/* Tooltip (Note: Server component mein purely CSS hover kaam karega) */}
//           <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
//             {tech}
//           </span>

//           <Image
//             src={url}
//             alt={tech}
//             width={20}
//             height={20}
//             className="rounded-sm"
//           />
//         </div>
//       ))}
//       {techStack.length > 4 && (
//         <span className="text-gray-500 text-xs ml-2">+{techStack.length - 4}</span>
//       )}
//     </div>
//   );
// };

// export default DisplayTechIcons;


import Image from "next/image";
import { cn } from "@/lib/utils";

interface TechIconProps {
  // Isay optional (?) banayein aur default empty array rakhein
  techIcons?: { tech: string; url: string }[];
}

const DisplayTechIcons = ({ techIcons = [] }: TechIconProps) => {
  // Check karein agar array khali hai ya undefined hai
  if (!techIcons || techIcons.length === 0) {
    return <div className="text-gray-600 text-[10px]">No stack</div>;
  }

  return (
    <div className="flex flex-row items-center">
      {/* ?. (Optional chaining) use karein safe rehne ke liye */}
      {techIcons?.slice(0, 4).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-gray-800 rounded-full p-1.5 border border-gray-700 flex items-center justify-center",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
            {tech}
          </span>

          <Image
            src={url}
            alt={tech}
            width={20}
            height={20}
            className="rounded-sm"
          />
        </div>
      ))}
      {techIcons.length > 4 && (
        <span className="text-gray-500 text-xs ml-2">+{techIcons.length - 4}</span>
      )}
    </div>
  );
};

export default DisplayTechIcons;