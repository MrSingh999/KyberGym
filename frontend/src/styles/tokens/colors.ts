export const colors = {
  canvas: "var(--bg-canvas)",
  surface: "var(--bg-surface)",
  surfaceHover: "var(--bg-surface-hover)",
  elevated: "var(--bg-elevated)",
  
  border: {
    subtle: "var(--border-subtle)",
    default: "var(--border-default)",
    hover: "var(--border-hover)",
  },
  
  text: {
    primary: "var(--text-primary)",
    secondary: "var(--text-secondary)",
    muted: "var(--text-muted)",
  },
  
  brand: {
    primary: "var(--color-primary)",
    primaryForeground: "var(--color-primary-foreground)",
  },
  
  feedback: {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
  }
} as const;
