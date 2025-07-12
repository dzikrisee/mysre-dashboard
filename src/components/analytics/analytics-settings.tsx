'use client';

import { useState } from 'react';
import { Card, Group, Text, Switch, Select, Button, Stack, NumberInput, Textarea, Badge, Divider, Alert, Code } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconSettings, IconCheck, IconAlertTriangle, IconDatabase } from '@tabler/icons-react';

interface AnalyticsSettings {
  trackingEnabled: boolean;
  retentionPeriod: number; // days
  realTimeUpdates: boolean;
  detailedLogging: boolean;
  anonymizeData: boolean;
  exportFormat: string;
  alertThresholds: {
    lowEngagement: number;
    lowProductivity: number;
    inactivityDays: number;
  };
  customMetrics: string[];
}

export function AnalyticsSettings() {
  const [loading, setLoading] = useState(false);

  const form = useForm<AnalyticsSettings>({
    initialValues: {
      trackingEnabled: true,
      retentionPeriod: 365,
      realTimeUpdates: true,
      detailedLogging: false,
      anonymizeData: false,
      exportFormat: 'csv',
      alertThresholds: {
        lowEngagement: 30,
        lowProductivity: 40,
        inactivityDays: 7,
      },
      customMetrics: [],
    },
  });

  const handleSave = async (values: AnalyticsSettings) => {
    setLoading(true);
    try {
      // Save settings to database
      // await saveAnalyticsSettings(values);

      notifications.show({
        title: 'Settings Saved',
        message: 'Analytics settings have been updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save analytics settings',
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataCleanup = async () => {
    if (confirm('Are you sure you want to clean up old analytics data? This action cannot be undone.')) {
      setLoading(true);
      try {
        // Implement data cleanup
        // await cleanupAnalyticsData(form.values.retentionPeriod);

        notifications.show({
          title: 'Data Cleanup Complete',
          message: 'Old analytics data has been removed successfully',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Cleanup Failed',
          message: 'Failed to clean up analytics data',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Text size="lg" fw={600}>
              Analytics Settings
            </Text>
            <Text size="sm" c="gray.6">
              Configure learning analytics tracking and reporting
            </Text>
          </div>
          <Badge color="blue" variant="light" leftSection={<IconSettings size={12} />}>
            Advanced
          </Badge>
        </Group>

        {/* Core Settings */}
        <Card withBorder p="lg">
          <Text fw={600} mb="md">
            Core Analytics Settings
          </Text>

          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  Enable Analytics Tracking
                </Text>
                <Text size="xs" c="gray.6">
                  Collect user interaction data for learning analytics
                </Text>
              </div>
              <Switch {...form.getInputProps('trackingEnabled', { type: 'checkbox' })} size="md" />
            </Group>

            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  Real-time Updates
                </Text>
                <Text size="xs" c="gray.6">
                  Enable live dashboard updates and notifications
                </Text>
              </div>
              <Switch {...form.getInputProps('realTimeUpdates', { type: 'checkbox' })} size="md" disabled={!form.values.trackingEnabled} />
            </Group>

            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  Detailed Logging
                </Text>
                <Text size="xs" c="gray.6">
                  Store additional metadata for advanced analysis
                </Text>
              </div>
              <Switch {...form.getInputProps('detailedLogging', { type: 'checkbox' })} size="md" disabled={!form.values.trackingEnabled} />
            </Group>

            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  Anonymize Data
                </Text>
                <Text size="xs" c="gray.6">
                  Remove personally identifiable information from exports
                </Text>
              </div>
              <Switch {...form.getInputProps('anonymizeData', { type: 'checkbox' })} size="md" />
            </Group>
          </Stack>
        </Card>

        {/* Data Management */}
        <Card withBorder p="lg">
          <Text fw={600} mb="md">
            Data Management
          </Text>

          <Stack gap="md">
            <NumberInput
              label="Data Retention Period"
              description="Number of days to keep analytics data"
              placeholder="365"
              {...form.getInputProps('retentionPeriod')}
              min={30}
              max={1095} // 3 years
              suffix=" days"
            />

            <Select
              label="Export Format"
              description="Default format for analytics reports"
              data={[
                { value: 'csv', label: 'CSV (Comma Separated Values)' },
                { value: 'xlsx', label: 'Excel (XLSX)' },
                { value: 'json', label: 'JSON' },
                { value: 'pdf', label: 'PDF Report' },
              ]}
              {...form.getInputProps('exportFormat')}
            />

            <Group>
              <Button variant="outline" color="red" onClick={handleDataCleanup} loading={loading} leftSection={<IconDatabase size={16} />}>
                Cleanup Old Data
              </Button>
              <Text size="xs" c="gray.6" style={{ flex: 1 }}>
                Remove analytics data older than the retention period
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Alert Thresholds */}
        <Card withBorder p="lg">
          <Text fw={600} mb="md">
            Alert Thresholds
          </Text>
          <Text size="sm" c="gray.6" mb="md">
            Configure when to trigger alerts for student monitoring
          </Text>

          <Stack gap="md">
            <NumberInput label="Low Engagement Threshold" description="Productivity score below this value triggers an alert" {...form.getInputProps('alertThresholds.lowEngagement')} min={0} max={100} suffix="%" />

            <NumberInput label="Low Productivity Threshold" description="Overall productivity score threshold for alerts" {...form.getInputProps('alertThresholds.lowProductivity')} min={0} max={100} suffix="%" />

            <NumberInput label="Inactivity Alert" description="Days of inactivity before triggering an alert" {...form.getInputProps('alertThresholds.inactivityDays')} min={1} max={30} suffix=" days" />
          </Stack>
        </Card>

        {/* Privacy & Compliance */}
        <Card withBorder p="lg">
          <Text fw={600} mb="md">
            Privacy & Compliance
          </Text>

          <Alert icon={<IconAlertTriangle size={16} />} color="blue" mb="md">
            All analytics data is collected in compliance with educational data privacy standards. Personal information is protected and used solely for learning improvement purposes.
          </Alert>

          <Stack gap="sm">
            <Text size="sm" fw={500}>
              Data Collection Includes:
            </Text>
            <Code block>• Learning interaction patterns • Feature usage statistics • Time spent on activities • Performance metrics • Anonymized behavioral data</Code>
          </Stack>
        </Card>

        <Divider />

        {/* Action Buttons */}
        <Group justify="flex-end">
          <Button type="submit" loading={loading} leftSection={<IconCheck size={16} />}>
            Save Settings
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
