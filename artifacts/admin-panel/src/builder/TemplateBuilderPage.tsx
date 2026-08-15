import { useEffect, useRef, useState, useCallback } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import grapesjsBlocksBasic from 'grapesjs-blocks-basic';
import grapesjsForms from 'grapesjs-plugin-forms';
import { useParams, useLocation } from 'wouter';
import 'grapesjs/dist/css/grapes.min.css';
import { registerCustomBlocks, CUSTOM_BLOCK_ICONS, CUSTOM_BLOCK_LABELS } from './customBlocks';

const TEMPLATE_LABELS: Record<string, string> = {
  category: 'Category Page Template',
  product:  'Product Page Template',
  shop:     'Shop / Products Listing',
  blog:     'Blog Listing Page',
};

const BUILDER_CONTENT_VERSION = 2;

/* ══════════════════════════════════════════
   BLOCK ICON MAP
   ══════════════════════════════════════════ */
const BLOCK_ICONS: Record<string, string> = {
  'column1':    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg>`,
  'column2':    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="3" y="4" width="14" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="22" y="4" width="15" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg>`,
  'column3':    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="2" y="4" width="10" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="15" y="4" width="10" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="28" y="4" width="10" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg>`,
  'column3-7':  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="2" y="4" width="12" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="17" y="4" width="21" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg>`,
  'text':       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M8 12h24M8 20h20M8 28h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>`,
  'text-basic': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M8 10h24M8 18h24M8 26h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>`,
  'text-section':`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M10 14h20M10 20h16M10 26h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>`,
  'link':       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M17 22a7 7 0 0 0 9.9.7l4-4a7 7 0 0 0-9.9-9.9l-2.3 2.3" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M23 18a7 7 0 0 0-9.9-.7l-4 4a7 7 0 0 0 9.9 9.9l2.3-2.3" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>`,
  'link-block': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="20" y1="12" x2="20" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="12" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>`,
  'image':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><circle cx="14" cy="14" r="3" fill="currentColor" opacity=".6"/><path d="M4 28l9-9 6 6 4-4 9 9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/></svg>`,
  'video':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="3" y="8" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M27 16l10-6v20l-10-6V16z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/></svg>`,
  'map':        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20 6c-5.5 0-10 4.5-10 10 0 7.5 10 18 10 18s10-10.5 10-18c0-5.5-4.5-10-10-10z" fill="none" stroke="currentColor" strokeWidth="2.5"/><circle cx="20" cy="16" r="3.5" fill="none" stroke="currentColor" strokeWidth="2"/></svg>`,
  'quote':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M6 28c4 0 8-1.5 8-9V9H8v10c0 1.5 0 1.5 1 1.5h1c0 3-.5 5.5-4 5.5V28zM22 28c4 0 8-1.5 8-9V9H24v10c0 1.5 0 1.5 1 1.5h1c0 3-.5 5.5-4 5.5V28z" fill="currentColor" opacity=".8"/></svg>`,
  'form':       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="6" width="32" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="4" y="17" width="32" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="4" y="28" width="14" height="7" rx="2" fill="currentColor" opacity=".4"/></svg>`,
  'input':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="12" width="32" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><line x1="11" y1="20" x2="11" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>`,
  'textarea':   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="6" width="32" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M10 15h20M10 22h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>`,
  'select':     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="12" width="32" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><polyline points="27,17 31,21 35,17" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
  'button':     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="12" width="32" height="16" rx="8" fill="none" stroke="currentColor" strokeWidth="2.5"/><line x1="15" y1="20" x2="25" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>`,
  'label':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M5 20L18 8h17v24H18L5 20z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><circle cx="24" cy="20" r="2.5" fill="currentColor"/></svg>`,
  'checkbox':   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="6" y="6" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/><polyline points="10,15 14,19 22,9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="30" y1="12" x2="38" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="30" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>`,
  'radio':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/><circle cx="14" cy="14" r="4" fill="currentColor" opacity=".7"/><line x1="26" y1="14" x2="36" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>`,
};

const BLOCK_LABELS: Record<string, string> = {
  'column1':'1 Column','column2':'2 Columns','column3':'3 Columns','column3-7':'2 Col 3:7',
  'text':'Text','text-basic':'Text Box','text-section':'Section',
  'link':'Link','link-block':'Link Box','image':'Image','video':'Video','map':'Map','quote':'Quote',
  'form':'Form','input':'Input','textarea':'Textarea','select':'Select',
  'button':'Button','label':'Label','checkbox':'Checkbox','radio':'Radio',
};

/* Merged maps including custom blocks */
const ALL_ICONS  = { ...BLOCK_ICONS,  ...CUSTOM_BLOCK_ICONS };
const ALL_LABELS = { ...BLOCK_LABELS, ...CUSTOM_BLOCK_LABELS };

function getBlocksManager(editor: Editor): any {
  return (editor as any).Blocks ?? (editor as any).BlockManager;
}

/* GrapesJS plugin — runs LAST: registers custom blocks then overrides all icons/labels */
const iconPlugin = (editor: Editor) => {
  registerCustomBlocks(editor);
  const blocks = getBlocksManager(editor);
  if (!blocks?.getAll) return;
  blocks.getAll().forEach((block: any) => {
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
      const converted = convertBlocksToHtml(d);
      return { html: converted, css: '' };
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

function topBtn(): React.CSSProperties {
  return { width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0 };
}

const PAGE_ID_TO_URL: Record<string, string> = {
  '1': '/about',
  '2': '/delivery-policy',
  '3': '/contact',
  '4': '/faq',
  '5': '/privacy-policy',
  '6': '/terms-and-conditions',
  '7': '/refund-return-policy',
  '8': '/disclaimer',
  '9': '/request-sample',
  '10': '/returns-claims-support'
};

/* ── Top Bar ── */
function TopBar({ title, saving, lastSaved, saveError, viewport, themeColor, previewCategory, isPage, contentOnly, pageId, onSave, onBack, onUndo, onRedo, onViewport, onPreview, onOpenCode, onOpenHistory, onSaveBlock, onChangeTheme, onSelectSampleCategory }: {
  title: string; saving: boolean; lastSaved: string; saveError: string; viewport: string; themeColor: string; previewCategory: string; isPage?: boolean; pageId?: string;
  contentOnly?: boolean;
  onSave(): void; onBack(): void; onUndo(): void; onRedo(): void; onViewport(v: string): void; onPreview(): void;
  onOpenCode(): void; onOpenHistory(): void; onSaveBlock(): void; onChangeTheme(color: string): void; onSelectSampleCategory(cat: string): void;
}) {
  const liveUrl = (isPage && pageId && PAGE_ID_TO_URL[pageId]) ? PAGE_ID_TO_URL[pageId] : `/${previewCategory || 'cardboard-boxes'}`;
  return (
    <header style={{ height: 56, flexShrink: 0, background: '#0D1F3C', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', fontFamily: 'Outfit, Inter, sans-serif', zIndex: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
      <button onClick={onBack} style={{ ...topBtn(), background: 'rgba(255,255,255,0.08)', color: '#FFF' }} title={isPage ? "Back to Pages" : "Back to Templates"}>
        {Ico.back}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 6 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: themeColor, color: '#FFF', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          P
        </div>
        <div>
          <span style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 800, display: 'block', lineHeight: 1 }}>{title}</span>
          <span style={{ color: '#FFB800', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{contentOnly ? 'Content Only Editor · Layout Locked' : 'Template Visual Editor'}</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {!isPage && (
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '2px 8px', border: '1px solid rgba(255,255,255,0.08)', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>👁️ Sample Data:</span>
          <select value={previewCategory} onChange={e => onSelectSampleCategory(e.target.value)} style={{ background: 'transparent', color: '#34D399', border: 'none', fontSize: 11, fontWeight: 800, outline: 'none', cursor: 'pointer' }}>
            <option value="cardboard-boxes" style={{ background: '#0D1F3C' }}>📦 Cardboard Boxes</option>
            <option value="custom-paper-bags" style={{ background: '#0D1F3C' }}>🛍️ Custom Paper Bags</option>
            <option value="custom-pillow-boxes" style={{ background: '#0D1F3C' }}>🎁 Custom Pillow Boxes</option>
            <option value="cbd-boxes" style={{ background: '#0D1F3C' }}>🌿 CBD Boxes</option>
            <option value="bakery-boxes" style={{ background: '#0D1F3C' }}>🧁 Bakery Boxes</option>
          </select>
        </div>
      )}

      {!contentOnly && (
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '2px 8px', border: '1px solid rgba(255,255,255,0.08)', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>🎨 Theme:</span>
          <select value={themeColor} onChange={e => onChangeTheme(e.target.value)} style={{ background: 'transparent', color: '#FFF', border: 'none', fontSize: 11, fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
            <option value="#E63329" style={{ background: '#0D1F3C' }}>🔴 Crimson Red</option>
            <option value="#2563EB" style={{ background: '#0D1F3C' }}>🔵 Royal Navy</option>
            <option value="#10B981" style={{ background: '#0D1F3C' }}>🟢 Eco Green</option>
            <option value="#D97706" style={{ background: '#0D1F3C' }}>🟡 Luxury Gold</option>
          </select>
        </div>
      )}

      {/* Device Switcher */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
        {(['desktop', 'tablet', 'mobile'] as const).map(v => (
          <button key={v} onClick={() => onViewport(v)} title={v} style={{ width: 32, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer', background: viewport === v ? themeColor : 'transparent', color: viewport === v ? '#fff' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
            {v === 'desktop' ? Ico.desktop : v === 'tablet' ? Ico.tablet : Ico.mobile}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

      <button onClick={onUndo} title="Undo" style={topBtn()}>{Ico.undo}</button>
      <button onClick={onRedo} title="Redo" style={topBtn()}>{Ico.redo}</button>

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

      {!contentOnly && (
        <button onClick={onSaveBlock} style={{ ...topBtn(), width: 'auto', padding: '0 10px', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#F8FAFC', borderRadius: 8, gap: 4 }} title="Save Selected Element to Reusable Block Library">
          <span>⭐</span> Save Block
        </button>
      )}

      <button onClick={onOpenHistory} style={{ ...topBtn(), width: 'auto', padding: '0 10px', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#F8FAFC', borderRadius: 8, gap: 4 }} title="View Version History & Restore">
        <span>📜</span> History
      </button>

      {!contentOnly && (
        <button onClick={onOpenCode} style={{ ...topBtn(), width: 'auto', padding: '0 10px', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#F8FAFC', borderRadius: 8, gap: 4 }} title="View & Edit HTML/CSS Code">
          <span>&lt;/&gt;</span> Code
        </button>
      )}

      <button onClick={onPreview} style={{ ...topBtn(), gap: 4, padding: '0 10px', width: 'auto', background: 'rgba(255,255,255,0.08)', color: '#FFF', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
        {Ico.eye}
        <span>Preview</span>
      </button>

      {saveError ? <span style={{ fontSize: 11, color: '#F87171', marginLeft: 6, fontWeight: 700 }}>⚠️ {saveError}</span>
        : lastSaved ? <span style={{ fontSize: 11, color: '#34D399', marginLeft: 6, fontWeight: 700 }}>✓ {lastSaved}</span> : null}

      <div style={{ width: 6 }} />

      <button onClick={() => window.open(liveUrl, '_blank')} style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid rgba(52,211,153,0.4)', cursor: 'pointer', background: 'rgba(16,185,129,0.15)', color: '#34D399', fontSize: 11, fontWeight: 800, gap: 4, display: 'flex', alignItems: 'center', transition: 'all 0.2s' }} title="Open Real Published Website Page in New Tab">
        <span>🌐</span> View Live Page ↗
      </button>

      <button onClick={onSave} disabled={saving} style={{ height: 34, padding: '0 18px', borderRadius: 8, border: 'none', cursor: saving ? 'default' : 'pointer', background: `linear-gradient(135deg, ${themeColor} 0%, #B91C1C 100%)`, color: '#FFFFFF', fontSize: 12, fontWeight: 800, boxShadow: '0 4px 14px rgba(230,51,41,0.3)', opacity: saving ? 0.6 : 1, transition: 'all 0.2s' }}>
        {saving ? 'Saving…' : isPage ? '💾 Save Page' : '💾 Save Template'}
      </button>
    </header>
  );
}

/* ── Left Panel ── */
function LeftPanel() {
  const [tab, setTab] = useState<'blocks' | 'layers'>('blocks');
  const [search, setSearch] = useState('');
  const handleSearch = (val: string) => {
    setSearch(val);
    const q = val.toLowerCase();
    document.querySelectorAll('#tpl-blocks .gjs-block, #gjs-blocks .gjs-block').forEach((el: any) => {
      const lbl = el.querySelector('.gjs-block-label')?.textContent?.toLowerCase() || '';
      el.style.display = !q || lbl.includes(q) ? '' : 'none';
    });
    document.querySelectorAll('#tpl-blocks .gjs-block-category, #gjs-blocks .gjs-block-category').forEach((cat: any) => {
      const anyVisible = [...cat.querySelectorAll('.gjs-block')].some((b: any) => b.style.display !== 'none');
      cat.style.display = !q || anyVisible ? '' : 'none';
    });
  };
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0B0F19', userSelect: 'none' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #1E293B', flexShrink: 0, background: '#0B0F19', padding: '8px 12px', gap: 6 }}>
        {(['blocks', 'layers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer',
            background: tab === t ? '#1E293B' : 'transparent',
            color: tab === t ? '#FFFFFF' : '#94A3B8',
            fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s'
          }}>
            {t === 'blocks' ? '🧱 Widgets' : '🥞 Layers'}
          </button>
        ))}
      </div>
      {tab === 'blocks' && (
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #1E293B', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none', display: 'flex' }}>{Ico.search}</span>
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search widgets…" style={{
              width: '100%', padding: '9px 10px 9px 32px', fontSize: 12, background: '#141A29',
              border: '1px solid #1E293B', borderRadius: 10, color: '#F8FAFC', outline: 'none', boxSizing: 'border-box',
              transition: 'all 0.2s'
            }}
              onFocus={e => (e.target.style.borderColor = '#E63329')} onBlur={e => (e.target.style.borderColor = '#1E293B')} />
          </div>
        </div>
      )}
      <div id="tpl-blocks" style={{ flex: 1, overflowY: 'auto', display: tab === 'blocks' ? 'block' : 'none', overflowX: 'hidden' }} />
      <div id="tpl-layers" style={{ flex: 1, overflowY: 'auto', display: tab === 'layers' ? 'block' : 'none' }} />
    </aside>
  );
}

/* ── Motion FX Inspector Panel ── */
function MotionFxPanel({ onApplyAnimation }: { onApplyAnimation(anim: string, duration: string, delay: string, hover: string): void }) {
  const [anim, setAnim] = useState('fadeInUp');
  const [duration, setDuration] = useState('0.8s');
  const [delay, setDelay] = useState('0s');
  const [hover, setHover] = useState('grow');

  return (
    <div style={{ padding: 14, background: '#0B0F19', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#101726', padding: '10px 12px', borderRadius: 8, border: '1px solid #1E293B' }}>
        <span style={{ color: '#F1F5F9', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
          ✨ Entrance Animation & Motion FX
        </span>
        <span style={{ color: '#94A3B8', fontSize: 11 }}>Applies smooth scroll entrance & hover animations to selected element</span>
      </div>

      <div>
        <label style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Animation Type</label>
        <select value={anim} onChange={e => setAnim(e.target.value)} style={{ width: '100%', background: '#141A29', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', padding: '8px 10px', fontSize: 12, outline: 'none' }}>
          <option value="none">None (Static)</option>
          <option value="fadeInUp">Fade In Up (Smooth Rise)</option>
          <option value="fadeInDown">Fade In Down</option>
          <option value="fadeInLeft">Fade In Left</option>
          <option value="fadeInRight">Fade In Right</option>
          <option value="zoomIn">Zoom In Scale</option>
          <option value="bounce">Bounce Attention</option>
          <option value="pulse">Pulse Glow</option>
          <option value="parallax">Parallax Float</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Duration</label>
          <select value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100%', background: '#141A29', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', padding: '8px 10px', fontSize: 12, outline: 'none' }}>
            <option value="0.4s">Fast (0.4s)</option>
            <option value="0.8s">Normal (0.8s)</option>
            <option value="1.5s">Slow (1.5s)</option>
            <option value="2.5s">Ultra Slow (2.5s)</option>
          </select>
        </div>
        <div>
          <label style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Delay</label>
          <select value={delay} onChange={e => setDelay(e.target.value)} style={{ width: '100%', background: '#141A29', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', padding: '8px 10px', fontSize: 12, outline: 'none' }}>
            <option value="0s">0s (Immediate)</option>
            <option value="0.2s">0.2s</option>
            <option value="0.4s">0.4s</option>
            <option value="0.6s">0.6s</option>
            <option value="0.8s">0.8s</option>
            <option value="1s">1.0s</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Hover Effect</label>
        <select value={hover} onChange={e => setHover(e.target.value)} style={{ width: '100%', background: '#141A29', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', padding: '8px 10px', fontSize: 12, outline: 'none' }}>
          <option value="none">None</option>
          <option value="grow">3D Scale Grow</option>
          <option value="lift">Elevate Shadow</option>
          <option value="glow">Crimson Glow Border</option>
        </select>
      </div>

      <button onClick={() => onApplyAnimation(anim, duration, delay, hover)} style={{ marginTop: 8, background: 'linear-gradient(135deg, #E63329, #C1271E)', border: 'none', borderRadius: 10, color: '#FFF', padding: '10px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(230,51,41,0.3)' }}>
        ✨ Apply Motion Effects to Canvas
      </button>
    </div>
  );
}

/* ── Column Width Presets Bar ── */
function ColumnWidthBar({ onApplyWidth }: { onApplyWidth(pct: string): void }) {
  return (
    <div style={{ padding: '10px 12px', borderBottom: '1px solid #1E293B', background: '#101726' }}>
      <span style={{ color: '#94A3B8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
        📐 Elementor Column Width (%):
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
        {(['20%', '25%', '30%', '33.3%', '50%', '66.6%', '70%', '75%', '80%', '100%'] as const).map(w => (
          <button key={w} onClick={() => onApplyWidth(w)} style={{
            background: '#141A29', border: '1px solid #1E293B', borderRadius: 6,
            color: '#F8FAFC', padding: '4px 0', fontSize: 10, fontWeight: 700,
            cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#E63329'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1E293B'}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Elementor Alignment Bar ── */
const alignBtnStyle: React.CSSProperties = {
  background: '#141A29',
  border: '1px solid #1E293B',
  borderRadius: 6,
  color: '#F8FAFC',
  padding: '6px 0',
  fontSize: 10,
  fontWeight: 700,
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.15s'
};

function AlignmentBar({ onApplyAlign }: { onApplyAlign(type: 'left' | 'center' | 'right' | 'between' | 'vcenter'): void }) {
  return (
    <div style={{ padding: '10px 12px', borderBottom: '1px solid #1E293B', background: '#0D1322' }}>
      <span style={{ color: '#94A3B8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
        🎯 Elementor Alignment & Flex:
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
        <button onClick={() => onApplyAlign('left')} style={alignBtnStyle} title="Align Left">⬅️ Left</button>
        <button onClick={() => onApplyAlign('center')} style={alignBtnStyle} title="Align Center">🎯 Center</button>
        <button onClick={() => onApplyAlign('right')} style={alignBtnStyle} title="Align Right">➡️ Right</button>
        <button onClick={() => onApplyAlign('between')} style={alignBtnStyle} title="Space Between">↔️ Spread</button>
        <button onClick={() => onApplyAlign('vcenter')} style={alignBtnStyle} title="Vertical Center">↕️ Middle</button>
      </div>
    </div>
  );
}

/* ── Right Panel ── */
function RightPanel({ onApplyAnimation, onApplyWidth, onApplyAlign }: {
  onApplyAnimation(anim: string, duration: string, delay: string, hover: string): void;
  onApplyWidth(pct: string): void;
  onApplyAlign(type: 'left' | 'center' | 'right' | 'between' | 'vcenter'): void;
}) {
  const [tab, setTab] = useState<'style' | 'settings' | 'motion'>('style');
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0B0F19' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #1E293B', flexShrink: 0, background: '#0B0F19', padding: '8px 12px', gap: 4 }}>
        {(['style', 'settings', 'motion'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer',
            background: tab === t ? '#1E293B' : 'transparent',
            color: tab === t ? '#FFFFFF' : '#94A3B8',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s'
          }}>
            {t === 'style' ? '🎨 Style' : t === 'settings' ? '⚙️ Settings' : '✨ Motion'}
          </button>
        ))}
      </div>
      {tab === 'style' && <ColumnWidthBar onApplyWidth={onApplyWidth} />}
      {tab === 'style' && <AlignmentBar onApplyAlign={onApplyAlign} />}
      <div id="tpl-selectors" style={{ borderBottom: '1px solid #1E293B', flexShrink: 0, display: tab === 'style' ? 'block' : 'none' }} />
      <div id="tpl-styles" style={{ flex: 1, overflowY: 'auto', display: tab === 'style' ? 'block' : 'none' }} />
      <div id="tpl-traits" style={{ flex: 1, overflowY: 'auto', display: tab === 'settings' ? 'block' : 'none' }} />
      {tab === 'motion' && <MotionFxPanel onApplyAnimation={onApplyAnimation} />}
    </aside>
  );
}

function ContentOnlyPanel({ component }: { component: any }) {
  const [text, setText] = useState('');
  const [href, setHref] = useState('');
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');

  useEffect(() => {
    if (!component) {
      setText('');
      setHref('');
      setSrc('');
      setAlt('');
      return;
    }
    const attrs = component.getAttributes?.() || {};
    setText(String(component.get('content') || ''));
    setHref(String(attrs.href || ''));
    setSrc(String(attrs.src || ''));
    setAlt(String(attrs.alt || ''));
  }, [component]);

  const tagName = String(component?.get?.('tagName') || '').toLowerCase();
  const isImage = tagName === 'img';
  const isLink = tagName === 'a' || Boolean(component?.getAttributes?.()?.href);
  const isEditableText = Boolean(component) && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'strong', 'em', 'li', 'label'].includes(tagName);

  const updateText = (value: string) => {
    setText(value);
    try {
      component?.set('content', value);
      component?.components(value);
    } catch {}
  };

  const updateAttribute = (name: string, value: string) => {
    if (name === 'href') setHref(value);
    if (name === 'src') setSrc(value);
    if (name === 'alt') setAlt(value);
    try { component?.addAttributes({ [name]: value }); } catch {}
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: '#141A29',
    border: '1px solid #26334A',
    borderRadius: 8,
    color: '#F8FAFC',
    padding: '9px 10px',
    fontSize: 12,
    outline: 'none',
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0B0F19', color: '#F8FAFC' }}>
      <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid #1E293B' }}>
        <div style={{ color: '#34D399', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Content Only Mode</div>
        <div style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 800, marginTop: 5 }}>Edit existing content</div>
        <div style={{ color: '#94A3B8', fontSize: 11, lineHeight: 1.5, marginTop: 6 }}>Layout and sections are locked. Click text, images, or links on the page to edit them.</div>
      </div>
      {!component ? (
        <div style={{ padding: 16, color: '#64748B', fontSize: 12, lineHeight: 1.6 }}>
          Select an existing element in the canvas to see its editable fields here.
        </div>
      ) : (
        <div style={{ padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#101726', border: '1px solid #1E293B', borderRadius: 8, padding: '9px 10px', color: '#94A3B8', fontSize: 11 }}>
            Selected element: <strong style={{ color: '#F8FAFC' }}>{tagName || 'content'}</strong>
          </div>
          {isEditableText && (
            <label style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 700 }}>
              Text content
              <textarea value={text} onChange={e => updateText(e.target.value)} rows={5} style={{ ...fieldStyle, resize: 'vertical', marginTop: 6, lineHeight: 1.5 }} />
            </label>
          )}
          {isImage && (
            <>
              <label style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 700 }}>
                Image URL
                <input value={src} onChange={e => updateAttribute('src', e.target.value)} style={{ ...fieldStyle, marginTop: 6 }} />
              </label>
              <label style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 700 }}>
                Alt text
                <input value={alt} onChange={e => updateAttribute('alt', e.target.value)} style={{ ...fieldStyle, marginTop: 6 }} />
              </label>
            </>
          )}
          {isLink && (
            <label style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 700 }}>
              Link URL
              <input value={href} onChange={e => updateAttribute('href', e.target.value)} style={{ ...fieldStyle, marginTop: 6 }} />
            </label>
          )}
          <div style={{ color: '#64748B', fontSize: 10, lineHeight: 1.5, borderTop: '1px solid #1E293B', paddingTop: 12 }}>
            Changes are local until you click <strong style={{ color: '#34D399' }}>Save Page</strong>. The original layout remains protected.
          </div>
        </div>
      )}
    </aside>
  );
}

/* ── Empty Overlay ── */
function EmptyOverlay({ onAdd }: { onAdd(): void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, pointerEvents: 'none', background: 'rgba(7,10,18,0.7)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        textAlign: 'center', padding: '48px 56px', borderRadius: 24,
        background: '#0B0F19', border: '1.5px dashed #1E293B',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        pointerEvents: 'all', maxWidth: 400,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px',
          background: 'rgba(230,51,41,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px dashed rgba(230,51,41,0.3)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E63329" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>
        <p style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-.02em', fontFamily: 'Outfit, sans-serif' }}>
          Start Building Template
        </p>
        <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 28px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
          Drag a widget from the left panel onto the canvas, or click below to insert a default layout.
        </p>
        <button onClick={onAdd} style={{
          background: 'linear-gradient(135deg, #E63329 0%, #C42A21 100%)', border: 'none', borderRadius: 12,
          padding: '14px 28px', color: '#FFFFFF', fontSize: 13, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(230,51,41,0.3)', letterSpacing: '.02em',
          fontFamily: 'Inter, sans-serif', width: '100%',
        }}>
          + Load Initial Template Layout
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN TEMPLATE BUILDER
   ══════════════════════════════════════════ */
const SAMPLE_CATEGORIES: Record<string, { name: string; description: string }> = {
  'cardboard-boxes': {
    name: 'Custom Cardboard Boxes',
    description: 'High quality custom printed cardboard boxes with custom die-cut dimensions, free design support, and wholesale pricing across the USA.'
  },
  'custom-paper-bags': {
    name: 'Custom Paper Bags',
    description: 'Eco-friendly custom printed paper bags with handles, custom logos, and premium finishing for retail and events.'
  },
  'custom-pillow-boxes': {
    name: 'Custom Pillow Boxes',
    description: 'Elegant pillow-shaped gift and favor packaging boxes with custom branding and gloss/matte lamination.'
  },
  'cbd-boxes': {
    name: 'Custom CBD Boxes',
    description: 'Child-resistant and luxury custom CBD packaging boxes with foil stamping and custom insert trays.'
  },
  'bakery-boxes': {
    name: 'Custom Bakery Boxes',
    description: 'Food-safe custom printed bakery boxes with clear display windows for cakes, donuts, and pastries.'
  }
};

const SAMPLE_PRODUCTS: Record<string, {
  name: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  categoryName: string;
  categorySlug: string;
  minOrder: string;
}> = {
  'cardboard-boxes': {
    name: 'Custom Cardboard Boxes',
    description: 'High quality custom printed cardboard boxes with custom die-cut dimensions, free design support, and wholesale pricing across the USA.',
    shortDescription: 'Premium custom cardboard boxes with full-color printing and fast turnaround.',
    imageUrl: '/api/uploads/cardboard-gift-boxes.webp',
    categoryName: 'Cardboard Boxes',
    categorySlug: 'cardboard-boxes',
    minOrder: '100',
  },
  'custom-paper-bags': {
    name: 'Custom Paper Bags',
    description: 'Eco-friendly custom printed paper bags with handles, custom logos, and premium finishing for retail and events.',
    shortDescription: 'Eco-friendly printed paper bags with custom handles and branding.',
    imageUrl: '/api/uploads/brown-paper-bags.webp',
    categoryName: 'Paper Bags',
    categorySlug: 'custom-paper-bags',
    minOrder: '100',
  },
  'custom-pillow-boxes': {
    name: 'Custom Pillow Boxes',
    description: 'Elegant pillow-shaped gift and favor packaging boxes with custom branding and gloss/matte lamination.',
    shortDescription: 'Elegant pillow boxes with custom branding for gifts, favors, and retail.',
    imageUrl: '/api/uploads/custom-pillow-boxes-with-handle-wholesale.webp',
    categoryName: 'Pillow Boxes',
    categorySlug: 'custom-pillow-boxes',
    minOrder: '100',
  },
  'cbd-boxes': {
    name: 'Custom CBD Boxes',
    description: 'Child-resistant and luxury custom CBD packaging boxes with foil stamping and custom insert trays.',
    shortDescription: 'Compliant custom CBD packaging with premium finishes and protective inserts.',
    imageUrl: '/api/uploads/cbd-oil-boxes.webp',
    categoryName: 'CBD Boxes',
    categorySlug: 'cbd-boxes',
    minOrder: '100',
  },
  'bakery-boxes': {
    name: 'Custom Bakery Boxes',
    description: 'Food-safe custom printed bakery boxes with clear display windows for cakes, donuts, and pastries.',
    shortDescription: 'Food-safe bakery boxes with clear windows and custom print.',
    imageUrl: '/api/uploads/custom-cake-boxes.webp',
    categoryName: 'Bakery Boxes',
    categorySlug: 'bakery-boxes',
    minOrder: '100',
  },
};

function applySampleDataToCanvas(editor: Editor, slug: string): void {
  const sample = SAMPLE_CATEGORIES[slug] || SAMPLE_CATEGORIES['cardboard-boxes'];
  const product = SAMPLE_PRODUCTS[slug] || SAMPLE_PRODUCTS['cardboard-boxes'];
  try {
    const frame = editor.Canvas.getFrameEl();
    const doc = frame?.contentDocument;
    if (!doc?.body) return;

    const values: Record<string, string> = {
      'category.name': sample.name,
      'category.description': sample.description,
      'category.imageUrl': product.imageUrl,
      'category.slug': product.categorySlug,
      'product.name': product.name,
      'product.description': product.description,
      'product.shortDescription': product.shortDescription,
      'product.imageUrl': product.imageUrl,
      'product.categoryName': product.categoryName,
      'product.categorySlug': product.categorySlug,
      'product.minOrder': product.minOrder,
    };
    const replaceTokens = (value: string) => value.replace(
      /\{\{\s*([a-z]+\.[a-zA-Z]+)\s*\}\}/g,
      (_token, key: string) => values[key] ?? _token,
    );

    const walker = doc.createTreeWalker(doc.body, 4);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) textNodes.push(node as Text);
    textNodes.forEach(text => {
      if (text.nodeValue) text.nodeValue = replaceTokens(text.nodeValue);
    });

    doc.body.querySelectorAll<HTMLElement>('*').forEach(element => {
      Array.from(element.attributes).forEach(attribute => {
        const nextValue = replaceTokens(attribute.value);
        if (nextValue !== attribute.value) element.setAttribute(attribute.name, nextValue);
      });
    });
  } catch {}
}

function resetCanvasPreviewFromModel(editor: Editor): void {
  // Direct DOM replacements are intentionally preview-only. Restore the
  // GrapesJS model HTML before applying another sample so switching samples
  // never leaves the previous sample text in the canvas.
  try {
    const frameTop = editor.Canvas.getFrameEl()?.contentWindow?.scrollY ?? 0;
    const canvasTop = getCanvasScrollContainer()?.scrollTop ?? 0;
    const html = editor.getHtml();
    const css = editor.getCss();
    editor.setComponents(html);
    if (css) editor.setStyle(css);
    requestAnimationFrame(() => restoreCanvasScroll(editor, frameTop, canvasTop));
  } catch {}
}

function resetCanvasScrollToTop(editor: Editor): void {
  try {
    editor.Canvas.getFrameEl()?.contentWindow?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    getCanvasScrollContainer()?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  } catch {}
}

function getCanvasScrollContainer(): HTMLElement | null {
  return document.querySelector('.gjs-cv-canvas') as HTMLElement | null;
}

function restoreCanvasScroll(editor: Editor, frameTop: number, canvasTop: number): void {
  try {
    editor.Canvas.getFrameEl()?.contentWindow?.scrollTo({ top: frameTop, left: 0, behavior: 'auto' });
    getCanvasScrollContainer()?.scrollTo({ top: canvasTop, left: 0, behavior: 'auto' });
  } catch {}
}

function lockContentOnlyComponent(component: any): void {
  if (!component || typeof component.set !== 'function') return;
  component.set({
    draggable: false,
    droppable: false,
    removable: false,
    copyable: false,
    stylable: false,
    resizable: false,
    badgable: false,
    toolbar: [],
  });
  if (typeof component.components === 'function') {
    component.components().forEach((child: any) => lockContentOnlyComponent(child));
  }
}

export default function TemplateBuilderPage() {
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const [, nav] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const pendingContent = useRef<{ html: string; css: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const [saveError, setSaveError] = useState('');
  const [viewport, setViewport] = useState('desktop');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [pageTitle, setPageTitle] = useState('');
  const contentOnly = Boolean(id);

  const title = pageTitle || (type ? (TEMPLATE_LABELS[type] ?? type) : 'Page Builder');

  const [themeColor, setThemeColor] = useState('#E63329');
  const [previewCategory, setPreviewCategory] = useState('cardboard-boxes');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [revisions, setRevisions] = useState<Array<{ id: string; time: string; html: string; css: string }>>([]);
  const [codeTab, setCodeTab] = useState<'html' | 'css'>('html');
  const [rawHtml, setRawHtml] = useState('');
  const [rawCss, setRawCss] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSelectSampleCategory = useCallback((slug: string) => {
    setPreviewCategory(slug);
    const ed = editorRef.current;
    if (!ed) return;
    // Replace only inside the preview iframe. The underlying GrapesJS model
    // keeps its {{category.*}} tokens so saving does not bake sample data into
    // the production template.
    resetCanvasPreviewFromModel(ed);
    [0, 100, 350, 800].forEach(delay => {
      window.setTimeout(() => applySampleDataToCanvas(ed, slug), delay);
    });
  }, []);

  /* ── Save Block Handler ── */
  const handleSaveBlock = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const selected = ed.getSelected();
    if (!selected) {
      alert('Please click on any element or section in the canvas first to save it as a reusable block!');
      return;
    }
    const name = prompt('Enter a name for your custom reusable block:', 'My Custom Section');
    if (!name) return;

    const blockHtml = selected.toHTML();
    const blockId = `custom_block_${Date.now()}`;
    
    getBlocksManager(ed)?.add(blockId, {
      label: name,
      category: '⭐ MY SAVED BLOCKS',
      content: blockHtml,
      media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    });

    alert(`Saved "${name}" into the "⭐ MY SAVED BLOCKS" category in your left panel!`);
  }, []);

  /* ── Open Code Modal Handler ── */
  const handleOpenCode = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    setRawHtml(ed.getHtml() || '');
    setRawCss(ed.getCss() || '');
    setShowCodeModal(true);
  }, []);

  /* ── Save ── */
  const triggerSave = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed) return;
    setSaving(true); setSaveError('');
    try {
      const html = ed.getHtml();
      const css = ed.getCss();
      const time = new Date().toLocaleTimeString();

      setRevisions(prev => [{ id: `rev_${Date.now()}`, time, html: html ?? '', css: css ?? '' }, ...prev.slice(0, 9)]);

      const content = JSON.stringify({
        builderVersion: BUILDER_CONTENT_VERSION,
        gjs: { html, css },
      });
      const endpoint = id ? `/api/admin/pages/${id}` : `/api/admin/templates/${type}`;
      const res = await fetch(endpoint, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) { setSaveError(res.status === 401 ? 'Not logged in' : `Save failed (${res.status})`); return; }
      setLastSaved(time);
      try {
        if (id) {
          localStorage.setItem(`page_updated_${id}`, Date.now().toString());
        } else if (type) {
          localStorage.setItem(`template_updated_${type}`, Date.now().toString());
        }
        localStorage.setItem('template_updated_all', Date.now().toString());
      } catch {}
    } catch (e) { setSaveError(`Error: ${(e as Error).message}`); }
    finally { setSaving(false); }
  }, [type, id]);
  useEffect(() => {
    if (!containerRef.current) return;
    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100%', width: 'auto',
      storageManager: false,
      avoidInlineStyle: false,
      undoManager: { trackSelection: false },
      plugins: [grapesjsPresetWebpage, grapesjsBlocksBasic, grapesjsForms, iconPlugin],
      pluginsOpts: {
        [grapesjsPresetWebpage as any]: { modalImportTitle: 'Import HTML', modalImportLabel: '', modalImportContent: '' },
        [grapesjsBlocksBasic as any]: { flexGrid: true },
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
        }
      `,
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap',
        ],
      },
      panels: { defaults: [] },
      layerManager: contentOnly ? {} : { appendTo: '#tpl-layers' },
      blockManager: contentOnly ? { blocks: [] } : { appendTo: '#tpl-blocks' },
      styleManager: contentOnly ? { sectors: [] } : {
        appendTo: '#tpl-styles',
        sectors: [
          { name: 'Dimension',   open: true,  buildProps: ['width', 'min-height', 'padding', 'margin'] },
          { name: 'Typography',  open: false, buildProps: ['font-family', 'font-size', 'font-weight', 'color', 'line-height', 'text-align'] },
          { name: 'Background',  open: false, buildProps: ['background-color', 'background-image', 'background-size', 'background-position'] },
          { name: 'Border',      open: false, buildProps: ['border', 'border-radius', 'box-shadow'] },
          { name: 'Layout',      open: false, buildProps: ['display', 'flex-direction', 'justify-content', 'align-items', 'gap'] },
        ],
      },
      traitManager:    contentOnly ? {} : { appendTo: '#tpl-traits' },
      selectorManager: contentOnly ? {} : { appendTo: '#tpl-selectors' },
      deviceManager: {
        devices: [
          { id: 'desktop', name: 'Desktop', width: '' },
          { id: 'tablet',  name: 'Tablet',  width: '768px',  widthMedia: '992px' },
          { id: 'mobile',  name: 'Mobile',  width: '375px',  widthMedia: '480px' },
        ],
      },
    });

    editorRef.current = editor;
    if (contentOnly) {
      try { (editor as any).getModel?.().set('dragMode', 'none'); } catch {}
    }
    registerCustomBlocks(editor);
    let initialScrollLock = true;
    let initialScrollReleaseTimer: number | null = null;
    const canvasContainer = getCanvasScrollContainer();
    const keepInitialCanvasAtTop = () => {
      if (initialScrollLock) {
        if (canvasContainer && canvasContainer.scrollTop !== 0) canvasContainer.scrollTop = 0;
        const frameWindow = editor.Canvas.getFrameEl()?.contentWindow;
        if (frameWindow && frameWindow.scrollY !== 0) frameWindow.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };
    const scheduleInitialScrollRelease = () => {
      if (!initialScrollLock) return;
      if (initialScrollReleaseTimer) window.clearTimeout(initialScrollReleaseTimer);
      initialScrollReleaseTimer = window.setTimeout(() => {
        initialScrollLock = false;
        resetCanvasScrollToTop(editor);
      }, 1500);
    };
    canvasContainer?.addEventListener('scroll', keepInitialCanvasAtTop, { passive: true });
    scheduleInitialScrollRelease();

    editor.on('load canvas:frame:load', () => {
      window.setTimeout(() => {
        if (!id) applySampleDataToCanvas(editor, 'cardboard-boxes');
        resetCanvasScrollToTop(editor);
        scheduleInitialScrollRelease();
      }, 80);
    });

    const fixLabels = () => {
      document.querySelectorAll('#tpl-blocks .gjs-block, #gjs-blocks .gjs-block').forEach((el: any) => {
        const id = el.getAttribute('title') || el.dataset.id || '';
        const mediaEl = el.querySelector('.gjs-block__media');
        const labelEl = el.querySelector('.gjs-block-label');
        if (mediaEl && BLOCK_ICONS[id]) mediaEl.innerHTML = BLOCK_ICONS[id];
        if (labelEl && BLOCK_LABELS[id]) labelEl.textContent = BLOCK_LABELS[id];
      });
      const blocks = getBlocksManager(editor);
      if (!blocks?.getAll) return;
      blocks.getAll().forEach((block: any) => {
        const id = block.get('id') as string;
        const update: Record<string, string> = {};
        if (BLOCK_ICONS[id]) update.media = BLOCK_ICONS[id];
        if (BLOCK_LABELS[id]) update.label = BLOCK_LABELS[id];
        if (Object.keys(update).length) block.set(update);
      });
    };
    const labelObs = new MutationObserver(fixLabels);
    const blocksContainer = document.getElementById('tpl-blocks') || document.getElementById('gjs-blocks');
    if (blocksContainer) labelObs.observe(blocksContainer, { childList: true, subtree: true });
    editor.on('component:selected', (comp: any) => {
      setSelectedComponent(comp || null);
      if (contentOnly) {
        lockContentOnlyComponent(comp);
        return;
      }
      if (comp && typeof comp.set === 'function') {
        comp.set('resizable', {
          tc: 1, cr: 1, bc: 1, cl: 1,
          tl: 1, tr: 1, bl: 1, br: 1,
          keyWidth: 'width',
          keyHeight: 'min-height',
          currentUnit: 1,
          minDim: 20,
          step: 1,
        });
      }
    });
    editor.on('component:deselected', () => setSelectedComponent(null));

    // Auto-adjust GrapesJS iframe canvas height to keep the complete saved
    // page/template available to scroll. Images and custom HTML can change
    // the final height after the initial component event.
    const updateFrameHeight = () => {
      try {
        const frameEl = editor?.Canvas?.getFrameEl?.();
        const win = frameEl?.contentWindow;
        if (win && win.document && win.document.body) {
          const canvasTop = initialScrollLock ? 0 : (canvasContainer?.scrollTop ?? 0);
          const frameTop = initialScrollLock ? 0 : (win.scrollY ?? 0);
          const bodyH = win.document.body.scrollHeight || 0;
          const docH = win.document.documentElement?.scrollHeight || 0;
          const fullHeight = Math.max(bodyH, docH, 600);
          const frameHeight = `${fullHeight + 120}px`;
          frameEl.style.height = frameHeight;
          frameEl.style.minHeight = frameHeight;
          const wrapper = frameEl.parentElement as HTMLElement | null;
          if (wrapper) {
            wrapper.style.height = frameHeight;
            wrapper.style.minHeight = frameHeight;
          }
          const restore = () => restoreCanvasScroll(editor, frameTop, canvasTop);
          window.requestAnimationFrame(restore);
          window.setTimeout(restore, 0);
          scheduleInitialScrollRelease();
        }
      } catch {}
    };

    editor.on('load component:add component:remove component:update style:update', () => {
      if (contentOnly) lockContentOnlyComponent(editor.getWrapper());
      setTimeout(updateFrameHeight, 250);
    });
    const frameResizeObserver = new ResizeObserver(() => updateFrameHeight());
    const observeFrameBody = () => {
      const frameBody = editor?.Canvas?.getFrameEl?.()?.contentDocument?.body;
      if (frameBody) frameResizeObserver.observe(frameBody);
    };
    window.setTimeout(observeFrameBody, 300);

    if (pendingContent.current) {
      editor.setComponents(pendingContent.current.html);
      if (pendingContent.current.css) editor.setStyle(pendingContent.current.css);
      resetCanvasScrollToTop(editor);
      setTimeout(() => {
        if (editorRef.current) {
          updateFrameHeight();
          resetCanvasScrollToTop(editorRef.current);
          scheduleInitialScrollRelease();
        }
      }, 500);
      setTimeout(() => {
        if (editorRef.current) resetCanvasScrollToTop(editorRef.current);
      }, 950);
      pendingContent.current = null;
    }

    const checkEmpty = () => setIsEmpty(editor.getComponents().length === 0);
    editor.on('component:add component:remove load', checkEmpty);
    checkEmpty();

    editor.Keymaps.add('ns:save', 'ctrl+s', () => triggerSave());
    return () => {
      if (initialScrollReleaseTimer) window.clearTimeout(initialScrollReleaseTimer);
      canvasContainer?.removeEventListener('scroll', keepInitialCanvasAtTop);
      frameResizeObserver.disconnect();
      labelObs.disconnect();
      editor.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

function getDefaultPageHtml(pageId: string): string {
  if (pageId === '1') {
    return `<section style="padding:60px 40px; background:linear-gradient(135deg,#0d1f3c,#1a2f5a); color:#FFFFFF; text-align:center;"><h1 style="font-size:42px; font-weight:900; margin:0 0 16px; font-family:Outfit,sans-serif;">USA's Premier Custom Packaging Manufacturer</h1><p style="font-size:16px; color:rgba(255,255,255,0.8); max-width:650px; margin:0 auto;">Engineered in Torrance, California. We deliver low 100 MOQs, 7-10 day turnaround, free design support, and free nationwide shipping across all 50 US states & UK.</p></section><section style="padding:60px 40px; background:#FFFFFF;"><div style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center;"><div><h2 style="font-size:28px; font-weight:800; color:#0d1f3c; margin:0 0 16px;">Our Manufacturing Story</h2><p style="font-size:15px; color:#475569; line-height:1.6; margin:0 0 12px;">Founded with a mission to simplify custom packaging for e-commerce and retail brands, Prime Packaging Boxes provides high-speed offset printing, precision die-cutting, and sustainable board materials.</p><p style="font-size:15px; color:#475569; line-height:1.6; margin:0;">From eco-friendly Kraft mailers to luxury rigid chipboard gift boxes, every product is quality inspected at our Torrance, CA facility.</p></div><div><img src="/api/uploads/printed-magnetic-closure-boxes-bulk.webp" style="width:100%; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.15);" alt="About Us"></div></div></section>`;
  }
  if (pageId === '2') {
    return `<section style="padding:60px 40px; background:linear-gradient(135deg,#0d1f3c,#1a2f5a); color:#FFFFFF; text-align:center;"><h1 style="font-size:42px; font-weight:900; margin:0 0 16px; font-family:Outfit,sans-serif;">Delivery & Shipping Policy</h1><p style="font-size:16px; color:rgba(255,255,255,0.8); max-width:650px; margin:0 auto;">Free nationwide ground shipping across all 50 US states & UK. Express 3-5 day rush options available.</p></section><section style="padding:60px 40px; background:#F8FAFC;"><div style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px;"><div style="background:#FFF; padding:28px; border-radius:16px; border:1px solid #E2E8F0; text-align:center;"><div style="font-size:36px; margin-bottom:12px;">📦</div><h3 style="font-size:20px; font-weight:800; color:#0d1f3c; margin:0 0 8px;">Standard Ground</h3><p style="font-size:14px; color:#64748B; margin:0;">7–10 Business Days post-proof approval. Free shipping included for US & UK.</p></div><div style="background:#FFF; padding:28px; border-radius:16px; border:2px solid #E63329; text-align:center;"><div style="font-size:36px; margin-bottom:12px;">⚡</div><h3 style="font-size:20px; font-weight:800; color:#E63329; margin:0 0 8px;">Rush Expedited</h3><p style="font-size:14px; color:#64748B; margin:0;">3–5 Business Days turnaround with priority air freight dispatch for urgent deadlines.</p></div><div style="background:#FFF; padding:28px; border-radius:16px; border:1px solid #E2E8F0; text-align:center;"><div style="font-size:36px; margin-bottom:12px;">✈️</div><h3 style="font-size:20px; font-weight:800; color:#0d1f3c; margin:0 0 8px;">International Shipping</h3><p style="font-size:14px; color:#64748B; margin:0;">5–12 Business Days. Customs handling and priority global transit available on request.</p></div></div></section>`;
  }
  if (pageId === '3') {
    return `<section style="padding:60px 40px; background:linear-gradient(135deg,#0d1f3c,#1a2f5a); color:#FFFFFF; text-align:center;"><h1 style="font-size:42px; font-weight:900; margin:0 0 16px; font-family:Outfit,sans-serif;">Contact Our Torrance, CA Team</h1><p style="font-size:16px; color:rgba(255,255,255,0.8); max-width:650px; margin:0 auto;">Have questions about dielines, box samples, or custom quotes? We are here to help.</p></section><section style="padding:60px 40px; background:#FFFFFF;"><div style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:40px;"><div><h2 style="font-size:24px; font-weight:800; color:#0d1f3c; margin:0 0 20px;">Torrance, CA Headquarters</h2><div style="font-size:15px; color:#475569; margin-bottom:16px;"><strong>Facility Address:</strong> Torrance, CA 90501, United States</div><div style="font-size:15px; color:#475569; margin-bottom:16px;"><strong>Direct Phone:</strong> <a href="tel:8187584076" style="color:#E63329; font-weight:700;">818-758-4076</a></div><div style="font-size:15px; color:#475569;"><strong>Email Support:</strong> help@primepackagingboxes.com</div></div><div style="background:#F8FAFC; padding:32px; border-radius:16px; border:1px solid #E2E8F0;"><h2 style="font-size:22px; font-weight:800; color:#0d1f3c; margin:0 0 16px;">Send Us a Message</h2><form style="display:flex; flex-direction:column; gap:12px;"><input type="text" placeholder="Your Name" style="padding:12px; border:1px solid #CBD5E1; border-radius:8px; font-size:14px;"><input type="email" placeholder="Email Address" style="padding:12px; border:1px solid #CBD5E1; border-radius:8px; font-size:14px;"><textarea placeholder="Project Details..." style="padding:12px; border:1px solid #CBD5E1; border-radius:8px; font-size:14px; height:100px;"></textarea><button type="button" style="background:#E63329; color:#FFF; padding:12px; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Submit Request →</button></form></div></div></section>`;
  }
  if (pageId === '4') {
    return `<section style="padding:60px 40px; background:linear-gradient(135deg,#0d1f3c,#1a2f5a); color:#FFFFFF; text-align:center;"><h1 style="font-size:42px; font-weight:900; margin:0 0 16px; font-family:Outfit,sans-serif;">Frequently Asked Questions</h1><p style="font-size:16px; color:rgba(255,255,255,0.8); max-width:650px; margin:0 auto;">Everything you need to know about custom packaging minimums, dielines, printing turnaround, and free shipping.</p></section><section style="padding:60px 40px; background:#FFFFFF;"><div style="max-width:900px; margin:0 auto; display:flex; flex-direction:column; gap:16px;"><div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:24px; border-radius:12px;"><h3 style="font-size:18px; font-weight:800; color:#0d1f3c; margin:0 0 8px;">What is the minimum order quantity (MOQ)?</h3><p style="font-size:14px; color:#475569; margin:0;">Our minimum order quantity is 100 boxes across all custom cardboard, corrugated, rigid, and Kraft packaging lines.</p></div><div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:24px; border-radius:12px;"><h3 style="font-size:18px; font-weight:800; color:#0d1f3c; margin:0 0 8px;">How long does production take?</h3><p style="font-size:14px; color:#475569; margin:0;">Standard production takes 7-10 business days after digital proof approval. Expedited 3-5 day rush orders are available.</p></div><div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:24px; border-radius:12px;"><h3 style="font-size:18px; font-weight:800; color:#0d1f3c; margin:0 0 8px;">Do you provide free design support and dielines?</h3><p style="font-size:14px; color:#475569; margin:0;">Yes! We provide complimentary 2D vector dielines and 3D digital proof rendering with every quote request.</p></div></div></section>`;
  }
  if (pageId === '6') {
    return `<section style="padding:60px 40px; background:linear-gradient(135deg,#0d1f3c,#1a2f5a); color:#FFFFFF; text-align:center;"><h1 style="font-size:42px; font-weight:900; margin:0 0 16px; font-family:Outfit,sans-serif;">Terms & Conditions</h1><p style="font-size:16px; color:rgba(255,255,255,0.8); max-width:650px; margin:0 auto;">Please review these terms before placing an order with Prime Packaging Boxes (Torrance, CA).</p></section><section style="padding:60px 40px; background:#FFFFFF;"><div style="max-width:900px; margin:0 auto; display:flex; flex-direction:column; gap:16px;"><div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:24px; border-radius:12px;"><h3 style="font-size:18px; font-weight:800; color:#0d1f3c; margin:0 0 8px;">1. Quotes & Orders</h3><p style="font-size:14px; color:#475569; margin:0;">All pricing quotes are valid for 30 days. Orders are confirmed upon receipt of signed digital proof approval and required deposit.</p></div><div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:24px; border-radius:12px;"><h3 style="font-size:18px; font-weight:800; color:#0d1f3c; margin:0 0 8px;">2. Payment Terms</h3><p style="font-size:14px; color:#475569; margin:0;">A 50% deposit is required before production begins. The remaining 50% balance must be paid prior to shipment dispatch.</p></div><div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:24px; border-radius:12px;"><h3 style="font-size:18px; font-weight:800; color:#0d1f3c; margin:0 0 8px;">3. Design & IP</h3><p style="font-size:14px; color:#475569; margin:0;">You retain full ownership of all submitted artwork files. Free design support includes up to 3 complimentary revisions.</p></div></div></section>`;
  }
  if (pageId === '7') {
    return `<section style="padding:60px 40px; background:linear-gradient(135deg,#0d1f3c,#1a2f5a); color:#FFFFFF; text-align:center;"><h1 style="font-size:42px; font-weight:900; margin:0 0 16px; font-family:Outfit,sans-serif;">Refund & Return Policy</h1><p style="font-size:16px; color:rgba(255,255,255,0.8); max-width:650px; margin:0 auto;">Manufacturing defect? Printing error? Damaged in transit? We reprint or refund — no questions asked.</p></section><section style="padding:60px 40px; background:#F8FAFC;"><div style="max-width:900px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:24px;"><div style="background:#FFF; padding:28px; border-radius:16px; border:2px solid #93C5FD; text-align:center;"><h3 style="font-size:22px; font-weight:800; color:#1E3A8A; margin:0 0 8px;">🔄 Full Reprint</h3><p style="font-size:14px; color:#475569; margin:0 0 16px;">Priority front-of-the-line production with free expedited shipping included.</p><div style="background:#EFF6FF; color:#1D4ED8; font-weight:700; padding:10px; border-radius:8px;">Resolution: 5–7 Business Days</div></div><div style="background:#FFF; padding:28px; border-radius:16px; border:2px solid #86EFAC; text-align:center;"><h3 style="font-size:22px; font-weight:800; color:#14532D; margin:0 0 8px;">🎯 Full Refund</h3><p style="font-size:14px; color:#475569; margin:0 0 16px;">Refunded directly to original payment method with zero hidden restocking fees.</p><div style="background:#F0FDF4; color:#15803D; font-weight:700; padding:10px; border-radius:8px;">Resolution: 3–5 Business Days</div></div></div></section>`;
  }
  return `<section style="padding:60px 40px; background:linear-gradient(135deg,#0d1f3c,#1a2f5a); color:#FFFFFF; text-align:center;"><h1 style="font-size:42px; font-weight:900; margin:0 0 16px; font-family:Outfit,sans-serif;">Custom Page</h1><p style="font-size:16px; color:rgba(255,255,255,0.8); max-width:650px; margin:0 auto;">High quality custom packaging solutions engineered for your brand.</p></section>`;
}

  /* ── Load template or page ── */
  useEffect(() => {
    const endpoint = id ? `/api/admin/pages/${id}` : `/api/admin/templates/${type}`;
    fetch(endpoint, { credentials: 'include', cache: 'no-store' })
      .then(r => {
        if (r.status === 401) {
          window.location.href = '/admin/login';
          return null;
        }
        if (!r.ok) {
          if (id) return { title: `Custom Page ${id}`, content: '' };
          throw new Error(`HTTP ${r.status}`);
        }
        return r.json();
      })
      .then(t => {
        if (!t) return;
        if (t.title) setPageTitle(t.title);
        const parsed = parseContent(t.content || '');
        let htmlToLoad = parsed.html;
        let cssToLoad = parsed.css;
        // Empty pages should open as an empty builder, not as the legacy
        // hard-coded demo page. Real starter content is seeded in the DB.
        if (editorRef.current) {
          editorRef.current.setComponents(htmlToLoad);
          // Do not call setStyle('') for inline-style templates. GrapesJS
          // parses those styles into its CSS composer; clearing the composer
          // here makes a valid saved page look like unstyled plain HTML.
          if (cssToLoad) editorRef.current.setStyle(cssToLoad);
          [0, 100, 350, 800].forEach(delay => {
            window.setTimeout(() => {
              if (editorRef.current) {
                if (!id) applySampleDataToCanvas(editorRef.current, previewCategory);
                // Token replacement causes another iframe layout. Reset
                // after the final pass so long pages open at their start.
                if (delay >= 350) resetCanvasScrollToTop(editorRef.current);
              }
            }, delay);
          });
          setTimeout(() => {
            try {
              const frameEl = editorRef.current?.Canvas.getFrameEl();
              const win = frameEl?.contentWindow;
              if (win && win.document && win.document.body) {
                const fullH = Math.max(win.document.body.scrollHeight, win.document.documentElement.scrollHeight, 1200);
                const frameHeight = `${fullH + 120}px`;
                frameEl.style.height = frameHeight;
                frameEl.style.minHeight = frameHeight;
                const wrapper = frameEl.parentElement as HTMLElement | null;
                if (wrapper) {
                  wrapper.style.height = frameHeight;
                  wrapper.style.minHeight = frameHeight;
                }
              }
            } catch {}
          }, 350);
          window.setTimeout(() => {
            if (editorRef.current) resetCanvasScrollToTop(editorRef.current);
          }, 950);
        } else {
          pendingContent.current = { html: htmlToLoad, css: cssToLoad };
        }
        setLoading(false);
      })
      .catch(e => {
        if (id) {
          // A genuinely empty page should remain empty so the builder's
          // "Start Building" overlay is shown instead of stale demo content.
          if (editorRef.current) {
            editorRef.current.setComponents('');
          } else {
            pendingContent.current = { html: '', css: '' };
          }
          setLoading(false);
        } else {
          setLoadError(e.message);
          setLoading(false);
        }
      });
  }, [type, id]);

  const setViewportDevice = useCallback((v: string) => {
    setViewport(v);
    const ed = editorRef.current;
    if (!ed) return;
    const targetDev = v === 'desktop' ? 'Desktop' : v === 'tablet' ? 'Tablet' : 'Mobile';
    try { ed.setDevice(targetDev); } catch { try { ed.setDevice(v); } catch {} }

    const frameEl = ed.Canvas.getFrameEl();
    if (frameEl) {
      if (v === 'mobile') {
        frameEl.style.width = '375px';
        frameEl.style.margin = '20px auto';
        frameEl.style.borderRadius = '16px';
        frameEl.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
      } else if (v === 'tablet') {
        frameEl.style.width = '768px';
        frameEl.style.margin = '20px auto';
        frameEl.style.borderRadius = '12px';
        frameEl.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
      } else {
        frameEl.style.width = '100%';
        frameEl.style.margin = '0';
        frameEl.style.borderRadius = '0';
        frameEl.style.boxShadow = 'none';
      }
    }
  }, []);

  const addSection = useCallback((layout: '1col' | '2col' | '3col' | 'hero' | 'cta') => {
    const ed = editorRef.current;
    if (!ed) return;
    let html = '';
    if (layout === '1col') {
      html = `<section style="padding:60px 40px; background:#ffffff; min-height:220px; border:2px dashed #CBD5E1; border-radius:12px; margin:24px 0;"><div style="text-align:center; color:#64748B;"><h3 style="font-size:22px; font-weight:700; font-family:Inter,sans-serif; margin:0 0 8px; color:#1E293B;">New Single Column Section</h3><p style="font-size:14px; margin:0;">Drag and drop widgets here from the left panel.</p></div></section>`;
    } else if (layout === '2col') {
      html = `<section style="padding:60px 40px; background:#ffffff; margin:24px 0;"><div style="max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:30px;"><div style="padding:30px; background:#F8FAFC; border:2px dashed #CBD5E1; border-radius:12px; text-align:center; color:#64748B; font-weight:600;">Column 1 — Add Widget</div><div style="padding:30px; background:#F8FAFC; border:2px dashed #CBD5E1; border-radius:12px; text-align:center; color:#64748B; font-weight:600;">Column 2 — Add Widget</div></div></section>`;
    } else if (layout === '3col') {
      html = `<section style="padding:60px 40px; background:#ffffff; margin:24px 0;"><div style="max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px;"><div style="padding:24px; background:#F8FAFC; border:2px dashed #CBD5E1; border-radius:10px; text-align:center; color:#64748B; font-weight:600;">Column 1</div><div style="padding:24px; background:#F8FAFC; border:2px dashed #CBD5E1; border-radius:10px; text-align:center; color:#64748B; font-weight:600;">Column 2</div><div style="padding:24px; background:#F8FAFC; border:2px dashed #CBD5E1; border-radius:10px; text-align:center; color:#64748B; font-weight:600;">Column 3</div></div></section>`;
    } else if (layout === 'hero') {
      html = `<section style="padding:80px 40px; background:linear-gradient(135deg,#0B0F19,#1E293B); color:#FFFFFF; text-align:center; border-radius:16px; margin:24px 0;"><h1 style="font-size:36px; font-weight:800; margin:0 0 16px; font-family:Inter,sans-serif;">Custom Hero Section</h1><p style="font-size:16px; color:#94A3B8; max-width:600px; margin:0 auto 24px;">High quality custom printed boxes with custom dimensions and premium finishing.</p><button style="background:#E63329; color:#FFFFFF; border:none; padding:12px 28px; border-radius:8px; font-weight:700; font-size:14px; cursor:pointer;">Get Free Quote →</button></section>`;
    } else if (layout === 'cta') {
      html = `<section style="padding:60px 40px; background:#0F172A; border-radius:16px; text-align:center; color:#FFFFFF; margin:24px 0;"><h2 style="font-size:28px; font-weight:800; margin:0 0 12px;">Need a Custom Box Size?</h2><p style="font-size:15px; color:#94A3B8; margin:0 0 20px;">Tell us what you need and we will create a tailored packaging quote for you.</p><a href="/get-a-quote" style="display:inline-block; background:#E63329; color:#FFFFFF; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:700; font-size:14px;">Request Instant Quote</a></section>`;
    }
     const iframeWindow = ed.Canvas.getFrameEl()?.contentWindow;
     const canvasContainer = getCanvasScrollContainer();
     const previousFrameScrollTop = iframeWindow?.scrollY ?? 0;
     const previousCanvasScrollTop = canvasContainer?.scrollTop ?? 0;
     ed.addComponents(html);
     setTimeout(() => {
       try {
         // Adding a section must not hijack the user's current canvas position.
         // GrapesJS may focus the new component after the model update, so
         // restore the exact scroll position after that focus pass completes.
         restoreCanvasScroll(ed, previousFrameScrollTop, previousCanvasScrollTop);
       } catch {}
     }, 0);
     setTimeout(() => {
       try {
         restoreCanvasScroll(ed, previousFrameScrollTop, previousCanvasScrollTop);
       } catch {}
     }, 120);
  }, []);

  /* ── Apply Motion FX Animation ── */
  const handleApplyAnimation = useCallback((anim: string, duration: string, delay: string, hover: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const selected = ed.getSelected();
    if (!selected) {
      alert('Please click on any element or section in the canvas to apply animation!');
      return;
    }

    if (anim !== 'none') {
      selected.addAttributes({ 'data-aos': anim, 'data-aos-delay': delay });
      selected.addStyle({
        'animation-name': anim,
        'animation-duration': duration,
        'animation-delay': delay,
        'animation-fill-mode': 'both'
      });
    }

    if (hover === 'grow') {
      selected.addStyle({ 'transition': 'transform 0.3s ease', '&:hover': { 'transform': 'scale(1.04)' } });
    } else if (hover === 'lift') {
      selected.addStyle({ 'transition': 'all 0.3s ease', '&:hover': { 'transform': 'translateY(-4px)', 'box-shadow': '0 12px 24px rgba(0,0,0,0.3)' } });
    } else if (hover === 'glow') {
      selected.addStyle({ 'transition': 'all 0.3s ease', '&:hover': { 'box-shadow': '0 0 20px rgba(230,51,41,0.5)', 'border-color': '#E63329' } });
    }

    alert(`Applied "${anim}" entrance animation & "${hover}" hover effect to selected element!`);
  }, []);

  /* ── Apply Column Width Preset ── */
  const handleApplyColumnWidth = useCallback((pct: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const selected = ed.getSelected();
    if (!selected) {
      alert('Please click on any column or element in the canvas first!');
      return;
    }

    selected.addStyle({
      'width': pct,
      'flex-basis': pct,
      'max-width': pct,
      'box-sizing': 'border-box'
    });
  }, []);

  /* ── Apply Elementor Alignment & Flex ── */
  const handleApplyAlign = useCallback((type: 'left' | 'center' | 'right' | 'between' | 'vcenter') => {
    const ed = editorRef.current;
    if (!ed) return;
    const selected = ed.getSelected();
    if (!selected) {
      alert('Please click on any element or container in the canvas first!');
      return;
    }

    if (type === 'left') {
      selected.addStyle({
        'text-align': 'left',
        'margin-left': '0',
        'margin-right': 'auto',
        'justify-content': 'flex-start'
      });
    } else if (type === 'center') {
      selected.addStyle({
        'text-align': 'center',
        'margin-left': 'auto',
        'margin-right': 'auto',
        'justify-content': 'center',
        'align-items': 'center'
      });
    } else if (type === 'right') {
      selected.addStyle({
        'text-align': 'right',
        'margin-left': 'auto',
        'margin-right': '0',
        'justify-content': 'flex-end'
      });
    } else if (type === 'between') {
      selected.addStyle({
        'display': 'flex',
        'justify-content': 'space-between',
        'align-items': 'center'
      });
    } else if (type === 'vcenter') {
      selected.addStyle({
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
      });
    }
  }, []);

  if (loadError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0B0F19', gap: 16, fontFamily: 'Inter, sans-serif' }}>
      <span style={{ fontSize: 36 }}>⚠️</span>
      <span style={{ color: '#F87171', fontSize: 14 }}>{loadError}</span>
      <button onClick={() => nav('/templates')} style={{ color: '#E63329', background: 'none', border: '1px solid #E63329', borderRadius: 8, cursor: 'pointer', fontSize: 13, padding: '8px 16px', fontWeight: 700 }}>← Back to Templates</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0B0F19', fontFamily: 'Inter, sans-serif' }}>
      <style>{GJS_CSS}</style>
      <TopBar title={title} saving={saving} lastSaved={lastSaved} saveError={saveError} viewport={viewport} themeColor={themeColor} previewCategory={previewCategory} isPage={!!id} contentOnly={contentOnly} pageId={id}
        onSave={triggerSave} onBack={() => nav(id ? '/pages' : '/templates')}
        onUndo={() => editorRef.current?.UndoManager.undo()}
        onRedo={() => editorRef.current?.UndoManager.redo()}
        onViewport={setViewportDevice}
        onPreview={() => editorRef.current?.runCommand('preview')}
        onOpenCode={handleOpenCode}
        onOpenHistory={() => setShowHistoryModal(true)}
        onSaveBlock={handleSaveBlock}
        onChangeTheme={setThemeColor}
        onSelectSampleCategory={handleSelectSampleCategory} />

      {/* ── Code Modal ── */}
      {showCodeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '80%', maxWidth: 900, height: '80vh', background: '#0B0F19', border: '1px solid #1E293B', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#101726' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#E63329', fontWeight: 900, fontSize: 16 }}>&lt;/&gt; Live Code Inspector</span>
                <div style={{ display: 'flex', background: '#141A29', borderRadius: 8, padding: 3, gap: 2 }}>
                  <button onClick={() => setCodeTab('html')} style={{ padding: '4px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', background: codeTab === 'html' ? '#E63329' : 'transparent', color: codeTab === 'html' ? '#FFF' : '#94A3B8', fontSize: 11, fontWeight: 700 }}>HTML</button>
                  <button onClick={() => setCodeTab('css')} style={{ padding: '4px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', background: codeTab === 'css' ? '#E63329' : 'transparent', color: codeTab === 'css' ? '#FFF' : '#94A3B8', fontSize: 11, fontWeight: 700 }}>CSS</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => {
                  navigator.clipboard.writeText(codeTab === 'html' ? rawHtml : rawCss);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }} style={{ background: '#1E293B', color: '#FFF', border: '1px solid #334155', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {copied ? '✓ Copied!' : '📋 Copy Code'}
                </button>
                <button onClick={() => {
                  if (editorRef.current) {
                    editorRef.current.setComponents(rawHtml);
                    if (rawCss) editorRef.current.setStyle(rawCss);
                  }
                  setShowCodeModal(false);
                }} style={{ background: '#E63329', color: '#FFF', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                  📥 Apply Changes
                </button>
                <button onClick={() => setShowCodeModal(false)} style={{ background: 'transparent', color: '#94A3B8', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
              </div>
            </div>
            <div style={{ flex: 1, padding: 16, background: '#070A12', overflow: 'hidden' }}>
              <textarea
                value={codeTab === 'html' ? rawHtml : rawCss}
                onChange={e => codeTab === 'html' ? setRawHtml(e.target.value) : setRawCss(e.target.value)}
                style={{ width: '100%', height: '100%', background: 'transparent', color: '#F1F5F9', fontFamily: 'Consolas, monospace', fontSize: 13, border: 'none', outline: 'none', resize: 'none', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Version History Modal ── */}
      {showHistoryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '90%', maxWidth: 500, background: '#0B0F19', border: '1px solid #1E293B', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#101726' }}>
              <span style={{ color: '#FFF', fontWeight: 800, fontSize: 14 }}>📜 Template Revision History</span>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'transparent', color: '#94A3B8', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 16, maxHeight: 400, overflowY: 'auto' }}>
              {revisions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B', fontSize: 13 }}>
                  No previous saves in this session yet. Click "💾 Save Template" to create a revision snapshot!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {revisions.map((rev, idx) => (
                    <div key={rev.id} style={{ background: '#141A29', border: '1px solid #1E293B', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ color: '#FFF', fontSize: 13, fontWeight: 700, display: 'block' }}>Revision #{revisions.length - idx}</span>
                        <span style={{ color: '#94A3B8', fontSize: 11 }}>Saved at {rev.time}</span>
                      </div>
                      <button onClick={() => {
                        if (editorRef.current) {
                          editorRef.current.setComponents(rev.html);
                          if (rev.css) editorRef.current.setStyle(rev.css);
                        }
                        setShowHistoryModal(false);
                      }} style={{ background: '#1E293B', color: '#34D399', border: '1px solid #34D399', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                        ↺ Restore Version
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position: 'absolute', inset: 0, background: '#0B0F19', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E63329', borderRadius: '50%', animation: 'tpl-spin .8s linear infinite' }} />
          <span style={{ color: '#94A3B8', fontSize: 14, fontWeight: 600 }}>Loading template content…</span>
          <style>{`@keyframes tpl-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        {!contentOnly && (
          <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid #1E293B' }}>
            <LeftPanel />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: '#070A12' }}>
          <div ref={containerRef} style={{ width: '100%', flex: 1, minHeight: 0 }} />

          {!loading && !contentOnly && (
            <div style={{
              padding: '10px 20px',
              background: '#0B0F19',
              borderTop: '1px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              zIndex: 10
            }}>
              <span style={{ color: '#94A3B8', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>
                ➕ Elementor Section Builder:
              </span>

              <button
                onClick={() => addSection('1col')}
                style={{ background: '#141A29', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#E63329'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1E293B'}
              >
                <span>📄</span> 1 Column
              </button>

              <button
                onClick={() => addSection('2col')}
                style={{ background: '#141A29', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#E63329'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1E293B'}
              >
                <span>🧱</span> 2 Columns
              </button>

              <button
                onClick={() => addSection('3col')}
                style={{ background: '#141A29', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#E63329'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1E293B'}
              >
                <span>🍱</span> 3 Columns
              </button>

              <button
                onClick={() => addSection('hero')}
                style={{ background: 'linear-gradient(135deg, #E63329, #C1271E)', border: 'none', borderRadius: 8, color: '#FFFFFF', padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(230,51,41,0.3)' }}
              >
                <span>🚀</span> Add Hero Banner
              </button>
            </div>
          )}

          {!loading && isEmpty && !contentOnly && (
            <EmptyOverlay onAdd={() => addSection('1col')} />
          )}
        </div>
        <div style={{ width: contentOnly ? 300 : 290, flexShrink: 0, borderLeft: '1px solid #1E293B' }}>
          {contentOnly
            ? <ContentOnlyPanel component={selectedComponent} />
            : <RightPanel onApplyAnimation={handleApplyAnimation} onApplyWidth={handleApplyColumnWidth} onApplyAlign={handleApplyAlign} />}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   GRAPESJS EXECUTIVE WEBFLOW DARK THEME CSS
   ══════════════════════════════════════════ */
const GJS_CSS = `
  :root {
    --gjs-main-color: #0B0F19;
    --gjs-primary-color: #0B0F19;
    --gjs-secondary-color: #94A3B8;
    --gjs-tertiary-color: #E63329;
    --gjs-quaternary-color: #FFB800;
    --gjs-font-color: #E2E8F0;
    --gjs-font-color-active: #ffffff;
  }
  .gjs-editor { background: #070A12 !important; font-family: "Inter", system-ui, sans-serif !important; }
  .gjs-cv-canvas { background: #070A12 !important; display: flex !important; justify-content: center !important; overflow: auto !important; overflow-anchor: none !important; padding: 20px 0 !important; }
  .gjs-frame-wrapper { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; margin: 0 auto !important; box-shadow: none !important; border: none !important; height: auto !important; min-height: 100% !important; overflow-anchor: none !important; }
  .gjs-frame { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; display: block !important; }

  /* ── 1. HIDE NATIVE DUPLICATE TOP PANELS COMPLETELY ── */
  .gjs-pn-commands, 
  .gjs-pn-options, 
  .gjs-pn-views-container, 
  .gjs-pn-devices-c,
  .gjs-pn-views {
    display: none !important;
    height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    overflow: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* ── 2. Left Sidebar Blocks Styling (4 Widgets per Line Grid) ── */
  #tpl-blocks, #gjs-blocks { background: #0B0F19 !important; padding-bottom: 16px; }
  .gjs-block-category { border: none !important; margin-bottom: 8px; background: #0B0F19 !important; }
  .gjs-block-category__title { background: #101726 !important; color: #94A3B8 !important; font-size: 11px !important; font-weight: 800 !important; letter-spacing: 0.1em !important; text-transform: uppercase !important; padding: 10px 12px !important; border-bottom: 1px solid #1E293B !important; border-top: 1px solid #1E293B !important; }

  .gjs-block-category .gjs-blocks-c,
  #tpl-blocks .gjs-blocks-c, #gjs-blocks .gjs-blocks-c { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 6px !important; padding: 8px 10px !important; }

  .gjs-block { background: #141A29 !important; border: 1px solid #1E293B !important; border-radius: 10px !important; padding: 8px 4px !important; min-height: 56px !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; gap: 4px !important; color: #E2E8F0 !important; cursor: grab !important; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; width: 100% !important; box-sizing: border-box !important; }
  .gjs-block:hover { background: #1A2338 !important; border-color: rgba(230, 51, 41, 0.7) !important; color: #FFFFFF !important; transform: translateY(-2px) !important; box-shadow: 0 6px 16px rgba(230, 51, 41, 0.2) !important; }

  .gjs-block__media { width: 24px !important; height: 24px !important; flex-shrink: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: transparent !important; color: #E63329 !important; border: none !important; }
  .gjs-block__media svg { width: 18px !important; height: 18px !important; stroke: #E63329 !important; fill: none !important; }
  .gjs-block:hover .gjs-block__media { color: #FFFFFF !important; }
  .gjs-block:hover .gjs-block__media svg { stroke: #FFFFFF !important; }
  .gjs-block-label { font-size: 9.5px !important; font-weight: 700 !important; color: #94A3B8 !important; text-align: center !important; margin: 0 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; max-width: 100% !important; line-height: 1.1 !important; }
  .gjs-block:hover .gjs-block-label { color: #FFFFFF !important; }

  /* ── 3. Right Panel Style Manager & Trait Controls (Webflow Style) ── */
  #tpl-styles, #tpl-traits, #tpl-selectors, #gjs-styles, #gjs-traits, #gjs-selectors { background: #0B0F19 !important; }
  .gjs-sm-sectors { background: #0B0F19 !important; }
  .gjs-sm-sector { background: #0B0F19 !important; border-bottom: 1px solid #1E293B !important; margin: 0 !important; }
  .gjs-sm-sector__title { background: #101726 !important; color: #F1F5F9 !important; font-size: 11px !important; font-weight: 800 !important; letter-spacing: 0.1em !important; text-transform: uppercase !important; padding: 12px 14px !important; border-bottom: 1px solid #1E293B !important; cursor: pointer !important; }
  .gjs-sm-sector__title:hover { background: #162032 !important; color: #FFFFFF !important; }

  .gjs-sm-properties { padding: 12px 14px !important; background: #0B0F19 !important; }
  .gjs-sm-property { margin-bottom: 12px !important; border-bottom: 1px dashed rgba(255,255,255,0.05) !important; padding-bottom: 8px !important; }
  .gjs-sm-label { color: #94A3B8 !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; margin-bottom: 4px !important; }

  .gjs-sm-field, .gjs-field, .gjs-field-integer, .gjs-field-select, .gjs-field-color { background: #141A29 !important; border: 1px solid #1E293B !important; border-radius: 8px !important; color: #F8FAFC !important; font-size: 12px !important; box-shadow: none !important; }
  .gjs-sm-field:focus-within, .gjs-field:focus-within { border-color: #E63329 !important; box-shadow: 0 0 0 2px rgba(230,51,41,0.2) !important; }
  .gjs-field input, .gjs-field select, .gjs-sm-field input, .gjs-sm-field select { color: #F8FAFC !important; background: transparent !important; border: none !important; outline: none !important; font-size: 12px !important; font-weight: 600 !important; }
  .gjs-field select option, .gjs-sm-field select option { background: #141A29 !important; color: #F8FAFC !important; }

  .gjs-sm-composite { background: #0B0F19 !important; }
  .gjs-field-integer { background: #141A29 !important; border: 1px solid #1E293B !important; border-radius: 8px !important; color: #F8FAFC !important; }
  .gjs-field-unit { color: #64748B !important; font-weight: 700 !important; font-size: 10px !important; }
  .gjs-field-arrows { color: #94A3B8 !important; }

  .gjs-clm-tags { background: #0B0F19 !important; padding: 12px !important; border-bottom: 1px solid #1E293B !important; }
  .gjs-clm-tag { background: #1E293B !important; color: #F8FAFC !important; border-radius: 6px !important; padding: 4px 8px !important; border: 1px solid rgba(255,255,255,0.08) !important; font-size: 11px !important; font-weight: 600 !important; }
  .gjs-clm-select { background: #141A29 !important; border: 1px solid #1E293B !important; color: #F8FAFC !important; border-radius: 8px !important; }

  .gjs-trt-traits { background: #0B0F19 !important; padding: 14px !important; }
  .gjs-trt-trait { margin-bottom: 14px !important; }
  .gjs-trt-trait__label { color: #94A3B8 !important; font-size: 11px !important; font-weight: 700 !important; margin-bottom: 4px !important; }

  .gjs-layer { background: #0B0F19 !important; color: #CBD5E1 !important; border-bottom: 1px solid #1E293B !important; font-size: 12px !important; font-weight: 600 !important; }
  .gjs-layer:hover { background: #141A29 !important; color: #FFFFFF !important; }
  .gjs-layer-active { background: #1E293B !important; color: #FFFFFF !important; font-weight: 700 !important; }

  /* ── 4. Custom Dark Scrollbars ── */
  ::-webkit-scrollbar { width: 6px !important; height: 6px !important; }
  ::-webkit-scrollbar-track { background: #0B0F19 !important; }
  ::-webkit-scrollbar-thumb { background: #1E293B !important; border-radius: 3px !important; }
  ::-webkit-scrollbar-thumb:hover { background: #334155 !important; }

  /* ── 5. Elementor Drag Resizer Knobs ── */
  .gjs-resizer-h {
    background: #E63329 !important;
    border: 2px solid #FFFFFF !important;
    width: 10px !important;
    height: 10px !important;
    border-radius: 50% !important;
    box-shadow: 0 0 8px rgba(230, 51, 41, 0.8) !important;
    z-index: 100 !important;
  }
  .gjs-resizer-c {
    border: 1.5px dashed #E63329 !important;
  }
`;
