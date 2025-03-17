# Carbonly.ai Authentication System PRD

## Overview
Carbonly.ai is a multi-tenant SaaS platform focused on carbon management and sustainability. This PRD outlines the authentication system implementation using Supabase as the backend service.

## Current UI State
The application already has a well-designed UI for authentication with the following pages:
- Login page with email/password and social login options
- Signup page with company and user details
- Forgot password page
- Modern, responsive design with Tailwind CSS
- Shadcn UI components

## Material Library Module

### 1. Emission Factors Library

#### 1.1 Scope Categories
- Scope 1 (Direct Emissions)
  - Stationary Combustion
    - Natural Gas (m³)
    - Propane (L)
  - Mobile Combustion
    - Diesel (L)
    - Gasoline (L)
    
- Scope 2 (Indirect Emissions)
  - Purchased Electricity
  - Purchased Steam
  - Purchased Heating
  - Purchased Cooling

- Scope 3 (Value Chain Emissions)
  - Purchased Goods and Services
  - Capital Goods
  - Transportation and Distribution
  - Waste Management
  - Business Travel
  - Employee Commuting

#### 1.2 Material Properties
- Name
- Category (Stationary/Mobile Combustion)
- Unit of Measurement (m³, L, kWh)
- Emission Factor (kgCO₂e)
- Source (GHG Protocol, EPA)
- Documentation/References

### 2. Database Schema

#### 2.1 Emission Factors Table
```sql
create table public.emission_factors (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade,
  name text not null,
  category text not null,
  scope integer not null check (scope in (1, 2, 3)),
  unit text not null,
  emission_factor decimal not null,
  source text not null,
  documentation jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references public.users on delete set null,
  updated_by uuid references public.users on delete set null
);
```

### 3. Bulk Operations

#### 3.1 Import Features
- CSV Import with Template
  - Name, Category, Unit, Emission Factor, Source columns
  - Data validation for required fields
  - Duplicate detection based on name and category
  - Error reporting for invalid entries

#### 3.2 Export Features
- CSV Export
  - All fields export
  - Scope-based filtering
  - Category-based filtering

### 4. API Routes

#### 4.1 Emission Factors Routes
- `/api/emission-factors` - CRUD operations
- `/api/emission-factors/import` - Bulk import
- `/api/emission-factors/export` - Bulk export
- `/api/emission-factors/search` - Search and filter

### 5. UI Components

#### 5.1 Main Components
- Scope Tabs (Scope 1, 2, 3)
- Material Table
  - Sortable columns
  - Filterable fields
  - Pagination
  - Action buttons (edit, delete)
- Add Material Dialog
- Edit Material Dialog
- Import/Export Controls

#### 5.2 Mobile Components
- Responsive Table View
- Mobile-Optimized Forms
- Touch-Friendly Controls

### 6. Performance Considerations
- Pagination for large datasets
- Cached emission factors
- Optimized search indexing
- Efficient bulk operations

### 7. Security Considerations
- Role-based access control
- Audit logging for changes
- Data validation
- Input sanitization

### 8. Mobile App Integration
- Read-only offline access
- Sync capabilities
- Mobile-optimized views
- Quick search functionality

## Authentication Requirements

### 1. User Management
- Multi-tenant support with organization/company-based user management
- User roles and permissions system
- Email verification
- Password reset functionality
- Session management

### 2. Authentication Methods
- Email/Password authentication
- Social login (Google, Facebook)
- Magic link authentication (optional)
- Remember me functionality

### 3. Security Requirements
- Password hashing and salting
- JWT token management
- Rate limiting
- CSRF protection
- Secure session handling
- Password complexity requirements

### 4. Database Schema (Supabase)

#### Users Table
```sql
create table public.users (
  id uuid references auth.users on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);
```

#### Organizations Table
```sql
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

#### Organization Members Table
```sql
create table public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade,
  user_id uuid references public.users on delete cascade,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(organization_id, user_id)
);
```

### 5. Implementation Phases

#### Phase 1: Basic Authentication Setup
1. Set up Supabase project and configuration
2. Implement email/password authentication
3. Add session management
4. Implement protected routes
5. Add basic error handling

#### Phase 2: Organization Management
1. Implement organization creation during signup
2. Add organization member management
3. Implement role-based access control
4. Add organization switching functionality

#### Phase 3: Social Authentication
1. Implement Google OAuth
2. Implement Facebook OAuth
3. Add social login error handling
4. Implement account linking

#### Phase 4: Security Enhancements
1. Implement rate limiting
2. Add CSRF protection
3. Enhance password security
4. Add session management improvements

### 6. Technical Implementation Details

#### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Required Dependencies
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0",
  "next-auth": "^4.24.0"
}
```

### 7. API Routes

#### Authentication Routes
- `/api/auth/signup` - User registration
- `/api/auth/login` - User login
- `/api/auth/logout` - User logout
- `/api/auth/reset-password` - Password reset
- `/api/auth/verify-email` - Email verification

#### Organization Routes
- `/api/organizations` - Organization management
- `/api/organizations/members` - Organization member management

### 8. Testing Requirements
- Unit tests for authentication functions
- Integration tests for API routes
- E2E tests for authentication flows
- Security testing for authentication endpoints

### 9. Monitoring and Analytics
- Authentication success/failure rates
- User registration metrics
- Session duration analytics
- Error rate monitoring

## Next Steps
1. Set up Supabase project
2. Configure environment variables
3. Implement basic authentication
4. Add organization management
5. Implement social authentication
6. Add security enhancements
7. Implement monitoring
8. Add tests 