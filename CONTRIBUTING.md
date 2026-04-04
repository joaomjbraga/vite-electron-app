# Contributing to vite-electron-app

Thank you for your interest in contributing!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vite-electron-app/vite-electron-app.git
   cd vite-electron-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run tests**
   ```bash
   pnpm test
   ```

4. **Build the project**
   ```bash
   pnpm build
   ```

## Project Structure

```
├── src/                     # CLI source code
│   ├── index.ts            # Main entry point
│   └── utils.ts           # Utility functions
├── electron/               # Electron template
│   ├── main.ts            # Main process
│   ├── preload.ts         # Preload script
│   └── ...
├── template-react-ts/     # React template
│   ├── src/               # React source
│   └── ...
├── __tests__/             # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
└── .github/workflows/    # CI/CD workflows
```

## Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Run tests**
   ```bash
   pnpm test
   ```

4. **Commit your changes**
   ```bash
   git commit -m 'feat: add new feature'
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build process or auxiliary tool changes

## Code Style

- Use TypeScript
- Follow existing code conventions
- Write unit tests for new features
- Ensure all tests pass before submitting PR

## Reporting Issues

Please report issues on [GitHub Issues](https://github.com/vite-electron-app/vite-electron-app/issues) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Node.js and npm versions

## Questions?

Feel free to open an issue for any questions!
