import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

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
      userid = args.userId || "vapi-session"; 
    }
  } else {
    // Standard direct call
    ({ type, role, level, techstack, amount, userid } = body);
  }

  try {
    let finalQuestions: string[] = [];

    try {
      const { text: questions } = await generateText({
        model: google("gemini-2.0-flash-001"),

        prompt: `Act as an expert interviewer for exactly ${role}.
          The candidate level is ${level}.
          The focus is ${type} with a tech stack of ${techstack}.
          
          Generate ${amount} high-impact interview questions. 
          IMPORTANT:
          1. Return ONLY a valid JSON array of strings.
          2. Do NOT use markdown formatting, code blocks, or bolding inside the strings.
          3. Keep questions concise and optimized for being read aloud by a text-to-speech engine.
          4. No special characters like asterisks, backticks, or slashes.
          
          Example format: ["Question 1 text", "Question 2 text"]`,
      });

      console.log("Raw questions from AI:", questions);
      const cleanedQuestions = questions.replace(/```json/g, "").replace(/```/g, "").trim();
      finalQuestions = JSON.parse(cleanedQuestions);
    } catch (apiError) {
      console.error("Gemini API Error (using fallback):", apiError);
      // Fallback: A solid basic interview set for the requested role
      finalQuestions = [
        `Can you introduce yourself and tell me why you're interested in being a ${role}?`,
        `Given the seniority of ${level}, what do you consider the most challenging part of this role?`,
        `How do you keep your skills updated with technologies like ${techstack}?`,
        `Describe a difficult scenario you've faced in a previous project and how you resolved it.`,
        `What are your expectations for the next step in your career journey?`
      ].slice(0, Number(amount) || 5);
    }

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: typeof techstack === "string" ? techstack.split(",") : techstack,
      questions: finalQuestions,
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
            result: `Successfully generated ${finalQuestions.length} questions. Here they are for reference: ${JSON.stringify(finalQuestions)}`
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
