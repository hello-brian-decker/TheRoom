# Contributing to The Room

Thank you for your interest in contributing to The Room! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Be patient with questions and contributions

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/TheRoom.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Running Locally

```bash
# Development mode (web)
npm run dev

# Development mode (Electron)
npm run electron:dev
```

## Code Style Guidelines

### JavaScript/ES6

- Use ES6+ features (const/let, arrow functions, classes, modules)
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add JSDoc comments for all public methods and classes
- Keep functions focused and single-purpose

### File Organization

- One class per file
- Use descriptive file names (PascalCase for classes)
- Group related files in directories

### Documentation

- All public APIs must have JSDoc comments
- Include parameter types and descriptions
- Document return values
- Add usage examples for complex functions
- Update README.md for user-facing changes

### Example JSDoc Format

```javascript
/**
 * Calculates the distance between two points
 * @param {Vector3} pointA - First point
 * @param {Vector3} pointB - Second point
 * @returns {number} Distance between the points
 * @example
 * const dist = calculateDistance(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
 */
function calculateDistance(pointA, pointB) {
    // implementation
}
```

## Commit Message Conventions

Use clear, descriptive commit messages:

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

Example:
```
feat: Add RK4 integrator for improved physics accuracy

Implements Runge-Kutta 4th order integration method for more
accurate physics simulations, especially for orbital mechanics.
```

## Pull Request Process

1. **Update Documentation**: Ensure all documentation is updated for your changes
2. **Test Your Changes**: Verify your changes work in both web and Electron modes
3. **Check Code Style**: Ensure your code follows the style guidelines
4. **Write Clear PR Description**: Explain what changes you made and why
5. **Link Issues**: Reference any related issues in your PR description

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Changes tested locally
- [ ] No console errors or warnings
- [ ] PR description is clear and complete

## Adding New Features

### Adding a New Physics Scene

1. Create a new scene file in `src/scenes/`
2. Implement the scene class with `init()`, `update()`, and `dispose()` methods
3. Register the route in `src/app.js`
4. Add documentation in `src/docs/` if applicable
5. Update README.md with the new feature

### Adding Physics Features

1. Follow the existing architecture patterns
2. Add comprehensive JSDoc documentation
3. Include mathematical foundations in comments
4. Test with various scenarios
5. Update API documentation

## Testing Guidelines

- Test your changes in multiple browsers
- Test in both web and Electron modes
- Verify performance with many objects
- Check for memory leaks (dispose methods)
- Test edge cases

## Reporting Bugs

When reporting bugs, please include:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Screenshots if applicable

## Questions?

Feel free to open an issue for questions or discussions about the project.

Thank you for contributing to The Room!

