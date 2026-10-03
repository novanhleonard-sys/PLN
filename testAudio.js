const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testAudio() {
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }); // wait, gemini-3.8-flash-tts? let's just use whatever is in the env
    // Or I can just write a script to use the worker's provider registry directly!
}
testAudio();
