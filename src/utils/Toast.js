// Toast Notification System - Thay thế cho alert()
class ToastNotification {
  constructor() {
    this.toastContainer = null;
    this.initContainer();
  }

  initContainer() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(this.toastContainer);
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    const colors = {
      success: { bg: '#28a745', icon: '✓' },
      error: { bg: '#dc3545', icon: '✕' },
      warning: { bg: '#ffc107', icon: '⚠' },
      info: { bg: '#17a2b8', icon: 'ℹ' }
    };

    const config = colors[type] || colors.info;

    toast.style.cssText = `
      background: ${config.bg};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideInRight 0.3s ease-out;
      pointer-events: auto;
      font-weight: 500;
      font-size: 14px;
    `;

    toast.innerHTML = `
      <span style="font-size: 20px; font-weight: bold;">${config.icon}</span>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        this.toastContainer.removeChild(toast);
      }, 300);
    }, duration);
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }
}

// Thêm animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export const toast = new ToastNotification();
