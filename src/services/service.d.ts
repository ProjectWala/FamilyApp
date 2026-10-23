import type {
  FamilyMember,
  ExpenseItem,
  ExpenseCategory,
  Priority,
  Frequency,
  RecurringExpenseItem,
  TodoItem,
  GuestItem,
  ReturnGift,
  AccompanyingPerson,
  RsvpStatus,
} from '@/types'
import type { PieSlice } from '@/components/shared/DonutPieChart.vue'

export function getMemberSpent(memberId: string, expenses?: ExpenseItem[]): number
export function calculateTotalFamilyBudget(members?: FamilyMember[]): number
export function calculateTotalFamilySpent(members?: FamilyMember[], expenses?: ExpenseItem[]): number
export function calculateTotalFamilyRemaining(totalBudget: number, totalSpent: number): number
export function calculateTotalFamilyOverspent(totalBudget: number, totalSpent: number): number
export function calculateSquadSpentPercent(totalBudget: number, totalSpent: number): number
export function getSquadBudgetVsSpentSlices(
  budget: number,
  spent: number,
  remaining: number,
  overspent: number
): PieSlice[]
export function getSquadMemberBreakdownSlices(
  members?: FamilyMember[],
  expenses?: ExpenseItem[],
  remaining?: number
): PieSlice[]
export function getMemberBudget(member?: Partial<FamilyMember>): number
export function getMemberRemaining(member?: Partial<FamilyMember>, spent?: number): number
export function getMemberOverspent(member?: Partial<FamilyMember>, spent?: number): number
export function getMemberSpentPercent(member?: Partial<FamilyMember>, spent?: number): number
export function getMemberStatusColor(member?: Partial<FamilyMember>, spent?: number): 'error' | 'warning' | 'success'
export function getMemberSlices(member: FamilyMember, spent: number): PieSlice[]
export function createDefaultFamilyMemberForm(): {
  name: string
  role: string
  monthlyBudget: number
  avatarColor: string
  avatarIcon: string
}
export function createEditFamilyMemberForm(member?: FamilyMember): {
  name: string
  role: string
  monthlyBudget: number
  avatarColor: string
  avatarIcon: string
}

export function getCurrentDateString(): string
export function getPendingTodosPreview(todos?: TodoItem[], limit?: number): TodoItem[]
export function getBrotherMarriageTotal(expensesStore: any): number

export function getPriorityColor(priority: Priority | string): string
export function calculateProgressPercent(completedCount: number, totalCount: number): number
export function filterTodos(todos?: TodoItem[], filter?: 'all' | 'active' | 'completed'): TodoItem[]
export function createDefaultTodoForm(): {
  title: string
  priority: Priority
  category: string
  dueDate: string
  memberId: string
}
export function getTodoMemberName(familyStore: any, memberId: string): string

export function getCategoryIcon(category: ExpenseCategory | string): string
export function getCategoryColor(category: ExpenseCategory | string): string
export function getActiveFilterSummary(activeTagFilter: string | null, selectedCategory: string): string
export function filterExpenses(
  expenses?: ExpenseItem[],
  activeTagFilter?: string | null,
  selectedCategory?: string
): ExpenseItem[]
export function calculateEventContributors(
  expenses?: ExpenseItem[],
  activeTagFilter?: string | null,
  getMemberNameFn?: (id: string) => string
): Array<{ name: string; amount: number }>
export function createDefaultExpenseForm(
  activeMemberId?: string,
  activeTagFilter?: string | null
): {
  title: string
  amount: string | number
  category: ExpenseCategory
  memberId: string
  tags: string[]
  date: string
  notes: string
}
export function cleanExpenseTags(tags?: any[]): string[]
export function addTagToExpenseForm(formTags: string[], tag: string): void

export function getRecurringCategoryIcon(category: ExpenseCategory | string): string
export function getRecurringCategoryColor(category: ExpenseCategory | string): string
export function filterRecurringItems(
  items?: RecurringExpenseItem[],
  statusFilter?: 'all' | 'active'
): RecurringExpenseItem[]
export function createDefaultRecurringForm(defaultMemberId?: string): {
  title: string
  amount: string | number
  frequency: Frequency
  category: ExpenseCategory
  memberId: string
  billingDay: number
  nextDueDate: string
  isActive: boolean
  notes: string
}
export function createEditRecurringForm(item?: RecurringExpenseItem): {
  title: string
  amount: string | number
  frequency: Frequency
  category: ExpenseCategory
  memberId: string
  billingDay: number
  nextDueDate: string
  isActive: boolean
  notes: string
}
export function buildRecurringPayload(form: any, defaultMemberId?: string): Omit<RecurringExpenseItem, 'id'>

export function switchProfile(
  familyStore: any,
  memberId: string,
  onComplete?: () => void,
  delayMs?: number
): void

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleDeg: number
): { x: number; y: number }
export function createSegment(
  startAngle: number,
  endAngle: number,
  outerR: number,
  innerR: number,
  cX: number,
  cY: number
): string
export function createArcPath(
  startAngle: number,
  endAngle: number,
  outerR: number,
  innerR: number,
  cX: number,
  cY: number
): string
export function computePieSlices(
  slices?: PieSlice[],
  totalValue?: number,
  outerRadius?: number,
  innerRadius?: number,
  cx?: number,
  cy?: number
): any[]

export function getTitleForTab(tab: string): string
export function getSubtitleForTab(tab: string): string
export function toggleAppTheme(theme: any, isDark: boolean): void

export function getShoppingPriorityColor(priority: string): string
export function getShoppingPriorityIcon(priority: string): string

export function getGuestGroupColor(group: string): string
export function getGuestGroupIcon(group: string): string
export function getRsvpColor(status: string): string
export function getRsvpIcon(status: string): string
export function calculateGuestGiftsTotal(returnGifts?: ReturnGift[]): number
export function formatGuestPartyDisplay(guest?: { additionalGuests?: number }): string
export function createDefaultGuestForm(): {
  name: string
  phone: string
  email: string
  group: string
  tags: string[]
  rsvpStatus: RsvpStatus
  additionalGuests: number
  accompanyingPersons: AccompanyingPerson[]
  returnGifts: ReturnGift[]
  notes: string
}
export function createEditGuestForm(guest?: GuestItem): {
  name: string
  phone: string
  email: string
  group: string
  tags: string[]
  rsvpStatus: RsvpStatus
  additionalGuests: number
  accompanyingPersons: AccompanyingPerson[]
  returnGifts: ReturnGift[]
  notes: string
}
export function getInitials(name: string): string
export function sanitizeAccompanyingPersons(persons?: AccompanyingPerson[]): AccompanyingPerson[]
export function sanitizeReturnGifts(gifts?: ReturnGift[]): ReturnGift[]
export function syncAccompanyingPersons(
  currentPersons?: AccompanyingPerson[],
  targetCount?: number
): AccompanyingPerson[]
export function buildGuestPayload(form: any): Omit<GuestItem, 'id' | 'createdAt'>
export function buildReturnGift(name: string, price: number | string): ReturnGift

declare const service: {
  getMemberSpent: typeof getMemberSpent
  calculateTotalFamilyBudget: typeof calculateTotalFamilyBudget
  calculateTotalFamilySpent: typeof calculateTotalFamilySpent
  calculateTotalFamilyRemaining: typeof calculateTotalFamilyRemaining
  calculateTotalFamilyOverspent: typeof calculateTotalFamilyOverspent
  calculateSquadSpentPercent: typeof calculateSquadSpentPercent
  getSquadBudgetVsSpentSlices: typeof getSquadBudgetVsSpentSlices
  getSquadMemberBreakdownSlices: typeof getSquadMemberBreakdownSlices
  getMemberBudget: typeof getMemberBudget
  getMemberRemaining: typeof getMemberRemaining
  getMemberOverspent: typeof getMemberOverspent
  getMemberSpentPercent: typeof getMemberSpentPercent
  getMemberStatusColor: typeof getMemberStatusColor
  getMemberSlices: typeof getMemberSlices
  createDefaultFamilyMemberForm: typeof createDefaultFamilyMemberForm
  createEditFamilyMemberForm: typeof createEditFamilyMemberForm
  getCurrentDateString: typeof getCurrentDateString
  getPendingTodosPreview: typeof getPendingTodosPreview
  getBrotherMarriageTotal: typeof getBrotherMarriageTotal
  getPriorityColor: typeof getPriorityColor
  calculateProgressPercent: typeof calculateProgressPercent
  filterTodos: typeof filterTodos
  createDefaultTodoForm: typeof createDefaultTodoForm
  getTodoMemberName: typeof getTodoMemberName
  getCategoryIcon: typeof getCategoryIcon
  getCategoryColor: typeof getCategoryColor
  getActiveFilterSummary: typeof getActiveFilterSummary
  filterExpenses: typeof filterExpenses
  calculateEventContributors: typeof calculateEventContributors
  createDefaultExpenseForm: typeof createDefaultExpenseForm
  cleanExpenseTags: typeof cleanExpenseTags
  addTagToExpenseForm: typeof addTagToExpenseForm
  getRecurringCategoryIcon: typeof getRecurringCategoryIcon
  getRecurringCategoryColor: typeof getRecurringCategoryColor
  filterRecurringItems: typeof filterRecurringItems
  createDefaultRecurringForm: typeof createDefaultRecurringForm
  createEditRecurringForm: typeof createEditRecurringForm
  buildRecurringPayload: typeof buildRecurringPayload
  switchProfile: typeof switchProfile
  polarToCartesian: typeof polarToCartesian
  createSegment: typeof createSegment
  createArcPath: typeof createArcPath
  computePieSlices: typeof computePieSlices
  getTitleForTab: typeof getTitleForTab
  getSubtitleForTab: typeof getSubtitleForTab
  toggleAppTheme: typeof toggleAppTheme
  getShoppingPriorityColor: typeof getShoppingPriorityColor
  getShoppingPriorityIcon: typeof getShoppingPriorityIcon
  getGuestGroupColor: typeof getGuestGroupColor
  getGuestGroupIcon: typeof getGuestGroupIcon
  getRsvpColor: typeof getRsvpColor
  getRsvpIcon: typeof getRsvpIcon
  calculateGuestGiftsTotal: typeof calculateGuestGiftsTotal
  formatGuestPartyDisplay: typeof formatGuestPartyDisplay
  createDefaultGuestForm: typeof createDefaultGuestForm
  createEditGuestForm: typeof createEditGuestForm
  getInitials: typeof getInitials
  sanitizeAccompanyingPersons: typeof sanitizeAccompanyingPersons
  sanitizeReturnGifts: typeof sanitizeReturnGifts
  syncAccompanyingPersons: typeof syncAccompanyingPersons
  buildGuestPayload: typeof buildGuestPayload
  buildReturnGift: typeof buildReturnGift
}

export default service
