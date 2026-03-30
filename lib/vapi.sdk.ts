import Vapi from "@vapi-ai/web";

const sanitizeEnv = (val?: string) => val?.trim().replace(/^["'](.+)["']$/, "$1") || "";

export const vapi = new Vapi(sanitizeEnv(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN));
