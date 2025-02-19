"use client";

import { useState } from "react";
import { translateAction } from "@/app/lib/actions";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

export default function Translate() {
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fromLanguage, setFromLanguage] = useState("en");
  const [toLanguage, setToLanguage] = useState("es");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(""); // Clear previous response
    try {
      // Use server actions to mitigate api key leakage for now.
      const res = await translateAction(inputValue, fromLanguage, toLanguage);
      setResponse(res);
    } catch (error) {
      console.error("Translation Error:", error);
      setResponse("An error occurred while translating.");
    }
    setIsLoading(false); // Set loading to false after completion
    setInputValue(""); // Clear the input
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center text-cyan-400 mb-6">
          Translator
        </h1>
        <div className="flex space-x-4 mb-4">
          <Select
            value={fromLanguage}
            onValueChange={(v) => {
              console.log("Selected Value:", v);
              setFromLanguage(v);
            }}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={toLanguage}
            onValueChange={(v) => {
              console.log("Selected Value:", v);
              setToLanguage(v);
            }}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter text to translate"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-2 text-lg text-white bg-transparent border-2 border-transparent rounded-md focus:outline-none focus:border-cyan-500 placeholder-gray-500 neon-input"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out neon-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Translate"}
          </button>
        </form>

        {response && (
          <div className="mt-6 p-4 bg-gray-700 rounded-md neon-response">
            <h2 className="text-xl font-semibold text-cyan-400 mb-2">
              Response:
            </h2>
            <p className="text-white">{response}</p>
          </div>
        )}
      </div>
      <style jsx global>{`
        .neon-input {
          box-shadow: 0 0 5px theme("colors.cyan.500"),
            0 0 20px theme("colors.cyan.500");
          transition: all 0.3s ease;
        }
        .neon-input:focus {
          box-shadow: 0 0 5px theme("colors.cyan.400"),
            0 0 20px theme("colors.cyan.400"), 0 0 35px theme("colors.cyan.400");
        }
        .neon-button {
          box-shadow: 0 0 5px theme("colors.cyan.500"),
            0 0 20px theme("colors.cyan.500");
          transition: all 0.3s ease;
        }
        .neon-button:hover:not(:disabled) {
          box-shadow: 0 0 5px theme("colors.cyan.400"),
            0 0 20px theme("colors.cyan.400"), 0 0 35px theme("colors.cyan.400");
          text-shadow: 0 0 5px theme("colors.white");
        }
        .neon-response {
          box-shadow: 0 0 5px theme("colors.cyan.500"),
            0 0 20px theme("colors.cyan.500");
          animation: glow 1.5s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from {
            box-shadow: 0 0 5px theme("colors.cyan.500"),
              0 0 20px theme("colors.cyan.500");
          }
          to {
            box-shadow: 0 0 10px theme("colors.cyan.400"),
              0 0 30px theme("colors.cyan.400");
          }
        }
      `}</style>
    </div>
  );
}
