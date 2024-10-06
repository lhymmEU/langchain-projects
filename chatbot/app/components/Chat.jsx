"use client";

import { chatAction } from "../lib/actions";

export default function Chat() {
    const handleClick = async () => {
        await chatAction();
    }

  return (
    <>
      <button onClick={handleClick}>Simulate Chat</button>
    </>
  );
}
