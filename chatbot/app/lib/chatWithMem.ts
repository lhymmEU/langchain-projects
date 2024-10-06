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
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  trimMessages,
} from "@langchain/core/messages";

const messages = [
  new SystemMessage("you're a good assistant"),
  new HumanMessage("hi! I'm bob"),
  new AIMessage("hi!"),
  new HumanMessage("I like vanilla ice cream"),
  new AIMessage("nice"),
  new HumanMessage("whats 2 + 2"),
  new AIMessage("4"),
  new HumanMessage("thanks"),
  new AIMessage("no problem!"),
  new HumanMessage("having fun?"),
  new AIMessage("yes!"),
];

export const chatWithMem = async () => {
  // Initialize the model
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "mixtral-8x7b-32768",
    temperature: 0,
  });

  // Initialize the message trimmer to keep the length of the conversation manageable
  const trimmer = trimMessages({
    maxTokens: 10,
    strategy: "last",
    tokenCounter: (msgs) => msgs.length,
    includeSystem: true,
    allowPartial: false,
    startOn: "human",
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
    const trimmedMessage = await trimmer.invoke(state.messages);
    const response = await chain.invoke({
      messages: trimmedMessage,
      language: state.language,
    });
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
    messages: [...messages, new HumanMessage("What is the math questions I asked and what is the answer?")],
    language: "German",
  };
  const output = await app.invoke(input, config);
  console.log(output.messages[output.messages.length - 1]);
};
