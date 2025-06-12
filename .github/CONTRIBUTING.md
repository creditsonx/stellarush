# Contributing to STELLARUSH 🚀

Thank you for your interest in contributing to STELLARUSH! We welcome contributions from developers, designers, and gaming enthusiasts.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Report bugs through [GitHub Issues](https://github.com/stellarush/stellarush/issues)
- Include detailed steps to reproduce
- Provide browser/OS information
- Include screenshots if applicable

### 💡 Feature Requests
- Suggest new features via GitHub Issues
- Explain the use case and benefits
- Consider implementation complexity
- Discuss with maintainers before building

### 🔧 Code Contributions
- Fix bugs and implement features
- Improve performance and UX
- Add tests and documentation
- Follow our coding standards

### 📚 Documentation
- Improve setup guides
- Add code comments
- Create tutorials
- Update README files

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ and Bun
- Git
- Solana wallet for testing
- Basic knowledge of React/Next.js

### Local Development
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/stellarush.git
cd stellarush

# Install dependencies
bun install

# Start development server
bun run dev

# Open http://localhost:3000
```

### Testing Your Changes
1. **Wallet Integration**: Test with multiple wallet types
2. **Game Logic**: Verify betting and cash-out mechanics
3. **Responsive Design**: Test on different screen sizes
4. **Browser Compatibility**: Test in Chrome, Firefox, Safari
5. **Performance**: Check for smooth animations and interactions

## 📝 Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` types when possible
- Document complex function parameters

### React/Next.js
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use `'use client'` for client-side components

### Styling
- Use Tailwind CSS utility classes
- Maintain consistent spacing and colors
- Follow mobile-first responsive design
- Use semantic HTML elements

### Code Formatting
```bash
# Format code before committing
bun run format

# Check for linting issues
bun run lint
```

## 🔄 Pull Request Process

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes
- Write clean, documented code
- Add tests if applicable
- Update documentation
- Follow coding standards

### 3. Test Thoroughly
- Run `bun run dev` and test manually
- Check for console errors
- Verify wallet integration works
- Test responsive design

### 4. Commit Changes
```bash
# Use conventional commit format
git commit -m "feat: add autobet functionality"
git commit -m "fix: resolve wallet connection issue"
git commit -m "docs: update installation guide"
```

### 5. Submit Pull Request
- Fill out the PR template completely
- Link related issues
- Provide clear description of changes
- Include screenshots for UI changes
- Request review from maintainers

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested wallet connection
- [ ] Tested game mechanics
- [ ] Tested responsive design
- [ ] Checked browser compatibility

## Screenshots
(Include for UI changes)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated documentation accordingly
```

## 🚀 Smart Contract Development

### Anchor Framework
When contributing to smart contract development:

- Use Anchor framework for Solana programs
- Follow Solana best practices
- Implement proper error handling
- Add comprehensive tests
- Document program instructions

### Security Considerations
- Never expose private keys
- Validate all user inputs
- Implement proper access controls
- Consider economic attack vectors
- Get security reviews for critical changes

## 🎨 Design Contributions

### UI/UX Guidelines
- Maintain space theme consistency
- Use the established color palette
- Ensure accessibility standards
- Follow mobile-first approach
- Keep animations smooth and purposeful

### Assets
- Use SVG for scalable graphics
- Optimize images for web
- Maintain high contrast ratios
- Follow brand guidelines

## 🐛 Issue Guidelines

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
Add screenshots if applicable.

**Environment**
- Browser: [e.g. Chrome 118]
- OS: [e.g. macOS 14]
- Wallet: [e.g. Phantom 22.0]
- Version: [e.g. 1.0.0]
```

### Feature Request Template
```markdown
**Feature Summary**
Brief description of the feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other solutions you considered.

**Additional Context**
Any other relevant information.
```

## 📋 Code Review Guidelines

### For Reviewers
- Be constructive and respectful
- Focus on code quality and standards
- Test the changes locally
- Consider security implications
- Suggest improvements clearly

### For Authors
- Respond to feedback promptly
- Make requested changes
- Explain complex decisions
- Test after making changes
- Ask questions if unclear

## 🏆 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Eligible for community rewards
- Invited to contributor Discord

## 📞 Getting Help

- **Discord**: [Join our community](#) (coming soon)
- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Email**: contact@stellarush.com (coming soon)

## 📄 License

By contributing to STELLARUSH, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make STELLARUSH the best crash game in the galaxy! 🌟**
