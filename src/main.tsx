import React from 'react';
import ReactDOM from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';
import CodePenPortfolioLayout from './organisms/SplitViewLayout'

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #131417;
    color: #e6e6e6;
    overflow: hidden;
  }

  code {
    font-family: 'MonoLisa', source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
`;

// Root element for React
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GlobalStyle />
    <CodePenPortfolioLayout />
  </React.StrictMode>
);