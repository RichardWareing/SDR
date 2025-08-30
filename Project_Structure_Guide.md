# SDR Management System - Project Structure Guide

## Recommended Folder Structure

```
sdr-management-system/
├── 📁 .github/                          # GitHub workflows and templates
│   ├── workflows/
│   │   ├── ci-cd.yml                    # Main CI/CD pipeline
│   │   ├── security-scan.yml            # Security scanning workflow
│   │   ├── performance-test.yml         # Performance testing
│   │   └── deploy-prod.yml              # Production deployment
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── security_report.md
│   └── pull_request_template.md
│
├── 📁 .vscode/                          # VS Code configuration
│   ├── settings.json                    # Workspace settings
│   ├── extensions.json                  # Recommended extensions
│   ├── launch.json                      # Debug configurations
│   └── tasks.json                       # Build tasks
│
├── 📁 apps/                             # Main applications (monorepo structure)
│   ├── 📁 frontend/                     # React web application
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   ├── manifest.json            # PWA manifest
│   │   │   ├── sw.js                    # Service worker
│   │   │   └── icons/                   # App icons
│   │   ├── src/
│   │   │   ├── 📁 app/                  # App shell and global setup
│   │   │   │   ├── App.tsx
│   │   │   │   ├── store/               # Redux store configuration
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── rootReducer.ts
│   │   │   │   │   └── middleware.ts
│   │   │   │   └── router/              # Route configuration
│   │   │   │       ├── AppRouter.tsx
│   │   │   │       ├── ProtectedRoute.tsx
│   │   │   │       └── routes.ts
│   │   │   ├── 📁 features/             # Feature-based organization
│   │   │   │   ├── 📁 auth/             # Authentication feature
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   │   ├── UserProfile.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useAuth.ts
│   │   │   │   │   │   ├── usePermissions.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── authService.ts
│   │   │   │   │   │   ├── permissionService.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── store/
│   │   │   │   │   │   ├── authSlice.ts
│   │   │   │   │   │   ├── userSlice.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── types/
│   │   │   │   │   │   ├── auth.types.ts
│   │   │   │   │   │   ├── user.types.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 sdr/              # SDR management feature
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── CreateSDRForm.tsx
│   │   │   │   │   │   ├── SDRDashboard.tsx
│   │   │   │   │   │   ├── SDRDetails.tsx
│   │   │   │   │   │   ├── SDRList.tsx
│   │   │   │   │   │   ├── StatusIndicator.tsx
│   │   │   │   │   │   ├── FileUpload.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useSDRs.ts
│   │   │   │   │   │   ├── useSDRMutations.ts
│   │   │   │   │   │   ├── useFileUpload.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── sdrApi.ts
│   │   │   │   │   │   ├── fileService.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── store/
│   │   │   │   │   │   ├── sdrSlice.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── types/
│   │   │   │   │   │   ├── sdr.types.ts
│   │   │   │   │   │   ├── api.types.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   ├── sdrValidation.ts
│   │   │   │   │   │   ├── statusHelpers.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 teams/            # Teams integration
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── types/
│   │   │   │   ├── 📁 analytics/        # Analytics and reporting
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── MetricsDashboard.tsx
│   │   │   │   │   │   ├── PerformanceCharts.tsx
│   │   │   │   │   │   └── ReportGenerator.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── types/
│   │   │   │   └── 📁 admin/             # Admin functionality
│   │   │   │       ├── components/
│   │   │   │       ├── hooks/
│   │   │   │       ├── services/
│   │   │   │       └── types/
│   │   │   ├── 📁 shared/               # Shared utilities
│   │   │   │   ├── 📁 components/       # Reusable UI components
│   │   │   │   │   ├── ui/              # Basic UI components
│   │   │   │   │   │   ├── Button/
│   │   │   │   │   │   │   ├── Button.tsx
│   │   │   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   │   │   ├── Button.stories.tsx
│   │   │   │   │   │   │   ├── Button.module.css
│   │   │   │   │   │   │   └── index.ts
│   │   │   │   │   │   ├── Input/
│   │   │   │   │   │   ├── Modal/
│   │   │   │   │   │   ├── Table/
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── layout/          # Layout components
│   │   │   │   │   │   ├── Header/
│   │   │   │   │   │   ├── Sidebar/
│   │   │   │   │   │   ├── Footer/
│   │   │   │   │   │   └── PageLayout/
│   │   │   │   │   ├── forms/           # Form components
│   │   │   │   │   │   ├── FormField/
│   │   │   │   │   │   ├── DatePicker/
│   │   │   │   │   │   └── FileUpload/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 hooks/            # Shared hooks
│   │   │   │   │   ├── useApi.ts
│   │   │   │   │   ├── useLocalStorage.ts
│   │   │   │   │   ├── useDebounce.ts
│   │   │   │   │   ├── usePagination.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 services/         # Shared services
│   │   │   │   │   ├── apiClient.ts
│   │   │   │   │   ├── httpService.ts
│   │   │   │   │   ├── cacheService.ts
│   │   │   │   │   ├── notificationService.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 types/            # Global types
│   │   │   │   │   ├── api.types.ts
│   │   │   │   │   ├── common.types.ts
│   │   │   │   │   ├── environment.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 utils/            # Utility functions
│   │   │   │   │   ├── formatters.ts
│   │   │   │   │   ├── validators.ts
│   │   │   │   │   ├── dateUtils.ts
│   │   │   │   │   ├── errorHandlers.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 config/           # Configuration
│   │   │   │   │   ├── api.config.ts
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   ├── theme.config.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── 📁 constants/        # Global constants
│   │   │   │       ├── routes.ts
│   │   │   │       ├── apiEndpoints.ts
│   │   │   │       ├── statusCodes.ts
│   │   │   │       └── index.ts
│   │   │   ├── 📁 assets/               # Static assets
│   │   │   │   ├── images/
│   │   │   │   ├── icons/
│   │   │   │   ├── fonts/
│   │   │   │   └── styles/
│   │   │   │       ├── globals.css
│   │   │   │       ├── variables.css
│   │   │   │       └── components.css
│   │   │   ├── index.tsx
│   │   │   └── setupTests.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts               # Vite configuration
│   │   ├── tailwind.config.js           # Tailwind CSS config
│   │   ├── .eslintrc.js
│   │   └── jest.config.js
│   │
│   ├── 📁 api/                          # Azure Functions backend
│   │   ├── 📁 src/
│   │   │   ├── 📁 functions/            # Function endpoints
│   │   │   │   ├── 📁 sdr/              # SDR-related functions
│   │   │   │   │   ├── createSDR/
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── function.json
│   │   │   │   │   │   └── createSDR.test.ts
│   │   │   │   │   ├── getSDRs/
│   │   │   │   │   ├── updateSDR/
│   │   │   │   │   ├── deleteSDR/
│   │   │   │   │   └── assignDeveloper/
│   │   │   │   ├── 📁 files/            # File management functions
│   │   │   │   │   ├── uploadFile/
│   │   │   │   │   ├── downloadFile/
│   │   │   │   │   └── deleteFile/
│   │   │   │   ├── 📁 ai/               # AI processing functions
│   │   │   │   │   ├── processEmail/
│   │   │   │   │   ├── extractDocument/
│   │   │   │   │   └── validateExtraction/
│   │   │   │   ├── 📁 notifications/    # Notification functions
│   │   │   │   │   ├── sendTeamsNotification/
│   │   │   │   │   ├── sendEmail/
│   │   │   │   │   └── webhookHandler/
│   │   │   │   ├── 📁 analytics/        # Analytics functions
│   │   │   │   │   ├── calculateMetrics/
│   │   │   │   │   ├── generateReport/
│   │   │   │   │   └── exportData/
│   │   │   │   └── 📁 system/           # System functions
│   │   │   │       ├── health/
│   │   │   │       ├── version/
│   │   │   │       └── diagnostics/
│   │   │   ├── 📁 shared/               # Shared backend code
│   │   │   │   ├── 📁 services/         # Business logic services
│   │   │   │   │   ├── DevOpsService.ts
│   │   │   │   │   ├── AIService.ts
│   │   │   │   │   ├── StorageService.ts
│   │   │   │   │   ├── NotificationService.ts
│   │   │   │   │   ├── ValidationService.ts
│   │   │   │   │   ├── SecurityService.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 middleware/       # Function middleware
│   │   │   │   │   ├── authMiddleware.ts
│   │   │   │   │   ├── validationMiddleware.ts
│   │   │   │   │   ├── errorMiddleware.ts
│   │   │   │   │   ├── loggingMiddleware.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 types/            # Type definitions
│   │   │   │   │   ├── sdr.types.ts
│   │   │   │   │   ├── devops.types.ts
│   │   │   │   │   ├── ai.types.ts
│   │   │   │   │   ├── storage.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 utils/            # Utility functions
│   │   │   │   │   ├── validation.ts
│   │   │   │   │   ├── auth.ts
│   │   │   │   │   ├── logging.ts
│   │   │   │   │   ├── errorHandling.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 config/           # Configuration
│   │   │   │   │   ├── environment.ts
│   │   │   │   │   ├── devops.config.ts
│   │   │   │   │   ├── ai.config.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── 📁 constants/        # Constants
│   │   │   │       ├── statusCodes.ts
│   │   │   │       ├── errorMessages.ts
│   │   │   │       └── index.ts
│   │   │   └── 📁 tests/                # Backend tests
│   │   │       ├── unit/
│   │   │       ├── integration/
│   │   │       └── helpers/
│   │   ├── host.json
│   │   ├── local.settings.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.js
│   │
│   └── 📁 teams-bot/                    # Microsoft Teams Bot
│       ├── src/
│       │   ├── 📁 bots/                 # Bot implementation
│       │   │   ├── SDRBot.ts
│       │   │   ├── ConversationBot.ts
│       │   │   └── index.ts
│       │   ├── 📁 dialogs/              # Conversation dialogs
│       │   │   ├── SDRCreationDialog.ts
│       │   │   ├── ApprovalDialog.ts
│       │   │   ├── StatusDialog.ts
│       │   │   └── index.ts
│       │   ├── 📁 cards/                # Adaptive cards
│       │   │   ├── sdrCreationCard.ts
│       │   │   ├── approvalCard.ts
│       │   │   ├── statusUpdateCard.ts
│       │   │   └── index.ts
│       │   ├── 📁 services/             # Bot services
│       │   │   ├── botService.ts
│       │   │   ├── adaptiveCardService.ts
│       │   │   ├── conversationService.ts
│       │   │   └── index.ts
│       │   ├── 📁 middleware/           # Bot middleware
│       │   │   ├── authMiddleware.ts
│       │   │   ├── loggingMiddleware.ts
│       │   │   └── index.ts
│       │   ├── 📁 types/                # Bot-specific types
│       │   │   ├── bot.types.ts
│       │   │   ├── card.types.ts
│       │   │   └── index.ts
│       │   ├── 📁 utils/                # Bot utilities
│       │   │   ├── cardHelpers.ts
│       │   │   ├── conversationHelpers.ts
│       │   │   └── index.ts
│       │   ├── index.ts
│       │   └── server.ts
│       ├── manifest/                    # Teams app manifest
│       │   ├── manifest.json
│       │   ├── color.png
│       │   └── outline.png
│       ├── package.json
│       ├── tsconfig.json
│       └── jest.config.js
│
├── 📁 packages/                         # Shared packages (if using monorepo)
│   ├── 📁 shared-types/                 # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── sdr.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── api.types.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── 📁 shared-utils/                 # Shared utility functions
│   │   ├── src/
│   │   │   ├── validation.ts
│   │   │   ├── formatters.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── 📁 eslint-config/                # Shared ESLint configuration
│       ├── index.js
│       └── package.json
│
├── 📁 infrastructure/                   # Infrastructure as Code
│   ├── 📁 bicep/                        # Bicep templates
│   │   ├── 📁 modules/                  # Reusable modules
│   │   │   ├── core-infrastructure.bicep
│   │   │   ├── application-services.bicep
│   │   │   ├── security.bicep
│   │   │   ├── monitoring.bicep
│   │   │   └── networking.bicep
│   │   ├── main.bicep                   # Main template
│   │   └── shared.bicep                 # Shared resources
│   ├── 📁 parameters/                   # Environment parameters
│   │   ├── dev.json
│   │   ├── test.json
│   │   ├── uat.json
│   │   ├── staging.json
│   │   └── prod.json
│   ├── 📁 scripts/                      # Deployment scripts
│   │   ├── deploy.ps1
│   │   ├── setup-devops.ps1
│   │   ├── create-service-principal.ps1
│   │   └── cleanup.ps1
│   └── 📁 policies/                     # Azure Policies
│       ├── security-policies.json
│       ├── compliance-policies.json
│       └── governance-policies.json
│
├── 📁 tests/                            # Test suites
│   ├── 📁 e2e/                          # End-to-end tests
│   │   ├── 📁 fixtures/                 # Test fixtures
│   │   ├── 📁 page-objects/             # Page object models
│   │   │   ├── LoginPage.ts
│   │   │   ├── DashboardPage.ts
│   │   │   ├── CreateSDRPage.ts
│   │   │   └── index.ts
│   │   ├── 📁 specs/                    # Test specifications
│   │   │   ├── auth.spec.ts
│   │   │   ├── sdr-creation.spec.ts
│   │   │   ├── workflows.spec.ts
│   │   │   └── teams-integration.spec.ts
│   │   ├── 📁 utils/                    # Test utilities
│   │   │   ├── testHelpers.ts
│   │   │   ├── dataFactory.ts
│   │   │   └── index.ts
│   │   ├── playwright.config.ts
│   │   └── package.json
│   ├── 📁 performance/                  # Performance tests
│   │   ├── load-test.js                 # k6 load tests
│   │   ├── stress-test.js               # Stress tests
│   │   ├── spike-test.js                # Spike tests
│   │   ├── volume-test.js               # Volume tests
│   │   └── validate-results.js          # Result validation
│   ├── 📁 security/                     # Security tests
│   │   ├── dast-config.yaml             # DAST configuration
│   │   ├── security-tests.spec.ts       # Security test specs
│   │   └── penetration-tests.md         # Pen test procedures
│   └── 📁 integration/                  # Cross-service integration tests
│       ├── api-integration.spec.ts
│       ├── devops-integration.spec.ts
│       ├── teams-integration.spec.ts
│       └── ai-integration.spec.ts
│
├── 📁 tools/                            # Development tools and scripts
│   ├── 📁 scripts/                      # Build and utility scripts
│   │   ├── build.js                     # Build script
│   │   ├── dev-setup.js                 # Development setup
│   │   ├── seed-data.js                 # Test data seeding
│   │   ├── generate-types.js            # Type generation
│   │   └── cleanup.js                   # Cleanup script
│   ├── 📁 generators/                   # Code generators
│   │   ├── component-generator.js
│   │   ├── function-generator.js
│   │   └── test-generator.js
│   ├── 📁 config/                       # Tool configurations
│   │   ├── webpack.config.js
│   │   ├── rollup.config.js
│   │   ├── prettier.config.js
│   │   └── commitlint.config.js
│   └── 📁 docker/                       # Docker configurations
│       ├── Dockerfile.frontend
│       ├── Dockerfile.api
│       ├── Dockerfile.bot
│       └── docker-compose.yml
│
├── 📁 docs/                             # Documentation
│   ├── 📁 api/                          # API documentation
│   │   ├── openapi.yaml                 # OpenAPI specification
│   │   ├── api-reference.md
│   │   ├── integration-guide.md
│   │   └── postman/                     # Postman collections
│   │       ├── SDR-API.postman_collection.json
│   │       └── environments/
│   ├── 📁 architecture/                 # Technical documentation
│   │   ├── adr/                         # Architecture Decision Records
│   │   │   ├── 001-technology-stack.md
│   │   │   ├── 002-devops-integration.md
│   │   │   └── 003-security-approach.md
│   │   ├── diagrams/                    # Architecture diagrams
│   │   │   ├── system-architecture.drawio
│   │   │   ├── data-flow.png
│   │   │   └── deployment-diagram.png
│   │   ├── technical-specifications.md
│   │   └── database-schema.md
│   ├── 📁 user/                         # User documentation
│   │   ├── user-guide.md
│   │   ├── admin-guide.md
│   │   ├── teams-bot-guide.md
│   │   ├── troubleshooting.md
│   │   └── screenshots/
│   ├── 📁 development/                  # Developer documentation
│   │   ├── getting-started.md
│   │   ├── coding-standards.md
│   │   ├── testing-guide.md
│   │   ├── deployment-guide.md
│   │   └── troubleshooting-dev.md
│   └── 📁 operations/                   # Operations documentation
│       ├── monitoring-guide.md
│       ├── backup-procedures.md
│       ├── disaster-recovery.md
│       └── security-procedures.md
│
├── 📁 config/                           # Configuration files
│   ├── 📁 environments/                 # Environment-specific configs
│   │   ├── development.json
│   │   ├── testing.json
│   │   ├── staging.json
│   │   └── production.json
│   ├── 📁 azure/                        # Azure-specific configurations
│   │   ├── key-vault-secrets.json
│   │   ├── app-settings.json
│   │   └── connection-strings.json
│   └── 📁 monitoring/                   # Monitoring configurations
│       ├── application-insights.json
│       ├── alerts.json
│       └── dashboards.json
│
├── 📁 scripts/                          # Root-level scripts
│   ├── install-all.sh                   # Install all dependencies
│   ├── build-all.sh                     # Build all applications
│   ├── test-all.sh                      # Run all tests
│   ├── deploy.sh                        # Deployment script
│   ├── dev-setup.sh                     # Development environment setup
│   └── clean.sh                         # Cleanup script
│
├── 📁 .devops/                          # Azure DevOps pipelines
│   ├── azure-pipelines.yml              # Main pipeline
│   ├── build-pipeline.yml               # Build pipeline
│   ├── release-pipeline.yml             # Release pipeline
│   ├── security-pipeline.yml            # Security scanning
│   └── templates/                       # Pipeline templates
│       ├── build-template.yml
│       ├── deploy-template.yml
│       └── test-template.yml
│
├── 📄 Root Configuration Files
├── .gitignore                           # Git ignore rules
├── .gitattributes                       # Git attributes
├── .editorconfig                        # Editor configuration
├── .nvmrc                               # Node version
├── lerna.json                           # Lerna configuration (if monorepo)
├── nx.json                              # Nx configuration (if using Nx)
├── package.json                         # Root package.json (workspace)
├── package-lock.json                    # Lock file
├── tsconfig.json                        # Root TypeScript config
├── jest.config.js                       # Root Jest configuration
├── .eslintrc.js                         # Root ESLint configuration
├── .prettierrc                          # Prettier configuration
├── .husky/                              # Git hooks
│   ├── pre-commit
│   ├── pre-push
│   └── commit-msg
├── README.md                            # Main project README
├── CONTRIBUTING.md                      # Contributing guidelines
├── LICENSE                              # License file
├── CHANGELOG.md                         # Change log
├── SECURITY.md                          # Security policy
└── CODE_OF_CONDUCT.md                   # Code of conduct
```

## Folder Structure Rationale

### 🏗 **Monorepo Architecture Benefits**

1. **Unified Dependencies**: Shared packages and consistent tooling
2. **Code Sharing**: Easy sharing of types, utilities, and configurations
3. **Atomic Changes**: Single commit for changes across multiple apps
4. **Simplified CI/CD**: Single pipeline can build and deploy all components

### 📁 **Feature-Based Organization (Frontend)**

- **Colocation**: Related components, hooks, services, and types together
- **Scalability**: Easy to add new features without restructuring
- **Team Ownership**: Teams can own entire feature folders
- **Testing**: Tests alongside the code they test

### ⚡ **Function-Based Organization (Backend)**

- **Azure Functions**: Each function in its own folder with configuration
- **Shared Code**: Common services and utilities in shared folder
- **Testing**: Unit and integration tests organized by functionality
- **Configuration**: Environment-specific settings separated

### 🔧 **DevOps & Tooling**

- **Infrastructure as Code**: All Azure resources defined in Bicep
- **CI/CD Pipelines**: Comprehensive pipeline definitions
- **Testing Strategy**: Separate folders for different test types
- **Documentation**: Comprehensive docs for all stakeholders

### 📋 **Maintenance Considerations**

1. **Clear Ownership**: Each folder has a clear purpose and owner
2. **Consistent Naming**: Following established conventions
3. **Separation of Concerns**: Different types of code in appropriate folders
4. **Scalable Structure**: Can grow with the project without major refactoring

## Implementation Guidelines

### 🚀 **Getting Started**

1. **Create Repository Structure**:
   ```bash
   mkdir sdr-management-system && cd sdr-management-system
   # Create folder structure using provided template
   ```

2. **Initialize Package Management**:
   ```bash
   # Root package.json for workspace management
   npm init -w apps/frontend -w apps/api -w apps/teams-bot
   ```

3. **Setup Development Tools**:
   ```bash
   # Initialize git, ESLint, Prettier, and other tools
   git init
   npx husky-init
   ```

### 📊 **Folder Size Guidelines**

- **Small folders**: < 10 files (most feature subfolders)
- **Medium folders**: 10-30 files (main feature folders)
- **Large folders**: 30+ files (only apps and major sections)

### 🔄 **Evolution Strategy**

- **Start Simple**: Begin with basic structure and add complexity as needed
- **Refactor Regularly**: Reorganize when folders become unwieldy
- **Document Changes**: Update this guide when structure changes
- **Team Consensus**: Major structural changes require team agreement

This structure provides a solid foundation for the SDR Management System that can scale with the project and team while maintaining organization and clarity.