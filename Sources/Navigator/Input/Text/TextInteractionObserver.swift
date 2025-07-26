//
//  Copyright 2025 Readium Foundation. All rights reserved.
//  Use of this source code is governed by the BSD-style license
//  available in the top-level LICENSE file of the project.
//

import Foundation

public extension InputObserving where Self == TextInteractionObserver {
    /// Recognizes text interactions (word taps and phrase drags).
    ///
    /// Inspect the provided ``TextInteractionEvent`` to distinguish between single words and phrases.
    static func textInteraction(
        onTextInteraction: @MainActor @escaping (TextInteractionEvent) async -> Bool
    ) -> TextInteractionObserver {
        TextInteractionObserver(onTextInteraction: onTextInteraction)
    }
}

/// An input observer used to recognize text interaction events.
@MainActor public final class TextInteractionObserver: InputObserving {
    private let onTextInteraction: @MainActor (TextInteractionEvent) async -> Bool
    
    public init(
        onTextInteraction: @MainActor @escaping (TextInteractionEvent) async -> Bool
    ) {
        self.onTextInteraction = onTextInteraction
    }
    
    public func didReceive(_ event: PointerEvent) async -> Bool {
        false
    }
    
    public func didReceive(_ event: KeyEvent) async -> Bool {
        false
    }
    
    public func didReceive(_ event: TextInteractionEvent) async -> Bool {
        await onTextInteraction(event)
    }
}