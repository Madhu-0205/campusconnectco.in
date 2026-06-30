import { z } from 'zod'

export const profileSchema = z.object({
  name:          z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  bio:           z.string().max(300, 'Bio must be under 300 characters').optional(),
  college:       z.string().min(2, 'Please select your college').optional(),
  branch:        z.string().optional(),
  year:          z.enum(['1st','2nd','3rd','4th','Alumni']).optional(),
  careerGoal:    z.string().max(200).optional(),
  linkedin:      z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  github:        z.string().url('Please enter a valid GitHub URL').optional().or(z.literal('')),
  portfolio:     z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

export const gigSchema = z.object({
  title:           z.string().min(10, 'Title must be at least 10 characters').max(100),
  description:     z.string().min(50, 'Description must be at least 50 characters').max(2000),
  category:        z.enum(['design','development','marketing','research','content','finance','other']),
  budget:          z.number().min(200, 'Minimum budget is ₹200').max(100000, 'Maximum budget is ₹1,00,000'),
  required_skills: z.array(z.string()).min(1, 'Add at least one required skill'),
  duration:        z.string().min(1, 'Please select a duration'),
  work_mode:       z.enum(['remote','hybrid','on-site']),
})

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
})
