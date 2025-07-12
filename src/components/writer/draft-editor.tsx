'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, TextInput, Textarea, Button, Group, Badge, Stack, ActionIcon, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconRobot, IconLocation, IconFileText } from '@tabler/icons-react';
import { Draft, DraftSection } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { AnalyticsTracker } from '@/lib/analytics-tracker';
import { useFeatureAnalytics } from '@/hooks/use-analytics';
import { notifications } from '@mantine/notifications';

interface DraftEditorProps {
  draft?: Draft;
  onSave?: (draftData: any) => void;
  onAIAssist?: (prompt: string) => Promise<string>;
}

export function DraftEditor({ draft, onSave, onAIAssist }: DraftEditorProps) {
  const { user } = useAuth();
  const { trackFeature, trackError } = useFeatureAnalytics();
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  const form = useForm({
    initialValues: {
      title: draft?.title || '',
      content: '',
    },
  });

  // Auto-save functionality dengan analytics tracking
  const autoSave = useCallback(
    async (values: any) => {
      if (!user?.id || !values.title.trim()) return;

      try {
        setSaving(true);

        const currentWordCount = calculateWordCount(values.content);
        setWordCount(currentWordCount);

        // Save draft logic here...
        await onSave?.(values);

        // Track analytics - Writer Module
        await AnalyticsTracker.trackDraftSave(user.id, draft?.id || 'new-draft', currentWordCount);

        trackFeature('draft_auto_save', {
          draftId: draft?.id,
          wordCount: currentWordCount,
          titleLength: values.title.length,
          hasContent: values.content.length > 0,
        });

        setLastSaveTime(new Date());
      } catch (error) {
        trackError('draft_save_failed', error instanceof Error ? error.message : 'Unknown error', {
          draftId: draft?.id,
          wordCount: calculateWordCount(values.content),
        });
      } finally {
        setSaving(false);
      }
    },
    [user?.id, draft?.id, onSave, trackFeature, trackError],
  );

  // Auto-save setiap 30 detik jika ada perubahan
  useEffect(() => {
    const interval = setInterval(() => {
      const values = form.values;
      if (values.title.trim() || values.content.trim()) {
        autoSave(values);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoSave, form.values]);

  const calculateWordCount = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleManualSave = async () => {
    const values = form.values;
    await autoSave(values);

    notifications.show({
      title: 'Saved',
      message: 'Draft saved successfully',
      color: 'green',
    });
  };

  const handleAIAssistance = async () => {
    if (!onAIAssist || !user?.id) return;

    const prompt = form.values.content || form.values.title;
    if (!prompt.trim()) {
      notifications.show({
        title: 'AI Assistance',
        message: 'Please add some content first',
        color: 'orange',
      });
      return;
    }

    try {
      setAiLoading(true);

      // Track AI assistance request
      await AnalyticsTracker.trackAIAssistance(user.id, draft?.id || 'new-draft', 'content_generation', prompt.length);

      trackFeature('ai_assistance_requested', {
        promptLength: prompt.length,
        draftId: draft?.id,
        assistanceType: 'content_generation',
      });

      const aiResponse = await onAIAssist(prompt);

      // Append AI response to content
      form.setFieldValue('content', form.values.content + '\n\n' + aiResponse);

      // Update word count
      const newWordCount = calculateWordCount(form.values.content + '\n\n' + aiResponse);
      setWordCount(newWordCount);

      trackFeature('ai_assistance_applied', {
        responseLength: aiResponse.length,
        newWordCount,
        draftId: draft?.id,
      });

      notifications.show({
        title: 'AI Assistance',
        message: 'Content generated successfully',
        color: 'blue',
      });
    } catch (error) {
      trackError('ai_assistance_failed', error instanceof Error ? error.message : 'Unknown error', {
        promptLength: prompt.length,
        draftId: draft?.id,
      });

      notifications.show({
        title: 'AI Error',
        message: 'Failed to generate content',
        color: 'red',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddCitation = () => {
    const citationText = '[Citation needed]';
    const currentContent = form.values.content;
    form.setFieldValue('content', currentContent + ' ' + citationText);

    // Track citation addition
    if (user?.id) {
      AnalyticsTracker.trackCitationAdd(user.id, draft?.id || 'new-draft', 'manual');
      trackFeature('citation_added', {
        draftId: draft?.id,
        citationType: 'manual',
        contentLength: currentContent.length,
      });
    }
  };

  // Track content changes for typing behavior analysis
  const handleContentChange = (value: string) => {
    form.setFieldValue('content', value);
    const newWordCount = calculateWordCount(value);
    setWordCount(newWordCount);

    // Track significant content changes (every 50 words)
    if (user?.id && newWordCount > 0 && newWordCount % 50 === 0) {
      trackFeature('writing_milestone', {
        wordCount: newWordCount,
        draftId: draft?.id,
        writingSession: Date.now(),
      });
    }
  };

  return (
    <Card withBorder shadow="sm" radius="md" p="lg">
      <Stack gap="md">
        {/* Header dengan analytics info */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconFileText size={20} color="var(--mantine-color-green-6)" />
            <Badge color="green" variant="light">
              Writer Module
            </Badge>
            {wordCount > 0 && (
              <Badge color="blue" variant="outline" size="sm">
                {wordCount} words
              </Badge>
            )}
          </Group>

          <Group gap="xs">
            {lastSaveTime && (
              <Badge color="gray" variant="light" size="sm">
                Saved: {lastSaveTime.toLocaleTimeString()}
              </Badge>
            )}
            {saving && (
              <Badge color="orange" variant="light" size="sm">
                Saving...
              </Badge>
            )}
          </Group>
        </Group>

        {/* Form */}
        <form onSubmit={form.onSubmit(handleManualSave)}>
          <Stack gap="md">
            <TextInput label="Draft Title" placeholder="Enter your draft title..." {...form.getInputProps('title')} leftSection={<IconFileText size={16} />} />

            <Textarea label="Content" placeholder="Start writing your content here..." minRows={10} maxRows={20} autosize value={form.values.content} onChange={(event) => handleContentChange(event.currentTarget.value)} />

            {/* Action buttons */}
            <Group gap="md">
              <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={saving} variant="filled">
                Save Draft
              </Button>

              <Button leftSection={<IconRobot size={16} />} onClick={handleAIAssistance} loading={aiLoading} variant="light" color="blue">
                AI Assist
              </Button>

              <ActionIcon variant="light" color="violet" size="lg" onClick={handleAddCitation} title="Add Citation">
                <IconLocation size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </form>

        {/* Analytics debug info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card withBorder p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Text size="xs" c="gray.6">
              Analytics Tracking: Draft editing, AI assistance, citations, word count milestones
            </Text>
          </Card>
        )}
      </Stack>
    </Card>
  );
}
