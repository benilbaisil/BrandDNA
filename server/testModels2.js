import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent') && m.name.includes('flash'));
        console.log(generateModels.map(m => m.name));
    } catch (e) {
        console.error("Error:", e);
    }
};

run();
