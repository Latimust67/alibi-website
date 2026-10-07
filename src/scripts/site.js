// Optional enhancements. Every page, picture and action is useful without JavaScript.
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];

const toggle=$('.a-nav-toggle'), nav=$('#a-site-nav');
if(toggle&&nav){
 const setOpen=(open,returnFocus=false)=>{nav.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');document.documentElement.classList.toggle('a-nav-open',open);if(!open&&returnFocus)toggle.focus();};
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';setOpen(open);if(open)nav.querySelector('a')?.focus({preventScroll:true});});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open'))setOpen(false,true);});
 nav.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false);});
 document.addEventListener('click',e=>{if(nav.classList.contains('is-open')&&!e.target.closest('[data-header]'))setOpen(false);});
 nav.addEventListener('keydown',e=>{if(e.key==='Tab'&&!e.shiftKey&&document.activeElement===nav.lastElementChild)setOpen(false);});
 matchMedia('(min-width: 860px)').addEventListener('change',()=>setOpen(false));
}

for(const region of $$('[data-seats]')){
 const buttons=$$('[data-seat]',region),panels=$$('[data-seat-panel]',region);let activeAnimation;
 const choose=i=>{activeAnimation?.cancel();buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));panels.forEach((p,j)=>{const on=i===j;p.classList.toggle('is-active',on);p.inert=!on;p.setAttribute('aria-hidden',String(!on));});};
 buttons.forEach((button,i)=>button.addEventListener('click',()=>choose(i)));
 region.classList.add('seats-enhanced');choose(Number(region.dataset.seatDefault)||0);reduce.addEventListener('change',()=>activeAnimation?.cancel());
}

// Calendar days use the public house's time zone, never the visitor's zone.
// Static HTML names its build date; only this current-date pass says “Today”.
function refreshDateSensitiveContent(){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
 const today=`${parts.year}-${parts.month}-${parts.day}`;
 const fresh=(checked,days=14)=>{const age=(Date.parse(today)-Date.parse(checked))/864e5;return Number.isFinite(age)&&age>=0&&age<=Number(days);};
 const time=m=>`${Math.floor(m/60)%12||12}${m%60?':'+String(m%60).padStart(2,'0'):''}${m>=720?'pm':'am'}`;
 for(const fact of $$('[data-current-fact]'))fact.hidden=!fresh(fact.dataset.checked,fact.dataset.staleDays);
 for(const strip of $$('[data-sf-today]')){
  try{
   const status=$('[data-sf-status]',strip),closures=JSON.parse(strip.dataset.closures||'[]'),hours=JSON.parse(strip.dataset.hours||'{}');
   const closure=closures.find(c=>c.from<=today&&today<=c.to);
   const h=hours[parts.weekday];
   strip.classList.toggle('is-closed',!!closure&&fresh(strip.dataset.checked,strip.dataset.staleDays));
   if(!fresh(strip.dataset.checked,strip.dataset.staleDays)||(!closure&&!h)){
    const link=document.createElement('a');link.href=strip.dataset.hoursUrl||'https://alibialeworks.com/incline-public-house/';link.textContent='Check today’s hours';status.replaceChildren(link);
   }else if(closure)status.textContent=`Closed today${closure.reason?` for ${closure.reason}`:''}`;
   else status.textContent=`Today: ${time(h[0])}–${time(h[1])}`;
  }catch{/* Dated server-rendered hours and the official link remain available. */}
 }
 for(const notice of $$('[data-closure-notice]')){
  notice.hidden=!fresh(notice.dataset.checked,notice.dataset.staleDays)||today>notice.dataset.to||(Date.parse(notice.dataset.from)-Date.parse(today))/864e5>14;
 }
 for(const table of $$('[data-hours]')){
  const closures=JSON.parse(table.dataset.closures||'[]'),closed=closures.some(c=>c.from<=today&&today<=c.to);
  for(const row of $$('[data-day]',table)){
   const isToday=row.dataset.day===parts.weekday;row.classList.toggle('is-today',isToday&&!table.hidden);
   $('td',row).textContent=closed&&isToday?'Closed today':row.dataset.routineHours;
  }
 }
 for(const list of $$('[data-event-list]')){
  const calendar=list.closest('[data-calendar]'),meta=calendar||list;
  const stale=!fresh(meta.dataset.checked,meta.dataset.staleDays);
  let count=0;
  for(const item of $$('[data-event]',list)){
   const ended=(item.dataset.end||item.dataset.date)<today||(item.dataset.endsAt&&Date.now()>=Date.parse(item.dataset.endsAt)),extra=list.dataset.limit&&count>=Number(list.dataset.limit);
   item.hidden=stale||ended||!!extra||!fresh(item.dataset.checked,meta.dataset.staleDays);if(!item.hidden)count++;
  }
  for(const month of $$('[data-month]',list))month.hidden=!$$('[data-event]',month).some(e=>!e.hidden);
  if(calendar){
   list.hidden=stale;
   const old=$('[data-events-stale]',calendar),empty=$('[data-events-empty]',calendar),foot=$('[data-calendar-foot]',calendar);
   if(old)old.hidden=!stale;if(empty)empty.hidden=stale||count>0;if(foot)foot.hidden=stale;
  }else{
   const fallback=$('.event-fallback',list);if(fallback)fallback.hidden=count>0;
  }
 }
 for(const notice of $$('[data-special-notice]')){
  const list=notice.parentElement.querySelector('[data-event-list]');
  if(!list)continue;
  const stale=!fresh(list.dataset.checked,list.dataset.staleDays);
  const alreadyShown=$$('[data-event]',list).some(item=>item.dataset.key===notice.dataset.key&&!item.hidden);
  notice.hidden=stale||notice.dataset.date<today||alreadyShown;
 }
}
refreshDateSensitiveContent();
window.addEventListener('pageshow',refreshDateSensitiveContent);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDateSensitiveContent();});
// A tab left open overnight must not keep yesterday's label or an expired listing.
setInterval(refreshDateSensitiveContent,60000);
