// "use client";

// import { z } from "zod";
// import Link from "next/link";
// import Image from "next/image";
// import { toast } from "sonner";
// import { auth } from "@/firebase/client";
// import { useForm } from "react-hook-form";
// import { useRouter } from "next/navigation";
// import { zodResolver } from "@hookform/resolvers/zod";

// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
// } from "firebase/auth";

// import { Form } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";

// import { signIn, signUp } from "@/lib/actions/auth.action";
// import FormField from "./FormField";

// const authFormSchema = (type: FormType) => {
//   return z.object({
//     name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
//     email: z.string().email(),
//     password: z.string().min(3),
//   });
// };

// const AuthForm = ({ type }: { type: FormType }) => {
//   const router = useRouter();

//   const formSchema = authFormSchema(type);
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = async (data: z.infer<typeof formSchema>) => {
//     try {
//       if (type === "sign-up") {
//         const { name, email, password } = data;

//         const userCredential = await createUserWithEmailAndPassword(
//           auth,
//           email,
//           password
//         );

//         const result = await signUp({
//           uid: userCredential.user.uid,
//           name: name!,
//           email,
//           password,
//         });

//         if (!result.success) {
//           toast.error(result.message);
//           return;
//         }

//         toast.success("Account created successfully. Please sign in.");
//         router.push("/sign-in");
//       } else {
//         const { email, password } = data;

//         const userCredential = await signInWithEmailAndPassword(
//           auth,
//           email,
//           password
//         );

//         const idToken = await userCredential.user.getIdToken();
//         if (!idToken) {
//           toast.error("Sign in Failed. Please try again.");
//           return;
//         }

//         await signIn({
//           email,
//           idToken,
//         });

//         toast.success("Signed in successfully.");
//         router.push("/");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(`There was an error: ${error}`);
//     }
//   };

//   const isSignIn = type === "sign-in";

//   return (
//     <div className="card-border lg:min-w-[566px]">
//       <div className="flex flex-col gap-6 card py-14 px-10">
//         <div className="flex flex-row gap-2 justify-center">
//           <Image src="/logo.svg" alt="logo" height={32} width={38} />
//           <h2 className="text-primary-100">PrepWise</h2>
//         </div>

//         <h3>Practice job interviews with AI</h3>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="w-full space-y-6 mt-4 form"
//           >
//             {!isSignIn && (
//               <FormField
//                 control={form.control}
//                 name="name"
//                 label="Name"
//                 placeholder="Your Name"
//                 type="text"
//               />
//             )}

//             <FormField
//               control={form.control}
//               name="email"
//               label="Email"
//               placeholder="Your email address"
//               type="email"
//             />

//             <FormField
//               control={form.control}
//               name="password"
//               label="Password"
//               placeholder="Enter your password"
//               type="password"
//             />

//             <Button className="btn" type="submit">
//               {isSignIn ? "Sign In" : "Create an Account"}
//             </Button>
//           </form>
//         </Form>

//         <p className="text-center">
//           {isSignIn ? "No account yet?" : "Have an account already?"}
//           <Link
//             href={!isSignIn ? "/sign-in" : "/sign-up"}
//             className="font-bold text-user-primary ml-1"
//           >
//             {!isSignIn ? "Sign In" : "Sign Up"}
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default AuthForm;
"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "@/firebase/client"; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { signIn, signUp } from "@/lib/actions/auth.action"; 
import { Loader2 } from "lucide-react";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3, "Name must be at least 3 characters") : z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const toastId = toast.loading(isSignIn ? "Authenticating..." : "Creating your account...");
    
    try {
      if (!isSignIn) {
        // 1. Firebase Auth Creation
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        
        // 2. Sync to Firestore (Pass UID so document ID matches Auth UID)
        const result = await signUp({
          uid: userCredential.user.uid,
          name: data.name!,
          email: data.email,
        });

        if (!result.success) {
            toast.error(result.message, { id: toastId });
            return;
        }

        toast.success("Account created successfully! Redirecting to login...", { id: toastId });
        router.push("/sign-in");
      } else {
        // 1. Firebase Auth Sign In
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const idToken = await userCredential.user.getIdToken();

        // 2. Set Server-side Session Cookie
        const result = await signIn({ email: data.email, idToken });
        
        if (!result?.success) {
            toast.error(result?.message || "Login failed", { id: toastId });
            return;
        }

        toast.success("Welcome back!", { id: toastId });
        
        // Ensure state is updated before redirect
        router.refresh(); 
        router.push("/");
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      let errorMessage = "An unexpected error occurred";
      
      if (error.code === 'auth/email-already-in-use') errorMessage = "Email already registered";
      if (error.code === 'auth/invalid-credential') errorMessage = "Invalid email or password";
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-border lg:min-w-[500px] bg-[#11111d] p-10 rounded-[32px] border border-white/5 shadow-2xl">
      <div className="flex flex-col gap-8">
        {/* Logo Section */}
        <Link href="/" className="flex items-center justify-center gap-3">
            <Image src="/logonew.png" alt="logo" height={40} width={36} className="p-1 bg-gray-50 rounded-xl transition-all duration-300 group-hover:bg-blue-50 group-hover:-translate-y-0.5"/>
            <h1 className="text-white font-extrabold text-3xl tracking-tight">
                Prep<span className="text-blue-500">Edge</span>
            </h1>
        </Link>

        <div className="text-center">
            <h2 className="text-white text-2xl font-bold">
                {isSignIn ? "Welcome Back" : "Get Started"}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
                {isSignIn ? "Enter your credentials to access your account" : "Join PrepEdge to start your AI interview journey"}
            </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {!isSignIn && (
                <FormField 
                    control={form.control} 
                    name="name" 
                    label="Full Name" 
                    placeholder="John Doe" 
                />
            )}
            
            <FormField 
                control={form.control} 
                name="email" 
                label="Email Address" 
                placeholder="name@example.com" 
                type="email" 
            />
            
            <FormField 
                control={form.control} 
                name="password" 
                label="Password" 
                placeholder="Min. 6 characters" 
                type="password" 
            />

            <Button 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-blue-900/20" 
                type="submit"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} /> Processing...
                </span>
              ) : (
                isSignIn ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>
        </Form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#11111d] px-2 text-gray-500">Or continue with</span></div>
        </div>

        <p className="text-center text-gray-400 text-sm">
          {isSignIn ? "New to PrepEdge?" : "Already have an account?"}
          <Link 
            href={isSignIn ? "/sign-up" : "/sign-in"} 
            className="ml-2 text-blue-500 font-bold hover:text-blue-400 transition-colors"
          >
            {isSignIn ? "Register Now" : "Login Here"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;