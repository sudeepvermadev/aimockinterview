// import React, { ReactNode } from "react";
// import { Toaster } from "sonner"; // 1. Ise import karein

// const AuthLayout = ({ children }: { children: React.ReactNode }) => {
//     return (
//         <div className="auth-layout flex min-h-screen items-center justify-center bg-[#050508]">
//             {children}
//             {/* 2. Toaster ko yahan add karein */}
//             <Toaster position="top-center" richColors /> 
//         </div>
//     )
// }

// export default AuthLayout;

import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        // No html, No body, No toaster (kyunki wo main layout mein hai)
        <div className="auth-layout flex min-h-screen items-center justify-center bg-background transition-colors duration-300">
            {children}
        </div>
    )
}

export default AuthLayout;