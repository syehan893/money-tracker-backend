# Finance OS Backend

A comprehensive financial management API built with Express.js, TypeScript, and Supabase.

## Features

- **Account Management**: Manage multiple account types (saving, spending, wallet, investment, business)
- **Income Tracking**: Track income with categories and monthly targets
- **Expense Tracking**: Track expenses with categories and monthly budgets
- **Transfers**: Inter-account transfers with balance validation
- **Subscriptions**: Manage recurring subscriptions with billing cycles
- **Dashboard**: Financial analytics and overview

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (JWT)

## Project Structure

```
src/
├── config/          # Configuration (env, database, constants)
├── middleware/      # Express middleware (auth, error, validation)
├── types/           # TypeScript type definitions
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── repositories/    # Database operations
├── routes/          # API route definitions
├── utils/           # Utility functions
├── validators/      # Request validation schemas
├── app.ts           # Express app setup
└── server.ts        # Server entry point

supabase/
└── migrations/      # SQL migrations
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-os-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Run Supabase migrations (in Supabase Dashboard or using CLI):
   - Execute `supabase/migrations/001_initial_schema.sql`
   - Execute `supabase/migrations/002_rls_policies.sql`
   - Execute `supabase/migrations/003_triggers_functions.sql`

## Development

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/me` | Get current user |
| PUT | `/api/v1/auth/profile` | Update profile |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| POST | `/api/v1/auth/refresh` | Refresh token |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts` | List accounts |
| GET | `/api/v1/accounts/:id` | Get account |
| POST | `/api/v1/accounts` | Create account |
| PUT | `/api/v1/accounts/:id` | Update account |
| DELETE | `/api/v1/accounts/:id` | Delete account |
| GET | `/api/v1/accounts/summary` | Get summary |

### Income Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/income-types` | List income types |
| GET | `/api/v1/income-types/:id` | Get income type |
| POST | `/api/v1/income-types` | Create income type |
| PUT | `/api/v1/income-types/:id` | Update income type |
| DELETE | `/api/v1/income-types/:id` | Delete income type |

### Incomes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/incomes` | List incomes |
| GET | `/api/v1/incomes/:id` | Get income |
| POST | `/api/v1/incomes` | Create income |
| PUT | `/api/v1/incomes/:id` | Update income |
| DELETE | `/api/v1/incomes/:id` | Delete income |
| GET | `/api/v1/incomes/monthly/:year/:month` | Monthly summary |
| GET | `/api/v1/incomes/target-progress` | Target progress |

### Expense Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/expense-types` | List expense types |
| GET | `/api/v1/expense-types/:id` | Get expense type |
| POST | `/api/v1/expense-types` | Create expense type |
| PUT | `/api/v1/expense-types/:id` | Update expense type |
| DELETE | `/api/v1/expense-types/:id` | Delete expense type |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/expenses` | List expenses |
| GET | `/api/v1/expenses/:id` | Get expense |
| POST | `/api/v1/expenses` | Create expense |
| PUT | `/api/v1/expenses/:id` | Update expense |
| DELETE | `/api/v1/expenses/:id` | Delete expense |
| GET | `/api/v1/expenses/monthly/:year/:month` | Monthly summary |
| GET | `/api/v1/expenses/budget-status` | Budget status |

### Transfers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transfers` | List transfers |
| GET | `/api/v1/transfers/:id` | Get transfer |
| POST | `/api/v1/transfers` | Create transfer |
| DELETE | `/api/v1/transfers/:id` | Delete transfer |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/subscriptions` | List subscriptions |
| GET | `/api/v1/subscriptions/:id` | Get subscription |
| POST | `/api/v1/subscriptions` | Create subscription |
| PUT | `/api/v1/subscriptions/:id` | Update subscription |
| DELETE | `/api/v1/subscriptions/:id` | Delete subscription |
| GET | `/api/v1/subscriptions/active` | Active subscriptions |
| GET | `/api/v1/subscriptions/upcoming` | Upcoming renewals |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/overview` | Financial overview |
| GET | `/api/v1/dashboard/monthly-summary/:year/:month` | Monthly breakdown |
| GET | `/api/v1/dashboard/trends` | Financial trends |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |

## License

ISC
