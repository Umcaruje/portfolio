const sections={editing:{name:'Video Editing',number:'01',short:'Editing',description:'Long stories. Short attention spans. Every cut with a purpose.',theme:'edit'},vfx:{name:'VFX & Motion',number:'02',short:'VFX & Motion',description:'From the invisible fix to the impossible frame. Visual effects, cleanup and motion design.',theme:'vfx'},music:{name:'Music Production',number:'03',short:'Music',description:'Original compositions, production and sound. Made to be heard. Made to be felt.',theme:'music'},ai:{name:'AI Video',number:'04',short:'AI Video',description:'New tools. The same eye for a good story. AI-assisted imagery, shaped through editing and VFX.',theme:'ai'}};
let data,activeSection='home',lastFocus,modalOrigin='home';const main=document.querySelector('main'),modal=document.querySelector('dialog');const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function linkifyDescription(value) {
  const description = String(value ?? '');
  const links = /https?:\/\/[^\s<>"']+/gi;
  let html = '';
  let offset = 0;
  for (const match of description.matchAll(links)) {
    let url = match[0].replace(/[.,!?;:]+$/, '');
    while (url.endsWith(')') && url.split(')').length > url.split('(').length) {
      url = url.slice(0, -1);
    }
    try {
      new URL(url);
    } catch {
      continue;
    }
    html += esc(description.slice(offset, match.index));
    html += '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"><u>' + esc(url) + '</u></a>';
    offset = match.index + url.length;
  }
  return (html + esc(description.slice(offset))).replace(/\r\n?|\n/g, '<br>');
}
function validAsset(value){return typeof value==='string'&&(/^(assets\/|https:\/\/)/.test(value))?value:''}
function youtubeId(url) {
  const [kind, pathId] = url.pathname.split('/').filter(Boolean);
  const hosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];
  let id;
  if (url.hostname === 'youtu.be') id = kind;
  else if (hosts.includes(url.hostname)) {
    if (kind === 'watch') id = url.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v'].includes(kind)) id = pathId;
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id ?? '') ? id : '';
}
function instagramPostUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname)) return '';
    const post = /^\/(reel|p|tv)\/([\w-]+)(?:\/embed)?\/?$/.exec(url.pathname);
    return post ? 'https://www.instagram.com/' + post[1] + '/' + post[2] + '/' : '';
  } catch {
    return '';
  }
}
function embedUrl(value) {
  try {
    const url = new URL(value);
    const id = youtubeId(url);
    if (id) return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0';
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const parts = url.pathname.split('/').filter(Boolean);
      const videoId = parts.find(part => /^\d+$/.test(part));
      if (videoId) {
        const hash = url.searchParams.get('h') || parts[parts.indexOf(videoId) + 1];
        return 'https://player.vimeo.com/video/' + videoId + (hash ? '?h=' + encodeURIComponent(hash) : '');
      }
    }
  } catch {}
  return null;
}
function projectThumbnail(project, quality = 'maxresdefault') {
  const custom = validAsset(project.thumbnail);
  if (custom) return custom;
  try {
    const id = youtubeId(new URL(project.videoUrl));
    return id ? 'https://i.ytimg.com/vi/' + id + '/' + quality + '.jpg' : '';
  } catch {
    return '';
  }
}
function useThumbnailFallback(image) {
  const fallback = image.dataset.fallback;
  if (fallback) {
    delete image.dataset.fallback;
    image.src = fallback;
    return;
  }
  image.nextElementSibling.replaceWith(image.nextElementSibling.content);
  image.remove();
}
main.addEventListener('error', ({ target: image }) => {
  if (image.matches('.thumbnail > img')) useThumbnailFallback(image);
}, true);
main.addEventListener('load', ({ target: image }) => {
  if (image.matches('.thumbnail > img[data-fallback]') && image.naturalWidth <= 120) {
    useThumbnailFallback(image);
  }
}, true);
function artwork(key) {
  const waveform = key === 'music' ? `<svg viewBox="0 0 800 350" preserveAspectRatio="none" fill="none" aria-hidden="true">
    <path vector-effect="non-scaling-stroke" d="M0 176 C16 175 25 167 37 175 S58 193 71 174 S91 149 104 180 S125 210 141 173 S161 106 179 179 S199 242 216 171 S237 133 252 181 S268 211 283 167 S303 63 323 177 S342 293 362 170 S381 128 399 181 S419 231 434 173 S452 97 470 169 S490 254 512 174 S531 46 549 175 S569 306 590 168 S609 93 626 175 S647 230 664 168 S681 126 698 175 S717 211 733 174 S752 150 768 175 S786 191 800 175"/>
  </svg>` : '';
  return `<div class="art art-${sections[key].theme}" aria-hidden="true">${waveform}</div>`;
}
function visibleSections() {
  return Object.entries(sections).filter(([key]) =>
    key !== 'ai' || data.projects.some(project => project.section === 'ai')
  );
}
function home(){return `<section class="intro"><div><h1>Uroš Maravić</h1><p class="intro-copy">VIDEO EDITOR / VFX ARTIST / MUSIC PRODUCER</p></div></section><section class="quadrants" aria-label="Explore work">${visibleSections().map(([k,s])=>`<a class="tile tile-${s.theme}" href="#${k}">${artwork(k)}<div class="tile-bottom"><h2>${s.name}</h2></div><span class="arrow" aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5h14v14"/></svg></span></a>`).join('')}</section>`}
function card(p){const img=projectThumbnail(p), fallback=projectThumbnail(p, 'hqdefault');return `<button class="project-card" data-project="${esc(p.id)}" aria-label="Open ${esc(p.title)}"><div class="thumbnail theme-${esc(p.theme||'neutral')}">${img?`<img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy"${fallback && fallback !== img ? ` data-fallback="${esc(fallback)}"` : ''}>`:''}${img?'<template>':''}<span class="draft-label">${p.placeholder?'Preview slot':'Selected work'}</span><span class="placeholder-word">${esc(p.coverText||p.title)}</span>${img?'</template>':''}<span class="play" aria-hidden="true">${p.videoUrl?'▶':'<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>'}</span></div><div class="card-meta"><div><h3>${esc(p.title)}</h3>${!p.featured&&p.role?.trim()?`<p>${esc(p.role)}</p>`:''}</div><span><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></span></div></button>`}
function grid(items,cls=''){return items.length?`<div class="grid ${cls}">${items.map(card).join('')}</div>`:'<p class="empty">More work coming soon.</p>'}
function section(key){const s=sections[key],items=data.projects.filter(p=>p.section===key);let body='';if(key==='editing'){for(const fmt of ['Long-form','Short-form'])body+=`<h2 class="group-title">${fmt}</h2>`+grid(items.filter(p=>p.format===fmt),fmt==='Short-form'?'featured portrait-grid':'featured');}else if(key==='music'){const sc=data.soundcloudEmbedUrl;const allowed=typeof sc==='string'&&sc.startsWith('https://w.soundcloud.com/player/');body=`<h2 class="group-title">Selected compositions </h2><div class="soundcloud-slot">${allowed?`<iframe title="Selected compositions on SoundCloud" loading="lazy" allow="autoplay" src="${esc(sc)}"></iframe>`:'<strong>Listen closely.</strong><div><p>A place for original compositions and productions.</p><p class="slot-note">Preview slot — your SoundCloud playlist will appear here.</p></div>'}</div><h2 class="group-title">Music in picture</h2>`+grid(items);}else{const reels=items.filter(p=>p.featured);const selected=items.filter(p=>!p.featured);body=(reels.length||key!=='ai'?`<h2 class="group-title">${key==='ai'?'AI showreel':'The showreels'}</h2>`+grid(reels,reels.length===1?'single':'featured'):'')+(selected.length||key!=='ai'?`<div class="group-title"><h2 style="font:inherit;margin:0">Selected projects</h2></div>`+grid(selected):'');}return `<section class="section-head"><div class="section-heading"><h1>${s.name}</h1></div></section><nav class="section-tabs" aria-label="Disciplines">${visibleSections().map(([k,v])=>`<a href="#${k}" ${k===key?'aria-current="page"':''} class="${k===key?'active':''}">${v.short}</a>`).join('')}</nav><section class="content">${body}</section>`}
function render(view){activeSection=view;document.body.classList.toggle('home-view',view==='home');main.innerHTML=sections[view]?section(view):home();document.title=`${sections[view]?.name||'Selected work'} — Uroš Maravić`;main.querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>{lastFocus=b;modalOrigin=activeSection;replaceRoute('project/'+encodeURIComponent(b.dataset.project))});}
let currentProject;
function showProject(p){currentProject=p;const idx=data.projects.filter(x=>x.section===p.section).findIndex(x=>x.id===p.id),total=data.projects.filter(x=>x.section===p.section).length;document.querySelector('#modal-category').textContent=sections[p.section].name;const instagram=instagramPostUrl(p.videoUrl);const url=embedUrl(p.videoUrl);let media=instagram?`<iframe src="${esc(instagram)}embed/" title="${esc(p.title)} on Instagram" allow="encrypted-media; fullscreen" allowfullscreen></iframe><a href="${esc(instagram)}" target="_blank" rel="noopener noreferrer">Watch on Instagram ↗</a>`:url?`<iframe src="${esc(url)}" title="${esc(p.title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`:validAsset(p.videoUrl)&&/\.mp4(?:\?|$)/i.test(p.videoUrl)?`<video controls playsinline src="${esc(p.videoUrl)}"></video>`:validAsset(p.thumbnail)?`<img src="${esc(p.thumbnail)}" alt="${esc(p.title)}">`:`<strong>${esc(p.coverText||p.title)}</strong><p>${p.placeholder?'Preview slot — add your video and thumbnail to make this project yours.':'Video coming soon.'}</p>`;document.querySelector('#modal-body').innerHTML=`<div class="modal-media${instagram?' modal-media-instagram':''}">${media}</div><div class="modal-info"><div><h2 id="modal-title">${esc(p.title)}</h2><p>${linkifyDescription(p.description)}</p></div>${p.role?.trim()||p.credits?.trim()?`<dl>${p.role?.trim()?`<dt>Role</dt><dd>${esc(p.role)}</dd>`:''}${p.credits?.trim()?`<dt>Credits</dt><dd>${esc(p.credits)}</dd>`:''}</dl>`:''}</div>${p.images?.length?`<div class="extra-images">${p.images.map(i=>validAsset(i)?`<img src="${esc(i)}" alt="${esc(p.title)} — project breakdown" loading="lazy">`:'').join('')}</div>`:''}`;document.querySelector('#project-index').textContent=`${String(idx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;document.querySelector('#prev-project').disabled=total<2;document.querySelector('#next-project').disabled=total<2;if(!modal.open){modal.showModal();document.body.style.overflow='hidden';document.querySelector('#close-modal').focus()}modal.scrollTop=0;}
function replaceRoute(hash){history.replaceState(null,'','#'+hash);route()}
function assignProjectSlugs(projects) {
  const used = new Set(projects.map(project => project.id).filter(Boolean));
  return projects.map(project => {
    if (project.id) return project;

    const base = project.title.normalize('NFKD').toLowerCase()
      .replace(/\p{M}/gu, '').replace(/đ/g, 'dj')
      .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || project.section;
    let id = base;
    for (let suffix = 2; used.has(id); suffix++) id = base + '-' + suffix;

    used.add(id);
    return { ...project, id };
  });
}
function closeProject(){replaceRoute(sections[modalOrigin]?modalOrigin:currentProject?.section||'home')}
function route(){let hash;try{hash=decodeURIComponent(location.hash.slice(1))||'home'}catch{hash='home'};if(hash.startsWith('project/')){const p=data.projects.find(p=>p.id===hash.slice(8));if(p){if(!main.innerHTML){modalOrigin=p.section;render(p.section)}showProject(p);return}hash='home'}if(hash!=='home'&&!visibleSections().some(([key])=>key===hash)){hash='home';history.replaceState(null,'','#home')}const wasOpen=modal.open;if(wasOpen){modal.close();document.querySelector('#modal-body').innerHTML='';document.body.style.overflow=''}const changed=activeSection!==hash;if(changed||!main.innerHTML){render(hash);scrollTo(0,0)}if(wasOpen){if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});else main.focus({preventScroll:true})}else if(changed)main.focus({preventScroll:true});}
document.querySelector('#close-modal').onclick=closeProject;modal.addEventListener('cancel',e=>{e.preventDefault();closeProject()});modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject()}});function next(step){const list=data.projects.filter(p=>p.section===currentProject.section),idx=list.findIndex(p=>p.id===currentProject.id);replaceRoute('project/'+encodeURIComponent(list[(idx+step+list.length)%list.length].id))}document.querySelector('#prev-project').onclick=()=>next(-1);document.querySelector('#next-project').onclick=()=>next(1);document.querySelector('#year').textContent=new Date().getFullYear();Promise.all(Object.keys(sections).map(async section => {
  const response = await fetch(section + '.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Unable to load ' + section);
  return { section, content: await response.json() };
})).then(pages => ({
  projects: pages.flatMap(({ section, content }) => (content.projects ?? []).map(project => ({ ...project, section, format: project.format || ({ editing: 'Long-form', vfx: 'VFX' })[section] || '' }))),
  soundcloudEmbedUrl: pages.find(page => page.section === 'music').content.soundcloudEmbedUrl
})).then(d=>{data={...d,projects:assignProjectSlugs(d.projects.filter(p=>p.section!=='ai'||!p.placeholder||p.videoUrl?.trim()))};route();window.addEventListener('hashchange',route)}).catch(()=>{main.innerHTML='<section class="content"><h1>Unable to load projects.</h1><p>Please refresh the page or <a href="mailto:uros.maravic@gmail.com">get in touch</a>.</p></section>'});
