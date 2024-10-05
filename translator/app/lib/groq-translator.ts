import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { text } from "stream/consumers";

export const translate = async () => {
  // Instantiate model.
  // TODO: make the instantiation take input from users.
  const model = new ChatGroq({
    apiKey: "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",
    model: "mixtral-8x7b-32768",
    temperature: 0,
  });

  // Prompt Templating
  const systemTemplate = "Translate the following into {language}:";
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);

  // Chain components together using LCEL.
  const parser = new StringOutputParser();
  const chain = promptTemplate.pipe(model).pipe(parser);
  const result = await chain.invoke({ language: "Chinese", text: "Hello, World" });

  console.log(result);
};