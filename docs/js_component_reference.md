# JavaScript Component Reference

Quick reference guide for all JavaScript components in SaladUI, their states, events, and special features.

## Core Classes

### Component (`core/component.js`)

Base class for all interactive components.

**Properties:**
- `el` - Root DOM element
- `hook` - LiveView hook context
- `stateMachine` - State machine instance
- `options` - Parsed from `data-options`
- `allParts` - Array of queryable parts

**Methods:**
- `getComponentConfig()` - Override to define component behavior (must return a fresh object each call)
- `transition(event, params)` - Trigger state transition
- `getPart(name)` - Get single part by name
- `getAllParts(name)` - Get all parts with name
- `getPartId(name)` - Get or generate ID for part
- `pushEvent(event, data)` - Send event to server
- `handleCommand(command, params)` - Handle server commands
- `setupComponentEvents()` - Override for custom event setup, called once by `setupEvents()`
- `teardownComponentEvents()` - Override to undo `setupComponentEvents()`, called from `removeAllEvents()`
- `afterMount()` - Override for logic that needs live listeners, called once right after `setupEvents()`
- `beforeDestroy()` - Override for cleanup, called before listeners are removed
- `destroy()` - Cleanup and remove listeners

See [Component Lifecycle](component_lifecycle.md) for the full contract
between these hooks (which pair with which, and why).

### StateMachine (`core/state-machine.js`)

State management with transitions.

**Methods:**
- `transition(event, params)` - Execute transition
- `determineNextState(transition, params)` - Resolve next state
- `executeTransition(prev, next, params)` - Execute full transition
- `executeStateHandler(state, type, params)` - Execute enter/exit handlers

**Properties:**
- `state` - Current state
- `previousState` - Previous state
- `stateConfig` - State machine configuration

### ComponentRegistry (`core/factory.js`)

Component registration and factory.

**Methods:**
- `register(type, ComponentClass)` - Register component type
- `create(type, el, hookContext)` - Create component instance

### SaladUIHook (`core/hook.js`)

Phoenix LiveView hook for component integration.

**Lifecycle:**
- `mounted()` - Initialize component
- `updated()` - Reinitialize on DOM update
- `destroyed()` - Cleanup component

## Interactive Components

### Accordion (`components/accordion.js`)

Collapsible sections with keyboard navigation.

**States:**
- `idle` - Normal state

**Options:**
- `allowMultiple` - Allow multiple items open (default: false)
- `defaultValue` - Initially opened items

**Events:**
- `item-opened` - Item was opened
- `item-closed` - Item was closed

**Parts:**
- `root` - Container
- `item` - Accordion item
- `item-trigger` - Item header/button
- `item-content` - Item content panel

**ARIA:**
- Triggers have `role="button"` and `aria-expanded`
- Content has `role="region"` and `aria-labelledby`

### Command (`components/command.js`)

Command palette with search and keyboard navigation.

**States:**
- `idle` - Normal state
- `searching` - User is searching

**Options:**
- `filter` - Custom filter function
- `placeholder` - Search placeholder text

**Events:**
- `item-selected` - Item was selected
- `search` - Search query changed

**Parts:**
- `root` - Container
- `input` - Search input
- `list` - Results list
- `item` - Result item
- `empty` - Empty state message

**Keyboard:**
- `↓` - Navigate down
- `↑` - Navigate up
- `Enter` - Select item
- `Escape` - Clear or close

### Dialog (`components/dialog.js`)

Modal dialog with focus trap.

**States:**
- `closed` - Dialog is closed
- `open` - Dialog is open

**Options:**
- `closeOnOutsideClick` - Close on overlay click (default: true)
- `animations` - Animation configurations

**Events:**
- `opened` - Dialog opened
- `closed` - Dialog closed

**Parts:**
- `root` - Container
- `trigger` - Open button
- `content` - Dialog container
- `content-panel` - Dialog panel
- `overlay` - Backdrop
- `close-trigger` - Close button
- `title` - Dialog title
- `description` - Dialog description

**Features:**
- Focus trap when open
- Escape key to close
- Click outside to close (optional)

**ARIA:**
- `role="dialog"` on content
- `aria-modal="true"` when open
- `aria-labelledby` and `aria-describedby`

### DropdownMenu (`components/dropdown_menu.js`)

Context menu with keyboard navigation.

**States:**
- `closed` - Menu closed
- `open` - Menu open

**Options:**
- `positioning` - Menu positioning config

**Events:**
- `opened` - Menu opened
- `closed` - Menu closed
- `item-selected` - Item selected

**Parts:**
- `root` - Container
- `trigger` - Menu trigger
- `content` - Menu panel
- `item` - Menu item
- `separator` - Visual separator
- `label` - Section label

**Keyboard:**
- `↓` - Navigate down
- `↑` - Navigate up
- `Enter`/`Space` - Select item
- `Escape` - Close menu

**ARIA:**
- `role="menu"` on content
- `role="menuitem"` on items
- `role="separator"` on separators

### HoverCard (`components/hover-card.js`)

Contextual information on hover.

**States:**
- `closed` - Card hidden
- `open` - Card visible

**Options:**
- `openDelay` - Delay before opening (default: 200ms)
- `closeDelay` - Delay before closing (default: 300ms)

**Events:**
- `opened` - Card opened
- `closed` - Card closed

**Parts:**
- `root` - Container
- `trigger` - Hover target
- `content` - Card content panel

**Features:**
- Delay timers for open/close
- Mouse enter/leave detection
- Positioning relative to trigger

### Menu (`components/menu.js`)

Base menu component with navigation.

**States:**
- `closed` - Menu closed
- `open` - Menu open

**Features:**
- Keyboard navigation (arrow keys)
- Typeahead search
- Nested submenus
- Mouse and keyboard interaction

**Parts:**
- `root` - Container
- `trigger` - Menu trigger
- `content` - Menu panel
- `item` - Menu item
- `submenu` - Nested submenu
- `separator` - Visual divider

### Popover (`components/popover.js`)

Floating content panel.

**States:**
- `closed` - Popover closed
- `open` - Popover open

**Options:**
- `positioning` - Positioning configuration
- `closeOnOutsideClick` - Close on outside click

**Events:**
- `opened` - Popover opened
- `closed` - Popover closed

**Parts:**
- `root` - Container
- `trigger` - Open button
- `content` - Popover panel
- `close-trigger` - Close button

**Features:**
- Auto-positioning
- Click outside detection
- Escape to close

### RadioGroup (`components/radio_group.js`)

Radio button group with keyboard navigation.

**States:**
- `idle` - Normal state

**Options:**
- `defaultValue` - Initially selected value
- `orientation` - `horizontal` or `vertical`

**Events:**
- `value-changed` - Selection changed

**Parts:**
- `root` - Container
- `item` - Radio button
- `indicator` - Visual indicator

**Keyboard:**
- `↓`/`→` - Next item
- `↑`/`←` - Previous item
- `Space` - Select item

**ARIA:**
- `role="radiogroup"` on root
- `role="radio"` on items
- `aria-checked` on selected item

### ScrollArea (`components/scroll_area.js`)

Custom scrollbar component.

**Features:**
- Custom scrollbar styling
- Horizontal and vertical scrolling
- Auto-hide scrollbars

**Parts:**
- `root` - Container
- `viewport` - Scrollable area
- `scrollbar` - Scrollbar track
- `thumb` - Scrollbar thumb

### Select (`components/select.js`)

Dropdown select with search and keyboard navigation.

**States:**
- `closed` - Select closed
- `open` - Select open

**Options:**
- `searchable` - Enable search (default: false)
- `clearable` - Show clear button (default: false)
- `multiple` - Multiple selection (default: false)
- `placeholder` - Placeholder text

**Events:**
- `opened` - Select opened
- `closed` - Select closed
- `value-changed` - Selection changed
- `search` - Search query changed

**Parts:**
- `root` - Container
- `trigger` - Select button
- `value` - Selected value display
- `content` - Options panel
- `search-input` - Search input (if searchable)
- `item` - Select option
- `clear-button` - Clear button (if clearable)

**Keyboard:**
- `↓` - Navigate down
- `↑` - Navigate up
- `Enter`/`Space` - Select item
- `Escape` - Close
- Type to search (if searchable)

**ARIA:**
- `role="combobox"` on trigger
- `role="listbox"` on content
- `role="option"` on items
- `aria-selected` on selected items

### Slider (`components/slider.js`)

Range input slider.

**States:**
- `idle` - Not being dragged
- `dragging` - Currently dragging

**Options:**
- `min` - Minimum value (default: 0)
- `max` - Maximum value (default: 100)
- `step` - Step increment (default: 1)
- `orientation` - `horizontal` or `vertical`
- `multiple` - Multiple thumbs

**Events:**
- `value-changed` - Value changed
- `drag-start` - Drag started
- `drag-end` - Drag ended

**Parts:**
- `root` - Container
- `track` - Slider track
- `range` - Filled range
- `thumb` - Draggable handle

**Keyboard:**
- `←`/`↓` - Decrease value
- `→`/`↑` - Increase value
- `Home` - Minimum value
- `End` - Maximum value
- `PageUp`/`PageDown` - Large increment

**ARIA:**
- `role="slider"` on thumb
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- `aria-orientation`

### Switch (`components/switch.js`)

Toggle switch component.

**States:**
- `unchecked` - Switch off
- `checked` - Switch on

**Options:**
- `defaultChecked` - Initial state

**Events:**
- `checked` - State changed

**Parts:**
- `root` - Container
- `thumb` - Switch thumb
- `input` - Hidden input

**Keyboard:**
- `Space`/`Enter` - Toggle

**ARIA:**
- `role="switch"` on root
- `aria-checked` reflects state

### Tabs (`components/tabs.js`)

Tabbed content interface.

**States:**
- Per tab: `active` or `inactive`

**Options:**
- `defaultValue` - Initially active tab
- `orientation` - `horizontal` or `vertical`

**Events:**
- `tab-changed` - Active tab changed

**Parts:**
- `root` - Container
- `list` - Tab list container
- `trigger` - Tab button
- `content` - Tab panel

**Keyboard:**
- `←`/`→` - Navigate tabs (horizontal)
- `↑`/`↓` - Navigate tabs (vertical)
- `Home` - First tab
- `End` - Last tab

**ARIA:**
- `role="tablist"` on list
- `role="tab"` on triggers
- `role="tabpanel"` on content
- `aria-selected` on active tab
- `aria-controls` links trigger to panel

### Tooltip (`components/tooltip.js`)

Hover tooltip with delay.

**States:**
- `closed` - Tooltip hidden
- `open` - Tooltip visible

**Options:**
- `delay` - Open delay (default: 200ms)
- `closeDelay` - Close delay (default: 0ms)

**Events:**
- `opened` - Tooltip opened
- `closed` - Tooltip closed

**Parts:**
- `root` - Container
- `trigger` - Hover target
- `content` - Tooltip content

**Features:**
- Delay timers
- Auto-positioning
- Mouse tracking

**ARIA:**
- `role="tooltip"` on content
- `aria-describedby` on trigger

### Collapsible (`components/collapsible.js`)

Expandable content panel.

**States:**
- `collapsed` - Content hidden
- `expanded` - Content visible

**Options:**
- `defaultOpen` - Initially expanded

**Events:**
- `opened` - Content expanded
- `closed` - Content collapsed

**Parts:**
- `root` - Container
- `trigger` - Toggle button
- `content` - Collapsible content

**Keyboard:**
- `Space`/`Enter` - Toggle

**ARIA:**
- `role="button"` on trigger
- `aria-expanded` reflects state
- `aria-controls` links trigger to content

### Chart (`components/chart.js`)

Chart.js integration component.

**States:**
- `idle` - Normal state
- `loading` - Loading data

**Options:**
- Chart.js configuration options

**Events:**
- `chart-created` - Chart initialized
- `data-updated` - Data refreshed

**Commands:**
- `update` - Update chart data
- `resize` - Resize chart
- `destroy` - Destroy chart instance

**Features:**
- Wraps Chart.js library
- Dynamic data updates
- Responsive sizing

## Utility Classes

### FocusTrap (`core/focus-trap.js`)

Traps focus within an element.

**Methods:**
- `activate()` - Enable focus trap
- `deactivate()` - Disable focus trap
- `destroy()` - Cleanup

### ClickOutsideMonitor (`core/click-outside.js`)

Detects clicks outside elements.

**Constructor:**
```javascript
new ClickOutsideMonitor(elements, callback)
```

**Methods:**
- `start()` - Start monitoring
- `stop()` - Stop monitoring
- `destroy()` - Cleanup

### Positioning Utilities (`core/utils.js`)

**Functions:**
- `animateTransition(config, element)` - Apply CSS transitions
- `queryDOM(root, filter)` - Query DOM with filter function

## Common Patterns

### Basic Component Setup

```javascript
import Component from "../core/component";
import SaladUI from "../index";

class MyComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, initialState: "idle" });
  }

  getComponentConfig() {
    return {
      stateMachine: { /* ... */ },
      events: { /* ... */ },
      hiddenConfig: { /* ... */ },
      ariaConfig: { /* ... */ }
    };
  }
}

SaladUI.register("my-component", MyComponent);
export default MyComponent;
```

### With Focus Trap

```javascript
import FocusTrap from "../core/focus-trap";

onOpenEnter() {
  if (!this.focusTrap) {
    this.focusTrap = new FocusTrap(this.contentPanel);
  }
  this.focusTrap.activate();
}

onClosedEnter() {
  this.focusTrap?.deactivate();
}

beforeDestroy() {
  this.focusTrap?.destroy();
  this.focusTrap = null;
}
```

### With Click Outside Detection

```javascript
import ClickOutsideMonitor from "../core/click-outside";

setupComponentEvents() {
  super.setupComponentEvents();

  if (this.options.closeOnOutsideClick) {
    this.clickOutsideMonitor = new ClickOutsideMonitor(
      [this.contentPanel],
      () => this.transition("close")
    );
  }
}

// Pair teardown with setup — not beforeDestroy(). teardownComponentEvents()
// also runs if setupEvents() is ever re-invoked, so this is the only place
// guaranteed to undo what setupComponentEvents() created. See
// docs/component_lifecycle.md#common-pitfalls for what goes wrong if this
// cleanup lives in beforeDestroy() instead.
teardownComponentEvents() {
  super.teardownComponentEvents();
  this.clickOutsideMonitor?.destroy();
  this.clickOutsideMonitor = null;
}

onOpenEnter() {
  // start()/stop() just pause/resume the monitor — they don't create or
  // destroy it.
  this.clickOutsideMonitor?.start();
}

onClosedEnter() {
  this.clickOutsideMonitor?.stop();
}
```

### With Keyboard Navigation

```javascript
constructor(el, hookContext) {
  super(el, { hookContext });
  this.currentIndex = 0;
  this.items = [];
}

setupComponentEvents() {
  super.setupComponentEvents();
  this.items = this.getAllParts("item");
}

getEventConfig() {
  return {
    open: {
      keyMap: {
        ArrowDown: () => this.navigateNext(),
        ArrowUp: () => this.navigatePrev(),
        Enter: () => this.selectCurrent(),
        Escape: "close"
      }
    }
  };
}

navigateNext() {
  this.currentIndex = Math.min(
    this.currentIndex + 1,
    this.items.length - 1
  );
  this.focusCurrentItem();
}

navigatePrev() {
  this.currentIndex = Math.max(this.currentIndex - 1, 0);
  this.focusCurrentItem();
}

focusCurrentItem() {
  this.items[this.currentIndex]?.focus();
}
```

## Testing Components

### Manual Testing

Use the storybook application:
```bash
cd storybook
mix phx.server
# Visit http://localhost:4000
```

### Console Testing

```javascript
// In browser console
const dialog = document.querySelector("[data-component='dialog']");

// Access component instance (if exposed)
const component = dialog._saladui_component;

// Or send commands
dialog.dispatchEvent(new CustomEvent("salad_ui:command", {
  detail: { command: "open", params: {} }
}));
```

### Debug Mode

Add logging to components:
```javascript
onStateChanged(prev, next) {
  console.log(`State: ${prev} → ${next}`);
  return super.onStateChanged(prev, next);
}

transition(event, params) {
  console.log(`Transition: ${event}`, params);
  return super.transition(event, params);
}
```

## Performance Tips

1. **Cache part references** in constructor
2. **Use event delegation** where possible
3. **Debounce expensive operations** (search, positioning)
4. **Pair setup/teardown**: undo `setupComponentEvents()` in `teardownComponentEvents()`, and other cleanup in `beforeDestroy()`, to prevent memory leaks
5. **Minimize DOM queries** in event handlers
6. **Use requestAnimationFrame** for animations
7. **Lazy initialize** expensive features (focus trap, positioning)

## Common Pitfalls

1. **Forgetting to register component** - Always call `SaladUI.register()`
2. **Not cleaning up listeners** - Anything created in `setupComponentEvents()` needs a matching `teardownComponentEvents()`; other cleanup goes in `beforeDestroy()`
3. **Querying parts too early** - Parts may not be available in constructor
4. **Missing ARIA attributes** - Define complete `ariaConfig`
5. **Calling `setupEvents()` yourself** - It's called exactly once by the factory; use `afterMount()` if you need logic to run after listeners are live (see [Component Lifecycle](component_lifecycle.md#common-pitfalls) for the bug this caused historically)
5. **Not handling LiveView updates** - Component is recreated on updates
6. **Circular event loops** - Be careful with pushEvent triggering updates
7. **Missing error handling** - Validate data in `parseOptions()`
