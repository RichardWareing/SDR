import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';

import { sdrValidationSchema } from '../utils/sdrValidation';
import { useSDRMutations } from '../hooks/useSDRMutations';
import { FileUpload } from './FileUpload';
import type { CreateSDRFormData } from '../types/sdr.types';

export const CreateSDRForm: React.FC = () => {
  const { createSDR, isLoading, error } = useSDRMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateSDRFormData>({
    resolver: yupResolver(sdrValidationSchema),
    defaultValues: {
      priority: 'Medium',
      customerType: 'Internal',
    },
  });

  const onSubmit = async (data: CreateSDRFormData): Promise<void> => {
    try {
      await createSDR(data);
      // Handle success (e.g., navigate to SDR details)
    } catch (err) {
      console.error('Failed to create SDR:', err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New SDR
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  {...register('title')}
                  fullWidth
                  label="Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('description')}
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('priority')}
                  select
                  fullWidth
                  label="Priority"
                  error={!!errors.priority}
                  helperText={errors.priority?.message}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('customerType')}
                  select
                  fullWidth
                  label="Customer Type"
                  error={!!errors.customerType}
                  helperText={errors.customerType?.message}
                >
                  <MenuItem value="Internal">Internal</MenuItem>
                  <MenuItem value="External">External</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('requiredByDate')}
                  fullWidth
                  label="Required By Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.requiredByDate}
                  helperText={errors.requiredByDate?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <FileUpload
                  onFilesChange={files => setValue('attachments', files)}
                  maxFiles={5}
                  maxSize={25 * 1024 * 1024} // 25MB
                />
              </Grid>

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error.message}</Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" onClick={() => window.history.back()}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create SDR'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};