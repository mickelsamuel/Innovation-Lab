# Contributing to Innovation Lab

Thank you for your interest in contributing to the Innovation Lab platform! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Be respectful, inclusive, and professional in all interactions.

### Our Pledge

- Be welcoming to newcomers
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js ≥ 20.0.0
- pnpm ≥ 8.0.0
- Docker Desktop
- Git configured with your name and email

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Innovation-Lab.git
   cd Innovation-Lab
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/mickelsamuel/Innovation-Lab.git
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```
5. **Start development environment**:
   ```bash
   ./start.sh
   ```

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Test additions or changes
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Check test coverage
pnpm test:cov
```

### 4. Commit Your Changes

Follow the [commit message guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add user profile settings page"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Coding Standards

### TypeScript

- **Use TypeScript strictly**: Enable `strict` mode
- **No `any` types**: Use proper typing or `unknown`
- **Use interfaces and types**: Define clear contracts
- **Prefer const**: Use `const` over `let` when possible

### Frontend (Next.js/React)

- **Functional components**: Use hooks, not class components
- **Component structure**:
  ```typescript
  // 1. Imports
  // 2. Type definitions
  // 3. Component definition
  // 4. Styled components or styles (if any)
  // 5. Export
  ```
- **Props destructuring**: Destructure props in function signature
- **Use custom hooks**: Extract reusable logic
- **Accessibility**: Use semantic HTML and ARIA labels

### Backend (NestJS)

- **Module structure**: Follow NestJS module pattern
- **DTOs**: Use class-validator for validation
- **Services**: Business logic goes in services, not controllers
- **Error handling**: Use NestJS exception filters
- **Dependency injection**: Use constructor injection

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Constants**: `UPPER_SNAKE_CASE.ts` (e.g., `API_ROUTES.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`

### Code Style

- **Prettier**: Code is automatically formatted (`.prettierrc.json`)
- **ESLint**: Follow linting rules (`.eslintrc.json`)
- **Line length**: Max 100 characters
- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings

---

## Testing Requirements

### Coverage Thresholds

- **Backend**: ≥80% coverage required
- **Frontend**: ≥70% coverage required

### Testing Best Practices

1. **Write tests first** (TDD approach preferred)
2. **Test behavior, not implementation**
3. **Use descriptive test names**: `it('should return user when valid ID is provided')`
4. **Follow AAA pattern**: Arrange, Act, Assert
5. **Mock external dependencies**
6. **One assertion per test** (when possible)

### Test Structure

#### Backend (Jest)

```typescript
describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(async () => {
    // Setup
  });

  it('should perform expected action', async () => {
    // Arrange
    const input = {
      /* ... */
    };

    // Act
    const result = await service.method(input);

    // Assert
    expect(result).toEqual(expected);
  });
});
```

#### Frontend (Vitest)

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## Pull Request Process

### Before Submitting

- [ ] Code passes all linting checks (`pnpm lint`)
- [ ] Code passes type checking (`pnpm typecheck`)
- [ ] All tests pass (`pnpm test` and `pnpm test:e2e`)
- [ ] Test coverage meets minimum thresholds
- [ ] Documentation is updated
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with `main`

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

- How was this tested?
- What test cases were added?

## Checklist

- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
```

### Review Process

1. **Automated checks**: CI/CD must pass
2. **Code review**: At least one maintainer approval required
3. **Testing**: Reviewer tests functionality
4. **Merge**: Squash and merge to main

---

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```
feat(auth): add 2FA support with TOTP

Implements two-factor authentication using time-based one-time passwords.
Users can enable 2FA in their profile settings.

Closes #123
```

```
fix(api): prevent race condition in team creation

Added transaction wrapping to ensure atomicity when creating teams
and adding members simultaneously.

Fixes #456
```

```
docs: update API documentation for v1.1

- Added new endpoints
- Updated authentication examples
- Fixed typos in examples
```

---

## Documentation

### When to Update Documentation

- New features or APIs
- Configuration changes
- Breaking changes
- Architecture changes
- Security updates

### Documentation Standards

- **Clear and concise**: Write for beginners
- **Code examples**: Include working examples
- **Screenshots**: For UI changes
- **API docs**: Update Swagger annotations
- **Changelog**: Add entry to CHANGELOG.md

---

## Issue Reporting

### Bug Reports

Include:

- **Description**: Clear description of the bug
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node version, browser
- **Screenshots**: If applicable
- **Logs**: Error messages or stack traces

### Feature Requests

Include:

- **Problem**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional context**: Use cases, examples

---

## Community

- **GitHub Discussions**: For questions and discussions
- **GitHub Issues**: For bugs and feature requests
- **Pull Requests**: For code contributions

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

## Questions?

If you have questions about contributing, please:

1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Contact maintainers

---

**Thank you for contributing to Innovation Lab! 🎉**

Last Updated: November 2025
