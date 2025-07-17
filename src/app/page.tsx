import React from "react";
import Card from "@/components/Card";

const Page = () => {
    const features = [
        {
            title: "📁 File Tools",
            desc: "Create, read, append, or delete files using AI prompts.",
        },
        {
            title: "🌐 Website Generator",
            desc: "Instantly generate responsive HTML/CSS/JS websites using Tailwind CSS.",
        },
        {
            title: "📦 Download Zip",
            desc: "Package your site and download it as a .zip archive.",
        },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-12 text-gray-800">
            {/* Hero */}
            <section className="text-center max-w-3xl mx-auto mb-16">
                <div className="backdrop-blur-md bg-white/50 p-8 rounded-2xl shadow-xl">
                    <h1 className="text-5xl font-extrabold text-blue-600 drop-shadow-sm mb-4">
                        🧠 AI Web Assistant
                    </h1>
                    <p className="text-lg text-gray-600">
                        Generate beautiful websites, manage code, and download
                        projects — all using AI.
                    </p>
                    <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition duration-300">
                        <a href="/generator"> 🚀 Get Started</a>
                    </button>
                </div>
            </section>

            {/* Features */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                    <Card
                        key={index}
                        title={feature.title}
                        desc={feature.desc}
                    />
                ))}
            </section>
        </main>
    );
};

export default Page;
