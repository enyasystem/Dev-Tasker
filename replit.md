# DevTasks - Professional Task Manager

A beautiful, developer-focused task manager app built with Expo React Native and Express.js backend.

## Overview

DevTasks is a task management application designed with a professional aesthetic and the features that developers appreciate. It features an iOS 26 liquid glass-inspired design with smooth animations, haptic feedback, and intuitive task organization.

## Features

- **Task Management**: Create, edit, and delete tasks with titles, descriptions, priorities, and due dates
- **Project Organization**: Organize tasks into projects (Inbox, Work, Personal, Learning)
- **Priority Levels**: Mark tasks as high, medium, or low priority with visual indicators
- **Status Tracking**: Track tasks through todo, in progress, and done states
- **Due Dates**: Set and track due dates with overdue indicators
- **Statistics**: View task statistics at a glance
- **Filtering**: Filter tasks by status (all, todo, in progress, done)
- **Swipe to Delete**: Quick delete with swipe gesture
- **Haptic Feedback**: Tactile feedback for interactions
- **Dark Mode**: Full dark mode support

## Project Architecture

```
├── client/                    # Expo React Native frontend
│   ├── components/           # Reusable UI components
│   │   ├── Button.tsx        # Animated button component
│   │   ├── Card.tsx          # Card with elevation
│   │   ├── EmptyState.tsx    # Empty list state display
│   │   ├── ErrorBoundary.tsx # Error boundary wrapper
│   │   ├── FilterChip.tsx    # Filter toggle chip
│   │   ├── FloatingActionButton.tsx
│   │   ├── HeaderTitle.tsx   # App header with icon
│   │   ├── SkeletonLoader.tsx # Loading skeleton
│   │   ├── StatsCard.tsx     # Statistics display card
│   │   ├── TaskItem.tsx      # Task list item with swipe
│   │   └── ThemedText.tsx    # Themed text component
│   ├── constants/
│   │   └── theme.ts          # Colors, spacing, typography
│   ├── hooks/
│   │   ├── useTheme.ts       # Theme hook
│   │   └── useScreenOptions.ts # Navigation options
│   ├── lib/
│   │   ├── query-client.ts   # React Query client
│   │   └── storage.ts        # AsyncStorage utilities
│   ├── navigation/
│   │   ├── MainTabNavigator.tsx
│   │   ├── RootStackNavigator.tsx
│   │   ├── SettingsStackNavigator.tsx
│   │   └── TasksStackNavigator.tsx
│   ├── screens/
│   │   ├── AddTaskScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   └── TasksScreen.tsx
│   └── types/
│       └── task.ts           # Task and Project types
├── server/                   # Express.js backend
│   ├── index.ts             # Server entry point
│   └── routes.ts            # API routes
└── assets/
    └── images/              # App icons and images
```

## Tech Stack

- **Frontend**: Expo React Native, React Navigation, React Query
- **Backend**: Express.js with TypeScript
- **Storage**: AsyncStorage for local persistence
- **UI**: Custom components with Reanimated animations
- **Styling**: iOS 26-inspired liquid glass design

## Design Guidelines

- **Color Palette**: Indigo primary (#6366F1), purple accent (#8B5CF6)
- **Dark Theme**: Deep purple-black backgrounds (#0F0D1A, #1E1B2E)
- **Typography**: System fonts with clear hierarchy
- **Spacing**: 4px base unit with consistent scale
- **Animations**: Spring-based micro-interactions
- **Haptics**: Feedback on toggle, success, and delete actions

## Recent Changes

- January 2026: Initial release with core task management features
