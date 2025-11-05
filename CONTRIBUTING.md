# Contributing to Barcode Tracking System

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm or npm
- PostgreSQL 15+ (or Supabase account)
- Git
- Basic knowledge of TypeScript, Vue 3, and Fastify

### Development Setup

1. **Fork and Clone**
   ```bash
   git fork https://github.com/your-username/BarcodeTracking
   git clone https://github.com/YOUR_USERNAME/BarcodeTracking.git
   cd BarcodeTracking
   ```

2. **Install Dependencies**
   ```bash
   # Install API dependencies
   cd api && npm install

   # Install app dependencies
   cd ../app && npm install
   ```

3. **Setup Environment**
   ```bash
   # API
   cd api
   cp .env.example .env
   # Edit .env with your settings

   # App
   cd ../app
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Setup Database**
   ```bash
   cd api
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development**
   ```bash
   # Terminal 1 - API
   cd api && npm run dev

   # Terminal 2 - App
   cd app && npm run dev
   ```

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Use strict mode, avoid `any` types
- **Naming**:
  - Variables/Functions: `camelCase`
  - Classes/Interfaces: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.ts` or `PascalCase.vue`
- **Formatting**: Run `npm run format` before committing
- **Linting**: Run `npm run lint` and fix all errors

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(scanner): add flashlight toggle functionality

fix(api): resolve duplicate scan creation issue

docs(readme): update installation instructions
```

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

Example: `feature/warranty-lookup`, `fix/sync-retry-logic`

## 🧪 Testing

### Writing Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user flows

### Running Tests

```bash
# API tests
cd api
npm test

# App tests
cd app
npm test
```

### Test Coverage

Aim for at least 80% code coverage for new features.

## 🔧 Making Changes

### Step-by-Step Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, readable code
   - Add comments for complex logic
   - Follow the existing code style

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run format
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(module): description of changes"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub and create a PR
   - Fill out the PR template
   - Link related issues
   - Request review

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g. iOS 17, Android 13]
- App Version: [e.g. 0.1.0]
- Device: [e.g. iPhone 14, Pixel 7]

**Screenshots**
If applicable

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Any other context or screenshots
```

## 🎯 Good First Issues

Looking to contribute but don't know where to start? Check out issues labeled `good first issue`:

Current good first issues:
1. **Warranty Lookup Feature** - Add UI to display warranty information
2. **Error Toast Improvements** - Enhance error message display
3. **Retry Logic** - Implement exponential backoff for sync
4. **Seed Data** - Add more realistic sample products
5. **Sync Indicator** - Improve visual feedback for sync status

## 🏗️ Project Structure

### Key Files

```
app/
├── src/modules/          # Feature modules
│   ├── scanner/          # Scanning functionality
│   ├── auth/             # Authentication
│   └── sync/             # Synchronization
├── src/shared/           # Shared code
│   ├── components/       # Reusable components
│   ├── services/         # API services
│   └── utils/            # Utility functions

api/
├── src/routes/           # API endpoints
├── src/services/         # Business logic
├── src/middleware/       # Custom middleware
└── prisma/               # Database schema
```

### Adding New Features

1. **Mobile App Feature**
   - Create module in `app/src/modules/`
   - Add route in `app/src/router/`
   - Add service in `app/src/shared/services/`

2. **API Endpoint**
   - Create route in `api/src/routes/`
   - Add service in `api/src/services/`
   - Update Prisma schema if needed

## 🔍 Code Review Process

### What We Look For

- **Functionality**: Does it work as intended?
- **Code Quality**: Is it clean and maintainable?
- **Performance**: Are there any performance issues?
- **Security**: Are there any security concerns?
- **Tests**: Are there adequate tests?
- **Documentation**: Is it well documented?

### Review Timeline

- Initial review: Within 48 hours
- Follow-up reviews: Within 24 hours
- Merge: After 2 approvals

## 🎨 Design Guidelines

### UI/UX Principles

- **Mobile-First**: Design for mobile, adapt for desktop
- **Accessibility**: Follow WCAG 2.1 AA standards
- **Consistency**: Use Ionic components
- **Feedback**: Provide visual feedback for all actions
- **Offline**: Handle offline states gracefully

### Color Palette

- Primary: `#2563eb` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Error: `#ef4444` (Red)

## 📚 Resources

### Documentation
- [Vue 3 Docs](https://vuejs.org/)
- [Ionic Framework](https://ionicframework.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Fastify Docs](https://www.fastify.io/docs/latest/)
- [Prisma Docs](https://www.prisma.io/docs/)

### Community
- Discord: [Join our community](https://discord.gg/example)
- GitHub Discussions: For questions and discussions
- GitHub Issues: For bugs and feature requests

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Special contributors channel in Discord

## ❓ Questions?

If you have questions:
1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Join our Discord community

---

Thank you for contributing to Barcode Tracking System! 🎉
