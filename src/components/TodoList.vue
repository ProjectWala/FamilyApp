<template>
  <div class="todo-component">
    <!-- Header Summary Card (Mantis Style) -->
    <v-card class="mb-4 pa-4 rounded-lg elevation-0 text-white" style="background: var(--v-gradient, linear-gradient(250.38deg, #1677ff 0%, #0958d9 100%));">
      <div class="d-flex justify-space-between align-center flex-wrap gap-2 mb-2">
        <div class="d-flex align-center gap-2">
          <v-avatar color="white" variant="tonal" size="38" rounded="lg">
            <v-icon icon="mdi-checkbox-marked-circle-outline" size="22" color="white" />
          </v-avatar>
          <div>
            <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
              Task Tracker
            </span>
            <div class="text-h6 font-weight-bold text-white line-height-1">
              {{ todoStore.activeCount }} Pending • {{ todoStore.totalCount }} Total
            </div>
          </div>
        </div>

        <!-- Add Task Primary CTA -->
        <v-btn
          color="white"
          variant="flat"
          size="small"
          rounded="lg"
          class="text-primary font-weight-bold text-capitalize"
          prepend-icon="mdi-plus"
          @click="openAddModal"
        >
          + Add
        </v-btn>
      </div>

      <div class="mt-2">
        <div class="d-flex justify-space-between text-caption mb-1 text-white-85">
          <span>Progress</span>
          <span>{{ progressPercent }}% Done</span>
        </div>
        <v-progress-linear
          :model-value="progressPercent"
          color="white"
          height="6"
          rounded="lg"
        />
      </div>

      <div class="d-flex justify-end text-caption pt-2 mt-2 border-t-white-20 text-white-75">
        <span>Completed: <strong class="text-white">{{ todoStore.completedCount }}</strong> / {{ todoStore.totalCount }} tasks</span>
      </div>
    </v-card>

    <!-- Filters & Action Bar -->
    <div class="d-flex align-center justify-space-between mb-3">
      <v-chip-group v-model="activeFilter" mandatory>
        <v-chip value="all" size="small" filter variant="tonal" rounded="md">
          All ({{ todoStore.totalCount }})
        </v-chip>
        <v-chip value="active" size="small" filter variant="tonal" color="warning" rounded="md">
          Active ({{ todoStore.activeCount }})
        </v-chip>
        <v-chip value="completed" size="small" filter variant="tonal" color="success" rounded="md">
          Done ({{ todoStore.completedCount }})
        </v-chip>
      </v-chip-group>

      <v-menu v-if="todoStore.completedCount > 0">
        <template #activator="{ props }">
          <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" />
        </template>
        <v-list density="compact" rounded="lg">
          <v-list-item
            prepend-icon="mdi-delete-sweep"
            title="Clear Done"
            @click="todoStore.clearCompleted"
          />
        </v-list>
      </v-menu>
    </div>

    <!-- Todo Items List -->
    <div v-if="filteredTodos.length === 0" class="text-center py-8">
      <v-avatar color="surface-variant" size="56" rounded="lg" class="mb-3">
        <v-icon icon="mdi-clipboard-check-outline" size="32" color="primary" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-medium text-darkText">No tasks found</div>
      <div class="text-body-2 text-lightText">
        {{ activeFilter === 'completed' ? 'No completed tasks yet.' : 'All caught up! Tap the button above to add a new task.' }}
      </div>
    </div>

    <v-slide-y-transition group>
      <v-card
        v-for="item in filteredTodos"
        :key="item.id"
        variant="outlined"
        elevation="0"
        class="mb-2 rounded-lg bg-surface card-hover-border"
        :class="{ 'opacity-60': item.completed }"
      >
        <div class="d-flex align-center pa-3">
          <!-- Title and Info (Left checkbox removed) -->
          <div class="flex-grow-1 cursor-pointer" style="min-width: 0;" @click="todoStore.toggleDone(item.id)">
            <div
              class="text-body-2 font-weight-medium text-truncate text-darkText"
              :class="{ 'text-decoration-line-through text-medium-emphasis': item.completed }"
            >
              {{ item.title }}
            </div>

            <div class="d-flex align-center gap-2 mt-1 flex-wrap">
              <!-- Priority badge -->
              <v-chip
                size="x-small"
                :color="getPriorityColor(item.priority)"
                variant="flat"
                rounded="md"
                class="text-capitalize font-weight-medium"
              >
                {{ item.priority }}
              </v-chip>

              <!-- Category -->
              <v-chip v-if="item.category" size="x-small" variant="tonal" rounded="md">
                {{ item.category }}
              </v-chip>

              <!-- Member Attribution OR Unassigned Option (Anyone can do) -->
              <span v-if="item.memberId && getMember(item.memberId)" class="text-caption text-lightText d-flex align-center">
                <v-avatar
                  size="14"
                  variant="flat"
                  :style="{ backgroundColor: getMember(item.memberId)?.avatarColor || '#6366F1' }"
                  class="mr-1"
                >
                  <v-icon :icon="getMember(item.memberId)?.avatarIcon || 'mdi-account'" size="9" color="white" />
                </v-avatar>
                {{ getMemberName(item.memberId) }}
              </span>
              <v-chip
                v-else
                size="x-small"
                variant="tonal"
                color="secondary"
                rounded="md"
                class="font-weight-medium"
              >
                <v-icon icon="mdi-account-clock-outline" size="12" class="mr-1" />
                Unassigned (Anyone)
              </v-chip>

              <!-- Due Date (Rendered in small font) -->
              <span v-if="item.dueDate" class="app-date-text text-lightText d-flex align-center">
                <v-icon icon="mdi-calendar-clock" size="12" class="mr-1" />
                {{ item.dueDate }}
              </span>
            </div>
          </div>

          <!-- Mark As Done button / Edit button / Delete button -->
          <div class="d-flex align-center ml-2 flex-shrink-0">
            <v-btn
              :icon="item.completed ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'"
              :color="item.completed ? 'success' : 'grey'"
              variant="text"
              size="small"
              title="Toggle Done"
              @click.stop="todoStore.toggleDone(item.id)"
            />
            <v-btn
              icon="mdi-pencil-outline"
              color="primary"
              variant="text"
              size="small"
              title="Edit Task"
              @click.stop="openEditModal(item)"
            />
            <v-btn
              icon="mdi-trash-can-outline"
              color="error"
              variant="text"
              size="small"
              title="Delete Task"
              @click.stop="todoStore.deleteTodo(item.id)"
            />
          </div>
        </div>
      </v-card>
    </v-slide-y-transition>

    <!-- Add / Edit Task Modal Dialog with Assignable Family Members & Unassigned Option -->
    <v-dialog v-model="dialogOpen" max-width="520" persistent scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="white" variant="tonal" size="34" class="mr-3">
              <v-icon :icon="isEditing ? 'mdi-pencil-outline' : 'mdi-checkbox-marked-circle-plus-outline'" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ isEditing ? 'Edit Task & Assignee' : 'Add New Task' }}
              </div>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="closeDialog"
          />
        </v-card-title>

        <v-divider />

        <!-- Form Body -->
        <v-card-text class="pa-4" style="max-height: 75vh;">
          <v-form @submit.prevent="submitTask">
            <v-text-field
              v-model="form.title"
              label="Task Title *"
              placeholder="e.g. Pay electricity bill, Buy milk"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
              autofocus
              :rules="[(v) => !!v.trim() || 'Task title is required']"
            />

            <v-row density="compact">
              <v-col cols="6">
                <v-select
                  v-model="form.category"
                  :items="categories"
                  label="Category"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  class="mb-3"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.dueDate"
                  label="Due Date"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  class="mb-3"
                />
              </v-col>
            </v-row>

            <!-- Priority Selector -->
            <div class="mb-3">
              <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1">
                Priority:
              </div>
              <v-chip-group v-model="form.priority" mandatory selected-class="text-primary">
                <v-chip value="low" size="small" variant="tonal" rounded="md" color="info" filter>
                  Low
                </v-chip>
                <v-chip value="medium" size="small" variant="tonal" rounded="md" color="warning" filter>
                  Medium
                </v-chip>
                <v-chip value="high" size="small" variant="tonal" rounded="md" color="error" filter>
                  High
                </v-chip>
              </v-chip-group>
            </div>

            <!-- ASSIGNABLE FAMILY MEMBERS LIST (With 'Unassigned' Option) -->
            <div class="mb-2">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption font-weight-bold text-darkText text-uppercase">
                  Assign To:
                </span>
                <span class="text-caption text-secondary font-weight-medium" v-if="!form.memberId">
                  (Anyone can do this later)
                </span>
                <span class="text-caption text-primary font-weight-medium" v-else>
                  Assigned: {{ getMemberName(form.memberId) }}
                </span>
              </div>

              <!-- List of Assignable Options -->
              <div class="d-flex flex-column gap-2 assignee-container">
                <!-- 1. 'Unassigned' Option (Anyone can do later) -->
                <v-card
                  variant="outlined"
                  elevation="0"
                  class="pa-2 px-3 rounded-lg cursor-pointer transition-all assignee-card"
                  :class="{
                    'assignee-selected border-primary': !form.memberId,
                    'card-hover-border': !!form.memberId
                  }"
                  @click="form.memberId = ''"
                >
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-avatar color="grey-lighten-3" variant="flat" size="34" rounded="lg" class="mr-3">
                        <v-icon icon="mdi-account-question-outline" size="20" color="grey-darken-2" />
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center">
                          Unassigned
                          <v-chip size="x-small" color="secondary" variant="tonal" label rounded="md" class="ml-2 font-weight-medium">
                            Open for all
                          </v-chip>
                        </div>
                        <div class="text-caption text-lightText" style="font-size: 0.7rem !important;">
                          Anyone in the family can complete this task later
                        </div>
                      </div>
                    </div>
                    <v-icon
                      :icon="!form.memberId ? 'mdi-check-circle' : 'mdi-circle-outline'"
                      :color="!form.memberId ? 'primary' : 'grey'"
                      size="20"
                    />
                  </div>
                </v-card>

                <!-- 2. Family Members List -->
                <v-card
                  v-for="member in familyStore.members"
                  :key="member.id"
                  variant="outlined"
                  elevation="0"
                  class="pa-2 px-3 rounded-lg cursor-pointer transition-all assignee-card"
                  :class="{
                    'assignee-selected border-primary': form.memberId === member.id,
                    'card-hover-border': form.memberId !== member.id
                  }"
                  @click="form.memberId = member.id"
                >
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-avatar
                        :color="member.avatarColor || 'primary'"
                        variant="flat"
                        size="34"
                        rounded="lg"
                        class="mr-3 text-white font-weight-bold"
                        :style="{ backgroundColor: member.avatarColor || '#6366F1' }"
                      >
                        <v-icon :icon="member.avatarIcon || 'mdi-account'" size="18" color="white" />
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center">
                          {{ member.name }}
                          <span v-if="member.id === familyStore.activeMemberId" class="text-caption text-primary font-weight-regular ml-1">
                            (Active)
                          </span>
                        </div>
                        <div class="text-caption text-lightText" style="font-size: 0.7rem !important;">
                          {{ member.role }}
                        </div>
                      </div>
                    </div>
                    <v-icon
                      :icon="form.memberId === member.id ? 'mdi-check-circle' : 'mdi-circle-outline'"
                      :color="form.memberId === member.id ? 'primary' : 'grey'"
                      size="20"
                    />
                  </div>
                </v-card>
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-divider />

        <!-- Dialog Footer Actions -->
        <v-card-actions class="pa-4 bg-surface d-flex justify-space-between">
          <v-btn
            variant="outlined"
            rounded="lg"
            color="secondary"
            class="text-capitalize"
            @click="closeDialog"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-capitalize font-weight-bold px-4"
            prepend-icon="mdi-content-save"
            @click="submitTask"
          >
            {{ isEditing ? 'Save Changes' : 'Create Task' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodoStore } from '@/stores/todos'
import { useFamilyStore } from '@/stores/family'
import { useModalBack } from '@/composables/useModalBack'
import type { TodoItem, Priority } from '@/types'
import {
  getPriorityColor as serviceGetPriorityColor,
  calculateProgressPercent,
  filterTodos as serviceFilterTodos,
  createDefaultTodoForm,
  getTodoMemberName,
} from '@/services/service.js'

const todoStore = useTodoStore()
const familyStore = useFamilyStore()

const dialogOpen = ref(false)
const isEditing = ref(false)
const editingTaskId = ref<string | null>(null)
useModalBack(dialogOpen, 'todoDialog')
const activeFilter = ref<'all' | 'active' | 'completed'>('all')

const categories = ['General', 'Groceries', 'Utilities', 'Family', 'Health', 'Work', 'Personal']

const form = ref(createDefaultTodoForm())

const progressPercent = computed(() =>
  calculateProgressPercent(todoStore.completedCount, todoStore.totalCount)
)

const filteredTodos = computed(() => serviceFilterTodos(todoStore.todos, activeFilter.value))

function openAddModal() {
  isEditing.value = false
  editingTaskId.value = null
  form.value = createDefaultTodoForm()
  dialogOpen.value = true
}

function openEditModal(todo: TodoItem) {
  isEditing.value = true
  editingTaskId.value = todo.id
  form.value = {
    title: todo.title,
    priority: todo.priority,
    category: todo.category || 'General',
    dueDate: todo.dueDate || new Date().toISOString().split('T')[0],
    memberId: todo.memberId || '',
  }
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

function submitTask() {
  if (!form.value.title.trim()) return

  if (isEditing.value && editingTaskId.value) {
    todoStore.updateTodo(editingTaskId.value, {
      title: form.value.title.trim(),
      priority: form.value.priority,
      category: form.value.category,
      dueDate: form.value.dueDate || undefined,
      memberId: form.value.memberId || undefined,
    })
  } else {
    todoStore.addTodo(
      form.value.title.trim(),
      form.value.priority,
      form.value.category,
      form.value.dueDate || undefined,
      form.value.memberId || undefined
    )
  }
  closeDialog()
}

function getMemberName(id: string) {
  return getTodoMemberName(familyStore, id)
}

function getMember(id: string) {
  return familyStore.getMemberById(id)
}

function getPriorityColor(priority: Priority) {
  return serviceGetPriorityColor(priority)
}
</script>
