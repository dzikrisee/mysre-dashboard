'use client';

import { useState } from 'react';
import { Card, Text, Group, ActionIcon, Badge, Menu } from '@mantine/core';
import { IconDots, IconEdit, IconTrash, IconBrain } from '@tabler/icons-react';
import { Node } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { AnalyticsTracker } from '@/lib/analytics-tracker';
import { useFeatureAnalytics } from '@/hooks/use-analytics';

interface NodeComponentProps {
  node: Node;
  onEdit?: (node: Node) => void;
  onDelete?: (nodeId: string) => void;
  onClick?: (node: Node) => void;
}

export function NodeComponent({ node, onEdit, onDelete, onClick }: NodeComponentProps) {
  const { user } = useAuth();
  const { trackFeature } = useFeatureAnalytics();
  const [isHovered, setIsHovered] = useState(false);

  const handleNodeClick = async () => {
    // Original click logic
    onClick?.(node);

    // Track analytics - Brain Module
    if (user?.id) {
      try {
        await AnalyticsTracker.trackNodeClick(user.id, node.id, node.type, node.articleId);
        trackFeature('node_interaction', {
          nodeType: node.type,
          nodeId: node.id,
          hasContent: !!node.content,
          interactionType: 'click',
        });
      } catch (error) {
        console.error('Failed to track node click:', error);
      }
    }
  };

  const handleNodeHover = () => {
    setIsHovered(true);

    // Track hover analytics (optional, untuk detailed behavior analysis)
    if (user?.id) {
      trackFeature('node_hover', {
        nodeType: node.type,
        nodeId: node.id,
      });
    }
  };

  const handleEdit = () => {
    onEdit?.(node);

    // Track edit action
    if (user?.id) {
      trackFeature('node_edit_attempt', {
        nodeType: node.type,
        nodeId: node.id,
      });
    }
  };

  return (
    <Card
      withBorder
      shadow={isHovered ? 'md' : 'sm'}
      radius="md"
      p="md"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'none',
      }}
      onClick={handleNodeClick}
      onMouseEnter={handleNodeHover}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <IconBrain size={16} color="var(--mantine-color-violet-6)" />
          <Badge color="violet" variant="light" size="sm">
            {node.type}
          </Badge>
        </Group>

        <Menu shadow="md" width={150}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEdit size={14} />} onClick={handleEdit}>
              Edit
            </Menu.Item>
            <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete?.(node.id)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Text fw={600} size="sm" mb="xs" lineClamp={2}>
        {node.label}
      </Text>

      {node.title && (
        <Text size="xs" c="gray.6" mb="xs" lineClamp={1}>
          {node.title}
        </Text>
      )}

      {node.content && (
        <Text size="xs" c="gray.7" lineClamp={3}>
          {node.content}
        </Text>
      )}

      {/* Analytics badge untuk development/debugging */}
      {process.env.NODE_ENV === 'development' && (
        <Badge size="xs" color="gray" variant="outline" mt="xs">
          Tracked: Node Click
        </Badge>
      )}
    </Card>
  );
}
