const DAYS=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
let activeDay=DAYS[(new Date().getDay()+6)%7];
let meals=JSON.parse(localStorage.getItem('di_meals')||'null')||[
{day:'Senin',time:'08:00',type:'Keluarga',name:'Nasi Goreng Ayam'},
{day:'Senin',time:'08:30',type:'MPASI',name:'Bubur Ayam Wortel'},
{day:'Senin',time:'12:00',type:'Keluarga',name:'Sop Sapi'}];
let shop=JSON.parse(localStorage.getItem('di_shop_v5')||'null')||[
{name:'Ayam fillet 500 g',done:false,price:0},
{name:'Wortel 4 buah',done:false,price:0},
{name:'Kentang 1 kg',done:true,price:18000}
];
let reqs=JSON.parse(localStorage.getItem('di_reqs')||'null')||[{name:'Ayah',day:'Sabtu',menu:'Ayam Geprek'}];
let customRecipes=JSON.parse(localStorage.getItem('di_custom_recipes')||'null')||[];
let history=JSON.parse(localStorage.getItem('di_shop_history')||'null')||[];
const builtins=[
{id:'b1',emoji:'🍗',name:'Ayam Kecap Mentega',category:'Lauk',time:'25 menit',ingredients:'500 g ayam\n3 siung bawang putih\n2 sdm kecap manis\n1 sdm mentega',steps:'Tumis bawang. Masukkan ayam, kecap, dan mentega. Masak hingga matang.',builtin:true},
{id:'b2',emoji:'🥘',name:'Sop Sapi',category:'Masakan Keluarga',time:'45 menit',ingredients:'500 g daging sapi\n2 buah wortel\n3 buah kentang\n1 batang daun bawang',steps:'Rebus daging hingga empuk. Masukkan sayur dan bumbu, masak sampai matang.',builtin:true},
{id:'b3',emoji:'👶',name:'MPASI Bubur Ayam',category:'MPASI',time:'20 menit',ingredients:'30 g beras\n40 g ayam\n10 g wortel',steps:'Masak semua bahan hingga lunak lalu sesuaikan tekstur dengan usia bayi.',builtin:true},
{id:'b4',emoji:'🥦',name:'Tumis Brokoli Tahu',category:'Sayur',time:'15 menit',ingredients:'1 bonggol brokoli\n2 buah tahu\n2 siung bawang putih',steps:'Tumis bawang, masukkan tahu dan brokoli, masak hingga matang.',builtin:true}
];
function save(){
 localStorage.setItem('di_meals',JSON.stringify(meals));
 localStorage.setItem('di_shop_v5',JSON.stringify(shop));
 localStorage.setItem('di_reqs',JSON.stringify(reqs));
 localStorage.setItem('di_custom_recipes',JSON.stringify(customRecipes));
 localStorage.setItem('di_shop_history',JSON.stringify(history));
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function rupiah(n){return 'Rp'+Number(n||0).toLocaleString('id-ID')}
function go(id){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.p===id));window.scrollTo(0,0);if(id==='recipes')renderRecipes();if(id==='shopping'){renderShop();renderHistory()}}
function mealHtml(m){return `<div class="meal"><div class="time">${m.time}</div><div class="grow"><b>${esc(m.name)}</b><span>${m.type}</span></div><span class="tag ${m.type==='MPASI'?'mpasi':''}">${m.type}</span></div>`}
function renderHome(){todayName.textContent=activeDay;let a=meals.filter(x=>x.day===activeDay).sort((a,b)=>a.time.localeCompare(b.time));todayMeals.innerHTML=a.length?a.map(mealHtml).join(''):'<div class="empty">Belum ada jadwal hari ini.</div>';shopCount.textContent=shop.filter(x=>!x.done).length;reqCount.textContent=reqs.length}
function renderDays(){days.innerHTML=DAYS.map(d=>`<button class="${d===activeDay?'active':''}" onclick="setDay('${d}')">${d.slice(0,3)}</button>`).join('')}
function setDay(d){activeDay=d;renderDays();renderSchedule();renderHome()}
function renderSchedule(){renderDays();let a=meals.filter(x=>x.day===activeDay).sort((a,b)=>a.time.localeCompare(b.time));scheduleList.innerHTML=a.length?a.map(m=>`<div class="meal"><div class="time">${m.time}</div><div class="grow"><b>${esc(m.name)}</b><span>${m.type}</span></div><button class="del" onclick="delMeal('${m.day}','${m.time}','${encodeURIComponent(m.name)}')">×</button></div>`).join(''):'<div class="empty">Belum ada jadwal.</div>'}
function openMeal(pref=''){mealDay.value=activeDay;if(pref)mealName.value=pref;mealModal.classList.add('show')}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function outside(e,id){if(e.target.id===id)closeModal(id)}
function saveMeal(){let name=mealName.value.trim();if(!name)return;meals.push({day:mealDay.value,time:mealTime.value,type:mealType.value,name});activeDay=mealDay.value;mealName.value='';save();closeModal('mealModal');renderSchedule();renderHome();toastMsg('Masuk ke jadwal')}
function delMeal(day,time,name){name=decodeURIComponent(name);meals=meals.filter(m=>!(m.day===day&&m.time===time&&m.name===name));save();renderSchedule();renderHome()}
function renderShop(){
 let done=shop.filter(x=>x.done).length,total=shop.length;
 progText.textContent=`${done}/${total}`;
 progBar.style.width=total?`${done/total*100}%`:'0%';
 shopTotal.textContent=rupiah(shop.reduce((s,x)=>s+(Number(x.price)||0),0));
 shopList.innerHTML=shop.length?shop.map((x,i)=>`<div class="shop ${x.done?'done':''}">
 <input type="checkbox" ${x.done?'checked':''} onchange="toggleShop(${i})">
 <div class="shop-main"><span class="name">${esc(x.name)}</span><div class="price-row"><span>Harga</span><input class="price-input" inputmode="numeric" value="${x.price||''}" placeholder="0" onchange="setPrice(${i},this.value)"></div></div>
 <button class="del" onclick="delShop(${i})">×</button></div>`).join(''):'<div class="empty">Daftar belanja kosong.</div>';
}
function addShop(){let v=shopInput.value.trim();if(!v)return;addOrMergeIngredient(v);shopInput.value='';save();renderShop();renderHome()}
function toggleShop(i){shop[i].done=!shop[i].done;save();renderShop();renderHome()}
function setPrice(i,v){shop[i].price=Number(String(v).replace(/[^\d]/g,''))||0;save();renderShop()}
function delShop(i){shop.splice(i,1);save();renderShop();renderHome()}
function saveShoppingHistory(){
 if(!shop.length){toastMsg('Daftar belanja masih kosong');return}
 let bought=shop.filter(x=>x.done);
 if(!bought.length){toastMsg('Centang barang yang sudah dibeli');return}
 let entry={
   id:'h'+Date.now(),
   date:new Date().toISOString(),
   items:bought.map(x=>({name:x.name,price:Number(x.price)||0})),
   total:bought.reduce((s,x)=>s+(Number(x.price)||0),0)
 };
 history.unshift(entry);
 shop=shop.filter(x=>!x.done);
 save();renderShop();renderHistory();renderHome();toastMsg('Riwayat belanja tersimpan');
}
function toggleHistory(){historyWrap.classList.toggle('hidden');renderHistory()}
function renderHistory(){
 historyList.innerHTML=history.length?history.map((h,i)=>`<div class="history-card">
  <div class="hmeta"><b>${formatDate(h.date)}</b><small>${h.items.length} barang</small></div>
  <span class="history-total">${rupiah(h.total)}</span>
  <button class="circle" style="width:34px;height:34px;font-size:18px" onclick="showHistory(${i})">›</button>
 </div>`).join(''):'<div class="empty">Belum ada riwayat belanja.</div>';
}
function formatDate(s){return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
function showHistory(i){
 let h=history[i];historyTitle.textContent=formatDate(h.date);
 historyBody.innerHTML=h.items.map(x=>`<div class="history-detail-row"><span>${esc(x.name)}</span><span>${rupiah(x.price)}</span></div>`).join('')+`<div class="history-grand"><span>Total</span><span>${rupiah(h.total)}</span></div>`;
 historyModal.classList.add('show');
}
function allRecipes(){return [...customRecipes,...builtins]}
function renderRecipes(){let q=(recipeSearch.value||'').toLowerCase();let list=allRecipes().filter(r=>(r.name+' '+r.category+' '+r.ingredients).toLowerCase().includes(q));recipeList.innerHTML=list.length?list.map(r=>`<div class="rcard"><div class="pic">${r.emoji||'🍽️'}</div><div class="rbody"><span class="pill">${esc(r.category)}</span><h3>${esc(r.name)}</h3><p>${esc(r.time||'')} • ${esc((r.ingredients||'').split('\n').slice(0,2).join(', '))}</p><div class="actions"><button onclick="showRecipe('${r.id}')">Lihat resep</button>${r.builtin?'':`<button class="trash" onclick="deleteRecipe('${r.id}')">×</button>`}</div></div></div>`).join(''):'<div class="empty">Resep tidak ditemukan.</div>'}
function openRecipe(){rName.value='';rCategory.value='Masakan Keluarga';rIngredients.value='';rSteps.value='';rTime.value='';recipeModal.classList.add('show')}
function saveRecipe(){let name=rName.value.trim(),ingredients=rIngredients.value.trim(),steps=rSteps.value.trim();if(!name||!ingredients)return;customRecipes.unshift({id:'c'+Date.now(),emoji:rCategory.value==='MPASI'?'👶':'🍽️',name,category:rCategory.value,time:rTime.value.trim()||'Waktu fleksibel',ingredients,steps:steps||'Belum ada langkah memasak.',builtin:false});save();closeModal('recipeModal');renderRecipes();toastMsg('Resep tersimpan')}
function deleteRecipe(id){customRecipes=customRecipes.filter(r=>r.id!==id);save();renderRecipes()}
function showRecipe(id){let r=allRecipes().find(x=>x.id===id);if(!r)return;detailTitle.textContent=r.name;detailBody.innerHTML=`<span class="pill">${esc(r.category)} • ${esc(r.time||'')}</span><h4>Bahan</h4><p>${esc(r.ingredients)}</p><h4>Cara memasak</h4><p>${esc(r.steps)}</p><div class="recipe-actions"><button class="to-shop" onclick="addRecipeIngredients('${r.id}')">🛒 Tambah ke Belanja</button><button class="to-plan" onclick="closeModal('detailModal');openMeal('${esc(r.name)}')">📅 Masuk Jadwal</button></div>`;detailModal.classList.add('show')}
function normalizeIngredient(line){
 let s=line.trim().replace(/\s+/g,' ');
 let m=s.match(/^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|buah|butir|siung|sdm|sdt|bonggol|batang)?\s+(.+)$/i);
 if(!m)return {key:s.toLowerCase(),qty:null,unit:null,name:s};
 return {qty:parseFloat(m[1].replace(',','.')),unit:(m[2]||'').toLowerCase(),name:m[3].trim(),key:((m[2]||'')+'|'+m[3].trim()).toLowerCase()};
}
function addOrMergeIngredient(line){
 let n=normalizeIngredient(line);
 if(n.qty===null){let ex=shop.find(x=>x.name.toLowerCase()===n.name.toLowerCase());if(!ex)shop.push({name:n.name,done:false,price:0});return}
 let idx=shop.findIndex(x=>{let p=normalizeIngredient(x.name);return p.qty!==null&&p.key===n.key});
 if(idx>=0){let p=normalizeIngredient(shop[idx].name);let total=+(p.qty+n.qty).toFixed(2);shop[idx].name=`${total} ${n.unit} ${n.name}`.trim();shop[idx].done=false}
 else shop.push({name:`${n.qty} ${n.unit} ${n.name}`.replace(/\s+/g,' ').trim(),done:false,price:0});
}
function addRecipeIngredients(id){
 let r=allRecipes().find(x=>x.id===id);if(!r)return;
 (r.ingredients||'').split('\n').map(x=>x.trim()).filter(Boolean).forEach(addOrMergeIngredient);
 save();renderShop();renderHome();toastMsg('Bahan ditambahkan ke Belanja');
}
function renderReqs(){reqList.innerHTML=reqs.length?reqs.map((r,i)=>`<div class="request"><div class="rav">${esc(r.name[0]||'?')}</div><div class="txt"><b>${esc(r.name)}</b><p>${esc(r.menu)}</p><small>${esc(r.day||'Belum ditentukan')}</small></div><button class="del" onclick="delReq(${i})">×</button></div>`).join(''):'<div class="empty">Belum ada request.</div>'}
function addReq(){let name=reqName.value.trim(),menu=reqMenu.value.trim();if(!name||!menu)return;reqs.unshift({name,day:reqDay.value.trim()||'Belum ditentukan',menu});reqName.value=reqDay.value=reqMenu.value='';save();renderReqs();renderHome()}
function delReq(i){reqs.splice(i,1);save();renderReqs();renderHome()}
function toastMsg(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)}
renderHome();renderSchedule();renderShop();renderRecipes();renderReqs();renderHistory();
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'))}
