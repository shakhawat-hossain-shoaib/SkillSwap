export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  content: string;
  order: number;
  isCompleted: boolean;
}

export interface Bootcamp {
  id: string;
  slug?: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  category: string;
  lessons: Lesson[];
  enrolledCount: number;
  rating: number;
  thumbnail: string;
  tags: string[];
  contentPath?: string;
  curriculum?: any;
  createdAt?: string;
  updatedAt?: string;
}

export const bootcamps: Bootcamp[] = [
  {
    id: 'react-fundamentals',
    title: 'React Fundamentals: From Zero to Hero',
    description: 'Master the fundamentals of React including components, hooks, state management, and modern patterns. Build real-world projects from scratch and learn best practices used by top companies.',
    instructor: 'Sarah Chen',
    instructorAvatar: 'SC',
    difficulty: 'Beginner',
    duration: '6 weeks',
    category: 'Web Development',
    enrolledCount: 342,
    rating: 4.9,
    thumbnail: '🚀',
    tags: ['React', 'JavaScript', 'Frontend'],
    lessons: [
      {
        id: 'react-1',
        title: 'Introduction to React & JSX',
        description: 'Learn what React is, why it exists, and how JSX works under the hood.',
        duration: '45 min',
        content: `# Introduction to React & JSX

React is a JavaScript library for building user interfaces. Created by Facebook in 2013, it has become the most popular frontend library in the world.

## Why React?

- **Component-Based**: Build encapsulated components that manage their own state, then compose them to make complex UIs.
- **Declarative**: React makes it painless to create interactive UIs. Design simple views for each state in your application.
- **Learn Once, Write Anywhere**: You can develop new features in React without rewriting existing code.

## What is JSX?

JSX is a syntax extension for JavaScript that lets you write HTML-like markup inside a JavaScript file. It looks like HTML but is actually JavaScript under the hood.

\`\`\`jsx
const element = <h1>Hello, world!</h1>;
\`\`\`

This gets compiled to:

\`\`\`javascript
const element = React.createElement('h1', null, 'Hello, world!');
\`\`\`

## Your First Component

\`\`\`jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
\`\`\`

## Key Takeaways

1. React uses a virtual DOM for efficient updates
2. JSX is syntactic sugar for React.createElement()
3. Components are the building blocks of React apps
4. Props allow data to flow from parent to child components`,
        order: 1,
        isCompleted: true,
      },
      {
        id: 'react-2',
        title: 'Components & Props Deep Dive',
        description: 'Understanding functional components, props, and composition patterns.',
        duration: '55 min',
        content: `# Components & Props Deep Dive

## Functional Components

In modern React, we primarily use functional components. They are simple JavaScript functions that accept props and return JSX.

\`\`\`jsx
function UserCard({ name, role, avatar }) {
  return (
    <div className="card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{role}</p>
    </div>
  );
}
\`\`\`

## Props Are Read-Only

A component must never modify its own props. Think of them as function arguments — pure functions don't change their inputs.

## Children Props

The \`children\` prop lets you pass JSX between opening and closing tags:

\`\`\`jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
\`\`\`

## Composition vs Inheritance

React has a powerful composition model. Use composition instead of inheritance to reuse code between components.`,
        order: 2,
        isCompleted: true,
      },
      {
        id: 'react-3',
        title: 'State Management with useState',
        description: 'Managing local component state with the useState hook.',
        duration: '50 min',
        content: `# State Management with useState

## What is State?

State is data that changes over time in your component. When state changes, React re-renders the component.

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## Rules of useState

1. Call useState at the top level of your component
2. Don't call it inside loops, conditions, or nested functions
3. The setter function triggers a re-render
4. State updates may be batched for performance

## Working with Objects and Arrays

\`\`\`jsx
const [user, setUser] = useState({ name: '', email: '' });

// Always create a new object when updating
setUser({ ...user, name: 'John' });
\`\`\``,
        order: 3,
        isCompleted: false,
      },
      {
        id: 'react-4',
        title: 'useEffect & Side Effects',
        description: 'Handling side effects, API calls, and cleanup with useEffect.',
        duration: '60 min',
        content: `# useEffect & Side Effects

## What are Side Effects?

Side effects are operations that affect something outside the scope of the function: API calls, timers, DOM manipulation, etc.

\`\`\`jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  if (!user) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
\`\`\`

## Dependency Array

- \`useEffect(() => {}, [])\` — runs once on mount
- \`useEffect(() => {}, [dep])\` — runs when dep changes
- \`useEffect(() => {})\` — runs on every render (avoid!)

## Cleanup

Return a function from useEffect to clean up:

\`\`\`jsx
useEffect(() => {
  const timer = setInterval(() => tick(), 1000);
  return () => clearInterval(timer);
}, []);
\`\`\``,
        order: 4,
        isCompleted: false,
      },
      {
        id: 'react-5',
        title: 'React Router & Navigation',
        description: 'Building multi-page applications with React Router.',
        duration: '45 min',
        content: `# React Router & Navigation

## Setting Up Routes

\`\`\`jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
\`\`\`

## Navigation

Use the Link component instead of anchor tags:

\`\`\`jsx
import { Link, useNavigate } from 'react-router-dom';

function Nav() {
  const navigate = useNavigate();
  
  return (
    <nav>
      <Link to="/">Home</Link>
      <button onClick={() => navigate('/about')}>
        Go to About
      </button>
    </nav>
  );
}
\`\`\``,
        order: 5,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'python-data-science',
    title: 'Python for Data Science & Analytics',
    description: 'Learn Python programming with a focus on data analysis, visualization, and machine learning fundamentals. Work with pandas, matplotlib, and scikit-learn.',
    instructor: 'Dr. Amir Hassan',
    instructorAvatar: 'AH',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    category: 'Data Science',
    enrolledCount: 518,
    rating: 4.8,
    thumbnail: '📊',
    tags: ['Python', 'Data Science', 'ML'],
    lessons: [
      {
        id: 'py-ds-1',
        title: 'Python Refresher for Data Science',
        description: 'Quick review of Python fundamentals needed for data work.',
        duration: '40 min',
        content: `# Python Refresher

## Lists, Dicts, and Comprehensions

\`\`\`python
# List comprehension
squares = [x**2 for x in range(10)]

# Dict comprehension
word_lengths = {word: len(word) for word in ['hello', 'world']}
\`\`\`

## Functions and Lambda

\`\`\`python
def process_data(data, transform=None):
    if transform:
        return [transform(item) for item in data]
    return data

# Lambda
doubled = process_data([1, 2, 3], lambda x: x * 2)
\`\`\``,
        order: 1,
        isCompleted: true,
      },
      {
        id: 'py-ds-2',
        title: 'Introduction to NumPy',
        description: 'Working with arrays, matrices, and numerical operations.',
        duration: '55 min',
        content: `# Introduction to NumPy

NumPy is the foundation of the Python data science stack.

\`\`\`python
import numpy as np

# Creating arrays
arr = np.array([1, 2, 3, 4, 5])
matrix = np.array([[1, 2], [3, 4]])

# Operations
print(arr.mean())    # 3.0
print(arr.std())     # 1.414
print(matrix.T)      # Transpose
\`\`\``,
        order: 2,
        isCompleted: false,
      },
      {
        id: 'py-ds-3',
        title: 'Pandas DataFrames Mastery',
        description: 'Loading, cleaning, and transforming data with pandas.',
        duration: '65 min',
        content: `# Pandas DataFrames

\`\`\`python
import pandas as pd

df = pd.read_csv('data.csv')
print(df.head())
print(df.describe())

# Filtering
young = df[df['age'] < 30]

# Grouping
avg_salary = df.groupby('department')['salary'].mean()
\`\`\``,
        order: 3,
        isCompleted: false,
      },
      {
        id: 'py-ds-4',
        title: 'Data Visualization with Matplotlib',
        description: 'Creating charts, graphs, and interactive visualizations.',
        duration: '50 min',
        content: `# Data Visualization

\`\`\`python
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2)
plt.xlabel('Time')
plt.ylabel('Value')
plt.title('My First Plot')
plt.show()
\`\`\``,
        order: 4,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design Principles & Figma',
    description: 'Learn the fundamentals of user interface and experience design. Master Figma, design systems, color theory, typography, and user research methods.',
    instructor: 'Emily Rodriguez',
    instructorAvatar: 'ER',
    difficulty: 'Beginner',
    duration: '5 weeks',
    category: 'Design',
    enrolledCount: 287,
    rating: 4.7,
    thumbnail: '🎨',
    tags: ['UI/UX', 'Figma', 'Design'],
    lessons: [
      {
        id: 'uiux-1',
        title: 'Design Thinking & User Research',
        description: 'Understanding user needs through research methodologies.',
        duration: '45 min',
        content: `# Design Thinking & User Research

## The 5 Stages of Design Thinking

1. **Empathize** — Understand your users
2. **Define** — Frame the problem
3. **Ideate** — Generate solutions
4. **Prototype** — Build testable artifacts
5. **Test** — Validate with users

## User Research Methods

- User interviews
- Surveys & questionnaires
- Card sorting
- Usability testing
- A/B testing`,
        order: 1,
        isCompleted: true,
      },
      {
        id: 'uiux-2',
        title: 'Color Theory & Typography',
        description: 'Mastering the art of color palettes and type hierarchies.',
        duration: '50 min',
        content: `# Color Theory & Typography

## The 60-30-10 Rule

- 60% dominant color (background)
- 30% secondary color (sections)
- 10% accent color (CTAs, highlights)

## Typography Scale

Use a modular scale for consistent type sizing. Popular ratio: 1.25 (Major Third).`,
        order: 2,
        isCompleted: false,
      },
      {
        id: 'uiux-3',
        title: 'Figma Essentials',
        description: 'Getting productive with Figma tools and workflows.',
        duration: '60 min',
        content: `# Figma Essentials

## Key Tools

- Frame Tool (F)
- Rectangle Tool (R)
- Text Tool (T)
- Auto Layout (Shift+A)
- Components (Ctrl+Alt+K)

## Best Practices

1. Use Auto Layout everywhere
2. Create reusable components
3. Build a design system first
4. Use constraints for responsive design`,
        order: 3,
        isCompleted: false,
      },
      {
        id: 'uiux-4',
        title: 'Building a Design System',
        description: 'Creating scalable, consistent design systems from scratch.',
        duration: '55 min',
        content: `# Building a Design System

A design system is a collection of reusable components, guided by clear standards, that can be assembled together to build applications.

## Core Elements

1. **Color Tokens** — Primary, secondary, neutral, semantic colors
2. **Typography Scale** — Font families, sizes, weights, line heights
3. **Spacing System** — Consistent spacing using a base unit (4px or 8px)
4. **Component Library** — Buttons, inputs, cards, modals, etc.
5. **Documentation** — Usage guidelines for every component`,
        order: 4,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'guitar-basics',
    title: 'Guitar for Absolute Beginners',
    description: 'Pick up the guitar and start playing songs within weeks. Learn chords, strumming patterns, fingerpicking, and music theory basics in a fun, structured way.',
    instructor: 'Jake Morrison',
    instructorAvatar: 'JM',
    difficulty: 'Beginner',
    duration: '4 weeks',
    category: 'Music',
    enrolledCount: 156,
    rating: 4.6,
    thumbnail: '🎸',
    tags: ['Guitar', 'Music', 'Creative'],
    lessons: [
      {
        id: 'guitar-1',
        title: 'Your First Guitar Chords',
        description: 'Learn the essential open chords: Em, Am, C, G, D.',
        duration: '35 min',
        content: `# Your First Guitar Chords

## The Big 5 Open Chords

These five chords will let you play hundreds of songs:

### Em (E minor)
- Easiest chord! Place fingers on 2nd fret of A and D strings
- Strum all 6 strings

### Am (A minor)
- Place fingers on 1st fret of B, 2nd fret of D and G strings
- Strum from the A string down

### Practice Tips
1. Press down firmly right behind the fret
2. Check each string rings clearly
3. Practice switching between Em and Am slowly
4. Use a metronome starting at 60 BPM`,
        order: 1,
        isCompleted: false,
      },
      {
        id: 'guitar-2',
        title: 'Strumming Patterns',
        description: 'Master the most common strumming patterns for popular songs.',
        duration: '40 min',
        content: `# Strumming Patterns

## The Universal Pattern

Down, Down-Up, Up-Down-Up (D, DU, UDU)

This pattern works for 80% of pop and rock songs!

## Tips
- Keep your wrist loose
- The up-strum should only hit the thinner strings
- Tap your foot to keep time`,
        order: 2,
        isCompleted: false,
      },
      {
        id: 'guitar-3',
        title: 'Playing Your First Songs',
        description: 'Put chords and strumming together to play real songs.',
        duration: '45 min',
        content: `# Playing Your First Songs

## Song 1: "Horse With No Name" (Am → Em)
Just two chords! Perfect for beginners.

## Song 2: "Knockin' on Heaven's Door" (G → D → Am)
Classic Bob Dylan — three chord masterpiece.

## Song 3: "Wonderwall" (Em → G → D → Am)
The iconic Oasis song that every guitarist learns!`,
        order: 3,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'public-speaking',
    title: 'Mastering Public Speaking & Presentation',
    description: 'Overcome stage fright and become a confident, compelling speaker. Learn storytelling, slide design, body language, and audience engagement techniques.',
    instructor: 'Dr. Priya Sharma',
    instructorAvatar: 'PS',
    difficulty: 'Intermediate',
    duration: '4 weeks',
    category: 'Communication',
    enrolledCount: 203,
    rating: 4.8,
    thumbnail: '🎤',
    tags: ['Speaking', 'Leadership', 'Soft Skills'],
    lessons: [
      {
        id: 'speak-1',
        title: 'Conquering Stage Fright',
        description: 'Practical techniques to manage anxiety and build confidence.',
        duration: '40 min',
        content: `# Conquering Stage Fright

## The Truth About Nervousness

Even the best speakers get nervous. The goal isn't to eliminate anxiety — it's to channel it into energy.

## Techniques

1. **Box Breathing**: 4 seconds in, 4 hold, 4 out, 4 hold
2. **Power Posing**: 2 minutes before going on stage
3. **Visualization**: See yourself succeeding
4. **Audience as Friends**: They want you to succeed!`,
        order: 1,
        isCompleted: false,
      },
      {
        id: 'speak-2',
        title: 'The Art of Storytelling',
        description: 'Structure compelling narratives that captivate any audience.',
        duration: '50 min',
        content: `# The Art of Storytelling

## The Story Arc

Every great presentation tells a story:

1. **Hook** — Grab attention in the first 30 seconds
2. **Problem** — Create tension
3. **Journey** — Share the experience
4. **Resolution** — Deliver the insight
5. **Call to Action** — What should they do next?

## The Rule of Three

People remember things in groups of three. Structure your key points accordingly.`,
        order: 2,
        isCompleted: false,
      },
      {
        id: 'speak-3',
        title: 'Body Language & Voice Control',
        description: 'Non-verbal communication mastery for powerful delivery.',
        duration: '45 min',
        content: `# Body Language & Voice Control

## Power Gestures
- Open palms = Trust
- Steepling fingers = Confidence
- Purposeful movement = Energy

## Voice Techniques
- **Pace**: Vary your speed
- **Pause**: The most powerful tool in speaking
- **Projection**: Speak to the back of the room
- **Pitch**: Use vocal variety to keep interest`,
        order: 3,
        isCompleted: false,
      },
      {
        id: 'speak-4',
        title: 'Slide Design That Doesn\'t Suck',
        description: 'Create visually stunning presentations that amplify your message.',
        duration: '35 min',
        content: `# Slide Design That Doesn't Suck

## The Golden Rules

1. **One idea per slide** — If it needs a bullet list, it needs more slides
2. **10/20/30 Rule** — 10 slides, 20 minutes, 30pt font minimum
3. **Full-bleed images** — Use high-quality images that fill the screen
4. **Contrast** — Dark background + light text or vice versa
5. **Whitespace** — Let your slides breathe`,
        order: 4,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'machine-learning-intro',
    title: 'Machine Learning: A Practical Introduction',
    description: 'Understand ML concepts and build your first models. Covers supervised learning, neural networks, model evaluation, and real-world applications with hands-on projects.',
    instructor: 'Dr. Wei Zhang',
    instructorAvatar: 'WZ',
    difficulty: 'Advanced',
    duration: '10 weeks',
    category: 'Data Science',
    enrolledCount: 412,
    rating: 4.9,
    thumbnail: '🤖',
    tags: ['ML', 'AI', 'Python', 'Deep Learning'],
    lessons: [
      {
        id: 'ml-1',
        title: 'What is Machine Learning?',
        description: 'Overview of ML paradigms: supervised, unsupervised, reinforcement learning.',
        duration: '50 min',
        content: `# What is Machine Learning?

Machine Learning is a subset of AI that enables systems to learn from data without being explicitly programmed.

## Types of ML

### Supervised Learning
- Input → Output mapping
- Examples: Classification, Regression
- Algorithms: Linear Regression, Decision Trees, Neural Networks

### Unsupervised Learning
- Finding patterns in unlabeled data
- Examples: Clustering, Dimensionality Reduction
- Algorithms: K-Means, PCA, Autoencoders

### Reinforcement Learning
- Learning through trial and error
- Agent interacts with environment
- Examples: Game AI, Robotics`,
        order: 1,
        isCompleted: false,
      },
      {
        id: 'ml-2',
        title: 'Linear Regression from Scratch',
        description: 'Build and understand linear regression step by step.',
        duration: '60 min',
        content: `# Linear Regression from Scratch

## The Math

y = mx + b

We find m and b that minimize the Mean Squared Error:

MSE = (1/n) * Σ(y_actual - y_predicted)²

## Implementation

\`\`\`python
import numpy as np

class LinearRegression:
    def __init__(self, lr=0.01, epochs=1000):
        self.lr = lr
        self.epochs = epochs
    
    def fit(self, X, y):
        self.m = 0
        self.b = 0
        n = len(X)
        
        for _ in range(self.epochs):
            y_pred = self.m * X + self.b
            dm = (-2/n) * np.sum(X * (y - y_pred))
            db = (-2/n) * np.sum(y - y_pred)
            self.m -= self.lr * dm
            self.b -= self.lr * db
\`\`\``,
        order: 2,
        isCompleted: false,
      },
      {
        id: 'ml-3',
        title: 'Neural Networks Fundamentals',
        description: 'Understanding perceptrons, activation functions, and backpropagation.',
        duration: '70 min',
        content: `# Neural Networks Fundamentals

## The Perceptron

A single neuron that takes inputs, applies weights, sums them, and passes through an activation function.

## Activation Functions

- **ReLU**: f(x) = max(0, x) — Most common
- **Sigmoid**: f(x) = 1/(1+e^-x) — For probabilities
- **Tanh**: f(x) = (e^x - e^-x)/(e^x + e^-x) — Centered output

## Backpropagation

The algorithm that makes neural networks learn:
1. Forward pass — compute predictions
2. Calculate loss
3. Backward pass — compute gradients
4. Update weights`,
        order: 3,
        isCompleted: false,
      },
      {
        id: 'ml-4',
        title: 'Model Evaluation & Metrics',
        description: 'Accuracy, precision, recall, F1, and cross-validation explained.',
        duration: '45 min',
        content: `# Model Evaluation & Metrics

## Classification Metrics

- **Accuracy** = (TP + TN) / Total
- **Precision** = TP / (TP + FP) — "Of predicted positives, how many are correct?"
- **Recall** = TP / (TP + FN) — "Of actual positives, how many did we find?"
- **F1 Score** = 2 * (Precision * Recall) / (Precision + Recall)

## Cross-Validation

Split data into k folds, train on k-1, test on 1, rotate. Gives robust performance estimate.`,
        order: 4,
        isCompleted: false,
      },
      {
        id: 'ml-5',
        title: 'Building a Complete ML Pipeline',
        description: 'End-to-end project: data loading, preprocessing, training, and deployment.',
        duration: '75 min',
        content: `# Building a Complete ML Pipeline

## Steps

1. **Data Collection** — Gather and understand your dataset
2. **EDA** — Exploratory Data Analysis with visualizations
3. **Preprocessing** — Handle missing values, encoding, scaling
4. **Feature Engineering** — Create meaningful features
5. **Model Selection** — Try multiple algorithms
6. **Hyperparameter Tuning** — Grid search, random search
7. **Evaluation** — Test set performance
8. **Deployment** — Serve model via API`,
        order: 5,
        isCompleted: false,
      },
    ],
  },
];

const CUSTOM_BOOTCAMPS_KEY = 'skillswap_custom_bootcamps';

export function getCustomBootcamps(): Bootcamp[] {
  try {
    const saved = localStorage.getItem(CUSTOM_BOOTCAMPS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCustomBootcamp(bootcamp: Bootcamp): void {
  const current = getCustomBootcamps();
  const existingIdx = current.findIndex((b) => b.id === bootcamp.id);
  if (existingIdx >= 0) {
    current[existingIdx] = bootcamp;
  } else {
    current.unshift(bootcamp);
  }
  localStorage.setItem(CUSTOM_BOOTCAMPS_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('skillswap_bootcamps_updated'));
}

export function deleteCustomBootcamp(id: string): void {
  const current = getCustomBootcamps();
  const filtered = current.filter((b) => b.id !== id);
  localStorage.setItem(CUSTOM_BOOTCAMPS_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('skillswap_bootcamps_updated'));
}

export function getAllBootcamps(): Bootcamp[] {
  const custom = getCustomBootcamps();
  const customIds = new Set(custom.map((b) => b.id));
  const remainingDefaults = bootcamps.filter((b) => !customIds.has(b.id));
  return [...custom, ...remainingDefaults];
}

export function getBootcampById(id: string): Bootcamp | undefined {
  return getAllBootcamps().find(b => b.id === id);
}

export function getLessonById(bootcampId: string, lessonId: string): Lesson | undefined {
  const bootcamp = getBootcampById(bootcampId);
  return bootcamp?.lessons.find(l => l.id === lessonId);
}

export const categories = ['All', 'Web Development', 'Data Science', 'Design', 'Music', 'Communication', 'AI & Machine Learning'];
export const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

