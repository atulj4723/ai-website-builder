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

        // Extract preview link (if any) from any message with a functionResponse for get_preview_link.
        let url = "";
        for (const msg of result) {
            for (const part of msg.parts) {
                if (
                    part.functionResponse &&
                    part.functionResponse.name === "get_preview_link"
                ) {
                    try {
                        const previewData = JSON.parse(
                            part.functionResponse.response.result
                        );
                        if (previewData.link) {
                            url = previewData.link;
                        }
                    } catch {}
                }
            }
        }

        console.log("AI response:", result);
        return Response.json(
            { success: true, messages: result, url },
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
