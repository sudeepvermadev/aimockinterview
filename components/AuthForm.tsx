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
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";


import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";
import { Loader2, X } from "lucide-react";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Reset form when modal opens to ensure clean fields
  useEffect(() => {
    form.reset({
      name: "",
      email: "",
      password: "",
    });
  }, [form]);


  const handleResetPassword = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Please check your inbox.");
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error("Reset Error:", error);
      toast.error(error.message || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Welcome!");
        router.refresh();
        router.push("/");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.refresh();
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Authenticating with Google...");
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const idToken = await userCredential.user.getIdToken();
        
        const result = await signIn({ email: userCredential.user.email as string, idToken });
        
        if (!result?.success) {
            toast.error(result?.message || "Login failed", { id: toastId });
            return;
        }

        toast.success("Signed in successfully.", { id: toastId });
        router.refresh(); 
        router.push("/");
    } catch (error: any) {
        console.error("Google Auth Error:", error);
        toast.error("Failed to authenticate with Google", { id: toastId });
    } finally {
        setIsLoading(false);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
           <Link href="/" className="flex items-center justify-center gap-3">
            <Image src="/logonew.png" alt="logo" height={40} width={36} className="p-1 bg-gray-50 rounded-xl transition-all duration-300 group-hover:bg-blue-50 group-hover:-translate-y-0.5"/>
            <h1 className="text-[var(--text-primary)] font-extrabold text-3xl tracking-tight">
                Prep<span className="text-blue-500">Edge</span>
            </h1>
        </Link>
        </div>



        <h3 className="text-foreground/90">
            {isForgotPassword ? "Reset your password" : "Practice job interviews with AI"}
        </h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && !isForgotPassword && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            {!isForgotPassword && (
              <FormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
            )}

            {isSignIn && !isForgotPassword && (
                <div className="flex justify-end -mt-2">
                    <button 
                        type="button" 
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>
            )}

            {isForgotPassword ? (
               <div className="space-y-4">
                 <Button 
                    disabled={isLoading} 
                    className="btn w-full" 
                    type="button"
                    onClick={handleResetPassword}
                 >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                    Send Reset Link
                 </Button>
                 <button 
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                 >
                    Back to Sign In
                 </button>
               </div>
            ) : (
                <Button disabled={isLoading} className="btn w-full" type="submit">
                {isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                ) : null}
                {isSignIn ? "Sign In" : "Create an Account"}
                </Button>
            )}
          </form>
        </Form>

        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
        </div>

        <Button 
            disabled={isLoading}
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-100 text-black py-6 font-semibold flex items-center justify-center gap-2"
        >
            <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
            Sign in with Google
        </Button>

        <p className="text-center text-muted-foreground">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-primary hover:underline ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;