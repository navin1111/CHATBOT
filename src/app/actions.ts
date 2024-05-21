'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function continueConversation(history: Message[], userInput: string, pdfText: string) {
  const stream = createStreamableValue();

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-3.5-turbo'),
      system: "You are an AI assistant that can answer questions based on the text extracted as pdfText of a PDF file provided by the user. Your goal is to provide accurate and relevant responses by considering both the userInput query and the pdfText. And if the users query is not realted to the pdftext , still you can try answering and you can intract with the user",
      messages: [...history, { role: 'user', content: userInput }, { role: 'system', content: pdfText }],
    });

    let fullMessage = '';

    for await (const text of textStream) {
      fullMessage += text;
    }

    stream.update(fullMessage);
    stream.done();
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}
