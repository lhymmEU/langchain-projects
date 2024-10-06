import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation,
} from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { v4 as uuidv4 } from "uuid";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

export const chatWithMem = async () => {
  // Initialize the model
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "mixtral-8x7b-32768",
    temperature: 0,
  });

  // Prompt templating
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You talk like a pirate. Answer all questions to the best of your ability in {language}.",
    ],
    new MessagesPlaceholder("messages"),
  ]);

  // Define the state
  const GraphAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    language: Annotation<string>(),
  });

  // Define the function that calls the model
  const callModel = async (state: typeof GraphAnnotation.State) => {
    const chain = prompt.pipe(llm);
    const response = await chain.invoke(state);
    return { messages: response };
  };

  // Define a new graph
  const workflow = new StateGraph(GraphAnnotation)
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
  const input = {
    messages: [
      {
        role: "user",
        content: "Hi I'm _magicsheep?",
      },
    ],
    language: "German",
  };
  const output = await app.invoke(input, config);
  console.log(output.messages[output.messages.length - 1]);

  const input2 = {
    messages: [
      {
        role: "user",
        content: "What's my name?",
      },
    ],
    language: "German",
  };
  const output2 = await app.invoke(input2, config);
  console.log(output2.messages[output2.messages.length - 1]);
};
