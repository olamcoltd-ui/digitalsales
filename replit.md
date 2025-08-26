# Overview

This is a full-stack digital marketplace application built for affiliate marketing and digital product distribution. The platform allows users to buy and sell digital products (ebooks, courses, graphics, etc.) while earning commissions through an affiliate system. Users can sign up, purchase products, become affiliates, and earn money through referrals and direct sales. The application includes subscription tiers, wallet management, analytics, and an admin panel for platform management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React 18 and TypeScript, using Vite as the build tool. The UI leverages shadcn/ui components with Radix UI primitives and Tailwind CSS for styling. The application follows a component-based architecture with:

- **Route-based code splitting**: Separate pages for different functionality (dashboard, products, admin, etc.)
- **Context-based state management**: AuthContext handles user authentication and profile management
- **Custom hooks and utilities**: Centralized API client and data service layers
- **Responsive design**: Mobile-first approach using Tailwind CSS

## Backend Architecture
The server uses Express.js with TypeScript running on Node.js. Key architectural decisions include:

- **Monorepo structure**: Client, server, and shared code in a single repository
- **Express middleware**: Custom logging, error handling, and authentication middleware
- **JWT-based authentication**: Stateless authentication using JSON Web Tokens
- **Modular routing**: Separate route handlers for different API endpoints
- **Development/production builds**: Vite for development, esbuild for production bundling

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations:

- **Database provider**: Neon serverless PostgreSQL
- **ORM**: Drizzle with schema-first approach
- **Migration system**: Drizzle Kit for database migrations
- **Connection pooling**: Neon serverless connection pooling

### Database Schema
- **Users table**: Authentication and basic user data
- **Profiles table**: Extended user information, referral codes, bank details
- **Products table**: Digital products with metadata, pricing, and file information
- **Wallets table**: User balance tracking and transaction history
- **Sales table**: Transaction records with commission calculations
- **Subscription plans/user subscriptions**: Tiered membership system
- **Withdrawal requests**: Payout management system
- **Referral tracking**: Commission and referral relationship management

## Authentication and Authorization
- **JWT tokens**: Stateless authentication stored in localStorage
- **bcrypt password hashing**: Secure password storage
- **Role-based access**: Admin vs regular user permissions
- **Protected routes**: Frontend route guards and backend middleware
- **Session management**: Token-based with automatic refresh

# External Dependencies

## Payment Processing
- **Paystack**: Primary payment gateway for Nigerian market
- **Stripe**: Secondary payment option (configured but not actively used)
- Custom payment utilities for amount formatting and transaction handling

## UI and Design System
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless UI primitives for complex interactions
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **esbuild**: Production backend bundling
- **TypeScript**: Type safety across the entire stack
- **React Query**: Server state management and caching

## Database and ORM
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Drizzle Kit**: Schema management and migrations

## Third-party Integrations
- **Replit**: Development environment integration
- **File upload handling**: Support for product files and thumbnails
- **Email notifications**: Integration ready for transactional emails
- **Analytics tracking**: Built-in dashboard analytics for sales and commissions

## Legacy Dependencies
The codebase includes some Supabase references that are being migrated to the current REST API architecture. These are maintained for compatibility during the transition period.