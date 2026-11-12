# Workspace Rules

This document defines the team development workflow for the GamePriceCheck project. Following these rules ensures consistent code quality, manageable collaboration, and a smooth development process.

## Naming Conventions

### React Components

- Use PascalCase for component names: `ProductCard`, `SearchResults`, `PriceFilter`
- Component files should match the component name: `ProductCard.jsx`, `SearchResults.jsx`
- Use descriptive names that clearly indicate the component's purpose

### JavaScript Files

- Use camelCase for regular JavaScript files: `apiClient.js`, `searchUtils.js`, `constants.js`
- For utility or helper files, consider prefixing with descriptive terms: `apiHelpers.js`, `dateUtils.js`
- Avoid generic names like `utils.js` or `helpers.js` unless they are clearly scoped

### Variables and Functions

- Use camelCase for variables and functions: `productName`, `fetchProducts`, `isLoading`
- Use descriptive names that indicate purpose: `searchResults` instead of `data`, `handleSubmit` instead of `click`
- For boolean variables, prefix with `is`, `has`, `should`: `isLoading`, `hasError`, `shouldShowFilter`
- Use PascalCase for class names (if using classes): `ProductService`, `SearchController`

### API Routes

- Use kebab-case for route paths: `/api/products/search`, `/api/listings/:id`
- Use plural nouns for resource collections: `/api/products`, `/api/sellers`
- Use descriptive paths that indicate the action: `/api/products/search` instead of `/api/search`

### Database Tables

- Use snake_case for table names: `products`, `sellers`, `product_listings`
- Use singular or plural consistently (prefer plural for collections): `products`, `sellers`
- Use descriptive names that clearly indicate the table's purpose

### Database Columns

- Use snake_case for column names: `product_id`, `seller_name`, `external_url`
- Use foreign key references with `_id` suffix: `product_id`, `seller_id`
- Use descriptive names that indicate the data type: `created_at`, `is_available`

### Branches

- Use kebab-case for branch names
- Prefix branches with type: `feature/`, `fix/`, `docs/`, `refactor/`
- Use descriptive names: `feature/product-search`, `fix/price-filter-validation`, `docs/api-endpoints`
- Keep branch names concise but descriptive

## Branching Strategy

GamePriceCheck uses a simple feature-branch workflow to manage development.

### Main Branch

- The `main` branch represents the stable, production-ready code
- Only completed and tested features should be merged to main
- Do not develop major features directly on main

### Feature Branches

- Create a new branch for each feature or bug fix
- Branch from `main` before starting work
- Work on the feature branch until completion
- Examples:
  - `feature/product-search`
  - `feature/price-filter`
  - `feature/product-details`
  - `fix/search-error-handling`
  - `fix/condition-filter-bug`

### Hotfix Branches

- For urgent fixes that need to be deployed quickly
- Prefix with `fix/` or `hotfix/`
- Merge to main and any affected feature branches

### Documentation Branches

- For documentation updates
- Prefix with `docs/`
- Examples: `docs/api-endpoints`, `docs/readme-update`

## Commit Messages

Use short, meaningful commit messages that describe the "why" rather than just the "what". Follow conventional commit format when possible.

### Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring (no functional change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (build, dependencies, configuration)

### Examples

Good commit messages:
- `feat: scaffold React client with Vite`
- `feat: add product search API endpoint`
- `docs: add product requirements document`
- `fix: correct price filter validation`
- `test: add search API unit tests`
- `refactor: extract search logic into utility function`
- `chore: update dependencies`

Avoid:
- `update code`
- `fix stuff`
- `more work`
- `wip`
- `fixes`

### Guidelines

- Keep the subject line under 50 characters
- Use the imperative mood ("add" not "added" or "adds")
- Capitalize the subject line
- Do not end the subject line with a period
- Include body text for complex changes explaining the rationale
- Reference related issue or task numbers when applicable

## Pull Requests

Pull requests (PRs) are the primary mechanism for code review and merging changes into the main branch.

### Before Opening a PR

- Ensure the feature is complete and meets acceptance criteria
- Run tests and ensure they pass
- Update documentation if the change affects it
- Commit all changes with clear commit messages
- Push the branch to GitHub

### Opening a PR

- Create a pull request from the feature branch to `main`
- Use a descriptive title that summarizes the change
- Include a detailed description that explains:
  - What changed
  - Why the change was made
  - How it was implemented
  - Any relevant technical decisions
- Link to related user stories or tasks (e.g., "Closes TASK-07")
- Add screenshots for UI changes when applicable

### PR Review Process

- Request review from team members when required
- Address review feedback promptly
- Make additional commits to address feedback
- Keep the PR focused on a single feature or fix
- Ensure the PR is up to date with main before merging

### Before Merging

- Ensure all acceptance criteria are met
- Ensure tests pass
- Ensure documentation is updated
- Address all review comments
- Resolve any merge conflicts
- Delete the feature branch after merging (optional but recommended)

## Code Quality

### Readable Code

- Write code that is easy to read and understand
- Use meaningful variable and function names
- Avoid overly complex logic; break it down into smaller functions
- Keep functions focused on a single responsibility
- Add comments only when the "why" is not obvious from the code

### Small Reusable Components

- Break down large components into smaller, focused components
- Extract reusable logic into custom hooks or utility functions
- Avoid duplication; follow DRY (Don't Repeat Yourself) principle
- Keep component files at a reasonable size (preferably under 300 lines)

### Avoiding Unnecessary Dependencies

- Only add dependencies when truly needed
- Prefer built-in browser APIs and React features
- Consider the bundle size impact of new dependencies
- Review existing dependencies before adding new ones
- Remove unused dependencies

### Environment Variables for Secrets

- Never commit secrets, API keys, or credentials to the repository
- Use environment variables for sensitive configuration
- Create `.env.example` files with placeholder variable names
- Document required environment variables in README.md
- Ensure `.env` files are listed in `.gitignore`

### Comments

- Use comments to explain "why", not "what"
- Avoid obvious comments like `// This function returns true`
- Use comments for complex algorithms or business logic
- Keep comments up to date with code changes
- Remove outdated or misleading comments

### Testing

- Write tests for important business logic
- Write tests for API endpoints
- Write tests for complex components
- Aim for reasonable test coverage without being excessive
- Run tests before committing or merging

### Keeping Documentation Updated

- Update documentation when making changes
- Keep API documentation in sync with implementation
- Update README.md when setup or configuration changes
- Update TASKS.md when tasks are completed or modified
- Remove outdated documentation

## Development Workflow

### Starting a New Feature

1. Create a new branch from `main`: `git checkout -b feature/your-feature-name`
2. Implement the feature following the task acceptance criteria
3. Write tests for the implementation
4. Update documentation as needed
5. Commit changes with clear messages
6. Push the branch to GitHub
7. Open a pull request
8. Address review feedback
9. Merge the PR to `main`
10. Delete the feature branch (optional)

### Fixing a Bug

1. Create a new branch from `main`: `git checkout -b fix/your-bug-fix`
2. Reproduce and understand the bug
3. Write a test that reproduces the bug (if applicable)
4. Fix the bug
5. Ensure tests pass
6. Commit changes with clear messages
7. Push the branch to GitHub
8. Open a pull request
9. Address review feedback
10. Merge the PR to `main`
11. Delete the feature branch (optional)

### Updating Documentation

1. Create a new branch from `main`: `git checkout -b docs/your-doc-update`
2. Update the documentation
3. Review changes for accuracy
4. Commit changes with clear messages
5. Push the branch to GitHub
6. Open a pull request
7. Merge the PR to `main`
8. Delete the feature branch (optional)

## Code Review Guidelines

When reviewing code:

- Focus on logic, correctness, and maintainability
- Check for adherence to naming conventions and coding standards
- Verify that acceptance criteria are met
- Ensure tests are adequate
- Check for security issues (e.g., exposed secrets, injection vulnerabilities)
- Provide constructive, specific feedback
- Ask questions to clarify unclear code
- Approve when confident the code is ready to merge

## Continuous Improvement

These workspace rules are a living document. As the team learns and the project evolves:

- Update rules to reflect best practices discovered during development
- Discuss and agree on rule changes as a team
- Keep documentation accurate and helpful
- Learn from mistakes and improve processes
- Share knowledge and help each other grow
