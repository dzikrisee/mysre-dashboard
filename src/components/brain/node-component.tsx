'use client';

import { useState } from 'react';
import { Card, Text, Group, ActionIcon, Badge, Menu } from '@mantine/core';
import { IconDots, IconEdit, IconTrash, IconBrain } from '@tabler/icons-react';
// REMOVED: import { Node } from '@/lib/supabase'; - This was causing the error
import { useAuth } from '@/providers/auth-provider';
import { AnalyticsTracker } from '@/lib/analytics-tracker';
import { useFeatureAnalytics } from '@/hooks/use-analytics';

// FIXED: Define Node interface locally
interface Node {
  id: string;
  type: string;
  content?: string;
  articleId?: string;
  position?: {
    x: number;
    y: number;
  };
  connections?: string[];
  created_at?: string;
  updated_at?: string;
}

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
        await AnalyticsTracker.trackNodeClick(user.id, node.id, node.type, node.articleId || '');
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

  const handleDelete = () => {
    if (onDelete) {
      onDelete(node.id);

      // Track delete action
      if (user?.id) {
        trackFeature('node_delete_attempt', {
          nodeType: node.type,
          nodeId: node.id,
        });
      }
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
            <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={handleDelete}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Text size="sm" lineClamp={3}>
        {node.content || 'No content'}
      </Text>

      {node.connections && node.connections.length > 0 && (
        <Text size="xs" c="gray.6" mt="xs">
          {node.connections.length} connection(s)
        </Text>
      )}
    </Card>
  );
}
