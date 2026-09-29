
const FINAL_HOME_LABELS={cook:"요리",eat:"먹기",clean:"정리",repair:"수리",garden:"온실",animal:"동물",talk_a:"아이 A",talk_b:"아이 B",rest:"휴식",sleep:"잠들기"};
const FINAL_CITY={
 market:{name:"운하 시장",icon:"▦",actions:{shop:"사기",talk:"상인과 대화"}},
 quay:{name:"낡은 선착장",icon:"≈",actions:{fish:"낚기",search:"뒤져보기"}},
 archive:{name:"기록보관소",icon:"▤",actions:{read:"기록 읽기",search:"서랍 살피기"}},
 oldquarter:{name:"구주거구",icon:"⌂",actions:{trade:"교환하기",walk:"골목 걷기"}}
};

function finalCityPanel(){
 const root=document.getElementById("final-city-panel");if(!root)return;
 const g=S.final;if(!g||!g.cityOpen){root.innerHTML="";return;}
 const place=g.cityPlace||"market", c=FINAL_CITY[place];
 root.innerHTML=`<div class="city-panel"><div class="city-head"><div><span class="eyebrow">CITY</span><h2>${c.icon} ${c.name}</h2></div><button data-city-close>돌아가기</button></div><p>${FINAL_CITY_DESC[place]}</p><div class="city-actions">${Object.entries(c.actions).map(([k,v])=>`<button data-final-city-action="${k}" data-final-city-place="${place}">${v}</button>`).join("")}</div></div>`;
}
const FINAL_CITY_DESC={market:"붉은 벽돌 건물 사이로 작은 배들이 오간다.",quay:"낡은 선착장. 수면 아래로도 길이 이어진다.",archive:"높은 서가와 습기를 막은 유리 보관함이 가득하다.",oldquarter:"사람들이 물가와 돌계단을 오가며 생활한다."};
function finalUi(){
 const root=document.getElementById("final-game");if(!root)return;finalCityPanel();
 const g=S.final;if(!g){root.innerHTML='<button class="start-final" data-final-boot>하루를 시작한다</button>';return;}
 const hour=Math.floor(g.minutes/60)%24, min=g.minutes%60, clock=`${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
 const inv=Object.entries(g.inventory||{}).filter(([,n])=>n>0).map(([id,n])=>`${FINAL_CONTENT_CLIENT.items[id]?.icon||"•"} ${FINAL_CONTENT_CLIENT.items[id]?.name||id} ${n}`).join(" · ")||"빈 가방";
 const roomLevel=(g.rooms?.greenhouse||0)+(g.rooms?.kitchen||0);
 const event=FINAL_EVENTS_CLIENT.find(e=>e.id===g.activeEvent);
 root.innerHTML=`
 <section class="game-shell"><div id="final-city-panel"></div>
  <header class="game-top">
   <div><div class="eyebrow">WATERLINE</div><h1>저택의 하루</h1><div class="dayline">DAY ${g.day} · ${clock} · ${g.weather}</div></div>
   <div class="vitals"><span class="vital"><i style="width:${g.energy}%"></i><b>체력</b></span><span class="vital"><i style="width:${g.hunger}%"></i><b>허기</b></span></div>
  </header>
  <div class="game-body">
   <aside class="home-map">
    <div class="house-title">저택</div>
    ${Object.entries(FINAL_ROOMS_CLIENT).map(([id,r])=>`<button class="room-card ${g.trip===id?"active":""}" data-final-room="${id}"><span>${r.icon}</span><strong>${r.name}</strong><small>${roomHint(id,g)}</small></button>`).join("")}
    <button class="go-city" data-final-city-open="market">도시로 나가기</button>
   </aside>
   <main class="play-space">
    <div class="scene-art"><div class="water-line"></div><div class="house-shape"><div class="window w1"></div><div class="window w2"></div><div class="door"></div></div><div class="scene-weather">${g.weather}</div></div>
    <div class="scene-caption"><span>${g.trip&&FINAL_CITY[g.trip]?FINAL_CITY[g.trip].name:"저택"}</span><p>${sceneLine(g)}</p></div>
    <div class="action-panel">
      <div class="panel-title">지금 할 수 있는 일</div>
      <div class="action-grid">${Object.entries(FINAL_HOME_LABELS).map(([k,v])=>`<button data-final-home="${k}">${v}</button>`).join("")}</div>
    </div>
    <div class="inventory-strip"><span class="panel-title">가방</span><span>${inv}</span></div>
    ${event?eventCard(event):""}
   </main>
   <aside class="journal">
    <div class="panel-title">오늘</div>
    <div class="relation"><b>아이들</b><strong>${g.relation}</strong></div>
    <div class="relation"><b>동물</b><strong>${g.animal}</strong></div>
    <div class="relation"><b>집</b><strong>${g.house}</strong></div>
    <div class="money">₡ ${g.money}</div>
    <div class="journal-title">발견한 것</div>
    <div class="clues">${g.clues?Array.from({length:g.clues},(_,i)=>`<span class="clue-dot" title="단서 ${i+1}"></span>`).join(""):"아직 없다"}</div>
    <div class="journal-title">최근</div>
    <div class="recent">${g.toast||"아직 오늘의 기록이 없다."}</div>
   </aside>
  </div>
 </section>`;
}
function roomHint(id,g){
 const hints={kitchen:g.inventory?.fish?"재료가 있다":"빈 냄비가 있다",greenhouse:g.flags?.seed_planted?"새싹이 자라고 있다":"유리창에 빗물이 맺혔다",study:g.flags?.route_marked?"지도에 파란 표시":"지도가 펼쳐져 있다",dock:"수면이 조용하다",attic:g.inventory?.button?"상자 안에 단추":"먼지가 쌓였다",hall:"젖은 신발 자국"};
 return hints[id]||"";
}
function sceneLine(g){
 if(g.trip&&FINAL_CITY[g.trip])return FINAL_CITY[g.trip].name+"에서 천천히 둘러보고 있다.";
 if(g.weather==="강한 비")return"빗소리가 지붕을 두드린다. 집 안은 조금 어둡다.";
 if(g.day===1)return"물 위와 아래에 걸친 오래된 집에서 하루가 시작된다.";
 return"물소리와 사람들의 생활 소리가 집 안까지 희미하게 들어온다.";
}
function eventCard(e){
 return `<div class="event-card"><div class="event-tag">지금 일어난 일</div><h2>${e.title}</h2><p>${e.text}</p><div class="event-choices">${e.choices.map(c=>`<button data-final-event="${e.id}" data-final-choice="${c.id}">${c.label}</button>`).join("")}</div></div>`;
}
const FINAL_CONTENT_CLIENT={items:{fish:{name:"생선",icon:"🐟"},apple:{name:"사과",icon:"🍎"},herb:{name:"허브",icon:"🌱"},plank:{name:"나무판",icon:"🪵"},glass:{name:"유리",icon:"◇"},button:{name:"파란 단추",icon:"🔵"},letter:{name:"젖은 편지",icon:"✉"},key:{name:"녹슨 열쇠",icon:"🗝"},seed:{name:"수생 씨앗",icon:"🌰"}}};
const FINAL_ROOMS_CLIENT={kitchen:{name:"부엌",icon:"🍲"},greenhouse:{name:"온실",icon:"🌿"},study:{name:"서재",icon:"📚"},dock:{name:"선착장",icon:"⚓"},attic:{name:"다락",icon:"📦"},hall:{name:"현관",icon:"🚪"}};
const FINAL_EVENTS_CLIENT=[
{id:"wet_shoe",title:"현관의 젖은 신발",text:"현관 한가운데 젖은 신발 한 짝이 놓여 있다. 아이들의 것은 아니다.",choices:[{id:"keep",label:"치워 둔다"},{id:"ask",label:"아이들에게 묻는다"}]},
{id:"window",title:"열린 온실 창문",text:"바람도 없는데 온실 창문이 열려 있다. 흙 위에 작은 물방울이 이어져 있다.",choices:[{id:"follow",label:"물방울을 따라간다"},{id:"close",label:"창문을 닫는다"}]},
{id:"child_button",title:"아이의 주머니",text:"아이 B가 작은 파란 단추를 내민다. '선착장에서 주웠어.'",choices:[{id:"keep",label:"보관한다"},{id:"return",label:"같은 곳에 돌려놓자"}]},
{id:"animal",title:"문 앞의 변이동물",text:"거대한 동물이 잠들지 않고 현관만 바라보고 있다.",choices:[{id:"follow",label:"따라간다"},{id:"stay",label:"곁에 앉는다"}]},
{id:"letter",title:"수로에 떠온 편지",text:"봉투 하나가 집 안쪽 선착장에 걸려 있다. 발신인은 없다.",choices:[{id:"open",label:"편지를 연다"},{id:"dry",label:"말려 둔다"}]},
{id:"rain",title:"수위가 오른 날",text:"수면이 평소보다 높다. 도시로 가는 가장 짧은 길이 잠겼다.",choices:[{id:"stay",label:"오늘은 집에 있는다"},{id:"long",label:"먼 길로 돌아간다"}]},
{id:"seed",title:"유리 아래의 씨앗",text:"온실 바닥 틈에서 작은 수생 씨앗이 발견됐다.",choices:[{id:"plant",label:"온실에 심는다"},{id:"store",label:"다락에 보관한다"}]},
{id:"map",title:"지워진 수로",text:"서재 지도에서 지워진 선 하나가 파란 단추의 표시와 같은 모양이다.",choices:[{id:"mark",label:"지도에 표시한다"},{id:"erase",label:"아무것도 건드리지 않는다"}]},
{id:"door",title:"잠긴 수중문",text:"집 아래쪽에서 아주 짧게 금속 부딪히는 소리가 난다.",choices:[{id:"key",label:"녹슨 열쇠를 시험한다"},{id:"wait",label:"아침까지 기다린다"}]},
{id:"festival",title:"운하의 작은 축제",text:"시장 쪽에서 음악이 들린다. 아이들이 가 보고 싶어 한다.",choices:[{id:"go",label:"함께 간다"},{id:"stay",label:"오늘은 집에서 쉰다"}]},
{id:"truth",title:"파란 표시",text:"지금까지 모은 표시들이 하나의 경로를 가리킨다. 집의 수중 선착장에서 시작한다.",choices:[{id:"go",label:"경로를 따라간다"},{id:"sleep",label:"오늘은 자고 내일 간다"}]}
];

function routeExtraAction(b){if(!b)return;if(b.dataset.finalBoot){call("finalBoot",{});return;}if(b.dataset.finalHome){call("finalHomeAction",{action:b.dataset.finalHome});return;}if(b.dataset.finalEvent){call("finalEventChoice",{eventId:b.dataset.finalEvent,choiceId:b.dataset.finalChoice});return;}if(b.dataset.finalCityOpen){S.final=S.final||{};S.final.cityOpen=true;S.final.cityPlace=b.dataset.finalCityOpen;finalUi();return;}
if(b.dataset.finalCityAction){call("finalCityAction",{place:b.dataset.finalCityPlace,action:b.dataset.finalCityAction});return;}
if(b.dataset.cityClose){S.final=S.final||{};S.final.cityOpen=false;finalUi();return;}if(b.dataset.finalRoom){S.final=S.final||{};S.final.trip=b.dataset.finalRoom;S.final.cityOpen=false;S.final.toast=FINAL_ROOMS_CLIENT[b.dataset.finalRoom]?.name+"으로 이동했다.";finalUi();return;}if(b.dataset.lifeAction){call("lifeAction",{action:b.dataset.lifeAction});return;}if(b.dataset.spaceEnter){const target=b.dataset.spaceEnter==="auto"?(S.currentSpace||"theater"):b.dataset.spaceEnter;call("spaceEnter",{space:target});return;}if(b.dataset.spaceAction){call("spaceAction",{space:S.currentSpace,action:b.dataset.spaceAction});return;}if(b.dataset.mansionEvent){const m=S.mansionState||{};const map={kitchen:"kitchen_morning",greenhouse:"greenhouse_sprout",basement:"basement_echo",kids_a:"kids_rain",attic:"attic_box",study:"study_map"};const id=map[m.room];if(id)call("mansionEvent",{eventId:id});return;}if(b.dataset.mansionEventChoice){const m=S.mansionState||{};call("mansionEventChoice",{eventId:m.activeEvent,choiceId:b.dataset.mansionEventChoice});return;}if(b.dataset.mansionMove){call("mansionMove",{room:b.dataset.mansionMove});return;}if(b.dataset.mansionAction){call("mansionAction",{action:b.dataset.mansionAction});return;}if(b.dataset.worldConsequence){call("worldConsequence",{kind:b.dataset.worldConsequence});return;}if(b.dataset.spot)call("inspectSpot",{spot:b.dataset.spot});if(b.dataset.extraTalk)call("extraTalk",{id:b.dataset.extraTalk});if(b.dataset.world)call("worldAction",{action:b.dataset.world});if(b.dataset.choice)call("eventChoice",{choice:b.dataset.choice});}
const MANSION_ROOMS_CLIENT={
hall:{name:"현관 홀",desc:"낡은 석조 현관. 도시에서 돌아오면 가장 먼저 지나게 되는 곳.",actions:["clean","inspect"]},kitchen:{name:"주방",desc:"큰 조리대와 오래된 저장고가 있다.",actions:["cook","clean","repair"]},dining:{name:"식당",desc:"긴 식탁이 놓인 방. 창밖으로 수면 위 도시가 보인다.",actions:["eat","talk"]},living:{name:"거실",desc:"가족이 가장 오래 머무는 공간.",actions:["talk","rest","clean"]},laundry:{name:"세탁실",desc:"빗물과 지하수를 이용하는 오래된 세탁 설비.",actions:["wash","repair"]},storage:{name:"창고",desc:"도시에서 가져온 물건과 생활 자원을 보관한다.",actions:["sort","inspect"]},greenhouse:{name:"온실",desc:"깨진 유리 사이로 물가 식물이 자라는 온실.",actions:["plant","water","inspect"]},dock:{name:"실내 선착장",desc:"저택 뒤쪽 수로와 직접 연결된 작은 선착장.",actions:["prepare_trip","fish"]},kids_a:{name:"아이 A의 방",desc:"아이가 모아온 작은 물건들로 가득하다.",actions:["talk","clean","inspect"]},kids_b:{name:"아이 B의 방",desc:"책과 지도, 오래된 장난감이 놓여 있다.",actions:["talk","clean","inspect"]},study:{name:"공동 서재",desc:"도시의 지도와 저택의 오래된 기록을 함께 보관한다.",actions:["read","sort","inspect"]},bedroom:{name:"옛 주인 침실",desc:"아직 사용하지 않는 방. 오래된 가구가 그대로 남아 있다.",actions:["inspect"]},guest:{name:"손님방",desc:"필요할 때 잠시 쉴 수 있는 방.",actions:["rest","clean"]},attic:{name:"다락",desc:"아직 정리되지 않은 상자와 가구가 쌓여 있다.",actions:["inspect","sort"]},archive:{name:"옛 주인 서재",desc:"도시와 저택에 관한 문서가 남아 있다.",actions:["read","inspect"]},music:{name:"음악실",desc:"물에 젖지 않은 악기들이 이상할 정도로 잘 보존되어 있다.",actions:["play","inspect"]},boiler:{name:"보일러실",desc:"난방과 온수의 핵심.",actions:["repair","fuel"]},water:{name:"물 저장고",desc:"수면 아래에서 들어오는 물을 저장하고 정화한다.",actions:["purify","inspect"]},workshop:{name:"수리실",desc:"도시에서 가져온 부품을 수리할 수 있는 작업장.",actions:["repair","craft"]},basement:{name:"지하 저장고",desc:"절반이 물에 잠겨 있다. 방수 구조 덕분에 내부는 놀라울 정도로 보존되어 있다.",actions:["inspect","dive"]},underwater:{name:"수중 복도",desc:"저택 아래를 가로지르는 오래된 복도.",actions:["dive","inspect"]},garden_b:{name:"지하 정원",desc:"수면 아래에서도 살아가는 식물이 자라는 공간.",actions:["plant","inspect"]}
};

const SPACE_LABELS={theater:"극장",greenhouse:"온실",study:"공동 서재",dock:"실내 선착장"};
const SPACE_ACTION_LABELS={peel_poster:"포스터를 떼어본다",remember_date:"날짜를 기억한다",check_back:"다시 살핀다",enter_backstage:"무대 뒤로 들어간다",listen:"문 너머를 듣는다",open_water_door:"수로 문을 연다",open_window:"창문을 연다",touch_plant:"식물의 잎을 만진다",follow_print:"발자국을 따라간다",record_print:"발자국을 기록한다",take_button:"단추를 줍는다",compare_maps:"지도를 겹쳐본다",visit_dock:"선착장을 표시한다",follow_route:"경로를 기억한다",pick_knot:"매듭을 줍는다",look_water:"수면을 살핀다",wait:"기다린다",dive:"잠수한다",connect_clue:"두 단서를 연결한다",leave:"나간다"};
function statefulSpaceView(){const el=document.getElementById('stateful-space');if(!el)return;const sp=S.currentSpace,ss=sp&&S.spaceStates&&S.spaceStates[sp];if(!sp||!ss){el.innerHTML='';return;}const defs={theater:{quiet:['문 닫힌 극장. 젖은 포스터 하나가 벽에 붙어 있다.', ['peel_poster','leave']],poster:['포스터 뒤에 공연 날짜가 적혀 있다. 날짜 아래에는 작은 파란 점이 있다.', ['remember_date','check_back','leave']],screen:['전광판에 방금 본 날짜가 떠 있다. 무대 뒤쪽의 작은 문이 열렸다.', ['enter_backstage','leave']],backstage:['무대 뒤에는 도시의 수로와 이어지는 낡은 문이 있다.', ['listen','open_water_door','leave']]},greenhouse:{quiet:['유리 온실. 젖은 흙과 작은 화분들이 있다.', ['open_window','touch_plant','leave']],footprint:['창밖 수로에 젖지 않은 발자국 하나가 보인다.', ['follow_print','record_print','leave']],trail:['발자국은 선착장에서 끊긴다. 화분 밑에 젖은 단추가 있다.', ['take_button','leave']]},study:{quiet:['도시 지도와 저택 기록이 놓여 있다. 수로 하나가 지워져 있다.', ['compare_maps','leave']],marked:['지워진 수로가 선착장으로 이어진다.', ['visit_dock','leave']],route:['저택에서 선착장으로 이어지는 경로가 드러났다.', ['follow_route','leave']]},dock:{quiet:['수면에 작은 매듭 하나가 떠 있다.', ['pick_knot','look_water','leave']],water:['물결이 이상하게 안쪽으로 흐른다.', ['wait','dive','leave']],trace:['수중 벽에 작은 파란 점이 그려져 있다.', ['connect_clue','leave']]}};const d=defs[sp]?.[ss.stage]||defs[sp]?.quiet;if(!d){el.innerHTML='';return;}el.innerHTML=`<div class="stateful-space-card"><div class="muted">LIVE SPACE · ${SPACE_LABELS[sp]}</div><h3>${esc(d[0])}</h3><div class="action-grid">${d[1].map(x=>`<button data-space-action="${x}">${SPACE_ACTION_LABELS[x]||x}</button>`).join('')}</div></div>`;}
const MANSION_EVENTS_CLIENT={
kitchen_morning:{title:"아침의 부엌",text:"아침이 되자 주방 창문에 물방울이 맺혀 있다. 아이가 작은 배 한 척을 가리킨다.",choices:[["look","같이 창밖을 본다"],["cook","아침부터 배부터 챙긴다"],["ask","무슨 배인지 물어본다"]]},
greenhouse_sprout:{title:"유리 너머의 싹",text:"며칠 전에는 없었던 투명한 싹이 화분 가장자리에서 자라고 있다.",choices:[["water","물을 준다"],["observe","건드리지 않고 관찰한다"],["move","창가로 옮긴다"]]},
basement_echo:{title:"지하의 두드리는 소리",text:"물에 잠긴 저장고에서 세 번, 잠시 뒤 두 번. 일정한 간격으로 벽을 두드리는 소리가 들린다.",choices:[["answer","벽을 두드려 답한다"],["wait","조용히 기다린다"],["leave","오늘은 돌아간다"]]},
kids_rain:{title:"비 오는 날",text:"비가 오래 내린다. 아이가 오늘은 도시로 나가지 말고 집 안에서 놀자고 한다.",choices:[["game","같이 놀아준다"],["story","옛 저택 이야기를 들려준다"],["work","할 일을 끝내고 놀자고 한다"]]},
attic_box:{title:"다락의 상자",text:"정리하지 않은 상자 하나가 스스로 조금 열려 있다.",choices:[["open","상자를 전부 연다"],["whistle","호루라기를 불어본다"],["close","다시 닫아둔다"]]},
study_map:{title:"지도 위의 빈칸",text:"공동 서재의 지도에서 저택 뒤쪽 수로 한 구간만 잉크가 번져 있다.",choices:[["mark","그 위치를 표시한다"],["compare","도시에서 가져온 지도와 비교한다"],["ignore","지금은 덮어둔다"]]}
};
const EXTRA_SPOTS={oldtown:["시계 수리점","빈 극장표 가게","벽화 골목"],greenhouse:["말라붙은 연못","유리 천장","씨앗 보관함"],observatory:["수위계","낡은 망원경","기록실"],archive2:["봉인 서랍","합성기록","열람대"]};
function lockHint(k){return {archive:"단서 8개 이상",station:"점수 14 이상",hospital:"점수 22 이상",theater:"점수 32 이상",deep:"수문 진행 2"}[k]||"잠김"}
var S=null;(()=>{const $=s=>document.querySelector(s),socket=io();let tab="map";const names={oldtown:"구시가지",greenhouse:"유리온실",observatory:"수문 관측소",archive2:"기억 서고",estate:"오래된 저택",market:"운하 시장",pier:"낡은 선착장",canal:"수중 운하",archive:"기록보관소",station:"폐역",district:"구주거구",hospital:"수중 병원",theater:"침수 극장",deep:"심층 진입구"};const desc={estate:"도시의 가장자리. 두 아이와 변이동물이 사는 오래된 집.",market:"사람과 소문이 가장 많이 모이는 곳.",pier:"수면 아래 도시로 내려가는 오래된 부두.",canal:"도시의 아래쪽을 잇는 물길.",archive:"기억보다 기록을 믿는 사람들이 모인다.",station:"폐쇄된 지 오래됐지만 밤마다 불이 켜진다.",district:"평범한 생활과 이상현상이 겹치는 구역.",hospital:"기억 이상을 치료한다는 수중 병원.",theater:"상영되지 않은 영화가 남아 있는 극장.",deep:"도시 아래의 진짜 구조로 이어지는 곳."};const links={estate:["market","pier"],market:["estate","pier","district"],pier:["estate","market","canal"],canal:["pier","archive","district"],archive:["canal","station"],station:["archive","district"],district:["station","hospital","market"],hospital:["district","theater"],theater:["hospital","deep"],deep:["theater"]};const spots={estate:["온실","서재","현관"],market:["파이 가게","골동품상","수로 계단"],pier:["계류 밧줄","발자국","수면"],canal:["우체통","유리창","잠긴 문"],archive:["열람실","금고","금지서고"],station:["승강장","역무실","13분 늦은 시계"],district:["빈 집","세탁소","옥상"],hospital:["접수실","병실 17","기록실"],theater:["매표소","무대","영사실"],deep:["잠수엘리베이터","수문","검은 계단"]};const npcs={naru:["나루","estate"],milo:["밀로","estate"],pie:["파이 장인","market"],antique:["골동품상","market"],keeper:["역무원","station"],archivist:["기록관 세라","archive"],doctor:["의사 로웬","hospital"],actor:["극장 관리인 이오","theater"],washer:["세탁소 주인","district"]};const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));function me(){return S?.players.find(x=>x.id===socket.id)}let feedbackTimer=null;
function call(ev,data){
  socket.emit(ev,data,r=>{
    if(r&&!r.ok){showFeedback("막혔다",r.error||"지금은 할 수 없다.","error");return}
    if(r&&r.ok&&r.text) showFeedback("행동 결과",r.text,"result");
    else if(r&&r.ok&&r.item) showFeedback("획득했다",`${r.item}을(를) 얻었다.`,"reward");
  })
}
function toast(t){const el=$("#toast");if(el)el.textContent=t||""}
function showFeedback(title,text,kind="result",extra=""){
  toast(text);
  let old=document.querySelector(".feedback-pop");if(old)old.remove();
  const el=document.createElement("div");el.className=`feedback-pop ${kind}`;
  el.innerHTML=`<div class="feedback-kicker">${kind==="error"?"NOT YET":kind==="reward"?"FOUND":"ACTION"}</div><h2>${esc(title)}</h2><p>${esc(text)}</p>${extra?`<div class="feedback-extra">${extra}</div>`:""}<button data-close-feedback>확인</button>`;
  document.body.appendChild(el);
  clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>el.remove(),4200);
}
function diffSummary(prev,next){
 const a=prev?.players?.find(x=>x.id===socket.id),b=next?.players?.find(x=>x.id===socket.id);if(!a||!b)return "";
 const out=[];const stat=(k,label)=>{if(a[k]!==b[k])out.push(`<span>${label} ${a[k]} → ${b[k]}</span>`)};
 stat("actions","행동");stat("money","돈");stat("energy","기운");stat("hunger","허기");
 if(a.loc!==b.loc)out.push(`<span>위치 ${esc(names[b.loc]||b.loc)}</span>`);
 if(b.clues.length>a.clues.length)out.push(`<span>새 단서 +${b.clues.length-a.clues.length}</span>`);
 if(b.items.length>a.items.length)out.push(`<span>새 물건 +${b.items.length-a.items.length}</span>`);
 const am=prev.mansionState,bm=next.mansionState;if(am&&bm){["home_clean","house_condition","water","food","fuel","knowledge","parts","eventCount"].forEach(k=>{if(am[k]!==bm[k])out.push(`<span>${k} ${am[k]||0} → ${bm[k]||0}</span>`)})}
 return out.join("");
}
function stateFeedback(prev,next){
 const oldLog=prev?.log||[],newLog=next?.log||[];const last=newLog.length?newLog[newLog.length-1]:null;
 if(!prev||!last||oldLog.length===newLog.length)return;
 const summary=diffSummary(prev,next);
 const kind=last.k==="error"?"error":last.k==="reward"||last.k==="discover"?"reward":"result";
 showFeedback(last.k==="discover"?"새로운 단서":last.k==="move"?"이동했다":last.k==="mansion"?"저택에서 행동했다":last.k==="mansion-event"?"저택의 사건":last.k==="npc"?"대화가 남았다":"기록이 갱신됐다",last.t,kind,summary);
}
function shell(){let p=me();if(!S||!p)return;$("#lobby").classList.add("hidden");$("#game").classList.remove("hidden");$("#chapter").textContent=`CHAPTER ${S.chapter} · DAY ${S.day}`;$("#place").textContent=names[p.loc];$("#clock").textContent=`${S.time}${S.night?" · NIGHT":""} · 행동 ${p.actions}/10 · ${p.money}c` ;$("#objective").textContent=S.objective}
function render(){document.querySelectorAll(".scene-overlay").forEach(x=>x.remove());shell();let p=me();if(!p)return;let v=$("#view");if(tab==="map")v.innerHTML=mapView(p);if(tab==="case")v.innerHTML=caseView(p);if(tab==="people")v.innerHTML=peopleView(p);if(tab==="bag")v.innerHTML=bagView(p);if(tab==="chat")v.innerHTML=chatView();if(tab==="map"){mansionView();mansionEventView();statefulSpaceView();lifeView();}if(S.scene)document.body.insertAdjacentHTML("beforeend",sceneView())}
function mansionEventView(){
 const m=S.mansionState||{};const ev=m.activeEvent&&MANSION_EVENTS_CLIENT[m.activeEvent];
 const el=document.getElementById("mansion-event");
 if(!el)return;
 if(!ev){el.innerHTML="";return;}
 el.innerHTML=`<div class="mansion-event-card"><div class="muted">HOUSE EVENT</div><h3>${esc(ev.title)}</h3><p>${esc(ev.text)}</p><div class="action-grid">${ev.choices.map(c=>`<button data-mansion-event-choice="${c[0]}">${c[1]}</button>`).join("")}</div></div>`;
}
function mansionView(){
 const m=S.mansionState||{room:"hall",day:1,time:8,home_clean:5,house_condition:5,water:5,food:5,fuel:5,unlocks:[]};
 const room=MANSION_ROOMS_CLIENT[m.room]||{name:m.room,desc:"저택의 방",actions:[]};
 const labels={clean:"청소하기",cook:"요리하기",eat:"함께 식사하기",talk:"이야기하기",rest:"쉬기",repair:"수리하기",wash:"빨래하기",sort:"정리하기",inspect:"둘러보기",plant:"식물 돌보기",water:"물 주기",prepare_trip:"원정 준비",fish:"낚시하기",read:"기록 읽기",play:"악기 연주하기",fuel:"연료 보충",purify:"물 정화",craft:"부품 만들기",dive:"잠수해서 조사"};
 const hints={clean:"집의 상태가 변한다",cook:"식량을 준비한다",eat:"함께 시간을 보낸다",talk:"관계와 새로운 기록",rest:"기운을 회복한다",repair:"집을 고치고 잠금을 연다",wash:"청결을 회복한다",sort:"숨은 물건을 찾는다",inspect:"이 방의 흔적을 살핀다",plant:"온실의 변화를 만든다",water:"물 자원을 관리한다",prepare_trip:"도시 원정을 준비한다",fish:"식량을 얻을 기회",read:"과거의 기록을 읽는다",play:"아이와 집의 반응",fuel:"보일러를 유지한다",purify:"물을 사용할 수 있게 한다",craft:"수리 부품을 만든다",dive:"수중 공간의 단서를 찾는다"};
 const el=document.getElementById("mansion-room");if(el)el.innerHTML=`<div class="mansion-head"><h3>${esc(room.name)}</h3><p>${esc(room.desc)}</p><div class="mansion-stats"><span class="stat">청결 ${m.home_clean}</span><span class="stat">집 ${m.house_condition}</span><span class="stat">물 ${m.water}</span><span class="stat">식량 ${m.food}</span><span class="stat">연료 ${m.fuel}</span></div></div>`;
 const ac=document.getElementById("mansion-actions");if(ac)ac.innerHTML=`<div class="action-grid">${(room.actions||[]).map(a=>`<button data-mansion-action="${a}"><b>${labels[a]||a}</b><small>${hints[a]||"행동 1회"}</small></button>`).join("")}</div>`;
 const d=document.getElementById("mday");if(d)d.textContent=m.day||1;
}
function mapView(p){
const extra={oldtown:["시계 수리점","빈 극장표 가게","벽화 골목"],greenhouse:["말라붙은 연못","유리 천장","씨앗 보관함"],observatory:["수위계","낡은 망원경","기록실"],archive2:["봉인 서랍","합성기록","열람대"]};
const allLinks={...links,oldtown:["market","district","greenhouse"],greenhouse:["oldtown","observatory"],observatory:["greenhouse","station","archive2"],archive2:["observatory","archive"]};
const allSpots={...spots,...extra};
const req={archive:"단서 8개 이상",station:"점수 14 이상",hospital:"점수 22 이상",theater:"점수 32 이상",deep:"수문 진행 2",oldtown:"점수 10 이상",greenhouse:"점수 24 이상",observatory:"점수 18 이상",archive2:"점수 28 + 수문 1"};
const currentSpots=allSpots[p.loc]||[];
return`<div class="grid">
<section class="panel mansion-panel"><div class="titleline"><div><div class="muted">MANSION</div><h2>저택</h2></div><div class="muted">DAY <span id="mday">1</span></div></div><div id="mansion-room"></div><div class="mansion-rooms"><div class="muted">1F</div><button data-mansion-move="hall">현관</button><button data-mansion-move="kitchen">주방</button><button data-mansion-move="dining">식당</button><button data-mansion-move="living">거실</button><button data-mansion-move="laundry">세탁실</button><button data-mansion-move="storage">창고</button><button data-mansion-move="greenhouse">온실</button><button data-mansion-move="dock">선착장</button><div class="muted">2F</div><button data-mansion-move="kids_a">아이 A 방</button><button data-mansion-move="kids_b">아이 B 방</button><button data-mansion-move="study">공동 서재</button><button data-mansion-move="bedroom">옛 주인 침실</button><button data-mansion-move="guest">손님방</button><div class="muted">3F</div><button data-mansion-move="attic">다락</button><button data-mansion-move="archive">옛 주인 서재</button><button data-mansion-move="music">음악실</button><div class="muted">B1/B2</div><button data-mansion-move="boiler">보일러실</button><button data-mansion-move="water">물 저장고</button><button data-mansion-move="workshop">수리실</button><button data-mansion-move="basement">지하 저장고</button><button data-mansion-move="underwater">수중 복도</button><button data-mansion-move="garden_b">지하 정원</button></div><div id="mansion-actions"></div><div id="life-sim"></div><div id="stateful-space"></div><div><button data-space-enter="auto">이 공간을 직접 살펴본다</button></div><div id="mansion-event"></div><div class="mansion-event-launch"><button data-mansion-event="auto"><b>이 공간을 더 살펴본다</b><small>숨겨진 사건이 있는지 확인</small></button></div></section><section class="panel current-panel">
<div class="live-banner"><div><span class="live-dot"></span> LIVE RECORD</div><b>${esc((S.log||[]).length?(S.log[S.log.length-1].t):"아직 행동하지 않았다.")}</b></div>
<div class="titleline"><div><div class="muted">CURRENT LOCATION</div><div class="location">${names[p.loc]||p.loc}</div></div><span>${S.stats.discoveries} discoveries</span></div>
<p class="desc">${desc[p.loc]||"도시의 새로운 구역."}</p>
<h3>조사할 수 있는 곳</h3>
<div class="event consequence-panel"><b>과거 선택의 흔적</b>
${p.loc==="oldtown"?`<button data-world-consequence="mara">마라와 다시 이야기한다</button>`:""}
${p.loc==="greenhouse"?`<button data-world-consequence="lune">온실의 변화 확인</button>`:""}
${p.loc==="archive2"?`<button data-world-consequence="archive">기록의 변화를 확인한다</button>`:""}
</div>
<div class="actions">${currentSpots.map((x,i)=>`<button data-inspect="${i}" ${p.actions<1?"disabled":""}><b>${x}</b><small>상호작용 · 장면이 열린다</small></button>`).join("")}</div>
${extra[p.loc]?`<div class="event"><b>지역 특수 조사</b><div class="spotgrid">${extra[p.loc].map(x=>`<button data-spot="${esc(x)}" ${p.actions<1?"disabled":""}>${esc(x)}<small>특수 단서</small></button>`).join("")}</div></div>`:""}
</section>
<section class="panel"><div class="event"><b>도시 조작</b><div class="spotgrid">
${p.loc==="observatory"?`<button data-world="calibrate">수위계 보정</button>`:""}
${p.loc==="station"?`<button data-world="restore">폐역 전원 복구</button>`:""}
${p.loc==="deep"?`<button data-world="gate">수문 돌리기</button>`:""}
</div></div>
<div class="titleline"><div><div class="muted">CITY MAP</div><b>도시의 연결</b></div></div>
<div class="map">${Object.entries(names).map(([k,n])=>{let open=S.world?.opened?.[k]??true;let adjacent=(allLinks[p.loc]||[]).includes(k);let here=k===p.loc;return`<button class="${here?"here ":""}${open?"":"locked"}" data-move="${k}" ${here||(!open)||(!adjacent)?"disabled":""}>${n}<small>${here?"현재 위치":!open?(req[k]||"잠김"):adjacent?"이동 가능":"—"}</small></button>`}).join("")}</div>
<hr>
<div class="clue next"><b>다음 목표</b><p>${esc(S.objective||"도시를 탐색하며 단서를 모으자.")}</p></div>
<div class="event"><b>오늘의 사건</b><p>${esc(S.event?.title||"없음")}</p><p>${esc(S.event?.text||"")}</p>${S.event?`<button data-event="investigate">조사</button> <button data-event="help">돕기</button> <button data-event="ignore">지나치기</button>`:""}</div>
</section></div>`}
function caseView(p){
 let shared=S.players.flatMap(x=>x.shared||[]);
 let clues=p.clues.slice().reverse();
 let log=(S.log||[]).slice().reverse().slice(0,18);
 return`<section class="panel case-panel">
 <div class="titleline"><div><div class="muted">CASE FILE</div><b>도시의 사건 기록</b></div><span>${S.score||0} clues</span></div>
 <div class="case-now"><div class="case-now-kicker">지금 일어난 일</div><b>${esc(log[0]?.t||"아직 기록이 없다.")}</b><small>행동할 때마다 이곳에 즉시 기록된다.</small></div>
 <div class="case-columns">
  <div><h3>새로 발견한 단서 <span class="count-badge">${clues.length}</span></h3>
   <div class="cards">${clues.map((c,i)=>`<div class="clue ${i===0?"new-clue":""}"><span class="clue-tag">${i===0?"NEW":"CLUE"}</span><b>${esc(c.text)}</b><small>DAY ${c.day} · ${c.area}</small><button data-share="${p.clues.length-1-i}">동료에게 공개</button></div>`).join("")||"<p class='muted'>아직 없다. 지도에서 장소를 조사해보자.</p>"}</div>
  </div>
  <div><h3>최근 행동</h3><div class="timeline">${log.map((x,i)=>`<div class="timeline-row ${i===0?"latest":""}"><i></i><div><b>${esc(x.t)}</b><small>${x.k||"record"}</small></div></div>`).join("")||"<p class='muted'>행동 기록이 여기에 쌓인다.</p>"}</div></div>
 </div>
 <h3>공개된 단서</h3><div class="cards">${shared.slice().reverse().map(c=>`<div class="clue shared-clue"><span class="clue-tag">SHARED</span><b>${esc(c.text)}</b><small>DAY ${c.day}</small></div>`).join("")||"<p class='muted'>동료가 공개한 단서가 없다.</p>"}</div>
 </section>`}
function sceneView(){const sc=S.scene;if(!sc)return "";return `<div class="scene-overlay"><div class="scene-card"><div class="scene-kicker">SCENE · ${esc(names[sc.loc]||sc.loc)} · VISIT ${sc.visit||1}</div><div class="scene-location">${esc(sc.spot)}</div><h2>${esc(sc.title)}</h2><p class="scene-text">${esc(sc.text)}</p><div class="scene-choices">${sc.choices.map((c,i)=>`<button data-scene-choice="${esc(c.id)}"><span>${String.fromCharCode(65+i)}</span><div><b>${esc(c.label)}</b><small>${c.knowledge?`단서 +${c.knowledge} `:""}${c.item?"물건 발견 ":""}${c.relationship?"관계 변화 ":""}${c.flag?"세계 변화 ":""}${c.next?"→ 다음 장면":""}</small></div></button>`).join("")}</div><div class="scene-note">선택은 기록에 남고, 같은 장소를 다시 방문하면 이전 행동이 반영된다.</div></div></div>`;}
function peopleView(p){return`<section class="panel"><div class="titleline"><div><div class="muted">PEOPLE</div><b>도시 사람들</b></div><span>대화할수록 새로운 문장이 열린다</span></div><div class="cards">${Object.entries(npcs).map(([id,x])=>{let lv=p.rel[id]||0;return`<div class="npc"><b>${x[0]}</b><small> · ${names[x[1]]}</small><div class="meter"><i style="width:${Math.min(100,lv*12)}%"></i></div><p>관계 ${lv}</p><button data-talk="${id}" ${p.loc===x[1]?"":"disabled"}>${p.loc===x[1]?"대화하기":"이동 후 대화"}</button></div>`}).join("")}</div></section>`}
function bagView(p){return`<section class="panel"><div class="titleline"><div><div class="muted">INVENTORY</div><b>소지품</b></div><span>${p.items.length} items</span></div><div class="cards">${p.items.map(x=>`<div class="clue"><b>${esc(x)}</b><p class="muted">현재 가방에 보관 중.</p></div>`).join("")}</div><h3>상태</h3><div class="cards">${[["기운",p.energy],["허기",p.hunger],["체온",p.warmth],["행동",p.actions]].map(x=>`<div class="clue"><b>${x[0]}</b><div class="meter"><i style="width:${x[1]*10}%"></i></div><small>${x[1]}</small></div>`).join("")}</div>${p.loc==="market"?`<h3>시장 구매</h3><div class="actions">${[["파이",6],["기억병",12],["담요",8],["열쇠",18]].map(x=>`<button data-buy="${x[0]}">${x[0]} · ${x[1]}c</button>`).join("")}</div>`:""}</section>`}
function chatView(){return`<section class="panel chat"><div class="messages" id="messages"></div><input id="msg" placeholder="동료에게 메시지"><button id="send">전송</button></section>`}
document.addEventListener("click",e=>{
let b=e.target.closest("button");if(!b)return;
if(b.dataset.mansionEvent||b.dataset.mansionEventChoice||b.dataset.mansionMove||b.dataset.mansionAction||b.dataset.worldConsequence||b.dataset.spot||b.dataset.extraTalk||b.dataset.world||b.dataset.choice){routeExtraAction(b);return;}
if(b.dataset.closeFeedback){b.closest(".feedback-pop")?.remove();return;}
if(b.dataset.tab){tab=b.dataset.tab;render();return}
if(b.dataset.move){let mep=me();if(mep&&b.dataset.move!==mep.loc)call("move",{to:b.dataset.move});return}
if(b.dataset.sceneChoice){call("sceneChoice",{choice:b.dataset.sceneChoice});return}
if(b.dataset.inspect){call("inspect",{spot:+b.dataset.inspect});return}
if(b.dataset.spot){call("inspectSpot",{spot:b.dataset.spot});return}
if(b.dataset.share){call("share",{index:+b.dataset.share});return}
if(b.dataset.event){call("event",{choice:b.dataset.event});return}
if(b.dataset.talk){call("talk",{npc:b.dataset.talk});return}
if(b.dataset.buy){call("buy",{item:b.dataset.buy});return}
if(b.dataset.world){call("worldAction",{action:b.dataset.world});return}
if(b.dataset.choice){call("eventChoice",{choice:b.dataset.choice});return}
if(b.dataset.extraTalk){call("extraTalk",{id:b.dataset.extraTalk});return}
});
$("#create").onclick=()=>call("create",{name:$("#name").value.trim()});$("#join").onclick=()=>call("join",{name:$("#name").value.trim(),code:$("#code").value.trim()});$("#rest").onclick=()=>socket.emit("rest");document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="msg"){socket.emit("chat",{text:e.target.value});e.target.value=""}});
socket.on("state",x=>{const prev=S;S=x;render();stateFeedback(prev,x);setTimeout(finalUi,0);});socket.on("chat",x=>{if(tab==="chat"){let m=$("#messages");m.innerHTML+=`<p><b>${esc(x.name)}</b> ${esc(x.text)}</p>`;m.scrollTop=m.scrollHeight}});socket.on("connect_error",()=>toast("서버 연결에 실패했습니다."));
})();




document.addEventListener("DOMContentLoaded",()=>{setTimeout(finalUi,50);});
