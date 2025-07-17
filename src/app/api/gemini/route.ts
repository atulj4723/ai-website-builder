import { runGemini } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return Response.json(
                { success: false, error: "Invalid messages format" },
                { status: 400 }
            );
        }

        const result = await runGemini(messages);
        console.log("AI response:", result);
        return Response.json(
            { success: true, messages: result },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error in Gemini API:", err);
        return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
