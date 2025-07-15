'use client';

import { useState } from 'react';
import { TextInput, Button, Paper, Stack, Text, Alert, Progress, Group, Badge } from '@mantine/core';
import { IconRobot, IconCoin, IconAlertTriangle } from '@tabler/icons-react';
import { useBilling } from '@/hooks/use-billing';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  cost?: number;
}

export function AIChatComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { recordTokenUsage, currentBalance, monthlyLimit, tier, isRecording } = useBilling();

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI API call
      const response = await simulateAICall(input);

      // Record token usage
      await recordTokenUsage('ai_chat', response.tokensUsed, `chat_session_${Date.now()}`, {
        model: response.model,
        user_message_length: input.length,
        response_length: response.content.length,
        conversation_length: messages.length + 1,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
        tokens: response.tokensUsed,
        cost: response.cost,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const balancePercentage = (currentBalance / monthlyLimit) * 100;
  const isLowBalance = balancePercentage < 20;

  return (
    <Stack gap="md">
      {/* Token Balance Header */}
      <Paper withBorder p="md">
        <Group justify="space-between">
          <Group gap="sm">
            <IconCoin size={20} />
            <div>
              <Text size="sm" fw={500}>
                Token Balance
              </Text>
              <Text size="xs" c="gray.6">
                {currentBalance.toLocaleString()} / {monthlyLimit.toLocaleString()}
              </Text>
            </div>
          </Group>
          <Badge color={tier === 'enterprise' ? 'grape' : tier === 'pro' ? 'blue' : 'gray'}>{tier.toUpperCase()}</Badge>
        </Group>
        <Progress value={balancePercentage} size="sm" mt="xs" color={isLowBalance ? 'red' : balancePercentage < 50 ? 'orange' : 'green'} />
        {isLowBalance && (
          <Alert icon={<IconAlertTriangle size={16} />} color="orange" mt="sm">
            Token balance is running low! Consider upgrading your plan.
          </Alert>
        )}
      </Paper>

      {/* Chat Messages */}
      <Paper withBorder p="md" style={{ minHeight: '400px', maxHeight: '600px', overflowY: 'auto' }}>
        <Stack gap="md">
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              <Paper p="sm" bg={message.role === 'user' ? 'blue.0' : 'gray.0'} style={{ borderRadius: '12px' }}>
                <Text size="sm">{message.content}</Text>
                {message.tokens && (
                  <Text size="xs" c="gray.6" mt="xs">
                    {message.tokens} tokens • ${message.cost?.toFixed(6)}
                  </Text>
                )}
              </Paper>
            </div>
          ))}
          {isLoading && (
            <Paper p="sm" bg="gray.0" style={{ borderRadius: '12px' }}>
              <Text size="sm" c="gray.6">
                AI is thinking...
              </Text>
            </Paper>
          )}
        </Stack>
      </Paper>

      {/* Input */}
      <Group gap="sm">
        <TextInput flex={1} placeholder="Type your message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} disabled={isLoading || isRecording || isLowBalance} />
        <Button onClick={sendMessage} loading={isLoading || isRecording} disabled={!input.trim() || isLowBalance} leftSection={<IconRobot size={16} />}>
          Send
        </Button>
      </Group>
    </Stack>
  );
}

// Mock AI API call function
async function simulateAICall(message: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

  const baseTokens = 50;
  const messageTokens = Math.ceil(message.length / 4);
  const responseTokens = Math.floor(Math.random() * 150) + 50;
  const totalTokens = baseTokens + messageTokens + responseTokens;

  const cost = totalTokens * 0.000002;

  const responses = [
    'I understand your question. Let me provide a comprehensive answer based on the latest research and best practices.',
    "That's an interesting point. Here's what I think about that topic...",
    'Based on my analysis, I can suggest several approaches to solve this problem.',
  ];

  return {
    content: responses[Math.floor(Math.random() * responses.length)],
    tokensUsed: totalTokens,
    cost: cost,
    model: 'gpt-4-simulated',
  };
}
