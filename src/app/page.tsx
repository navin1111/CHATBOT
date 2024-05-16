'use client';

import { useState } from 'react';
import { Message, continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';
import { Button } from '@/components/ui/button';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
  display: flex;
  margin-bottom: 100px;
  margin-top: 50px;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #333; /* Set background color to dark mode */
  color: #fff; /* Set text color to white */
  padding: 20px; /* Add padding for better spacing */
`;

const Heading = styled.h1`
  margin-top: 50px;
  margin-bottom: 50px;
  font-weight: bold; /* Make the heading bold */
  font-family: 'Arial', sans-serif; /* Change font family */
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* Center align the messages */
  margin-bottom: 250px;
`;

const MessageBubble = styled.div`
  background-color: #555; /* Set message bubble color */
  color: #fff; /* Set text color to white */
  padding: 10px 20px;
  border-radius: 20px; /* Add border radius for rounded corners */
  margin-bottom: 10px; /* Add margin between messages */
  max-width: 80%; /* Limit maximum width of message bubble */
  text-align: left; /* Align text to the left */
`;

const InputContainer = styled.div`
  margin-top: 50px;
`;

const StyledInput = styled.input`
  padding: 15px;
  margin-right: 20px;
  border-radius: 10px;
  border: none;
  background-color: #444; /* Set input field background color */
  color: #fff; /* Set text color to white */
  font-size: 16px; /* Set font size */
`;

const StyledButton = styled(Button)`
  background-color: #007bff;
  color: #fff;
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
`;

// Define the Home component
export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  // Function to handle sending messages
  const sendMessage = async () => {
    const { messages, newMessage } = await continueConversation([
      ...conversation,
      { role: 'user', content: input },
    ]);

    let textContent = '';

    for await (const delta of readStreamableValue(newMessage)) {
      textContent = `${textContent}${delta}`;

      setConversation([...messages, { role: 'assistant', content: textContent }]);
    }
  };

  // Render the Home component
  return (
    <Container>
      <Heading>WELCOME TO THE CHATBOT</Heading>
      <MessageContainer>
        {conversation.map((message, index) => (
          <MessageBubble key={index}>{message.role}: {message.content}</MessageBubble>
        ))}
      </MessageContainer>

      <InputContainer>
        <StyledInput
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          placeholder="Type your message here"
        />

        <StyledButton onClick={sendMessage}>Send Message</StyledButton>
      </InputContainer>
    </Container>
  );
}
