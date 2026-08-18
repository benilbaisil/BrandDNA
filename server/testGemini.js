import { generateBrandAssets } from './services/geminiService.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        console.log("Starting test...");
        const fakeProfile = {
            businessType: 'Startup',
            industry: 'E-commerce',
            businessGoals: ['Enter a new market'],
            businessDescription: 'Dairy products for selling milk products'
        };
        console.log("Calling generateBrandAssets...");
        const result = await generateBrandAssets(fakeProfile);
        console.log("Result:", result);
    } catch (e) {
        console.error("Error:", e);
    }
};

run();
