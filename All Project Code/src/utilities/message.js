// message.js
const { JWT } = require("google-auth-library");
const { GOOGLE_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS } = process.env;


const getIdToken = async () => {
    const client = new JWT({
        keyFile: GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const idToken = await client.authorize();
    return idToken.access_token;
};

function createMessage(props) {
    const containerClass = props.isBot ? "bot-message-container" : "user-message-container";
    const messageClass = props.isBot ? "bot-message" : "user-message";
    const authorText = props.isBot ? "AI ✨" : props.author;

    // Construct the HTML string
    const html = 
        `<div class="${containerClass}">
            <div class="${messageClass}" id="message">
                <div class="author">
                    ${authorText}
                </div>
                <div class="message-content">
                    ${props.textContent}
                </div>
            </div>
        </div>`;

    return html;
}

const fetchChatCompletion = async (AIChatHistory, isSummary) => {
    const fetchModule = await import("node-fetch");
    const fetch = fetchModule.default;

    const URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/${isSummary ? "text-bison" : "chat-bison"}:predict`;

    const headers = {
        Authorization: `Bearer ` + (await getIdToken()),
        "Content-Type": "application/json",
    };

    // console.log(AIChatHistory)
    let data;
    if (!isSummary) {
        // console.log("chat")
        data = {
            instances: [
                {
                    // This context is different from the context in index.js. This context is guidance for the bot
                    context: "Your job is to provide concise responses and answers to what the user asks. If the user is asking about the summary or content, prioritise answering with information given. Format responses to be as readible as possible, if there are sub topics/topics bold the name of the sub topic/topic. Give response in markdown format.",
                    messages: AIChatHistory
                },
            ],
            parameters: {
                temperature: 0.15,
                maxOutputTokens: 600,
                topP: 0.95,
                topK: 40,
            },
        };
    } else {
        // console.log("summary")
        data = {
            instances: [
                {
                    content: `Summarise in detail and concisely ${AIChatHistory[0].content}`,
                },
            ],
            parameters: {
                temperature: 0.15,
                maxOutputTokens: 600,
                topP: 0.95,
                topK: 40,
            },
        };
    } 
    // console.log(AIChatHistory)
    // console.log(data)
    const response = await fetch(URL, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        console.error(response.statusText);
        // console.log(response)
        throw new Error("Request failed " + response.statusText);
    }
    const result = await response.json();

    if (isSummary) {
        return result.predictions[0].content;
    }
    return result.predictions[0].candidates[0].content;
};


module.exports = {
    createMessage,
    fetchChatCompletion,
};

// // /get-messages route handler
// app.get('/fetch-message', (req, res) => {
//     if (isGenerating) {
//         return res.status(204).send();
//     } else {
//         return res.status(200).json({ messages });
//     }
// });

// // /send-message route handler
// app.post('/send-message', async (req, res) => {
//     const { author, textContent } = req.body;

//     const newMessage = {
//         isBot: false,
//         author,
//         textContent,
//         messageId: (messages.length + 1).toString(),
//     };
//     messages.push(newMessage);

//     isGenerating = true;

//     try {
//         // Call Vertex AI to generate AI response
//         const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;
//         const prompt = {
//             prompt: textContent,
//         };
//         const instanceValue = helpers.toValue(prompt);
//         const instances = [instanceValue];

//         const parameter = {
//             temperature: 0.2,
//             maxOutputTokens: 256,
//             topP: 0.95,
//             topK: 40,
//         };
//         const parameters = helpers.toValue(parameter);

//         const request = {
//             endpoint,
//             instances,
//             parameters,
//         };

//         const response = await predictionServiceClient.predict(request);

//         const aiResponse = response.predictions[0].generated_text; // Assuming 'generated_text' is the field name in the response

//         const aiMessage = {
//             isBot: true,
//             author: 'AI ✨',
//             textContent: aiResponse,
//             messageId: (messages.length + 1).toString(),
//         };
//         messages.push(aiMessage);

//         isGenerating = false;

//         return res.status(201).json(newMessage);
//     } catch (error) {
//         console.error('Error generating AI response:', error);
//         isGenerating = false;
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// // /fetch-summary route handler
// app.post('/fetch-summary', async (req, res) => {
//     try {
//         const { context, pageText } = req.body;

//         // Prepare AIChatHistory based on the received context and page text
//         let AIChatHistory = [
//             {
//                 role: 'system',
//                 content: 'Some guidance or initial message',
//             },
//             {
//                 role: 'user',
//                 content: `Summarize ${context}`, // You can modify this as needed
//             },
//         ];

//         // Generate the summary using the provided function or model
//         let summary = await fetchChatCompletion(context, pageText, AIChatHistory);

//         // Return the generated summary
//         res.status(200).json({ summary });
//     } catch (error) {
//         console.error('Error generating summary:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });