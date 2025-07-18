// src/components/assignment/assignment-form.tsx
// Update untuk mendukung eksperimen kelas sesuai permintaan Pak Rio
'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Group, Title, TextInput, Textarea, NumberInput, Button, Switch, Divider, FileInput, Alert, Text, Checkbox, Badge } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconFile, IconCalendar, IconCheck, IconAlertCircle, IconUsers, IconRefresh, IconInfoCircle } from '@tabler/icons-react';
import { uploadFile } from '@/lib/services/storage.service';
import { AssignmentService } from '@/lib/services/assignment.service';
import { useAuth } from '@/providers/auth-provider'; // DIRECT IMPORT DARI PROVIDER
import { supabase } from '@/lib/supabase';
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
      // UPDATE: Default target_classes sesuai eksperimen kelas
      target_classes: assignment?.target_classes || [], // Kosong untuk manual selection
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
      // UPDATE: Validasi target kelas untuk eksperimen
      target_classes: (value) => (!value || value.length === 0 ? 'Pilih minimal satu kelas target' : null),
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

  // Trigger form validation when target_classes changes
  useEffect(() => {
    form.validate();
  }, [form.values.target_classes, form.values.title, form.values.description, form.values.assignment_code]);

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

  // UPDATE: Handler untuk target kelas eksperimen
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

    // Validasi user ID
    if (!user?.id) {
      notifications.show({
        title: 'Error',
        message: 'User tidak valid. Silakan login ulang.',
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

      // Fix: Convert null to undefined untuk compatibility dan handle date dengan aman
      const assignmentData = {
        title: values.title,
        description: values.description,
        week_number: values.week_number,
        assignment_code: values.assignment_code,
        file_url: fileUrl || undefined, // Convert null to undefined
        file_name: fileName || undefined, // Convert null to undefined
        due_date: values.due_date && values.due_date instanceof Date ? values.due_date.toISOString() : undefined, // Safe date handling
        is_active: values.is_active,
        target_classes: values.target_classes, // Target kelas untuk eksperimen
        created_by: user.id, // Pastikan user.id valid
      };

      // Debug log untuk troubleshoot
      console.log('User info:', {
        id: user?.id,
        email: user?.email,
        role: user?.role,
      });
      console.log('Assignment data:', assignmentData);

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
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Terjadi kesalahan',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Title order={3}>{assignment ? 'Edit Assignment' : 'Buat Assignment Baru'}</Title>

          {/* Basic Info */}
          <TextInput label="Judul Assignment" placeholder="Masukkan judul assignment" required {...form.getInputProps('title')} />

          <Textarea label="Deskripsi" placeholder="Jelaskan detail assignment ini" required minRows={3} {...form.getInputProps('description')} />

          <Group grow>
            <NumberInput label="Minggu" placeholder="1" min={1} max={20} required {...form.getInputProps('week_number')} />

            {/* Assignment Code dengan generator */}
            <div>
              <Group mb={8}>
                <Text component="label" size="sm" fw={500}>
                  Assignment Code *
                </Text>
                <Button size="xs" variant="light" leftSection={<IconRefresh size={12} />} onClick={generateRandomCode}>
                  Generate
                </Button>
              </Group>

              <TextInput placeholder="Contoh: A1B2" value={form.values.assignment_code} onChange={(e) => handleCodeChange(e.target.value)} error={form.errors.assignment_code || codeError} required />

              {form.values.assignment_code && !codeError && !form.errors.assignment_code && (
                <Text size="xs" c="green" mt={2}>
                  <IconCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Code tersedia
                </Text>
              )}
            </div>
          </Group>

          {/* UPDATE: Target Classes untuk Eksperimen Kelas */}
          <div>
            <Group mb={8}>
              <IconUsers size={16} />
              <Text component="label" size="sm" fw={500}>
                Target Kelas untuk Eksperimen *
              </Text>
            </Group>

            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mb="xs">
              <Text size="xs">
                <strong>Program Eksperimen Kelas:</strong> Pilih kelas mana yang dapat mengakses assignment ini. Anda dapat memilih Kelas A saja, Kelas B saja, atau kedua kelas.
              </Text>
            </Alert>

            <Checkbox.Group value={form.values.target_classes} onChange={handleTargetClassesChange} error={form.errors.target_classes}>
              <Stack gap="xs">
                <Checkbox value="A" label="Kelas A - Grup Eksperimen 1" />
                <Checkbox value="B" label="Kelas B - Grup Eksperimen 2" />
              </Stack>
            </Checkbox.Group>

            {/* Preview target kelas yang dipilih */}
            {form.values.target_classes.length > 0 && (
              <Alert icon={<IconAlertCircle size={16} />} color="green" variant="light" mt="xs">
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    Assignment akan terlihat untuk:
                  </Text>
                  {form.values.target_classes.map((cls) => (
                    <Badge key={cls} color={cls === 'A' ? 'green' : 'orange'} variant="light">
                      Kelas {cls}
                    </Badge>
                  ))}
                </Group>
                {form.values.target_classes.length === 2 && (
                  <Text size="xs" c="gray.6" mt={4}>
                    Assignment ini akan muncul di kedua kelas eksperimen
                  </Text>
                )}
              </Alert>
            )}
          </div>

          {/* Deadline */}
          <DateTimePicker label="Deadline (Opsional)" placeholder="Pilih tanggal dan waktu deadline" leftSection={<IconCalendar size={16} />} clearable {...form.getInputProps('due_date')} />

          <Divider label="File Assignment (Opsional)" labelPosition="left" />

          {/* Current file info */}
          {assignment?.file_url && (
            <Alert icon={<IconFile size={16} />} color="blue" variant="light">
              File saat ini: <strong>{assignment.file_name}</strong>
              <Text size="xs" mt={4}>
                Upload file baru untuk mengganti file yang ada
              </Text>
            </Alert>
          )}

          {/* File upload */}
          <FileInput label="Upload File Assignment" placeholder="Pilih file (PDF, DOC, DOCX, max 10MB)" leftSection={<IconFile size={16} />} accept=".pdf,.doc,.docx,.txt" value={file} onChange={setFile} disabled={uploadingFile} />

          {/* Status toggle */}
          <Switch label="Assignment Aktif" description="Assignment akan terlihat oleh mahasiswa di kelas target ketika aktif" {...form.getInputProps('is_active', { type: 'checkbox' })} />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="xl">
            <Button variant="light" onClick={onCancel} disabled={loading || uploadingFile}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={loading || uploadingFile}
              disabled={!form.isValid() || codeError !== null || !form.values.title.trim() || !form.values.description.trim() || !form.values.assignment_code.trim() || form.values.target_classes.length === 0}
            >
              {assignment ? 'Update Assignment' : 'Buat Assignment'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
