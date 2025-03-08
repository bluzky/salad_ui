// saladui/components/dialog.js
import SaladUI from '../index';

const DialogComponent = SaladUI.defineComponent('dialog', {
  init() {
    this.content = this.getPart('content');
    this.previouslyFocused = null;
    this.config.preventDefaultKeys = ['Escape', 'Tab'];
  },

  stateMachine: {
    closed: {
      enter: 'onClosedEnter',
      exit: 'onClosedExit',
      aria: {
        "hidden": "true"
      },
      keyMap: {},
      transitions: {
        open: "open"
      }
    },

    open: {
      enter: 'onOpenEnter',
      exit: 'onOpenExit',
      aria: {
        "hidden": "false",
        "modal": "true"
      },
      keyMap: {
        "Escape": "close",
        "Tab": "onTabKey"
      },
      transitions: {
        close: "closed"
      }
    }
  },

  setupEvents() {
    if (this.options.closeOnOutsideClick) {
      this.el.addEventListener('click', (e) => {
        if (this.state === 'open' && e.target === this.el) {
          this.transition('close');
        }
      });
    }

    const trigger = this.el.querySelector('[data-trigger]');
    if (trigger) {
      trigger.addEventListener('click', () => {
        this.transition('open');
      });
    }
  },

  methods: {
    onClosedEnter(params = {}) {
      if (!params.animated) {
        this.el.style.display = 'none';
      }

      if (this.previouslyFocused && this.previouslyFocused.focus) {
        this.previouslyFocused.focus();
      }

      this.pushEvent('closed');
    },

    onClosedExit() {},

    onOpenEnter(params = {}) {
      if (!params.animated) {
        this.el.style.display = 'flex';
      }

      if (!this.previouslyFocused) {
        this.previouslyFocused = document.activeElement;
      }

      if (params.animated) {
        setTimeout(() => this.setInitialFocus(), 50);
      } else {
        this.setInitialFocus();
      }

      this.pushEvent('opened');
    },

    onOpenExit() {
      this.previouslyFocused = null;
    },

    onTabKey(event) {
      this.handleTabKey(event);
    },

    setInitialFocus() {
      setTimeout(() => {
        const focusableElements = this.getFocusableElements();

        if (focusableElements.length > 0) {
          const autoFocusEl = this.el.querySelector('[autofocus]');
          const initialFocusEl = autoFocusEl || focusableElements[0];
          initialFocusEl.focus();
        } else if (this.content) {
          this.content.setAttribute('tabindex', '-1');
          this.content.focus();
        }
      }, 50);
    },

    handleTabKey(event) {
      const focusableElements = this.getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!event.shiftKey && activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
      else if (event.shiftKey && activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    },

    updateAriaAttributes() {
      super.updateAriaAttributes();

      if (this.state === 'open' && this.content) {
        this.content.setAttribute('role', 'dialog');

        const title = this.getPart('title');
        if (title) {
          if (!title.id) title.id = `${this.el.id}-title`;
          this.content.setAttribute('aria-labelledby', title.id);
        }

        const description = this.getPart('description');
        if (description) {
          if (!description.id) description.id = `${this.el.id}-desc`;
          this.content.setAttribute('aria-describedby', description.id);
        }
      }
    }
  }
});

SaladUI.register('dialog', DialogComponent);

export default DialogComponent;
