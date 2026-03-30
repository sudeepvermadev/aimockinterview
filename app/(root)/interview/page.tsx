// import Agent from "@/components/Agent";
// import { getCurrentUser } from "@/lib/actions/auth.action";

// const Page = async () => {
//   const user = await getCurrentUser();

//   return (
//     <>
//       <h3>Interview generation</h3>

//       <Agent
//         userName={user?.name!}
//         userId={user?.id}
//         profileImage={user?.profileURL}
//         type="generate"
//       />
//     </>
//   );
// };

// export default Page;


 import Agent from "@/components/Agent";
import React from "react";
const Page = () => {
  return (
   <>

<Agent userName="You" userId="user1" type="generate" questions={[]} feedbackId={undefined} />
   </>
  );
}
  export default Page;