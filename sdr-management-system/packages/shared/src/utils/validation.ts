import Joi from 'joi';
import type { ValidationError, Priority, CustomerType, SDRStatus } from '../types';

// Common validation schemas
export const prioritySchema = Joi.string().valid('Low', 'Medium', 'High', 'Critical');
export const customerTypeSchema = Joi.string().valid('Internal', 'External');
export const sdrStatusSchema = Joi.string().valid('New', 'Active', 'Resolved', 'Closed', 'Removed');

// SDR validation schemas
export const createSDRSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).max(5000).required(),
  priority: prioritySchema.required(),
  customerType: customerTypeSchema.required(),
  requiredByDate: Joi.date().iso().greater('now').optional(),
  businessJustification: Joi.string().max(2000).optional(),
  estimatedHours: Joi.number().positive().max(1000).optional(),
  technicalComplexity: Joi.string().valid('Low', 'Medium', 'High').optional(),
  riskLevel: Joi.string().valid('Low', 'Medium', 'High').optional(),
  testingRequired: Joi.boolean().optional(),
  documentationRequired: Joi.boolean().optional(),
});

export const updateSDRSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(10).max(5000).optional(),
  priority: prioritySchema.optional(),
  customerType: customerTypeSchema.optional(),
  status: sdrStatusSchema.optional(),
  assignedTo: Joi.string().email().optional(),
  estimatedHours: Joi.number().positive().max(1000).optional().allow(null),
  actualHours: Joi.number().positive().max(1000).optional().allow(null),
  requiredByDate: Joi.date().iso().optional().allow(null),
  businessJustification: Joi.string().max(2000).optional().allow(null),
  technicalComplexity: Joi.string().valid('Low', 'Medium', 'High').optional().allow(null),
  riskLevel: Joi.string().valid('Low', 'Medium', 'High').optional().allow(null),
  testingRequired: Joi.boolean().optional().allow(null),
  documentationRequired: Joi.boolean().optional().allow(null),
  approvalStatus: Joi.string().valid('Not Required', 'Pending', 'Approved', 'Rejected').optional(),
  approvalComments: Joi.string().max(1000).optional().allow(null),
});

export const commentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  type: Joi.string().valid('General', 'Technical', 'Approval', 'Status Change').optional(),
});

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('id', 'title', 'priority', 'status', 'createdDate', 'lastModifiedDate').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// Filter validation
export const filterSchema = Joi.object({
  status: Joi.array().items(sdrStatusSchema).optional(),
  priority: Joi.array().items(prioritySchema).optional(),
  customerType: customerTypeSchema.optional(),
  assignedTo: Joi.string().email().optional(),
  submitterId: Joi.string().uuid().optional(),
  dateRange: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().greater(Joi.ref('start')).required(),
  }).optional(),
});

// Validation utility functions
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: ValidationError[];
}

export function validateData<T>(data: any, schema: Joi.ObjectSchema): ValidationResult<T> {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    stripUnknown: true,
    convert: true 
  });

  if (error) {
    const errors: ValidationError[] = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      code: detail.type
    }));

    return {
      isValid: false,
      errors
    };
  }

  return {
    isValid: true,
    data: value as T
  };
}

export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'required'
    };
  }
  return null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 5000); // Limit length
}

export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // File size limit (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push({
      field: 'file.size',
      message: 'File size exceeds 10MB limit',
      code: 'file.size.too_large'
    });
  }
  
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file.type',
      message: 'File type not allowed',
      code: 'file.type.not_allowed'
    });
  }
  
  // File name validation
  const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!fileNameRegex.test(file.name)) {
    errors.push({
      field: 'file.name',
      message: 'File name contains invalid characters',
      code: 'file.name.invalid'
    });
  }
  
  return errors;
}