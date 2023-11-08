# Psuedocode algoritms for each partials/components

## [message](../src/components/message/message.js)

this file will be used to construct the HTML for a message, and in chat.ejs, we will loop through an array of these messages and render them to the page

props will be an object with the following properties:
- isBot: boolean, true if the message is from the bot, false if it is from the user
- author: string, the author of the message
- textContent: string, the text content of the message
- messageId: string, the id of the message, used to identify it in the DOM. We can get the id from storing in the database

due to limitations with ejs, it is too difficult to render real time the response from openai. To counter this, maybe we could use a temporary message in the array that contains a bootstrap text loading thing.

because ejs is not dynamic, we need to load these messages client side. 
we need an endpoint /get-messages that will return an array of messages. We will then use javascript to loop through the array and render the messages to the page.

we also need to find a way to have it keep checking for updates to the messages array. One idea i have is maybe for /get-messages, if the ai is still generating (maybe we have a isGenerating flag), then it will return a 204 status code, and if it is done generating, it will return a 200 status code with the array of messages. Then, we can use javascript to keep calling /get-messages until we get a 200 status code, and then we can render the messages to the page.

### Example responses for the /get-messages route
```javascript
const messages = [
    {
        isBot: true,
        author: "AI ✨",
        textContent: "Hello, how can I assist you today?",
        messageId: "1"
    },
    {
        isBot: false,
        author: "User",
        textContent: "I have a question about your product.",
        messageId: "2"
    },
    {
        isBot: true,
        author: "AI ✨",
        textContent: "Sure, I'm here to help. What's your question?",
        messageId: "3"
    }
];

// /get-messages route handler
app.get('/get-messages', (req, res) => {
    // Check if AI is still generating
    const isGenerating = true; // Replace with your logic to check if AI is still generating

    if (isGenerating) {
        res.sendStatus(204); // Return 204 status code if AI is still generating
        // response
        // {
        //     status: 204
        // }
    } else {
        res.status(200).json(messages); // Return 200 status code with messages array if AI is done generating
        // response
        // {
        //     status: 200,
        //     messages: [
        //         {
        //             ...
        //         },
        //         ...
        //     ]
        // }
    }   
});
```

we also need a /send-message endpoint
```javascript
// /send-message route handler
app.post('/send-message', (req, res) => {
    const { author, textContent } = req.body;

    // Create a new message object
    const newMessage = {
        isBot: false,
        author,
        textContent,
        messageId: (messages.length + 1).toString()
    };

    // Add the new message to the messages array
    messages.push(newMessage);

    res.status(201).json(newMessage); // Return 201 status code with the new message object
    // response
    // {
    //     status: 201,
    //     message: {
    //         ...
    //     }
    // }

    // get ai generated response 
    fetchChatCompletion(textContent, pdfPageText, openAiChatHistory)
});
```

```javascript
// message.js

export default function message(props) {
    const containerClass = props.isBot ? "bot-message-container" : "user-message-container";
    const messageClass = props.isBot ? "bot-message" : "user-message";
    const authorText = props.isBot ? "AI ✨" : "${props.author}}";

    // Construct the HTML string
    const html = `
        <div class="${containerClass}">
            <div class="${messageClass}" id="${props.messageId}">
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

```

### Required arrays to store message history
```javascript
let messages = [
    `
    <div class="${containerClass}">
        <div class="${messageClass}" id="${props.messageId}">
            <div class="author">
                ${authorText}
            </div>
            <div class="message-content">
                ${props.textContent}
            </div>
        </div>
    </div>
    ` //example element in array
] // array of html elements from message()
let openAiChatHistory = [
    {
        role: 'system', 
        content: guidance // guidance = "Your job is to provide concise responses and answers to what the user asks. If the user is asking about the summary or content, prioritise answering with information given. Format responses to be as readible as possible, if there are sub topics/topics bold the name of the sub topic/topic";
    }, 
    {
        role: 'user', 
        content: `Create a concise summary of ${pdfText}. format your response in the most readable way possible.`
    },
    {
        role: 'assistant',
        content: 'AI response' 
    }
]
```

### Fetching ai response from openai API
```javascript
import * as Tiktoken from 'js-tiktoken'; 
import OpenAI from 'openai';

// copied from https://github.com/openai/openai-node
const openai = new OpenAI({
    apiKey: 'My API Key', // defaults to process.env["OPENAI_API_KEY"]
});

const getMessageTokens = async (chatHistory) => {
    // Initialize the encoder for the "gpt-3.5-turbo" model.
    const encoder = Tiktoken.encodingForModel("gpt-3.5-turbo");
    // Initialize an empty array to store the tokens.
    let total_tokens = [];
    // Iterate over each message in the chat history.
    chatHistory.forEach((message) => {
        // Encode the content of the message into tokens.
        const tokens = encoder.encode(message.content);
        // Concatenate the tokens into the total_tokens array.
        total_tokens = total_tokens.concat(tokens);
    });

    // Return the total number of tokens.
    return total_tokens.length;
}

const fetchChatCompletion = (message, context, openaiChatHistory) => {
    // check if the messages are over the token limit
    let tokens;

    if (context){
        openaiChatHistory.push({
            role: 'user',
            content: `from ${context}. ${message}`
        })
    } else {
        openaiChatHistory.push({
            role: 'user',
            content: message
        })
    } 

    do {
        tokens = await getMessageTokens(openaiChatHistory);
        // remove the second message from the chat history (because the first is the guidance message)
        if (openaiChatHistory.length > 2 && tokens > 4096){
            openaiChatHistory.splice(1, 1); 
        // if theres only the guidance and user message left, the page is too long.
        } else if (openaiChatHistory.length === 2 && tokens > 4096){
            setTextContent("Sorry, this page is too long to read.");
            return;
        }
    } while (tokens > 4096);

    try {
        props.setIsGenerating(true);

        const result = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: openaiChatHistory,
        });

        props.setIsGenerating(false);

        // add bot response to openaiChatHistory
        setOpenaiChatHistory(openaiChatHistory.concat({ role: 'assistant', content: result }));

        return result;

    } catch (error) {
        if (error.type && error.type === "invalid_request_error"){
            return "invalid request";
        } else if (error.type && error.type === "rate_limit_exceeded"){
            return "Rate limit exceeded. Please try again later.";
        } else {
            throw error;
        }
    }
}

```