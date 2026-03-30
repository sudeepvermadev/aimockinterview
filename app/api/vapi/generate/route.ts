import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { adminDb } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();

  let type, role, level, techstack, amount, userid;
  let toolCallId = null;

  // Check if this is a webhook call from Vapi
  if (body.message?.type === "tool-calls") {
    const toolCall = body.message.toolWithToolCallList[0]?.toolCall;
    if (toolCall) {
      toolCallId = toolCall.id;
      const args = toolCall.function.arguments;
      type = args.type;
      role = args.role;
      level = args.level;
      techstack = args.techstack;
      amount = args.amount;
      userid = "vapi-session"; 
    }
  } else {
    // Standard direct call
    ({ type, role, level, techstack, amount, userid } = body);
  }

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),

      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    console.log("Raw questions from AI:", questions);
    const cleanedQuestions = questions.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedQuestions = JSON.parse(cleanedQuestions);

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: typeof techstack === "string" ? techstack.split(",") : techstack,
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("interviews").add(interview);

    // If this was a Vapi webhook, respond in Vapi's required format
    if (toolCallId) {
      return Response.json({
        results: [
          {
            toolCallId: toolCallId,
            result: `Successfully generated ${parsedQuestions.length} questions. Here they are for reference: ${questions}`
          }
        ]
      }, { status: 200 });
    }

    // Standard client response
    return Response.json({ success: true, id: docRef.id }, { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    
    if (toolCallId) {
       return Response.json({
        results: [
          {
            toolCallId: toolCallId,
            error: error instanceof Error ? error.message : "Failed to generate interview questions."
          }
        ]
      }, { status: 500 });
    }

    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
