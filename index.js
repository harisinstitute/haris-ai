const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');


// 1. Initialize Gemini with your API Key
const genAI = new GoogleGenerativeAI('AQ.Ab8RN6Ia6SZadywASXJRbLLc2h4zliLVQs5u5War58WQi7et_Q');

// 💡 DEFINE YOUR CUSTOM INSTRUCTIONS HERE:
// Change this text to whatever persona, tone, or rule set you want the AI to follow.

const training_data = fs.readFileSync('training_data.txt', 'utf8');

const customSystemInstruction = training_data;

// Initialize the model with the custom system instruction
const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.1-flash-lite',
    systemInstruction: customSystemInstruction
});

// 2. Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate QR code for first-time login
client.on('qr', (qr) => {
    console.log('Scan this QR code using your WhatsApp mobile app:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp bot is connected and actively listening with custom instructions!');
});

// 3. Listen to incoming messages from all chats
client.on('message', async (msg) => {
    // Ignore status broadcasts or messages sent by yourself
    if (msg.fromMe || msg.isStatus) return;

    console.log(`📩 Received message from ${msg.from}: "${msg.body}"`);

    try {
        const prompt = msg.body;
        
        // Generate content using Gemini API (it will automatically follow your system instructions)
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Reply directly back to the chat/sender
        await msg.reply(responseText);
        console.log(`📤 Replied with Gemini AI response.`);
        
    } catch (error) {
        console.error('❌ Error generating or sending Gemini response:', error);
        await msg.reply('Sorry, I encountered an error processing your request with AI API.');
    }
});

// Start the client
client.initialize();

