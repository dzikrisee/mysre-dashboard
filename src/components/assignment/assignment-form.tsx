// src/components/assignment/assignment-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Group, Title, TextInput, Textarea, NumberInput, Button, Switch, Divider, FileInput, Alert, Text, Chip, Checkbox, MultiSelect } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconFile, IconCalendar, IconCheck, IconAlertCircle, IconUsers } from '@tabler/icons-react';
import { uploadFile } from '@/lib/services/storage.service';
import { useAuth } from '@/hooks/useAuth';
import type { Assignment } from '@/lib/types/assignment';

interface AssignmentFormProps {
  assignment?: Assignment | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AssignmentForm({ assignment, onSuccess, onCancel }: AssignmentFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      title: assignment?.title || '',
      description: assignment?.description || '',
      week_number: assignment?.week_number || 1,
      assignment_code: assignment?.assignment_code || '',
      due_date: assignment?.due_date ? new Date(assignment.due_date) : null,
      is_active: assignment?.is_active ?? true,
      target_classes: assignment?.target_classes || ['A', 'B'], // Default kedua kelas
    },
    validate: {
      title: (value) => (!value ? 'Judul harus diisi' : null),
      description: (value) => (!value ? 'Deskripsi harus diisi' : null),
      week_number: (value) => (value < 1 || value > 20 ? 'Minggu harus antara 1-20' : null),
      assignment_code: (value) => {
        if (!value) return 'Assignment code harus diisi';
        if (value.length < 3 || value.length > 4) return 'Code harus 3-4 karakter';
        if (!/^[A-Z0-9]+$/.test(value)) return 'Code hanya boleh huruf besar dan angka';
        return null;
      },
      target_classes: (value) => (!value || value.length === 0 ? 'Pilih minimal satu kelas' : null),
    },
  });

  // Check assignment code availability
  useEffect(() => {
    const checkCode = async () => {
      if (form.values.assignment_code.length >= 3) {
        try {
          const exists = await AssignmentService.checkAssignmentCodeExists(form.values.assignment_code, assignment?.id);
          setCodeError(exists ? 'Code sudah digunakan' : null);
        } catch (error) {
          console.error('Error checking code:', error);
        }
      } else {
        setCodeError(null);
      }
    };

    const debounce = setTimeout(checkCode, 500);
    return () => clearTimeout(debounce);
  }, [form.values.assignment_code, assignment?.id]);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldValue('assignment_code', result);
  };

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (upperValue.length <= 4) {
      form.setFieldValue('assignment_code', upperValue);
    }
  };

  const handleTargetClassesChange = (classes: string[]) => {
    form.setFieldValue('target_classes', classes);
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (codeError) {
      notifications.show({
        title: 'Error',
        message: 'Assignment code sudah digunakan',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      let fileUrl = assignment?.file_url || null;
      let fileName = assignment?.file_name || null;

      // Upload file if selected
      if (file) {
        setUploadingFile(true);
        const uploadResult = await uploadFile(file, 'assignments');
        if (uploadResult.error) {
          throw new Error(uploadResult.error);
        }
        fileUrl = uploadResult.url;
        fileName = file.name;
        setUploadingFile(false);
      }

      const assignmentData = {
        title: values.title,
        description: values.description,
        week_number: values.week_number,
        assignment_code: values.assignment_code,
        file_url: fileUrl,
        file_name: fileName,
        due_date: values.due_date?.toISOString() || null,
        is_active: values.is_active,
        target_classes: values.target_classes,
        created_by: user?.id || '', // Use actual user ID
      };

      let result;
      if (assignment) {
        result = await AssignmentService.updateAssignment(assignment.id, assignmentData);
      } else {
        result = await AssignmentService.createAssignment(assignmentData);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      notifications.show({
        title: 'Berhasil',
        message: assignment ? 'Assignment berhasil diupdate' : 'Assignment berhasil dibuat',
        color: 'green',
      });
      onSuccess?.();
    } catch (error) {
      console.error('Submit error:', error);
      notifications.show({
        title: 'Error',
        message: 'Terjadi kesalahan saat menyimpan',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  return (
    <Box>
      <Title order={3} mb="md">
        {assignment ? 'Edit Assignment' : 'Buat Assignment Baru'}
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Basic Info */}
          <TextInput label="Judul Assignment" placeholder="Masukkan judul assignment..." required {...form.getInputProps('title')} />

          <Textarea label="Deskripsi" placeholder="Masukkan deskripsi assignment..." required minRows={3} maxRows={6} autosize {...form.getInputProps('description')} />

          <Group grow>
            <NumberInput label="Minggu Ke" placeholder="1" required min={1} max={20} {...form.getInputProps('week_number')} />

            <div>
              <Group mb={5}>
                <Text component="label" size="sm" fw={500}>
                  Assignment Code *
                </Text>
                <Button variant="subtle" size="xs" onClick={generateRandomCode} disabled={loading}>
                  Generate Random
                </Button>
              </Group>
              <TextInput placeholder="A1B2" required maxLength={4} value={form.values.assignment_code} onChange={(e) => handleCodeChange(e.target.value)} error={form.errors.assignment_code || codeError} />
              {!form.errors.assignment_code && !codeError && form.values.assignment_code.length >= 3 && (
                <Text size="xs" c="green" mt={2}>
                  <IconCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Code tersedia
                </Text>
              )}
            </div>
          </Group>

          {/* NEW: Target Classes Selection */}
          <div>
            <Group mb={8}>
              <IconUsers size={16} />
              <Text component="label" size="sm" fw={500}>
                Target Kelas *
              </Text>
            </Group>
            <Text size="xs" c="gray.6" mb={8}>
              Pilih kelas mana yang dapat mengakses assignment ini
            </Text>

            <Checkbox.Group value={form.values.target_classes} onChange={handleTargetClassesChange} error={form.errors.target_classes}>
              <Group>
                <Checkbox value="A" label="Kelas A" />
                <Checkbox value="B" label="Kelas B" />
              </Group>
            </Checkbox.Group>

            {form.values.target_classes.length > 0 && (
              <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light" mt="xs">
                Assignment akan terlihat untuk: <strong>Kelas {form.values.target_classes.join(' dan Kelas ')}</strong>
              </Alert>
            )}
          </div>

          <DateTimePicker label="Deadline (Opsional)" placeholder="Pilih tanggal dan waktu deadline" leftSection={<IconCalendar size={16} />} clearable {...form.getInputProps('due_date')} />

          <Divider label="File Assignment (Opsional)" labelPosition="left" />

          {assignment?.file_url && (
            <Alert icon={<IconFile size={16} />} color="blue" variant="light">
              File saat ini: <strong>{assignment.file_name}</strong>
              <Text size="xs" mt={4}>
                Upload file baru untuk mengganti file yang ada
              </Text>
            </Alert>
          )}

          <FileInput label="Upload File Assignment" placeholder="Pilih file (PDF, DOC, DOCX, max 10MB)" leftSection={<IconFile size={16} />} accept=".pdf,.doc,.docx,.txt" value={file} onChange={setFile} disabled={uploadingFile} />

          <Switch label="Assignment Aktif" description="Assignment akan terlihat oleh mahasiswa ketika aktif" {...form.getInputProps('is_active', { type: 'checkbox' })} />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="xl">
            <Button variant="light" onClick={onCancel} disabled={loading || uploadingFile}>
              Batal
            </Button>
            <Button type="submit" loading={loading || uploadingFile} disabled={!form.isValid() || codeError !== null}>
              {assignment ? 'Update Assignment' : 'Buat Assignment'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
