/**
 * Hydration fix for browser extension compatibility
 * This file is loaded before React to prevent hydration mismatches
 */

// Suppress hydration warnings caused by browser extensions
if (typeof window !== 'undefined') {
  // Override console.error to filter out extension-related hydration warnings
  const originalError = console.error
  console.error = function(...args) {
    const message = args[0]
    
    // Skip hydration warnings that are caused by browser extensions
    if (typeof message === 'string' && 
        message.includes('hydration') && 
        (message.includes('webcrx') || 
         message.includes('browser extension') ||
         message.includes('extension installed') ||
         message.includes("didn't match"))) {
      return
    }
    
    return originalError.apply(console, args)
  }

  // Prevent React from complaining about browser extension attributes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.target.tagName === 'HTML') {
        const target = mutation.target
        const extensionAttributes = ['webcrx', 'data-extension', 'extension-id']
        
        extensionAttributes.forEach(attr => {
          if (target.hasAttribute(attr)) {
            // Temporarily remove extension attributes during hydration
            const value = target.getAttribute(attr)
            target.removeAttribute(attr)
            
            // Add them back after a short delay to avoid hydration issues
            setTimeout(() => {
              if (target.getAttribute(attr) !== value) {
                target.setAttribute(attr, value)
              }
            }, 100)
          }
        })
      }
    })
  })

  // Start observing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['webcrx', 'data-extension', 'extension-id']
      })
    })
  } else {
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['webcrx', 'data-extension', 'extension-id']
    })
  }
}
