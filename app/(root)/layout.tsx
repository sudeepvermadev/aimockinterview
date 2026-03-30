// // app/layout.tsx
// import React, { ReactNode } from "react";
// import Link from "next/link";
// import Image from "next/image";

// export const metadata = {
//   title: "PrepEdge",
//   description: "AI Interview Practice Platform",
// };

// const RootLayout = ({ children }: { children: ReactNode }) => {
//   return (
//     <html lang="en">
//       <head>
//         <link
//           rel="stylesheet"
//           href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css"
//         />
//       </head>
//       <body className="bg-black text-white antialiased"> {/* antialiased for smoother fonts */}
//         <div className="root-layout">
          
//           <header className="w-full py-6"> 
//             <nav className="w-[90%] max-w-7xl mx-auto flex items-center justify-between">
              
//               {/* Logo Section */}
//               <Link href="/" className="flex items-center gap-3 group">
//                 {/* Changed bg-gray-50 to white/10 for better dark mode blending */}
//                 <div className="p-1 bg-gray-50 rounded-xl transition-all duration-300 group-hover:bg-blue-50 group-hover:-translate-y-0.5">
//                   <Image
//                     src="/logonew.png"
//                     alt="logo"
//                     height={36} 
//                     width={32}
//                     className="rounded-lg object-contain"
//                   />
//                 </div>

//                 <h1 className="text-white font-bold text-3xl tracking-tight">
//                   Prep
//                   <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
//                     Edge
//                   </span>
//                 </h1>
//               </Link>

//               {/* Right Side Actions */}
//               <div className="flex items-center gap-6">
//                 <Link
//                   href="/sign-in"
//                   /* Updated hover state for better feedback */
//                   className="px-6 py-2.5 rounded-2xl font-semibold text-sm text-white border border-gray-600 hover:border-white hover:bg-white/5 transition-all duration-300"
//                 >
//                   Sign In
//                 </Link>
//               </div>
//             </nav>
//           </header>

//           <main className="pt-8 px-6 max-w-7xl mx-auto">
//             {children}
//           </main>
          
//         </div>
//       </body>
//     </html>
//   );
// };

// export default RootLayout;
import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu"; // ✅ Import sahi hai

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="root-layout min-h-screen">
      <header className="w-full py-6"> 
        <nav className="w-[90%] max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-1 bg-white/10 rounded-xl transition-all duration-300 group-hover:bg-blue-50">
              <Image 
                src="/logonew.png" 
                alt="logo" 
                height={36} 
                width={32} 
                style={{ height: 'auto', width: 'auto' }} // ✅ Aspect ratio fix
                className="p-1 bg-gray-50 rounded-xl transition-all duration-300 group-hover:bg-blue-50 group-hover:-translate-y-0.5" 
              />
            </div>
            <h1 className="text-white font-bold text-3xl tracking-tight">
              Prep<span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Edge</span>
            </h1>
          </Link>

          {/* Right Side Section */}
          <div className="flex items-center gap-6">
            {/* Yahan hum direct UserMenu render karenge. 
               UserMenu khud check karega:
               - Agar login hai -> User Name/Avatar dikhayega.
               - Agar login nahi hai -> "Sign In" button dikhayega.
            */}
            <UserMenu /> 
          </div>
          
        </nav>
      </header>

      <main className="pt-8 px-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;