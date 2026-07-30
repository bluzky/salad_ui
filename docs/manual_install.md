# Manual installation

If you want to config yourself, here is step by step adding configuration to get SaladUI working in your project

1. Add custom color
- Goto [https://ui.shadcn.com/themes](https://ui.shadcn.com/themes).
- Choose a color → Copy code → Paste to your `app.css` file
- Create new file `tailwind.colors.json` in your assets directory and paste following content
```json
{
  "accent": {
    "DEFAULT": "hsl(var(--accent))",
    "foreground": "hsl(var(--accent-foreground))"
  },
  "background": "hsl(var(--background))",
  "border": "hsl(var(--border))",
  "card": {
    "DEFAULT": "hsl(var(--card))",
    "foreground": "hsl(var(--card-foreground))"
  },
  "destructive": {
    "DEFAULT": "hsl(var(--destructive))",
    "foreground": "hsl(var(--destructive-foreground))"
  },
  "foreground": "hsl(var(--foreground))",
  "input": "hsl(var(--input))",
  "muted": {
    "DEFAULT": "hsl(var(--muted))",
    "foreground": "hsl(var(--muted-foreground))"
  },
  "popover": {
    "DEFAULT": "hsl(var(--popover))",
    "foreground": "hsl(var(--popover-foreground))"
  },
  "primary": {
    "DEFAULT": "hsl(var(--primary))",
    "foreground": "hsl(var(--primary-foreground))"
  },
  "ring": "hsl(var(--ring))",
  "secondary": {
    "DEFAULT": "hsl(var(--secondary))",
    "foreground": "hsl(var(--secondary-foreground))"
  }
}
```

2. Configure Tailwind v4 in `assets/css/app.css`
- Tell Tailwind to extract classes from `SaladUI`
- Add custom colors
- Add Tailwind plugins
```css
@import "tailwindcss";

@source "../../deps/salad_ui/lib";
@source "../../lib";
@source "../js";

@plugin "@tailwindcss/typography";
@import "../vendor/tw-animate.css";

@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
}
```

- Download [`tw-animate.css`](https://raw.githubusercontent.com/Wombosvideo/tw-animate-css/refs/heads/main/src/tw-animate.css) into `assets/vendor/tw-animate.css`.

3. **Add javascript to handle event from server**
This add ability to execute client action from server. It's similar to `JS.exec/2`. Thanks to [this post](https://fly.io/phoenix-files/server-triggered-js/) from fly.io.

Add this code snippet to the end of `app.js`

```js
window.addEventListener("phx:js-exec", ({ detail }) => {
  document.querySelectorAll(detail.to).forEach((el) => {
    liveSocket.execJS(el, el.getAttribute(detail.attr));
  });
});
```

Then from server side, you can close an opening sheet like this.
```elixir
  @impl true
  def handle_event("update", params, socket) do
    # your logic
    {:noreply, push_event(socket, "js-exec", %{to: "#my-sheet", attr: "phx-hide-sheet"})}
  end
```

4. Some tweaks
Thanks to @ahacking

- To make dark and light mode work correctly, add following to your `app.css`
```css
body {
    @apply bg-background text-foreground;
}
```

- In case border color not working correctly, add following to your `app.css`
```css
@layer base {
    *, ::after, ::before, ::backdrop, ::file-selector-button {
        border-color: hsl(var(--border));
    }
}
```
