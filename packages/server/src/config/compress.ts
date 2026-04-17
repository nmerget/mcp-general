export function compressContent(text: string): string {
  return (
    text
      // Remove HTML/JSX components (self-closing and block)
      .replace(/<[A-Z]\w*[^>]*\/>/g, '')
      .replace(/<[A-Z]\w*[^>]*>[\s\S]*?<\/[A-Z]\w*>/g, '')
      // Remove HTML img tags
      .replace(/<img[^>]*>/gi, '')
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove markdown images
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      // Remove base64 data blocks (inline and standalone)
      .replace(/```text\n[A-Za-z0-9+/=\n]{200,}\n```/g, '')
      .replace(/[A-Za-z0-9+/=]{200,}/g, '')
      // Remove import statements (JSX/MDX)
      .replace(/^import\s+.*$/gm, '')
      // Remove iframe embeds
      .replace(/<iframe[\s\S]*?\/>/g, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
      // Remove HTML div blocks with only styling (no meaningful text)
      .replace(/<div[^>]*>\s*<\/div>/gi, '')
      // Collapse 3+ blank lines into 2
      .replace(/\n{3,}/g, '\n\n')
      // Trim leading/trailing whitespace
      .trim()
  );
}
