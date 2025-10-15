import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const category = fs.readFileSync("dataset.csv", "utf-8");

const generateCategory = async (title: string, content: string) => {
  try {
    const response = await model.generateContent(
      `You are an AI that classifies reports into categories based on examples. Here are some examples: ${category} Generate a category for the following title and content:\n\nTitle: ${title}\nContent: ${content}\n\nCategory:`
    );
    return response.response.text();
  } catch (error) {
    console.log(error);
  }
};

export { generateCategory };
