// message.js

export default function createMessage(props) {
    const containerClass = props.isBot ? "bot-message-container" : "user-message-container";
    const messageClass = props.isBot ? "bot-message" : "user-message";
    const authorText = props.isBot ? "AI ✨" : props.author;

    // Construct the HTML string
    const html = `
        <div class="${containerClass}">
            <div class="${messageClass}" id="msg${props.messageId}">
                <div class="author">
                    ${authorText}
                </div>
                <div class="message-content">
                    ${props.textContent}
                </div>
            </div>
        </div>
    `;

    return html;
}

// server.js (Express.js application)

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let messages = [];
let isGenerating = false;

// /get-messages route handler
app.get('/fetch-messages', (req, res) => {
    if (isGenerating) {
        // If AI is still generating, return a 204 status code
        return res.status(204).send();
    } else {
        // If AI is done generating, return a 200 status code with the array of messages
        return res.status(200).json({ messages });
    }
});

// /send-message route handler
app.post('/send-message', async (req, res) => {
    const { author, textContent } = req.body;

    // Create a new message object
    const newMessage = {
        isBot: false,
        author,
        textContent,
        messageId: (messages.length + 1).toString(),
    };

    // Add the new message to the messages array
    messages.push(newMessage);

    // Simulate AI generation
    isGenerating = true;
    // Replace the following line with your actual AI response logic
    // const aiResponse = await fetchChatCompletion(textContent, pdfPageText, openAiChatHistory);
    const aiResponse = 'AI response';
    isGenerating = false;

    // Add AI response to the messages array
    const aiMessage = {
        isBot: true,
        author: 'AI ✨',
        textContent: aiResponse,
        messageId: (messages.length + 1).toString(),
    };
    messages.push(aiMessage);

    // Return 201 status code with the new message object
    return res.status(201).json(newMessage);
});

// Listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});