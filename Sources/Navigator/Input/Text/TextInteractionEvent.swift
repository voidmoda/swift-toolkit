//
//  Copyright 2025 Readium Foundation. All rights reserved.
//  Use of this source code is governed by the BSD-style license
//  available in the top-level LICENSE file of the project.
//

import Foundation
import ReadiumShared

/// Event fired when user interacts with publication text through tap or drag gestures.
public struct TextInteractionEvent: Equatable, CustomStringConvertible {
    /// Full locator context for the selected text (includes text.highlight, text.before, text.after)
    public let locator: Locator
    
    /// Interaction location in navigator coordinate space
    public let location: CGPoint
    
    /// Text bounding rectangle in navigator coordinate space
    public let frame: CGRect
    
    public init(locator: Locator, location: CGPoint, frame: CGRect) {
        self.locator = locator
        self.location = location
        self.frame = frame
    }
    
    /// Convenience accessor for the selected text
    public var text: String { locator.text.highlight ?? "" }
    
    /// Convenience accessor for word count (distinguishes single word vs phrase)
    public var wordCount: Int { text.split(separator: " ").count }
    
    public var description: String {
        "TextInteractionEvent(text: \"\(text)\", wordCount: \(wordCount), location: \(location))"
    }
}