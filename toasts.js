/**
 * A custom HTML element that provides a toast notification system.
 * 
 * The `ToastContainer` element creates a fixed container at the top-right of the page
 * that displays toast notifications. Toasts can be added to the container using the
 * `showToast()` method, and the container can be positioned in different locations
 * on the page using the `position` attribute.
 * 
 * Toasts are displayed with a sliding animation and can be configured to automatically
 * disappear after a specified timeout. The container also supports different toast
 * categories (e.g. "network", "error", "success") which can be used to apply different
 * styles to the toasts.
 * 
 * The `ToastContainer` element dispatches `toastadded` and `toastremoved` events
 * when toasts are added or removed from the container.
 * @author Chris Singendonk
 * @copyright 2024 - present
 */
class ToastContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .toaster- {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    flex-direction: column;
                    align-items: flex-end;
                    z-index: ${this.DOCUMENT_NODE};
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 0.5%;
                    max-width: 33vmax;
                    width: fit-content;
                    display: block;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: flex-end;
                    gap: 10px;
                    
                }
                .toast {
                    pointer-events: auto;
                    background: rgba(50, 50, 50, 0.9);
                    color: #fff;
                    padding: 10px 16px;
                    margin-bottom: 8px;
                    border-radius: 6px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
                    font-size: 14px;
                    font-family: monospace;
                    max-width: 300px;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                    opacity: 0;
                    transform: translateX(100%) scale(0.8);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .toast.show {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
                .toast.network { background: rgba(255, 165, 0, 0.9); }
                .toast.error   { background: rgba(255, 50, 50, 0.9); }
                .toast.blocked { background: rgba(128, 0, 128, 0.9); }
                .toast.success { background: rgba(0, 128, 0, 0.9); }
                .toast.info    { background: rgba(0, 0, 255, 0.9); }
                .toast.trace   { background: rgba(128, 128, 128, 0.9); }
                .toast.table   { background: rgba(70, 130, 180, 0.9); }
                
                .toaster-[position="left"] {
                    left: 20px;
                    right: auto;
                    align-items: flex-start;
                }
                
                .toaster-[position="center"] {
                    left: 50%;
                    right: auto;
                    transform: translateX(-50%);
                    align-items: center;
                }
                
                .toaster-[position="bottom"] {
                    top: auto;
                    bottom: 20px;
                }
                
                .toaster-[position="top"] {
                    top: 20px;
                    bottom: auto;
                }
            </style>
            <div class="toaster-"></div>
        `;
        this.toasts = new Set();
    }
    connectedCallback() {
        this.addEventListener('toastadded', this.onToastAdded.bind(this));
        this.addEventListener('toastremoved', this.onToastRemoved.bind(this));
        this.setAttribute('position', 'right');
        this.setAttribute('timeout', '5000');
        this.setAttribute('autoscroll', 'true');
        this.timeout = this.getAttribute('timeout');
        this.position = this.getAttribute('position');
        this.autoscroll = this.getAttribute('autoscroll') === 'true';
        this.shadowRoot.querySelector('.toaster-').classList.add(`toaster-[position="${this.position}"]`);

    }

    disconnectedCallback() {
        this.removeEventListener('toastadded', this.onToastAdded.bind(this));
        this.removeEventListener('toastremoved', this.onToastRemoved.bind(this));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'position') {
            this.shadowRoot.querySelector('.toaster-').classList.remove(`toaster-[position="${oldValue}"]`);
            this.shadowRoot.querySelector('.toaster-').classList.add(`toaster-[position="${newValue}"]`);
        }
        if (name === 'timeout') {
            this.timeout = newValue;
            if (newValue === '0') {
                this.timeout = Number.MAX_SAFE_INTEGER;
            } else {
                this.timeout = parseInt(newValue, 10);
            }
        }
        if (name === 'autoscroll') {
            this.autoscroll = newValue === 'true';
        }
        
    }

    onToastAdded(event) {
        const toast = event.detail.toast;
        this.toasts.add(toast);
        this.shadowRoot.querySelector('.toaster-').appendChild(toast);
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                this.shadowRoot.querySelector('.toaster-').removeChild(toast);
                this.toasts.delete(toast);
            }, 300);
        }, this.timeout);
    }

    onToastRemoved(event) {
        const toast = event.detail.toast;
        this.toasts.delete(toast);
    }


    static create(addToBody = true, position = 'bottom', timeoutMs = 5000) {
        const container = document.createElement('toaster-');
        if (addToBody) document.body.appendChild(container);
        container.setAttribute('position', position);
        container.setAttribute('timeout', timeoutMs);
        return container;
    }
    
    createToastElement(message, category) {
        const toast = document.createElement("div");
        toast.className = `toast ${category}`;
        return toast;
    }

    createIconElement(category) {
        const icon = document.createElement("span");
        icon.className = "icon";
    
        const icons = {
            network: "🌐",
            error: "❌",
            blocked: "⛔",
            success: "✅",
            info: "ℹ️",
            trace: "🔍",
            table: "📊"
        };

        icon.textContent = icons[category] || "💬";
        return icon;
    }

    createMessageElement(message) {
        const messageSpan = document.createElement("span");
        messageSpan.textContent = message;
        return messageSpan;
    }

    animateToast(toast, timeoutMs) {
        
        const it = this;
        requestAnimationFrame(() => toast.classList.add("show"));
    
        setTimeout((it = this) => {
            toast.classList.remove("show");

            setTimeout((it = this) => {
                toast.remove();
                it.toasts.delete(toast);
                it.dispatchEvent(new CustomEvent('toastremoved', { 
                    detail: { toast }
                }));
            }, 300);
        }, timeoutMs);
    }

    showToast(message, category = "network", timeoutMs = 5000, it = this) {
        const container = it.shadowRoot.querySelector('.toaster-');
        const toast = it.createToastElement(message, category);
        const icon = it.createIconElement(category);
        const messageSpan = it.createMessageElement(message);
    
        toast.appendChild(icon);
        toast.appendChild(messageSpan);
        container.appendChild(toast);
        
        it.toasts.add(toast);
        it.dispatchEvent(new CustomEvent('toastadded', { 
            detail: { message, category, toast }
        }));
    
        it.animateToast(toast, timeoutMs);
        if (it.autoscroll) {
        container.scrollTo(0, container.scrollHeight);
        }
        return toast;
    }

    clearAll() {
        this.toasts.forEach(toast => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        });
        this.toasts.clear();
    }
    
    getActiveToasts() {
        return Array.from(this.toasts);
    }
}

customElements.define('toaster-', ToastContainer);
