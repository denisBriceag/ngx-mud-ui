declare module '*.md' {
  const content: string;

  export default content;
}

// Side-effect style imports (e.g. loading design-system tokens in preview.ts).
declare module '*.scss';
declare module '*.css';
