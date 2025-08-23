# Agent Instructions for Educational Parent Engagement App

## Project Overview

This is a React Native educational app built with Expo that provides a comprehensive parent engagement platform for early childhood learning. The app focuses on tracking children's educational progress, facilitating parent-teacher communication, and gamifying the learning experience.

## Technology Stack

- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript
- **UI Library**: React Native core components + Expo Vector Icons
- **Charts**: react-native-svg for data visualization
- **Navigation**: Custom tab-based navigation (no React Navigation)
- **State Management**: React hooks (useState)

## App Architecture

### Main Navigation Structure
The app uses a custom bottom navigation with 6 main tabs:
1. **Home** - Dashboard with weekly goals, progress, performance metrics, certificates
2. **Learn** - Homework calendar, current work, completed work
3. **Community** - Children achievements, forums, chats, expert parents
4. **Games** - Weekly challenges, extra educational games
5. **Analytics** - Performance metrics, SuperAPP progress, distribution charts
6. **Tokens** - Token balance, shop, transaction history

### File Structure
```
my-rn-app/
├── App.tsx                 # Main app component with navigation logic
├── components/
│   ├── index.ts           # Component exports (use for Community components)
│   ├── Header.tsx         # App header with user info and tokens
│   ├── BottomNavigation.tsx # Bottom tab navigation
│   ├── TabToggle.tsx      # Parent/Teacher role toggle
│   │
│   # Home Page Components
│   ├── WeeklyGoal.tsx     # Weekly activity progress
│   ├── BookletProgress.tsx # Learning module progress with pagination
│   ├── PerformanceMetrics.tsx # 4-metric performance grid
│   ├── CertificatesEarned.tsx # Achievement certificates
│   │
│   # Learn Page Components
│   ├── LearnPage.tsx      # Main learn page with tabs
│   ├── HomeworkCalendar.tsx # Weekly homework calendar
│   ├── CurrentWork.tsx    # Active homework tasks
│   ├── CompletedWork.tsx  # Collapsible completed tasks
│   ├── WeeklyProgressChart.tsx # Bar chart (legacy)
│   ├── HomeworkCard.tsx   # Individual homework task cards
│   │
│   # Community Page Components
│   ├── CommunityPage.tsx  # Main community page with tabs
│   ├── ChildrenAchievements.tsx # Parent achievement posts
│   ├── Forums.tsx         # Discussion forums by subject
│   ├── Chats.tsx          # Teacher/parent messaging
│   ├── Experts.tsx        # Expert parent profiles
│   │
│   # Games & Analytics
│   ├── GamesPage.tsx      # Weekly challenges and extra games
│   ├── AnalyticsPage.tsx  # Performance analytics with bell curves
│   ├── TokensPage.tsx     # Token system and rewards
│   └── StreaksCard.tsx    # Parent engagement streaks (legacy)
```

## Design System

### Color Palette
- **Primary Dark**: `#1a1a2e` (navigation, buttons, headers)
- **Success Green**: `#22c55e` (completed tasks, positive metrics)
- **Warning Orange**: `#ff6b35`, `#f97316` (streaks, skill progression)
- **Info Blue**: `#3b82f6` (reading subject, analytics)
- **Purple**: `#8b5cf6` (tokens, charts, engagement time)
- **Error Red**: `#ef4444` (overdue, negative amounts)
- **Neutral Gray**: `#666`, `#9ca3af` (secondary text)
- **Light Backgrounds**: `#f0f9ff`, `#f0fdf4`, `#faf5ff`, `#fef3c7`

### Typography Scale
- **Page Titles**: 20px, bold
- **Section Titles**: 18px, bold
- **Card Titles**: 16px, semibold (600)
- **Body Text**: 14px, normal
- **Small Text**: 12px (badges, labels)
- **Tiny Text**: 10px (axis labels, timestamps)

### Component Patterns

#### Cards
```typescript
// Standard card structure
{
  backgroundColor: 'white' | theme_color,
  borderRadius: 12,
  padding: 16,
  marginHorizontal: 20,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#e5e7eb' | theme_border,
}
```

#### Badges
```typescript
// Status badges
{
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  backgroundColor: theme_color,
}
```

#### Progress Bars
```typescript
// Progress bar container
{
  height: 8,
  backgroundColor: '#e5e7eb',
  borderRadius: 4,
  overflow: 'hidden',
}

// Progress fill
{
  height: '100%',
  backgroundColor: '#1a1a2e',
  borderRadius: 4,
  width: `${percentage}%`,
}
```

## Key Features & Patterns

### 1. Navigation System
- Custom tab navigation in `BottomNavigation.tsx`
- Page switching via `currentPage` state in `App.tsx`
- Each page is a separate component rendered conditionally

### 2. User Profile System
- Header shows user info: name, school, grade, token count
- Parent/Teacher role toggle throughout the app
- Token system integrated in header and dedicated tokens page

### 3. Progress Tracking
- Multiple progress visualization types:
  - Linear progress bars (homework, goals)
  - Circular progress indicators (weekly calendar)
  - Bell curve charts (analytics performance)
  - Bar charts (weekly progress)

### 4. Task Management
- Homework tasks with multiple states: pending, uploaded, complete, overdue
- Task types: pen-paper work, in-app tasks
- Action buttons: camera, play, submit, complete
- Color-coded by completion status

### 5. Community Features
- Achievement sharing with media attachments
- Forum discussions by educational subject
- Expert parent system with ratings
- Direct messaging between parents and teachers

### 6. Gamification
- Token economy with earning/spending
- Weekly challenges with community participation
- Achievement certificates
- Performance rankings and comparisons

## Component Development Guidelines

### 1. Component Structure
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ComponentProps {
  // Define all props with proper types
}

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  
  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles following design system
});
```

### 2. Icon Usage
- Use `@expo/vector-icons` Ionicons exclusively
- Common icons:
  - `diamond` - tokens
  - `checkmark-circle` - completed tasks
  - `time` - pending/timing
  - `camera` - photo tasks
  - `play-circle` - interactive tasks
  - `trophy` - achievements
  - `trending-up` - analytics

### 3. State Management
- Use `useState` for component-level state
- Pass state between components via props
- No global state management currently implemented

### 4. Data Visualization
- Use `react-native-svg` for complex charts (bell curves)
- Simple progress bars with View components
- Color-code data by subject or status type

## Subject Color Coding
- **Reading**: Blue (`#3b82f6`)
- **Writing**: Green (`#22c55e`)
- **Math**: Purple (`#8b5cf6`)
- **Science**: Orange (`#f97316`)

## Common Issues & Solutions

### TypeScript Module Resolution
If you encounter "Cannot find module" errors:
1. Create/update `components/index.ts` with proper exports
2. Use named imports: `import { Component } from './index'`
3. Restart TypeScript service in IDE
4. Clear Metro cache: `npx expo start --clear`

### Styling Best Practices
1. Use consistent spacing: 8, 12, 16, 20, 24px
2. Follow the established color palette
3. Use flexbox for layouts
4. Include proper safe area handling
5. Test on different screen sizes

### Performance Considerations
1. Use `ScrollView` with `showsVerticalScrollIndicator={false}`
2. Add proper `key` props for mapped components
3. Optimize SVG charts for smooth rendering
4. Use `TouchableOpacity` for interactive elements

## Development Workflow

### Adding New Features
1. Create component in `components/` directory
2. Follow established naming conventions (PascalCase)
3. Add proper TypeScript interfaces
4. Use consistent styling patterns
5. Update navigation if needed
6. Test on both iOS and Android via Expo Go

### Modifying Existing Features
1. Understand the component hierarchy
2. Check for shared components and patterns
3. Maintain design consistency
4. Update related components if needed
5. Test navigation flows

### Data Integration
- Currently uses mock data in components
- Structure is ready for API integration
- Use proper TypeScript interfaces for data models
- Consider state management for real data

## Educational App Specific Guidelines

### Content Organization
- Organize by educational subjects (Reading, Writing, Math, Science)
- Use age-appropriate language and interactions
- Provide clear progress indicators
- Include parent engagement features

### Accessibility
- Use proper contrast ratios
- Include meaningful icon descriptions
- Ensure touch targets are adequate size
- Support different text sizes

### Parent-Teacher Communication
- Clear status indicators for tasks
- Photo/video sharing capabilities
- Progress reporting and analytics
- Community features for peer support

## Future Development Considerations

### Potential Enhancements
1. **Real-time Updates**: WebSocket integration for live chat/notifications
2. **Offline Support**: Local storage for homework and progress
3. **Push Notifications**: Homework reminders, achievement alerts
4. **Media Handling**: Image/video upload and display
5. **Authentication**: User login and profile management
6. **API Integration**: Backend service for data persistence
7. **Advanced Analytics**: More detailed performance tracking
8. **Internationalization**: Multi-language support (EN/EL toggle exists)

### Code Organization Improvements
1. **State Management**: Consider Redux or Zustand for complex state
2. **Navigation**: Migrate to React Navigation for advanced routing
3. **Testing**: Add unit tests for components
4. **Performance**: Implement lazy loading for large lists
5. **Error Handling**: Add proper error boundaries

## Deployment Notes

- Built with Expo managed workflow
- Supports iOS, Android, and Web
- Uses TypeScript strict mode
- Ready for EAS Build for production deployment
- No native code modifications required

---

**Last Updated**: January 2025
**App Version**: 1.0.0
**Target Audience**: Parents and teachers of K1-K2 students
