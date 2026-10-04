import {readFileSync} from 'node:fs';
import {esc} from './components.mjs';
export const houseCopy=JSON.parse(readFileSync(new URL('../data/house-copy.json',import.meta.url),'utf8'));
export function houseLink(href,label,{filled=false,external=false}={}){return `<a class="house-link${filled?' house-link-filled':''}" href="${esc(href)}"${external?' target="_blank" rel="noopener"':''}>${esc(label)}<span aria-hidden="true">↗</span>${external?'<span class="sr-only"> (opens in a new tab)</span>':''}</a>`;}
export function closure(today){const visible=today>='2026-09-21'&&today<='2026-10-06';return `<aside class="house-closure" data-closure-notice data-from="2026-10-05" data-to="2026-10-06" data-checked="2026-10-04" data-stale-days="14"${visible?'':' hidden'}><span>${houseCopy.closure.text}</span><a href="${houseCopy.closure.url}" target="_blank" rel="noopener">${houseCopy.closure.link} ↗<span class="sr-only"> (opens in a new tab)</span></a></aside>`;}
export const routesHead=()=>'<link rel="stylesheet" href="/assets/house-routes.css">';
