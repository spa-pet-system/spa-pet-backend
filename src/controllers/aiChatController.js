// import { Configuration, OpenAIApi } from "openai";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// export const chatWithAI = async (req, res) => {
//   const { message } = req.body;
//   try {
//     const completion = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: message }],
//     });
//     res.json({ reply: completion.data.choices[0].message.content });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }; 