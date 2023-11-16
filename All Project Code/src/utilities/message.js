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
const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const { helpers } = require('@google-cloud/aiplatform');
const app = express();
app.use(bodyParser.json());

// Initialize Vertex AI PredictionServiceClient
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};
const predictionServiceClient = new PredictionServiceClient(clientOptions);
const project = 'csci-3308-final-project-405018'; 
const location = ''; 
const publisher = 'google';
const model = 'text-bison@001'; 

let messages = [];
let isGenerating = false;

// /get-messages route handler
app.get('/fetch-message', (req, res) => {
    if (isGenerating) {
        return res.status(204).send();
    } else {
        return res.status(200).json({ messages });
    }
});

// /send-message route handler
app.post('/send-message', async (req, res) => {
    const { author, textContent } = req.body;

    const newMessage = {
        isBot: false,
        author,
        textContent,
        messageId: (messages.length + 1).toString(),
    };
    messages.push(newMessage);

    isGenerating = true;

    try {
        // Call Vertex AI to generate AI response
        const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;
        const prompt = {
            prompt: textContent,
        };
        const instanceValue = helpers.toValue(prompt);
        const instances = [instanceValue];

        const parameter = {
            temperature: 0.2,
            maxOutputTokens: 256,
            topP: 0.95,
            topK: 40,
        };
        const parameters = helpers.toValue(parameter);

        const request = {
            endpoint,
            instances,
            parameters,
        };

        const response = await predictionServiceClient.predict(request);

        const aiResponse = response.predictions[0].generated_text; // Assuming 'generated_text' is the field name in the response

        const aiMessage = {
            isBot: true,
            author: 'AI ✨',
            textContent: aiResponse,
            messageId: (messages.length + 1).toString(),
        };
        messages.push(aiMessage);

        isGenerating = false;

        return res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error generating AI response:', error);
        isGenerating = false;
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// /fetch-summary route handler
app.post('/fetch-summary', async (req, res) => {
    try {
        const { context, pageText } = req.body;

        // Prepare AIChatHistory based on the received context and page text
        let AIChatHistory = [
            {
                role: 'system',
                content: 'Some guidance or initial message',
            },
            {
                role: 'user',
                content: `Summarize ${context}`, // You can modify this as needed
            },
        ];

        // Generate the summary using the provided function or model
        let summary = await fetchChatCompletion(context, pageText, AIChatHistory);

        // Return the generated summary
        res.status(200).json({ summary });
    } catch (error) {
        console.error('Error generating summary:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});