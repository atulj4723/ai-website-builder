"use client";

import React, { useEffect, useRef, useState } from "react";

type Message = {
    role: "user" | "model";
    parts: { text: string }[];
};

const GeneratorPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [link, setLink] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        // Scroll to the bottom when messages change
        // if (messagesEndRef.current) {
        //     messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        // }
    }, [messages]);
    const handleSend = async () => {
        if (!input.trim()) return;
        // Show user message
        const newUserMsg: Message = { role: "user", parts: [{ text: input }] };
        setMessages((prev) => [...prev, newUserMsg]);
        setInput("");
        try {
            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, newUserMsg] }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || "AI response error");
            }
            setLink("")
            setMessages(data.messages || []); // Update messages with AI response
            // if (data.text) {
            // }
            // if (data.url) {
            //     setLink(data.url);
            // }
        } catch (error) {
            console.log("Error talking to AI:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "model",
                    parts: [{ text: "❌ Failed to talk to AI. Try again." }],
                },
            ]);
        }
    };

    const handleDownload = async () => {
        if (!link) {
            alert("No link available to download.");
            return;
        }

        try {
            const res = await fetch("/api/zip-download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folder: link }),
            });

            if (!res.ok) {
                throw new Error("Failed to create zip file");
            }

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${link}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error: any) {
            alert(
                error.message ||
                    "An error occurred while downloading the zip file."
            );
        }
    };

    const renderMessage = (msg: Message, i: number) => {
        if (!msg?.parts?.length) return null;
        if( msg.role !== "user" && msg.role !== "model") return null;
        return (
            <div
                key={`msg-${i}`}
                className={`p-3 my-1 rounded-xl text-sm w-fit max-w-[80%] ${
                    msg.role === "user"
                        ? "ml-auto bg-blue-100 text-blue-800"
                        : "mr-auto bg-gray-100 text-gray-700"
                }`}
            >
                {msg.parts.map((part, idx) => (
                    <div key={`part-${i}-${idx}`} className="whitespace-pre-wrap">
                        {part.text}
                    </div>
                ))}
            </div>
        );
    };
    

    return (
        <main className="h-screen grid grid-cols-1 md:grid-cols-2">
            {/* LEFT: Chat UI */}
            <section className="bg-white p-6 flex flex-col border-r h-[100vh] border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-blue-600">
                    🧠 AI Chat Assistant
                </h2>
                <div className="flex-1 overflow-y-scroll mb-4 space-y-2 h-[80vh] ">
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 text-black border rounded-full px-4 py-2 outline-none focus:ring-2 ring-blue-400"
                        placeholder="Ask AI to generate something..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
                        Send
                    </button>
                </div>
            </section>

            {/* RIGHT: Preview */}
            <section className="bg-gray-50 p-4 flex flex-col">
                <h2 className="text-xl font-semibold flex justify-between text-blue-600 mb-2">
                    <>🌐 Live Preview</>
                    <button
                        onClick={handleDownload}
                        className="hover:scale-105 flex justify-center items-center rounded text-white p-1 bg-blue-700">
                        📥 Download
                    </button>
                </h2>
                <div className="flex-1 border rounded-lg overflow-hidden shadow">
                    {link ? (
                        <iframe
                            src={link}
                            className="w-full h-full"
                            title="Generated Website Preview"
                        />
                    ) : (
                        <p className="text-gray-400 text-center pt-10">
                            No preview yet
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
};

export default GeneratorPage;
