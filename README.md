# Legacy App

## 📁 Project Structure

```
repo-root/
├── apps/                        # Frontend and backend apps
│   ├── frontend/                # React/Next.js app (Amplify-ready)
│   └── backend/                 # Backend API (NestJS or Express)
├── lambda/                      # AWS Lambda functions (organized by domain)
│   ├── auth/                    # Auth-related Lambda functions
│   ├── orders/                  # Order-related Lambda functions
│   └── utils/                   # Utility functions (e.g., email, PDF)
├── infra/                       # Terraform or AWS CDK infrastructure
│   ├── network/                 # VPC, subnets, security groups
│   ├── database/                # RDS, DynamoDB, IAM policies
│   └── lambdas/                 # Lambda deployment configs
├── libs/                        # Shared libraries and DTOs
├── docs/                        # Markdown documentation
├── scripts/                     # DevOps & automation scripts
├── .github/                     # GitHub Actions workflows
├── README.md
├── package.json
└── tsconfig.json
```

## 📄 Naming Conventions

### ✅ Files and Folders
- Use `kebab-case` for file and folder names.
- Use `PascalCase` for classes, `camelCase` for variables/functions, and `UPPER_SNAKE_CASE` for constants.

### ✅ Database (SQL)
- Tables: `plural_snake_case` (e.g., `orders`, `invoice_items`)
- Columns: `snake_case` (e.g., `order_id`, `created_at`)
- Foreign keys: `{table}_id` format
- Timestamps: `created_at`, `updated_at`, `deleted_at`

## 🔐 Git & Branching

### Git Team Workflow
- git checkout development
- git pull origin development
- git checkout -b feature/your-new-feature

### Branch Naming
- `feature/<scope>`
- `fix/<issue>`
- `hotfix/<name>`
- `release/<version>`

### Branch Deletion Rules
✅ ALWAYS DELETE These Branches:
- `Feature branches after successful merge`
- `Bugfix branches after fix is deployed`
- `Hotfix branches after emergency fix`
- `Release branches after release is complete`

❌ NEVER DELETE These Branches:
- `main (production code)`
- `development (staging/integration)`

### Commit Message Format (Conventional Commits)
```
<type>(scope): short description
```

### Examples
- `feat(order): add order status enum`
- `fix(invoice): correct tax calculation`

## 🧪 Testing & Linting
- ESLint + Prettier for formatting
- Jest/Vitest for unit tests
- Cypress/Playwright for E2E
- CI/CD via GitHub Actions

## 🧾 Environment Configuration
- `.env`, `.env.staging`, `.env.production` for secrets and config
- Use AWS Secrets Manager or SSM for sensitive values

## 📄 Required Docs
- `README.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `NAMING-CONVENTIONS.md`

## 🧩 Code Review Checklist
- [ ] Naming conventions followed
- [ ] Tests written and pass
- [ ] Lint/formatting clean
- [ ] Documentation updated
- [ ] Secrets not hardcoded

---

> Built with ❤️ by Entvas Technology
