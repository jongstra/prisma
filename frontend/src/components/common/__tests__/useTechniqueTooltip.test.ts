import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { useTechniqueTooltip } from '../useTechniqueTooltip';

// The tooltip state of a technique button, in a component that renders nothing.
function button() {
  let tooltip!: ReturnType<typeof useTechniqueTooltip>;
  const wrapper = mount(defineComponent({ setup() { tooltip = useTechniqueTooltip(); return () => null; } }));
  return { tooltip, wrapper };
}

describe('useTechniqueTooltip', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('shows the tooltip while the button is hovered', () => {
    const { tooltip } = button();
    tooltip.show();
    expect(tooltip.open.value).toBe(true);
    tooltip.hide();
    expect(tooltip.open.value).toBe(false);
  });

  it('keeps a pinned tooltip open, and shows no other tooltips meanwhile', async () => {
    const first = button().tooltip, second = button().tooltip;
    first.show();
    first.togglePin();
    first.hide();
    second.show();
    expect([first.open.value, first.pinned.value, second.open.value]).toEqual([true, true, false]);

    first.togglePin(); // a click on the button again
    await Promise.resolve();
    expect(first.open.value).toBe(false);
    second.show();
    expect(second.open.value).toBe(true);
  });

  it('moves the pin to another button that is clicked', async () => {
    const first = button().tooltip, second = button().tooltip;
    first.togglePin();
    second.togglePin();
    first.unpin(); // the first tooltip saw a click elsewhere: it is not pinned anymore, so this changes nothing
    await Promise.resolve();
    expect([first.open.value, second.pinned.value]).toEqual([false, true]);
  });

  it('unpins the tooltip when its button disappears, so other tooltips can be shown again', () => {
    const first = button(), second = button().tooltip;
    first.tooltip.togglePin();
    first.wrapper.unmount();
    second.show();
    expect(second.open.value).toBe(true);
  });
});
