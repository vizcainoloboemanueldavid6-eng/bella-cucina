/**
 * Safety net for page translators and DOM-editing browser extensions (React issue #11538).
 *
 * Chrome's built-in Google Translate replaces every text node React rendered with `<font>`
 * wrappers. If React later removes one of those original nodes, or inserts next to it, the browser
 * throws `NotFoundError` and Next.js swaps the whole page for "Application error".
 *
 * The components are written so that never happens (dynamic text is always an element's only
 * child; see About.tsx and DECISIONS.md), and `npm run check:translate` proves it. This guard is
 * only there for a future edit that forgets the rule: instead of taking the page down, the call is
 * skipped (`removeChild`) or degraded to an append (`insertBefore`), and a `[dom-guard]` error is
 * logged so it is not silent. React never makes either call with a foreign node on an
 * untranslated page, so in normal use the guard never fires; the translation check fails on any
 * `[dom-guard]` message, so it cannot hide a regression from the test either.
 *
 * Plain ES5 on purpose: it is inlined into <head> and runs before React hydrates.
 */
export const DOM_GUARD_SCRIPT = `(function () {
  if (typeof Node !== 'function' || !Node.prototype) return;
  function report(message, node, parent) {
    if (window.console && console.error) console.error('[dom-guard] ' + message, node, parent);
  }
  var removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      report('removeChild skipped: the node is no longer a child of this parent (page translation or an extension moved it).', child, this);
      return child;
    }
    return removeChild.apply(this, arguments);
  };
  var insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (node, reference) {
    if (reference && reference.parentNode !== this) {
      report('insertBefore appended instead: the reference node is no longer a child of this parent (page translation or an extension moved it).', reference, this);
      return this.appendChild(node);
    }
    return insertBefore.apply(this, arguments);
  };
})();`;
