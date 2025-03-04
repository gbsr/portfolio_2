/* eslint-disable no-useless-escape */
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const EditorContainer = styled.div`
  position: relative;
  height: 100%;
  background-color: #1d1e22;
  overflow: hidden;
`;

const LineNumbersContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  text-align: right;
  background-color: #1d1e22;
  color: #858585;
  font-family: 'MonoLisa', 'Consolas', monospace;
  font-size: 13px;
  user-select: none;
  border-right: 1px solid #2a2c35;
  height: 100%;
  overflow: hidden;
  z-index: 1;
`;

const LineNumbersScroller = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-top: 15px; /* Match the textarea padding */
  box-sizing: border-box;
  /* Hide scrollbar but allow scrolling */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
`;

const LineNumbersContent = styled.div`
  width: 100%;
  padding-right: 10px;
  box-sizing: border-box;
`;

const LineNumber = styled.div`
  height: 20px;
  line-height: 20px;
  text-align: right;
`;

const TextAreaWrapper = styled.div`
  margin-left: 40px;
  height: 100%;
  position: relative;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 100%;
  background-color: #1d1e22;
  color: #e6e6e6;
  font-family: 'MonoLisa', 'Consolas', monospace;
  font-size: 13px;
  border: none;
  resize: none;
  padding: 15px;
  padding-left: 10px;
  line-height: 20px;
  white-space: pre-wrap;
  word-wrap: break-word;
  tab-size: 2;
  overflow-y: scroll;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
  }
`;

// Component for syntax-highlighted view (read-only overlay)
const SyntaxHighlighter = styled.pre`
  position: absolute;
  left: 0;
  top: 0;
  margin: 0;
  padding: 15px;
  padding-left: 10px;
  background: transparent;
  pointer-events: none;
  font-family: 'MonoLisa', 'Consolas', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 20px;
  tab-size: 2;
  width: 100%;
  height: 100%; 
  overflow: auto;
  color: transparent;
  box-sizing: border-box;
`;

// JSON syntax highlighting function
const highlightJSON = (code: string): string => {
  try {
    // First sanitize the HTML to prevent XSS
    const sanitizedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Then apply syntax highlighting with more specific patterns
    return sanitizedCode
      // Match property names with quotes
      .replace(/"([^"]*)"(?=\s*:)/g, '<span style="color: #9cdcfe;">"$1"</span>')
      // Match string values with quotes
      .replace(/:\s*"([^"]*)"/g, ': <span style="color: #ce9178;">"$1"</span>')
      // Match booleans
      .replace(/:\s*(true|false)(?=\s*[,}\]]|$)/g, (match, p1) => 
        `: <span style="color: #569cd6;">${p1}</span>`
      )
      // Match numbers
      .replace(/:\s*(\d+)(?=\s*[,}\]]|$)/g, ': <span style="color: #b5cea8;">$1</span>')
      // Match brackets and braces
      .replace(/([{}\[\]])/g, '<span style="color: #c586c0;">$1</span>')
      // Match commas
      .replace(/,/g, '<span style="color: #d4d4d4;">,</span>');
  } catch (error) {
    // Return the original code if there's an error
    console.error('Error highlighting JSON:', error);
    return code;
  }
};

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const syntaxHighlighterRef = useRef<HTMLPreElement>(null);
  const lineNumbersScrollerRef = useRef<HTMLDivElement>(null);
  const lineNumbersContentRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate the actual number of lines based on textarea properties
  const calculateLineCount = () => {
    if (!textareaRef.current) return 1;
    
    const textarea = textareaRef.current;
    
    // Get the scroll height of the textarea
    const scrollHeight = textarea.scrollHeight;
    
    // Calculate the line height (it's 20px from our CSS)
    const lineHeight = 20;
    
    // Account for padding (top and bottom)
    const paddingTop = 15;
    const paddingBottom = 15;
    
    // Calculate the total number of lines
    // scrollHeight includes padding, so subtract it
    const totalLines = Math.ceil((scrollHeight - paddingTop - paddingBottom) / lineHeight);
    
    // Return a safe minimum of at least one line
    return Math.max(totalLines, 1);
  };
  
  // Update line count and content height
  const updateLineCount = () => {
    // Calculate the actual line count based on textarea properties
    const actualLineCount = calculateLineCount();
    
    // Update state if it changed
    if (actualLineCount !== lineCount) {
      setLineCount(actualLineCount);
    }
    
    // Ensure the line numbers container has the correct height
    if (lineNumbersContentRef.current && textareaRef.current) {
      // Use the actual scroll height of the textarea
      lineNumbersContentRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  // Update line count when content changes
  useEffect(() => {
    updateLineCount();
  }, [value]);
  
  // Set up resize observer to detect container size changes
  useEffect(() => {
    // Create a resize observer to detect changes in container size
    const resizeObserver = new ResizeObserver(() => {
      updateLineCount();
    });
    
    // Observe the editor container
    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }
    
    // Clean up observer on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Synchronize scrolling between textarea and other elements
  useEffect(() => {
    const handleTextAreaScroll = () => {
      if (!textareaRef.current || !syntaxHighlighterRef.current || !lineNumbersScrollerRef.current) return;
      
      const scrollTop = textareaRef.current.scrollTop;
      
      // Sync the syntax highlighter
      syntaxHighlighterRef.current.scrollTop = scrollTop;
      
      // Sync the line numbers
      lineNumbersScrollerRef.current.scrollTop = scrollTop;
    };
    
    const handleLineNumbersScroll = () => {
      if (!textareaRef.current || !lineNumbersScrollerRef.current) return;
      
      const scrollTop = lineNumbersScrollerRef.current.scrollTop;
      
      // Sync the text area and syntax highlighter
      textareaRef.current.scrollTop = scrollTop;
      if (syntaxHighlighterRef.current) {
        syntaxHighlighterRef.current.scrollTop = scrollTop;
      }
    };
    
    const textareaElement = textareaRef.current;
    const lineNumbersScrollerElement = lineNumbersScrollerRef.current;
    
    if (textareaElement) {
      textareaElement.addEventListener('scroll', handleTextAreaScroll);
    }
    
    if (lineNumbersScrollerElement) {
      lineNumbersScrollerElement.addEventListener('scroll', handleLineNumbersScroll);
    }
    
    return () => {
      if (textareaElement) {
        textareaElement.removeEventListener('scroll', handleTextAreaScroll);
      }
      
      if (lineNumbersScrollerElement) {
        lineNumbersScrollerElement.removeEventListener('scroll', handleLineNumbersScroll);
      }
    };
  }, []);
  
  // Render all line numbers (no virtual rendering)
  const renderLineNumbers = () => {
    // Calculate padding based on number of digits needed
    const digits = lineCount >= 1000 ? 4 : lineCount >= 100 ? 3 : 2;
    
    // Create array of line numbers
    return Array.from({ length: lineCount }, (_, i) => {
      const lineNum = String(i + 1).padStart(digits, '0');
      return <LineNumber key={i}>{lineNum}</LineNumber>;
    });
  };
  
  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab at cursor position
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Move cursor after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };
  
  function handleTextAreaScroll(event: React.UIEvent<HTMLTextAreaElement>): void {
    // Get the textarea element that triggered the scroll
    const textarea = event.currentTarget;
    const scrollTop = textarea.scrollTop;
    
    // Sync the syntax highlighter scroll position
    if (syntaxHighlighterRef.current) {
      syntaxHighlighterRef.current.scrollTop = scrollTop;
    }
    
    // Sync the line numbers scroll position
    if (lineNumbersScrollerRef.current) {
      lineNumbersScrollerRef.current.scrollTop = scrollTop;
    }
  }
  return (
    <EditorContainer ref={editorContainerRef}>
      <LineNumbersContainer>
        <LineNumbersScroller ref={lineNumbersScrollerRef}>
          <LineNumbersContent ref={lineNumbersContentRef}>
            {renderLineNumbers()}
          </LineNumbersContent>
        </LineNumbersScroller>
      </LineNumbersContainer>
      
      <TextAreaWrapper>
        <StyledTextArea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            // Schedule an update after the DOM has time to process the change
            requestAnimationFrame(updateLineCount);
          }}
          onScroll={handleTextAreaScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          wrap="off"
        />
        
        <SyntaxHighlighter
          ref={syntaxHighlighterRef}
          dangerouslySetInnerHTML={{ __html: highlightJSON(value) }}
        />
      </TextAreaWrapper>
    </EditorContainer>
  );
};

export default CodeEditor;