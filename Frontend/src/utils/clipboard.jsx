// Utility function to copy text to clipboard
export const copyToClipboard = (text, callback) => {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        if (callback) callback();
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
};