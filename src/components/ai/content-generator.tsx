// src/components/ai/content-generator.tsx
'use client';

import { useState } from 'react';
import { Stack, TextInput, Textarea, Button, Select, Paper, Text, Alert, Group, Badge } from '@mantine/core';
import { IconWand, IconCoin, IconFileText } from '@tabler/icons-react';
import { useBilling } from '@/hooks/use-billing';

// Add proper types
type LengthType = 'short' | 'medium' | 'long';
type ContentType = 'article' | 'summary' | 'outline' | 'research';
type TierType = 'basic' | 'pro' | 'enterprise';

export function ContentGenerator() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>('article');
  const [length, setLength] = useState<LengthType>('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { recordTokenUsage, currentBalance, tier, isRecording } = useBilling();

  const estimateTokens = () => {
    const baseTokens: Record<LengthType, number> = {
      short: 200,
      medium: 500,
      long: 1000,
    };

    const typeMultiplier: Record<ContentType, number> = {
      article: 1.2,
      summary: 0.8,
      outline: 0.6,
      research: 1.5,
    };

    return Math.ceil(baseTokens[length] * typeMultiplier[contentType]);
  };

  const estimatedTokens = estimateTokens();
  const tierPricing: Record<TierType, number> = {
    basic: 0.000002,
    pro: 0.0000015,
    enterprise: 0.000001,
  };
  const estimatedCost = estimatedTokens * tierPricing[tier as TierType];

  const generateContent = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const result = await simulateContentGeneration(topic, contentType, length);

      await recordTokenUsage('content_generation', result.tokensUsed, `content_${contentType}_${Date.now()}`, {
        topic: topic,
        content_type: contentType,
        length: length,
        output_length: result.content.length,
      });

      setGeneratedContent(result.content);
    } catch (error) {
      console.error('Content generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = currentBalance >= estimatedTokens && topic.trim();

  return (
    <Stack gap="md">
      {/* Cost Estimation */}
      <Paper withBorder p="md">
        <Group justify="space-between" mb="sm">
          <Text size="sm" fw={500}>
            Estimated Cost
          </Text>
          <Badge color={tier === 'enterprise' ? 'grape' : tier === 'pro' ? 'blue' : 'gray'}>{tier.toUpperCase()}</Badge>
        </Group>
        <Group gap="md">
          <Group gap="xs">
            <IconCoin size={16} />
            <Text size="sm">{estimatedTokens} tokens</Text>
          </Group>
          <Text size="sm" c="green">
            ≈ ${estimatedCost.toFixed(6)}
          </Text>
        </Group>
        {currentBalance < estimatedTokens && (
          <Alert color="red" mt="sm">
            Insufficient token balance! Need {estimatedTokens}, have {currentBalance}
          </Alert>
        )}
      </Paper>

      {/* Input Form */}
      <Stack gap="sm">
        <TextInput label="Topic" placeholder="Enter the topic you want to generate content about" value={topic} onChange={(e) => setTopic(e.target.value)} />

        <Group grow>
          <Select
            label="Content Type"
            value={contentType}
            onChange={(value) => setContentType((value as ContentType) || 'article')}
            data={[
              { value: 'article', label: 'Article' },
              { value: 'summary', label: 'Summary' },
              { value: 'outline', label: 'Outline' },
              { value: 'research', label: 'Research Notes' },
            ]}
          />

          <Select
            label="Length"
            value={length}
            onChange={(value) => setLength((value as LengthType) || 'medium')}
            data={[
              { value: 'short', label: 'Short (~200 tokens)' },
              { value: 'medium', label: 'Medium (~500 tokens)' },
              { value: 'long', label: 'Long (~1000 tokens)' },
            ]}
          />
        </Group>

        <Button onClick={generateContent} loading={isGenerating || isRecording} disabled={!canGenerate} leftSection={<IconWand size={16} />} fullWidth>
          Generate Content ({estimatedTokens} tokens)
        </Button>
      </Stack>

      {/* Generated Content */}
      {generatedContent && (
        <Paper withBorder p="md">
          <Group gap="sm" mb="md">
            <IconFileText size={20} />
            <Text size="lg" fw={500}>
              Generated Content
            </Text>
          </Group>
          <Textarea value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)} minRows={10} autosize />
        </Paper>
      )}
    </Stack>
  );
}

// Mock content generation function
async function simulateContentGeneration(topic: string, type: ContentType, length: LengthType) {
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));

  const baseTokens: Record<LengthType, number> = {
    short: 200,
    medium: 500,
    long: 1000,
  };

  const actualTokens = baseTokens[length] + Math.floor(Math.random() * 100) - 50;

  const content = `# ${topic}\n\nThis is a simulated ${type} about ${topic}. In a real implementation, this would be generated by your AI service.\n\n## Introduction\n\nThe topic of ${topic} is fascinating and worth exploring in detail. This ${length} ${type} covers the key aspects you need to know.\n\n## Main Content\n\nHere would be the main content generated by the AI, tailored to your specific requirements for a ${type} of ${length} length.\n\n## Conclusion\n\nThis simulated content demonstrates how the billing system tracks token usage for content generation features.\n\n---\n\n*Generated using ${actualTokens} tokens*`;

  return {
    content,
    tokensUsed: actualTokens,
  };
}
