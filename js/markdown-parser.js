// Simple Markdown Parser
class MarkdownParser {

    // Convert markdown to HTML
    static parse(markdown) {
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold and Italic
        html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="blog-image">');

        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            return `<pre><code class="language-${language || 'text'}">${this.escapeHtml(code.trim())}</code></pre>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // Lists
        html = html.replace(/^\d+\.\s+(.*$)/gim, '<li>$1</li>');
        html = html.replace(/^[\*\-]\s+(.*$)/gim, '<li>$1</li>');

        // Wrap consecutive <li> items in <ol> or <ul>
        html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
            if (match.includes('1.') || match.includes('2.')) {
                return `<ol>${match}</ol>`;
            }
            return `<ul>${match}</ul>`;
        });

        // Paragraphs (split by double line breaks)
        const paragraphs = html.split('\n\n');
        html = paragraphs.map(p => {
            p = p.trim();
            if (p === '') return '';
            if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') ||
                p.startsWith('<pre') || p.startsWith('<img')) {
                return p;
            }
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('\n');

        return html;
    }

    // Escape HTML characters for code blocks
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Export for use in other files
window.MarkdownParser = MarkdownParser;
