import { z } from 'zod'

// Application form validation schema
export const applicationSchema = z.object({
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  father_name: z.string()
    .min(2, "Father's name must be at least 2 characters")
    .max(50, "Father's name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Father's name can only contain letters and spaces"),

  college_name: z.string()
    .trim()
    .min(2, 'College or university name must be at least 2 characters')
    .max(150, 'College or university name must be less than 150 characters'),

  address: z.string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(300, 'Address must be less than 300 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Phone number can only contain numbers, +, -, spaces, and parentheses'),
  
  role_id: z.string()
    .min(1, 'Please select a position'),
  
  tenure_id: z.string()
    .min(1, 'Please select a duration')
})

// Admin login validation schema
export const adminLoginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
})

// File validation
export const fileValidation = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ],
  
  validateFile: (file: File) => {
    const errors: string[] = []
    
    if (file.size > fileValidation.maxSize) {
      errors.push('File size must be less than 5MB')
    }
    
    if (!fileValidation.allowedTypes.includes(file.type)) {
      errors.push('File type must be JPG, PNG, or PDF')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Validation helper functions
export const validateApplicationForm = (data: any) => {
  try {
    const validatedData = applicationSchema.parse(data)
    return { success: true, data: validatedData, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return { success: false, data: null, errors }
    }
    return { success: false, data: null, errors: [{ field: 'general', message: 'Validation failed' }] }
  }
}

export const validateAdminLogin = (data: any) => {
  try {
    const validatedData = adminLoginSchema.parse(data)
    return { success: true, data: validatedData, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return { success: false, data: null, errors }
    }
    return { success: false, data: null, errors: [{ field: 'general', message: 'Validation failed' }] }
  }
}
