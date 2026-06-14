# Contributing to TwilioHub OSS

Thank you for your interest in contributing!

## Development Setup

```bash
git clone https://github.com/your-org/twilioHub-oss.git
cd twilioHub-oss
npm install
cp .env.example .env
# Fill in .env values

# Start dependencies
docker compose up postgres redis -d

# Start dev servers
npm run dev
```

## Pull Request Process

1. Fork the repo and create a feature branch from `main`
2. Make your changes with clear commit messages
3. Ensure `npm run build` passes in all workspaces
4. Open a PR with a description of what changed and why

## Code Standards

- TypeScript strict mode — no `any`, no `// @ts-ignore`
- No comments unless the WHY is non-obvious
- Tailwind classes over inline styles
- Server Components by default; `'use client'` only when needed
- Tests for new service methods

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Docker version, Node version)

## Security Issues

Please do **not** open public issues for security vulnerabilities. Email security@twilioHub.dev instead. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree your contributions are licensed under the MIT License.
