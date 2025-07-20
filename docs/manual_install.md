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

2. Configure tailwind
- Tell tailwind to extract class from `SaladUI`
- Add custom color
- Add tailwind plugin
```js
module.exports = {
  content: [
    "../deps/salad_ui/lib/**/*.ex",
    ],
  theme: {
    extend: {
      colors: require("./tailwind.colors.json"),
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
    ...
  ]
}
```

- Install `tailwindcss-animate`
```
cd assets
npm i -D tailwindcss-animate
```

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
    * {
        @apply border-border !important;
    }
```
