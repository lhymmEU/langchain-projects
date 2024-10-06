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

  // Initialize the message trimmer to keep the messages within the context window limit
  const trimmer = trimMessages({
    // Sets the max number of tokens that are allowed in the conversation history
    maxTokens: 10,
    // The trimmer will retain the most recent messages up to the limit and discard the earlier ones
    strategy: "last",
    // Currently, the token counter is counting the length of the messages array,
    // which means instead of actual tokens, number of messages are limited to 10 as set in the maxTokens
    tokenCounter: (msgs) => msgs.length,
    // Include system message into the token count
    includeSystem: true,
    // The entire message will be excluded without partial trunction
    allowPartial: false,
    // Set trimmer to start counting from the most recent human messages
    startOn: "human",
  });

  // Prompt templating
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You talk like a pirate. Answer all questions to the best of your ability in {language}.",
    ],
    // The messages will be insertd when the template is involked
    new MessagesPlaceholder("messages"),
  ]);

  // Define the root annotation schema for the state object that the entire workflow will share.
  // Annotations are similar to data models that specify the structure and types of data
  // that flow through the different nodes of a StateGraph.
  const GraphAnnotation = Annotation.Root({
    // Import the structure defined in the message annotation state.
    ...MessagesAnnotation.spec,
    // Adds a new field with the type of string.
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

  // Define a new graph.
  // Detailed state transition diagram:
  // 1. Initial State { messages, language } -> 
  // 2. "model" Node (callModel function)
  //    {
  //      1) Trim messages { trimmer.invoke(state.messages) }
  //      2) Send input to llm { messages: trimmedMessage, language: state.language }
  //      3) Return output { messages: response }
  //    } ->
  // 3. Final State { messages: response }
  const workflow = new StateGraph(GraphAnnotation)
    // Each node in the graph corresponds to a function that performs some operation on the state.
    // The function `callModel` is executed whenever the flow reaches this node.
    .addNode("model", callModel)
    // Each edge defines the flow from one node to another.
    .addEdge(START, "model")
    .addEdge("model", END);


  const memory = new MemorySaver();
  // The checkpointer will periodically saves the state to MemorySaver at each checkpoint:
  // 1. After processing a node.
  // 2. When manually triggered.
  // It will retrieve and resume the states from where it left off after:
  // 1. Workflow is interrupted.
  // 2. A new request arrives that references a thread_id stored in MemorySaver.
  //
  // It is also possible to customized a memory saver that extends the MemorySaver to save states in a persistent database.
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
