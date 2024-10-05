import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const translate = async (input: string) => {
  // Instantiate model.
  // TODO: make the instantiation take input from users.
  const model = new ChatGroq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    model: "mixtral-8x7b-32768",
    temperature: 0,
  });

  // Prompt Templating
  const systemTemplate = "Translate the following into {language}:";
  const promptTemplate = ChatPromptTemplate.fromMessages([
    // System message
    ["system", systemTemplate],
    // Human message
    ["user", "{text}"],
  ]);

  // Chain components together using LCEL.
  const parser = new StringOutputParser();
  const chain = promptTemplate.pipe(model).pipe(parser);
  const result = await chain.invoke({ language: "Chinese", text: input });

  return result;
};