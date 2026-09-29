
const express=require("express"),http=require("http"),{Server}=require("socket.io");
const app=express(),server=http.createServer(app),io=new Server(server);
const path=require("path"),PORT=process.env.PORT||3000;
app.use(express.static(path.join(__dirname,"public")));
app.get("/health",(q,r)=>r.json({ok:true,version:"19.0"}));
app.get("*",(q,r)=>r.sendFile(path.join(__dirname,"public/index.html")));

const A={
estate:{n:"오래된 저택",links:["market","pier"],spots:["온실","서재","현관"],kind:"home",desc:"도시의 가장자리. 두 아이와 변이동물이 사는 오래된 집."},
market:{n:"운하 시장",links:["estate","pier","district"],spots:["파이 가게","골동품상","수로 계단"],kind:"social",desc:"사람과 소문이 가장 많이 모이는 곳."},
pier:{n:"낡은 선착장",links:["estate","market","canal"],spots:["계류 밧줄","발자국","수면"],kind:"explore",desc:"수면 아래 도시로 내려가는 오래된 부두."},
canal:{n:"수중 운하",links:["pier","archive","district"],spots:["우체통","유리창","잠긴 문"],kind:"explore",desc:"도시의 아래쪽을 잇는 물길."},
archive:{n:"기록보관소",links:["canal","station"],spots:["열람실","금고","금지서고"],kind:"lore",desc:"기억보다 기록을 믿는 사람들이 모인다."},
station:{n:"폐역",links:["archive","district"],spots:["승강장","역무실","13분 늦은 시계"],kind:"mystery",desc:"폐쇄된 지 오래됐지만 밤마다 불이 켜진다."},
district:{n:"구주거구",links:["station","hospital","market"],spots:["빈 집","세탁소","옥상"],kind:"life",desc:"도시의 평범한 생활과 이상현상이 겹치는 곳."},
hospital:{n:"수중 병원",links:["district","theater"],spots:["접수실","병실 17","기록실"],kind:"lore",desc:"기억 이상을 치료한다는 병원."},
theater:{n:"침수 극장",links:["hospital","deep"],spots:["매표소","무대","영사실"],kind:"mystery",desc:"상영되지 않은 영화가 남아 있다."},
deep:{n:"심층 진입구",links:["theater"],spots:["잠수엘리베이터","수문","검은 계단"],kind:"danger",desc:"도시 아래의 진짜 구조로 이어지는 곳."}
};

const NPC={
naru:{n:"나루",area:"estate",max:8,desc:"저택에 사는 아이. 사라진 기억에 유난히 민감하다."},
milo:{n:"밀로",area:"estate",max:8,desc:"나루와 함께 사는 아이. 장난스럽지만 도시 지리를 잘 안다."},
pie:{n:"파이 장인",area:"market",max:6},
antique:{n:"골동품상",area:"market",max:7},
keeper:{n:"역무원",area:"station",max:8},
archivist:{n:"기록관 세라",area:"archive",max:8},
doctor:{n:"의사 로웬",area:"hospital",max:8},
actor:{n:"극장 관리인 이오",area:"theater",max:8},
washer:{n:"세탁소 주인",area:"district",max:6}
};

const MAIN=[
{id:"M1",ch:1,title:"세 번의 종소리",need:0,area:"estate",text:"새벽마다 저택 아래에서 세 번의 종소리가 난다. 저택에는 종이 없다.",goal:"저택에서 종소리의 근원을 조사하라."},
{id:"M2",ch:1,title:"서재의 두 이름",need:3,area:"estate",text:"같은 날, 같은 방에서 두 사람이 죽었다는 장부. 그런데 도시에는 한 사람만 존재한다.",goal:"두 이름이 왜 같은 기억을 갖고 있는지 알아내라."},
{id:"M3",ch:1,title:"17번 수로",need:6,area:"market",text:"시장 지도에서 17번 수로만 의도적으로 지워져 있다.",goal:"17번 수로의 존재를 확인하라."},
{id:"M4",ch:2,title:"기억을 파는 가게",need:10,area:"market",text:"골동품상은 기억을 담은 병을 몰래 거래한다. 병에는 2417이라는 번호가 있다.",goal:"2417의 의미를 찾아라."},
{id:"M5",ch:2,title:"수면 아래의 편지",need:14,area:"canal",text:"우체통 안에는 두 사람이 동시에 읽어야 하는 편지가 들어 있다.",goal:"편지의 수신인이 누구인지 알아내라."},
{id:"M6",ch:2,title:"13분 늦은 역",need:19,area:"station",text:"폐역의 시계는 매일 13분 늦는다. 밤이면 존재하지 않는 열차가 들어온다.",goal:"열차가 어디에서 오는지 추적하라."},
{id:"M7",ch:3,title:"없는 사람",need:25,area:"archive",text:"도시의 모든 공식 기록에는 존재하지만 아무도 기억하지 못하는 사람이 있다.",goal:"그 사람의 이름과 마지막 행적을 찾아라."},
{id:"M8",ch:3,title:"병실 17",need:31,area:"hospital",text:"병실 17의 환자는 자신의 기억이 아니라 다른 사람의 하루를 말한다.",goal:"환자의 기억이 어디서 왔는지 밝혀라."},
{id:"M9",ch:4,title:"마지막 상영",need:38,area:"theater",text:"영사실에 남은 필름에는 지금의 도시와 닮았지만 존재하지 않는 도시가 찍혀 있다.",goal:"필름 속 도시를 실제 지도와 대조하라."},
{id:"M10",ch:4,title:"합성 기억",need:46,area:"canal",text:"누구의 것도 아닌 기억들이 하나의 장면으로 합쳐진다.",goal:"합성 기억의 중심 장면을 복원하라."},
{id:"M11",ch:5,title:"수문 아래",need:55,area:"deep",text:"수문에는 두 개의 손바닥 자국이 있다. 둘이 동시에 누르면 문이 열린다.",goal:"심층으로 내려가는 문을 열어라."},
{id:"M12",ch:5,title:"기억하지 못하는 하루",need:66,area:"deep",text:"도시의 역사에서 하루가 통째로 사라져 있다. 그 하루에 있었던 일은 아직 도시 곳곳에 남아 있다.",goal:"사라진 하루를 복원하라."}
];

const SIDE=[
{id:"S1",area:"market",title:"사라진 파이",steps:4,text:["파이 장인의 딸이 만든 파이 하나가 사라졌다.","발자국은 시장이 아니라 폐역 쪽으로 이어진다.","역무원은 밤에 누군가 파이를 들고 내렸다고 한다.","범인은 배고픈 아이였다. 하지만 아이가 가진 것은 파이가 아니라 기억이었다."]},
{id:"S2",area:"district",title:"빈집의 따뜻한 컵",steps:5,text:["사람이 살지 않는 집에 따뜻한 컵이 있다.","세탁소 주인은 그 집 주인이 매주 화요일 돌아온다고 한다.","집 안의 달력은 9일 전에서 멈춰 있다.","기록관에는 그 집 주인이 3년 전에 사망했다고 적혀 있다.","플레이어는 진실을 기록할지, 집을 그냥 둘지 선택한다."]},
{id:"S3",area:"station",title:"13분의 승객",steps:6,text:["폐역에 젖은 발자국이 생겼다.","역무실의 장부에는 승객 한 명이 찍혀 있다.","그 이름은 기록보관소의 '없는 사람'과 같다.","밤에 열차가 들어온다.","승객은 자신이 아직 도착하지 않았다고 말한다.","그날 이후 역의 시계가 1분 빨라진다."]},
{id:"S4",area:"hospital",title:"병실의 바다",steps:5,text:["병실 17의 환자는 바다를 본 적이 없다고 말한다.","그런데 환자의 기억에는 수중 도시가 선명하다.","의사 로웬은 기억이 외부에서 들어왔다고 의심한다.","병실 벽에서 오래된 물때 자국이 발견된다.","누군가 이 기억을 일부러 심어두었다."]},
{id:"S5",area:"theater",title:"상영되지 않는 영화",steps:7,text:["영사기에 필름이 걸려 있다.","첫 장면은 지금의 저택이다.","두 번째 장면에는 존재하지 않는 광장이 나온다.","세 번째 장면에는 두 아이가 보인다.","그런데 촬영 날짜는 아직 오지 않은 날짜다.","영화를 끝까지 보면 화면 속 인물이 관객을 바라본다.","다음 날 극장에는 새로운 표 한 장이 생긴다."]},
{id:"S6",area:"canal",title:"빨간 우체통",steps:5,text:["수중 우체통에는 이름 없는 편지가 들어온다.","편지는 매일 문장이 하나씩 늘어난다.","첫 문장은 '오늘도 기억하지 못했구나.'","둘째 문장은 '두 사람이 함께 있어야 한다.'","마지막 문장은 플레이어가 직접 발견한 단서와 연결된다."]}
];

const RANDOM=[
["기억비","하늘에서 작은 기억 조각이 떨어진다.","district"],
["늦은 방문자","밤의 저택 문을 누군가 두드린다.","estate"],
["시장 소동","상인 둘이 같은 물건을 서로 자기 것이라 주장한다.","market"],
["무음 열차","폐역에서 소리 없이 열차가 지나갔다는 목격담.","station"],
["수위 상승","운하 수위가 올라 평소 못 가던 곳이 열린다.","canal"],
["정전","도시 대부분의 불이 꺼지고 폐역만 밝아진다.","station"],
["낯선 파이","시장에 누구도 주문하지 않은 파이가 하나 놓였다.","market"],
["젖은 편지","누군가의 이름이 지워진 편지가 발견된다.","pier"],
["옥상의 노래","구주거구 옥상에서 같은 멜로디가 반복된다.","district"],
["검은 계단","심층 진입구에서 한 계단이 어제보다 낮아졌다.","deep"]
];

function mk(code){return{
code,day:1,min:510,chapter:1,score:0,progress:0,objective:MAIN[0].goal,players:new Map(),
side:Object.fromEntries(SIDE.map(x=>[x.id,{step:0,done:false}])),
flags:{},event:null,log:[],stats:{discoveries:0,talks:0,events:0,quests:0,days:1},choiceState:{current:null,history:[]},mansionState:{room:'hall',day:1,time:8,home_clean:5,house_condition:5,water:5,food:5,fuel:5,materials:3,parts:0,knowledge:0,relationship:0,energy:6,hunger:6,prepared:0,unlocks:[]},inventory:[],saveVersion:22,
world:{marketTrust:0,stationPower:0,hospitalTrust:0,theaterPower:0,waterLevel:0,doorProgress:0,
history:[],ending:null,opened:{estate:true,market:true,pier:true,canal:true,district:true,archive:false,station:false,hospital:false,theater:false,deep:false,oldtown:false,greenhouse:false,observatory:false,archive2:false}},
choices:{},combos:[],achievements:[],dailySeed:0,scene:null,sceneHistory:[],spotVisits:{}}}
function player(id,name,role){return{id,name:(name||"플레이어").slice(0,12),role,loc:"estate",energy:100,hunger:10,warmth:100,actions:10,money:30,items:role==="A"?["낡은 열쇠","방수노트"]:["작은 손전등"],clues:[],shared:[],rel:{},completed:[]}}
const rooms=new Map();
function me(r,id){return r?.players.get(id)}
function log(r,t,k="normal"){r.log.push({t,k});if(r.log.length>100)r.log.shift()}
function hour(r){return`${String(Math.floor(r.min/60)).padStart(2,"0")}:${String(r.min%60).padStart(2,"0")}`}
function advance(r,n=20){r.min+=n;if(r.min>=1440){r.min-=1440;r.day++;for(const p of r.players.values()){p.actions=10;p.energy=Math.min(100,p.energy+35);p.hunger=Math.max(0,p.hunger-12);p.warmth=100}newEvent(r);log(r,`DAY ${r.day}. 도시가 새로운 하루를 시작했다.`,"day")}if(r.min>=1320&&!r.flags.night){r.flags.night=true;log(r,"밤이 되었다. 폐역과 극장에서 특별한 사건이 발생할 수 있다.","night")}if(r.min<1320)r.flags.night=false}
function newEvent(r){let x=RANDOM[Math.floor(Math.random()*RANDOM.length)];r.event={title:x[0],text:x[1],area:x[2],day:r.day,used:false};r.stats.events++}
function pub(r){return{code:r.code,day:r.day,time:hour(r),chapter:r.chapter,objective:r.objective,night:!!r.flags.night,event:r.event,scene:r.scene,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,role:p.role,loc:p.loc,energy:p.energy,hunger:p.hunger,warmth:p.warmth,actions:p.actions,money:p.money,items:p.items,clues:p.clues,shared:p.shared,rel:p.rel,completed:p.completed})),side:r.side,stats:r.stats,log:r.log.slice(-70),flags:r.flags,world:r.world,choices:r.choices,achievements:r.achievements,mansionState:r.mansionState,currentSpace:r.currentSpace||null,spaceStates:r.spaceStates||{},life:r.life||null,final:r.final||null}}
function maybeMain(r){let current=MAIN[r.progress];if(!current)return;if(r.score>=current.need&&r.progress<MAIN.length){r.objective=current.goal;if(r.chapter<current.ch)r.chapter=current.ch;}}
function clue(r,p,text,area,kind="clue"){p.clues.push({text,area,day:r.day,kind});r.score++;r.stats.discoveries++;maybeMain(r)}
function randomLine(p,loc,spot){
const m={
"estate:온실":"젖지 않은 잎 하나가 물결 모양으로 갈라져 있다.",
"estate:서재":"두 사람의 이름이 같은 날짜와 같은 방을 가리킨다.",
"estate:현관":"명패 뒤에서 청동 태그 '2417'을 찾았다.",
"market:파이 가게":"장인은 오늘 밤 종이 네 번 울리면 시장을 떠나라고 한다.",
"market:골동품상":"기억병의 바닥에 2417이라는 분류번호가 새겨져 있다.",
"market:수로 계단":"물 아래에 거대한 발자국이 찍혀 있다.",
"pier:계류 밧줄":"세 색의 밧줄 중 붉은 매듭만 새것이다.",
"pier:발자국":"발자국 옆에서 오래된 통행표를 찾았다.",
"pier:수면":"잔물결이 세 번, 두 번, 한 번 반복된다.",
"canal:우체통":"편지에는 '둘이서만 읽을 것'이라고 적혀 있다.",
"canal:유리창":"유리 너머 누군가가 2417을 가리킨다.",
"canal:잠긴 문":"문에는 두 개의 손바닥 자국이 있다.",
"archive:열람실":"삭제된 17번 수로가 오래된 지도에는 남아 있다.",
"archive:금고":"금고에는 두 개의 손바닥 자국과 2417이 있다.",
"archive:금지서고":"'존재하지 않는 사람'이라는 제목의 기록을 찾았다.",
"station:승강장":"꺼진 등불과 젖은 발자국이 선로 끝까지 이어진다.",
"station:역무실":"벽시계는 정확히 13분 늦어 있다.",
"station:13분 늦은 시계":"시계 뒤쪽에 '열차가 오면 시간을 돌려라'가 적혀 있다.",
"district:빈 집":"사람이 살지 않는데 컵은 따뜻하다.",
"district:세탁소":"세탁소 주인은 9일 전부터 같은 옷을 맡아두고 있다.",
"district:옥상":"옥상에서는 도시 아래의 수로가 한 줄로 이어져 보인다.",
"hospital:접수실":"존재하지 않는 병실 번호가 접수대에 적혀 있다.",
"hospital:병실 17":"환자는 '내 기억이 아니야'라고 말한다.",
"hospital:기록실":"같은 환자의 이름이 세 번 바뀌어 있다.",
"theater:매표소":"상영 기록이 없는 영화표가 팔려 있다.",
"theater:무대":"무대 아래에서 다른 도시의 물 냄새가 난다.",
"theater:영사실":"필름 속 도시의 건물은 현재 도시와 정확히 17m씩 어긋난다.",
"deep:잠수엘리베이터":"0층 아래에 손으로 지운 층 표시가 있다.",
"deep:수문":"두 사람이 동시에 손을 대야 할 것 같은 자국이 있다.",
"deep:검은 계단":"계단 아래에서 세 번의 종소리가 난다."
};return m[`${loc}:${spot}`]||`${spot} 주변에서 특별한 흔적을 발견했다.`}
function sideAdvance(r,p){for(const q of SIDE){let st=r.side[q.id];if(st.done||p.loc!==q.area)continue;if(st.step<q.steps&&p.actions>0){st.step++;p.actions--;advance(r);let t=q.text[st.step-1];clue(r,p,`${q.title} · ${t}`,q.area,"side");log(r,`${q.title} ${st.step}/${q.steps} · ${t}`,"quest");if(st.step===q.steps){st.done=true;r.stats.quests++;p.money+=15;log(r,`${q.title} 사건이 해결되었다. 보상 15c.`,"reward")}}}}

function canEnter(r,to){
  if(r.world.opened[to]) return true;
  if(to==="archive") return r.score>=8;
  if(to==="station") return r.score>=14 || r.world.stationPower>=1;
  if(to==="hospital") return r.score>=22 || r.world.hospitalTrust>=2;
  if(to==="theater") return r.score>=32 || r.world.theaterPower>=1;
  if(to==="deep") return r.world.doorProgress>=2 || (r.players.size>=2 && r.score>=40);
  if(to==="oldtown") return r.score>=10;
  if(to==="greenhouse") return r.world.waterLevel<=1 || r.score>=24;
  if(to==="observatory") return r.score>=18 || r.world.stationPower>=1;
  if(to==="archive2") return r.score>=28 && r.world.doorProgress>=1;
  return false;
}
function achievement(r,id,label){if(!r.achievements.includes(id)){r.achievements.push(id);log(r,`ACHIEVEMENT · ${label}`,"achievement")}}
function choiceWorld(r,id,val){
  r.choices[id]=val;r.world.history.push({day:r.day,id,val});
  if(id==="market_fire") r.world.marketTrust += val==="help"?2:val==="ignore"?-1:0;
  if(id==="station_clock") r.world.stationPower += val==="repair"?2:val==="break"?-1:0;
  if(id==="hospital_patient") r.world.hospitalTrust += val==="believe"?2:val==="report"?1:-1;
  if(id==="theater_film") r.world.theaterPower += val==="watch"?2:val==="burn"?-2:0;
  if(id==="water_gate") r.world.doorProgress += val==="turn"?1:val==="wait"?0:0;
  if(r.world.marketTrust>=2) r.world.opened.district=true;
  if(r.world.stationPower>=2) r.world.opened.station=true;
  if(r.world.hospitalTrust>=2) r.world.opened.hospital=true;
  if(r.world.theaterPower>=2) r.world.opened.theater=true;
  if(r.world.doorProgress>=2) r.world.opened.deep=true;
}
function combine(r,p){
  const all=r.players.size?Array.from(r.players.values()).flatMap(x=>x.clues):p.clues;
  const texts=all.map(x=>x.text);
  const has=(s)=>texts.some(t=>t.includes(s));
  if(has("2417")&&has("두 개의 손바닥")){r.world.doorProgress=Math.max(r.world.doorProgress,1);achievement(r,"combo2417","2417 + 손바닥 자국")}
  if(has("13분")&&has("없는 사람")){r.world.stationPower=Math.max(r.world.stationPower,1);achievement(r,"combo13","13분 + 없는 사람")}
  if(has("병실 17")&&has("필름")){r.world.hospitalTrust=Math.max(r.world.hospitalTrust,1);achievement(r,"combo17","병실 17 + 필름")}
  if(has("종소리")&&has("수문")){r.world.doorProgress=Math.max(r.world.doorProgress,1);achievement(r,"comboBell","종소리 + 수문")}
  if(r.world.doorProgress>=2) r.world.opened.deep=true;
}


const REGIONS_EXTRA={
 oldtown:{name:"구시가지",desc:"오래된 상점과 골목이 겹쳐진 생활권",spots:["시계 수리점","빈 극장표 가게","벽화 골목"],npcs:["MARA"]},
 greenhouse:{name:"유리온실",desc:"도시의 수위가 낮을 때만 입구가 드러나는 온실",spots:["말라붙은 연못","유리 천장","씨앗 보관함"],npcs:["LUNE"]},
 observatory:{name:"수문 관측소",desc:"도시 전체의 수위와 종소리를 기록하는 곳",spots:["수위계","낡은 망원경","기록실"],npcs:["ORIN"]},
 archive2:{name:"기억 서고",desc:"폐기된 기억 기록이 쌓이는 비공개 서고",spots:["봉인 서랍","합성기록","열람대"],npcs:["VEIL"]}
};
function extendedMap(){
 A.oldtown={name:"구시가지",links:["market","district","greenhouse"],spots:REGIONS_EXTRA.oldtown.spots};
 A.greenhouse={name:"유리온실",links:["oldtown","observatory"],spots:REGIONS_EXTRA.greenhouse.spots};
 A.observatory={name:"수문 관측소",links:["greenhouse","station","archive2"],spots:REGIONS_EXTRA.observatory.spots};
 A.archive2={name:"기억 서고",links:["observatory","archive"],spots:REGIONS_EXTRA.archive2.spots};
}
extendedMap();
const NPC_EXTRA={
 MARA:{name:"마라",area:"oldtown",mood:"까칠하지만 기억력이 좋다",lines:["어제와 오늘의 골목이 다르다는 걸 눈치챘어?","사라진 사람보다 사라진 기록이 더 무서운 법이지.","시계는 시간을 알려주는 게 아니라 틀린 시간을 숨기는 물건이야."],gift:"오래된 회중시계"},
 LUNE:{name:"룬",area:"greenhouse",mood:"조용하고 관찰력이 뛰어나다",lines:["식물은 물이 아니라 기억을 먹고 자라기도 해.","온실 바닥에 없는 계절의 흔적이 있어.","씨앗 보관함을 열면 누군가의 하루가 나온다는 소문이 있어."],gift:"유리 씨앗"},
 ORIN:{name:"오린",area:"observatory",mood:"숫자와 기록을 믿는다",lines:["수위는 매일 정확히 오르내리지 않아.","13분의 오차는 기계 고장이 아니라 도시의 습관이야.","종이 세 번 울린 날엔 지도에서 한 구역이 사라졌어."],gift:"수위 기록표"},
 VEIL:{name:"베일",area:"archive2",mood:"말을 아끼며 정보를 교환한다",lines:["기억은 사실이 아니야. 사실이 기억을 닮았을 뿐이지.","합성 기억은 주인이 없어서 누구에게나 돌아갈 수 있어.","네가 찾는 사람은 어쩌면 처음부터 한 사람이 아니었어."],gift:"무주 기억편"}
};
const SIDE_EXTRA=[
{id:"clockwork",title:"멈춘 시계",area:"oldtown",goal:"구시가지 시계 수리점에서 3개의 시계를 비교하라",reward:15},
{id:"glassseed",title:"유리 씨앗",area:"greenhouse",goal:"유리온실의 씨앗 보관함을 조사하라",reward:18},
{id:"waterchart",title:"수위의 거짓말",area:"observatory",goal:"수문 관측소의 기록과 현재 수위를 비교하라",reward:20},
{id:"ownerless",title:"주인 없는 기억",area:"archive2",goal:"기억 서고에서 소유자가 없는 기록을 찾아라",reward:25}
];
const DAILY_EXTRA=[
["초승달 우편","pier","누군가 수로 우편함에 이름 없는 편지를 넣었다."],
["시장 경매","market","상인이 오래된 열쇠 하나를 경매에 내놓았다."],
["빈 의자","district","어제까지 있던 의자가 사라지고 그 자리에 사진이 놓였다."],
["반복되는 방송","station","폐역 방송이 같은 문장을 13분 간격으로 반복한다."],
["젖은 필름","theater","극장 입구에 비에 젖은 필름 조각이 떨어져 있다."],
["온실의 발자국","greenhouse","아무도 들어갈 수 없었던 온실에 발자국이 생겼다."],
["시계가 늦은 날","oldtown","구시가지의 모든 시계가 서로 다른 시간을 가리킨다."],
["관측소 경보","observatory","수위 관측소에서 존재하지 않는 홍수 경보가 울린다."]
];


const CHOICE_TREE = {
  pier_letter: {
    title:"이름 없는 편지",
    text:"선착장 우편함 안에 발신자도 수신자도 없는 젖은 편지가 있다.",
    choices:[
      {id:"read",text:"편지를 읽는다",effects:{flags:{letter_read:true},score:2},next:"pier_letter_read"},
      {id:"burn",text:"편지를 태운다",effects:{flags:{letter_burned:true},money:3},next:"pier_letter_burn"},
      {id:"keep",text:"편지를 챙긴다",effects:{flags:{letter_kept:true},items:["젖은 편지"]},next:"pier_letter_keep"}
    ]
  },
  pier_letter_read:{
    title:"편지 속의 시간",
    text:"편지에는 오늘 날짜가 아닌 13분 뒤의 시간이 적혀 있다.",
    choices:[
      {id:"trust",text:"시간을 믿는다",effects:{flags:{future_time_trusted:true},score:3},next:"clock_signal"},
      {id:"doubt",text:"시간을 의심한다",effects:{flags:{future_time_doubted:true},score:1},next:"clock_signal"}
    ]
  },
  pier_letter_burn:{
    title:"재가 된 편지",
    text:"불이 꺼진 뒤 재 사이에서 작은 금속 조각이 반짝인다.",
    choices:[
      {id:"take",text:"금속 조각을 줍는다",effects:{items:["13분 금속편"],score:3},next:null},
      {id:"leave",text:"그대로 둔다",effects:{flags:{ash_left:true}},next:null}
    ]
  },
  pier_letter_keep:{
    title:"젖은 편지",
    text:"편지는 손에 넣은 순간부터 조금씩 글자가 바뀐다.",
    choices:[
      {id:"wait",text:"변화를 지켜본다",effects:{flags:{letter_watched:true},score:2},next:"clock_signal"},
      {id:"open",text:"문장을 찢어낸다",effects:{items:["찢긴 문장"],flags:{letter_torn:true}},next:null}
    ]
  },
  clock_signal:{
    title:"13분의 신호",
    text:"멀리서 시계가 한 번 울린다. 이상하게도 소리는 아직 울리지 않은 것처럼 느껴진다.",
    choices:[
      {id:"follow",text:"소리를 따라간다",effects:{flags:{followed_clock:true},score:4},next:"oldtown_clock"},
      {id:"record",text:"시간을 기록한다",effects:{flags:{clock_recorded:true},score:2},next:null},
      {id:"ignore",text:"무시한다",effects:{flags:{clock_ignored:true}},next:null}
    ]
  },
  oldtown_clock:{
    title:"멈춘 시계",
    text:"구시가지 수리점의 시계 세 개가 서로 다른 현재를 가리킨다.",
    choices:[
      {id:"open",text:"가장 늦은 시계를 연다",effects:{items:["부서진 시계"],flags:{clock_opened:true},score:4},next:"clock_inside"},
      {id:"compare",text:"세 시계를 비교한다",effects:{flags:{clock_compared:true},score:3},next:"clock_inside"},
      {id:"return",text:"수리공에게 돌려준다",effects:{flags:{clock_returned:true},score:2,mara_trust:2},next:null}
    ]
  },
  clock_inside:{
    title:"시계 안쪽",
    text:"시계 안에는 시곗바늘 대신 아주 작은 기억편이 들어 있다.",
    choices:[
      {id:"touch",text:"기억편을 만진다",effects:{items:["무주 기억편"],flags:{memory_touched:true},score:5},next:"memory_fragment"},
      {id:"seal",text:"다시 봉인한다",effects:{flags:{memory_sealed:true},mara_trust:1},next:null}
    ]
  },
  memory_fragment:{
    title:"주인 없는 기억",
    text:"누구의 것도 아닌 기억이 눈앞에 펼쳐진다. 존재하지 않았던 도시의 풍경이다.",
    choices:[
      {id:"believe",text:"기억을 믿는다",effects:{flags:{memory_believed:true},score:5},next:"memory_route"},
      {id:"question",text:"기억을 의심한다",effects:{flags:{memory_questioned:true},score:3},next:"memory_route"},
      {id:"erase",text:"기억을 지운다",effects:{flags:{memory_erased:true},score:1},next:null}
    ]
  },
  memory_route:{
    title:"기억의 주인",
    text:"기억 속에는 현재 도시에서 아직 만나지 못한 사람이 등장한다.",
    choices:[
      {id:"search",text:"그 사람을 찾는다",effects:{flags:{memory_person_search:true},score:4},next:null},
      {id:"archive",text:"기억 서고로 가져간다",effects:{flags:{memory_archived:true},score:3},next:null},
      {id:"hide",text:"아무에게도 말하지 않는다",effects:{flags:{memory_hidden:true},score:2},next:null}
    ]
  }
};

const SIDE_CHOICE_TREES = {
 greenhouse_seed:{
   title:"유리 씨앗",
   text:"유리온실의 씨앗 보관함에서 빛나는 씨앗 하나가 발견된다.",
   choices:[
     {id:"plant",text:"온실에 심는다",effects:{flags:{seed_planted:true},score:4},next:null},
     {id:"return",text:"룬에게 돌려준다",effects:{flags:{seed_returned:true},lune_trust:2},next:null},
     {id:"keep",text:"가지고 나온다",effects:{items:["유리 씨앗"],flags:{seed_kept:true},score:3},next:null}
   ]
 },
 observatory_water:{
   title:"수위의 거짓말",
   text:"관측소 기록과 실제 수위가 정확히 일치하지 않는다.",
   choices:[
     {id:"correct",text:"기록을 바로잡는다",effects:{flags:{water_corrected:true},score:4},next:null},
     {id:"hide",text:"오차를 숨긴다",effects:{flags:{water_hidden:true},score:5,orin_trust:-1},next:null},
     {id:"copy",text:"기록을 복사한다",effects:{items:["수위 기록편"],flags:{water_copied:true},score:2},next:null}
   ]
 },
 archive_ownerless:{
   title:"주인 없는 기억",
   text:"기억 서고의 봉인 서랍에서 소유자가 없는 기록이 발견된다.",
   choices:[
     {id:"open",text:"봉인을 푼다",effects:{flags:{archive_opened:true},score:5},next:"archive_after"},
     {id:"report",text:"베일에게 알린다",effects:{flags:{archive_reported:true},veil_trust:2},next:null},
     {id:"seal",text:"다시 봉인한다",effects:{flags:{archive_resealed:true},score:2},next:null}
   ]
 },
 archive_after:{
   title:"기록의 빈칸",
   text:"기록에는 사건보다 먼저 플레이어가 했던 행동의 흔적이 남아 있다.",
   choices:[
     {id:"continue",text:"계속 읽는다",effects:{flags:{archive_deep_read:true},score:6},next:null},
     {id:"close",text:"책을 닫는다",effects:{flags:{archive_closed:true}},next:null}
   ]
 }
};


const CROSS_WORLD_TREES = {
  mara_confrontation:{
    title:"마라가 알고 있다",
    text:"구시가지에서 네가 했던 선택이 돌아왔다. 마라는 시계에 관한 진실을 알고 있다.",
    choices:[
      {id:"confess",text:"사실대로 말한다",effects:{flags:{mara_confessed:true},mara_trust:2,score:3},next:"mara_after"},
      {id:"lie",text:"끝까지 부인한다",effects:{flags:{mara_lied:true},mara_trust:-3,score:2},next:"mara_after"},
      {id:"trade",text:"다른 단서를 건넨다",require:{item:"수위 기록편"},effects:{flags:{mara_traded:true},mara_trust:1,score:5},next:"mara_after"}
    ]
  },
  mara_after:{
    title:"마라의 대답",
    text:"마라는 오래된 지도를 꺼내 네게 건넨다.",
    choices:[
      {id:"accept",text:"지도를 받는다",effects:{items:["구시가지 지도"],flags:{mara_map:true},score:4},next:null},
      {id:"refuse",text:"지도를 거절한다",effects:{flags:{mara_map_refused:true}},next:null}
    ]
  },
  lune_seed:{
    title:"온실의 결과",
    text:"전에 심어둔 유리 씨앗에서 이상한 싹이 자랐다.",
    choices:[
      {id:"touch",text:"싹을 만진다",require:{flag:"seed_planted"},effects:{flags:{glass_sprout_touched:true},score:5},next:null},
      {id:"cut",text:"싹을 잘라낸다",require:{flag:"seed_planted"},effects:{flags:{glass_sprout_cut:true},score:3},next:null},
      {id:"observe",text:"아무것도 하지 않고 관찰한다",require:{flag:"seed_planted"},effects:{flags:{glass_sprout_observed:true},score:2},next:null}
    ]
  },
  archive_consequence:{
    title:"기록이 너를 기억한다",
    text:"기억 서고의 기록에 네가 했던 행동이 새 문장으로 나타났다.",
    choices:[
      {id:"read",text:"내 행동이 적힌 부분을 읽는다",require:{flag:"archive_opened"},effects:{flags:{self_record_read:true},score:6},next:null},
      {id:"erase",text:"기록에서 이름을 지운다",require:{flag:"archive_opened"},effects:{flags:{self_record_erased:true},score:4},next:null}
    ]
  }
};


const MANSION_ROOMS = {
hall:{name:"현관 홀",floor:"1F",desc:"낡은 석조 현관. 도시에서 돌아오면 가장 먼저 지나게 되는 곳.",actions:["clean","inspect"]},
kitchen:{name:"주방",floor:"1F",desc:"큰 조리대와 오래된 저장고가 있다.",actions:["cook","clean","repair"]},
dining:{name:"식당",floor:"1F",desc:"긴 식탁이 놓인 방. 창밖으로 수면 위 도시가 보인다.",actions:["eat","talk"]},
living:{name:"거실",floor:"1F",desc:"가족이 가장 오래 머무는 공간.",actions:["talk","rest","clean"]},
laundry:{name:"세탁실",floor:"1F",desc:"빗물과 지하수를 이용하는 오래된 세탁 설비.",actions:["wash","repair"]},
storage:{name:"창고",floor:"1F",desc:"도시에서 가져온 물건과 생활 자원을 보관한다.",actions:["sort","inspect"]},
greenhouse:{name:"온실",floor:"1F",desc:"깨진 유리 사이로 물가 식물이 자라는 온실.",actions:["plant","water","inspect"]},
dock:{name:"실내 선착장",floor:"1F",desc:"저택 뒤쪽 수로와 직접 연결된 작은 선착장.",actions:["prepare_trip","fish"]},
kids_a:{name:"아이 A의 방",floor:"2F",desc:"아이가 모아온 작은 물건들로 가득하다.",actions:["talk","clean","inspect"]},
kids_b:{name:"아이 B의 방",floor:"2F",desc:"책과 지도, 오래된 장난감이 놓여 있다.",actions:["talk","clean","inspect"]},
study:{name:"공동 서재",floor:"2F",desc:"도시의 지도와 저택의 오래된 기록을 함께 보관한다.",actions:["read","sort","inspect"]},
bedroom:{name:"옛 주인 침실",floor:"2F",desc:"아직 사용하지 않는 방. 오래된 가구가 그대로 남아 있다.",actions:["inspect"]},
guest:{name:"손님방",floor:"2F",desc:"필요할 때 잠시 쉴 수 있는 방.",actions:["rest","clean"]},
attic:{name:"다락",floor:"3F",desc:"아직 정리되지 않은 상자와 가구가 쌓여 있다.",actions:["inspect","sort"]},
archive:{name:"옛 주인 서재",floor:"3F",desc:"도시와 저택에 관한 문서가 남아 있다.",actions:["read","inspect"]},
music:{name:"음악실",floor:"3F",desc:"물에 젖지 않은 악기들이 이상할 정도로 잘 보존되어 있다.",actions:["play","inspect"]},
boiler:{name:"보일러실",floor:"B1",desc:"난방과 온수의 핵심.",actions:["repair","fuel"]},
water:{name:"물 저장고",floor:"B1",desc:"수면 아래에서 들어오는 물을 저장하고 정화한다.",actions:["purify","inspect"]},
workshop:{name:"수리실",floor:"B1",desc:"도시에서 가져온 부품을 수리할 수 있는 작업장.",actions:["repair","craft"]},
basement:{name:"지하 저장고",floor:"B2",desc:"절반이 물에 잠겨 있다. 방수 구조 덕분에 내부는 놀라울 정도로 보존되어 있다.",actions:["inspect","dive"]},
underwater:{name:"수중 복도",floor:"B2",desc:"저택 아래를 가로지르는 오래된 복도.",actions:["dive","inspect"]},
garden_b:{name:"지하 정원",floor:"B2",desc:"수면 아래에서도 살아가는 식물이 자라는 공간.",actions:["plant","inspect"]}
};
const MANSION_ACTIONS = {
clean:{label:"청소하기",effects:{home_clean:2,time:1},text:"먼지를 걷어냈다."},
cook:{label:"요리하기",effects:{food:2,time:1},text:"간단한 식사를 준비했다."},
eat:{label:"함께 식사하기",effects:{hunger:3,relationship:1,time:1},text:"식탁에 둘러앉아 식사를 했다."},
talk:{label:"이야기하기",effects:{relationship:2,time:1},text:"별것 아닌 이야기를 오래 나눴다."},
rest:{label:"쉬기",effects:{energy:3,time:2},text:"잠깐 몸을 쉬게 했다."},
repair:{label:"수리하기",effects:{house_condition:2,time:2},text:"망가진 설비를 손봤다."},
wash:{label:"빨래하기",effects:{home_clean:1,time:1},text:"빨래를 널었다."},
sort:{label:"정리하기",effects:{home_clean:1,time:1},text:"물건들을 정리했다."},
inspect:{label:"둘러보기",effects:{discover:1,time:1},text:"공간을 천천히 살펴봤다."},
plant:{label:"식물 돌보기",effects:{home_clean:1,time:1},text:"식물을 돌봤다."},
water:{label:"물 주기",effects:{home_clean:1,time:1},text:"온실에 물을 줬다."},
prepare_trip:{label:"원정 준비",effects:{prepared:1,time:1},text:"가방과 동물용 장비를 점검했다."},
fish:{label:"낚시하기",effects:{food:2,time:2},text:"수로에서 먹을 것을 건졌다."},
read:{label:"기록 읽기",effects:{knowledge:2,time:1},text:"오래된 기록을 읽었다."},
play:{label:"악기 연주하기",effects:{relationship:1,energy:1,time:1},text:"낡은 악기의 음을 맞춰 보았다."},
fuel:{label:"연료 보충",effects:{fuel:2,time:1},text:"보일러에 연료를 넣었다."},
purify:{label:"물 정화",effects:{water:3,time:1},text:"저장된 물을 정화했다."},
craft:{label:"부품 만들기",effects:{materials:-1,parts:1,time:2},text:"남은 재료로 부품을 만들었다."},
dive:{label:"잠수해서 조사",effects:{knowledge:2,time:2},text:"물속 복도를 조사했다."}
};


const MANSION_EVENT_COUNT = 6;
const MANSION_EVENTS = {
  kitchen_morning:{
    room:"kitchen",title:"아침의 부엌",
    text:"아침이 되자 주방 창문에 물방울이 잔뜩 맺혀 있다. 아이 A가 창밖을 보다가 작은 배 한 척을 가리킨다.",
    choices:[
      {id:"look",text:"같이 창밖을 본다",effects:{relationship:1,knowledge:1}},
      {id:"cook",text:"아침부터 배부터 챙긴다",effects:{food:1,relationship:1}},
      {id:"ask",text:"무슨 배인지 물어본다",effects:{knowledge:2}}
    ]
  },
  greenhouse_sprout:{
    room:"greenhouse",title:"유리 너머의 싹",
    text:"며칠 전에는 없었던 투명한 싹이 화분 가장자리에서 자라고 있다. 물속에 있을 때보다 수면 위에서 더 빠르게 움직이는 것 같다.",
    choices:[
      {id:"water",text:"물을 준다",effects:{home_clean:1,knowledge:1,flags:{sprout_watered:true}}},
      {id:"observe",text:"건드리지 않고 관찰한다",effects:{knowledge:2,flags:{sprout_observed:true}}},
      {id:"move",text:"창가로 옮긴다",effects:{knowledge:1,house_condition:-1,flags:{sprout_moved:true}}}
    ]
  },
  basement_echo:{
    room:"basement",title:"지하의 두드리는 소리",
    text:"물에 잠긴 저장고에서 세 번, 잠시 뒤 두 번. 일정한 간격으로 벽을 두드리는 소리가 들린다.",
    choices:[
      {id:"answer",text:"벽을 두드려 답한다",effects:{knowledge:3,flags:{basement_answered:true}}},
      {id:"wait",text:"조용히 기다린다",effects:{knowledge:1,flags:{basement_waited:true}}},
      {id:"leave",text:"오늘은 돌아간다",effects:{energy:1}}
    ]
  },
  kids_rain:{
    room:"kids_a",title:"비 오는 날",
    text:"비가 오래 내린다. 아이 A가 오늘은 도시로 나가지 말고 집 안에서 놀자고 한다.",
    choices:[
      {id:"game",text:"같이 놀아준다",effects:{relationship:3,energy:-1}},
      {id:"story",text:"옛 저택 이야기를 들려준다",effects:{relationship:2,knowledge:1}},
      {id:"work",text:"할 일을 끝내고 놀자고 한다",effects:{house_condition:1,relationship:1}}
    ]
  },
  attic_box:{
    room:"attic",title:"다락의 상자",
    text:"정리하지 않은 상자 하나가 스스로 조금 열려 있다. 안에는 오래된 학교 표찰과 작은 나무 호루라기가 있다.",
    choices:[
      {id:"open",text:"상자를 전부 연다",effects:{knowledge:2,flags:{old_box_opened:true}}},
      {id:"whistle",text:"호루라기를 불어본다",effects:{relationship:1,flags:{whistle_blown:true}}},
      {id:"close",text:"다시 닫아둔다",effects:{house_condition:1}}
    ]
  },
  study_map:{
    room:"study",title:"지도 위의 빈칸",
    text:"공동 서재의 지도에서 저택 뒤쪽 수로 한 구간만 잉크가 번져 있다. 도시 지도와 맞춰보면 이상하게도 비어 있는 장소다.",
    choices:[
      {id:"mark",text:"그 위치를 표시한다",effects:{knowledge:2,flags:{map_marked:true}}},
      {id:"compare",text:"도시에서 가져온 지도와 비교한다",effects:{knowledge:3,flags:{map_compared:true}}},
      {id:"ignore",text:"지금은 덮어둔다",effects:{energy:1}}
    ]
  }
};

const SCENE_SPOTS={
"estate:온실":["유리 온실의 숨","물방울이 유리 안쪽에서 위로 흐른다. 작은 잎 하나가 움직임을 따라 기울어진다."],"estate:서재":["두 개의 이름","같은 날짜에 서로 다른 필체로 같은 방 번호가 두 번 적혀 있다."],"estate:현관":["젖지 않은 발자국","현관은 젖어 있는데 발자국 하나만 마른 채 남아 있다."],"market:파이 가게":["오늘의 파이","파이 안쪽에서 종이 같은 것이 비친다."],"market:골동품상":["기억병 2417","선반 가장 안쪽의 병 하나에 2417이 적혀 있다."],"market:수로 계단":["수로 아래의 흔적","물이 빠진 순간 커다란 발자국과 작은 발자국이 함께 드러난다."],"pier:계류 밧줄":["새 매듭","세 개의 밧줄 중 붉은 매듭만 최근에 묶인 흔적이 있다."],"pier:발자국":["물가의 발자국","젖은 발자국이 선착장 끝에서 물속으로 이어진다."],"canal:우체통":["둘이서 읽는 편지","봉투에는 '혼자 읽지 말 것'이라고 적혀 있다."],"canal:유리창":["유리 너머의 방","비어 있어야 할 수로 벽 안쪽에 누군가 책상에 앉아 있다."],"canal:잠긴 문":["두 개의 손바닥","잠긴 문에는 손바닥 두 개를 동시에 댄 흔적이 있다."],"archive:열람실":["지워진 17번","옛 지도에는 17번 수로가 존재하지만 현재 지도에서는 지워져 있다."],"archive:금고":["두 개의 손","금고에는 두 개의 손바닥 자국이 있다."],"archive:금지서고":["없는 사람","삭제된 이름들이 모인 서고 한가운데 깨끗한 책 한 권이 놓여 있다."],"station:승강장":["도착하지 않은 열차","선로 끝에서 빛이 보이는데 열차 소리는 없다."],"station:역무실":["13분 늦은 시계","시계 뒤에는 누군가 매일 시간을 고쳐 적은 흔적이 있다."],"station:13분 늦은 시계":["시계 안의 하루","시계판 안쪽에서 아주 작은 종이 한 장이 발견된다."],"district:빈 집":["따뜻한 컵","아무도 살지 않는 집인데 컵 하나가 아직 따뜻하다."],"district:세탁소":["돌아온 옷","세탁소 주인이 이미 죽은 사람의 젖은 외투를 보여준다."],"district:옥상":["도시가 한 줄로 보이는 곳","옥상에서는 수면 위와 아래의 수로가 하나의 선처럼 이어져 보인다."],"hospital:병실 17":["내 것이 아닌 하루","환자가 사라진 하루의 날씨를 이야기한다."],"theater:영사실":["아직 오지 않은 영화","필름 속에는 지금과 닮은 도시가 찍혀 있고 사람들의 위치가 어긋나 있다."],"deep:수문":["두 사람의 문","수문에는 두 개의 손바닥 자국이 있다. 하나를 누르면 반대편 불빛이 켜진다."]};
function sceneFor(loc,spot,r,p){
  const key=`${loc}:${spot}`;
  const v=(r.spotVisits[key]||0)+1;
  const custom={
    "estate:온실":()=>{
      if(!r.flags.greenhouse_window){return {title:"유리 온실의 숨",text:"물방울이 유리 안쪽에서 위로 흐른다. 창문 틈에서는 바깥 수로의 냄새가 난다.",choices:[
        {id:"window",label:"창문을 연다",result:"수로에 젖지 않은 발자국 하나가 보인다.",clue:"온실에서 발견한 젖지 않은 발자국",knowledge:2,flag:"greenhouse_window",next:{title:"수로의 발자국",text:"발자국은 물가에서 멈추지 않고 수로 쪽으로 이어진다. 누군가 일부러 물을 피하고 걸은 것 같다.",choices:[
          {id:"follow",label:"발자국을 따라간다",result:"저택 뒤쪽 수로로 이어지는 길을 표시했다.",clue:"온실 뒤 수로로 이어지는 발자국",flag:"greenhouse_trail",knowledge:2},
          {id:"mark",label:"위치만 기록한다",result:"다음 방문 때 비교할 수 있도록 기록했다.",clue:"온실 발자국 위치 기록",knowledge:1},
          {id:"hide",label:"아이들에게는 말하지 않는다",result:"이상한 흔적을 혼자 간직했다.",flag:"greenhouse_secret",knowledge:1}
        ]}},
        {id:"leaf",label:"움직이는 잎을 만진다",result:"잎맥 안에서 작은 청동 조각을 발견했다.",item:"청동 태그 2417",clue:"온실에서 발견한 2417 태그",knowledge:2,flag:"tag_2417"},
        {id:"wait",label:"아무것도 건드리지 않고 기다린다",result:"세 번의 물방울 소리가 들린 뒤 온실이 조용해졌다.",clue:"온실에서 들은 세 번의 물방울",knowledge:1,flag:"greenhouse_wait"}
      ]}}
      if(r.flags.greenhouse_window && !r.flags.greenhouse_trail){return {title:"변한 발자국",text:"어제의 발자국과 오늘의 발자국 위치가 다르다. 누군가 이 길을 계속 사용하고 있다.",choices:[{id:"follow",label:"이번에는 따라간다",result:"수로 계단까지 이어지는 길을 찾아냈다.",clue:"반복해서 이동하는 발자국",knowledge:2,flag:"greenhouse_trail"},{id:"compare",label:"어제 기록과 비교한다",result:"발자국이 매일 몇 걸음씩 저택 쪽으로 이동한다.",clue:"발자국 이동 패턴",knowledge:3},{id:"ignore",label:"그냥 지나친다",result:"오늘은 기록만 남겼다.",knowledge:1}]};}
      return {title:"온실의 변화",text:"처음 보았던 잎들이 방향을 바꿨다. 바깥 수로 쪽을 향하고 있다.",choices:[{id:"water",label:"잎이 향하는 곳으로 물을 흘려본다",result:"작은 배수구가 열리며 지하로 내려가는 소리가 난다.",flag:"greenhouse_drain",knowledge:2},{id:"cut",label:"잎을 잘라 보관한다",result:"잎 안쪽에 같은 청동색 글씨가 나타났다.",item:"기록 잎사귀",knowledge:2},{id:"leave",label:"오늘은 두고 간다",result:"온실은 다시 조용해졌다.",energy:1}]};
    },
    "estate:서재":()=>{
      if(!r.flags.study_names){return {title:"두 개의 이름",text:"같은 날짜, 같은 방 번호에 서로 다른 이름이 적혀 있다. 둘 중 하나는 기록에서 지워졌다.",choices:[{id:"compare",label:"두 이름을 다른 기록과 대조한다",result:"한 이름이 2417이라는 번호와 반복해서 연결된다.",clue:"두 이름과 2417의 연관",knowledge:3,flag:"study_names"},{id:"ask",label:"아이들에게 묻는다",result:"나루는 그 이름을 들어본 적 있다고 말하지만 곧 말을 멈춘다.",clue:"나루가 알고 있는 지워진 이름",knowledge:2,relationship:1,flag:"study_asked"},{id:"close",label:"장부를 덮는다",result:"페이지 모서리에 젖은 손자국이 남았다.",clue:"서재 장부의 젖은 손자국",knowledge:1,flag:"study_hand"}]};}
      return {title:"비어 있는 자리",text:"처음에는 없었던 빈 칸에 오늘 날짜가 적혀 있다. 잉크는 아직 마르지 않았다.",choices:[{id:"write",label:"빈 칸에 오늘의 이름을 적는다",result:"글자가 잠시 나타났다가 사라졌다.",flag:"study_written",knowledge:2},{id:"wait",label:"잉크가 마르는 것을 기다린다",result:"사라진 글자 아래에 17이라는 숫자가 남았다.",clue:"서재에서 나타난 17",knowledge:2},{id:"remove",label:"페이지를 떼어낸다",result:"페이지 뒤쪽에서 수로 지도가 떨어졌다.",item:"찢어진 수로 지도",knowledge:3,flag:"study_page"}]};
    },
    "canal:우체통":()=>{
      if(!r.flags.letter_opened){return {title:"둘이서 읽는 편지",text:"봉투에는 '혼자 읽지 말 것'이라고 적혀 있다. 봉투가 이상하게 따뜻하다.",choices:[{id:"open",label:"혼자 열어본다",result:"첫 문장만 읽을 수 있었다. '네가 이것을 읽었다면 아직 늦지 않았다.'",clue:"우체통의 첫 문장",knowledge:2,flag:"letter_opened"},{id:"wait",label:"누군가와 함께 읽는다",result:"봉투 안쪽에 두 개의 손바닥 자국이 나타났다.",clue:"두 사람이 함께 읽어야 하는 편지",knowledge:3,flag:"letter_two"},{id:"take",label:"봉투를 집으로 가져간다",result:"봉투가 저택에 도착하자 글자가 한 줄 늘었다.",item:"이름 없는 편지",knowledge:2,flag:"letter_home"}]};}
      return {title:"두 번째 문장",text:"편지에는 오늘 발견한 단서가 정확히 적혀 있다. 마지막에는 아직 오지 않은 날짜가 쓰여 있다.",choices:[{id:"answer",label:"답장을 쓴다",result:"우체통 안에서 펜 끝이 움직이는 소리가 났다.",flag:"letter_answered",clue:"편지에 답장을 남겼다",knowledge:2},{id:"date",label:"날짜를 확인한다",result:"날짜는 13분 뒤의 시간을 가리킨다.",clue:"편지가 가리키는 13분",knowledge:3,flag:"letter_13"},{id:"burn",label:"편지를 태운다",result:"불은 꺼졌지만 재가 물속에서도 젖지 않았다.",clue:"젖지 않은 편지의 재",knowledge:2,flag:"letter_burned"}]};
    },
    "station:13분 늦은 시계":()=>{
      if(!r.flags.clock_opened){return {title:"시계 안의 하루",text:"시계판 안쪽에 아주 작은 종이가 접혀 있다. 시계는 정확히 13분 늦다.",choices:[{id:"open",label:"시계를 연다",result:"종이에는 '하루를 잃어버린 사람'이라고 적혀 있다.",clue:"시계 안쪽의 사라진 하루 기록",knowledge:3,flag:"clock_opened"},{id:"repair",label:"13분을 바로잡는다",result:"도시의 다른 시계가 동시에 한 번 멈췄다.",flag:"clock_fixed",knowledge:2},{id:"listen",label:"시계 소리를 듣는다",result:"종이 대신 세 번의 종소리가 들린다.",clue:"시계 안에서 들린 세 번의 종소리",knowledge:2,flag:"clock_listened"}]};}
      return {title:"바뀐 시각",text:"시계가 이제 12분 늦다. 누군가 계속 시간을 수정하고 있다.",choices:[{id:"follow",label:"수정한 흔적을 따라간다",result:"역무실 뒤쪽의 잠긴 서랍을 찾았다.",flag:"station_drawer",knowledge:2},{id:"ask",label:"역무원에게 묻는다",result:"역무원은 '도착하지 않은 승객'을 이야기한다.",clue:"도착하지 않은 승객",knowledge:2,relationship:1},{id:"leave",label:"기록만 남긴다",result:"시간 변화 자체를 사건 기록에 남겼다.",clue:"12분 늦어진 시계",knowledge:1}]};
    }
  };
  if(custom[key]) return custom[key]();
  const [title,text]=SCENE_SPOTS[key]||[`잠깐 멈춰 선 ${spot}`,`${spot} 주변을 천천히 살핀다. 익숙한 풍경 속에 아직 이름 붙이지 못한 흔적이 있다.`];
  if(v===1)return {title,text,choices:[{id:"observe",label:"천천히 관찰한다",result:"눈에 띄지 않던 작은 흔적을 발견했다.",clue:`${spot}의 첫 관찰 기록`,knowledge:2},{id:"touch",label:"직접 만져본다",result:"손에 작은 감촉이 남았다. 다음 방문 때 비교할 수 있을 것 같다.",clue:`${spot}에서 느낀 이상한 감촉`,knowledge:1},{id:"mark",label:"위치를 표시한다",result:"다시 돌아올 이유를 남겼다.",flag:`marked_${loc}_${spot}`,knowledge:1}]};
  if(v===2)return {title:`다시 온 ${spot}`,text:`처음 왔을 때와 똑같아 보이지만 한 가지가 달라졌다. ${r.flags[`marked_${loc}_${spot}`]?"내가 남긴 표시도 움직여 있다.":"누군가 다녀간 흔적이 있다."}`,choices:[{id:"compare",label:"처음 기록과 비교한다",result:"변화가 실제로 일어났다는 것을 확인했다.",clue:`${spot}의 변화 비교`,knowledge:2,flag:`compared_${loc}_${spot}`},{id:"search",label:"변한 부분만 찾는다",result:"새로운 흔적을 하나 더 찾았다.",clue:`${spot}의 두 번째 흔적`,knowledge:2},{id:"wait",label:"아무것도 하지 않고 기다린다",result:"주변 소리가 달라졌다.",clue:`${spot}에서 들은 변화`,knowledge:1}]};
  return {title:`익숙해진 장소`,text:`여러 번 찾아온 덕분에 이제 ${spot}의 이상한 부분이 눈에 들어온다.`,choices:[{id:"deep",label:"더 깊이 살핀다",result:"숨겨진 연결을 발견했다.",clue:`${spot}의 숨겨진 연결`,knowledge:3,flag:`deep_${loc}_${spot}`},{id:"use",label:"가지고 있는 단서와 맞춰본다",result:"서로 다른 단서가 하나의 패턴을 만든다.",clue:`${spot}과 기존 단서의 연결`,knowledge:3},{id:"leave",label:"다음 방문을 준비한다",result:"다음에 확인할 점을 기록했다.",clue:`${spot} 재방문 메모`,knowledge:1}]};
}


const SPACE_STATES={theater:{label:"극장",stages:{quiet:{text:"문 닫힌 극장. 젖은 포스터 하나가 벽에 붙어 있다.",actions:["peel_poster","leave"]},poster:{text:"포스터 뒤에 공연 날짜가 적혀 있다. 날짜 아래에는 작은 파란 점이 있다.",actions:["remember_date","check_back","leave"]},screen:{text:"전광판에 방금 본 날짜가 떠 있다. 무대 뒤쪽의 작은 문이 열렸다.",actions:["enter_backstage","leave"]},backstage:{text:"무대 뒤에는 도시의 수로와 이어지는 낡은 문이 있다. 안쪽에서 물소리가 난다.",actions:["listen","open_water_door","leave"]}}},greenhouse:{label:"온실",stages:{quiet:{text:"유리 온실. 바닥에는 젖은 흙과 작은 화분들이 있다.",actions:["open_window","touch_plant","leave"]},footprint:{text:"창밖 수로에 젖지 않은 발자국 하나가 보인다.",actions:["follow_print","record_print","leave"]},trail:{text:"발자국은 선착장 쪽에서 끊긴다. 화분 밑에 젖은 단추가 있다.",actions:["take_button","leave"]}}},study:{label:"공동 서재",stages:{quiet:{text:"도시 지도와 저택 기록이 놓여 있다. 수로 하나가 잉크로 지워져 있다.",actions:["compare_maps","leave"]},marked:{text:"지워진 수로의 위치를 지도 위에 표시했다. 선착장과 연결된다.",actions:["visit_dock","leave"]},route:{text:"지도 위에 저택에서 선착장으로 이어지는 경로가 드러났다.",actions:["follow_route","leave"]}}},dock:{label:"실내 선착장",stages:{quiet:{text:"선착장은 조용하다. 수면에 작은 매듭 하나가 떠 있다.",actions:["pick_knot","look_water","leave"]},water:{text:"물결이 이상하게 안쪽으로 흐른다.",actions:["wait","dive","leave"]},trace:{text:"수중 벽에 작은 파란 점이 그려져 있다. 극장에서 본 표시와 같다.",actions:["connect_clue","leave"]}}}};
const SPACE_ACTIONS={peel_poster:["poster","포스터를 떼었다.",1,"theater_poster"],remember_date:["screen","공연 날짜를 기억했다.",1,"theater_date"],check_back:["screen","다시 살피자 전광판이 켜졌다.",0,"theater_screen"],enter_backstage:["backstage","무대 뒤로 들어갔다.",2,"theater_backstage"],listen:["backstage","문 너머의 물소리를 들었다.",1,"water_sound"],open_water_door:["backstage","수로 문을 열었다.",0,"water_door"],open_window:["footprint","창문을 열자 수로 쪽에 발자국이 보였다.",1,"greenhouse_window"],touch_plant:["quiet","식물의 잎을 만졌다. 이상한 물방울이 떨어졌다.",1,"plant_touched"],follow_print:["trail","발자국을 따라 선착장 방향으로 갔다.",2,"footprint_followed"],record_print:["trail","발자국의 방향을 기록했다.",1,"footprint_recorded"],take_button:["trail","젖은 단추를 주웠다. 안쪽에 파란 점이 있다.",2,"blue_button"],compare_maps:["marked","두 지도를 겹치니 지워진 수로가 선착장으로 이어진다.",2,"maps_compared"],visit_dock:["route","지도에 선착장 경로를 표시했다.",0,"route_to_dock"],follow_route:["route","경로를 기억했다.",1,"route_learned"],pick_knot:["water","물 위의 매듭을 건졌다. 파란 점이 찍혀 있다.",2,"blue_knot"],look_water:["water","수면을 살피니 물결이 안쪽으로 흐른다.",1,"water_current"],wait:["trace","기다리자 물 아래에서 문이 닫히는 소리가 났다.",2,"underwater_door"],dive:["trace","잠수하자 벽에 작은 파란 점이 보였다.",2,"blue_mark"],connect_clue:["trace","극장과 선착장의 파란 점이 같은 표시임을 기록했다.",3,"blue_symbol_connected"]};

const LIFE_DAY={morning:{start:7,end:10},day:{start:10,end:17},evening:{start:17,end:21},night:{start:21,end:7}};
const LIFE_ACTIONS={
  cook:{time:60,energy:-3,hunger:25,text:"따뜻한 식사를 준비했다.",flag:"cooked"},
  eat:{time:30,energy:2,hunger:35,text:"식사를 마쳤다.",flag:"ate"},
  clean:{time:45,energy:-5,house:2,text:"집을 정리했다. 물기가 조금 줄었다.",flag:"cleaned"},
  repair:{time:90,energy:-8,house:5,text:"망가진 곳을 손봤다.",flag:"repaired"},
  garden:{time:60,energy:-5,house:1,text:"온실을 돌봤다. 새싹이 조금 자랐다.",flag:"gardened"},
  animal:{time:30,energy:-2,animal:3,text:"변이동물을 돌봤다. 기분이 좋아 보인다.",flag:"animal_cared"},
  talk_a:{time:20,energy:-1,relation:2,text:"아이 A와 잠깐 이야기를 나눴다.",flag:"talk_a"},
  talk_b:{time:20,energy:-1,relation:2,text:"아이 B와 잠깐 이야기를 나눴다.",flag:"talk_b"},
  rest:{time:60,energy:10,hunger:-5,text:"잠깐 쉬었다.",flag:"rested"}
};
function ensureLife(r){
  r.life=r.life||{day:1,minutes:450,energy:100,hunger:60,house:55,animal:60,relation:50,weather:"맑음",flags:{}};
  r.life.flags=r.life.flags||{};
}
function lifePhase(min){
  if(min>=420&&min<600)return"morning";
  if(min>=600&&min<1020)return"day";
  if(min>=1020&&min<1260)return"evening";
  return"night";
}


// ===== WATERLINE FINAL LIFE ENGINE =====
const FINAL_CONTENT = {
  weather:["맑음","잔비","짙은 안개","강한 비"],
  rooms:{
    kitchen:{name:"부엌",icon:"🍲",actions:["cook","wash"]},
    greenhouse:{name:"온실",icon:"🌿",actions:["garden","window"]},
    study:{name:"서재",icon:"📚",actions:["read","map"]},
    dock:{name:"수중 선착장",icon:"⚓",actions:["boat","water"]},
    attic:{name:"다락",icon:"📦",actions:["sort","look"]},
    hall:{name:"현관",icon:"🚪",actions:["tidy","listen"]}
  },
  city:{
    market:{name:"운하 시장",desc:"배와 상점이 빽빽한 생활권.",actions:["shop","talk"]},
    quay:{name:"낡은 선착장",desc:"도시 외곽으로 이어지는 물길.",actions:["fish","search"]},
    archive:{name:"기록보관소",desc:"수몰 이전의 기록이 남아 있다.",actions:["read","search"]},
    oldquarter:{name:"구주거구",desc:"사람들이 여전히 살아가는 오래된 구역.",actions:["trade","walk"]}
  },
  items:{
    fish:{name:"생선",icon:"🐟"}, apple:{name:"사과",icon:"🍎"}, herb:{name:"허브",icon:"🌱"},
    plank:{name:"나무판",icon:"🪵"}, glass:{name:"유리 조각",icon:"◇"}, button:{name:"파란 단추",icon:"🔵"},
    letter:{name:"젖은 편지",icon:"✉"}, key:{name:"녹슨 열쇠",icon:"🗝"}, seed:{name:"수생 씨앗",icon:"🌰"}
  }
};
const FINAL_EVENTS = [
 {id:"wet_shoe",day:2,when:"morning",title:"현관의 젖은 신발",text:"현관 한가운데 젖은 신발 한 짝이 놓여 있다. 아이들의 것은 아니다.",choices:[
   {id:"keep",label:"치워 둔다",effects:{flags:["shoe_kept"],clue:1}},
   {id:"ask",label:"아이들에게 묻는다",effects:{relation:2,flags:["shoe_asked"]}}
 ]},
 {id:"window",day:3,when:"evening",title:"열린 온실 창문",text:"바람도 없는데 온실 창문이 열려 있다. 흙 위에 작은 물방울이 이어져 있다.",choices:[
   {id:"follow",label:"물방울을 따라간다",effects:{flags:["drops_followed"],clue:2}},
   {id:"close",label:"창문을 닫는다",effects:{house:2}}
 ]},
 {id:"child_button",day:4,when:"afternoon",title:"아이의 주머니",text:"아이 B가 작은 파란 단추를 내민다. '선착장에서 주웠어.'",choices:[
   {id:"keep",label:"보관한다",effects:{item:["button"],flags:["button_found"],clue:1}},
   {id:"return",label:"같은 곳에 돌려놓자",effects:{flags:["button_returned"],clue:1}}
 ]},
 {id:"animal",day:5,when:"night",title:"문 앞의 변이동물",text:"거대한 동물이 잠들지 않고 현관만 바라보고 있다.",choices:[
   {id:"follow",label:"따라간다",effects:{flags:["animal_lead"],clue:2}},
   {id:"stay",label:"곁에 앉는다",effects:{animal:5,relation:2}}
 ]},
 {id:"letter",day:6,when:"morning",title:"수로에 떠온 편지",text:"봉투 하나가 집 안쪽 선착장에 걸려 있다. 발신인은 없다.",choices:[
   {id:"open",label:"편지를 연다",effects:{item:["letter"],flags:["letter_open"],clue:2}},
   {id:"dry",label:"말려 둔다",effects:{item:["letter"],flags:["letter_dry"]}}
 ]},
 {id:"rain",day:7,when:"afternoon",title:"수위가 오른 날",text:"수면이 평소보다 높다. 도시로 가는 가장 짧은 길이 잠겼다.",choices:[
   {id:"stay",label:"오늘은 집에 있는다",effects:{house:2,flags:["rain_stay"]}},
   {id:"long",label:"먼 길로 돌아간다",effects:{flags:["rain_long_route"],clue:1}}
 ]},
 {id:"seed",day:8,when:"morning",title:"유리 아래의 씨앗",text:"온실 바닥 틈에서 작은 수생 씨앗이 발견됐다.",choices:[
   {id:"plant",label:"온실에 심는다",effects:{item:["seed"],flags:["seed_planted"],house:2}},
   {id:"store",label:"다락에 보관한다",effects:{item:["seed"],flags:["seed_stored"]}}
 ]},
 {id:"map",day:9,when:"evening",title:"지워진 수로",text:"서재 지도에서 지워진 선 하나가 파란 단추의 표시와 같은 모양이다.",choices:[
   {id:"mark",label:"지도에 표시한다",effects:{flags:["route_marked"],clue:3}},
   {id:"erase",label:"아무것도 건드리지 않는다",effects:{flags:["route_unmarked"]}}
 ]},
 {id:"door",day:10,when:"night",title:"잠긴 수중문",text:"집 아래쪽에서 아주 짧게 금속 부딪히는 소리가 난다.",choices:[
   {id:"key",label:"녹슨 열쇠를 시험한다",effects:{flags:["underdoor_open"],item:["key"],clue:3}},
   {id:"wait",label:"아침까지 기다린다",effects:{flags:["underdoor_wait"]}}
 ]},
 {id:"festival",day:11,when:"day",title:"운하의 작은 축제",text:"시장 쪽에서 음악이 들린다. 아이들이 가 보고 싶어 한다.",choices:[
   {id:"go",label:"함께 간다",effects:{relation:5,flags:["festival"],item:["apple"]}},
   {id:"stay",label:"오늘은 집에서 쉰다",effects:{house:2}}
 ]},
 {id:"truth",day:12,when:"night",title:"파란 표시",text:"지금까지 모은 표시들이 하나의 경로를 가리킨다. 집의 수중 선착장에서 시작한다.",choices:[
   {id:"go",label:"경로를 따라간다",effects:{flags:["final_route"],clue:4}},
   {id:"sleep",label:"오늘은 자고 내일 간다",effects:{flags:["final_delay"]}}
 ]}
];
function ensureFinal(r){
 r.final=r.final||{day:1,minutes:420,energy:92,hunger:55,house:52,animal:62,relation:50,money:35,weather:"맑음",inventory:{fish:2,apple:1,herb:1,plank:2,glass:0,button:0,letter:0,key:0,seed:0},rooms:{kitchen:0,greenhouse:0,study:0,dock:0,attic:0,hall:0},flags:{},clues:0,activeEvent:null,doneEvents:[],trip:null,toast:null};
 r.final.inventory=r.final.inventory||{};
 r.final.rooms=r.final.rooms||{};
 r.final.flags=r.final.flags||{};
 r.final.doneEvents=r.final.doneEvents||[];
}
function fPhase(m){if(m>=360&&m<600)return"아침";if(m>=600&&m<1020)return"낮";if(m>=1020&&m<1260)return"저녁";return"밤";}
function fWeather(day){return FINAL_CONTENT.weather[(day*7+3)%FINAL_CONTENT.weather.length];}
function fItem(r,id,n=1){ensureFinal(r);r.final.inventory[id]=(r.final.inventory[id]||0)+n;}
function fAdvance(r,min){
 ensureFinal(r);r.final.minutes+=min;
 while(r.final.minutes>=1440){r.final.minutes-=1440;r.final.day++;r.final.hunger=Math.max(0,r.final.hunger-12);r.final.energy=Math.min(100,r.final.energy+70);r.final.weather=fWeather(r.final.day);r.final.activeEvent=null;}
 r.final.hunger=Math.max(0,Math.min(100,r.final.hunger));
 r.final.energy=Math.max(0,Math.min(100,r.final.energy));
}
function fEventFor(r){
 ensureFinal(r);const phase=fPhase(r.final.minutes);
 const order={아침:0,낮:1,저녁:2,밤:3};
 return FINAL_EVENTS.find(e=>e.day===r.final.day&&order[phase]>=order[e.when]&&!r.final.doneEvents.includes(e.id))||null;
}
function fApplyEffects(r,e){
 const x=e.effects||{};ensureFinal(r);
 if(x.item) x.item.forEach(id=>fItem(r,id));
 if(x.flags)x.flags.forEach(k=>r.final.flags[k]=true);
 for(const k of ["relation","house","animal","clue"]) if(x[k]) r.final[k]=Math.max(0,(r.final[k]||0)+x[k]);
}

io.on("connection",s=>{
s.on("create",({name},cb)=>{let code;do code=Math.random().toString(36).slice(2,8).toUpperCase();while(rooms.has(code));let r=mk(code);r.players.set(s.id,player(s.id,name,"A"));rooms.set(code,r);s.join(code);s.data.code=code;newEvent(r);log(r,"DAY 1 · 08:30 — 저택 아래에서 세 번의 종소리가 들렸다.","chapter");cb({ok:true,code});io.to(code).emit("state",pub(r))});
s.on("join",({name,code},cb)=>{let r=rooms.get((code||"").toUpperCase());if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});if(r.players.size>=2)return cb({ok:false,error:"2인방은 가득 찼다."});r.players.set(s.id,player(s.id,name,"B"));s.join(r.code);s.data.code=r.code;log(r,`${name||"동료"}가 도시에 합류했다.`,"system");cb({ok:true,code:r.code});io.to(r.code).emit("state",pub(r))});
s.on("move",({to},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return;if(!A[p.loc].links.includes(to))return cb({ok:false,error:"그곳으로 바로 이동할 수 없다."});if(!canEnter(r,to))return cb({ok:false,error:"아직 이 지역에 들어갈 조건이 갖춰지지 않았다. 단서와 관계를 더 쌓아보자."});if(p.actions<1)return cb({ok:false,error:"행동력이 부족하다."});p.loc=to;p.actions--;advance(r);log(r,`${p.name} → ${A[to].n}`,"move");if(Math.random()<.25){let e=r.event;log(r,`이동 중 사건: ${e.title} — ${e.text}`,"event")}sideAdvance(r,p);io.to(r.code).emit("state",pub(r));cb({ok:true})});
s.on("inspect",({spot},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return;if(p.actions<1)return cb({ok:false,error:"행동력이 부족하다."});let sp=A[p.loc]?.spots?.[spot];if(!sp)return cb({ok:false,error:"조사 지점을 찾을 수 없다."});p.actions--;advance(r);const key=`${p.loc}:${sp}`;r.spotVisits[key]=(r.spotVisits[key]||0)+1;const sc=sceneFor(p.loc,sp,r,p);r.scene={id:`${key}:${Date.now()}`,loc:p.loc,spot:sp,visit:r.spotVisits[key],...sc};log(r,`${p.name}이(가) ${sp} 앞에서 멈췄다.`,'scene');io.to(r.code).emit('state',pub(r));cb({ok:true,scene:r.scene});});
s.on("sceneChoice",({choice},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||!r.scene)return cb({ok:false,error:"진행 중인 장면이 없다."});const c=r.scene.choices.find(x=>x.id===choice);if(!c)return cb({ok:false,error:"그 선택은 없다."});if(typeof c.money==='number'&&p.money+c.money<0)return cb({ok:false,error:"돈이 부족하다."});if(typeof c.money==='number')p.money+=c.money;if(typeof c.energy==='number')p.energy=Math.max(0,Math.min(100,p.energy+c.energy));if(typeof c.relationship==='number'){p.rel=p.rel||{};p.rel.naru=(p.rel.naru||0)+c.relationship;r.mansionState.relationship=(r.mansionState.relationship||0)+c.relationship;}if(c.item&&!p.items.includes(c.item))p.items.push(c.item);if(c.flag){r.flags[c.flag]=true;p.flags=p.flags||{};p.flags[c.flag]=true;}if(c.clue)clue(r,p,c.clue,r.scene.loc,'scene');if(c.knowledge){r.score+=c.knowledge;if(!c.clue)clue(r,p,`${r.scene.spot} · ${c.result}`,r.scene.loc,'scene');}r.sceneHistory.push({day:r.day,loc:r.scene.loc,spot:r.scene.spot,choice:c.label,result:c.result});if(r.sceneHistory.length>80)r.sceneHistory.shift();log(r,`${p.name}의 선택 — ${c.label} · ${c.result}`,'choice');
if(c.next){const next={...c.next};r.scene={id:`chain:${Date.now()}`,loc:r.scene.loc,spot:r.scene.spot,visit:r.scene.visit,title:next.title,text:next.text,choices:next.choices};io.to(r.code).emit('state',pub(r));return cb({ok:true,text:c.result,item:c.item||null,continued:true});}
r.scene=null;combine(r,p);maybeMain(r);io.to(r.code).emit('state',pub(r));cb({ok:true,text:c.result,item:c.item||null});});
s.on("share",({index},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||!p.clues[index])return cb({ok:false,error:"단서가 없다."});p.shared.push(p.clues[index]);log(r,`${p.name}이(가) 단서를 공개했다.`,"share");io.to(r.code).emit("state",pub(r));cb({ok:true})});
s.on("talk",({npc},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id),n=NPC[npc];if(!r||!p||!n)return cb({ok:false,error:"NPC를 찾을 수 없다."});if(p.loc!==n.area)return cb({ok:false,error:"그 NPC가 있는 지역으로 이동해야 한다."});if(p.actions<1)return cb({ok:false,error:"행동력이 부족하다."});p.actions--;advance(r);let lv=(p.rel[npc]||0)+1;p.rel[npc]=Math.min(lv,n.max);r.stats.talks++;const lines={
naru:["오늘도 종소리가 났어.","서재 장부의 이름 하나는 내가 본 적 있어.","그 사람은 우리 집에 왔었어.","그런데 밀로는 그 사람을 기억하지 못해.","내가 기억하는 사람이 정말 있었던 사람인지 모르겠어.","17번 수로를 따라가면 그 사람의 집이 나와.","그 집은 지금도 따뜻해.","만약 내가 그 사람을 잊으면, 도시도 잊어버릴까?"],
milo:["저택 아래에 비밀 통로가 있어.","나는 지도 없이도 시장까지 갈 수 있어.","17번 수로는 지도보다 길어.","거기서 이상한 우체통을 본 적 있어.","우체통이 나한테 답장을 했어.","편지에는 내 이름이 아니라 네 이름이 적혀 있었어.","어제는 편지가 아직 일어나지 않은 일을 알고 있더라.","그래서 오늘부터 너랑 같이 찾아볼 거야."],
pie:["오늘은 파이가 잘 구워졌어.","시장 사람들은 17번 수로 이야기를 싫어해.","예전에 그쪽에서 아이 하나가 사라졌거든.","사라진 아이의 가족은 아직 파이를 사러 와.","그 가족은 아이가 돌아왔다고 믿고 있어.","나는 그 아이가 돌아온 적 없다고 생각해."],
antique:["기억병은 비싸.","2417은 오래된 번호야.","그 번호가 붙은 기억은 주인이 없어.","주인이 없는데도 기억은 계속 자라.","어떤 기억은 도시 전체를 기억하고 있지.","나는 그걸 팔지 않을 거야.","하지만 네가 정말 보고 싶다면 금고를 열 방법을 알려줄게."],
keeper:["이 역은 폐쇄됐어.","밤이면 불이 켜져.","시계는 항상 13분 늦어.","열차는 역에 도착한 뒤 출발하지 않아.","승객들은 모두 자기 목적지를 잊어.","한 번은 내 이름도 잊은 승객이 있었어.","그 사람은 '아직 하루가 끝나지 않았다'고 했지.","그날 이후 나는 시간을 기록하기 시작했어."],
archivist:["기록은 거짓말을 하지 않아.","하지만 기록하는 사람이 거짓말을 할 수는 있지.","없는 사람의 기록은 너무 많아.","그 이름은 여러 기록에서 삭제됐다.","삭제된 자리에는 항상 2417이 남아.","나는 그 번호가 사람을 가리키는 게 아니라고 생각해.","그건 하루를 가리키는 번호일지도 몰라.","그 하루가 사라지면서 사람도 사라진 거야."],
doctor:["기억 이상은 치료할 수 있어.","하지만 외부에서 들어온 기억은 달라.","병실 17의 환자는 자기 것이 아닌 하루를 살고 있어.","그 하루는 도시의 기록에 없어.","환자는 계속 같은 종소리를 듣는다.","세 번.","나는 그 소리가 치료 신호라고 생각했어.","지금은 반대로 생각해. 누군가 우리에게 신호를 보내는 거야."],
actor:["영화는 상영되지 않았어.","그런데 표는 팔렸지.","필름 속 도시는 우리 도시와 너무 비슷해.","차이는 건물보다 사람의 위치야.","모든 사람이 한 자리씩 어긋나 있어.","마치 기억이 조금씩 밀린 것처럼.","마지막 장면에는 저택이 나와.","그리고 네가 서 있어.","영화는 아직 끝나지 않았어."],
washer:["이 동네 사람들은 이상한 옷을 맡겨.","죽은 사람 옷이 돌아오기도 해.","돌아온 옷은 항상 젖어 있어.","주머니에서 다른 사람의 열쇠가 나와.","어제는 2417이라고 적힌 열쇠가 나왔어.","그걸 시장 골동품상에게 보여줬더니 얼굴이 굳더라."]
};let arr=lines[npc]||["별일 없어요."];let text=arr[Math.min(lv-1,arr.length-1)];clue(r,p,`${n.n}: ${text}`,n.area,"talk");combine(r,p);log(r,`${n.n}: ${text}`,"npc");maybeMain(r);io.to(r.code).emit("state",pub(r));cb({ok:true,text})});
s.on("event",({choice},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||!r.event)return cb({ok:false,error:"사건이 없다."});if(p.actions<1)return cb({ok:false,error:"행동력이 부족하다."});p.actions--;advance(r);let e=r.event;if(choice==="investigate"){clue(r,p,`사건 조사 · ${e.title}: ${e.text}`,e.area,"event");p.money+=6}
else if(choice==="help"){p.money+=10;p.energy=Math.max(0,p.energy-6);log(r,`${p.name}은(는) 사건을 도왔다. 보상 10c.`,"reward")}
else{p.energy=Math.min(100,p.energy+4);log(r,`${p.name}은(는) 사건을 지나쳤다.`,"event")}
if(e.title==="시장 소동") choiceWorld(r,"market_fire",choice==="help"?"help":choice==="investigate"?"investigate":"ignore");
if(e.title==="무음 열차") choiceWorld(r,"station_clock",choice==="investigate"?"repair":choice==="help"?"repair":"break");
if(e.title==="병실의 바다") choiceWorld(r,"hospital_patient",choice==="investigate"?"believe":choice==="help"?"believe":"report");
if(e.title==="마지막 상영") choiceWorld(r,"theater_film",choice==="investigate"?"watch":choice==="help"?"watch":"burn");
if(e.title==="검은 계단") choiceWorld(r,"water_gate",choice==="help"?"turn":choice==="investigate"?"turn":"wait");r.event.used=true;io.to(r.code).emit("state",pub(r));cb({ok:true})});
s.on("rest",()=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return;p.actions=Math.min(10,p.actions+3);p.energy=Math.min(100,p.energy+18);p.hunger=Math.max(0,p.hunger-4);advance(r);log(r,`${p.name}이(가) 잠시 쉬었다.`,"rest");io.to(r.code).emit("state",pub(r))});
s.on("buy",({item},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||p.loc!=="market")return cb({ok:false,error:"시장에 있어야 한다."});let price={파이:6,기억병:12,담요:8,열쇠:18}[item];if(!price||p.money<price)return cb({ok:false,error:"살 수 없다."});p.money-=price;p.items.push(item);p.actions--;advance(r);log(r,`${p.name}이(가) ${item}을 구입했다.`,"trade");io.to(r.code).emit("state",pub(r));cb({ok:true})});
s.on("chat",({text})=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(r&&p)io.to(r.code).emit("chat",{name:p.name,text:String(text||"").slice(0,160)})});

s.on("eventChoice",({choice},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});if(!r.event)return cb({ok:false,error:"현재 사건이 없다."});let e=r.event; if(choice==="investigate"){clue(r,p,`사건 조사 · ${e.title}: ${e.text}`,e.area,"event");p.money+=6;r.score+=2}else if(choice==="help"){p.money+=10;p.energy=Math.max(0,p.energy-6);r.score+=3;log(r,`${p.name}이(가) 사건을 도왔다. 보상 10c.`,"reward")}else{p.energy=Math.min(100,p.energy+4);log(r,`${p.name}은(는) 사건을 지나쳤다.`,"event")} if(e.title==="시장 소동")choiceWorld(r,"market_fire",choice==="help"?"help":choice==="investigate"?"investigate":"ignore");r.event=null;r.stats.events++;combine(r,p);io.to(r.code).emit("state",pub(r));cb({ok:true})});
s.on("inspectSpot",({spot},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 let region=REGIONS_EXTRA[p.loc];if(!region||!region.spots.includes(spot))return cb({ok:false,error:"그 장소는 여기 없다."});
 let reward=2;let item=null;
 if(spot==="시계 수리점"||spot==="수위계") item=region.name==="구시가지"?"부서진 시계":"수위 기록편";
 if(spot==="씨앗 보관함") item="유리 씨앗";
 if(spot==="합성기록") item="무주 기억편";
 if(spot==="낡은 망원경") item="13분 관측";
 if(spot==="봉인 서랍") item="봉인 열쇠";
 if(item&&!p.items.includes(item)){p.items.push(item);r.inventory.push(item);reward+=3;}
 p.money+=reward;r.score+=2;r.stats.discoveries++;combine(r,p);log(r,`${p.name}이(가) ${spot}을 조사했다.${item?` · ${item} 획득`:""}`,"discover");
 io.to(r.code).emit("state",pub(r));cb({ok:true,item});
});

s.on("extraTalk",({id},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id),ex=NPC_EXTRA[id];
 if(!r||!p||!ex||ex.area!==p.loc)return cb({ok:false,error:"이 사람은 지금 여기 없다."});
 p.rel=p.rel||{};p.flags=p.flags||{};p.items=p.items||[];let step=p.rel[id]||0;let text=ex.lines[Math.min(step,ex.lines.length-1)];
 p.rel[id]=step+1;p.money+=2;clue(r,p,`${ex.name}: ${text}`,ex.area,"talk");log(r,`${ex.name}: ${text}`,"npc");
 io.to(r.code).emit("state",pub(r));cb({ok:true,text});
});

function applyChoiceEffects(p,effects){
 effects=effects||{};p.flags=p.flags||{};p.items=p.items||[];p.rel=p.rel||{};
 if(effects.flags)Object.assign(p.flags,effects.flags);
 if(Array.isArray(effects.items))for(const it of effects.items)if(!p.items.includes(it))p.items.push(it);
 if(typeof effects.score==="number")p.score+=effects.score;
 if(typeof effects.money==="number")p.money+=effects.money;
 for(const [k,v] of Object.entries(effects)){if(k.endsWith("_trust"))p.rel[k.replace("_trust","")]=(p.rel[k.replace("_trust","")]||0)+v;}
}
function choiceAvailable(p,c){
 const req=c.require||{};if(req.flag && !p.flags?.[req.flag])return false;
 if(req.item && !(p.items||[]).includes(req.item))return false;
 if(typeof req.score==="number" && p.score<req.score)return false;
 return true;
}
function beginChoiceTree(r,p,id){
 const tree=CHOICE_TREE[id]||SIDE_CHOICE_TREES[id];if(!tree)return null;
 r.choiceState=r.choiceState||{current:null,history:[]};
 r.choiceState.current={id,tree};return tree;
}


s.on("worldConsequence",({kind},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);
 if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 let id=null;
 if(kind==="mara" && (p.flags?.clock_taken||p.flags?.clock_opened||p.flags?.letter_kept)) id="mara_confrontation";
 if(kind==="lune" && p.flags?.seed_planted) id="lune_seed";
 if(kind==="archive" && p.flags?.archive_opened) id="archive_consequence";
 if(!id)return cb({ok:false,error:"지금은 발생할 세계 변화가 없다."});
 const tree=CROSS_WORLD_TREES[id];
 beginChoiceTree(r,p,id);
 io.to(r.code).emit("state",pub(r));
 cb({ok:true,tree});
});
s.on("triggerChoice",({kind},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 const ids={pier:"pier_letter",oldtown:"oldtown_clock",greenhouse:"greenhouse_seed",observatory:"observatory_water",archive2:"archive_ownerless"};
 const id=ids[p.loc];if(!id)return cb({ok:false,error:"이 지역에는 아직 선택지가 없다."});
 const tree=beginChoiceTree(r,p,id);io.to(r.code).emit("state",pub(r));cb({ok:true,tree});
});




s.on("lifeAction",({action},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 ensureLife(r);const a=LIFE_ACTIONS[action];if(!a)return cb({ok:false,error:"알 수 없는 행동이다."});
 const phase=lifePhase(r.life.minutes);
 if(action==="cook" && (phase==="night"))return cb({ok:false,error:"밤이라 부엌 불을 켜기 어렵다."});
 if(action==="garden" && phase==="night")return cb({ok:false,error:"온실은 너무 어둡다."});
 if(r.life.energy+a.energy<=0)return cb({ok:false,error:"너무 지쳤다. 잠깐 쉬어야 한다."});
 r.life.minutes+=a.time;r.life.energy=Math.max(0,Math.min(100,r.life.energy+a.energy));
 r.life.hunger=Math.max(0,Math.min(100,r.life.hunger+a.hunger||0));
 r.life.house=Math.max(0,Math.min(100,r.life.house+a.house||0));
 r.life.animal=Math.max(0,Math.min(100,r.life.animal+a.animal||0));
 r.life.relation=Math.max(0,Math.min(100,r.life.relation+a.relation||0));
 r.life.flags[a.flag]=true;
 if(r.life.minutes>=1440){r.life.minutes-=1440;r.life.day++;r.life.hunger=Math.max(0,r.life.hunger-15);r.life.energy=85;}
 log(r,`${a.text}`,"life");
 io.to(r.code).emit("state",pub(r));cb({ok:true,text:a.text});
});

s.on("finalBoot",(_,cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false});
 ensureFinal(r);r.final.weather=fWeather(r.final.day);r.final.activeEvent=fEventFor(r)?.id||null;
 io.to(r.code).emit("state",pub(r));cb({ok:true});
});
s.on("finalHomeAction",({action},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false});
 ensureFinal(r);const p=fPhase(r.final.minutes);
 const cfg={
  cook:{min:45,energy:-5,hunger:22,house:1,need:"fish",gain:null,text:"냄비에서 김이 오른다."},
  eat:{min:20,energy:4,hunger:28,text:"따뜻한 그릇이 비었다."},
  clean:{min:35,energy:-4,house:3,text:"바닥의 물기가 줄었다."},
  repair:{min:70,energy:-7,house:5,need:"plank",text:"젖은 나무판이 새 판자로 바뀌었다."},
  garden:{min:50,energy:-4,house:2,text:"온실의 새싹이 한 뼘 자랐다."},
  animal:{min:25,energy:-2,animal:4,text:"거대한 동물이 꼬리를 한 번 흔든다."},
  talk_a:{min:20,energy:-1,relation:3,text:"아이 A가 오늘 있었던 일을 들려준다."},
  talk_b:{min:20,energy:-1,relation:3,text:"아이 B가 주머니 속 작은 물건을 보여준다."},
  rest:{min:60,energy:12,hunger:-4,text:"잠깐 눈을 붙였다."},sleep:{min:480,energy:90,hunger:-10,text:"하루가 저물고, 집 안이 조용해졌다."}
 }[action];
 if(!cfg)return cb({ok:false,error:"행동을 찾을 수 없다."});
 if(cfg.need&&((r.final.inventory[cfg.need]||0)<=0))return cb({ok:false,error:"필요한 물건이 없다."});
 if(r.final.energy+cfg.energy<1)return cb({ok:false,error:"너무 지쳤다."});
 if(action==="garden"&&p==="밤")return cb({ok:false,error:"온실이 너무 어둡다."});
 if(action==="cook"&&p==="밤")return cb({ok:false,error:"부엌 불을 켜기엔 너무 늦었다."});
 if(cfg.need)r.final.inventory[cfg.need]--;
 fAdvance(r,cfg.min);r.final.energy+=cfg.energy;r.final.hunger+=cfg.hunger||0;r.final.house+=cfg.house||0;r.final.animal+=cfg.animal||0;r.final.relation+=cfg.relation||0;
 r.final.energy=Math.min(100,Math.max(0,r.final.energy));r.final.house=Math.min(100,r.final.house);r.final.animal=Math.min(100,r.final.animal);r.final.relation=Math.min(100,r.final.relation);
 if(action==="cook")fItem(r,"fish",1);
 if(action==="sleep"){r.final.minutes=420;r.final.day++;r.final.energy=90;r.final.weather=fWeather(r.final.day);r.final.hunger=Math.max(0,r.final.hunger-12);r.final.activeEvent=fEventFor(r)?.id||null;}
 r.final.toast=cfg.text;
 r.final.activeEvent=fEventFor(r)?.id||null;
 log(r,cfg.text,"life_final");io.to(r.code).emit("state",pub(r));cb({ok:true,text:cfg.text});
});
s.on("finalCityAction",({place,action},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false});ensureFinal(r);
 const acts={
  market:{shop:{min:40,money:-5,item:"apple",text:"시장 상인이 사과 하나를 건넸다."},talk:{min:25,relation:3,text:"상인이 오늘 수위에 대해 알려준다."}},
  quay:{fish:{min:60,energy:-8,item:"fish",text:"수로에서 싱싱한 생선을 건졌다."},search:{min:55,energy:-6,item:"button",text:"젖은 틈에서 파란 단추를 발견했다."}},
  archive:{read:{min:50,energy:-3,clue:2,text:"수몰 이전의 지도가 하나 남아 있었다."},search:{min:70,energy:-5,item:"key",clue:1,text:"서랍 깊숙한 곳에서 녹슨 열쇠를 찾았다."}},
  oldquarter:{trade:{min:40,money:-3,item:"herb",text:"주민과 허브를 교환했다."},walk:{min:50,energy:-5,clue:1,text:"좁은 골목 끝에서 오래된 파란 표시를 보았다."}}
 }[place]?.[action];
 if(!acts)return cb({ok:false,error:"그 행동은 여기서 할 수 없다."});
 if((acts.money||0)<0&&r.final.money<Math.abs(acts.money))return cb({ok:false,error:"돈이 부족하다."});
 if(r.final.energy+(acts.energy||0)<1)return cb({ok:false,error:"너무 지쳤다."});
 r.final.money+=acts.money||0;r.final.energy+=acts.energy||0;r.final.relation+=acts.relation||0;r.final.clues+=acts.clue||0;
 if(acts.item)fItem(r,acts.item);
 fAdvance(r,acts.min);r.final.trip=place;r.final.toast=acts.text;
 r.final.activeEvent=fEventFor(r)?.id||null;log(r,acts.text,"city_final");io.to(r.code).emit("state",pub(r));cb({ok:true,text:acts.text});
});
s.on("finalEventChoice",({eventId,choiceId},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false});ensureFinal(r);
 const ev=FINAL_EVENTS.find(x=>x.id===eventId);if(!ev||r.final.doneEvents.includes(ev.id))return cb({ok:false,error:"이미 지나간 사건이다."});
 const ch=ev.choices.find(x=>x.id===choiceId);if(!ch)return cb({ok:false,error:"선택을 찾을 수 없다."});
 fApplyEffects(r,ch);r.final.doneEvents.push(ev.id);r.final.activeEvent=fEventFor(r)?.id||null;r.final.toast=ch.label;
 log(r,`${ev.title}: ${ch.label}`,"event_final");io.to(r.code).emit("state",pub(r));cb({ok:true});
});
s.on("spaceEnter",({space},cb)=>{let r=rooms.get(s.data.code);if(!r||!SPACE_STATES[space])return cb({ok:false,error:"공간을 찾을 수 없다."});r.spaceStates=r.spaceStates||{};r.spaceStates[space]=r.spaceStates[space]||{stage:"quiet",seen:0};r.spaceStates[space].seen++;r.currentSpace=space;io.to(r.code).emit("state",pub(r));cb({ok:true});});
s.on("spaceAction",({space,action},cb)=>{let r=rooms.get(s.data.code),ss=r?.spaceStates?.[space],sp=SPACE_STATES[space],ac=SPACE_ACTIONS[action];if(!r||!ss||!sp||!ac)return cb({ok:false,error:"행동할 수 없다."});let stage=sp.stages[ss.stage];if(!stage.actions.includes(action))return cb({ok:false,error:"지금은 그 행동을 할 수 없다."});ss.stage=ac[0];r.flags=r.flags||{};r.flags[ac[3]]=true;r.mansionState=r.mansionState||{};r.mansionState.knowledge=(r.mansionState.knowledge||0)+ac[2];log(r,sp.label+": "+ac[1],"space");io.to(r.code).emit("state",pub(r));cb({ok:true,text:ac[1]});});
s.on("mansionEvent",({eventId},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 const ev=MANSION_EVENTS[eventId];if(!ev)return cb({ok:false,error:"존재하지 않는 사건이다."});
 const ms=r.mansionState||{};
 if(ms.room!==ev.room)return cb({ok:false,error:"지금은 이 사건이 발생할 장소에 있지 않다."});
 ms.activeEvent=eventId;r.mansionState=ms;io.to(r.code).emit("state",pub(r));cb({ok:true,event:ev});
});
s.on("mansionEventChoice",({eventId,choiceId},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 const ev=MANSION_EVENTS[eventId];const ch=ev?.choices?.find(x=>x.id===choiceId);
 if(!ch)return cb({ok:false,error:"존재하지 않는 선택이다."});
 const ms=r.mansionState||{};
 if(ms.activeEvent!==eventId)return cb({ok:false,error:"진행 중인 사건이 아니다."});
 for(const [k,v] of Object.entries(ch.effects||{})){
   if(k==="flags"){ms.flags=ms.flags||{};Object.assign(ms.flags,v);}
   else ms[k]=(ms[k]||0)+v;
 }
 ms.activeEvent=null;ms.eventCount=(ms.eventCount||0)+1;r.mansionState=ms;
 log(r,`${ev.title}: ${ch.text}`,"mansion-event");
 io.to(r.code).emit("state",pub(r));cb({ok:true});
});
s.on("mansionMove",({room},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 if(!MANSION_ROOMS[room])return cb({ok:false,error:"존재하지 않는 방이다."});
 r.mansionState=r.mansionState||{room:"hall",day:1,time:8,unlocks:[]};
 if(!r.mansionState.unlocks)r.mansionState.unlocks=[];
 const locked=["bedroom","attic","archive","music","basement","underwater","garden_b"];
 if(locked.includes(room)&&!r.mansionState.unlocks.includes(room))return cb({ok:false,error:"아직 들어갈 수 없는 곳이다."});
 r.mansionState.room=room;io.to(r.code).emit("state",pub(r));cb({ok:true});
});
s.on("mansionAction",({action},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 const ms=r.mansionState||{};const act=MANSION_ACTIONS[action];if(!act)return cb({ok:false,error:"존재하지 않는 행동이다."});
 for(const [k,v] of Object.entries(act.effects||{}))ms[k]=(ms[k]||0)+v;
 ms.home_clean=Math.max(0,Math.min(10,ms.home_clean));ms.house_condition=Math.max(0,Math.min(10,ms.house_condition));
 ms.water=Math.max(0,Math.min(10,ms.water));ms.food=Math.max(0,Math.min(10,ms.food));ms.fuel=Math.max(0,Math.min(10,ms.fuel));
 if(ms.house_condition>=8&&!ms.unlocks.includes("bedroom"))ms.unlocks.push("bedroom","attic");
 if(ms.knowledge>=5&&!ms.unlocks.includes("archive"))ms.unlocks.push("archive");
 if(ms.parts>=2&&!ms.unlocks.includes("music"))ms.unlocks.push("music");
 if(ms.house_condition>=10&&!ms.unlocks.includes("basement"))ms.unlocks.push("basement");
 if(ms.knowledge>=10&&!ms.unlocks.includes("underwater"))ms.unlocks.push("underwater");
 if(ms.time>=24){ms.time=8;ms.day=(ms.day||1)+1;ms.hunger=Math.max(0,(ms.hunger||6)-1);ms.energy=6;ms.prepared=0;}
 r.mansionState=ms;log(r,`${act.label}: ${act.text}`,"mansion");io.to(r.code).emit("state",pub(r));cb({ok:true});
});
s.on("choiceTree",({id},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 let tree=beginChoiceTree(r,p,id);if(!tree)return cb({ok:false,error:"존재하지 않는 선택지 트리다."});
 io.to(r.code).emit("state",pub(r));cb({ok:true,tree});
});
s.on("choicePick",({choice},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 const cur=r.choiceState?.current?.tree;if(!cur)return cb({ok:false,error:"진행 중인 선택지가 없다."});
 const c=cur.choices.find(x=>x.id===choice);if(!c||!choiceAvailable(p,c))return cb({ok:false,error:"선택할 수 없다."});
 applyChoiceEffects(p,c.effects);
 r.choiceState.history.push({tree:r.choiceState.current.id,choice:c.id,at:Date.now()});
 p.stats.events++;
 if(c.next){beginChoiceTree(r,p,c.next);}
 else r.choiceState.current=null;
 combine(r,p);log(r,`${p.name}의 선택: ${c.text}`,"choice");
 io.to(r.code).emit("state",pub(r));cb({ok:true,next:c.next||null});
});
s.on("worldAction",({action},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 if(action==="openGate"){
   if(r.world.doorProgress>=2){r.world.opened.deep=true;achievement(r,"deep","심층의 문");log(r,"수문이 열렸다. 두 사람의 기억이 같은 방향을 가리킨다.","chapter");}
   else if(r.players.size>=2){r.world.doorProgress++;log(r,`${p.name}이(가) 수문 장치를 잡았다. 반대편 장치가 필요하다.`,"puzzle");}
   else {r.world.doorProgress++;log(r,"첫 번째 수문 장치를 돌렸다. 다른 단서가 필요하다.","puzzle");}
 }
 if(action==="ending"){
   if(r.score>=66 && r.world.doorProgress>=2){r.world.ending="WHITE_FRAGMENT";achievement(r,"ending","하얀 파편의 날");log(r,"ENDING · 하얀 파편의 날 — 사라진 하루의 기억이 돌아왔다.","ending");}
   else return cb({ok:false,error:"아직 사라진 하루를 복원할 조건이 부족하다."});
 }
 io.to(r.code).emit("state",pub(r));cb({ok:true})
});
s.on("save",(_,cb)=>{let r=rooms.get(s.data.code);if(!r)return cb({ok:false});cb({ok:true,data:pub(r)})});
s.on("disconnect",()=>{let r=rooms.get(s.data.code);if(r){r.players.delete(s.id);if(!r.players.size)rooms.delete(r.code);else io.to(r.code).emit("state",pub(r))}});
});
server.listen(PORT,"0.0.0.0",()=>console.log("WATERLINE V19 running"));
