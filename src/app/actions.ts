'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Index } from '@upstash/vector';
import { UpstashVectorStore } from '@langchain/community/vectorstores/upstash';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Document {
  pageContent: string;
  metadata: Record<string, any>;
  embedding: number[];
}

const embeddingsModel = new OpenAIEmbeddings({});
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL as string,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
});
const vectorStore = new UpstashVectorStore(embeddingsModel, {
  index,
});

async function processPdfText(pdfText: string, userInput: string) {
  const textSplitter = new CharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 500 });
  const chunks = await textSplitter.splitDocuments([{ pageContent: pdfText, metadata: {} }]);
  
  let mostSimilarDocumentContent = '';
  let highestSimilarityScore = -Infinity;

  // Rough similarity search using term frequency
  const queryTerms = userInput.split(/\s+/);
  const chunkScores = chunks.map(chunk => {
    const chunkTerms = chunk.pageContent.split(/\s+/);
    const commonTerms = queryTerms.filter(term => chunkTerms.includes(term));
    return { chunk, score: commonTerms.length };
  });

  // Sort chunks by their rough similarity score in descending order
  chunkScores.sort((a, b) => b.score - a.score);

  // Only embed the top N chunks to reduce computation (adjust N as needed)
  const topChunks = chunkScores.slice(0, 2); // Adjust N based on your needs and performance testing

  for (const { chunk } of topChunks) {
    const embeddings = await embeddingsModel.embedDocuments([chunk.pageContent]);
    if (embeddings && embeddings.length > 0) {
      const embedding = embeddings[0];
      if (embedding && Array.isArray(embedding)) {
        console.log('Embedding generated:', embedding);
        console.log('Chunk content:', chunk.pageContent);

        try {
          const document: Document = { pageContent: chunk.pageContent, metadata: {}, embedding };
          await vectorStore.addDocuments([document]);

          // Calculate similarity with userInput
          const queryEmbedding = await embeddingsModel.embedQuery(userInput);
          const similarityScore = calculateSimilarity(queryEmbedding, embedding);
          if (similarityScore > highestSimilarityScore) {
            highestSimilarityScore = similarityScore;
            mostSimilarDocumentContent = chunk.pageContent;
          }
        } catch (error) {
          console.error('Error adding document to vector store:', error);
        }
      } else {
        console.error('Invalid embedding format for chunk:', chunk.pageContent);
      }
    } else {
      console.error('Embeddings are undefined or empty for chunk:', chunk.pageContent);
    }
  }

  return mostSimilarDocumentContent;
}

function calculateSimilarity(queryEmbedding: number[], documentEmbedding: number[]): number {
  // Implement a simple cosine similarity calculation or any other similarity metric
  // Here we will use cosine similarity as an example

  const dotProduct = queryEmbedding.reduce((acc, val, idx) => acc + val * documentEmbedding[idx], 0);
  const queryMagnitude = Math.sqrt(queryEmbedding.reduce((acc, val) => acc + val * val, 0));
  const documentMagnitude = Math.sqrt(documentEmbedding.reduce((acc, val) => acc + val * val, 0));

  return dotProduct / (queryMagnitude * documentMagnitude);
}

export async function continueConversation(history: Message[], userInput: string, pdfText: string) {
  let mostSimilarDocumentContent = '';

  if (pdfText) {
    mostSimilarDocumentContent = await processPdfText(pdfText, userInput);
  }

  const stream = createStreamableValue();

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-3.5-turbo'),
      system: "You are ChatGPT, a large language model trained by OpenAI, based on the GPT-3.5-turbo architecture. You can answer questions based on the text extracted from a PDF file provided by the user. Your goal is to provide accurate, comprehensive, and relevant responses by considering both the userInput query and the pdfText. When responding, follow these guidelines:\
      1.Accurate Extraction: Extract relevant text from the PDF to directly answer the user's query.\
      2.Comprehensive Coverage: When listing items such as subtopics, ensure that all relevant items are included in your response.\
      3.Structured Response: Present the information in a clear and organized manner, using bullet points or headings as appropriate.\
      4.Contextual Understanding: Use the context provided by both the user query and the PDF text to inform your responses.\
      5.Interactive Engagement: If the user's query is not related to the pdfText, provide a helpful and relevant response based on general knowledge or ask for more clarification.",
      messages: [
        ...history,
        { role: 'user', content: userInput } as const,
        ...(mostSimilarDocumentContent ? [{ role: 'system', content: mostSimilarDocumentContent } as const] : []),
      ],
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
