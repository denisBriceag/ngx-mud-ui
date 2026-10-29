declare module '*.md' {
  const content: string;

  export default content;
}

declare module '*?raw' {
  const content: string;

  export default content;
}

declare module '*.scss';
declare module '*.css';

declare module '@storybook/angular-vite/client/config' {
  export const parameters: unknown;
}
