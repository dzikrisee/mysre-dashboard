// src/components/assignment/assignment-form.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { Stack, TextInput, Textarea, NumberInput, Button, Group, Switch, FileInput, Alert, Text, Title, Divider, Box } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconFile, IconCalendar, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { AssignmentService } from '@/lib/services/assignment.service';
import { Assignment, AssignmentInsert, AssignmentUpdate } from '@/lib/types/assignment';
import { notifications } from '@mantine/notifications';

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
    },
    validate: {
      title: (value) => (value.trim().length < 3 ? 'Judul minimal 3 karakter' : null),
      description: (value) => (value.trim().length < 10 ? 'Deskripsi minimal 10 karakter' : null),
      week_number: (value) => (value < 1 || value > 20 ? 'Minggu harus antara 1-20' : null),
      assignment_code: (value) => {
        if (!/^[A-Z0-9]{3,4}$/.test(value)) {
          return 'Code harus 3-4 karakter huruf/angka kapital';
        }
        return null;
      },
    },
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldValue('assignment_code', result);
    checkCodeExists(result);
  };

  const checkCodeExists = async (code: string) => {
    if (code.length < 3) return;

    try {
      const result = await AssignmentService.checkAssignmentCodeExists(code, assignment?.id);
      if (result.exists) {
        setCodeError('Code sudah digunakan, silakan gunakan code lain');
      } else {
        setCodeError(null);
      }
    } catch (error) {
      console.error('Error checking code:', error);
    }
  };

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    form.setFieldValue('assignment_code', upperValue);
    if (upperValue.length >= 3) {
      checkCodeExists(upperValue);
    } else {
      setCodeError(null);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string } | null> => {
    if (!file) return null;

    setUploadingFile(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `assignments/${fileName}`;

      const result = await AssignmentService.uploadAssignmentFile(file, filePath);

      if (result.error) {
        notifications.show({
          title: 'Error Upload',
          message: result.error,
          color: 'red',
        });
        return null;
      }

      return {
        url: result.data?.url || '',
        name: file.name,
      };
    } catch (error) {
      console.error('Upload error:', error);
      notifications.show({
        title: 'Error Upload',
        message: 'Gagal mengupload file',
        color: 'red',
      });
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  // FIXED: Safe date handling function
  const formatDueDate = (date: any): string | null => {
    if (!date) return null;

    try {
      // If it's already a Date object
      if (date instanceof Date) {
        return date.toISOString();
      }

      // If it's a string, try to convert to Date
      if (typeof date === 'string') {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString();
        }
      }

      // If it's a timestamp number
      if (typeof date === 'number') {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString();
        }
      }

      console.warn('Invalid date format:', date);
      return null;
    } catch (error) {
      console.error('Date formatting error:', error);
      return null;
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (codeError) {
      notifications.show({
        title: 'Error',
        message: 'Perbaiki error yang ada sebelum submit',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      let fileUrl = assignment?.file_url || null;
      let fileName = assignment?.file_name || null;

      // Upload file if new file selected
      if (file) {
        const uploadResult = await uploadFile(file);
        if (uploadResult) {
          fileUrl = uploadResult.url;
          fileName = uploadResult.name;
        } else {
          // If upload failed, stop the process
          setLoading(false);
          return;
        }
      }

      // FIXED: Safe due_date handling
      const formattedDueDate = formatDueDate(values.due_date);

      const data = {
        ...values,
        due_date: formattedDueDate,
        file_url: fileUrl,
        file_name: fileName,
        created_by: user?.id || '',
      };

      let result;
      if (assignment) {
        // Update existing assignment
        const updateData: AssignmentUpdate = { ...data };
        delete (updateData as any).created_by;
        result = await AssignmentService.updateAssignment(assignment.id, updateData);
      } else {
        // Create new assignment
        result = await AssignmentService.createAssignment(data as AssignmentInsert);
      }

      if (result.error) {
        notifications.show({
          title: 'Error',
          message: result.error,
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Berhasil',
          message: assignment ? 'Assignment berhasil diupdate' : 'Assignment berhasil dibuat',
          color: 'green',
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Submit error:', error);
      notifications.show({
        title: 'Error',
        message: 'Terjadi kesalahan saat menyimpan',
        color: 'red',
      });
    } finally {
      setLoading(false);
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
