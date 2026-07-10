type ClipboardText = string | Promise<string>

/**
 * Copy text into the clipboard. Accepts a Promise<string> because Safari only
 * allows clipboard writes triggered directly by user interaction — wrapping
 * the pending text in a ClipboardItem keeps async copies working there.
 * See https://developer.apple.com/forums/thread/691873
 */
export const copyToClipboard = async (str: ClipboardText, callback?: () => void) => {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      const item = new ClipboardItem({
        'text/plain': Promise.resolve(str).then((text) => new Blob([text], { type: 'text/plain' })),
      })
      await navigator.clipboard.write([item])
    } else {
      const text = await Promise.resolve(str)
      await navigator.clipboard?.writeText(text)
    }
    callback?.()
  } catch {
    // Clipboard access can be denied outside secure contexts; fail silently.
  }
}
