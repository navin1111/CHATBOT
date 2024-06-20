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

interface Chunk {
  pageContent: string;
  metadata: { pageNumber: number };
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
  console.log('Starting PDF text processing...');

  const textSplitter = new CharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 100 });

  // Split the text by pages first
  const pages = pdfText.split('\n\n'); 
  console.log('Total pages:', pages.length);

  let chunks: Chunk[] = [];

 // Split each page into chunks and keep track of page numbers
for (let i = 0; i < pages.length; i++) {
  console.log(`Processing page ${i + 1}`);
  const pageChunks = await textSplitter.splitDocuments([{ pageContent: pages[i], metadata: { pageNumber: i + 1 } }]);

  // Ensure the correct type for each chunk
  const typedPageChunks: Chunk[] = pageChunks.map(chunk => ({
    ...chunk,
    metadata: {
      ...chunk.metadata,
      pageNumber: i + 1,
    }
  }));

  chunks = chunks.concat(typedPageChunks);
}

  console.log('PDF text has been split into chunks:', chunks);

  let mostSimilarDocumentContent = '';
  let mostSimilarPageNumber = -1;
  let highestSimilarityScore = -Infinity;

  // Rough similarity search using term frequency
  const queryTerms = userInput.split(/\s+/);
  const chunkScores = chunks.map(chunk => {
    const chunkTerms = chunk.pageContent.split(/\s+/);
    const commonTerms = queryTerms.filter(term => chunkTerms.includes(term));
    return { chunk, score: commonTerms.length };
  });

  console.log('Chunk scores based on term frequency:', chunkScores);

  // Sort chunks by their rough similarity score in descending order
  chunkScores.sort((a, b) => b.score - a.score);

  console.log('Sorted chunk scores:', chunkScores);

  // Only embed the top N chunks to reduce computation (adjust N as needed)
  const topChunks = chunkScores.slice(0, 4);

  console.log('Top N chunks selected for embedding:', topChunks);

  for (const { chunk } of topChunks) {
    const embeddings = await embeddingsModel.embedDocuments([chunk.pageContent]);
    console.log('Generated embeddings for chunk:', embeddings);

    if (embeddings && embeddings.length > 0) {
      const embedding = embeddings[0];
      if (embedding && Array.isArray(embedding)) {
        try {
          const document: Document = { pageContent: chunk.pageContent, metadata: chunk.metadata, embedding };
          await vectorStore.addDocuments([document]);

          console.log('Added document to vector store:', document);

          // Calculate similarity with userInput
          const queryEmbedding = await embeddingsModel.embedQuery(userInput);
          console.log('Generated query embedding:', queryEmbedding);

          const similarityScore = calculateSimilarity(queryEmbedding, embedding);
          console.log('Calculated similarity score:', similarityScore);

          if (similarityScore > highestSimilarityScore) {
            highestSimilarityScore = similarityScore;
            mostSimilarDocumentContent = chunk.pageContent;
            mostSimilarPageNumber = chunk.metadata.pageNumber; // Get the page number from metadata
          }
        } catch (error) {
          console.error('Error adding document to vector store:', error);
        }
      }
    }
  }

  console.log('Most similar document content:', mostSimilarDocumentContent);
  console.log('Most similar page number:', mostSimilarPageNumber);

  return { mostSimilarDocumentContent, mostSimilarPageNumber }; // Return the page number
}

function calculateSimilarity(queryEmbedding: number[], documentEmbedding: number[]): number {
  const dotProduct = queryEmbedding.reduce((acc, val, idx) => acc + val * documentEmbedding[idx], 0);
  const queryMagnitude = Math.sqrt(queryEmbedding.reduce((acc, val) => acc + val * val, 0));
  const documentMagnitude = Math.sqrt(documentEmbedding.reduce((acc, val) => acc + val * val, 0));

  const similarity = dotProduct / (queryMagnitude * documentMagnitude);
  console.log('Calculated similarity between embeddings:', similarity);

  return similarity;
}

export async function continueConversation(history: Message[], userInput: string, pdfText: string) {
  console.log('Starting conversation continuation...');

  let mostSimilarDocumentContent = '';
  let mostSimilarPageNumber = -1;

  if (pdfText) {
    const result = await processPdfText(pdfText, userInput);
    mostSimilarDocumentContent = result.mostSimilarDocumentContent;
    mostSimilarPageNumber = result.mostSimilarPageNumber;

    // Console log the page number of the most similar document chunk
    console.log('Most similar document page number:', mostSimilarPageNumber);
  }

  const stream = createStreamableValue();

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-3.5-turbo'),
      system: `
You are an AI assistant that can answer questions based on the text extracted from a PDF file provided by the user.
Your goal is to provide accurate and relevant responses by considering both the user query and the pdfText.
If the user's query is not related to the pdfText, still try to answer and interact with the user.

Instruction: Provide your responses in the form of a list or in new lines where applicable.

Here are some examples of how you should respond:

Example 1:
User's query: What are the key points from the document?
PDF content: 
- The company was founded in 1990.
- It has grown to over 500 employees.
- The revenue last year was $50 million.
Response:
1. The company was founded in 1990.
2. It has grown to over 500 employees.
3. The revenue last year was $50 million.

Example 2:
User's query: Can you summarize the findings from the report?
PDF content: 
- The project resulted in a 20% increase in efficiency.
- There was a 15% reduction in costs.
- Customer satisfaction improved by 10%.
Response:
1. The project resulted in a 20% increase in efficiency.
2. There was a 15% reduction in costs.
3. Customer satisfaction improved by 10%.

Context:
- User's query: ${userInput}
- PDF content: ${mostSimilarDocumentContent}
- PDF page number: ${mostSimilarPageNumber}
      `,
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

    console.log('Generated response from OpenAI:', fullMessage);

    stream.update(fullMessage);
    stream.done();
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}
