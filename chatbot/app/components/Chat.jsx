"use client";

import { useState } from "react";
import { chatAction } from "../lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Menu, PlusCircle } from "lucide-react";

export default function Chat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    // Omit empty messages to save tokens.
    const userInput = input.trim();
    if (userInput) {
      setMessages(prevMessages => [...prevMessages, { role: "user", content: userInput }]);
      setInput("");
      // Send msg to the server and get the response.
      const response = await chatAction(userInput);
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: response }]);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-100 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full p-4">
          <Button className="mb-4 justify-start gap-x-2" variant="ghost">
            <PlusCircle className="h-4 w-4" />
            Create New Conversation
          </Button>
          <ScrollArea className="flex-grow">
            <div className="space-y-2">
              {["Thread 1", "Thread 2", "Thread 3"].map((thread, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  {thread}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">Basic Chatbot</h1>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  // Show user messages on the right-side and system messages on the left-side
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Start your conversation here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
