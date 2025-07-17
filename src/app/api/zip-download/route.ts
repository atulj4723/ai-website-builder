import JSZip from "jszip";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const { folder } = await req.json();

        if (!folder) {
            return new Response(
                JSON.stringify({
                    message: "Folder name is required",
                    success: false,
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const ar = folder.split("/")[4];

        const dir = path.join(process.cwd(), "public", "generated-site", ar);
        const zip = new JSZip();

        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, "utf-8");
            zip.file(file, content);
        }

        const blob = await zip.generateAsync({ type: "nodebuffer" });

        return new Response(blob, {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${folder}.zip"`,
            },
        });
    } catch (error) {
        console.error("Error creating zip file:", error);
        return new Response(
            JSON.stringify({
                message: "Internal Server Error",
                success: false,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
