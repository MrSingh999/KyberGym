export const animations = {
  durations: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
  },
  easing: {
    default: "cubic-bezier(0.16, 1, 0.3, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  presets: {
    fadeSlideUp: "fade-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    pulse: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  }
} as const;
