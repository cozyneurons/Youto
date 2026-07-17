import parse from 'html-react-parser';
import type { DOMNode, Text } from 'html-react-parser';
import DOMPurify from 'dompurify';
import React from 'react';
import { seekVideo, timeToSeconds } from './videoControl';

function isTextNode(node: DOMNode): node is Text {
  return node.type === 'text';
}

function processTextNode(text: string) {
  const regex = /(\b\d{1,2}:\d{2}(?::\d{2})?\b)/g;
  const parts = text.split(regex);
  
  if (parts.length === 1) return text; // No timestamp found

  return parts.map((part, i) => {
    if (regex.test(part)) {
      return (
        <button
          key={i}
          className="timestamp-btn"
          onClick={() => seekVideo(timeToSeconds(part))}
          title="Jump to this time"
        >
          {part}
        </button>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function renderRichTextWithTimestamps(htmlContent: string | null | undefined) {
  if (!htmlContent) return null;

  // Sanitize the HTML first to prevent XSS
  const cleanHtml = DOMPurify.sanitize(htmlContent);

  return parse(cleanHtml, {
    replace: (domNode) => {
      if (isTextNode(domNode) && domNode.data) {
        // If it's a text node, check for timestamps and wrap them in buttons
        const processed = processTextNode(domNode.data);
        if (processed !== domNode.data) {
          return <>{processed}</>;
        }
      }
      return undefined; // return undefined to let html-react-parser render the node normally
    }
  });
}
