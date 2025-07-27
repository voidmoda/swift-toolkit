//
//  Copyright 2025 Readium Foundation. All rights reserved.
//  Use of this source code is governed by the BSD-style license
//  available in the top-level LICENSE file of the project.
//

import { findDecorationTarget, handleDecorationClickEvent } from "./decorator";
import { adjustPointToViewport, toNativeRect } from "./rect";
import { findNearestInteractiveElement } from "./dom";
import { TextRange } from "./vendor/hypothesis/anchoring/text-range";

let isSelecting = false;

// Text interaction configuration
let isTextInteractionEnabled = false;

window.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", onClick, false);
  document.addEventListener("pointerdown", onPointerDown, false);
  document.addEventListener("pointerup", onPointerUp, false);
  document.addEventListener("pointermove", onPointerMove, false);
  document.addEventListener("pointercancel", onPointerCancel, false);

  document.addEventListener("selectionchange", function () {
    isSelecting = !window.getSelection().isCollapsed;
  });
});

function onClick(event) {
  if (!getSelection().isCollapsed) {
    // There's an on-going selection, the tap will dismiss it so we don't forward it.
    return;
  }

  let point = adjustPointToViewport({ x: event.clientX, y: event.clientY });
  let clickEvent = {
    defaultPrevented: event.defaultPrevented,
    x: point.x,
    y: point.y,
    targetElement: event.target.outerHTML,
    interactiveElement: findNearestInteractiveElement(event.target),
  };

  if (handleDecorationClickEvent(event, clickEvent)) {
    return;
  }

  // NEW: Text interaction detection
  if (isTextInteractionEnabled && shouldDetectTextInteraction(event)) {
    const wordData = detectWordAtPoint(event.clientX, event.clientY);
    if (wordData) {
      // Send text interaction to Swift
      webkit.messageHandlers.textInteraction.postMessage(wordData);
      return; // Handled as text interaction
    }
  }

  // Send the tap data over the JS bridge even if it's been handled
  // within the webview, so that it can be preserved and used
  // by the WKNavigationDelegate if needed.
  webkit.messageHandlers.tap.postMessage(clickEvent);

  // We don't want to disable the default WebView behavior as it breaks some features without bringing any value.
  // event.stopPropagation();
  // event.preventDefault();
}

function onPointerDown(event) {
  onPointerEvent("down", event);
}

function onPointerUp(event) {
  onPointerEvent("up", event);
}

function onPointerMove(event) {
  onPointerEvent("move", event);
}

function onPointerCancel(event) {
  onPointerEvent("cancel", event);
}

function onPointerEvent(phase, event) {
  // If the user is currently selecting text, we report this event as cancelled to prevent detecting gestures.
  if (isSelecting) {
    phase = "cancel";
  }

  let point = adjustPointToViewport({ x: event.clientX, y: event.clientY });
  let pointerEvent = {
    phase: phase,
    defaultPrevented: event.defaultPrevented,
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    x: point.x,
    y: point.y,
    buttons: event.buttons,
    targetElement: event.target.outerHTML,
    interactiveElement: findNearestInteractiveElement(event.target),
    option: event.altKey,
    control: event.ctrlKey,
    shift: event.shiftKey,
    command: event.metaKey,
  };

  if (findDecorationTarget(event) != null) {
    return;
  }

  // Send the pointer data over the JS bridge even if it's been handled
  // within the webview, so that it can be preserved and used
  // by the WKNavigationDelegate if needed.
  webkit.messageHandlers.pointerEventReceived.postMessage(pointerEvent);

  // We don't want to disable the default WebView behavior as it breaks some features without bringing any value.
  // event.stopPropagation();
  // event.preventDefault();
}

function shouldDetectTextInteraction(event) {
  return (
    !window.getSelection().toString() && // No active selection
    !findNearestInteractiveElement(event.target)
  ); // Not on interactive element
}

function detectWordAtPoint(x, y) {
  if (!readium.link) return null;

  const point = adjustPointToViewport({ x, y });
  const range = document.caretRangeFromPoint(point.x, point.y);

  if (
    !range?.startContainer ||
    range.startContainer.nodeType !== Node.TEXT_NODE
  ) {
    return null;
  }

  // Find word boundaries
  const textNode = range.startContainer;
  const text = textNode.textContent;
  const offset = range.startOffset;

  const before = text.lastIndexOf(" ", offset - 1);
  const after = text.indexOf(" ", offset);
  const wordStart = before === -1 ? 0 : before + 1;
  const wordEnd = after === -1 ? text.length : after;

  const word = text.slice(wordStart, wordEnd).trim();
  if (!word) return null;

  const wordRange = document.createRange();
  wordRange.setStart(textNode, wordStart);
  wordRange.setEnd(textNode, wordEnd);

  return {
    href: readium.link.href,
    locator: createLocatorFromRange(wordRange),
    rect: toNativeRect(wordRange.getBoundingClientRect()),
  };
}

function createLocatorFromRange(range) {
  if (!range || range.collapsed) {
    return null;
  }

  const highlight = range
    .toString()
    .trim()
    .replace(/\n/g, " ")
    .replace(/\s\s+/g, " ");
  if (highlight.length === 0) {
    return null;
  }

  const text = document.body.textContent;
  const textRange = TextRange.fromRange(range).relativeTo(document.body);
  const start = textRange.start.offset;
  const end = textRange.end.offset;

  const snippetLength = 200;

  // Compute the text before the highlight, ignoring the first "word", which might be cut.
  let before = text.slice(Math.max(0, start - snippetLength), start);
  let firstWordStart = before.search(/\P{L}\p{L}/gu);
  if (firstWordStart !== -1) {
    before = before.slice(firstWordStart + 1);
  }

  // Compute the text after the highlight, ignoring the last "word", which might be cut.
  let after = text.slice(end, Math.min(text.length, end + snippetLength));
  let lastWordEnd = Array.from(after.matchAll(/\p{L}\P{L}/gu)).pop();
  if (lastWordEnd !== undefined && lastWordEnd.index > 1) {
    after = after.slice(0, lastWordEnd.index + 1);
  }

  return {
    href: readium.link.href,
    type: "application/epub+zip",
    text: { highlight, before, after },
  };
}

/// Text Interaction API

// Enable or disable text interaction detection
export function setTextInteractionEnabled(enabled) {
  isTextInteractionEnabled = enabled;
}

// Get current text interaction status
export function getTextInteractionEnabled() {
  return isTextInteractionEnabled;
}
