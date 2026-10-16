'use strict';
const salons=JSON.parse(document.getElementById('salon-data').textContent);
const hairs=[
  {name:'Ondas laterales',type:'suelto',group:'Suelto',sheet:'beauty-classics',row:0,ratio:2/3},
  {name:'Moño bajo con textura',type:'recogido',group:'Recogido',sheet:'beauty-classics',row:1,ratio:2/3},
  {name:'Semirrecogido con ondas',type:'suelto',group:'Semirrecogido',sheet:'beauty-classics',row:2,ratio:2/3},
  {name:'Coleta alta con ondas',type:'coleta',group:'Coleta',sheet:'beauty-ponytails',row:0,ratio:1145/1374},
  {name:'Coleta baja pulida',type:'coleta',group:'Coleta',sheet:'beauty-ponytails',row:1,ratio:1145/1374},
  {name:'Trenza lateral suelta',type:'trenza',group:'Trenza',sheet:'beauty-ponytails',row:2,ratio:1145/1374},
  {name:'Recogido francés',type:'recogido',group:'Recogido',sheet:'beauty-updos',row:0,ratio:2/3},
  {name:'Moño alto suave',type:'recogido',group:'Recogido',sheet:'beauty-updos',row:1,ratio:2/3},
  {name:'Moño bajo trenzado',type:'trenza',group:'Recogido con trenza',sheet:'beauty-updos',row:2,ratio:2/3}
];
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let hairFilter='all',currentHair=0;
const views=h=>'<div class="hair-views" style="--photo-aspect:'+h.ratio+'">'+['Frente','Perfil','Atrás'].map((label,col)=>'<span class="hair-view" role="img" aria-label="'+escapeHTML(h.name+' · '+label)+'" style="background-image:url(assets/'+h.sheet+'.webp);background-position:'+(col*50)+'% '+(h.row*50)+'%"></span>').join('')+'</div><div class="angle-labels"><span>Frente</span><span>Perfil</span><span>Atrás</span></div>';
function renderHair(){
  const visible=hairs.map((hair,index)=>({hair,index})).filter(({hair})=>hairFilter==='all'||hair.type===hairFilter||(hairFilter==='recogido'&&hair.name==='Moño bajo trenzado'));
  $('hairGrid').innerHTML=visible.map(({hair:h,index})=>'<article class="hair-card"><div class="hair-title"><h3>'+escapeHTML(h.name)+'</h3><span>'+h.group+'</span></div><button class="hair-photo-button" data-open-hair="'+index+'" aria-label="Ampliar las tres vistas de '+escapeHTML(h.name)+'">'+views(h)+'</button><div class="hair-bottom"><span>Frente · perfil · atrás</span><button data-open-hair="'+index+'">Ver en grande ↗</button></div></article>').join('');
  $('photoCount').textContent=visible.length+' peinados · '+visible.length*3+' vistas';
}
function showHair(index){
  currentHair=index;const hair=hairs[index];
  $('hairDialogTitle').textContent=hair.name;$('hairDialogViews').innerHTML=views(hair);$('hairSheetLink').href='assets/'+hair.sheet+'.webp';
  $('previousHair').disabled=index===0;$('nextHair').disabled=index===hairs.length-1;
  if(!$('hairDialog').open)$('hairDialog').showModal();
}
function renderSalons(){
  const query=normalize($('searchSalon').value),zone=$('district').value;
  const visible=salons.filter(s=>(zone==='all'||s.zone===zone)&&normalize([s.name,s.address,...s.services,s.zone==='domicilio'?'a domicilio':''].join(' ')).includes(query));
  if($('sortBy').value==='alpha')visible.sort((a,b)=>a.name.localeCompare(b.name,'es'));
  $('salonCounter').textContent=visible.length+' opciones';
  $('salonGrid').innerHTML=visible.map(s=>{
    const route='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent('Dardignac 28, Recoleta, Santiago, Chile')+'&destination='+encodeURIComponent(s.address)+'&travelmode=driving';
    const inquiry='Hola, busco maquillaje y peinado como invitada a un matrimonio el viernes 6 de noviembre de 2026. ¿Tienen disponibilidad? Quisiera confirmar peinado, duración y condiciones de reserva.';
    const whatsapp='https://wa.me/'+s.phone+'?text='+encodeURIComponent(inquiry);
    const exactAddress=/\d/.test(s.address);
    const zones={recoleta:'Recoleta / Bellavista',centro:'Santiago Centro',providencia:'Providencia',domicilio:'Estudio o a domicilio · coordinar'};
    return '<article class="salon-card"><span class="salon-area">'+zones[s.zone]+'</span><h3>'+escapeHTML(s.name)+'</h3><ul class="salon-services">'+s.services.map(text=>'<li>'+escapeHTML(text)+'</li>').join('')+'</ul><div class="salon-address"><small>'+(exactAddress?'Dirección':'Ubicación / cobertura')+'</small><p>'+escapeHTML(s.address)+'</p></div><div class="salon-actions"><a class="button primary" href="'+escapeHTML(s.booking)+'" target="_blank" rel="noopener">Agenda / trabajos ↗</a>'+(s.phone?'<a class="button" href="'+escapeHTML(whatsapp)+'" target="_blank" rel="noopener">WhatsApp ↗</a>':'')+'</div>'+(exactAddress?'<a class="salon-source" href="'+escapeHTML(route)+'" target="_blank" rel="noopener">Ruta, km y tiempo en auto ↗</a>':'<span class="salon-note">Coordinar dirección o atención en el alojamiento.</span>')+'</article>';
  }).join('')||'<p class="empty">No hay coincidencias. Probá otra zona o búsqueda.</p>';
}
document.querySelectorAll('[data-hair-filter]').forEach(button=>button.addEventListener('click',()=>{
  hairFilter=button.dataset.hairFilter;document.querySelectorAll('[data-hair-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderHair();
}));
document.addEventListener('click',event=>{const button=event.target.closest('[data-open-hair]');if(button)showHair(Number(button.dataset.openHair))});
$('closeHairDialog').addEventListener('click',()=>$('hairDialog').close());
$('hairDialog').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close()});
$('previousHair').addEventListener('click',()=>showHair(currentHair-1));
$('nextHair').addEventListener('click',()=>showHair(currentHair+1));
document.addEventListener('keydown',event=>{if(!$('hairDialog').open)return;if(event.key==='ArrowLeft'&&currentHair>0)showHair(currentHair-1);if(event.key==='ArrowRight'&&currentHair<hairs.length-1)showHair(currentHair+1)});
$('searchSalon').addEventListener('input',renderSalons);$('district').addEventListener('change',renderSalons);$('sortBy').addEventListener('change',renderSalons);
renderHair();renderSalons();
