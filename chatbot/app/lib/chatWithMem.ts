import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { v4 as uuidv4 } from "uuid";

export const chatWithMem = async () => {
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "mixtral-8x7b-32768",
    temperature: 0,
  });

  // Define the function that calls the model
  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await llm.invoke(state.messages);
    return { messages: response };
  };

  // Define a new graph
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("model", callModel)
    .addEdge(START, "model")
    .addEdge("model", END);

  // Add memory
  const memory = new MemorySaver();
  const app = workflow.compile({ checkpointer: memory });

  // Configure thread id to support multiple conversation threads for multiple users
  // Notice: the param name "thread_id" must be in this exact format, it is expected by the langgraph
  const config = { configurable: { thread_id: uuidv4() } };

  // Simulate a conversation
  const input = [
    {
        role: "user",
        content: "Hi, I'm _magicsheep",
    }
  ];
  const output = await app.invoke({ messages: input }, config);
  console.log(output.messages[output.messages.length - 1]);

  const input2 = [
    {
        role: "user",
        content: "What's my name?",
    }
  ];
  const output2 = await app.invoke({ messages: input2 }, config);
  console.log(output2.messages[output2.messages.length - 1]);
};
