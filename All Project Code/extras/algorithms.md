# Psuedocode algoritms for each partials/components

# Nothing in this file is finalised

## Table of Contents

1. [message.js](#message)
    - [get-message route](#example-get-messages-route)
    - [send-message route](#example-send-message-route)
    - [storing message history](#required-arrays-to-store-message-history)
2. [GPT.js](#gpt)
    - [calculating tokens](#getting-message-tokens)
    - [calling the api](#calling-the-api)
3. [chat.ejs](#chatejs)
    - [get-latest-message-id](#probably-required-route-get-latest-message-id)
    - [script](#ejs-file)
4. [PDFViewer.ejs](#pdfviewerejs)



## [message](../src/components/message/message.js)

this file will be used to construct the HTML for a message, and in chat.ejs, we will loop through an array of these messages and render them to the page

props will be an object with the following properties: (it doesn't have to be props, we can do individual parameters, this is just a remnant of my react project)
- isBot: boolean, true if the message is from the bot, false if it is from the user
- author: string, the author of the message
- textContent: string, the text content of the message
- messageId: string, the id of the message, used to identify it in the DOM. We can get the id from storing in the database

due to limitations with ejs, it is too difficult to render real time the response from openai. To counter this, maybe we could use a temporary message in the array that contains a bootstrap text loading thing.

because ejs is not dynamic, we need to load these messages client side. 
we need an endpoint /get-messages that will return an array of messages. We will then use javascript to loop through the array and render the messages to the page.

we also need to find a way to have it keep checking for updates to the messages array. One idea i have is maybe for /get-messages, if the ai is still generating (maybe we have a isGenerating flag), then it will return a 204 status code, and if it is done generating, it will return a 200 status code with the array of messages. Then, we can use javascript to keep calling /get-messages until we get a 200 status code, and then we can render the messages to the page.

```javascript
// message.js

export default function message(props) {
    const containerClass = props.isBot ? "bot-message-container" : "user-message-container";
    const messageClass = props.isBot ? "bot-message" : "user-message";
    const authorText = props.isBot ? "AI ✨" : "${props.author}}";

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

```


### Example /get-messages route (may not be necessary)

> if we are storing this it has to be in a database.

```javascript
// /get-summary route handler
app.post('/fetch-summary', (req, res) => {
    // Return the messages array
    const { context, pageText } = req.body;
    // because summaries don't have to be context aware, we can just use the pageText as the context
    let openaiChatHistory = [
        {
            role: 'system', 
            content: guidance
        }, 
        {
            role: 'user', 
            content: `Summarise ${props.text}`
        }
    ]

    let summary = fetchChatCompletion(context, pageText, openaiChatHistory);
    res.status(200).json({ summary });
    // response
    // {
    //      status: 200,
    //      summary: "summary"
    // }
});

```

### Example /send-message route
```javascript
// /send-message route handler
app.post('/send-message', (req, res) => {
    const { author, textContent } = req.body;

    // Create a new message object
    const newMessage = {
        isBot: false,
        author,
        textContent,
        messageId: (messages.length + 1).toString(),
        messageHTML: message({isBot: false, author, textContent, messageId: (messages.length + 1).toString()}) 
        //idk if the messageHTML line is gonna work lol
    };


    // Add the new message to the messages array
    messages.push(newMessage);

    res.status(201).json(newMessage); // Return 201 status code with the new message object
    // response
    // {
    //      status: 201,
    //      message: {
    //         ...
    //     }
    // }

    // get ai generated response 
    isGenerating = true;
    await fetchChatCompletion(textContent, pdfPageText, openAiChatHistory);
    isGenerating = false;
});
```


### Required arrays to store message history

> on further thought, we probably need a database instead because we can't have an array for each user. So even if it is not specific to the PDF, it can just be the user's chat history.
>> Alternatively, we could just have the client side store everything

```javascript
let messages = [
    {
        isBot: false,
        author: "username",
        textContent: "user text",
        messageId: 1,
        messageHTML: 
        `
            <div class="user-message-container">
                <div class="user-message" id="msg1">
                    <div class="author">
                        username
                    </div>
                    <div class="message-content">
                        user text
                    </div>
                </div>
            </div>
        `
    },
    ...
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
    },
    ... //should alternate user and assistant
]
```

## [GPT](../src/utilities/GPT.js)

### Fetching ai response from openai API
```javascript
import * as Tiktoken from 'js-tiktoken'; 
import OpenAI from 'openai';
```

### Getting message tokens
copied from https://github.com/openai/openai-node
```javascript
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
```

### Calling the API

```javascript
const fetchChatCompletion = async (message, messages, context, openaiChatHistory) => {
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

        const result = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: openaiChatHistory,
        });

        // add bot response to openaiChatHistory
        setOpenaiChatHistory(openaiChatHistory.concat({ role: 'assistant', content: result }));

        // create the new bot message
        messages.push(message({
            isbot: true,
            author: 'AI ✨',
            textContent: result,
            messageId: (messages.length + 1).toString()
        }));


        return;

    } catch (error) {
        if (error.type && error.type === "invalid_request_error"){
            // create the new bot message
            messages.push(message({
                isbot: true,
                author: 'AI ✨',
                textContent: "Invalid request",
                messageId: (messages.length + 1).toString()
            }));
            return;
        } else if (error.type && error.type === "rate_limit_exceeded"){
            messages.push(message({
                isbot: true,
                author: 'AI ✨',
                textContent: "Rate limit exceeded. Please try again later.",
                messageId: (messages.length + 1).toString()
            }));
            return;
        } else {
            throw error;
        }
    }
}

```

## [Chat.ejs](../src/views/partials/chat.ejs)

### probably required route /get-latest-message-id

response:
- status
- latestMessageId
```javascript
app.get('/get-latest-message-id', (req,res) => {
        const latestMessageId = messages[messages.length - 1].messageId;
        res.status(200).json({ latestMessageId });
});
```

### ejs file
```javascript
<script>
    // this runs the function on first load
    document.addEventListener('DOMContentLoaded', function() {
        // Function to update the messages display
        function updateMessagesDisplay() {
            fetch('/get-messages')
                .then(response => response.json())
                .then(data => {
                    // Assuming `data` is an array of message objects
                    const messagesContainer = document.getElementById('messages');
                    // add each message to that element
                });
        }

        // Call this function on initial load
        updateMessagesDisplay();

        // Optionally, set this to update periodically
        // setInterval(updateMessagesDisplay, 5000); // Update every 5 seconds
    });
</script>
```

> since we don't expect any messages out of the blue, it isn't necessary to use setInterval. We can have this function triggered when the user clicks on the generate or send button instead.

```javascript
<!-- generate button -->
<div classname = "messages">
</div>
<!-- chat elements -->

```

# PDFViewer.ejs

### required global variables
- pageText, `window.pdf.pageText`: because the chat.ejs partials would probably require it.