//Written by CSingendonk
function initLogs() {
    console.log('Initializing logs...');

    class _Injector {
        constructor() {
            console.log('_Injector initialized.');
        }

        initFetchInterceptor() {
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                console.log('Intercepted Fetch Request:', args[0]);
                console.log('Method:', args[1]?.method || 'GET');
                const shouldProceed = confirm(`Allow fetch request to ${args[0]}?`);
                if (!shouldProceed) {
                    console.log('Fetch request blocked.');
                    return new Response(null, { status: 403, statusText: 'Request blocked' });
                }
                return originalFetch(...args);
            };
        }

        initXHRInterceptor() {
            const originalXHR = window.XMLHttpRequest;
            class InterceptedXHR extends originalXHR {
                open(method, url, ...args) {
                    console.log(`Intercepted XHR Request: ${method} ${url}`);
                    const shouldProceed = confirm(`Allow XHR request to ${url}?`);
                    if (!shouldProceed) {
                        console.log('XHR request blocked.');
                        method = 'GET';
                        url = '/';
                        args = [];
                    }
                    return super.open(method, url, ...args);
                }
            }
            window.XMLHttpRequest = InterceptedXHR;
        }
    }

    class HttpInterceptor extends _Injector {
        constructor(serviceWorkerPath = './service-worker.js', options = {}) {
            super();
            this.serviceWorkerPath = serviceWorkerPath;
            this.options = options;
            this.initFetchInterceptor();
            this.initXHRInterceptor();
            this.registerServiceWorker();
        }

        async registerServiceWorker() {
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register(this.serviceWorkerPath, this.options);
                    console.log('Service Worker registered successfully.');
                } catch (error) {
                    console.error('Service Worker registration failed:', error);
                }
            }
        }
    }

    const interceptor = new HttpInterceptor();
    console.log('HTTP Interceptor initialized.');

    const originalConsoleLog = window.console.log;
    window.console.log = function(...args) {
        originalConsoleLog.apply(console, args);

        // Process all arguments to ensure comprehensive logging
        const processItem = (item) => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object') {
                try {
                    return JSON.stringify(item, null, 2);
                } catch (e) {
                    return String(item);
                }
            }
            return String(item);
        };

        let finalMessage = args.map(processItem).join(' | ');

        const logEntry = {
            timestamp: new Date().toISOString(),
            type: args.type || 'Interception',
            messages: args.map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg, null, 2);
                }
                return String(arg);
            }),
            data: args, // Storing all arguments for detailed view
        };

        showToast(logEntry);
    };

    function showToast(logEntry) {
        const toast = document.createElement('div');
        toast.className = 'console-toast';

        // Toast Header
        const toastHeader = document.createElement('div');
        toastHeader.className = 'toast-header';

        const timestamp = document.createElement('span');
        timestamp.className = 'toast-timestamp';
        timestamp.textContent = new Date(logEntry.timestamp).toLocaleTimeString();

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'toast-buttons';

        const minimizeButton = document.createElement('button');
        minimizeButton.className = 'toast-button minimize-button';
        minimizeButton.innerHTML = '&#x2212;'; // Minus symbol

        const closeButton = document.createElement('button');
        closeButton.className = 'toast-button close-button';
        closeButton.innerHTML = '&#x2715;'; // Multiplication (X) symbol

        buttonsContainer.appendChild(minimizeButton);
        buttonsContainer.appendChild(closeButton);

        toastHeader.appendChild(timestamp);
        toastHeader.appendChild(buttonsContainer);

        // Toast Content
        const toastContent = document.createElement('div');
        toastContent.className = 'toast-content';

        // Structured Log Information
        const logDetails = document.createElement('pre');
        logDetails.className = 'log-details';
        logDetails.textContent = JSON.stringify(logEntry, null, 2);

        toastContent.appendChild(logDetails);

        // Append Header and Content to Toast
        toast.appendChild(toastHeader);
        toast.appendChild(toastContent);

        // Styling and positioning the toast via CSS
        addToastStyles();

        // Event Listeners for Buttons
        closeButton.addEventListener('click', () => {
            shrinkToast(toast);
        });

        let isMinimized = false;
        minimizeButton.addEventListener('click', () => {
            if (!isMinimized) {
                toastContent.style.display = 'none';
                isMinimized = true;
                minimizeButton.innerHTML = '&#x25B6;'; // Right-pointing triangle
            } else {
                toastContent.style.display = 'block';
                isMinimized = false;
                minimizeButton.innerHTML = '&#x2212;'; // Minus symbol
            }
        });

        // Append toast to body
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-removal after 10 seconds
        let autoRemoveTimeout = setTimeout(() => {
            shrinkToast(toast);
        }, 10000);

        // Pause auto-removal on hover
        toast.addEventListener('mouseenter', () => {
            clearTimeout(autoRemoveTimeout);
        });

        toast.addEventListener('mouseleave', () => {
            autoRemoveTimeout = setTimeout(() => {
                shrinkToast(toast);
            }, 3000);
        });

        // Function to shrink and remove toast
        function shrinkToast(toastElement) {
            toastElement.classList.remove('show');
            toastElement.classList.add('hide');
            setTimeout(() => {
                toastElement.remove();
                repositionToasts();
            }, 300);
        }

        // Reposition remaining toasts
        function repositionToasts() {
            const existingToasts = Array.from(document.querySelectorAll('.console-toast.show'));
            existingToasts.forEach((toast, index) => {
                const spacing = 20;
                toast.style.bottom = `${spacing + index * (toast.offsetHeight + spacing)}px`;
            });
        }
    }

    // Function to add necessary CSS styles for toasts
    function addToastStyles() {
        if (document.getElementById('console-toast-styles')) return; // Prevent duplicate styles

        const style = document.createElement('style');
        style.id = 'console-toast-styles';
        style.textContent = `
            .console-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 12px;
                border-radius: 6px;
                z-index: 9999;
                max-width: 300px;
                word-wrap: break-word;
                transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
                transform: translateX(100%) scale(0);
                opacity: 0;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }
            .console-toast.show {
                transform: translateX(0) scale(1);
                opacity: 1;
            }
            .console-toast.hide {
                transform: translateX(100%) scale(0);
                opacity: 0;
            }
            .toast-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .toast-timestamp {
                font-size: 12px;
                opacity: 0.8;
            }
            .toast-buttons {
                display: flex;
                gap: 5px;
            }
            .toast-button {
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 14px;
                padding: 2px 5px;
                transition: color 0.2s;
            }
            .toast-button:hover {
                color: #ffcccc;
            }
            .toast-content {
                max-height: 200px;
                overflow-y: auto;
            }
            .log-details {
                white-space: pre-wrap;
                font-size: 12px;
                line-height: 1.4;
            }
        `;
        document.head.appendChild(style);
    }

    window.initLogs = function() {
        console.log('Calling initLogs from the global window object...');
        const interceptor = new HttpInterceptor();
        console.log('HTTP Interceptor initialized via window.initLogs.');
    };
}

initLogs();
