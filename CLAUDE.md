# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the Readium Swift Toolkit, a comprehensive library for handling ebooks, audiobooks, and comics on iOS. The codebase is organized into multiple Swift Package Manager targets providing different functionality:

- **ReadiumShared**: Core data models and utilities shared across all modules
- **ReadiumStreamer**: Publication parsers for EPUB, PDF, audiobooks, etc.
- **ReadiumNavigator**: UI components for rendering publications 
- **ReadiumOPDS**: OPDS catalog support
- **ReadiumLCP**: Readium Licensed Content Protection (DRM)
- **ReadiumAdapters**: Third-party integration adapters

## Common Commands

### Testing
```bash
# Run all unit tests
make test

# Run tests via xcodebuild directly
xcodebuild test -scheme "Readium-Package" -destination "platform=iOS Simulator,name=iPhone 15"
```

### Code Quality
```bash
# Format Swift code
make format

# Check code formatting (lint)
make lint-format

# Format shorthand
make f
```

### JavaScript/TypeScript (EPUB Navigator Scripts)
```bash
# Bundle Navigator EPUB scripts (requires corepack/pnpm)
make scripts

# Update script dependencies
make update-scripts
```

### Project Generation
```bash
# Generate Carthage Xcode project
make carthage-project
```

### TestApp Development
The TestApp directory contains integration examples. Navigate to `TestApp/` and use:
```bash
# Generate test app with SPM integration
make spm

# Generate with Carthage integration  
make carthage

# Generate with CocoaPods integration
make cocoapods

# Generate for local development
make dev
```

## Architecture

### Module Structure
- **Sources/**: Main library code organized by module
  - **Shared/**: Core models (Publication, Locator, etc.), utilities, and services
  - **Streamer/**: Publication parsers and manifest processing
  - **Navigator/**: Platform-specific reading interfaces (EPUB, PDF, CBZ, Audio)
  - **LCP/**: DRM content protection implementation
  - **OPDS/**: Catalog feed parsing and authentication
  - **Adapters/**: Integration with GCDWebServer and SQLite for LCP

### Key Concepts
- **Publication**: Central model representing any readable content
- **Locator**: Position/location within a publication
- **Navigator**: UI component for rendering publication content
- **Services**: Plugin architecture for extending publication functionality
- **Preferences**: User customization system for reading experience

### Navigator Types
- **EPUBNavigatorViewController**: Reflowable and fixed-layout EPUB
- **PDFNavigatorViewController**: PDF documents
- **AudioNavigator**: Audiobook playback
- **CBZNavigatorViewController**: Comic book archives

### Service Architecture
Publications use a service-based architecture where functionality is provided through:
- **ContentService**: Text extraction and search
- **CoverService**: Cover image generation
- **PositionsService**: Location calculation
- **TableOfContentsService**: Navigation structure

## Development Notes

- Minimum iOS version: 13.4
- Swift Package Manager is the primary dependency manager
- The project uses SwiftFormat for code formatting
- EPUB navigator includes JavaScript/TypeScript components built with webpack
- LCP integration requires additional R2LCPClient.framework from EDRLab
- TestApp provides integration examples for SPM, Carthage, and CocoaPods

## Testing Strategy

- Unit tests are located in `Tests/` directory organized by module
- Test fixtures are included in test resources
- LCP tests require R2LCPClient.framework and are currently disabled in CI
- Use iOS Simulator for testing (iPhone 15 recommended)