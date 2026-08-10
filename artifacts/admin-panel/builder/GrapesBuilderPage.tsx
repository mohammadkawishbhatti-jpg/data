import { useEffect, useRef, useState, useCallback } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import grapesjsBlocksBasic from 'grapesjs-blocks-basic';
import grapesjsForms from 'grapesjs-plugin-forms';
import { useParams, useLocation } from 'wouter';
import 'grapesjs/dist/css/grapes.min.css';
import { registerCustomBlocks, CUSTOM_BLOCK_ICONS, CUSTOM_BLOCK_LABELS } from './customBlocks';

/* ══════════════════════════════════════════
   BLOCK ICON MAP  (keyed by GrapesJS block id)
   ══════════════════════════════════════════ */
const BLOCK_ICONS: Record<string, string> = {
  'column1':   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg>`,
  'column2':   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="3" y="4" width="14" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="22" y="4" width="15" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg>`,
  'column3':   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="2" y="4" width="10" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="15" y="4" width="10" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="28" y="4" width="10" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg>`,
  'column3-7': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="2" y="4" width="12" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="17" y="4" width="21" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg>`,
  'text':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M8 12h24M8 20h20M8 28h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>`,
  'text-basic':`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M8 10h24M8 18h24M8 26h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>`,
  'text-section':`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M10 14h20M10 20h16M10 26h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>`,
  'link':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M17 22a7 7 0 0 0 9.9.7l4-4a7 7 0 0 0-9.9-9.9l-2.3 2.3" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M23 18a7 7 0 0 0-9.9-.7l-4 4a7 7 0 0 0 9.9 9.9l2.3-2.3" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>`,
  'link-block':`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="20" y1="12" x2="20" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="12" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>`,
  'image':     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><circle cx="14" cy="14" r="3" fill="currentColor" opacity=".6"/><path d="M4 28l9-9 6 6 4-4 9 9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/></svg>`,
  'video':     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="3" y="8" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M27 16l10-6v20l-10-6V16z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/></svg>`,
  'map':       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20 6c-5.5 0-10 4.5-10 10 0 7.5 10 18 10 18s10-10.5 10-18c0-5.5-4.5-10-10-10z" fill="none" stroke="currentColor" strokeWidth="2.5"/><circle cx="20" cy="16" r="3.5" fill="none" stroke="currentColor" strokeWidth="2"/></svg>`,
  'quote':     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M6 28c4 0 8-1.5 8-9V9H8v10c0 1.5 0 1.5 1 1.5h1c0 3-.5 5.5-4 5.5V28zM22 28c4 0 8-1.5 8-9V9H24v10c0 1.5 0 1.5 1 1.5h1c0 3-.5 5.5-4 5.5V28z" fill="currentColor" opacity=".8"/></svg>`,
  // Forms
  'form':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="6" width="32" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="4" y="17" width="32" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="4" y="28" width="14" height="7" rx="2" fill="currentColor" opacity=".4"/></svg>`,
  'input':     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="12" width="32" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><line x1="11" y1="20" x2="11" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>`,
  'textarea':  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="6" width="32" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M10 15h20M10 22h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>`,
  'select':    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="12" width="32" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><polyline points="27,17 31,21 35,17" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
  'button':    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="12" width="32" height="16" rx="8" fill="none" stroke="currentColor" strokeWidth="2.5"/><line x1="15" y1="20" x2="25" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>`,
  'label':     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M5 20L18 8h17v24H18L5 20z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><circle cx="24" cy="20" r="2.5" fill="currentColor"/></svg>`,
  'checkbox':  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="6" y="6" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><polyline points="10,15 14,19 22,9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="30" y1="12" x2="38" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="30" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>`,
  'radio':     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/><circle cx="14" cy="14" r="4" fill="currentColor" opacity=".7"/><line x1="26" y1="14" x2="36" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="26" y1="26" x2="36" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><circle cx="14" cy="26" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg>`,
};

/* Short labels for blocks — Elementor style */
const BLOCK_LABELS: Record<string, string> = {
  'column1':    '1 Column',
  'column2':    '2 Columns',
  'column3':    '3 Columns',
  'column3-7':  '2 Col 3:7',
  'text':       'Text',
  'text-basic': 'Text Box',
  'text-section': 'Section',
  'link':       'Link',
  'link-block': 'Link Box',
  'image':      'Image',
  'video':      'Video',
  'map':        'Map',
  'quote':      'Quote',
  'form':       'Form',
  'input':      'Input',
  'textarea':   'Textarea',
  'select':     'Select',
  'button':     'Button',
  'label':      'Label',
  'checkbox':   'Checkbox',
  'radio':      'Radio',
};

/* Merged icon/label maps including custom blocks */
const ALL_ICONS  = { ...BLOCK_ICONS,  ...CUSTOM_BLOCK_ICONS };
const ALL_LABELS = { ...BLOCK_LABELS, ...CUSTOM_BLOCK_LABELS };

/* GrapesJS plugin — runs LAST: registers custom blocks then overrides all icons/labels */
const iconPlugin = (editor: Editor) => {
  // 1. Add all 40+ custom blocks
  registerCustomBlocks(editor);
  // 2. Override icons + labels on every registered block (built-in + custom)
  editor.BlockManager.getAll().forEach((block: any) => {
    const id = block.get('id') as string;
    const update: Record<string, string> = {};
    if (ALL_ICONS[id])  update.media = ALL_ICONS[id];
    if (ALL_LABELS[id]) update.label = ALL_LABELS[id];
    if (Object.keys(update).length) block.set(update);
  });
};

/* ══════════════════════════════════════════
   Convert block array -> rich HTML sections
   ══════════════════════════════════════════ */
function convertBlocksToHtml(blocks: any[]): string {
  if (!Array.isArray(blocks)) return '';
  return blocks.map((b: any) => {
    const type = b.type || b.blockType || b.id;
    const d = b.data || {};
    
    if (type === 'dynamic_hero' || type === 'hero' || type === 'banner') {
      const bg = d.bgColor || '#1a2f5a';
      const title = d.heading || '{{category.name}}';
      const text = d.text || d.subheading || d.useDescription ? '{{category.description}}' : 'Custom manufactured packaging boxes tailored to your brand specifications.';
      const btnText = d.buttonText || 'Get Free Quote';
      const btnLink = d.buttonLink || '/get-quote';
      return `
        <section style="background: ${bg}; color: #ffffff; padding: 72px 24px; text-align: center; position: relative; overflow: hidden;">
          <div style="max-width: 960px; margin: 0 auto; position: relative; z-index: 2;">
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(255,184,0,0.15); color: #FFB800; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px;">
              PREMIUM PACKAGING SOLUTION
            </span>
            <h1 style="font-size: 42px; font-weight: 900; margin: 0 0 16px; line-height: 1.15; font-family: Outfit, sans-serif;">
              ${title}
            </h1>
            <p style="font-size: 16px; color: rgba(255,255,255,0.85); max-width: 680px; margin: 0 auto 32px; line-height: 1.6;">
              ${text}
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <a href="${btnLink}" style="display: inline-block; background: #E63329; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; box-shadow: 0 8px 20px rgba(230,51,41,0.3);">
                ${btnText} →
              </a>
              <a href="tel:8187584076" style="display: inline-block; background: rgba(255,255,255,0.1); color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);">
                📞 Call 818-758-4076
              </a>
            </div>
          </div>
        </section>
      `;
    }
    
    if (type === 'trust_bar' || type === 'trust_badges') {
      const items = d.items || ["🎨 Free Custom Design", "🚚 Free US Shipping", "⚡ 6-8 Day Turnaround", "✅ 100% Satisfaction Guaranteed", "📦 Low 100-Unit MOQ"];
      const itemHtml = items.map((it: string) => `
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #0D1F3C; white-space: nowrap;">
          <span>${it}</span>
        </div>
      `).join('');
      return `
        <section style="background: #F1F5F9; border-bottom: 1px solid #E2E8F0; padding: 16px 24px; overflow-x: auto;">
          <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-around; gap: 24px;">
            ${itemHtml}
          </div>
        </section>
      `;
    }

    if (type === 'products_grid' || type === 'shop') {
      const heading = d.heading || 'Custom Box Styles & Catalog';
      return `
        <section style="padding: 64px 24px; background: #FFFFFF;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 48px;">
              <h2 style="font-size: 32px; font-weight: 900; color: #0D1F3C; margin: 0 0 8px;">${heading}</h2>
              <p style="font-size: 14px; color: #64748B;">Explore our custom manufactured packaging options with wholesale pricing.</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px;">
              ${[1,2,3,4,5,6].map(i => `
                <div style="border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; background: #FFF; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                  <div style="height: 180px; background: #F8FAFC; display: flex; align-items: center; justify-content: center; font-size: 48px;">📦</div>
                  <div style="padding: 18px;">
                    <h3 style="font-size: 16px; font-weight: 800; color: #0D1F3C; margin: 0 0 6px;">Custom Packaging Style ${i}</h3>
                    <p style="font-size: 12px; color: #64748B; margin: 0 0 14px;">High quality custom printed boxes with custom die-cut dimensions.</p>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="font-size: 12px; font-weight: 700; color: #E63329;">Min. 100 Units</span>
                      <a href="/get-quote" style="display: inline-block; padding: 6px 14px; background: #0D1F3C; color: #FFF; border-radius: 8px; font-weight: 700; font-size: 11px; text-decoration: none;">Get Quote</a>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    }

    if (type === 'cta' || type === 'call_to_action') {
      const heading = d.heading || 'Need a Custom Size or Dieline?';
      const text = d.text || 'Tell us what you need and our packaging engineers will create it for you.';
      const btnText = d.buttonText || 'Get a Free Quote';
      const btnLink = d.buttonLink || '/get-quote';
      const bg = d.bgColor || '#1a2f5a';
      return `
        <section style="background: ${bg}; color: #FFF; padding: 64px 24px; text-align: center;">
          <div style="max-width: 800px; margin: 0 auto;">
            <h2 style="font-size: 32px; font-weight: 900; margin: 0 0 12px;">${heading}</h2>
            <p style="font-size: 15px; color: rgba(255,255,255,0.85); margin: 0 0 28px;">${text}</p>
            <a href="${btnLink}" style="display: inline-block; background: #E63329; color: #FFF; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
              ${btnText} →
            </a>
          </div>
        </section>
      `;
    }

    if (type === 'features' || type === 'why_us') {
      const heading = d.heading || 'Why Choose Prime Packaging Boxes';
      const items = d.items || [
        { icon: "🎨", title: "Free Design Support", text: "Expert designers work with you at no extra cost." },
        { icon: "📦", title: "Low 100 MOQ", text: "Start small without inventory overhead." },
        { icon: "⚡", title: "6-8 Day Turnaround", text: "Fast production directly to your warehouse." },
        { icon: "🚚", title: "Free US Shipping", text: "Complimentary shipping across all US states." }
      ];
      return `
        <section style="padding: 64px 24px; background: #F8FAFC;">
          <div style="max-width: 1100px; margin: 0 auto;">
            <h2 style="font-size: 28px; font-weight: 900; text-align: center; color: #0D1F3C; margin: 0 0 40px;">${heading}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
              ${items.map((it: any) => `
                <div style="background: #FFF; border: 1px solid #E2E8F0; padding: 24px; border-radius: 16px; text-align: center;">
                  <div style="font-size: 32px; margin-bottom: 12px;">${it.icon || '✨'}</div>
                  <h4 style="font-size: 16px; font-weight: 800; color: #0D1F3C; margin: 0 0 8px;">${it.title || ''}</h4>
                  <p style="font-size: 12px; color: #64748B; margin: 0; line-height: 1.5;">${it.text || ''}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    }

    return '';
  }).filter(Boolean).join('\n');
}

/* ══════════════════════════════════════════
   parseContent helper
   ══════════════════════════════════════════ */
function parseContent(raw: string | null | undefined): { html: string; css: string } {
  if (!raw) return { html: '', css: '' };
  try {
    const d = JSON.parse(raw);
    if (d?.gjs) return { html: d.gjs.html || '', css: d.gjs.css || '' };
    if (Array.isArray(d)) {
      return { html: convertBlocksToHtml(d), css: '' };
    }
    if (d && typeof d === 'object') {
      if (Array.isArray(d.blocks)) return { html: convertBlocksToHtml(d.blocks), css: '' };
      if (Array.isArray(d.content)) return { html: convertBlocksToHtml(d.content), css: '' };
      if (d.html) return { html: d.html, css: d.css || '' };
    }
  } catch {
    if (typeof raw === 'string' && raw.trim().startsWith('<')) {
      return { html: raw, css: '' };
    }
  }
  return { html: typeof raw === 'string' ? raw : '', css: '' };
}

/* ══════════════════════════════════════════
   ICONS (top bar)
   ══════════════════════════════════════════ */
const Ico = {
  back:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>,
  undo:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>,
  redo:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>,
  eye:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  desktop: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  tablet:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  mobile:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  search:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

/* ══════════════════════════════════════════
   TOP BAR
   ══════════════════════════════════════════ */
/* slug → live site path */
function slugToPath(slug: string): string {
  const map: Record<string, string> = {
    'about-us': '/about', 'contact-us': '/contact', 'faq': '/faq',
    'privacy-policy': '/privacy-policy', 'terms-and-conditions': '/terms-and-conditions',
    'delivery-policy': '/delivery-policy', 'refund-return-policy': '/refund-return-policy',
    'disclaimer': '/disclaimer', 'request-sample': '/request-sample',
    'returns-claims-support': '/returns-claims-support',
  };
  return map[slug] ?? `/pages/${slug}`;
}

function TopBar({ title, slug, saving, lastSaved, saveError, viewport, onSave, onPublish, onUndo, onRedo, onViewport, onBack, onPreview }: {
  title: string; slug: string; saving: boolean; lastSaved: string; saveError: string; viewport: string;
  onSave(): void; onPublish(): void; onUndo(): void; onRedo(): void;
  onViewport(v: string): void; onBack(): void; onPreview(): void;
}) {
  const siteUrl = slug ? window.location.origin + slugToPath(slug) : null;
  return (
    <header style={{
      height: 50, flexShrink: 0,
      background: '#16171e',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: 0, padding: '0 12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      zIndex: 200, boxShadow: '0 1px 0 rgba(0,0,0,0.4)',
    }}>
      {/* Back + title group */}
      <button onClick={onBack} title="Back" style={topBtn()}>
        {Ico.back}
      </button>
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 10px' }} />
      <span style={{ color: '#a8b2c1', fontSize: 13, fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title || 'Untitled'}
      </span>

      <div style={{ flex: 1 }} />

      {/* Viewport switcher */}
      <div style={{ display: 'flex', background: '#111116', borderRadius: 8, padding: 3, gap: 2 }}>
        {(['desktop', 'tablet', 'mobile'] as const).map(v => (
          <button key={v} onClick={() => onViewport(v)} title={v} style={{
            width: 32, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer',
            background: viewport === v ? '#4f46e5' : 'transparent',
            color: viewport === v ? '#fff' : '#4b5563',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .15s',
          }}>
            {v === 'desktop' ? Ico.desktop : v === 'tablet' ? Ico.tablet : Ico.mobile}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 10px' }} />

      {/* Undo Redo */}
      <button onClick={onUndo} title="Undo (Ctrl+Z)" style={topBtn()}>{Ico.undo}</button>
      <button onClick={onRedo} title="Redo" style={topBtn()}>{Ico.redo}</button>

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 10px' }} />

      {/* Preview */}
      <button onClick={onPreview} title="Preview in builder" style={{ ...topBtn(), gap: 5, padding: '0 10px' }}>
        {Ico.eye}
        <span style={{ fontSize: 12, fontWeight: 500 }}>Preview</span>
      </button>

      {/* View on Site */}
      {siteUrl && (
        <a
          href={siteUrl} target="_blank" rel="noopener noreferrer"
          title="Open live page in new tab"
          style={{
            height: 32, padding: '0 12px', borderRadius: 6, border: '1px solid rgba(99,163,99,0.35)',
            cursor: 'pointer', background: 'rgba(16,185,129,0.08)', color: '#34d399',
            fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
            textDecoration: 'none', marginLeft: 4, transition: 'all .15s', flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(16,185,129,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(16,185,129,0.08)'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          View Site
        </a>
      )}

      {/* Status */}
      {saveError
        ? <span style={{ fontSize: 11, color: '#f87171', marginLeft: 10 }}>{saveError}</span>
        : lastSaved
        ? <span style={{ fontSize: 11, color: '#374151', marginLeft: 10 }}>✓ {lastSaved}</span>
        : null}

      <div style={{ width: 10 }} />

      {/* Save */}
      <button onClick={onSave} disabled={saving} style={{
        height: 32, padding: '0 18px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.1)', cursor: saving ? 'default' : 'pointer',
        background: '#1e2030', color: '#a8b2c1', fontSize: 12, fontWeight: 600,
        opacity: saving ? 0.5 : 1, transition: 'all .15s',
        letterSpacing: '.02em',
      }}>
        {saving ? 'Saving…' : 'Save'}
      </button>

      {/* Publish */}
      <button onClick={onPublish} disabled={saving} style={{
        height: 32, padding: '0 20px', borderRadius: 6, border: 'none',
        cursor: saving ? 'default' : 'pointer',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: '#fff', fontSize: 12, fontWeight: 700, opacity: saving ? 0.5 : 1,
        marginLeft: 6, boxShadow: '0 2px 8px rgba(79,70,229,0.5)',
        letterSpacing: '.02em',
      }}>
        Publish ↗
      </button>
    </header>
  );
}

function topBtn(): React.CSSProperties {
  return {
    width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer',
    background: 'transparent', color: '#6b7280',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .15s', flexShrink: 0,
  };
}

/* ══════════════════════════════════════════
   LEFT PANEL
   ══════════════════════════════════════════ */
function LeftPanel() {
  const [tab, setTab] = useState<'blocks' | 'layers'>('blocks');
  const [search, setSearch] = useState('');

  const handleSearch = (val: string) => {
    setSearch(val);
    const q = val.toLowerCase();
    document.querySelectorAll('#gjs-blocks .gjs-block').forEach((el: any) => {
      const lbl = el.querySelector('.gjs-block-label')?.textContent?.toLowerCase() || '';
      el.style.display = !q || lbl.includes(q) ? '' : 'none';
    });
    document.querySelectorAll('#gjs-blocks .gjs-block-category').forEach((cat: any) => {
      const anyVisible = [...cat.querySelectorAll('.gjs-block')].some((b: any) => b.style.display !== 'none');
      cat.style.display = !q || anyVisible ? '' : 'none';
    });
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#13131a', userSelect: 'none' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', padding: '8px 8px 0', gap: 4, flexShrink: 0, background: '#13131a' }}>
        {(['blocks', 'layers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, height: 34, border: 'none', cursor: 'pointer',
            background: tab === t ? '#1e2038' : 'transparent',
            color: tab === t ? '#a5b4fc' : '#4b5563',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            borderRadius: 7,
            borderBottom: `2px solid ${tab === t ? '#6366f1' : 'transparent'}`,
            transition: 'all .15s',
          }}>
            {t === 'blocks' ? '⊞  Widgets' : '⧉  Layers'}
          </button>
        ))}
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 0 0', flexShrink: 0 }} />

      {/* Search */}
      {tab === 'blocks' && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#374151', pointerEvents: 'none', display: 'flex' }}>
              {Ico.search}
            </span>
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search widgets…"
              style={{
                width: '100%', padding: '7px 8px 7px 28px', fontSize: 12,
                background: '#111116', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 7, color: '#c9cdd3', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            />
          </div>
        </div>
      )}

      <div id="gjs-blocks" style={{ flex: 1, overflowY: 'auto', display: tab === 'blocks' ? 'block' : 'none', overflowX: 'hidden' }} />
      <div id="gjs-layers" style={{ flex: 1, overflowY: 'auto', display: tab === 'layers' ? 'block' : 'none' }} />
    </aside>
  );
}

/* ══════════════════════════════════════════
   RIGHT PANEL
   ══════════════════════════════════════════ */
function RightPanel() {
  const [tab, setTab] = useState<'style' | 'settings'>('style');
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1a1a1f' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, background: '#13131a' }}>
        {(['style', 'settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, height: 42, border: 'none', cursor: 'pointer', background: 'transparent',
            color: tab === t ? '#818cf8' : '#374151',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderBottom: `2px solid ${tab === t ? '#4f46e5' : 'transparent'}`,
            transition: 'all .2s',
          }}>
            {t === 'style' ? 'Style' : 'Settings'}
          </button>
        ))}
      </div>
      <div id="gjs-selectors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: tab === 'style' ? 'block' : 'none' }} />
      <div id="gjs-styles" style={{ flex: 1, overflowY: 'auto', display: tab === 'style' ? 'block' : 'none' }} />
      <div id="gjs-traits" style={{ flex: 1, overflowY: 'auto', display: tab === 'settings' ? 'block' : 'none' }} />
    </aside>
  );
}

/* ══════════════════════════════════════════
   EMPTY CANVAS OVERLAY
   ══════════════════════════════════════════ */
function EmptyOverlay({ onAdd }: { onAdd(): void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, pointerEvents: 'none',
      background: 'rgba(245,246,250,0.6)',
    }}>
      <div style={{
        textAlign: 'center', padding: '48px 56px', borderRadius: 20,
        background: '#ffffff',
        border: '1.5px dashed #c7d2fe',
        boxShadow: '0 4px 32px rgba(79,70,229,0.08)',
        pointerEvents: 'all', maxWidth: 360,
      }}>
        {/* Dashed-border icon circle */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
          background: '#f0f0ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px dashed #a5b4fc',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>

        <p style={{ color: '#1e1b4b', fontSize: 17, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-.02em', fontFamily: 'Inter, sans-serif' }}>
          Start Building
        </p>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 28px', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
          Drag a widget from the left panel<br />onto the canvas to begin.
        </p>

        {/* Shortcut hints */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {[
            { icon: '⬅', label: 'Drag widgets' },
            { icon: '✏️', label: 'Click to edit' },
            { icon: '📱', label: 'Responsive' },
          ].map(h => (
            <div key={h.label} style={{
              background: '#f8f9ff', border: '1px solid #e0e7ff', borderRadius: 8,
              padding: '6px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{h.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'Inter,sans-serif' }}>{h.label}</div>
            </div>
          ))}
        </div>

        <button onClick={onAdd} style={{
          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
          border: 'none', borderRadius: 10, padding: '12px 28px',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(79,70,229,0.3)', letterSpacing: '.02em',
          fontFamily: 'Inter, sans-serif', width: '100%',
        }}>
          + Add First Section
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE BUILDER
   ══════════════════════════════════════════ */
export default function GrapesBuilderPage() {
  const { id: pageId } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const pendingContent = useRef<{ html: string; css: string } | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const [saveError, setSaveError] = useState('');
  const [viewport, setViewport] = useState('desktop');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);

  /* ── Init GrapesJS ── */
  useEffect(() => {
    if (!containerRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100%', width: 'auto',
      storageManager: false,
      undoManager: { trackSelection: false },
      avoidInlineStyle: false,

      // iconPlugin is LAST so it runs after all blocks are registered
      plugins: [grapesjsPresetWebpage, grapesjsBlocksBasic, grapesjsForms, iconPlugin],
      pluginsOpts: {
        [grapesjsPresetWebpage as any]: { modalImportTitle: 'Import HTML', modalImportLabel: '', modalImportContent: '' },
        [grapesjsBlocksBasic as any]: {
          blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map', 'link-block', 'quote', 'text-basic'],
          flexGrid: true,
        },
        [grapesjsForms as any]: {},
        [iconPlugin as any]: {},
      },

      protectedCss: `
        *, *::before, *::after { box-sizing: border-box !important; }
        body { font-family: Inter, system-ui, sans-serif !important; margin: 0 !important; padding: 0 !important; }
        input:not([type=checkbox]):not([type=radio]), textarea, select {
          font-family: Inter, system-ui, sans-serif !important;
          font-size: 14px !important;
          padding: 10px 14px !important;
          border: 1.5px solid #d1d5db !important;
          border-radius: 8px !important;
          width: 100% !important;
          outline: none !important;
          background: #ffffff !important;
          color: #111827 !important;
          display: block !important;
          margin-bottom: 4px !important;
          box-shadow: none !important;
          transition: border-color .15s, box-shadow .15s !important;
        }
        input:not([type=checkbox]):not([type=radio]):focus, textarea:focus, select:focus {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,.12) !important;
        }
        input[type=checkbox], input[type=radio] {
          width: 16px !important; height: 16px !important;
          padding: 0 !important; margin: 0 4px 0 0 !important;
          display: inline-block !important; vertical-align: middle !important;
        }
        button, input[type=submit] {
          cursor: pointer !important;
          font-family: Inter, system-ui, sans-serif !important;
          font-size: 14px !important; font-weight: 700 !important;
          padding: 12px 32px !important; border-radius: 8px !important;
          border: none !important; background: #e63329 !important;
          color: #fff !important; letter-spacing: .01em !important;
        }
        button:hover, input[type=submit]:hover { opacity: .88 !important; }
        label {
          font-size: 12px !important; font-weight: 600 !important;
          color: #374151 !important; display: block !important;
          margin-bottom: 5px !important; margin-top: 10px !important;
        }
        a { color: #4f46e5 !important; }
      `,
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        ],
      },

      panels: { defaults: [] },
      layerManager: { appendTo: '#gjs-layers' },
      blockManager: { appendTo: '#gjs-blocks' },
      styleManager: {
        appendTo: '#gjs-styles',
        sectors: [
          { name: 'Dimension', open: true,  buildProps: ['width', 'min-height', 'padding', 'margin'] },
          { name: 'Typography', open: false, buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration'] },
          { name: 'Background', open: false, buildProps: ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat'] },
          { name: 'Border',     open: false, buildProps: ['border', 'border-radius', 'box-shadow'] },
          { name: 'Layout',     open: false, buildProps: ['display', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap'] },
          { name: 'Extra',      open: false, buildProps: ['opacity', 'cursor', 'overflow', 'transition', 'transform'] },
        ],
      },
      traitManager:    { appendTo: '#gjs-traits' },
      selectorManager: { appendTo: '#gjs-selectors' },
      deviceManager: {
        devices: [
          { id: 'desktop', name: 'Desktop', width: '' },
          { id: 'tablet',  name: 'Tablet',  width: '768px',  widthMedia: '992px' },
          { id: 'mobile',  name: 'Mobile',  width: '375px',  widthMedia: '480px' },
        ],
      },
    });

    editorRef.current = editor;

    /* ── Force block labels to wrap (GrapesJS injects inline nowrap styles) ── */
    const fixLabels = () => {
      document.querySelectorAll('#gjs-blocks .gjs-block-label').forEach((el: any) => {
        el.style.setProperty('white-space', 'normal', 'important');
        el.style.setProperty('overflow', 'hidden', 'important');
        el.style.removeProperty('text-overflow');
        el.style.setProperty('text-overflow', 'clip', 'important');
        el.style.setProperty('display', '-webkit-box', 'important');
        el.style.setProperty('-webkit-line-clamp', '2', 'important');
        el.style.setProperty('-webkit-box-orient', 'vertical', 'important');
      });
    };
    const labelObs = new MutationObserver(fixLabels);
    const blocksContainer = document.getElementById('gjs-blocks');
    if (blocksContainer) labelObs.observe(blocksContainer, { childList: true, subtree: true });
    editor.on('load', fixLabels);

    /* ── Inject canvas base CSS directly into iframe (data: URLs blocked) ── */
    const injectCanvasCss = () => {
      try {
        const doc = (editor as any).Canvas.getDocument?.() ?? (editor as any).Canvas.getFrameEl?.()?.contentDocument;
        if (!doc) return;
        if (doc.getElementById('ppb-canvas-base')) return;
        const s = doc.createElement('style');
        s.id = 'ppb-canvas-base';
        s.textContent = `
          *, *::before, *::after { box-sizing: border-box !important; }
          body { font-family: Inter, system-ui, sans-serif !important; margin: 0 !important; padding: 0 !important; }
          input:not([type=checkbox]):not([type=radio]),
          textarea, select {
            font-family: Inter, system-ui, sans-serif !important;
            font-size: 14px !important;
            padding: 10px 14px !important;
            border: 1.5px solid #d1d5db !important;
            border-radius: 8px !important;
            width: 100% !important;
            outline: none !important;
            background: #ffffff !important;
            color: #111827 !important;
            transition: border-color .15s, box-shadow .15s !important;
            display: block !important;
            margin-bottom: 4px !important;
            box-shadow: none !important;
          }
          input:not([type=checkbox]):not([type=radio]):focus,
          textarea:focus, select:focus {
            border-color: #4f46e5 !important;
            box-shadow: 0 0 0 3px rgba(79,70,229,.12) !important;
          }
          input[type=checkbox], input[type=radio] {
            width: 16px !important; height: 16px !important;
            padding: 0 !important; margin: 0 4px 0 0 !important;
            display: inline-block !important; vertical-align: middle !important;
          }
          button, input[type=submit] {
            cursor: pointer !important;
            font-family: Inter, system-ui, sans-serif !important;
            font-size: 14px !important; font-weight: 700 !important;
            padding: 12px 32px !important; border-radius: 8px !important;
            border: none !important; background: #e63329 !important;
            color: #fff !important; transition: opacity .15s !important;
            letter-spacing: .01em !important;
          }
          button:hover, input[type=submit]:hover { opacity: .88 !important; }
          label {
            font-size: 12px !important; font-weight: 600 !important;
            color: #374151 !important; display: block !important;
            margin-bottom: 5px !important; margin-top: 10px !important;
          }
          form { padding: 0 !important; margin: 0 !important; }
          a { color: #4f46e5 !important; }
        `;
        doc.head.appendChild(s);
      } catch (_) { /* cross-origin safety */ }
    };
    editor.on('load', injectCanvasCss);
    editor.on('canvas:frame:load', injectCanvasCss);

    /* ── For DESKTOP only: force frame-wrapper to 100% width ── */
    let _fwBusy = false;
    const forceDesktopWidth = () => {
      try {
        const dev = (editor as any).getDevice?.()?.toLowerCase() ?? '';
        if (dev && dev !== 'desktop') return; // tablet/mobile: let GrapesJS control width
      } catch (_) {}
      if (_fwBusy) return;
      _fwBusy = true;
      requestAnimationFrame(() => {
        try {
          const frameEl = (editor as any).Canvas?.getFrameEl?.();
          if (frameEl?.parentElement) {
            frameEl.parentElement.style.width = '100%';
            frameEl.parentElement.style.left = '0';
          }
          if (frameEl) {
            frameEl.style.width = '100%';
          }
        } catch (_) {}
        setTimeout(() => { _fwBusy = false; }, 80);
      });
    };
    editor.on('load', () => { [0, 100, 300, 600, 1200].forEach(t => setTimeout(forceDesktopWidth, t)); });
    editor.on('change:device', () => { [0, 150].forEach(t => setTimeout(forceDesktopWidth, t)); });
    editor.on('load', () => setTimeout(() => {
      const frameEl = (editor as any).Canvas?.getFrameEl?.();
      if (frameEl?.parentElement) {
        const obs = new MutationObserver(() => { if (!_fwBusy) forceDesktopWidth(); });
        obs.observe(frameEl.parentElement, { attributes: true, attributeFilter: ['style'] });
      }
    }, 900));

    if (pendingContent.current) {
      editor.setComponents(pendingContent.current.html);
      if (pendingContent.current.css) editor.setStyle(pendingContent.current.css);
      pendingContent.current = null;
    }

    const checkEmpty = () => setIsEmpty(editor.getComponents().length === 0);
    editor.on('component:add component:remove load', checkEmpty);
    checkEmpty();

    editor.Keymaps.add('ns:save',    'ctrl+s',       () => triggerSave(false));
    editor.Keymaps.add('ns:publish', 'ctrl+shift+s', () => triggerSave(true));

    return () => { editor.destroy(); editorRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Load page data ── */
  useEffect(() => {
    fetch(`/api/admin/pages/${pageId}`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(page => {
        setTitle(page.title ?? 'Untitled');
        setSlug(page.slug ?? '');
        const parsed = parseContent(page.content);
        if (editorRef.current) {
          editorRef.current.setComponents(parsed.html);
          if (parsed.css) editorRef.current.setStyle(parsed.css);
        } else {
          pendingContent.current = parsed;
        }
        setLoading(false);
      })
      .catch(e => { setLoadError(e.message); setLoading(false); });
  }, [pageId]);

  /* ── Save ── */
  const triggerSave = useCallback(async (publish = false) => {
    const ed = editorRef.current;
    if (!ed) return;
    setSaving(true); setSaveError('');
    try {
      const content = JSON.stringify({ gjs: { html: ed.getHtml(), css: ed.getCss() } });
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, ...(publish ? { isPublished: true } : {}) }),
      });
      if (!res.ok) { setSaveError(res.status === 401 ? 'Not logged in' : `Save failed (${res.status})`); return; }
      setLastSaved(new Date().toLocaleTimeString());
    } catch (e) { setSaveError(`Error: ${(e as Error).message}`); }
    finally { setSaving(false); }
  }, [pageId]);

  const setViewportDevice = useCallback((v: string) => {
    setViewport(v);
    editorRef.current?.setDevice(v === 'desktop' ? 'Desktop' : v === 'tablet' ? 'Tablet' : 'Mobile');
  }, []);

  if (loadError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#111116', gap: 16, fontFamily: 'system-ui' }}>
      <span style={{ fontSize: 36 }}>⚠️</span>
      <span style={{ color: '#f87171', fontSize: 14 }}>{loadError}</span>
      <button onClick={() => nav('/pages')} style={{ color: '#818cf8', background: 'none', border: '1px solid #4f46e5', borderRadius: 8, cursor: 'pointer', fontSize: 13, padding: '8px 16px' }}>← Back to Pages</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#111116', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{GJS_CSS}</style>

      <TopBar
        title={title} slug={slug} saving={saving} lastSaved={lastSaved} saveError={saveError} viewport={viewport}
        onSave={() => triggerSave(false)} onPublish={() => triggerSave(true)}
        onUndo={() => editorRef.current?.UndoManager.undo()}
        onRedo={() => editorRef.current?.UndoManager.redo()}
        onViewport={setViewportDevice} onBack={() => nav('/pages')}
        onPreview={() => editorRef.current?.runCommand('preview')}
      />

      {loading && (
        <div style={{ position: 'absolute', inset: 0, background: '#111116', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #1e1f2b', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'gjs-spin .8s linear infinite' }} />
          <span style={{ color: '#374151', fontSize: 13 }}>Loading page…</span>
          <style>{`@keyframes gjs-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 270, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <LeftPanel />
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#f0f2f7' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
          {!loading && isEmpty && (
            <EmptyOverlay onAdd={() => {
              editorRef.current?.addComponents(`<section style="min-height:280px;padding:80px 40px;display:flex;align-items:center;justify-content:center;background:#fff"><div style="text-align:center"><h2 style="font-size:32px;font-weight:800;color:#111827;margin:0 0 16px;font-family:Inter,sans-serif">Your Heading Here</h2><p style="font-size:16px;color:#6b7280;margin:0;font-family:Inter,sans-serif">Click this text to edit. Drag more widgets from the left panel.</p></div></section>`);
            }} />
          )}
        </div>

        <div style={{ width: 280, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   GRAPESJS DARK THEME CSS
   ══════════════════════════════════════════ */
const GJS_CSS = `
  /* ── Canvas ── */
  /* ── Override GrapesJS CSS variables — no !important on custom props ── */
  :root {
    --gjs-main-color: #13141b;
    --gjs-primary-color: #13141b;
    --gjs-secondary-color: #c9cdd3;
    --gjs-tertiary-color: #4f46e5;
    --gjs-quaternary-color: #818cf8;
    --gjs-font-color: #c9cdd3;
    --gjs-font-color-active: #f8f8f8;
    --gjs-main-dark-color: rgba(0,0,0,0.35);
    --gjs-main-light-color: rgba(255,255,255,0.05);
    --gjs-secondary-dark-color: rgba(0,0,0,0.2);
    --gjs-soft-light-color: rgba(255,255,255,0.015);
    --gjs-light-border: rgba(255,255,255,0.05);
  }

  /* GrapesJS uses --gjs-left-width in calc() for canvas width — zero it out */
  .gjs-editor {
    background: #f0f2f7 !important;
    font-family: "Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important;
    --gjs-left-width: 0px !important;
    --gjs-canvas-top: 0px !important;
  }
  .gjs-cv-canvas {
    background: #f0f2f7 !important;
    padding: 0 !important; top: 0 !important; bottom: 0 !important;
    left: 0 !important; right: 0 !important;
    width: 100% !important;
  }
  .gjs-cv-canvas__frames { padding: 0 !important; margin: 0 !important; width: 100% !important; height: 100% !important; }
  /* frame-wrapper: NO width override — let GrapesJS set tablet/mobile px; desktop fixed via JS */
  .gjs-frame-wrapper { box-shadow: none !important; border: none !important; padding: 0 !important; }
  .gjs-frame-wrapper__ghost { display: none !important; }
  .gjs-frame { box-shadow: none !important; border: none !important; }
  .gjs-pn-panels { display: none !important; }
  .gjs-editor > .gjs-off-prv { display: none !important; }

  /* ── Left panel font fix ── */
  #gjs-blocks, #gjs-blocks * { font-family: "Inter",-apple-system,sans-serif !important; }
  #gjs-layers, #gjs-layers * { font-family: "Inter",-apple-system,sans-serif !important; }

  /* ── Block panel ── */
  #gjs-blocks { background: #13131a !important; padding-bottom: 12px; }

  /* ── Block category header ── */
  .gjs-block-category { border: none !important; margin-bottom: 4px; background: #13131a !important; }
  .gjs-block-category__title,
  .gjs-block-category .gjs-title,
  .gjs-category-title {
    background: transparent !important;
    color: #374151 !important;
    font-size: 9px !important; font-weight: 800 !important;
    letter-spacing: 0.16em !important; text-transform: uppercase !important;
    padding: 10px 12px 4px !important;
    border: none !important;
    cursor: pointer !important;
    display: flex !important; align-items: center !important; gap: 6px !important;
  }
  .gjs-block-category__title::before,
  .gjs-block-category .gjs-title::before {
    content: '' !important;
    display: inline-block !important;
    width: 3px !important; height: 11px !important;
    background: #4f46e5 !important; border-radius: 2px !important; flex-shrink: 0 !important;
  }
  .gjs-block-category__title:hover,
  .gjs-block-category .gjs-title:hover { color: #9ca3af !important; }

  /* ── Block grid ── */
  .gjs-block-category .gjs-blocks-c,
  #gjs-blocks .gjs-blocks-c {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 5px !important;
    padding: 4px 10px 6px !important;
  }

  /* ── Block card ── */
  .gjs-block {
    background: #1a1a25 !important;
    border: 1px solid rgba(255,255,255,0.06) !important;
    border-radius: 8px !important;
    padding: 14px 8px 10px !important;
    min-height: 0 !important; min-width: 0 !important;
    display: flex !important; flex-direction: column !important;
    align-items: center !important; justify-content: flex-start !important;
    gap: 8px !important;
    color: #6b7280 !important;
    cursor: grab !important;
    transition: background .15s, border-color .15s, color .15s, box-shadow .15s !important;
    user-select: none !important; overflow: hidden !important;
    position: relative !important;
  }
  .gjs-block::after {
    content: '' !important; position: absolute !important;
    inset: 0 !important; border-radius: 8px !important;
    background: linear-gradient(135deg, rgba(99,102,241,0) 0%, rgba(99,102,241,0) 100%) !important;
    transition: background .2s !important; pointer-events: none !important;
  }
  .gjs-block:hover {
    background: #1d1f35 !important;
    border-color: rgba(99,102,241,0.5) !important;
    color: #a5b4fc !important;
    box-shadow: 0 4px 12px rgba(79,70,229,0.15) !important;
  }
  .gjs-block:hover::after {
    background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%) !important;
  }
  .gjs-block:active { transform: scale(0.95) !important; opacity: 0.8 !important; }
  .gjs-block:focus { outline: none !important; border-color: #6366f1 !important; }

  /* ── Block icon wrapper ── */
  .gjs-block__media {
    width: 36px !important; height: 36px !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    background: rgba(79,70,229,0.12) !important;
    border-radius: 8px !important;
    color: #6366f1 !important;
    flex-shrink: 0 !important;
    transition: background .15s, color .15s !important;
  }
  .gjs-block__media svg {
    width: 18px !important; height: 18px !important;
    display: block !important; overflow: visible !important;
  }
  .gjs-block:hover .gjs-block__media {
    background: rgba(99,102,241,0.22) !important;
    color: #a5b4fc !important;
  }

  /* ── Block label ── */
  .gjs-block-label {
    font-size: 10.5px !important; font-weight: 600 !important;
    text-transform: none !important; letter-spacing: 0 !important;
    color: inherit !important; text-align: center !important;
    line-height: 1.3 !important; width: 100% !important;
    white-space: normal !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important; padding: 0 2px !important;
  }

  /* ── Layers ── */
  #gjs-layers { background: #1a1a1f !important; padding: 6px 4px !important; }
  .gjs-layer { background: transparent !important; border-radius: 6px !important; color: #4b5563 !important; font-size: 12px !important; margin: 1px 0 !important; }
  .gjs-layer:hover, .gjs-layer.gjs-hovered { background: #252530 !important; color: #c9cdd3 !important; }
  .gjs-layer.gjs-selected { background: #1e2038 !important; color: #818cf8 !important; }
  .gjs-layer__icon { color: #4f46e5 !important; }

  /* ── Style manager ── */
  #gjs-styles { background: #1a1a1f !important; }
  .gjs-sm-sector { border: none !important; border-bottom: 1px solid rgba(255,255,255,0.04) !important; }
  .gjs-sm-sector__title {
    background: #111116 !important; color: #4b5563 !important;
    font-size: 10px !important; font-weight: 800 !important;
    letter-spacing: 0.1em !important; text-transform: uppercase !important;
    padding: 10px 14px !important; cursor: pointer !important;
    transition: color .15s !important;
    border-top: 1px solid rgba(255,255,255,0.04) !important;
  }
  .gjs-sm-sector__title:hover { color: #9ca3af !important; }
  .gjs-sm-sector.gjs-sm-open .gjs-sm-sector__title { color: #818cf8 !important; }
  .gjs-sm-properties { padding: 12px 14px !important; background: #1a1a1f !important; }
  .gjs-sm-property { margin-bottom: 12px !important; }
  .gjs-sm-label { color: #374151 !important; font-size: 11px !important; margin-bottom: 5px !important; text-transform: capitalize !important; font-weight: 500 !important; }
  .gjs-field {
    background: #111116 !important; border: 1px solid rgba(255,255,255,0.07) !important;
    border-radius: 6px !important; color: #c9cdd3 !important; overflow: hidden !important;
    transition: border-color .15s !important;
  }
  .gjs-field:focus-within { border-color: #4f46e5 !important; }
  .gjs-field input, .gjs-field select, .gjs-field textarea {
    background: transparent !important; border: none !important;
    color: #c9cdd3 !important; font-size: 12px !important; padding: 6px 8px !important;
  }
  .gjs-field input:focus, .gjs-field select:focus { outline: none !important; }
  .gjs-clm-tag { background: #252530 !important; color: #4b5563 !important; border: 1px solid rgba(255,255,255,0.07) !important; font-size: 11px !important; border-radius: 5px !important; padding: 2px 8px !important; }
  .gjs-clm-tag:hover { background: #4f46e5 !important; color: #fff !important; border-color: #4f46e5 !important; }

  /* ── Traits ── */
  #gjs-traits { background: #1a1a1f !important; padding: 14px !important; }
  .gjs-trt-trait { margin-bottom: 14px !important; }
  .gjs-label { color: #374151 !important; font-size: 11px !important; margin-bottom: 5px !important; font-weight: 500 !important; }
  .gjs-input { background: #111116 !important; border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 6px !important; color: #c9cdd3 !important; font-size: 12px !important; padding: 6px 8px !important; width: 100% !important; }
  .gjs-input:focus { border-color: #4f46e5 !important; outline: none !important; }

  /* ── Selector manager ── */
  #gjs-selectors { background: #111116 !important; padding: 10px 14px !important; border-bottom: 1px solid rgba(255,255,255,0.04) !important; }
  .gjs-clm-header { font-size: 9px !important; color: #374151 !important; text-transform: uppercase !important; letter-spacing: .1em !important; margin-bottom: 7px !important; font-weight: 700 !important; }
  .gjs-clm-tags { display: flex !important; flex-wrap: wrap !important; gap: 5px !important; }
  .gjs-clm-new { background: transparent !important; border: 1px dashed rgba(79,70,229,0.4) !important; color: #4f46e5 !important; border-radius: 5px !important; font-size: 11px !important; padding: 3px 8px !important; cursor: pointer !important; }
  .gjs-clm-new:hover { background: #1e2038 !important; }
  /* kill the brownish GrapesJS selector manager backgrounds */
  .gjs-sm-sector,
  .gjs-clm-sels-info,
  [class*="gjs-smm"],
  .gjs-selector-name,
  .gjs-clm-sel-id { background: #111116 !important; color: #6b7280 !important; }
  .gjs-clm-states { background: #252530 !important; border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 6px !important; color: #c9cdd3 !important; font-size: 11px !important; padding: 3px 8px !important; cursor: pointer !important; }
  .gjs-clm-states:hover { border-color: #4f46e5 !important; }
  .gjs-clm-label { color: #374151 !important; font-size: 10px !important; text-transform: uppercase !important; letter-spacing: .07em !important; font-weight: 700 !important; }
  /* override any remaining brown/warm panel background in GrapesJS core panels */
  .gjs-pn-views-container,
  .gjs-pn-views,
  .gjs-pn-options,
  .gjs-pn-commands { background: transparent !important; }

  /* ── Toolbar (selected element) ── */
  .gjs-toolbar { background: #4f46e5 !important; border-radius: 7px !important; box-shadow: 0 4px 16px rgba(79,70,229,0.5) !important; overflow: hidden !important; }
  .gjs-toolbar-item { color: #fff !important; padding: 5px 7px !important; }
  .gjs-toolbar-item:hover { background: rgba(255,255,255,0.15) !important; }

  /* ── Resize handles ── */
  .gjs-resizer-h { background: #4f46e5 !important; border: 2px solid #fff !important; width: 8px !important; height: 8px !important; border-radius: 50% !important; box-shadow: 0 2px 6px rgba(79,70,229,0.5) !important; }

  /* ── Drop placeholder ── */
  .gjs-placeholder { border: 2px solid #4f46e5 !important; background: rgba(79,70,229,0.08) !important; border-radius: 6px !important; }
  .gjs-placeholder-int { background: rgba(79,70,229,0.15) !important; }

  /* ── Modal ── */
  .gjs-mdl-dialog { background: #252530 !important; border: 1px solid rgba(255,255,255,0.08) !important; color: #c9cdd3 !important; border-radius: 14px !important; box-shadow: 0 24px 64px rgba(0,0,0,0.7) !important; }
  .gjs-mdl-header { background: #1a1a1f !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; border-radius: 14px 14px 0 0 !important; padding: 16px 20px !important; }
  .gjs-mdl-title { color: #e5e7eb !important; font-size: 15px !important; font-weight: 700 !important; }
  .gjs-mdl-btn-close { color: #374151 !important; font-size: 20px !important; }
  .gjs-mdl-btn-close:hover { color: #e5e7eb !important; }
  .gjs-btn-prim { background: linear-gradient(135deg,#4f46e5,#7c3aed) !important; color: #fff !important; border: none !important; border-radius: 8px !important; padding: 8px 20px !important; font-size: 13px !important; font-weight: 700 !important; cursor: pointer !important; }
  .gjs-btn-prim:hover { opacity: .9 !important; }

  /* ── Scrollbars ── */
  #gjs-blocks::-webkit-scrollbar,#gjs-layers::-webkit-scrollbar,
  #gjs-styles::-webkit-scrollbar,#gjs-traits::-webkit-scrollbar { width: 4px; }
  #gjs-blocks::-webkit-scrollbar-track,#gjs-layers::-webkit-scrollbar-track,
  #gjs-styles::-webkit-scrollbar-track,#gjs-traits::-webkit-scrollbar-track { background: #0d0e14; }
  #gjs-blocks::-webkit-scrollbar-thumb,#gjs-layers::-webkit-scrollbar-thumb,
  #gjs-styles::-webkit-scrollbar-thumb,#gjs-traits::-webkit-scrollbar-thumb { background: #1e1f2b; border-radius: 2px; }
  #gjs-blocks::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
`;
