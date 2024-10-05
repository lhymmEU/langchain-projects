"use server";

import { translate } from "./groq-translator";

export const translateAction = async (input: string) => {
    const res = await translate(input);

    return res;
}