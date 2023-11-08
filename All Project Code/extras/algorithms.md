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