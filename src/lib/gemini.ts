import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const baseDir = "./public";

// ---------------- File Handlers ----------------
const create_File = ({
    fileName,
    content,
}: {
    fileName: string;
    content: string;
}) => {
    fs.writeFileSync(path.join(baseDir, fileName), content);
    return `✅ Created ${fileName}`;
};

const read_File = ({ fileName }: { fileName: string }) => {
    const filePath = path.join(baseDir, fileName);
    return fs.existsSync(filePath)
        ? fs.readFileSync(filePath, "utf-8")
        : `❌ ${fileName} not found`;
};

const delete_File = ({ fileName }: { fileName: string }) => {
    const filePath = path.join(baseDir, fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return `🗑️ ${fileName} deleted`;
    }
    return `❌ ${fileName} not found`;
};

const list_Files = () => fs.readdirSync(baseDir).join(", ");

const append_File = ({
    fileName,
    content,
}: {
    fileName: string;
    content: string;
}) => {
    const filePath = path.join(baseDir, fileName);
    if (fs.existsSync(filePath)) {
        fs.appendFileSync(filePath, content);
        return `➕ Appended to ${fileName}`;
    }
    return `❌ ${fileName} not found`;
};

const generate_MultiPageWebsite = ({
    pages,
    folder,
}: {
    pages: { name: string; content: string }[];
    folder: string;
}) => {
    const folderRoot = path.join(baseDir, "generated-site");
    const siteDir = path.join(folderRoot, folder);

    if (!fs.existsSync(folderRoot)) fs.mkdirSync(folderRoot),{ recursive: true };
    if (!fs.existsSync(siteDir)) fs.mkdirSync(siteDir, { recursive: true });

    for (const { name, content } of pages) {
        const filePath = path.join(siteDir, name);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
    }

    return `🌐 Website created in ${siteDir} with ${pages.length} pages.`;
};

const get_preview_link = ({ folder }: { folder: string }) => {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const link = `${baseUrl}/generated-site/${folder}/index.html`;
    return {
        link,
        message: `Preview link for the generated website: ${link}`,
    };
};

// ---------------- Tools ----------------

const toolFunctions: Record<
    string,
    (...args: any[]) => string | { link: string; message: string }
> = {
    create_File,
    read_File,
    delete_File,
    list_Files,
    append_File,
    generate_MultiPageWebsite,
    get_preview_link,
};

const systemInstruction = `
You are an intelligent AI file assistant with access to tools for file system operations and website generation.

Use tools with correct arguments:

- create_File: { fileName: "index.html", content: "<h1>Hello</h1>" }
- read_File: { fileName: "index.html" }
- delete_File: { fileName: "test.txt" }
- list_Files: {}
- append_File: { fileName: "log.txt", content: "extra data" }
- generate_MultiPageWebsite: {
    pages: [
        { name: "index.html", content: "<!DOCTYPE html><html><head><title>home</title></head><body>some content</body></html>" },
        {name:"index.js",content:"console.log("hello world")"},
        {name:"style.css",content:"body{background-color:red;}"}
        { name: "about.html", content: "<!DOCTYPE html><html><head><title>about</title></head><body>some content</body></html>" }
    ],
    folder: "my-website"
  }
Content must be complete HTML documents with valid HTML, CSS, and JS included.
Always ensure valid responses, and if tool usage fails, attempt clarification or retries.
If a preview is requested, call get_preview_link with the folder used in generation.
`;

// ---------------- Types ----------------
type Part = {
    text?: string;
    functionResponse?: { name: string; response: { result: string } };
    functionCall?: {
        name: string;
        args: Record<string, unknown>;
    };
};
type Message = {
    role: "user" | "model";
    parts: Part[];
    functionCall?: { name: string; args: Record<string, unknown> };
};

// ---------------- Main Function ----------------
export async function runGemini(
    userInput: Message[],
    retries = 0
): Promise<Message[]> {
    const MAX_RETRIES = 10;

    if (retries >= MAX_RETRIES) {
        userInput.push({
            role: "model",
            parts: [{ text: "❌ Max retries reached. Aborting." }],
        });
        return userInput;
    }

    try {
        const validInput = userInput.filter(
            (msg) =>
                msg.parts && Array.isArray(msg.parts) && msg.parts.length > 0
        );

        // Type assertion added here to suppress TS errors on response properties.
        const response = (await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: validInput,
            config: {
                tools: [
                    {
                        functionDeclarations: [
                            {
                                name: "create_File",
                                description: "Create file with content",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        fileName: { type: Type.STRING },
                                        content: { type: Type.STRING },
                                    },
                                    required: ["fileName", "content"],
                                },
                            },
                            {
                                name: "read_File",
                                description: "Read a file",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        fileName: { type: Type.STRING },
                                    },
                                    required: ["fileName"],
                                },
                            },
                            {
                                name: "delete_File",
                                description: "Delete a file",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        fileName: { type: Type.STRING },
                                    },
                                    required: ["fileName"],
                                },
                            },
                            {
                                name: "list_Files",
                                description: "List all files",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {},
                                },
                            },
                            {
                                name: "append_File",
                                description: "Append content to file",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        fileName: { type: Type.STRING },
                                        content: { type: Type.STRING },
                                    },
                                    required: ["fileName", "content"],
                                },
                            },
                            {
                                name: "generate_MultiPageWebsite",
                                description:
                                    "Generate multi-page HTML/CSS/JS website.",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        pages: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    name: { type: Type.STRING },
                                                    content: {
                                                        type: Type.STRING,
                                                    },
                                                },
                                                required: ["name", "content"],
                                            },
                                        },
                                        folder: {
                                            type: Type.STRING,
                                        },
                                    },
                                    required: ["pages", "folder"],
                                },
                            },
                            {
                                name: "get_preview_link",
                                description:
                                    "Get preview link for generated website",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        folder: { type: Type.STRING },
                                    },
                                    required: ["folder"],
                                },
                            },
                        ],
                    },
                ],
                systemInstruction,
            },
        })) as any;

        const functionCall = response.functionCalls?.[0];
        if (functionCall) {
            const { name, args } = functionCall;
            if (!toolFunctions[name]) {
                userInput.push({
                    role: "model",
                    parts: [{ text: `❌ Unknown tool: ${name}` }],
                });
                return userInput;
            }

            const result = toolFunctions[name](args);
            const resultText =
                name === "get_preview_link"
                    ? JSON.stringify(result)
                    : String(result);

            userInput.push({ role: "model", parts: [{ functionCall }] });
            userInput.push({
                role: "user",
                parts: [
                    {
                        functionResponse: {
                            name,
                            response: { result: resultText },
                        },
                    },
                ],
            });

            return await runGemini(userInput, retries + 1);
        }

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && parts.length > 0) {
            userInput.push({ role: "model", parts });
        }

        return userInput;
    } catch (err) {
        userInput.push({
            role: "model",
            parts: [{ text: `❌ Internal error: ${String(err)}` }],
        });
        return userInput;
    }
}
