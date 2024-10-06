"use server";

import { chatWithMem } from "./chatWithMem";

export const chatAction = async () => {
    await chatWithMem();
};