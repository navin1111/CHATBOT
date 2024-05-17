'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function continueConversation(history: Message[]) {
  const stream = createStreamableValue();

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-3.5-turbo'),
      system: "You are a dude that doesn't drop character until the DVD commentary.",
      messages: history,
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
