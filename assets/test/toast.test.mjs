import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { toast } from "../salad_ui/components/toast.js";
import { registry } from "../salad_ui/core/factory.js";
import { installDom, setRect, uninstallDom, wait } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());
afterEach(() => {
  document.body.innerHTML = "";
});

function buildToaster({
  id = "toaster",
  options = {},
  eventMappings = {},
  templates = [],
} = {}) {
  const optionsJson = JSON.stringify({
    position: "bottom-right",
    visibleToasts: 3,
    gap: 14,
    ...options,
  });
  const templateMarkup = templates
    .map(
      (tpl) =>
        `<template data-part="toast-template" data-name="${tpl.name}">${tpl.html}</template>`,
    )
    .join("");

  document.body.innerHTML = `
    <div id="${id}" data-component="toast"
         data-options='${optionsJson}'
         data-event-mappings='${JSON.stringify(eventMappings)}'
         data-part="root">
      <ol data-part="viewport" data-position="bottom-right"></ol>
      ${templateMarkup}
    </div>
  `;

  const el = document.getElementById(id);
  const pushed = [];
  const pushedTo = [];
  const hookContext = {
    pushEvent: (event, payload) => pushed.push({ event, payload }),
    pushEventTo: (target, event, payload) =>
      pushedTo.push({ target, event, payload }),
    liveSocket: { execJS: () => {} },
  };

  const component = registry.create("toast", el, hookContext);

  return {
    component,
    el,
    viewport: el.querySelector('[data-part="viewport"]'),
    pushed,
    pushedTo,
    hookContext,
  };
}

function cardFor(viewport, id) {
  return viewport.querySelector(`[data-toast-id="${id}"]`);
}

test("add creates a visible card with title/description", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Saved!",
    description: "All good",
  });
  await wait(10);

  const card = cardFor(viewport, id);
  assert.ok(card);
  assert.equal(card.dataset.state, "visible");
  assert.equal(card.dataset.variant, "default");
  assert.equal(card.querySelector('[data-part="title"]').textContent, "Saved!");
  assert.equal(
    card.querySelector('[data-part="description"]').textContent,
    "All good",
  );
  assert.equal(card.getAttribute("role"), "status");
  assert.equal(card.getAttribute("aria-live"), "polite");

  component.destroy();
});

test("error/warning variants default to assertive alerts", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Broke",
    variant: "error",
  });
  await wait(10);

  const card = cardFor(viewport, id);
  assert.equal(card.getAttribute("role"), "alert");
  assert.equal(card.getAttribute("aria-live"), "assertive");

  component.destroy();
});

test("explicit id is respected and returned", () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", { id: "custom-id", title: "Hi" });

  assert.equal(id, "custom-id");
  assert.ok(cardFor(viewport, "custom-id"));

  component.destroy();
});

test("dismiss plays exit state, removes the card, and pushes dismiss with reason", async () => {
  const { component, viewport, pushedTo } = buildToaster({
    eventMappings: { dismiss: "toast_dismissed" },
  });

  const id = component.handleCommand("add", { title: "Bye" });
  await wait(10);

  component.handleCommand("dismiss", { id });
  const card = cardFor(viewport, id);
  assert.equal(card.dataset.state, "dismissing");

  await wait(550);

  assert.equal(cardFor(viewport, id), null);

  const dismissEvents = eventsNamed(pushedTo, "toast_dismissed");
  assert.equal(dismissEvents.length, 1);
  assert.equal(dismissEvents[0].payload.reason, "programmatic");

  component.destroy();
});

function eventsNamed(pushedList, event) {
  return pushedList.filter((entry) => entry.event === event);
}

test("dismiss with no id dismisses every toast", async () => {
  const { component, viewport } = buildToaster();

  component.handleCommand("add", { title: "One" });
  component.handleCommand("add", { title: "Two" });
  await wait(10);
  assert.equal(viewport.children.length, 2);

  component.handleCommand("dismiss", {});
  await wait(550);

  assert.equal(viewport.children.length, 0);
  component.destroy();
});

test("duration auto-dismisses the toast", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", { title: "Timeout", duration: 20 });
  await wait(10);
  assert.ok(cardFor(viewport, id));

  await wait(600);
  assert.equal(cardFor(viewport, id), null);

  component.destroy();
});

test("infinity duration string never auto-dismisses", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Sticky",
    duration: "infinity",
  });
  await wait(200);

  assert.ok(cardFor(viewport, id));
  component.destroy();
});

test("update patches an existing card in place, keeping its id", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Uploading…",
    variant: "default",
  });
  await wait(10);
  const originalCard = cardFor(viewport, id);

  component.handleCommand("update", {
    id,
    title: "Uploaded",
    variant: "success",
  });
  await wait(10);

  const card = cardFor(viewport, id);
  // Same DOM node, not a replacement — a fresh element would have nothing
  // for the CSS transition to animate from, so the variant swap would
  // hard-cut instead of cross-fading.
  assert.equal(card, originalCard);
  assert.equal(card.dataset.variant, "success");
  assert.equal(
    card.querySelector('[data-part="title"]').textContent,
    "Uploaded",
  );
  assert.equal(viewport.children.length, 1);

  component.destroy();
});

test("resolving a sticky toast to a new variant without an explicit duration still auto-dismisses", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Exporting…",
    duration: "infinity",
  });
  await wait(10);
  assert.ok(cardFor(viewport, id), "sticky toast never auto-dismisses");

  // Resolving, same as toast_update/3: no `duration` is re-specified. The
  // old sticky duration must NOT leak into the resolved toast — it should
  // fall back to the normal default and disappear.
  component.handleCommand("update", {
    id,
    variant: "success",
    title: "Export ready",
  });
  await wait(10);
  assert.equal(cardFor(viewport, id).dataset.variant, "success");

  await wait(4600); // past DEFAULT_DURATION (4000ms) + exit animation
  assert.equal(
    cardFor(viewport, id),
    null,
    "resolved toast must auto-dismiss on the default duration, not inherit the original sticky one",
  );

  component.destroy();
});

test("an explicit duration on update() is still respected across a variant change", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Uploading…",
    variant: "default",
  });
  await wait(10);

  component.handleCommand("update", {
    id,
    variant: "success",
    title: "Uploaded",
    duration: 50,
  });
  await wait(10);
  assert.ok(cardFor(viewport, id));

  await wait(650);
  assert.equal(cardFor(viewport, id), null);

  component.destroy();
});

test("updating without a variant change still inherits the previous duration", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Sticky",
    dismissible: false,
    duration: "infinity",
  });
  await wait(10);

  // Same variant ("default" -> "default"), no duration re-specified: the
  // original sticky duration should carry over, unlike a variant change.
  component.handleCommand("update", { id, description: "Still here" });
  await wait(200);

  assert.ok(
    cardFor(viewport, id),
    "same-variant update must keep the inherited sticky duration",
  );

  component.destroy();
});

test("update with an unknown id falls back to adding a new toast", async () => {
  const { component, viewport } = buildToaster();

  component.handleCommand("update", { id: "ghost", title: "Surprise" });
  await wait(10);

  assert.ok(cardFor(viewport, "ghost"));
  component.destroy();
});

test("add with an id already on the stack updates instead of duplicating", async () => {
  const { component, viewport } = buildToaster();

  component.handleCommand("add", { id: "dup", title: "First" });
  await wait(10);
  component.handleCommand("add", { id: "dup", title: "Second" });
  await wait(10);

  assert.equal(viewport.children.length, 1);
  assert.equal(
    cardFor(viewport, "dup").querySelector('[data-part="title"]').textContent,
    "Second",
  );

  component.destroy();
});

test("front card tracks the newest toast", async () => {
  const { component, viewport } = buildToaster();

  const first = component.handleCommand("add", { title: "First" });
  const second = component.handleCommand("add", { title: "Second" });
  await wait(10);

  assert.equal(cardFor(viewport, first).dataset.front, "false");
  assert.equal(cardFor(viewport, second).dataset.front, "true");

  component.handleCommand("dismiss", { id: second });
  await wait(550);

  assert.equal(cardFor(viewport, first).dataset.front, "true");
  component.destroy();
});

test("a card's height is always a concrete px value, never CSS auto, so front/back flips can animate height", async () => {
  const { component, viewport } = buildToaster();

  const firstId = component.handleCommand("add", { title: "First" });
  await wait(10);

  const firstCard = cardFor(viewport, firstId);
  setRect(firstCard, { height: 60 });
  component.handleCommand("update", { id: firstId });
  // Solo front card: height is pinned to its own natural size, not left as
  // "" (auto) — a transition *from* auto can't be smoothly interpolated by
  // the browser, so leaving it unset here would make the very next flip
  // (below) snap instead of animate.
  assert.equal(firstCard.style.height, "60px");

  // A second, taller toast arrives and becomes front, demoting the first
  // one to a collapsed background card for the first time.
  const secondId = component.handleCommand("add", { title: "Second" });
  await wait(10);
  setRect(cardFor(viewport, secondId), { height: 100 });
  component.handleCommand("update", { id: secondId });

  // The first card must now be clamped to the new front's height — going
  // straight from one concrete px value (60px) to another (100px), never
  // passing through auto.
  assert.equal(firstCard.style.height, "100px");
  assert.notEqual(firstCard.style.height, "");

  component.destroy();
});

test("toasts beyond visibleToasts are visually collapsed but still present", async () => {
  const { component, viewport } = buildToaster({
    options: { visibleToasts: 2 },
  });

  const ids = [
    component.handleCommand("add", { title: "A" }),
    component.handleCommand("add", { title: "B" }),
    component.handleCommand("add", { title: "C" }),
  ];
  await wait(10);

  // Newest-first: C (front), B, A (overflow).
  assert.equal(cardFor(viewport, ids[0]).style.opacity, "0");
  assert.equal(cardFor(viewport, ids[1]).style.opacity, "");
  assert.equal(cardFor(viewport, ids[2]).style.opacity, "");
  assert.equal(viewport.children.length, 3);

  component.destroy();
});

test("a back card taller than the front one is clamped to the front's height and its content hidden", async () => {
  const { component, viewport } = buildToaster();

  const backId = component.handleCommand("add", { title: "Tall back card" });
  const frontId = component.handleCommand("add", { title: "Short front card" });
  await wait(10);

  setRect(cardFor(viewport, frontId), { height: 60 });
  setRect(cardFor(viewport, backId), { height: 100 }); // 40px taller than front
  // Natural heights are captured once (on add/update), not read live on
  // every recompute — so refresh each record's stored height via a no-op
  // update before recomputing, the same way real content changes do.
  component.handleCommand("update", { id: frontId });
  component.handleCommand("update", { id: backId });

  const backCard = cardFor(viewport, backId);
  // Matches Sonner: a collapsed background card is clamped to the front
  // card's real height (its content is hidden via CSS, see the
  // group-data-[expanded=false] rule) instead of poking out past it, so the
  // peek offset stays the plain index*gap regardless of content height.
  assert.equal(backCard.style.height, "60px");
  assert.equal(
    Number.parseFloat(backCard.style.getPropertyValue("--stack-y")),
    -14,
  );

  component.destroy();
});

test("a back card shorter than the front one keeps the normal small peek", async () => {
  const { component, viewport } = buildToaster();

  const backId = component.handleCommand("add", { title: "Short back card" });
  const frontId = component.handleCommand("add", { title: "Tall front card" });
  await wait(10);

  setRect(cardFor(viewport, frontId), { height: 100 });
  setRect(cardFor(viewport, backId), { height: 60 });
  component.handleCommand("update", { id: frontId });
  component.handleCommand("update", { id: backId });

  const stackY = Number.parseFloat(
    cardFor(viewport, backId).style.getPropertyValue("--stack-y"),
  );
  assert.equal(stackY, -14);

  component.destroy();
});

test("hovering the viewport pauses every timer, leaving resumes them", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Pausable",
    duration: 30,
  });
  await wait(10);

  viewport.dispatchEvent(new window.Event("mouseenter"));
  assert.equal(viewport.dataset.expanded, "true");

  await wait(60);
  assert.ok(
    cardFor(viewport, id),
    "still present while hovered past its original duration",
  );

  viewport.dispatchEvent(new window.Event("mouseleave"));
  assert.equal(viewport.dataset.expanded, "false");

  await wait(600);
  assert.equal(cardFor(viewport, id), null);

  component.destroy();
});

test("expand option keeps the viewport permanently expanded", () => {
  const { component, viewport } = buildToaster({ options: { expand: true } });

  assert.equal(viewport.dataset.expanded, "true");
  viewport.dispatchEvent(new window.Event("mouseleave"));
  assert.equal(viewport.dataset.expanded, "true");

  component.destroy();
});

test("action and cancel buttons push their configured event, then dismiss", async () => {
  const { component, viewport, pushedTo: pushedList } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Undo?",
    action: { label: "Undo", event: "undo_action" },
    cancel: { label: "Dismiss", event: "cancel_action" },
  });
  await wait(10);

  const card = cardFor(viewport, id);
  card
    .querySelector('[data-part="action"]')
    .dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

  assert.equal(pushedList.at(-1).event, "undo_action");
  assert.equal(pushedList.at(-1).payload.id, id);

  await wait(550);
  assert.equal(cardFor(viewport, id), null);

  component.destroy();
});

test("action/cancel value carries arbitrary data into the pushed event payload", async () => {
  const { component, viewport, pushedTo } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Undo?",
    action: { label: "Undo", event: "undo_action", value: { item_id: 5 } },
    cancel: { label: "Dismiss", event: "cancel_action", value: { item_id: 5 } },
  });
  await wait(10);

  const card = cardFor(viewport, id);
  card
    .querySelector('[data-part="action"]')
    .dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

  const pushed = pushedTo.at(-1);
  assert.equal(pushed.event, "undo_action");
  assert.deepEqual(pushed.payload, { id, item_id: 5 });

  // The click also triggers dismissToast(), which arms a pending exit-fallback
  // timeout (EXIT_FALLBACK_MS) — let it fire before destroy() nulls
  // this.options, or it fires later against a destroyed component.
  await wait(550);
  component.destroy();
});

test("action/cancel value is ignored when it isn't a plain object", async () => {
  const { component, viewport, pushedTo } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Undo?",
    action: { label: "Undo", event: "undo_action", value: "not-an-object" },
  });
  await wait(10);

  const card = cardFor(viewport, id);
  card
    .querySelector('[data-part="action"]')
    .dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

  assert.deepEqual(pushedTo.at(-1).payload, { id });

  await wait(550);
  component.destroy();
});

test("the action/cancel row sits beside the content column on the same row, sized to its own content", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "File deleted",
    action: { label: "Undo", event: "undo_action" },
    cancel: { label: "Dismiss" },
  });
  await wait(10);

  const card = cardFor(viewport, id);
  const title = card.querySelector('[data-part="title"]');
  const actionButton = card.querySelector('[data-part="action"]');
  const contentWrapper = title.closest(".space-y-1");
  const actionsRow = actionButton.parentElement;

  // Same row, two columns: the actions row is a top-level sibling of the
  // content column (not nested inside it and not stacked below it).
  assert.ok(Array.from(card.children).includes(actionsRow));
  assert.ok(!contentWrapper.contains(actionButton));
  // The content column still fills the remaining width...
  assert.match(contentWrapper.className, /flex-1/);
  // ...and the actions column must NOT claim the row's full width (that
  // computed a flex-basis equal to the *entire* row, squeezing content
  // down to almost nothing and wrapping "File deleted" into "File" /
  // "deleted") — it should stay pinned to its own natural button width.
  assert.doesNotMatch(actionsRow.className, /\bw-full\b/);
  assert.match(actionsRow.className, /shrink-0/);

  component.destroy();
});

test("card background never varies by variant — no predefined color palette", async () => {
  const { component, viewport } = buildToaster();

  const successId = component.handleCommand("add", {
    title: "Nice",
    variant: "success",
  });
  const errorId = component.handleCommand("add", {
    title: "Oh no",
    variant: "error",
  });
  await wait(10);

  assert.match(cardFor(viewport, successId).className, /bg-background/);
  assert.match(cardFor(viewport, errorId).className, /bg-background/);
  assert.equal(
    cardFor(viewport, successId).className,
    cardFor(viewport, errorId).className,
  );

  component.destroy();
});

test("the card renders in the default text color by default (icon has no color class of its own)", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Nice",
    variant: "success",
  });
  await wait(10);

  const card = cardFor(viewport, id);
  const icon = card.querySelector(".hero-check-circle");
  assert.ok(icon);
  assert.match(card.className, /text-foreground/);
  assert.doesNotMatch(icon.className, /text-/);

  component.destroy();
});

test("the toaster's colors option replaces the whole card's border/background/text by variant, not just the icon", async () => {
  const { component, viewport } = buildToaster({
    options: {
      colors: {
        success: "border-emerald-500/30 bg-emerald-50 text-emerald-900",
        error: "border-rose-500/30 bg-rose-50 text-rose-900",
      },
    },
  });

  const successId = component.handleCommand("add", {
    title: "Nice",
    variant: "success",
  });
  const errorId = component.handleCommand("add", {
    title: "Oh no",
    variant: "error",
  });
  await wait(10);

  const successCard = cardFor(viewport, successId);
  assert.match(successCard.className, /border-emerald-500\/30/);
  assert.match(successCard.className, /bg-emerald-50/);
  assert.match(successCard.className, /text-emerald-900/);
  assert.doesNotMatch(successCard.className, /border-border/);
  assert.doesNotMatch(successCard.className, /bg-background/);
  assert.doesNotMatch(successCard.className, /text-foreground/);
  assert.doesNotMatch(
    successCard.querySelector(".hero-check-circle").className,
    /text-/,
  );

  assert.match(cardFor(viewport, errorId).className, /bg-rose-50/);

  component.destroy();
});

test("a per-toast color param overrides the toaster's colors option", async () => {
  const { component, viewport } = buildToaster({
    options: {
      colors: {
        success: "border-emerald-500/30 bg-emerald-50 text-emerald-900",
      },
    },
  });

  const id = component.handleCommand("add", {
    title: "Nice",
    variant: "success",
    color: "border-lime-500/30 bg-lime-50 text-lime-900",
  });
  await wait(10);

  const card = cardFor(viewport, id);
  assert.match(card.className, /bg-lime-50/);
  assert.doesNotMatch(card.className, /bg-emerald-50/);

  component.destroy();
});

test("every card carries the expanded-stack gap-bridge classes, for both edge directions", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", { title: "Bridged" });
  await wait(10);

  // jsdom doesn't run real CSS/hover, so this only guards that the
  // ::after gap-bridge utilities (which stop hovering the empty space
  // between expanded toasts from reading as "left the viewport" and
  // collapsing the stack mid-hover) are actually on the card — regressions
  // here would silently reintroduce the bug without failing any hover test.
  const className = cardFor(viewport, id).className;
  assert.match(className, /after:content-\['']/);
  assert.match(className, /after:h-\[calc\(var\(--toast-gap,14px\)\+1px\)]/);
  assert.match(className, /data-\[position\^=bottom]:after:bottom-full/);
  assert.match(className, /data-\[position\^=top]:after:top-full/);

  component.destroy();
});

test("unstyled drops built-in classes, keeping only the given class", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Bare",
    unstyled: true,
    class: "my-custom",
  });
  await wait(10);

  assert.equal(cardFor(viewport, id).className, "my-custom");
  component.destroy();
});

test("template content is cloned into the card", async () => {
  const { component, viewport } = buildToaster({
    templates: [{ name: "welcome", html: '<p class="hi">Hello</p>' }],
  });

  const id = component.handleCommand("add", { template: "welcome" });
  await wait(10);

  assert.ok(cardFor(viewport, id).querySelector(".hi"));
  component.destroy();
});

test("per-toast position creates a dedicated viewport", async () => {
  const { component, el } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Elsewhere",
    position: "top-left",
  });
  await wait(10);

  const topLeftViewport = document.querySelector(
    '[data-part="viewport"][data-position="top-left"]',
  );
  assert.ok(topLeftViewport);
  assert.notEqual(topLeftViewport, el.querySelector('[data-part="viewport"]'));
  assert.ok(topLeftViewport.querySelector(`[data-toast-id="${id}"]`));

  component.destroy();
});

test("pause-all / resume-all commands control every timer", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", {
    title: "Manual pause",
    duration: 30,
  });
  await wait(10);

  component.handleCommand("pause-all");
  await wait(60);
  assert.ok(cardFor(viewport, id));

  component.handleCommand("resume-all");
  await wait(600);
  assert.equal(cardFor(viewport, id), null);

  component.destroy();
});

test("client-side salad_ui:command dispatch adds a toast without a hook round trip", async () => {
  const { el, viewport } = buildToaster();

  el.dispatchEvent(
    new window.CustomEvent("salad_ui:command", {
      detail: {
        command: "add",
        params: { id: "client-toast", title: "From JS" },
      },
    }),
  );
  await wait(10);

  assert.ok(cardFor(viewport, "client-toast"));
});

test("swipe past the threshold dismisses the toast", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", { title: "Swipe me" });
  await wait(10);

  // Default toaster position is bottom-right, whose allowed swipe
  // directions are "down" and "right" — see defaultSwipeDirections().
  const card = cardFor(viewport, id);
  card.dispatchEvent(
    new window.MouseEvent("pointerdown", {
      clientX: 0,
      clientY: 0,
      bubbles: true,
    }),
  );
  card.dispatchEvent(
    new window.MouseEvent("pointermove", {
      clientX: 200,
      clientY: 0,
      bubbles: true,
    }),
  );
  card.dispatchEvent(
    new window.MouseEvent("pointerup", {
      clientX: 200,
      clientY: 0,
      bubbles: true,
    }),
  );

  await wait(550);
  assert.equal(cardFor(viewport, id), null);

  component.destroy();
});

test("swipe under the threshold snaps back without dismissing", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", { title: "Stay" });
  await wait(10);

  const card = cardFor(viewport, id);
  card.dispatchEvent(
    new window.MouseEvent("pointerdown", {
      clientX: 0,
      clientY: 0,
      bubbles: true,
    }),
  );
  card.dispatchEvent(
    new window.MouseEvent("pointermove", {
      clientX: 5,
      clientY: 0,
      bubbles: true,
    }),
  );
  // A real slow drag, not a same-tick jump — a 5px move with ~0ms elapsed
  // reads as an enormous synthetic velocity and would (correctly) flick-
  // dismiss under the velocity threshold, same as Sonner's own dismissal
  // rule of distance-OR-velocity.
  await wait(50);
  card.dispatchEvent(
    new window.MouseEvent("pointerup", {
      clientX: 5,
      clientY: 0,
      bubbles: true,
    }),
  );

  await wait(10);
  assert.ok(cardFor(viewport, id));
  assert.notEqual(card.dataset.state, "dismissing");

  component.destroy();
});

test("swipe down also dismisses a bottom-right toast (dual-axis default)", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", { title: "Swipe down" });
  await wait(10);

  const card = cardFor(viewport, id);
  card.dispatchEvent(
    new window.MouseEvent("pointerdown", {
      clientX: 0,
      clientY: 0,
      bubbles: true,
    }),
  );
  card.dispatchEvent(
    new window.MouseEvent("pointermove", {
      clientX: 0,
      clientY: 200,
      bubbles: true,
    }),
  );
  card.dispatchEvent(
    new window.MouseEvent("pointerup", {
      clientX: 0,
      clientY: 200,
      bubbles: true,
    }),
  );

  await wait(550);
  assert.equal(cardFor(viewport, id), null);

  component.destroy();
});

test("swiping in a disallowed direction rubber-bands and never dismisses, even past the raw threshold", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", { title: "Stubborn" });
  await wait(10);

  // bottom-right only allows "down"/"right" — swipe left (disallowed) well
  // past the 45px threshold.
  const card = cardFor(viewport, id);
  card.dispatchEvent(
    new window.MouseEvent("pointerdown", {
      clientX: 0,
      clientY: 0,
      bubbles: true,
    }),
  );
  card.dispatchEvent(
    new window.MouseEvent("pointermove", {
      clientX: -200,
      clientY: 0,
      bubbles: true,
    }),
  );
  await wait(50);
  card.dispatchEvent(
    new window.MouseEvent("pointerup", {
      clientX: -200,
      clientY: 0,
      bubbles: true,
    }),
  );

  await wait(10);
  assert.ok(cardFor(viewport, id));
  assert.notEqual(card.dataset.state, "dismissing");

  component.destroy();
});

test("a fast flick under the distance threshold still dismisses via velocity", async () => {
  const { component, viewport } = buildToaster();

  const id = component.handleCommand("add", { title: "Flick" });
  await wait(10);

  // 20px is under the 45px distance threshold, but dispatched with no
  // artificial delay this reads as a very high px/ms velocity — matching
  // Sonner's distance-OR-velocity dismiss rule.
  const card = cardFor(viewport, id);
  card.dispatchEvent(
    new window.MouseEvent("pointerdown", {
      clientX: 0,
      clientY: 0,
      bubbles: true,
    }),
  );
  card.dispatchEvent(
    new window.MouseEvent("pointermove", {
      clientX: 20,
      clientY: 0,
      bubbles: true,
    }),
  );
  card.dispatchEvent(
    new window.MouseEvent("pointerup", {
      clientX: 20,
      clientY: 0,
      bubbles: true,
    }),
  );

  await wait(550);
  assert.equal(cardFor(viewport, id), null);

  component.destroy();
});

test("expanded stacking uses each card's real height, not a uniform peek", async () => {
  const { component, viewport } = buildToaster();

  const backId = component.handleCommand("add", { title: "Back" });
  const frontId = component.handleCommand("add", { title: "Front" });
  await wait(10);

  setRect(cardFor(viewport, frontId), { height: 60 });
  setRect(cardFor(viewport, backId), { height: 100 });
  component.handleCommand("update", { id: frontId });
  component.handleCommand("update", { id: backId });

  viewport.dispatchEvent(new window.Event("mouseenter"));

  const backStackY = Number.parseFloat(
    cardFor(viewport, backId).style.getPropertyValue("--stack-y"),
  );
  // offset = heightAccum(front's 60px) + index(1) * gap(14) = 74, negated
  // for a bottom-anchored viewport.
  assert.equal(backStackY, -74);
  // Expanded cards get their own natural height applied explicitly (never
  // CSS auto) so a later front/back flip can still animate height smoothly.
  assert.equal(cardFor(viewport, backId).style.height, "100px");

  component.destroy();
});

test("skipReinitialize() is true when data-options/data-event-mappings are unchanged, so an unrelated LiveView patch (e.g. @flash changing) doesn't wipe the live stack", async () => {
  const { component, el, viewport } = buildToaster();

  const id = component.handleCommand("add", { title: "Still here" });
  await wait(10);

  // Same el, same raw attribute strings — mirrors a patch caused by some
  // other assign changing (not this component's own data-options/mappings).
  assert.equal(component.skipReinitialize(el), true);
  assert.equal(cardFor(viewport, id) !== null, true);

  component.destroy();
});

test("skipReinitialize() is false when data-options genuinely changed", () => {
  const { component, el } = buildToaster();

  el.setAttribute("data-options", JSON.stringify({ position: "top-left" }));

  assert.equal(component.skipReinitialize(el), false);

  component.destroy();
});

test("destroy clears every pending timer and removes cards from the DOM", async () => {
  const { component } = buildToaster();

  component.handleCommand("add", { title: "One", duration: 20 });
  component.handleCommand("add", { title: "Two", duration: 20 });

  component.destroy();

  assert.equal(
    document.querySelectorAll('[data-part="toast"]').length,
    0,
    "cards are removed from DOM on destroy",
  );
});

test("client-only toast() targets the mounted <.toaster> and defaults to the default variant", async () => {
  const { component, viewport } = buildToaster();

  const id = toast("Hello there");
  await wait(10);

  const card = cardFor(viewport, id);
  assert.notEqual(card, null);
  assert.equal(card.dataset.variant, "default");
  assert.equal(card.textContent.includes("Hello there"), true);

  component.destroy();
});

test("toast.success/error/warning/info dispatch their respective variant", async () => {
  const { component, viewport } = buildToaster();

  const successId = toast.success("ok");
  const errorId = toast.error("bad");
  const warningId = toast.warning("careful");
  const infoId = toast.info("fyi");
  await wait(10);

  assert.equal(cardFor(viewport, successId).dataset.variant, "success");
  assert.equal(cardFor(viewport, errorId).dataset.variant, "error");
  assert.equal(cardFor(viewport, warningId).dataset.variant, "warning");
  assert.equal(cardFor(viewport, infoId).dataset.variant, "info");

  component.destroy();
});

test("toast.dismiss(id) removes just that toast; toast.dismiss() with no id clears all", async () => {
  const { component, viewport } = buildToaster();

  const keepId = toast("Keep me");
  const goneId = toast("Dismiss me");
  await wait(10);

  toast.dismiss(goneId);
  await wait(550);
  assert.equal(cardFor(viewport, goneId), null);
  assert.notEqual(cardFor(viewport, keepId), null);

  toast.dismiss();
  await wait(550);
  assert.equal(cardFor(viewport, keepId), null);

  component.destroy();
});

test("toast.update(id, opts) patches the existing card in place", async () => {
  const { component, viewport } = buildToaster();

  const id = toast("Uploading...");
  await wait(10);

  toast.update(id, { title: "Done!", variant: "success" });
  await wait(10);

  const card = cardFor(viewport, id);
  assert.equal(card.dataset.variant, "success");
  assert.equal(card.textContent.includes("Done!"), true);

  component.destroy();
});

test("toast() called with no <.toaster> mounted logs an error and returns null", () => {
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args.join(" "));

  try {
    const result = toast("Nobody home");
    assert.equal(result, null);
    assert.equal(
      errors.some((msg) => msg.includes("no <.toaster> is mounted")),
      true,
    );
  } finally {
    console.error = originalError;
  }
});
