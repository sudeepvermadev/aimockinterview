// // import dayjs from "dayjs";
// // import Link from "next/link";
// // import Image from "next/image";

// // import { Button } from "./ui/button";
// // // import DisplayTechIcons from "./DisplayTechIcons";

// // import { cn, getRandomInterviewCover } from "@/lib/utils";
// // // import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

// // const InterviewCard = async ({
// //   interviewId,
// //   userId,
// //   role,
// //   type,
// //   techstack,
// //   createdAt,
// // }: InterviewCardProps) => {
// //   const feedback =
// //     userId && interviewId
// //       ? await getFeedbackByInterviewId({
// //           interviewId,
// //           userId,
// //         })
// //       : null;

// //   const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

// //   const badgeColor =
// //     {
// //       Behavioral: "bg-light-400",
// //       Mixed: "bg-light-600",
// //       Technical: "bg-light-800",
// //     }[normalizedType] || "bg-light-600";

// //   const formattedDate = dayjs(
// //     feedback?.createdAt || createdAt || Date.now()
// //   ).format("MMM D, YYYY");

// //   return (
// //     <div className="card-border w-[360px] max-sm:w-full min-h-96">
// //       <div className="card-interview">
// //         <div>
// //           {/* Type Badge */}
// //           <div
// //             className={cn(
// //               "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
// //               badgeColor
// //             )}
// //           >
// //             <p className="badge-text ">{normalizedType}</p>
// //           </div>

// //           {/* Cover Image */}
// //           <Image
// //             src={getRandomInterviewCover()}
// //             alt="cover-image"
// //             width={90}
// //             height={90}
// //             className="rounded-full object-fit size-[90px]"
// //           />

// //           {/* Interview Role */}
// //           <h3 className="mt-5 capitalize">{role} Interview</h3>

// //           {/* Date & Score */}
// //           <div className="flex flex-row gap-5 mt-3">
// //             <div className="flex flex-row gap-2">
// //               <Image
// //                 src="/calendar.svg"
// //                 width={22}
// //                 height={22}
// //                 alt="calendar"
// //               />
// //               <p>{formattedDate}</p>
// //             </div>

// //             <div className="flex flex-row gap-2 items-center">
// //               <Image src="/star.svg" width={22} height={22} alt="star" />
// //               <p>{feedback?.totalScore || "---"}/100</p>
// //             </div>
// //           </div>

// //           {/* Feedback or Placeholder Text */}
// //           <p className="line-clamp-2 mt-5">
// //             {feedback?.finalAssessment ||
// //               "You haven't taken this interview yet. Take it now to improve your skills."}
// //           </p>
// //         </div>

// //         <div className="flex flex-row justify-between">
// //           <DisplayTechIcons techStack={techstack} />

// //           <Button className="btn-primary">
// //             <Link
// //               href={
// //                 feedback
// //                   ? `/interview/${interviewId}/feedback`
// //                   : `/interview/${interviewId}`
// //               }
// //             >
// //               {feedback ? "Check Feedback" : "View Interview"}
// //             </Link>
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default InterviewCard;


// import dayjs from "dayjs";
// import Image from "next/image";
// import { Button } from "./ui/button";
// import { Interview, Feedback } from "@/constants";
// import { getRandomInterviewCover } from "@/lib/utils";



// export default function InterviewCard({
//   interviewId,
//   userId,
//   role,
//   type,
//   techstack,
//   createdAt,

// }: InterviewCardProps) {
//   const feedback: Feedback | null = null; // Replace with actual data fetching logic
//   const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
//   const formattedDate = dayjs(
//     feedback?.createdAt || createdAt || Date.now()
//   ).format("MMM D, YYYY");

//   return (
//     <div className="card-border w-[360px] max-sm:w-full min-h-96 bg-[#1a1a28] border border-gray-800 p-6 rounded-2xl shadow-lg mb-4">
//      <div className="card-interview">
//       <div>
//         <div className="absolute top-0 right-0 w-fit px4 py-2 rounded-lg bg-light-600">
//           <p className="badge-text">{normalizedType}</p>
          
//         </div>
//         <Image  src= {getRandomInterviewCover()}  alt="cover-image" width={90} height={90} className="rounded-full object-cover size-[90px]" />
//       </div>

// <h3> {role} Interview</h3>
// <div className="flex flex-row gap-5 mt-3 "> 
// <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
// <p>{formattedDate}</p>
// </div>
// <div>
// <Image src="/star.svg" width={22} height={22} alt="star" />
// <p>{feedback?.totalScore || "---"}/100</p>  
// <div>
// <p className="line-clamp-2 mt-5">
// {feedback?.finalAssessment ||
// "You haven't taken this interview yet. Take it now to improve your skills."}
// </p>
// </div>
// <div className="flex flex-row justify-between">
//   <P> Tech Icons</P>
//   <Button className="btn-primary">
//     <a href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
//       {feedback ? "Check Feedback" : "View Interview"}
//     </a>
//   </Button> 

// <div className="flex flex-row justify-between">
//   <DisposableStack techStack{techstack} />

// </div>
// </div>
// </div>
//      </div>
//     </div>
//   );
// }





// // "use client";

// // import dayjs from "dayjs";
// // import Image from "next/image";
// // import { Button } from "./ui/button";
// // import { InterviewCardProps, Feedback } from "@/constants";
// // import { getRandomInterviewCover } from "@/lib/utils";

// // export default function InterviewCard({
// //   interviewId,
// //   userId,
// //   role,
// //   type,
// //   techstack,
// //   createdAt,
// // }: InterviewCardProps) {
// //   const feedback: Feedback | null = null; // TODO: fetch real feedback if needed
// //   const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
// //   const formattedDate = dayjs(feedback?.createdAt || createdAt).format("MMM D, YYYY");

// //   return (
// //     <div className="bg-[#1a1a28] border border-gray-800 p-6 rounded-2xl shadow-lg">
// //       {/* Cover + Badge */}
// //       <div className="relative flex items-center gap-4 mb-4">
// //         <Image
// //           src={getRandomInterviewCover()}
// //           width={90}
// //           height={90}
// //           alt="cover"
// //           className="rounded-full object-cover"
// //         />
// //         <span className="absolute top-0 right-0 bg-blue-600 px-3 py-1 rounded-lg text-sm">
// //           {normalizedType}
// //         </span>
// //       </div>

// //       <h3 className="text-xl font-semibold mb-2">{role} Interview</h3>
// //       <p className="text-gray-400 mb-1">Date: {formattedDate}</p>
// //       <p className="text-gray-400 mb-2">
// //         Score: {feedback?.totalScore ?? "---"}/100
// //       </p>

// //       <div className="flex gap-2 flex-wrap mb-3">
// //         {techstack.map((tech) => (
// //           <Image
// //             key={tech}
// //             src={`/tech/${tech.toLowerCase()}.svg`} // fallback to /public/tech icons
// //             alt={tech}
// //             width={24}
// //             height={24}
// //             className="rounded"
// //           />
// //         ))}
// //       </div>

// //       <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
// //         <a href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
// //           {feedback ? "Check Feedback" : "View Interview"}
// //         </a>
// //       </Button>
// //     </div>
// //   );
// // }

// "use client";

// import Image from "next/image";
// import { Button } from "./ui/button";
// import { Interview, Feedback, interviewCovers } from "@/constants";
// import { getRandomInterviewCover, getTechLogos, cn } from "@/lib/utils";

// interface InterviewCardProps extends Interview {
//   feedback?: Feedback | null;
// }

// export default function InterviewCard({
//   id,
//   role,
//   type,
//   techstack,
//   createdAt,
//   feedback = null,
// }: InterviewCardProps) {
//   const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
//   const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });

//   return (
//     <div className="bg-[#1a1a28] border border-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-sm mb-6 relative">
//       {/* Badge */}
//       <div className="absolute top-4 right-4 bg-blue-600 px-3 py-1 rounded-lg text-sm font-medium">
//         {normalizedType}
//       </div>

//       {/* Cover Image */}
//       <div className="flex justify-center mb-4">
//         <Image
//           src={getRandomInterviewCover() || "/covers/default.png"}
//           alt="cover"
//           width={90}
//           height={90}
//           className="rounded-full object-cover"
//         />
//       </div>

//       {/* Role & Date */}
//       <h3 className="text-xl font-semibold mb-1">{role} Interview</h3>
//       <p className="text-gray-400 mb-1">Date: {formattedDate}</p>
//       <p className="text-gray-400 mb-3">
//         Score: {feedback?.totalScore ?? "---"}/100
//       </p>

//       {/* Tech Icons */}
//       <div className="flex flex-wrap gap-2 mb-4">
//         {techstack.map((tech) => {
//           const normalized = tech.toLowerCase().replace(/\s+/g, "");
//           const iconUrl = `/tech/${normalized}.svg`; // fallback to public/tech
//           return (
//             <Image
//               key={tech}
//               src={iconUrl}
//               alt={tech}
//               width={28}
//               height={28}
//               className="rounded"
//             />
//           );
//         })}
//       </div>

//       {/* Feedback / Placeholder */}
//       <p className="text-gray-300 line-clamp-2 mb-4">
//         {feedback?.finalAssessment ||
//           "You haven't taken this interview yet. Take it now to improve your skills."}
//       </p>

//       {/* Action Button */}
//       <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
//         <a href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}>
//           {feedback ? "Check Feedback" : "View Interview"}
//         </a>
//       </Button>
//     </div>
//   );
// }
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Interview, Feedback } from "@/constants";
import { getRandomInterviewCover, getTechLogos, cn } from "@/lib/utils";
import DisplayTechIcons from "./DisplayTechIcons";
import { useState, useEffect } from "react";

interface InterviewCardProps extends Interview {
  feedback?: Feedback | null;
}

export default function InterviewCard({
  id,
  role,
  type,
  techstack,
  createdAt,
  feedback = null,
}: InterviewCardProps) {
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const [coverSrc, setCoverSrc] = useState<string>("/covers/adobe.png");
  const [techIcons, setTechIcons] = useState<{ tech: string; url: string }[]>([]);

  useEffect(() => {
    setCoverSrc(getRandomInterviewCover() || "/covers/adobe.png");
    
    // Load tech logos synchronously if possible, or via utility
    const loadLogos = async () => {
      const logos = await getTechLogos(techstack);
      setTechIcons(logos);
    };
    loadLogos();
  }, [techstack]);

  return (
    <div className="group relative bg-[#11111d] border border-gray-800/50 p-6 rounded-[28px] w-full max-w-sm transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
      {/* Badge & Date */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          {formattedDate}
        </span>
        <span className={cn(
          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border",
          normalizedType === "Technical" 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
        )}>
          {normalizedType}
        </span>
      </div>

      {/* Role Title */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-4">
          <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-[#1a1a28] rounded-full p-1 border border-white/5">
            <Image
              src={coverSrc}
              alt="cover"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          {role} <span className="">Interview</span>
        </h3>
      </div>

      {/* Stats Box */}
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-6">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-bold text-gray-500 mb-1">Performance</span>
          <p className="text-lg font-black text-white">
            {feedback?.totalScore ?? "—"}<span className="text-xs text-gray-600 font-normal">/100</span>
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase font-bold text-gray-500 mb-1">Stack</span>
          <DisplayTechIcons techIcons={techIcons} />
        </div>
      </div>

      <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20">
        <Link href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}>
          {feedback ? "Review Results" : "Launch Interview"}
        </Link>
      </Button>
    </div>
  );
}