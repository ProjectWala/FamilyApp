export type Priority = 'low' | 'medium' | 'high'

export interface TodoItem {
  id: string
  title: string
  completed: boolean
  priority: Priority
  category?: string
  dueDate?: string
  memberId?: string
  createdAt: string
}

export interface FamilyMember {
  id: string
  name: string
  role: string
  avatarColor: string
  monthlyBudget?: number
  avatarIcon?: string
}

export type ExpenseCategory =
  | 'Groceries'
  | 'Utilities'
  | 'Dining'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Transport'
  | 'Other'

export interface ExpenseItem {
  id: string
  title: string
  amount: number
  category: ExpenseCategory
  memberId: string
  date: string
  tags?: string[]
  notes?: string
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringExpenseItem {
  id: string
  title: string
  amount: number
  frequency: Frequency
  category: ExpenseCategory
  memberId: string
  billingDay: number // e.g. day 1-31
  nextDueDate: string
  isActive: boolean
  tags?: string[]
  notes?: string
}

export interface ReturnGift {
  id?: string
  name: string
  price: number
}

export interface AccompanyingPerson {
  id?: string
  name: string
  relation?: string
}

export type RsvpStatus = 'confirmed' | 'pending' | 'declined'

export interface GuestItem {
  id: string
  name: string
  phone?: string
  email?: string
  group: string
  tags: string[]
  rsvpStatus: RsvpStatus
  additionalGuests: number // e.g. +1, +2
  accompanyingPersons?: AccompanyingPerson[]
  returnGifts: ReturnGift[]
  returnGiftGiven?: boolean
  notes?: string
  createdAt?: string
  updatedAt?: string
}
