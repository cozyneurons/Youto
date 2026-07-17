# YouTube Course Converter - Frontend Architecture

## 🎨 FRONTEND ARCHITECTURE

```text
frontend/
├── public/
│   ├── favicon.svg
│   └── manifest.json
│
├── src/
│   ├── components/                   # Reusable UI components
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── course/                  # Course path components
│   │   │   ├── PathGraph.tsx        # Curvy SVG path with video nodes
│   │   │   ├── VideoNode.tsx        # Single node (thumbnail + title)
│   │   │   └── ProgressBar.tsx      # X of N videos completed
│   │   │
│   │   ├── video/                   # Video player components
│   │   │   ├── VideoPlayer.tsx      # YouTube embed wrapper
│   │   │   └── NotesPanel.tsx       # Right-side notes panel
│   │   │
│   │   ├── auth/                    # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── GoogleAuth.tsx
│   │   │
│   │   └── dashboard/               # Dashboard components
│   │       ├── CourseGrid.tsx       # Grid of courses
│   │       └── RecentActivity.tsx   # Activity feed
│   │
│   ├── pages/                        # Full page components
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CoursePage.tsx           # Curvy path + nodes view
│   │   ├── LessonPage.tsx           # Video (left) + Notes (right)
│   │   ├── ProfilePage.tsx
│   │   ├── UploadPage.tsx           # Upload YouTube playlist URL
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useProgress.ts           # Get user progress
│   │   ├── useLessons.ts            # Fetch lessons
│   │   ├── useCourse.ts             # Fetch course
│   │   ├── useAuth.ts               # Auth context hook
│   │   ├── useVideoPlayer.ts        # Video player logic
│   │   ├── useScrollReveal.ts       # Intersection observer for node reveal
│   │   └── useMediaQuery.ts         # Responsive queries
│   │
│   ├── services/                     # API services
│   │   ├── api.ts                   # Axios instance + base URL
│   │   ├── authService.ts           # Login, signup, logout
│   │   ├── courseService.ts         # Fetch courses, lessons
│   │   ├── progressService.ts       # Track user progress
│   │   ├── notesService.ts          # Save/fetch notes per lesson
│   │   └── uploadService.ts         # Upload YouTube playlist URL
│   │
│   ├── store/                        # Zustand state management
│   │   ├── authStore.ts             # User auth state
│   │   ├── courseStore.ts           # Course/lesson data
│   │   ├── progressStore.ts         # User progress
│   │   ├── uiStore.ts               # UI state (modal open, etc)
│   │   └── index.ts                 # Export all stores
│   │
│   ├── types/                        # TypeScript types
│   │   ├── index.ts
│   │   ├── course.ts
│   │   ├── lesson.ts
│   │   ├── user.ts
│   │   ├── progress.ts
│   │   └── api.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── formatters.ts            # Format time, etc
│   │   ├── validators.ts            # Validate forms
│   │   ├── constants.ts             # App constants
│   │   └── localStorage.ts          # Local storage helpers
│   │
│   ├── styles/                       # Global styles
│   │   ├── globals.css              # Tailwind imports
│   │   └── variables.css            # CSS variables
│   │
│   ├── App.tsx                       # Main App component
│   ├── main.tsx                      # React root
│   └── vite-env.d.ts                # Vite env types
│
├── index.html                        # HTML entry point
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
├── .dockerignore
└── .env.example
```

### Frontend Component Hierarchy
```text
App
├── Router
│   ├── HomePage
│   │   └── Navbar
│   ├── DashboardPage
│   │   ├── Navbar
│   │   ├── CourseGrid
│   │   │   └── CourseCard
│   │   └── RecentActivity
│   ├── UploadPage
│   │   ├── Form (YouTube playlist URL input)
│   │   └── Loading spinner
│   ├── CoursePage
│   │   ├── Navbar
│   │   ├── ProgressBar (X of N completed)
│   │   └── PathGraph
│   │       └── VideoNode[] (one per playlist video, in order)
│   └── LessonPage
│       ├── Navbar
│       ├── VideoPlayer (left, ~70% width — YouTube embed)
│       └── NotesPanel (right, ~30% width — plain text notes)
└── ErrorBoundary
```

### UI/UX Philosophy
```text
Keep it minimal. No animations, no decorative elements, no gamification UI.
The goal is a working, functional webapp. Visual polish comes later.

CoursePage:
- Single curvy SVG path drawn top to bottom
- Nodes placed along the path, one per video, in playlist order
- Each node: video thumbnail + title only
- Nodes are revealed progressively as the user scrolls down
  (Intersection Observer — no locking, all nodes freely clickable)
- Completed nodes get a simple visual marker (e.g. filled dot or checkmark)
- Progress bar at the top: plain "X / N completed"

LessonPage:
- Clean two-column layout, no extra chrome
- Left (~70%): YouTube embedded player
- Right (~30%): plain textarea for notes, auto-saved per lesson
- Right panel kept intentionally sparse — built to extend later
```

---

## 📊 State Management Flow (Zustand)

```text
Frontend State Structure:

authStore:
├── user { id, email, name, avatar_url }
├── token (JWT)
├── isAuthenticated (boolean)
├── login(email, password)
├── logout()
└── setUser(userData)

courseStore:
├── courses [] (list of all courses)
├── currentCourse {} (viewing course details)
├── lessons [] (lessons in current course, sorted by order_index)
├── fetchCourses()
├── fetchCourse(id)
└── fetchLessons(courseId)

progressStore:
├── userProgress {} (lessons completed, keyed by lesson_id)
├── completedCount (number)
├── totalCount (number)
├── updateProgress(lessonId)
└── markComplete(lessonId)

uiStore:
├── isLoading (boolean)
├── error (string)
└── currentPage (string)
```
