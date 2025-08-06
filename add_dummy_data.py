#!/usr/bin/env python3
"""
Add dummy data to Supabase database for better portfolio viewing
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta
import aiohttp

class SupabaseDataSeeder:
    def __init__(self):
        self.base_url = "https://kexmzaaufxbzegurxuqz.supabase.co"
        self.api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog"
        self.headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    async def add_profile_data(self):
        """Add profile data"""
        profile_data = {
            "id": str(uuid.uuid4()),
            "name": "Alex Thompson",
            "username": "alexthompson",
            "title": "Full Stack Developer & Data Scientist",
            "bio": "Passionate full-stack developer with 5+ years of experience building scalable web applications and machine learning solutions. Love creating beautiful user experiences and solving complex problems.",
            "email": "alex.thompson@portfolio.dev",
            "location": "San Francisco, CA",
            "website_url": "https://alexthompson.dev",
            "github_url": "https://github.com/alexthompson",
            "linkedin_url": "https://linkedin.com/in/alexthompson",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
            "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Machine Learning", "AWS", "PostgreSQL", "MongoDB", "Docker"],
            "stats": {
                "projects_completed": 25,
                "years_experience": 5,
                "clients_served": 15,
                "technologies_mastered": 12
            }
        }
        
        async with aiohttp.ClientSession() as session:
            url = f"{self.base_url}/rest/v1/profile"
            async with session.post(url, json=profile_data, headers=self.headers) as response:
                if response.status in [200, 201]:
                    print("✅ Profile data added successfully")
                    return await response.json()
                else:
                    print(f"❌ Failed to add profile data: {await response.text()}")
                    return None

    async def add_projects_data(self):
        """Add multiple projects"""
        projects = [
            {
                "id": str(uuid.uuid4()),
                "title": "E-Commerce Analytics Dashboard",
                "description": "A comprehensive analytics dashboard for e-commerce businesses built with React, D3.js, and real-time data visualization. Features include sales tracking, customer behavior analysis, inventory management, and predictive analytics using machine learning algorithms.",
                "category": "Data Analytics",
                "tags": ["React", "D3.js", "Node.js", "MongoDB", "Machine Learning", "TypeScript"],
                "github_url": "https://github.com/alexthompson/ecommerce-dashboard",
                "demo_url": "https://ecommerce-analytics-demo.vercel.app",
                "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
                "featured": True,
                "likes": 127,
                "views": 2840,
                "comments": 23
            },
            {
                "id": str(uuid.uuid4()),
                "title": "AI-Powered Task Management",
                "description": "An intelligent task management application that uses natural language processing to categorize and prioritize tasks automatically. Built with React, FastAPI, and OpenAI's GPT models for smart task suggestions and deadline predictions.",
                "category": "AI/ML",
                "tags": ["React", "Python", "FastAPI", "OpenAI", "NLP", "PostgreSQL"],
                "github_url": "https://github.com/alexthompson/ai-task-manager",
                "demo_url": "https://ai-tasks-demo.vercel.app",
                "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
                "featured": True,
                "likes": 89,
                "views": 1920,
                "comments": 18
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Real-Time Collaboration Platform",
                "description": "A modern collaboration platform with real-time document editing, video calls, and project management features. Built using Next.js, Socket.io, WebRTC, and includes advanced security features and role-based access control.",
                "category": "Web Development",
                "tags": ["Next.js", "Socket.io", "WebRTC", "TypeScript", "Tailwind CSS", "Redis"],
                "github_url": "https://github.com/alexthompson/collab-platform",
                "demo_url": "https://collab-demo.vercel.app",
                "image_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
                "featured": False,
                "likes": 156,
                "views": 3200,
                "comments": 31
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Mobile Fitness Tracker",
                "description": "A comprehensive fitness tracking mobile app built with React Native. Features workout planning, progress tracking, nutrition logging, and social features. Integrates with wearable devices and provides personalized workout recommendations.",
                "category": "Mobile Development",
                "tags": ["React Native", "TypeScript", "Firebase", "HealthKit", "Redux"],
                "github_url": "https://github.com/alexthompson/fitness-tracker",
                "demo_url": "https://fitness-app-demo.vercel.app",
                "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
                "featured": False,
                "likes": 94,
                "views": 1680,
                "comments": 15
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Cryptocurrency Portfolio Tracker",
                "description": "A sophisticated crypto portfolio management tool with real-time price tracking, profit/loss analysis, and market insights. Built with Vue.js, includes advanced charting, alert system, and supports multiple exchanges API integration.",
                "category": "FinTech",
                "tags": ["Vue.js", "Python", "WebSocket", "Chart.js", "CoinGecko API", "Docker"],
                "github_url": "https://github.com/alexthompson/crypto-tracker",
                "demo_url": "https://crypto-portfolio-demo.vercel.app",
                "image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
                "featured": False,
                "likes": 203,
                "views": 4120,
                "comments": 47
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Smart Home Automation Hub",
                "description": "An IoT-based smart home automation system with a beautiful web interface. Controls lighting, temperature, security cameras, and appliances. Built with React, Node.js, MQTT, and includes voice control integration with Alexa and Google Assistant.",
                "category": "IoT",
                "tags": ["React", "Node.js", "MQTT", "Raspberry Pi", "IoT", "Voice Recognition"],
                "github_url": "https://github.com/alexthompson/smart-home",
                "demo_url": "https://smart-home-demo.vercel.app",
                "image_url": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=400&fit=crop",
                "featured": False,
                "likes": 78,
                "views": 1450,
                "comments": 12
            }
        ]
        
        async with aiohttp.ClientSession() as session:
            url = f"{self.base_url}/rest/v1/projects"
            for project in projects:
                async with session.post(url, json=project, headers=self.headers) as response:
                    if response.status in [200, 201]:
                        print(f"✅ Added project: {project['title']}")
                    else:
                        print(f"❌ Failed to add project {project['title']}: {await response.text()}")

    async def add_blog_posts_data(self):
        """Add multiple blog posts"""
        blog_posts = [
            {
                "id": str(uuid.uuid4()),
                "title": "Building Scalable React Applications: Best Practices and Patterns",
                "slug": "building-scalable-react-applications",
                "content": """# Building Scalable React Applications: Best Practices and Patterns

When building large-scale React applications, following the right patterns and practices is crucial for maintainability and performance. In this comprehensive guide, we'll explore the essential strategies for creating robust React applications.

## Component Architecture

### Container and Presentational Components

One of the most important patterns in React is separating your components into containers and presentational components:

```javascript
// Container Component
const ProjectsContainer = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProjects().then(setProjects).finally(() => setLoading(false));
  }, []);
  
  return <ProjectsList projects={projects} loading={loading} />;
};

// Presentational Component
const ProjectsList = ({ projects, loading }) => {
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="projects-grid">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
```

## State Management

### Context API vs Redux

For medium to large applications, proper state management is essential:

```javascript
// Using Context API for global state
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  const value = {
    user,
    setUser,
    theme,
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light')
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
```

## Performance Optimization

### Memoization and Optimization Hooks

Use React's built-in optimization hooks to prevent unnecessary re-renders:

```javascript
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const memoizedValue = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);
  
  const handleUpdate = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);
  
  return (
    <div>
      <h3>Total: {memoizedValue}</h3>
      <button onClick={() => handleUpdate(data.id)}>Update</button>
    </div>
  );
});
```

## Testing Strategies

### Unit Testing with Jest and React Testing Library

Write comprehensive tests for your components:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

test('renders project card with correct information', () => {
  const mockProject = {
    id: '1',
    title: 'Test Project',
    description: 'Test Description'
  };
  
  render(<ProjectCard project={mockProject} />);
  
  expect(screen.getByText('Test Project')).toBeInTheDocument();
  expect(screen.getByText('Test Description')).toBeInTheDocument();
});
```

## Conclusion

Building scalable React applications requires careful consideration of architecture, state management, performance, and testing. By following these patterns and best practices, you'll be well-equipped to create maintainable and efficient React applications that can grow with your needs.""",
                "excerpt": "Learn the essential patterns and best practices for building large-scale React applications that are maintainable, performant, and scalable.",
                "tags": ["React", "JavaScript", "Best Practices", "Architecture", "Performance"],
                "image_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
                "published": True,
                "reading_time": 12,
                "likes": 245,
                "views": 5680
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Machine Learning in Web Development: Practical Applications",
                "slug": "machine-learning-web-development",
                "content": """# Machine Learning in Web Development: Practical Applications

The integration of machine learning into web applications has opened up exciting possibilities for creating more intelligent and personalized user experiences. Let's explore practical ways to implement ML in your web projects.

## Getting Started with TensorFlow.js

TensorFlow.js allows you to run machine learning models directly in the browser:

```javascript
import * as tf from '@tensorflow/tfjs';

// Load a pre-trained model
const model = await tf.loadLayersModel('/models/sentiment-analysis/model.json');

// Make predictions
const prediction = model.predict(tf.tensor2d([[0.5, 0.3, 0.8]]));
const result = await prediction.data();
```

## Practical Use Cases

### 1. Image Classification

```javascript
const classifyImage = async (imageElement) => {
  const model = await tf.loadLayersModel('/models/image-classifier/model.json');
  const tensor = tf.browser.fromPixels(imageElement)
    .resizeNearestNeighbor([224, 224])
    .expandDims()
    .div(255.0);
  
  const predictions = await model.predict(tensor).data();
  return predictions;
};
```

### 2. Recommendation Systems

```javascript
const getRecommendations = async (userId, userPreferences) => {
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, preferences: userPreferences })
  });
  
  return response.json();
};
```

### 3. Natural Language Processing

```javascript
const analyzeSentiment = async (text) => {
  const model = await tf.loadLayersModel('/models/sentiment/model.json');
  
  // Tokenize and preprocess text
  const tokens = tokenizeText(text);
  const tensor = tf.tensor2d([tokens]);
  
  const prediction = await model.predict(tensor).data();
  return {
    positive: prediction[0],
    negative: prediction[1],
    neutral: prediction[2]
  };
};
```

## Building Your Own Models

### Data Collection and Preparation

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# Load and prepare data
df = pd.read_csv('user_behavior.csv')
X = df[['page_views', 'time_spent', 'clicks', 'scroll_depth']]
y = df['conversion']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
```

### Model Training

```python
import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(4,)),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])

model.fit(X_train, y_train, epochs=100, batch_size=32)
```

## Deployment Strategies

### Client-Side vs Server-Side

Choose the right deployment strategy based on your needs:

- **Client-Side**: Better privacy, faster inference, works offline
- **Server-Side**: More powerful models, better security, centralized updates

## Best Practices

1. **Start Simple**: Begin with pre-trained models before building custom ones
2. **Monitor Performance**: Track model accuracy and inference time
3. **Handle Edge Cases**: Plan for when models fail or produce unexpected results
4. **User Privacy**: Be transparent about data usage and provide opt-out options

## Conclusion

Machine learning is no longer limited to data scientists. With modern tools and frameworks, web developers can integrate intelligent features into their applications, creating more engaging and personalized user experiences.""",
                "excerpt": "Discover how to integrate machine learning into web applications with practical examples using TensorFlow.js and modern ML techniques.",
                "tags": ["Machine Learning", "TensorFlow.js", "AI", "Web Development", "JavaScript"],
                "image_url": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
                "published": True,
                "reading_time": 15,
                "likes": 189,
                "views": 4230
            },
            {
                "id": str(uuid.uuid4()),
                "title": "The Future of Web Development: Trends and Technologies to Watch",
                "slug": "future-web-development-trends",
                "content": """# The Future of Web Development: Trends and Technologies to Watch

The web development landscape is constantly evolving, with new technologies and trends shaping how we build applications. Let's explore what the future holds for web developers.

## Emerging Frontend Technologies

### WebAssembly (WASM)

WebAssembly is revolutionizing web performance:

```rust
// Rust code compiled to WebAssembly
#[wasm_bindgen]
pub fn calculate_fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => calculate_fibonacci(n - 1) + calculate_fibonacci(n - 2),
    }
}
```

### Micro-Frontends Architecture

Breaking down monolithic frontends into smaller, manageable pieces:

```javascript
// Module federation with Webpack 5
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        header: 'header@http://localhost:3001/remoteEntry.js',
        footer: 'footer@http://localhost:3002/remoteEntry.js',
      },
    }),
  ],
};
```

## Backend Innovations

### Edge Computing

Running code closer to users for better performance:

```javascript
// Cloudflare Workers example
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const cache = caches.default
  const cacheKey = new Request(request.url, request)
  
  let response = await cache.match(cacheKey)
  
  if (!response) {
    response = await fetch(request)
    event.waitUntil(cache.put(cacheKey, response.clone()))
  }
  
  return response
}
```

### Serverless and JAMstack

```javascript
// Netlify Functions
exports.handler = async (event, context) => {
  const { name } = JSON.parse(event.body)
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello ${name}!`,
      timestamp: new Date().toISOString()
    })
  }
}
```

## AI-Driven Development

### Code Generation

AI tools are changing how we write code:

```javascript
// GitHub Copilot-style code completion
const generateUserProfile = (userData) => {
  // AI suggests the complete function implementation
  return {
    id: userData.id,
    name: userData.fullName,
    avatar: userData.profileImage || '/default-avatar.png',
    joinDate: new Date(userData.createdAt).toLocaleDateString(),
    stats: calculateUserStats(userData)
  };
};
```

### Automated Testing

```javascript
// AI-generated test cases
describe('User Profile Component', () => {
  test('displays user information correctly', async () => {
    const mockUser = generateMockUser();
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', mockUser.avatar);
  });
});
```

## Web3 and Decentralized Applications

### Blockchain Integration

```javascript
// Web3 integration example
import { ethers } from 'ethers';

const connectWallet = async () => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  }
  throw new Error('MetaMask not installed');
};
```

## Performance and User Experience

### Core Web Vitals Optimization

```javascript
// Measuring and optimizing Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Progressive Web Apps (PWA)

```javascript
// Service Worker for PWA
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/scripts/main.js',
        '/offline.html',
      ]);
    })
  );
});
```

## Developer Experience Improvements

### Hot Module Replacement (HMR)

```javascript
// Vite HMR API
if (import.meta.hot) {
  import.meta.hot.accept('./components/Button.vue', (newModule) => {
    // Update component without losing state
    updateComponent(newModule.default);
  });
}
```

## Security Considerations

### Zero-Trust Architecture

```javascript
// JWT validation middleware
const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Looking Ahead

The future of web development is exciting and full of possibilities. Key areas to focus on:

1. **Performance**: Core Web Vitals and user experience metrics
2. **Accessibility**: Making the web inclusive for everyone
3. **Sustainability**: Building energy-efficient applications
4. **Privacy**: Respecting user data and implementing privacy-first designs

## Conclusion

As web developers, staying current with these trends and technologies is essential. The key is to evaluate each new technology critically and adopt those that solve real problems and improve user experiences.""",
                "excerpt": "Explore the cutting-edge trends and technologies that are shaping the future of web development, from WebAssembly to AI-driven coding.",
                "tags": ["Web Development", "Future Tech", "WebAssembly", "AI", "Trends"],
                "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
                "published": True,
                "reading_time": 18,
                "likes": 312,
                "views": 7890
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Mastering TypeScript: Advanced Patterns and Techniques",
                "slug": "mastering-typescript-advanced-patterns",
                "content": """# Mastering TypeScript: Advanced Patterns and Techniques

TypeScript has become an essential tool for building robust, maintainable applications. Let's explore advanced patterns that will elevate your TypeScript skills.

## Advanced Type System Features

### Conditional Types

```typescript
type IsArray<T> = T extends any[] ? true : false;

type Test1 = IsArray<string[]>; // true
type Test2 = IsArray<string>;   // false

// Practical example
type Flatten<T> = T extends (infer U)[] ? U : T;

type StringArray = Flatten<string[]>; // string
type NumberType = Flatten<number>;    // number
```

### Mapped Types

```typescript
// Make all properties optional and nullable
type Partial<T> = {
  [P in keyof T]?: T[P] | null;
};

// Create a type with readonly properties
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Advanced mapped type example
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (value: T[K]) => void;
};

interface User {
  name: string;
  age: number;
}

type UserEventHandlers = EventHandlers<User>;
// Result: { onName: (value: string) => void; onAge: (value: number) => void; }
```

### Template Literal Types

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = `/api/${string}`;
type ApiCall = `${HttpMethod} ${ApiEndpoint}`;

// Usage
const validCall: ApiCall = 'GET /api/users'; // ✅
const invalidCall: ApiCall = 'INVALID /api/users'; // ❌
```

## Design Patterns in TypeScript

### Builder Pattern

```typescript
class QueryBuilder<T> {
  private query: Partial<T> = {};
  
  where<K extends keyof T>(field: K, value: T[K]): QueryBuilder<T> {
    this.query[field] = value;
    return this;
  }
  
  build(): Partial<T> {
    return { ...this.query };
  }
}

interface User {
  id: number;
  name: string;
  email: string;
}

const userQuery = new QueryBuilder<User>()
  .where('name', 'John')
  .where('email', 'john@example.com')
  .build();
```

### Factory Pattern with Generics

```typescript
interface Repository<T> {
  find(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

class DatabaseRepository<T> implements Repository<T> {
  constructor(private tableName: string) {}
  
  async find(id: string): Promise<T | null> {
    // Database logic here
    return null;
  }
  
  async save(entity: T): Promise<T> {
    // Save logic here
    return entity;
  }
  
  async delete(id: string): Promise<void> {
    // Delete logic here
  }
}

// Factory
class RepositoryFactory {
  static create<T>(tableName: string): Repository<T> {
    return new DatabaseRepository<T>(tableName);
  }
}

const userRepo = RepositoryFactory.create<User>('users');
```

## Advanced Utility Types

### Custom Utility Types

```typescript
// DeepPartial - makes all properties optional recursively
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Pick specific properties and make them required
type RequiredPick<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

// Extract function parameter types
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// Usage
function processUser(id: number, name: string, options?: { active: boolean }): void {}
type ProcessUserParams = Parameters<typeof processUser>; // [number, string, { active: boolean }?]
```

### Type Guards and Assertions

```typescript
// Custom type guard
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string';
}

// Assertion function
function assertIsUser(obj: any): asserts obj is User {
  if (!isUser(obj)) {
    throw new Error('Object is not a User');
  }
}

// Usage
const data: unknown = await fetchUserData();
if (isUser(data)) {
  // TypeScript knows data is User here
  console.log(data.name); // ✅ Type-safe
}
```

## Error Handling Patterns

### Result Type Pattern

```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchUser(id: number): Promise<Result<User, string>> {
  try {
    const user = await userService.getById(id);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Usage
const result = await fetchUser(123);
if (result.success) {
  console.log(result.data.name); // Type-safe access
} else {
  console.error(result.error); // Error handling
}
```

## Performance Optimization

### Lazy Loading with Types

```typescript
type LazyComponent<T> = () => Promise<{ default: T }>;

interface RouteConfig<T> {
  path: string;
  component: LazyComponent<T>;
  exact?: boolean;
}

// Usage
const routes: RouteConfig<React.ComponentType>[] = [
  {
    path: '/users',
    component: () => import('./pages/UsersPage'),
    exact: true
  },
  {
    path: '/settings',
    component: () => import('./pages/SettingsPage')
  }
];
```

### Branded Types for Type Safety

```typescript
// Branded types prevent mixing similar primitive types
type UserId = string & { readonly __brand: unique symbol };
type Email = string & { readonly __brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createEmail(email: string): Email {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  return email as Email;
}

// Usage
function getUser(id: UserId): Promise<User> {
  // Implementation
  return Promise.resolve({} as User);
}

const userId = createUserId('123');
const email = createEmail('user@example.com');

getUser(userId); // ✅ Correct
// getUser(email); // ❌ Type error - can't pass Email where UserId expected
```

## Testing with TypeScript

### Type-Safe Mocking

```typescript
// Type-safe mock generation
type MockedFunction<T extends (...args: any[]) => any> = T & {
  mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
  mockResolvedValue: ReturnType<T> extends Promise<infer U> 
    ? (value: U) => MockedFunction<T> 
    : never;
};

function createMock<T extends (...args: any[]) => any>(fn: T): MockedFunction<T> {
  const mockFn = jest.fn() as MockedFunction<T>;
  
  mockFn.mockReturnValue = (value: ReturnType<T>) => {
    mockFn.mockImplementation(() => value);
    return mockFn;
  };
  
  return mockFn;
}

// Usage
const mockUserService = {
  getById: createMock(userService.getById)
};

mockUserService.getById.mockReturnValue(Promise.resolve({ id: 1, name: 'John' }));
```

## Best Practices

1. **Use strict TypeScript configuration**
2. **Prefer composition over inheritance**
3. **Leverage the type system for runtime safety**
4. **Use branded types for domain modeling**
5. **Implement proper error handling patterns**

## Conclusion

Mastering these advanced TypeScript patterns will help you build more robust, maintainable, and type-safe applications. The key is to leverage TypeScript's powerful type system to catch errors at compile time and create better developer experiences.""",
                "excerpt": "Dive deep into advanced TypeScript patterns including conditional types, mapped types, and sophisticated design patterns for building robust applications.",
                "tags": ["TypeScript", "Advanced Programming", "Design Patterns", "Type Safety", "JavaScript"],
                "image_url": "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
                "published": True,
                "reading_time": 20,
                "likes": 167,
                "views": 3890
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Building Accessible Web Applications: A Complete Guide",
                "slug": "building-accessible-web-applications",
                "content": """# Building Accessible Web Applications: A Complete Guide

Web accessibility ensures that websites and applications are usable by people with disabilities. Let's explore how to build truly inclusive web experiences.

## Understanding Web Accessibility

### The WCAG Guidelines

The Web Content Accessibility Guidelines (WCAG) are organized around four principles:

1. **Perceivable** - Information must be presentable in ways users can perceive
2. **Operable** - Interface components must be operable
3. **Understandable** - Information and UI operation must be understandable
4. **Robust** - Content must be robust enough for various assistive technologies

## Semantic HTML Foundation

### Proper HTML Structure

```html
<!-- ✅ Good semantic structure -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/" aria-current="page">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <header>
      <h1>Article Title</h1>
      <p>Published on <time datetime="2024-01-15">January 15, 2024</time></p>
    </header>
    <section>
      <h2>Section Heading</h2>
      <p>Article content goes here...</p>
    </section>
  </article>
</main>

<aside aria-label="Related articles">
  <h2>Related Content</h2>
  <!-- Related content -->
</aside>
```

### Form Accessibility

```html
<!-- ✅ Accessible form -->
<form>
  <fieldset>
    <legend>Personal Information</legend>
    
    <div>
      <label for="name">Full Name *</label>
      <input 
        type="text" 
        id="name" 
        name="name" 
        required 
        aria-describedby="name-help"
        aria-invalid="false"
      />
      <small id="name-help">Enter your first and last name</small>
    </div>
    
    <div>
      <label for="email">Email Address *</label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        required 
        aria-describedby="email-error"
        aria-invalid="true"
      />
      <div id="email-error" role="alert" aria-live="polite">
        Please enter a valid email address
      </div>
    </div>
  </fieldset>
  
  <button type="submit" aria-describedby="submit-help">
    Submit Form
  </button>
  <small id="submit-help">All required fields must be completed</small>
</form>
```

## ARIA (Accessible Rich Internet Applications)

### Common ARIA Attributes

```html
<!-- Landmark roles -->
<div role="banner">Header content</div>
<div role="navigation" aria-label="Main menu">Navigation</div>
<div role="main">Main content</div>
<div role="complementary">Sidebar content</div>
<div role="contentinfo">Footer content</div>

<!-- Interactive elements -->
<button 
  aria-expanded="false" 
  aria-controls="menu-panel"
  aria-haspopup="true"
>
  Menu
</button>

<div 
  id="menu-panel" 
  role="menu" 
  aria-hidden="true"
  aria-labelledby="menu-button"
>
  <div role="menuitem">Menu Item 1</div>
  <div role="menuitem">Menu Item 2</div>
</div>
```

### Live Regions

```html
<!-- Status updates -->
<div aria-live="polite" aria-label="Status updates" id="status">
  <!-- Dynamic status messages appear here -->
</div>

<div aria-live="assertive" aria-label="Error messages" id="errors">
  <!-- Urgent error messages appear here -->
</div>

<div aria-atomic="true" aria-live="polite" id="timer">
  <span>Time remaining: </span>
  <span>5 minutes</span>
</div>
```

## Keyboard Navigation

### Focus Management

```javascript
// Custom focus trap for modals
class FocusTrap {
  constructor(element) {
    this.element = element;
    this.focusableElements = this.getFocusableElements();
    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }
  
  getFocusableElements() {
    return this.element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex="0"]'
    );
  }
  
  activate() {
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
    this.firstFocusableElement.focus();
  }
  
  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeydown.bind(this));
  }
  
  handleKeydown(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusableElement) {
          this.lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === this.lastFocusableElement) {
          this.firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      this.deactivate();
      // Close modal logic
    }
  }
}
```

### Skip Links

```html
<!-- Skip navigation for screen readers -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<nav>
  <!-- Navigation items -->
</nav>

<main id="main-content" tabindex="-1">
  <!-- Main content -->
</main>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
</style>
```

## Color and Contrast

### Ensuring Sufficient Contrast

```css
/* ✅ Good contrast ratios (4.5:1 for normal text, 3:1 for large text) */
.button-primary {
  background: #0066cc; /* Dark blue */
  color: #ffffff;      /* White text - meets WCAG AA */
}

.text-warning {
  color: #b8860b;      /* Dark goldenrod */
  background: #ffffff; /* Meets contrast requirements */
}

/* ❌ Poor contrast */
.bad-contrast {
  color: #cccccc;      /* Light gray */
  background: #ffffff; /* White - insufficient contrast */
}
```

### Don't Rely on Color Alone

```html
<!-- ✅ Good: Uses color + icons + text -->
<div class="message success">
  <span class="icon" aria-hidden="true">✓</span>
  <span class="sr-only">Success: </span>
  Form submitted successfully
</div>

<div class="message error">
  <span class="icon" aria-hidden="true">⚠</span>
  <span class="sr-only">Error: </span>
  Please correct the highlighted fields
</div>

<!-- ❌ Bad: Relies only on color -->
<div style="color: green;">Success</div>
<div style="color: red;">Error</div>
```

## Images and Media

### Alternative Text

```html
<!-- ✅ Informative images -->
<img 
  src="chart.png" 
  alt="Sales increased 25% from January to March 2024"
/>

<!-- ✅ Decorative images -->
<img 
  src="decorative-border.png" 
  alt="" 
  role="presentation"
/>

<!-- ✅ Complex images -->
<figure>
  <img 
    src="complex-chart.png" 
    alt="Quarterly sales data - see table below for details"
  />
  <figcaption>
    <p>Detailed description of the chart data...</p>
    <!-- Or link to full description -->
    <a href="#chart-data">View detailed chart data</a>
  </figcaption>
</figure>
```

### Video Accessibility

```html
<!-- ✅ Accessible video -->
<video controls>
  <source src="video.mp4" type="video/mp4" />
  <source src="video.webm" type="video/webm" />
  
  <!-- Captions -->
  <track 
    kind="captions" 
    src="captions.vtt" 
    srclang="en" 
    label="English captions"
    default
  />
  
  <!-- Audio descriptions -->
  <track 
    kind="descriptions" 
    src="descriptions.vtt" 
    srclang="en" 
    label="Audio descriptions"
  />
  
  <p>Your browser doesn't support video. 
     <a href="video.mp4">Download the video</a>
  </p>
</video>
```

## React Accessibility

### Accessible React Components

```jsx
// Accessible Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
  const modalRef = useRef(null);
  const [focusTrap, setFocusTrap] = useState(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const trap = new FocusTrap(modalRef.current);
      trap.activate();
      setFocusTrap(trap);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        trap.deactivate();
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay" 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <div className="modal-content">
        <header>
          <h2 id="modal-title">{title}</h2>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="close-button"
          >
            ×
          </button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
};
```

### Accessible Form Components

```jsx
const AccessibleInput = ({ 
  label, 
  error, 
  help, 
  required, 
  ...inputProps 
}) => {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const helpId = help ? `${id}-help` : undefined;
  
  const describedBy = [errorId, helpId].filter(Boolean).join(' ');
  
  return (
    <div className="input-group">
      <label htmlFor={id} className="input-label">
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>
      
      <input
        {...inputProps}
        id={id}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required ? 'true' : 'false'}
        className={`input ${error ? 'input-error' : ''}`}
      />
      
      {help && (
        <small id={helpId} className="input-help">
          {help}
        </small>
      )}
      
      {error && (
        <div id={errorId} role="alert" className="input-error-message">
          {error}
        </div>
      )}
    </div>
  );
};
```

## Testing Accessibility

### Automated Testing Tools

```javascript
// Jest + @testing-library/jest-dom
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button Component', () => {
  test('should be accessible', async () => {
    const { container } = render(
      <button>Click me</button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('should have proper ARIA attributes', () => {
    render(
      <button aria-expanded="false" aria-controls="menu">
        Menu
      </button>
    );
    
    const button = screen.getByRole('button', { name: 'Menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'menu');
  });
});
```

### Manual Testing Checklist

1. **Navigate using only keyboard**
2. **Test with screen reader**
3. **Check color contrast ratios**
4. **Verify focus indicators are visible**
5. **Test with zoom at 200%**
6. **Validate HTML semantics**

## Best Practices Summary

1. **Start with semantic HTML**
2. **Use ARIA appropriately, not excessively**
3. **Ensure keyboard accessibility**
4. **Provide sufficient color contrast**
5. **Include alternative text for images**
6. **Test with real users and assistive technologies**
7. **Make accessibility part of your development process**

## Conclusion

Building accessible web applications is not just about compliance—it's about creating inclusive experiences for all users. By following these guidelines and making accessibility a priority from the start, we can build a more inclusive web for everyone.""",
                "excerpt": "A comprehensive guide to building accessible web applications, covering WCAG guidelines, ARIA, keyboard navigation, and testing strategies.",
                "tags": ["Accessibility", "Web Development", "WCAG", "ARIA", "Inclusive Design"],
                "image_url": "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=400&fit=crop",
                "published": True,
                "reading_time": 22,
                "likes": 145,
                "views": 2890
            }
        ]
        
        async with aiohttp.ClientSession() as session:
            url = f"{self.base_url}/rest/v1/blog_posts"
            for post in blog_posts:
                async with session.post(url, json=post, headers=self.headers) as response:
                    if response.status in [200, 201]:
                        print(f"✅ Added blog post: {post['title']}")
                    else:
                        print(f"❌ Failed to add blog post {post['title']}: {await response.text()}")

    async def seed_all_data(self):
        """Add all dummy data to the database"""
        print("🌱 Starting data seeding...")
        
        await self.add_profile_data()
        await self.add_projects_data()
        await self.add_blog_posts_data()
        
        print("✅ Data seeding completed!")

if __name__ == "__main__":
    seeder = SupabaseDataSeeder()
    asyncio.run(seeder.seed_all_data())