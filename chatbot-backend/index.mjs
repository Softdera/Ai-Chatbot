
import express from 'express';
import bodyParser from 'body-parser';
import Replicate from 'replicate';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});
app.post('/api/chatbot', async (req, res) => {
    const userMessage = req.body.message;
    const input = {
       /* top_k: 0,
        top_p: 0.9,
        prompt: `Work through this problem step by step:\n\nQ: ${userMessage}`,
        max_tokens: 512,
        min_tokens: 0,
        temperature: 0.6,
        system_prompt: "You are a helpful assistant",
        length_penalty: 1,
        stop_sequences: ",",
        prompt_template: "system\n\nYou are a helpful assistantuser\n\n{prompt}assistant\n\n",
        presence_penalty: 1.15,
        log_performance_metrics: false*/
        top_k: 0,
        top_p: 1,
        prompt: `What are some effective ways to manage stress:\n\nQ: ${userMessage}`,
        temperature: 0.5,
        system_prompt: "You are a knowledgeable and reliable assistant specializing in healthcare. Always provide information that is accurate, evidence-based, and up-to-date. Ensure your answers are helpful, respectful, and safe. Avoid any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Your responses should be socially unbiased and positive in nature.\n\nIf a question does not make sense, or is not factually coherent, explain why instead of providing incorrect information. If you do not know the answer to a question, it is better to admit this rather than share false information.",
        length_penalty: 1,
        max_new_tokens: 500,
        min_new_tokens: -1,
        prompt_template: "<s>[INST] <<SYS>>\n{system_prompt}\n<</SYS>>\n\n{prompt} [/INST]",
        presence_penalty: 1.15,
        log_performance_metrics: false,
        stop_sequences: ",",
      };
    try {
        console.log("Received request with message:", userMessage);
        console.log("Sending request to Replicate API...");
        console.log("Request payload:", input);

        const chunks = [];
        for await (const event of replicate.stream("meta/llama-2-70b-chat", { input })) {
            console.log("Received event:", event);
            chunks.push(event.toString());
        }

        const botReply = chunks.join('');
        console.log("Bot reply:", botReply);
        res.json({ reply: botReply });
    } catch (error) {
        console.error("Error communicating with the chatbot service:");
        console.error(error.message);
        console.error(error.stack);
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);
            console.error("Error response headers:", error.response.headers);
            if (error.response.status === 402) {
                res.status(402).json({ error: "Payment Required. Please set up billing on Replicate to continue using the service." });
            } else {
                res.status(500).json({ error: "An error occurred while communicating with the chatbot service." });
            }
        } else {
            res.status(500).json({ error: "An error occurred while communicating with the chatbot service." });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});