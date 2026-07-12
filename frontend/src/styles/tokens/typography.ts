export const typography = {
  fontFamilies: {
    heading: "'Poppins', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
  
  sizes: {
    display: "40px",
    h1: "32px",
    h2: "28px",
    h3: "24px",
    title: "20px",
    body: "16px",
    small: "14px",
    caption: "12px",
    tiny: "10px",
  },

  lineHeights: {
    tight: "1.1",
    snug: "1.2",
    normal: "1.5",
    relaxed: "1.625",
  },

  letterSpacing: {
    tighter: "-0.04em",
    tight: "-0.02em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
  }
} as const;
