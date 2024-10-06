"use server";

import { chatWithMem } from "./chatWithMem";

export const chatAction = async (userInput: string) => {
    const res = await chatWithMem(userInput);
    return res;
};