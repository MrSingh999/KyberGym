# Workspace Rules: KyberGym Management

This file defines rules and style guidelines that agents must adhere to when working in this repository.

## Frontend Responsive Guidelines

- **Mobile-First Workflow**: Always design and write CSS/Tailwind selectors starting with the **mobile view** as the base style (default).
- **Tablet Enhancements**: Build on top of the base style using tablet-specific media queries next (e.g., using `md:` or `@media (min-width: 768px)`).
- **Desktop Enhancements**: Add desktop styling rules last using desktop media queries (e.g., using `lg:`, `xl:`, or `@media (min-width: 1024px)`).
- **No Downscaling**: Avoid writing base styles for desktop and using max-width selectors to "fix" mobile layouts. Mobile-first ensures the code is cleaner, lighter, and optimized for performance on portable devices.
- **Touch Target Standard**: Every clickable button, icon trigger, or dropdown item on mobile must be at least 44px by 44px to provide an exceptional touch-screen user experience.
