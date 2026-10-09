import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BarChart from '../BarChart.vue';
import { barWidth } from '../barWidth';

// A width as the browser stores it in a style (it may rewrite calc() expressions).
const styleWidth = (width: string) => {
  const element = document.createElement('div');
  element.style.width = width;
  return element.style.width;
};

const rows = [
  { name: 'Windows', segments: [{ value: 30, color: 'SteelBlue' }, { value: 10, color: '#89AFCF' }], label: 40 },
  { name: 'Linux', segments: [{ value: 20, color: 'SteelBlue' }, { value: 0, color: '#89AFCF' }], label: 20 },
];

describe('BarChart', () => {
  it('draws one row per item, with one bar part per segment, scaled to the maximum', () => {
    const chart = mount(BarChart, { props: { rows, max: 40 }, slots: { title: 'Platforms' } });
    expect(chart.find('.title').text()).toBe('Platforms');
    const items = chart.findAll('.item-row');
    expect(items.map((item) => item.find('.item-name').text())).toEqual(['Windows', 'Linux']);
    const bars = items[0].findAll('.bar').map((bar) => (bar.element as HTMLElement).style);
    expect(bars.map((style) => style.width)).toEqual([styleWidth(barWidth(30, 40)), styleWidth(barWidth(10, 40))]);
    expect(bars.map((style) => style.backgroundColor)).toEqual(['steelblue', 'rgb(137, 175, 207)']);
  });

  it('puts the label after the bar, in the bar, or at the end of the row', () => {
    const after = mount(BarChart, { props: { rows, max: 40 } });
    expect(after.find('.bar-container > .item-count').text()).toBe('40');
    const inside = mount(BarChart, { props: { rows, max: 40, label: 'inside' } });
    expect(inside.findAll('.bar')[1].find('.item-count.inside').text()).toBe('40'); // in the last part of the bar
    const wide = mount(BarChart, { props: { rows, max: 40, label: 'inside-wide' } });
    expect(wide.findAll('.bar')[1].find('.item-val').text()).toBe('40');
    const end = mount(BarChart, { props: { rows, max: 40, label: 'end' } });
    expect(end.find('.item-row > .item-count').text()).toBe('40');
  });

  it('sets the width of the name column, and lets long names wrap when asked', () => {
    const chart = mount(BarChart, { props: { rows, max: 40, nameWidth: 100, wrapLongNames: true } });
    expect(chart.find('.item-name').attributes('style')).toBe('min-width: 100px;');
    expect(chart.find('.bar-container').classes()).toContain('wrap-names');
  });
});
