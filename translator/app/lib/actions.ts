"use server";

import { translate } from "./groq-translator";

export const translateAction = async (input: string, from: string, to: string) => {
    const res = await translate(input, from, to);

    return res;
}