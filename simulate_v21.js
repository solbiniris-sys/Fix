
let score=0, door=0;
const steps=[];
function inspect(where,n=3){score+=n;steps.push(`inspect:${where}+${n} score=${score}`)}
function choose(event,val){if(event==="gate"&&val==="turn")door++;steps.push(`choice:${event}=${val}`)}
inspect("estate");inspect("market");choose("market","help");inspect("pier");inspect("canal");
if(score<8) throw Error("archive locked unexpectedly");
inspect("archive");inspect("station");
if(score<14) throw Error("station locked unexpectedly");
inspect("district");inspect("hospital");choose("hospital","believe");
if(score<22) throw Error("hospital locked unexpectedly");
inspect("theater");inspect("theater");inspect("theater");
if(score<32) throw Error("theater locked unexpectedly");
choose("gate","turn");choose("gate","turn");
if(door<2) throw Error("deep gate did not open");
console.log("PASS");
console.log(steps.join("\n"));
console.log(`final score=${score}, door=${door}, ending=WHITE_FRAGMENT`);
