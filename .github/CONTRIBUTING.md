# Contributing to CommerceX

Thank you for your interest in contributing to CommerceX! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

- Before submitting a bug report, please check existing issues to avoid duplicates
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the issue
- Provide information about your environment (OS, browser, version, etc.)

### Suggesting Features

- Use the feature request template when suggesting new features
- Clearly describe the problem your feature would solve
- Explain how your solution would work
- Consider the impact and scope of your suggestion

### Pull Requests

1. Fork the repository
2. Create a new branch with a descriptive name
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Run tests and ensure they pass
   ```bash
   pnpm test
   ```
5. Commit your changes with a clear message following [Conventional Commits](https://www.conventionalcommits.org/)
   ```bash
   git commit -m "feat: add new feature"
   ```
6. Push your branch
   ```bash
   git push origin feature/your-feature-name
   ```
7. Create a Pull Request targeting the `main` branch

## Development Setup

1. Install dependencies
   ```bash
   pnpm install
   ```
2. Build the project
   ```bash
   pnpm build
   ```
3. Run tests
   ```bash
   pnpm test
   ```

## Coding Standards

- Use ES6+ features where appropriate
- Follow existing code style and formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## Review Process

- All submissions require review
- We may request changes before accepting your contribution
- Be responsive to feedback and questions

## License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](../LICENSE). 
