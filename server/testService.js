
import mongoose from 'mongoose';
import { User } from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const { StartupProfile } = await import('./models/StartupProfile.js');
        const profile = await StartupProfile.findOne();
        if (!profile) {
            console.log("No profile found.");
            return;
        }
        const user = { _id: profile.owner };
        
        // Generate a token or bypass. Actually we can just call the service directly.
        const { generateUserBrandService } = await import('./services/brandService.js');
        
        console.log("Calling generateUserBrandService for user", user._id);
        const result = await generateUserBrandService(user._id, { useAI: true });
        console.log("Success! Result:", result);
        
        process.exit(0);
    } catch (e) {
        console.error("Error:", e.message || e);
        process.exit(1);
    }
};

run();
