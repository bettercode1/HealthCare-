# Healthcare Dashboard Demo Application

## Overview

This is a full-stack healthcare dashboard demo application built with modern web technologies. The application provides role-based access for patients, doctors, and labs with comprehensive healthcare management features including AI-powered health analysis, prescription management, appointment scheduling, and family health tracking.

The application features a professional landing page showcasing the product's capabilities and pricing plans, followed by a secure dashboard environment where authenticated users can access role-specific functionality. The system supports real-time data operations and includes advanced features like file uploads, data visualization, and intelligent health insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **UI Framework**: Custom component library using Radix UI primitives with Tailwind CSS for styling
- **Component Architecture**: Modular component structure with separation between landing page and dashboard components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Development Server**: Vite for fast development and hot module replacement
- **Build System**: ESBuild for production bundling with external package handling
- **API Design**: RESTful API structure with /api prefix routing

### Authentication & Authorization
- **Authentication Provider**: Firebase Authentication for secure user management
- **Authorization Pattern**: Role-based access control (RBAC) with three distinct roles:
  - Patient: Access to personal health data, family management, appointment scheduling
  - Doctor: Patient management, prescription creation, appointment handling
  - Lab: Report upload and management for patients
- **Context Pattern**: React Context API for authentication state management across components

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Cloud Database**: Neon serverless PostgreSQL for scalable data storage
- **File Storage**: Firebase Cloud Storage for secure medical document and report storage
- **Schema Management**: Drizzle migrations with comprehensive health data modeling
- **Real-time Updates**: Firestore real-time listeners for live data synchronization

### Data Models
The application uses a comprehensive relational schema including:
- Users with role-based differentiation and plan management
- Medical reports with file associations and metadata
- Prescription management linking doctors and patients
- Family member profiles for household health management
- Medication dose tracking with status monitoring
- Appointment scheduling with status workflows

### UI/UX Design System
- **Design Language**: Modern healthcare-focused design with professional aesthetics
- **Component Library**: Shadcn/ui components with customized healthcare theming
- **Responsive Design**: Mobile-first approach with Tailwind CSS responsive utilities
- **Color Scheme**: Healthcare-appropriate color palette with primary blues and secondary greens
- **Typography**: Inter font family for optimal readability
- **Icons**: Material Icons for consistent visual language

### Data Visualization
- **Charting Library**: Recharts for healthcare metrics visualization
- **Chart Types**: Line charts for health trends, pie charts for condition distribution, bar charts for symptom tracking
- **Interactive Elements**: Responsive charts with tooltips and legends for data exploration

## External Dependencies

### Cloud Services
- **Firebase Suite**:
  - Authentication for user management and security
  - Firestore for real-time database operations
  - Cloud Storage for medical file uploads and management
- **Neon Database**: Serverless PostgreSQL for primary data storage with automatic scaling

### Development Tools
- **Replit Integration**: Development environment integration with cartographer and runtime error handling
- **Build Tools**: Vite for development, ESBuild for production optimization
- **Type Safety**: TypeScript across the entire stack with strict type checking

### UI Libraries
- **Component Framework**: Radix UI for accessible, unstyled component primitives
- **Styling**: Tailwind CSS for utility-first styling approach
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Notifications**: Custom toast system for user feedback

### Data Management
- **ORM**: Drizzle ORM for type-safe database interactions
- **Schema Validation**: Zod for runtime type validation and form schemas
- **Query Management**: TanStack Query for efficient server state management

### Deployment & Performance
- **Database Migration**: Drizzle Kit for schema management and migrations
- **Environment Configuration**: Environment-based configuration for development and production
- **Performance Optimization**: Code splitting, lazy loading, and optimized bundle sizes