import { useState, useEffect, useCallback, useRef } from "react";

// ══ CONSTANTS ══

const PLAN_TYPES = ["Base","Elite","Activación","Transformación","Especial"];
const PLAN_MODALITIES = ["Virtual","En Estudio","En Visita"];
const PLAN_FORMATS = ["Individual","Pareja","Trío","Grupo"];
const PAYMENT_PERIODS = [
  {label:"1 mes",months:1},{label:"3 meses (trimestre)",months:3},
  {label:"4 meses (cuatrimestre)",months:4},{label:"6 meses (semestre)",months:6},
  {label:"12 meses (anual)",months:12},
];
const EQUIPMENT_TYPES = ["Ninguno","Mancuerna","Kettlebell","Disco","Liga/Banda","Barra","Otro"];
const SURFACE_TYPES = ["Ninguno","Banco","Piso","Grada","Cajón","Pared","Polea"];
const MUSCLE_GROUPS_FILTER = ["Todos","Glúteos","Piernas","Espalda","Pecho","Hombros","Bíceps","Tríceps","Abdomen","Core","Full Body","Brazos"];
const MEASUREMENT_FIELDS = [
  {key:"weight",label:"Peso",unit:"kg"},{key:"fat",label:"Grasa corporal",unit:"%"},
  {key:"water",label:"Agua",unit:"%"},{key:"imc",label:"IMC",unit:""},
  {key:"visceralFat",label:"Grasa visceral",unit:""},{key:"protein",label:"Proteína",unit:"%"},
  {key:"muscleMass",label:"Masa muscular",unit:"kg"},{key:"boneMass",label:"Masa ósea",unit:"kg"},
  {key:"bmi",label:"BMI",unit:""},{key:"metabolicAge",label:"Edad metabólica",unit:"años"},
];

const INITIAL_TRAINER = {id:"t1",username:"johel",password:"johel123",name:"Johel Herrera",role:"trainer"};

const ALL_EXERCISES = [
  {id:"ex1",name:"Hipthrust con mancuerna",videoUrl:"https://www.youtube.com/watch?v=_DUsaQwJioc",muscleGroup:"Glúteos",type:"normal",equipment:"Mancuerna"},
  {id:"ex2",name:"Abducción de cadera con bandas",videoUrl:"https://www.youtube.com/watch?v=GoeqVgJdWak",muscleGroup:"Glúteos",type:"normal",equipment:"Liga/Banda"},
  {id:"ex3",name:"Sentadilla sumo con mancuerna",videoUrl:"https://www.youtube.com/shorts/Jo1DFefVdrg",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex4",name:"Peso muerto rumano con mancuernas",videoUrl:"https://www.youtube.com/shorts/KF3QpW6-jto",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex5",name:"Desplante Búlgaro",videoUrl:"https://www.youtube.com/shorts/NM37QWT6C5A",muscleGroup:"Piernas",type:"normal",equipment:"Ninguno"},
  {id:"ex6",name:"Sentadilla Isométrica con peso",videoUrl:"https://www.youtube.com/shorts/r6oViL7srpY",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex7",name:"Caminata lateral con banda",videoUrl:"https://www.youtube.com/shorts/6qAii6gapvU",muscleGroup:"Glúteos",type:"normal",equipment:"Liga/Banda"},
  {id:"ex8",name:"Jalón amplio con barra",videoUrl:"https://www.youtube.com/shorts/_2MfZAj98tk",muscleGroup:"Espalda",type:"normal",equipment:"Barra"},
  {id:"ex9",name:"Remo con mancuernas",videoUrl:"https://www.youtube.com/shorts/WkFX6_GxAs8",muscleGroup:"Espalda",type:"normal",equipment:"Mancuerna"},
  {id:"ex10",name:"Crunches Bicicleta",videoUrl:"https://www.youtube.com/shorts/_I2Fiy7ueNw",muscleGroup:"Abdomen",type:"normal",equipment:"Ninguno"},
  {id:"ex11",name:"Pull down con cuerda",videoUrl:"https://www.youtube.com/shorts/bON_FlYHh8c",muscleGroup:"Espalda",type:"normal",equipment:"Otro"},
  {id:"ex12",name:"Face pull",videoUrl:"https://www.youtube.com/shorts/RSmMpmxiz6k",muscleGroup:"Hombros",type:"normal",equipment:"Liga/Banda"},
  {id:"ex13",name:"Press militar con mancuernas",videoUrl:"https://www.youtube.com/shorts/H3JwesAsumc",muscleGroup:"Hombros",type:"normal",equipment:"Mancuerna"},
  {id:"ex14",name:"Sentadilla Goblet",videoUrl:"https://www.youtube.com/shorts/MSmHm4f-qIc",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex15",name:"Extensión de piernas en máquina",videoUrl:"https://www.youtube.com/shorts/PzIfB9MiiX8",muscleGroup:"Piernas",type:"normal",equipment:"Otro"},
  {id:"ex16",name:"Prensa de piernas 180 grados",videoUrl:"https://www.youtube.com/shorts/Y_u8jgMKiOI",muscleGroup:"Piernas",type:"normal",equipment:"Otro"},
  {id:"ex17",name:"Step up en banco o cajón",videoUrl:"https://www.youtube.com/shorts/aMdIEka3uII",muscleGroup:"Piernas",type:"normal",equipment:"Ninguno"},
  {id:"ex18",name:"Sentadillas de pulso",videoUrl:"",muscleGroup:"Piernas",type:"normal",equipment:"Ninguno"},
  {id:"ex19",name:"Jalón unilateral en polea alta",videoUrl:"https://www.youtube.com/shorts/hR_D45hhNhA",muscleGroup:"Espalda",type:"normal",equipment:"Otro"},
  {id:"ex20",name:"Press de pecho acostado",videoUrl:"https://www.youtube.com/watch?v=y9XAsTx3XxQ",muscleGroup:"Pecho",type:"normal",equipment:"Mancuerna"},
  {id:"ex21",name:"Remo con mancuerna Supino",videoUrl:"https://www.youtube.com/shorts/t15QajtT_bE",muscleGroup:"Espalda",type:"normal",equipment:"Mancuerna"},
  {id:"ex22",name:"Elevación lateral con mancuernas",videoUrl:"https://www.youtube.com/shorts/vwfaFckD1JI",muscleGroup:"Hombros",type:"normal",equipment:"Mancuerna"},
  {id:"ex23",name:"Elevación frontal con mancuerna",videoUrl:"https://www.youtube.com/shorts/IXbvmzQTSvU",muscleGroup:"Hombros",type:"normal",equipment:"Mancuerna"},
  {id:"ex24",name:"Aperturas inversas con mancuernas",videoUrl:"https://www.youtube.com/shorts/MHogGITTTBo",muscleGroup:"Hombros",type:"normal",equipment:"Mancuerna"},
  {id:"ex25",name:"Thrusters con Kettlebell",videoUrl:"https://www.youtube.com/shorts/07rZz0Jv8Xo",muscleGroup:"Full Body",type:"normal",equipment:"Kettlebell"},
  {id:"ex26",name:"Peso muerto + remo",videoUrl:"https://www.youtube.com/shorts/1nhoi20AouI",muscleGroup:"Full Body",type:"normal",equipment:"Mancuerna"},
  {id:"ex27",name:"ManMakers",videoUrl:"https://www.youtube.com/shorts/jzlV_9BOFr8",muscleGroup:"Full Body",type:"normal",equipment:"Mancuerna"},
  {id:"ex28",name:"Desplante caminando con curl mancuernas",videoUrl:"https://www.youtube.com/shorts/P7X40GzI14c",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex29",name:"Plancha alta con remo",videoUrl:"https://www.youtube.com/shorts/DZ17Zeu274s",muscleGroup:"Core",type:"normal",equipment:"Mancuerna"},
  {id:"ex30",name:"Plancha",videoUrl:"https://www.youtube.com/shorts/uxPlAbWFUDs",muscleGroup:"Core",type:"normal",equipment:"Ninguno"},
  {id:"ex31",name:"Desplante con mancuernas",videoUrl:"https://www.youtube.com/shorts/N2A6qU5dMBk",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex32",name:"Dead Bug con mancuernas",videoUrl:"https://www.youtube.com/shorts/VAVrsPX9GHY",muscleGroup:"Core",type:"normal",equipment:"Mancuerna"},
  {id:"ex33",name:"Dumbbell RDL",videoUrl:"https://www.youtube.com/shorts/CBOhr6H7BEY",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex34",name:"Step up con rodillas alta",videoUrl:"https://www.youtube.com/shorts/GPMIFk0D-og",muscleGroup:"Piernas",type:"normal",equipment:"Ninguno"},
  {id:"ex35",name:"Pallof Press",videoUrl:"https://www.youtube.com/watch?v=o_CxFP4FJhA",muscleGroup:"Core",type:"normal",equipment:"Liga/Banda"},
  {id:"ex36",name:"Farmer Carry con 1 kettlebell",videoUrl:"https://www.youtube.com/shorts/sP8r6aCRUe4",muscleGroup:"Full Body",type:"normal",equipment:"Kettlebell"},
  {id:"ex37",name:"Plancha lateral",videoUrl:"https://www.youtube.com/shorts/x2gzR9zzSCw",muscleGroup:"Core",type:"normal",equipment:"Ninguno"},
  {id:"ex38",name:"Landmine Press Unilateral",videoUrl:"https://www.youtube.com/watch?v=PFIn5PFiajQ",muscleGroup:"Pecho",type:"normal",equipment:"Barra"},
  {id:"ex39",name:"Press de banca plano Unilateral",videoUrl:"https://www.youtube.com/shorts/Ofs7d07Aguo",muscleGroup:"Pecho",type:"normal",equipment:"Mancuerna"},
  {id:"ex40",name:"Bear plank con toque de hombros",videoUrl:"https://www.youtube.com/shorts/IzJhfrGQsjY",muscleGroup:"Core",type:"normal",equipment:"Ninguno"},
  {id:"ex41",name:"Press de banco inclinado Unilateral",videoUrl:"https://www.youtube.com/watch?v=RZv05oS16uQ",muscleGroup:"Pecho",type:"normal",equipment:"Mancuerna"},
  {id:"ex42",name:"Bottom-up Carry",videoUrl:"https://www.youtube.com/results?search_query=Bottom-up+carry",muscleGroup:"Full Body",type:"normal",equipment:"Kettlebell"},
  {id:"ex43",name:"Wall Slides con banda",videoUrl:"https://www.youtube.com/shorts/1Nltd3EY3Wc",muscleGroup:"Hombros",type:"normal",equipment:"Liga/Banda"},
  {id:"ex44",name:"Pallof Press overhead",videoUrl:"https://www.youtube.com/shorts/knoBudRYK8E",muscleGroup:"Core",type:"normal",equipment:"Liga/Banda"},
  {id:"ex45",name:"Push up inclinado",videoUrl:"https://www.youtube.com/shorts/7f8JOu0i1cQ",muscleGroup:"Pecho",type:"normal",equipment:"Ninguno"},
  {id:"ex46",name:"Bird Dogs",videoUrl:"https://www.youtube.com/shorts/vtwhC3tfVow",muscleGroup:"Core",type:"normal",equipment:"Ninguno"},
  {id:"ex47",name:"Dead Bug con Banda",videoUrl:"https://www.youtube.com/shorts/iW_CtYtzbeU",muscleGroup:"Core",type:"normal",equipment:"Liga/Banda"},
  {id:"ex48",name:"Remo con Kettlebell",videoUrl:"https://www.youtube.com/shorts/TxGJXHXQzus",muscleGroup:"Espalda",type:"normal",equipment:"Kettlebell"},
  {id:"ex49",name:"Jalón cerrado con triángulo",videoUrl:"https://www.youtube.com/shorts/ySLFHxmJ_Sc",muscleGroup:"Espalda",type:"normal",equipment:"Otro"},
  {id:"ex50",name:"Y Raises",videoUrl:"https://www.youtube.com/shorts/BvxuWwQOj_E",muscleGroup:"Hombros",type:"normal",equipment:"Mancuerna"},
  {id:"ex51",name:"Extensión Externa hombro",videoUrl:"https://www.youtube.com/shorts/Nhq49UJefwI",muscleGroup:"Hombros",type:"normal",equipment:"Liga/Banda"},
  {id:"ex52",name:"Escapular Push ups",videoUrl:"https://www.youtube.com/shorts/SBPRhZI2RkI",muscleGroup:"Pecho",type:"normal",equipment:"Ninguno"},
  {id:"ex53",name:"Farmer carry",videoUrl:"https://www.youtube.com/watch?v=ecBlIjSX_LY",muscleGroup:"Full Body",type:"normal",equipment:"Mancuerna"},
  {id:"ex54",name:"Thruster Landmine Unilateral",videoUrl:"https://www.youtube.com/watch?v=G23fLqjKgYA",muscleGroup:"Full Body",type:"normal",equipment:"Barra"},
  {id:"ex55",name:"Step up Press unilateral",videoUrl:"https://www.youtube.com/shorts/4WLrdl3AhCE",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex56",name:"Carry Hold",videoUrl:"https://www.youtube.com/shorts/bpA8xewmASc",muscleGroup:"Full Body",type:"normal",equipment:"Kettlebell"},
  {id:"ex57",name:"Desplantes con mancuernas para atrás",videoUrl:"https://www.youtube.com/shorts/-3TJqBXHyuI",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex58",name:"Push up Elevado",videoUrl:"https://www.youtube.com/shorts/xEoEjCHcCQ4",muscleGroup:"Pecho",type:"normal",equipment:"Ninguno"},
  {id:"ex59",name:"Pallof con Rotación",videoUrl:"https://www.youtube.com/shorts/XJkm_PU_ztQ",muscleGroup:"Core",type:"normal",equipment:"Liga/Banda"},
  {id:"ex60",name:"Sentadilla con mancuernas",videoUrl:"https://www.youtube.com/shorts/OwWCkwdATnE",muscleGroup:"Piernas",type:"normal",equipment:"Mancuerna"},
  {id:"ex61",name:"Push ups",videoUrl:"https://www.youtube.com/shorts/TvF4RpRzQQw",muscleGroup:"Pecho",type:"normal",equipment:"Ninguno"},
  {id:"ex62",name:"Escaladores",videoUrl:"https://www.youtube.com/shorts/V0UoH5TG6fo",muscleGroup:"Core",type:"normal",equipment:"Ninguno"},
  {id:"ex63",name:"Press inclinado con mancuernas",videoUrl:"https://www.youtube.com/shorts/ZaNyRjpoki8",muscleGroup:"Pecho",type:"normal",equipment:"Mancuerna"},
  {id:"ex64",name:"Patada de tríceps con mancuernas",videoUrl:"https://www.youtube.com/shorts/hg6jySXCaT0",muscleGroup:"Tríceps",type:"normal",equipment:"Mancuerna"},
  {id:"ex65",name:"Hipthrust + Press mancuernas",videoUrl:"https://www.youtube.com/shorts/66GvvbTwvMo",muscleGroup:"Glúteos",type:"normal",equipment:"Mancuerna"},
  {id:"ex66",name:"Pájaros con Mancuernas",videoUrl:"https://www.youtube.com/shorts/01MSKQkvxCI",muscleGroup:"Hombros",type:"normal",equipment:"Mancuerna"},
  {id:"ex67",name:"Sentadilla con Saltos",videoUrl:"https://www.youtube.com/shorts/n1df4ASFeZU",muscleGroup:"Piernas",type:"normal",equipment:"Ninguno"},
  {id:"ex68",name:"Elevación al mentón con mancuernas",videoUrl:"https://www.youtube.com/shorts/rPkME2cX5sw",muscleGroup:"Hombros",type:"normal",equipment:"Mancuerna"},
  {id:"ex69",name:"Curl alternado con mancuernas",videoUrl:"https://www.youtube.com/shorts/e9nzjkmPRXY",muscleGroup:"Bíceps",type:"normal",equipment:"Mancuerna"},
  {id:"ex70",name:"Pullover con mancuerna",videoUrl:"https://www.youtube.com/shorts/vKCQHaG0Rj0",muscleGroup:"Espalda",type:"normal",equipment:"Mancuerna"},
  {id:"ex71",name:"Thrusters con mancuernas",videoUrl:"https://www.youtube.com/shorts/R_dbUKgKwJw",muscleGroup:"Full Body",type:"normal",equipment:"Mancuerna"},
  {id:"ex72",name:"Plancha con toque de hombros",videoUrl:"https://www.youtube.com/shorts/VfwCQ14soUo",muscleGroup:"Core",type:"normal",equipment:"Ninguno"},
  {id:"ex73",name:"Abdominal con mancuerna",videoUrl:"https://www.youtube.com/shorts/XydKaUcYx4M",muscleGroup:"Abdomen",type:"normal",equipment:"Mancuerna"},
  {id:"ex74",name:"Giros Rusos con mancuernas",videoUrl:"https://www.youtube.com/shorts/Xvm7zSiFyak",muscleGroup:"Abdomen",type:"normal",equipment:"Mancuerna"},
  // Stretching
  {id:"str1",name:"Estiramiento cuádriceps de pie",videoUrl:"",muscleGroup:"Piernas",type:"stretching",equipment:"Ninguno"},
  {id:"str2",name:"Estiramiento isquiotibiales sentado",videoUrl:"",muscleGroup:"Piernas",type:"stretching",equipment:"Ninguno"},
  {id:"str3",name:"Estiramiento glúteos figura 4",videoUrl:"",muscleGroup:"Glúteos",type:"stretching",equipment:"Ninguno"},
  {id:"str4",name:"Estiramiento pecho en pared",videoUrl:"",muscleGroup:"Pecho",type:"stretching",equipment:"Ninguno"},
  {id:"str5",name:"Estiramiento hombros cruzado",videoUrl:"",muscleGroup:"Hombros",type:"stretching",equipment:"Ninguno"},
  {id:"str6",name:"Estiramiento espalda baja (cobra)",videoUrl:"",muscleGroup:"Espalda",type:"stretching",equipment:"Ninguno"},
  {id:"str7",name:"Estiramiento cadera (paloma)",videoUrl:"",muscleGroup:"Glúteos",type:"stretching",equipment:"Ninguno"},
  {id:"str8",name:"Estiramiento pantorrilla en pared",videoUrl:"",muscleGroup:"Piernas",type:"stretching",equipment:"Ninguno"},
  {id:"str9",name:"Estiramiento cuello lateral",videoUrl:"",muscleGroup:"Otro",type:"stretching",equipment:"Ninguno"},
  {id:"str10",name:"Wall Slide (movilidad hombro)",videoUrl:"",muscleGroup:"Hombros",type:"stretching",equipment:"Ninguno"},
  {id:"str11",name:"Extensión de hombro (péndulo)",videoUrl:"",muscleGroup:"Hombros",type:"stretching",equipment:"Ninguno"},
  {id:"str12",name:"Press Hold hombro",videoUrl:"",muscleGroup:"Hombros",type:"stretching",equipment:"Kettlebell"},
];

const INITIAL_USERS = [
  {id:"u1",username:"sofi",password:"123456",name:"Sofía",role:"user",phone:"",email:"",cedula:"",age:"",height:"",notes:"",
    plan:{type:"Base",modality:"En Estudio",format:"Individual",startDate:"2025-01-01",endDate:"2025-12-31",price:"",status:"Activo"}},
  {id:"u2",username:"tito",password:"123456",name:"Tito",role:"user",phone:"",email:"",cedula:"",age:"",height:"",notes:"",
    plan:{type:"Elite",modality:"En Estudio",format:"Pareja",startDate:"2025-01-01",endDate:"2025-12-31",price:"",status:"Activo"}},
];

// ═══════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════
function genId(){return"id_"+Math.random().toString(36).slice(2,10)}
function useLS(key,init){
  const[val,setVal]=useState(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):init}catch{return init}});
  const set=useCallback(v=>{setVal(v);localStorage.setItem(key,JSON.stringify(v))},[key]);
  return[val,set];
}
function getEmbed(url){
  if(!url)return null;
  const s=url.match(/youtube\.com\/shorts\/([^?&]+)/);if(s)return`https://www.youtube.com/embed/${s[1]}`;
  const w=url.match(/[?&]v=([^&]+)/);if(w)return`https://www.youtube.com/embed/${w[1]}`;
  return null;
}
function calcAge(dob){
  if(!dob)return null;
  const b=new Date(dob),n=new Date();
  let age=n.getFullYear()-b.getFullYear();
  if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))age--;
  return age;
}
function fmtDate(d){if(!d)return"—";try{return new Date(d+"T12:00:00").toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"})}catch{return d}}
function initials(name){return(name||"").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
function planColor(type){return{Base:"bd-gray",Elite:"bd-purple",Activación:"bd-blue",Transformación:"bd-orange",Especial:"bd-teal"}[type]||"bd-gray"}
function getPlanStatus(endDate){
  if(!endDate)return"Sin plan";
  const d=Math.ceil((new Date(endDate+"T23:59:59")-new Date())/(1000*60*60*24));
  if(d<0)return"Vencido";
  if(d===0)return"Vence hoy";
  return"Activo";
}
function daysLeft(endDate){
  if(!endDate)return null;
  return Math.ceil((new Date(endDate+"T23:59:59")-new Date())/(1000*60*60*24));
}
function addMonths(dateStr,months){
  const d=new Date(dateStr+"T12:00:00");
  d.setMonth(d.getMonth()+months);
  return d.toISOString().split("T")[0];
}

const STYLES=`
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;900&family=Barlow+Condensed:wght@600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-family:'Barlow',sans-serif;background:#F5F7FC;color:#0D1B3E;-webkit-tap-highlight-color:transparent}
.app{display:flex;min-height:100vh;min-height:100dvh}
/* SIDEBAR */
.sidebar{width:210px;min-width:210px;background:#0B1F4B;display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;height:100dvh;overflow-y:auto;z-index:200;transition:transform 0.2s}
.main{flex:1;margin-left:210px;padding:20px;overflow-y:auto;min-width:0;max-width:100%}
.sb-logo{padding:16px 12px;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;align-items:center;gap:4px}
.sb-brand{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:900;letter-spacing:1px;color:#fff;text-align:center;text-transform:uppercase}
.sb-sub{font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:2px;text-transform:uppercase}
.nav-sec{padding:12px 12px 4px;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.28);text-transform:uppercase}
.nav-item{display:flex;align-items:center;gap:8px;padding:10px 12px;margin:1px 6px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;transition:all 0.15s;user-select:none;-webkit-user-select:none}
.nav-item:hover,.nav-item:active{background:rgba(255,255,255,0.1);color:#fff}
.nav-item.active{background:#1A5DC8;color:#fff}
.nav-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
.sb-footer{margin-top:auto;padding:12px;border-top:1px solid rgba(255,255,255,0.1)}
.u-chip{display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:8px;background:rgba(255,255,255,0.07)}
.u-av{width:30px;height:30px;border-radius:50%;background:#3A8EF6;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;flex-shrink:0;overflow:hidden}
.u-av img{width:100%;height:100%;object-fit:cover}
.u-nm{font-size:11px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.u-rl{font-size:9px;color:rgba(255,255,255,0.38)}
.lbtn{margin-left:auto;background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.35);font-size:16px;padding:4px;transition:color 0.15s;flex-shrink:0;min-width:28px;min-height:28px;display:flex;align-items:center;justify-content:center}
.lbtn:hover{color:#E53935}
/* LAYOUT */
.ph{margin-bottom:20px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}
.pt{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:900;letter-spacing:0.5px;color:#0B1F4B;text-transform:uppercase;line-height:1.1}
.ps{font-size:12px;color:#6B7A99;margin-top:2px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px}
.stat{background:#fff;border:1px solid #DDE4F0;border-radius:10px;padding:12px 14px}
.sl{font-size:10px;color:#6B7A99;text-transform:uppercase;letter-spacing:1px}
.sv{font-size:22px;font-weight:700;color:#0B1F4B;margin-top:2px}
.card{background:#fff;border:1px solid #DDE4F0;border-radius:12px;padding:14px}
.card+.card{margin-top:12px}
/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:all 0.15s;font-family:'Barlow',sans-serif;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;min-height:40px;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.btn-p{background:#1A5DC8;color:#fff}.btn-p:active{background:#0B1F4B}
.btn-s{background:transparent;color:#1A5DC8;border:1.5px solid #1A5DC8}.btn-s:active{background:#1A5DC8;color:#fff}
.btn-d{background:#E53935;color:#fff}.btn-d:active{background:#b71c1c}
.btn-ok{background:#2E7D32;color:#fff}.btn-ok:active{background:#1b5e20}
.btn-g{background:transparent;color:#6B7A99;border:1px solid #DDE4F0}.btn-g:active{background:#F5F7FC}
.btn-w{background:#F57C00;color:#fff}
.btn-sm{padding:7px 12px;font-size:11px;min-height:34px}
.btn-xs{padding:5px 9px;font-size:10px;min-height:28px}
.btn-full{width:100%;justify-content:center}
/* FORMS */
.inp,.sel,.ta{width:100%;padding:10px 12px;border:1.5px solid #DDE4F0;border-radius:8px;font-size:14px;font-family:'Barlow',sans-serif;color:#0D1B3E;background:#fff;transition:border 0.15s;outline:none;-webkit-appearance:none;appearance:none;min-height:44px}
.inp:focus,.sel:focus,.ta:focus{border-color:#3A8EF6}
.ta{resize:vertical;min-height:70px}
.sel{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7A99' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
label{font-size:11px;font-weight:700;color:#6B7A99;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px}
.fg{margin-bottom:12px}
.fr2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fr3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.pw-wrap{position:relative}.pw-wrap .inp{padding-right:44px}
.pw-eye{position:absolute;right:0;top:0;bottom:0;width:44px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#6B7A99;font-size:18px;padding:0}
.pw-eye:active{color:#1A5DC8}
/* TABLE */
.tbl{width:100%;border-collapse:collapse}
.tbl th{padding:9px 12px;text-align:left;font-size:10px;color:#6B7A99;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #DDE4F0;white-space:nowrap}
.tbl td{padding:11px 12px;border-bottom:1px solid #DDE4F0;font-size:12px;vertical-align:middle;text-align:left}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:#F8F9FF}
/* BADGES */
.badge{display:inline-block;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
.bd-blue{background:#E3F0FF;color:#1A5DC8}.bd-green{background:#E8F5E9;color:#2E7D32}
.bd-orange{background:#FFF3E0;color:#F57C00}.bd-gray{background:#ECEFF1;color:#607D8B}
.bd-red{background:#FFEBEE;color:#E53935}.bd-purple{background:#F3E5F5;color:#7B1FA2}
.bd-teal{background:#E0F2F1;color:#00695C}.bd-yellow{background:#FFFDE7;color:#F9A825}
/* TABS */
.tabs{display:flex;gap:0;border-bottom:2px solid #DDE4F0;margin-bottom:16px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.tabs::-webkit-scrollbar{display:none}
.tab{padding:10px 14px;cursor:pointer;font-size:11px;font-weight:700;color:#6B7A99;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;min-height:42px;display:flex;align-items:center}
.tab.active{color:#1A5DC8;border-bottom-color:#1A5DC8}.tab:hover{color:#0D1B3E}
/* MODALS */
.mb{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:1000;display:flex;align-items:flex-end;justify-content:center;padding:0}
.mo{background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:600px;max-height:90vh;max-height:90dvh;overflow-y:auto;padding:20px 18px 32px;box-shadow:0 -4px 40px rgba(0,0,0,0.2)}
.mo-lg{border-radius:16px;margin:auto;max-height:92vh}
.mo-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.mo-t{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:900;text-transform:uppercase;color:#0B1F4B}
.mo-x{background:none;border:none;cursor:pointer;font-size:20px;color:#6B7A99;line-height:1;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center}.mo-x:hover{color:#E53935}
/* ROUTINE VIEW */
.day-card{border:1.5px solid #DDE4F0;border-radius:12px;overflow:hidden;margin-bottom:12px}
.day-h{background:#0B1F4B;color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;min-height:56px}
.day-ht{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:900;letter-spacing:1px;text-transform:uppercase}
.day-b{padding:12px}
.grp-card{border:1px solid #DDE4F0;border-radius:10px;margin-bottom:10px;overflow:hidden}
.grp-h{background:#F5F7FC;padding:10px 12px;display:flex;align-items:center;gap:7px;border-bottom:1px solid #DDE4F0;flex-wrap:wrap}
.grp-lbl{background:#1A5DC8;color:#fff;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0;font-family:'Barlow Condensed',sans-serif}
.grp-b{padding:10px 12px}
.ex-row{display:flex;align-items:flex-start;gap:8px;padding:10px 0;border-bottom:1px solid #DDE4F0}
.ex-row:last-child{border-bottom:none}
.ex-num{width:24px;height:24px;background:#4FC3F7;color:#0B1F4B;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;margin-top:2px}
.ex-nm{font-size:14px;font-weight:700;margin-bottom:4px}
.ex-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:4px}
.ex-tag{background:#F0F4FF;border:1px solid #DBEAFE;border-radius:6px;padding:3px 8px;font-size:10px;color:#1A5DC8;font-weight:700;display:flex;align-items:center;gap:3px}
.ex-tag .tag-lbl{color:#6B7A99;font-weight:400;margin-right:2px}
.ex-dt{font-size:11px;color:#F57C00;margin-top:4px;font-style:italic}
.vbtn{padding:6px 12px;border-radius:6px;font-size:11px;font-weight:700;background:#FF0000;color:#fff;border:none;cursor:pointer;text-transform:uppercase;flex-shrink:0;min-height:34px;min-width:60px}
/* TIMER */
.timer-wrap{margin-bottom:10px}
.timer-box{background:#0B1F4B;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.timer-disp{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:900;color:#4FC3F7;letter-spacing:2px;min-width:62px}
.timer-lbl{font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px}
.rest-active{background:#FF6D00;border-radius:10px;padding:8px 14px;margin-top:6px;display:flex;align-items:center;gap:10px}
.rest-disp{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:900;color:#fff;letter-spacing:2px}
.rest-btns{display:flex;gap:5px;margin-top:6px;justify-content:flex-end}
/* MISC */
.note-box{background:#FFF8E1;border:1.5px solid #FFD54F;border-radius:9px;padding:11px 13px;font-size:12px;color:#5D4037;margin-bottom:14px;display:flex;gap:7px;align-items:flex-start}
.warn-box{background:#FFF3E0;border:1.5px solid #FFB74D;border-radius:9px;padding:10px 12px;font-size:11px;color:#E65100;display:flex;gap:7px;align-items:flex-start;margin-bottom:12px}
.login-page{min-height:100vh;min-height:100dvh;display:flex;background:#0B1F4B;align-items:center;justify-content:center;padding:16px}
.login-box{background:#fff;border-radius:20px;padding:36px 28px;width:100%;max-width:360px;box-shadow:0 24px 64px rgba(0,0,0,0.3)}
.login-logo{text-align:center;margin-bottom:22px}
.login-brand{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:900;color:#0B1F4B;text-transform:uppercase;letter-spacing:2px}
.login-sub{font-size:9px;color:#6B7A99;letter-spacing:3px;text-transform:uppercase;margin-top:3px}
.err{background:#FFEBEE;color:#E53935;padding:9px 12px;border-radius:8px;font-size:12px;margin-bottom:12px;border:1px solid #FFCDD2}
.empty{text-align:center;padding:32px 16px;color:#6B7A99}
.empty .ico{font-size:36px;margin-bottom:8px}
.sa{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:8px;flex-wrap:wrap}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
.chip{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid #DDE4F0;color:#6B7A99;background:transparent;transition:all 0.15s;font-family:'Barlow',sans-serif;min-height:34px;display:inline-flex;align-items:center}
.chip.on{background:#1A5DC8;color:#fff;border-color:#1A5DC8}
.ibtn{background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;color:#6B7A99;font-size:16px;transition:all 0.15s;display:inline-flex;align-items:center;justify-content:center;min-width:34px;min-height:34px}
.ibtn:active{background:#F5F7FC}.ibtn.d:active{background:#FFEBEE;color:#E53935}
.divider{height:1px;background:#DDE4F0;margin:12px 0}
.back-btn{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#1A5DC8;cursor:pointer;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;background:none;border:none;padding:6px 0;min-height:36px}
.m-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:10px}
.m-card{background:#F8F9FF;border:1px solid #DDE4F0;border-radius:8px;padding:10px 12px}
.m-lbl{font-size:9px;color:#6B7A99;text-transform:uppercase;letter-spacing:1px}
.m-val{font-size:20px;font-weight:700;color:#0B1F4B;margin-top:2px}
.m-unit{font-size:10px;color:#6B7A99;font-weight:400}
.hist-row{display:flex;align-items:flex-start;gap:8px;padding:10px 0;border-bottom:1px solid #DDE4F0}
.hist-date{font-weight:700;color:#0B1F4B;font-size:12px;min-width:80px}
.hist-vals{display:flex;gap:5px;flex-wrap:wrap;flex:1}
.hist-val{background:#F0F4FF;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;color:#1A5DC8}
.chart-wrap{background:#F8F9FF;border-radius:8px;padding:12px;margin-top:10px;overflow-x:auto}
.chart-inner{display:flex;align-items:flex-end;gap:5px;height:100px}
.chart-col{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;min-width:28px}
.chart-bar-f{background:#1A5DC8;border-radius:3px 3px 0 0;width:100%;min-height:2px;transition:height 0.4s}
.chart-val{font-size:8px;font-weight:700;color:#1A5DC8}
.chart-lbl{font-size:8px;color:#6B7A99;text-align:center}
.avatar-wrap{position:relative;width:70px;height:70px;cursor:pointer}
.avatar-big{width:70px;height:70px;border-radius:50%;background:#3A8EF6;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff;overflow:hidden;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15)}
.avatar-big img{width:100%;height:100%;object-fit:cover}
.avatar-edit{position:absolute;bottom:0;right:0;background:#1A5DC8;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff}
.pay-row{border:1.5px solid #DDE4F0;border-radius:10px;padding:12px;margin-bottom:8px;cursor:pointer;transition:border-color 0.15s}
.pay-row:hover{border-color:#1A5DC8}
.pay-row.selected{border-color:#1A5DC8;background:#EFF6FF}
.pay-hist{border-bottom:1px solid #DDE4F0;padding:8px 0;display:flex;align-items:center;gap:8px;font-size:12px}
/* MOBILE */
@media(max-width:640px){
  .sidebar{width:100%;height:auto;position:fixed;bottom:0;top:auto;left:0;right:0;flex-direction:row;height:60px;border-top:1px solid rgba(255,255,255,0.1);padding:0;overflow:visible;z-index:300}
  .sb-logo,.nav-sec,.sb-footer{display:none}
  .sidebar nav{display:flex;flex:1;height:100%}
  .nav-item{flex-direction:column;gap:2px;padding:6px 4px;margin:0;border-radius:0;font-size:9px;flex:1;justify-content:center;color:rgba(255,255,255,0.55)}
  .nav-item.active{background:rgba(26,93,200,0.3);color:#4FC3F7}
  .nav-item span:not(.nav-icon){font-size:9px;letter-spacing:0}
  .nav-icon{font-size:20px;width:auto}
  .main{margin-left:0;margin-bottom:60px;padding:12px}
  .fr2,.fr3{grid-template-columns:1fr}
  .mo{max-height:95vh;max-height:95dvh;border-radius:20px 20px 0 0;padding-bottom:40px}
  .mo-lg{border-radius:20px 20px 0 0;margin:auto 0 0 0}
  .stats{grid-template-columns:1fr 1fr}
  .tbl{font-size:11px}.tbl th,.tbl td{padding:8px 8px}
  .pt{font-size:20px}
  .day-h{padding:12px 14px}
  .grp-b{padding:8px 10px}
}
@media(min-width:641px){
  .mb{align-items:center;padding:16px}
  .mo{border-radius:16px;max-height:90vh;padding:22px 20px}
  sidebar nav{display:block}
}
`;

// ── SHARED UI ──
function Logo({size=52}){return(<svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#1A5DC8" opacity="0.9"/><polygon points="50,14 82,31 82,69 50,86 18,69 18,31" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/><text x="50" y="65" textAnchor="middle" fill="white" fontSize="38" fontWeight="900" fontFamily="Arial Black,sans-serif">⚡</text></svg>);}

function PasswordInput({value,onChange,placeholder="••••••••",autoComplete="current-password"}){
  const[show,setShow]=useState(false);
  return(<div className="pw-wrap"><input className="inp" type={show?"text":"password"} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}/><button type="button" className="pw-eye" onClick={()=>setShow(s=>!s)}>{show?"🙈":"👁"}</button></div>);
}

function Modal({title,onClose,children,size=""}){
  return(<div className="mb" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className={`mo${size?" mo-"+size:""}`}><div className="mo-h"><div className="mo-t">{title}</div><button className="mo-x" onClick={onClose}>✕</button></div>{children}</div></div>);
}

function VideoModal({name,url,onClose}){
  const embed=getEmbed(url);
  return(<Modal title={name} onClose={onClose}>{embed?(<div style={{position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:8}}><iframe src={embed} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none",borderRadius:8}} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen title={name}/></div>):<div className="empty"><div className="ico">🎬</div><p>Sin video</p></div>}</Modal>);
}

// ── LOGIN ──
function LoginPage({onLogin,trainer,users}){
  const[u,setU]=useState("");const[p,setP]=useState("");const[err,setErr]=useState("");
  function go(e){
    e.preventDefault();
    if(u===trainer.username&&p===trainer.password){onLogin(trainer);return}
    // check admins stored
    const admins=(JSON.parse(localStorage.getItem("jh_admins_v3")||"[]"));
    const adm=admins.find(a=>a.username===u&&a.password===p);
    if(adm){onLogin({...adm,role:"trainer"});return}
    const user=users.find(x=>x.username===u&&x.password===p);
    if(user){onLogin(user);return}
    setErr("Usuario o contraseña incorrectos");
  }
  return(<div className="login-page"><div className="login-box"><div className="login-logo"><Logo size={80}/><div className="login-brand">Johel Herrera</div><div className="login-sub">Strength · Discipline · Evolution</div></div>{err&&<div className="err">⚠ {err}</div>}<form onSubmit={go}><div className="fg"><label>Usuario</label><input className="inp" value={u} onChange={e=>setU(e.target.value)} placeholder="Tu usuario" autoComplete="username"/></div><div className="fg"><label>Contraseña</label><PasswordInput value={p} onChange={e=>setP(e.target.value)}/></div><button className="btn btn-p btn-full" type="submit" style={{marginTop:8}}>Ingresar →</button></form></div></div>);
}

// ── SIDEBAR ──
function Sidebar({user,page,setPage,onLogout}){
  const isT=user.role==="trainer";
  const navs=isT?[
    {id:"dashboard",icon:"🏠",label:"Inicio"},
    {id:"clients",icon:"👥",label:"Clientes"},
    {id:"routines",icon:"📋",label:"Rutinas"},
    {id:"exercises",icon:"🏋️",label:"Ejercicios"},
    {id:"admins",icon:"🔑",label:"Admins"},
  ]:[
    {id:"my-routine",icon:"📋",label:"Rutina"},
    {id:"my-profile",icon:"👤",label:"Perfil"},
  ];
  const ini=initials(user.name);
  const photoKey="jh_photo_"+user.id;
  const photo=localStorage.getItem(photoKey);
  return(
    <aside className="sidebar">
      <div className="sb-logo"><Logo size={44}/><div className="sb-brand">Johel Herrera</div><div className="sb-sub">Str·Dis·Evo</div></div>
      <nav>
        {isT&&<div className="nav-sec">Menú</div>}
        {navs.map(n=>(<div key={n.id} className={`nav-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}><span className="nav-icon">{n.icon}</span><span>{n.label}</span></div>))}
      </nav>
      <div className="sb-footer">
        <div className="u-chip">
          <div className="u-av">{photo?<img src={photo} alt=""/>:ini}</div>
          <div style={{flex:1,minWidth:0}}><div className="u-nm">{user.name.split(" ")[0]}</div><div className="u-rl">{isT?"Entrenador":"Cliente"}</div></div>
          <button className="lbtn" onClick={onLogout} title="Salir">⎋</button>
        </div>
      </div>
    </aside>
  );
}

// ── EXERCISE PICKER MODALS ──
function ExercisePicker({exercises,onPick,onClose}){
  const[search,setSearch]=useState("");const[filter,setFilter]=useState("Todos");
  const normals=exercises.filter(e=>e.type==="normal");
  const groups=["Todos",...new Set(normals.map(e=>e.muscleGroup))].filter((v,i,a)=>a.indexOf(v)===i);
  const list=normals.filter(e=>(filter==="Todos"||e.muscleGroup===filter)&&e.name.toLowerCase().includes(search.toLowerCase()));
  return(<div className="mb" style={{zIndex:1100}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="mo" style={{maxHeight:"88vh"}}><div className="mo-h"><div className="mo-t">Agregar ejercicio</div><button className="mo-x" onClick={onClose}>✕</button></div><input className="inp" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus style={{marginBottom:8}}/><div className="chips">{groups.map(g=><button key={g} className={`chip${filter===g?" on":""}`} onClick={()=>setFilter(g)}>{g}</button>)}</div><div style={{maxHeight:300,overflowY:"auto"}}>{list.map(ex=>(<div key={ex.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #DDE4F0"}}><div><div style={{fontSize:13,fontWeight:700}}>{ex.name}</div><div style={{fontSize:10,color:"#6B7A99"}}>{ex.muscleGroup} · {ex.equipment}</div></div><button className="btn btn-p btn-sm" onClick={()=>onPick(ex)}>+ Agregar</button></div>))}{list.length===0&&<div className="empty"><div className="ico">🔍</div><p>Sin resultados</p></div>}</div></div></div>);
}

function StretchPicker({exercises,selected,onToggle,onClose}){
  const[search,setSearch]=useState("");
  const stretches=exercises.filter(e=>e.type==="stretching"&&e.name.toLowerCase().includes(search.toLowerCase()));
  return(<div className="mb" style={{zIndex:1100}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="mo"><div className="mo-h"><div className="mo-t">Estiramientos</div><button className="mo-x" onClick={onClose}>✕</button></div><input className="inp" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus style={{marginBottom:10}}/><div style={{maxHeight:320,overflowY:"auto"}}>{stretches.map(ex=>{const sel=selected.includes(ex.id);return(<div key={ex.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #DDE4F0"}}><div><div style={{fontSize:13,fontWeight:700}}>{ex.name}</div><div style={{fontSize:10,color:"#6B7A99"}}>{ex.muscleGroup}</div></div><button className={`btn btn-sm ${sel?"btn-d":"btn-ok"}`} onClick={()=>onToggle(ex.id)}>{sel?"Quitar":"✓"}</button></div>);})}</div><div style={{marginTop:10}}><button className="btn btn-p btn-full" onClick={onClose}>Listo ({selected.length})</button></div></div></div>);
}

// ── DASHBOARD ──
function Dashboard({users,routines}){
  const total=users.length;
  const active=users.filter(u=>getPlanStatus(u.plan?.endDate)==="Activo").length;
  const expiring=users.filter(u=>{const d=daysLeft(u.plan?.endDate);return d!==null&&d>=0&&d<=30}).length;
  const expired=users.filter(u=>getPlanStatus(u.plan?.endDate)==="Vencido").length;
  return(<div>
    <div className="ph"><div><div className="pt">Dashboard</div><div className="ps">Panel de control</div></div></div>
    <div className="stats">
      <div className="stat"><div className="sl">Clientes</div><div className="sv">{total}</div></div>
      <div className="stat"><div className="sl">Activos</div><div className="sv" style={{color:"#2E7D32"}}>{active}</div></div>
      <div className="stat"><div className="sl">Vencidos</div><div className="sv" style={{color:"#E53935"}}>{expired}</div></div>
      <div className="stat"><div className="sl">Vencen pronto</div><div className="sv" style={{color:expiring>0?"#F57C00":"#6B7A99"}}>{expiring}</div></div>
    </div>
    <div className="card" style={{padding:0,overflowX:"auto"}}>
      <table className="tbl">
        <thead><tr><th>Cliente</th><th>Plan</th><th>Modalidad</th><th>Vence</th><th>Estado</th></tr></thead>
        <tbody>{users.map(u=>{
          const st=getPlanStatus(u.plan?.endDate);
          const d=daysLeft(u.plan?.endDate);
          return(<tr key={u.id}>
            <td><strong>{u.name}</strong><br/><span style={{color:"#6B7A99",fontSize:10}}>@{u.username}</span></td>
            <td><span className={`badge ${planColor(u.plan?.type)}`}>{u.plan?.type||"—"}</span></td>
            <td><span className="badge bd-gray">{u.plan?.modality||"—"}</span></td>
            <td style={{fontSize:11}}>{fmtDate(u.plan?.endDate)}{d!==null&&d>=0&&d<=30&&<span style={{color:"#F57C00",fontWeight:700}}> ({d}d)</span>}</td>
            <td><span className={`badge ${st==="Activo"?"bd-green":st==="Vencido"?"bd-red":"bd-gray"}`}>{st}</span></td>
          </tr>);
        })}{users.length===0&&<tr><td colSpan={5}><div className="empty"><div className="ico">👥</div><p>Sin clientes</p></div></td></tr>}</tbody>
      </table>
    </div>
  </div>);
}

// ── ADMINS PAGE ──
function AdminsPage(){
  const[admins,setAdmins]=useLS("jh_admins_v3",[]);
  const[showAdd,setShowAdd]=useState(false);
  const[form,setForm]=useState({name:"",username:"",password:""});
  const[err,setErr]=useState("");

  function add(){
    if(!form.name||!form.username||!form.password){setErr("Todos los campos son requeridos");return}
    if(form.username==="johel"||admins.some(a=>a.username===form.username)){setErr("Ese usuario ya existe");return}
    setAdmins([...admins,{id:genId(),...form,role:"trainer"}]);setForm({name:"",username:"",password:""});setErr("");setShowAdd(false);
  }
  function del(id){if(!confirm("¿Eliminar administrador?"))return;setAdmins(admins.filter(a=>a.id!==id))}

  return(<div>
    <div className="ph"><div><div className="pt">Administradores</div><div className="ps">Perfiles con acceso de entrenador</div></div><button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Nuevo admin</button></div>
    <div className="card" style={{padding:0,overflowX:"auto"}}>
      <table className="tbl">
        <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th></th></tr></thead>
        <tbody>
          <tr><td><strong>Johel Herrera</strong></td><td>@johel</td><td><span className="badge bd-blue">Principal</span></td><td></td></tr>
          {admins.map(a=>(<tr key={a.id}>
            <td><strong>{a.name}</strong></td><td>@{a.username}</td>
            <td><span className="badge bd-gray">Administrador</span></td>
            <td><button className="ibtn d" onClick={()=>del(a.id)}>🗑</button></td>
          </tr>))}
          {admins.length===0&&<tr><td colSpan={4} style={{textAlign:"center",color:"#6B7A99",padding:20,fontSize:12}}>Sin administradores adicionales</td></tr>}
        </tbody>
      </table>
    </div>
    {showAdd&&<Modal title="Nuevo administrador" onClose={()=>setShowAdd(false)}>
      {err&&<div className="err">{err}</div>}
      <div className="fg"><label>Nombre completo</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ej: Ana Pérez"/></div>
      <div className="fr2">
        <div className="fg"><label>Usuario</label><input className="inp" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="ana.perez"/></div>
        <div className="fg"><label>Contraseña</label><PasswordInput value={form.password} onChange={e=>setForm({...form,password:e.target.value})} autoComplete="new-password"/></div>
      </div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={add}>Crear</button><button className="btn btn-g" onClick={()=>setShowAdd(false)}>Cancelar</button></div>
    </Modal>}
  </div>);
}

// ── PAYMENT MODULE ──
function PaymentModule({client,setClient}){
  const[showPay,setShowPay]=useState(false);
  const[period,setPeriod]=useState(1);
  const[payDate,setPayDate]=useState(new Date().toISOString().split("T")[0]);
  const[amount,setAmount]=useState(client.plan?.price||"");
  const[notes,setNotes]=useState("");
  const payments=client.payments||[];

  function registerPayment(){
    const currentEnd=client.plan?.endDate;
    const base=(currentEnd&&getPlanStatus(currentEnd)==="Activo")?currentEnd:payDate;
    const newEnd=addMonths(base,period);
    const pay={id:genId(),date:payDate,months:period,amount,notes,endDate:newEnd};
    const newPlan={...client.plan,endDate:newEnd,startDate:client.plan?.startDate||payDate};
    setClient({...client,plan:newPlan,payments:[pay,...payments]});
    setShowPay(false);setNotes("");
  }

  const st=getPlanStatus(client.plan?.endDate);
  const dl=daysLeft(client.plan?.endDate);

  return(<div>
    <div className="sa">
      <div>
        <span className={`badge ${st==="Activo"?"bd-green":st==="Vencido"?"bd-red":"bd-gray"}`} style={{fontSize:12,padding:"4px 12px"}}>{st}</span>
        {dl!==null&&<span style={{fontSize:11,color:"#6B7A99",marginLeft:8}}>{dl<0?`Venció hace ${Math.abs(dl)} días`:`${dl} días restantes`}</span>}
      </div>
      <button className="btn btn-ok btn-sm" onClick={()=>setShowPay(true)}>💰 Registrar pago</button>
    </div>

    {payments.length>0&&<div>
      <div style={{fontSize:10,fontWeight:700,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Historial de pagos</div>
      {payments.slice(0,5).map(p=>{
        const lbl=PAYMENT_PERIODS.find(x=>x.months===p.months)?.label||`${p.months} meses`;
        return(<div key={p.id} className="pay-hist">
          <span>💰</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:12}}>{fmtDate(p.date)} · {lbl}</div>
            <div style={{fontSize:10,color:"#6B7A99"}}>Válido hasta: {fmtDate(p.endDate)}{p.amount&&` · ₡${p.amount}`}{p.notes&&` · ${p.notes}`}</div>
          </div>
        </div>);
      })}
    </div>}
    {payments.length===0&&<div style={{textAlign:"center",padding:16,color:"#6B7A99",fontSize:12}}>Sin pagos registrados — el plan está sin activar</div>}

    {showPay&&<Modal title="Registrar pago" onClose={()=>setShowPay(false)}>
      <div className="fg"><label>Fecha de pago</label><input className="inp" type="date" value={payDate} onChange={e=>setPayDate(e.target.value)}/></div>
      <div className="fg"><label>Período pagado</label>
        {PAYMENT_PERIODS.map(p=>(<div key={p.months} className={`pay-row${period===p.months?" selected":""}`} onClick={()=>setPeriod(p.months)}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${period===p.months?"#1A5DC8":"#DDE4F0"}`,background:period===p.months?"#1A5DC8":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{period===p.months&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}</div>
            <span style={{fontSize:13,fontWeight:600}}>{p.label}</span>
          </div>
        </div>))}
      </div>
      <div className="fr2">
        <div className="fg"><label>Monto (₡/$)</label><input className="inp" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0"/></div>
        <div className="fg"><label>Notas</label><input className="inp" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Opcional"/></div>
      </div>
      <div style={{background:"#EFF6FF",borderRadius:8,padding:10,fontSize:12,marginBottom:12,color:"#1A5DC8"}}>
        ✅ Nuevo vencimiento: <strong>{fmtDate(addMonths(client.plan?.endDate&&getPlanStatus(client.plan.endDate)==="Activo"?client.plan.endDate:payDate,period))}</strong>
      </div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-ok" onClick={registerPayment}>Confirmar pago</button><button className="btn btn-g" onClick={()=>setShowPay(false)}>Cancelar</button></div>
    </Modal>}
  </div>);
}

// ── PLAN EDITOR ──
function PlanEditor({client,onSave}){
  const[form,setForm]=useState(()=>({type:"Base",modality:"En Estudio",format:"Individual",startDate:"",endDate:"",price:"",notes:"",...(client.plan||{})}));
  return(<div className="card">
    <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Configuración del plan</div>
    <div className="fr3"><div className="fg"><label>Tipo</label><select className="sel" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{PLAN_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
    <div className="fg"><label>Modalidad</label><select className="sel" value={form.modality} onChange={e=>setForm({...form,modality:e.target.value})}>{PLAN_MODALITIES.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
    <div className="fg"><label>Formato</label><select className="sel" value={form.format} onChange={e=>setForm({...form,format:e.target.value})}>{PLAN_FORMATS.map(f=><option key={f} value={f}>{f}</option>)}</select></div></div>
    <div className="fr2"><div className="fg"><label>Inicio</label><input className="inp" type="date" value={form.startDate||""} onChange={e=>setForm({...form,startDate:e.target.value})}/></div>
    <div className="fg"><label>Precio</label><input className="inp" value={form.price||""} onChange={e=>setForm({...form,price:e.target.value})} placeholder="₡ / $"/></div></div>
    <div className="fg"><label>Notas</label><input className="inp" value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Descuento, acuerdo especial..."/></div>
    <button className="btn btn-p" onClick={()=>onSave(form)}>💾 Guardar configuración</button>
  </div>);
}

// ── MEASUREMENTS ──
function MeasurementsTab({client,measurements,setMeasurements}){
  const[showAdd,setShowAdd]=useState(false);
  const[mForm,setMForm]=useState({date:new Date().toISOString().split("T")[0],...Object.fromEntries(MEASUREMENT_FIELDS.map(f=>[f.key,""]))});
  const clientMs=measurements.filter(m=>m.clientId===client.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const latest=clientMs[0];

  function save(){setMeasurements([...measurements,{id:genId(),clientId:client.id,...mForm}]);setShowAdd(false);setMForm({date:new Date().toISOString().split("T")[0],...Object.fromEntries(MEASUREMENT_FIELDS.map(f=>[f.key,""]))});}
  function del(id){if(!confirm("¿Eliminar?"))return;setMeasurements(measurements.filter(m=>m.id!==id))}

  return(<div>
    <div className="sa"><div style={{fontWeight:700,fontSize:13}}>Última medición{latest?` — ${fmtDate(latest.date)}`:""}</div><button className="btn btn-p btn-sm" onClick={()=>setShowAdd(true)}>+ Registrar</button></div>
    {latest?(<div className="m-grid">{MEASUREMENT_FIELDS.map(f=>{const v=latest[f.key];return v?(<div key={f.key} className="m-card"><div className="m-lbl">{f.label}</div><div className="m-val">{v}<span className="m-unit"> {f.unit}</span></div></div>):null;})}</div>):<div className="empty"><div className="ico">📊</div><p>Sin mediciones</p></div>}
    {showAdd&&<Modal title="Registrar medición" onClose={()=>setShowAdd(false)}>
      <div className="fg"><label>Fecha</label><input className="inp" type="date" value={mForm.date} onChange={e=>setMForm({...mForm,date:e.target.value})}/></div>
      <div className="fr2">{MEASUREMENT_FIELDS.map(f=>(<div key={f.key} className="fg"><label>{f.label}{f.unit?` (${f.unit})`:""}</label><input className="inp" type="number" step="0.1" value={mForm[f.key]} onChange={e=>setMForm({...mForm,[f.key]:e.target.value})} placeholder="—"/></div>))}</div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={save}>Guardar</button><button className="btn btn-g" onClick={()=>setShowAdd(false)}>Cancelar</button></div>
    </Modal>}
  </div>);
}

// ── HISTORY WITH CHART SELECTOR ──
function HistoryTab({client,measurements,setMeasurements}){
  const[chartField,setChartField]=useState("weight");
  const clientMs=measurements.filter(m=>m.clientId===client.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const chartData=clientMs.slice(0,10).reverse().filter(m=>m[chartField]&&Number(m[chartField])>0);
  const max=chartData.length?Math.max(...chartData.map(m=>Number(m[chartField]))):1;
  const min=chartData.length?Math.min(...chartData.map(m=>Number(m[chartField]))):0;
  const range=max-min||1;
  const fld=MEASUREMENT_FIELDS.find(f=>f.key===chartField);

  function del(id){if(!confirm("¿Eliminar?"))return;setMeasurements(measurements.filter(m=>m.id!==id))}

  return(<div>
    {clientMs.length>1&&<div className="card" style={{marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1}}>Gráfico:</div>
        <select className="sel" style={{width:"auto",minWidth:140}} value={chartField} onChange={e=>setChartField(e.target.value)}>
          {MEASUREMENT_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}{f.unit?` (${f.unit})`:""}</option>)}
        </select>
      </div>
      {chartData.length>1?(<div className="chart-wrap"><div className="chart-inner">{chartData.map((m,i)=>{const h=Math.max(4,((Number(m[chartField])-min)/range)*80+10);return(<div key={i} className="chart-col"><div className="chart-val">{m[chartField]}</div><div className="chart-bar-f" style={{height:h}}/><div className="chart-lbl">{m.date?.slice(5)}</div></div>);})}</div></div>):(<div style={{textAlign:"center",padding:12,color:"#6B7A99",fontSize:12}}>Necesitas al menos 2 mediciones de {fld?.label} para ver la gráfica</div>)}
    </div>}
    <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Historial ({clientMs.length})</div>
    {clientMs.map(m=>(<div key={m.id} className="hist-row">
      <div className="hist-date">{fmtDate(m.date)}</div>
      <div className="hist-vals">{MEASUREMENT_FIELDS.map(f=>m[f.key]&&<span key={f.key} className="hist-val">{f.label.split(" ")[0]}: {m[f.key]}{f.unit}</span>)}</div>
      <button className="ibtn d" onClick={()=>del(m.id)}>🗑</button>
    </div>))}
    {clientMs.length===0&&<div className="empty"><div className="ico">📈</div><p>Sin historial</p></div>}
  </div>);
}

// ── CLIENT DETAIL ──
function ClientDetail({client,setClient,measurements,setMeasurements,routines,onBack}){
  const[tab,setTab]=useState("info");
  const[showEditInfo,setShowEditInfo]=useState(false);
  const[cForm,setCForm]=useState({...client});

  function saveInfo(){setClient({...cForm});setShowEditInfo(false)}
  function savePlan(plan){setClient({...client,plan})}

  const routine=routines.find(r=>r.userId===client.id);
  const dl=daysLeft(client.plan?.endDate);
  const age=client.dob?calcAge(client.dob):null;

  return(<div>
    <button className="back-btn" onClick={onBack}>← Volver</button>
    <div className="ph">
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:"#3A8EF6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff",flexShrink:0}}>{initials(client.name)}</div>
        <div><div className="pt" style={{fontSize:20}}>{client.name}</div><div className="ps">@{client.username}{age!==null&&` · ${age} años`}</div></div>
      </div>
      {dl!==null&&dl>=0&&dl<=30&&<div className="warn-box" style={{margin:0,alignSelf:"center"}}>⚠ Plan vence en {dl}d</div>}
    </div>
    <div className="tabs">
      {[["info","👤 Info"],["plan","💳 Plan"],["payments","💰 Pagos"],["measurements","📊 Medición"],["history","📈 Historial"]].map(([id,lbl])=>(<div key={id} className={`tab${tab===id?" active":""}`} onClick={()=>setTab(id)}>{lbl}</div>))}
    </div>

    {tab==="info"&&(<div className="card">
      <div className="sa"><div style={{fontWeight:700,fontSize:13}}>Datos personales</div><button className="btn btn-s btn-sm" onClick={()=>{setCForm({...client});setShowEditInfo(true)}}>✏️ Editar</button></div>
      <div className="fr2">{[["Nombre",client.name],["Usuario","@"+client.username],["Cédula",client.cedula],["Teléfono",client.phone],["Correo",client.email],["Fecha nac.",fmtDate(client.dob)],["Edad",age!==null?(age+" años"):"—"],["Estatura",client.height?(client.height+" cm"):"—"]].map(([k,v])=>(<div key={k} style={{padding:"8px 0",borderBottom:"1px solid #DDE4F0"}}><div style={{fontSize:10,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1}}>{k}</div><div style={{fontSize:13,fontWeight:600,marginTop:2}}>{v||"—"}</div></div>))}</div>
      {client.notes&&<div style={{marginTop:10,padding:10,background:"#F8F9FF",borderRadius:7,fontSize:12,color:"#6B7A99"}}>{client.notes}</div>}
      <div style={{marginTop:10,fontSize:12,color:"#6B7A99"}}>Rutina: <strong style={{color:"#0B1F4B"}}>{routine?routine.title:"Sin rutina"}</strong></div>
    </div>)}

    {tab==="plan"&&<PlanEditor client={client} onSave={savePlan}/>}
    {tab==="payments"&&<div className="card"><PaymentModule client={client} setClient={setClient}/></div>}
    {tab==="measurements"&&<MeasurementsTab client={client} measurements={measurements} setMeasurements={setMeasurements}/>}
    {tab==="history"&&<HistoryTab client={client} measurements={measurements} setMeasurements={setMeasurements}/>}

    {showEditInfo&&<Modal title="Editar datos" onClose={()=>setShowEditInfo(false)}>
      <div className="fr2">
        <div className="fg"><label>Nombre</label><input className="inp" value={cForm.name||""} onChange={e=>setCForm({...cForm,name:e.target.value})}/></div>
        <div className="fg"><label>Usuario</label><input className="inp" value={cForm.username||""} onChange={e=>setCForm({...cForm,username:e.target.value})}/></div>
        <div className="fg"><label>Contraseña</label><PasswordInput value={cForm.password||""} onChange={e=>setCForm({...cForm,password:e.target.value})} autoComplete="new-password"/></div>
        <div className="fg"><label>Cédula</label><input className="inp" value={cForm.cedula||""} onChange={e=>setCForm({...cForm,cedula:e.target.value})}/></div>
        <div className="fg"><label>Teléfono</label><input className="inp" value={cForm.phone||""} onChange={e=>setCForm({...cForm,phone:e.target.value})}/></div>
        <div className="fg"><label>Correo</label><input className="inp" type="email" value={cForm.email||""} onChange={e=>setCForm({...cForm,email:e.target.value})}/></div>
        <div className="fg"><label>Fecha de nacimiento</label><input className="inp" type="date" value={cForm.dob||""} onChange={e=>setCForm({...cForm,dob:e.target.value})}/></div>
        <div className="fg"><label>Estatura (cm)</label><input className="inp" type="number" value={cForm.height||""} onChange={e=>setCForm({...cForm,height:e.target.value})}/></div>
      </div>
      <div className="fg"><label>Notas internas</label><textarea className="ta" value={cForm.notes||""} onChange={e=>setCForm({...cForm,notes:e.target.value})}/></div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={saveInfo}>Guardar</button><button className="btn btn-g" onClick={()=>setShowEditInfo(false)}>Cancelar</button></div>
    </Modal>}
  </div>);
}

// ── CLIENTS LIST ──
function ClientsPage({users,setUsers,routines,measurements,setMeasurements}){
  const[detail,setDetail]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[form,setForm]=useState({name:"",username:"",password:"",phone:"",email:"",cedula:"",dob:"",height:"",notes:""});
  const[err,setErr]=useState("");

  function addClient(){
    if(!form.name||!form.username||!form.password){setErr("Nombre, usuario y contraseña son requeridos");return}
    if(users.some(u=>u.username===form.username)){setErr("Ese usuario ya existe");return}
    setUsers([...users,{id:genId(),...form,role:"user",plan:{type:"Base",modality:"En Estudio",format:"Individual",startDate:"",endDate:"",price:""},payments:[]}]);
    setForm({name:"",username:"",password:"",phone:"",email:"",cedula:"",dob:"",height:"",notes:""});setErr("");setShowAdd(false);
  }
  function updateClient(u){setUsers(users.map(x=>x.id===u.id?u:x));setDetail(u)}

  if(detail){
    const live=users.find(u=>u.id===detail.id)||detail;
    return<ClientDetail client={live} setClient={c=>updateClient({...live,...c})} measurements={measurements} setMeasurements={setMeasurements} routines={routines} onBack={()=>setDetail(null)}/>;
  }
  return(<div>
    <div className="ph"><div><div className="pt">Clientes</div><div className="ps">{users.length} clientes</div></div><button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Nuevo</button></div>
    <div className="card" style={{padding:0,overflowX:"auto"}}>
      <table className="tbl">
        <thead><tr><th>Cliente</th><th>Plan</th><th>Modalidad</th><th>Vence</th><th>Estado</th></tr></thead>
        <tbody>{users.map(u=>{
          const st=getPlanStatus(u.plan?.endDate);
          const dl=daysLeft(u.plan?.endDate);
          return(<tr key={u.id} style={{cursor:"pointer"}} onClick={()=>setDetail(u)}>
            <td><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:28,height:28,borderRadius:"50%",background:"#3A8EF6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>{initials(u.name)}</div><div><strong>{u.name}</strong><br/><span style={{color:"#6B7A99",fontSize:10}}>@{u.username}</span></div></div></td>
            <td><span className={`badge ${planColor(u.plan?.type)}`}>{u.plan?.type||"—"}</span></td>
            <td><span className="badge bd-gray">{u.plan?.modality||"—"}</span></td>
            <td style={{fontSize:11}}>{fmtDate(u.plan?.endDate)}{dl!==null&&dl>=0&&dl<=15&&<span style={{color:"#F57C00",fontWeight:700}}> ⚠</span>}</td>
            <td><span className={`badge ${st==="Activo"?"bd-green":st==="Vencido"?"bd-red":"bd-gray"}`}>{st}</span></td>
          </tr>);
        })}{users.length===0&&<tr><td colSpan={5}><div className="empty"><div className="ico">👥</div><p>Sin clientes</p></div></td></tr>}</tbody>
      </table>
    </div>
    {showAdd&&<Modal title="Nuevo cliente" onClose={()=>setShowAdd(false)}>
      {err&&<div className="err">{err}</div>}
      <div className="fr2">
        <div className="fg"><label>Nombre *</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="María García"/></div>
        <div className="fg"><label>Usuario *</label><input className="inp" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="maria.garcia"/></div>
        <div className="fg"><label>Contraseña *</label><PasswordInput value={form.password} onChange={e=>setForm({...form,password:e.target.value})} autoComplete="new-password"/></div>
        <div className="fg"><label>Cédula</label><input className="inp" value={form.cedula} onChange={e=>setForm({...form,cedula:e.target.value})}/></div>
        <div className="fg"><label>Teléfono</label><input className="inp" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
        <div className="fg"><label>Correo</label><input className="inp" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div className="fg"><label>Fecha de nacimiento</label><input className="inp" type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/></div>
        <div className="fg"><label>Estatura (cm)</label><input className="inp" type="number" value={form.height} onChange={e=>setForm({...form,height:e.target.value})}/></div>
      </div>
      <div className="fg"><label>Notas</label><textarea className="ta" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2}/></div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={addClient}>Crear</button><button className="btn btn-g" onClick={()=>setShowAdd(false)}>Cancelar</button></div>
    </Modal>}
  </div>);
}

// ── EXERCISES ──
function ExercisesPage({exercises,setExercises}){
  const[tab,setTab]=useState("normal");const[filter,setFilter]=useState("Todos");const[search,setSearch]=useState("");const[showAdd,setShowAdd]=useState(false);const[editing,setEditing]=useState(null);const[videoEx,setVideoEx]=useState(null);const[form,setForm]=useState({name:"",videoUrl:"",muscleGroup:"Piernas",type:"normal",equipment:"Ninguno"});
  const list=exercises.filter(e=>e.type===tab&&(filter==="Todos"||e.muscleGroup===filter)&&e.name.toLowerCase().includes(search.toLowerCase()));
  function openAdd(){setForm({name:"",videoUrl:"",muscleGroup:"Piernas",type:tab,equipment:"Ninguno"});setEditing(null);setShowAdd(true)}
  function openEdit(ex){setForm({name:ex.name,videoUrl:ex.videoUrl||"",muscleGroup:ex.muscleGroup,type:ex.type,equipment:ex.equipment||"Ninguno"});setEditing(ex);setShowAdd(true)}
  function save(){if(!form.name.trim())return;if(editing)setExercises(exercises.map(e=>e.id===editing.id?{...e,...form}:e));else setExercises([...exercises,{id:genId(),...form}]);setShowAdd(false)}
  function del(id){if(!confirm("¿Eliminar?"))return;setExercises(exercises.filter(e=>e.id!==id))}
  const groups=["Todos",...new Set(exercises.filter(e=>e.type===tab).map(e=>e.muscleGroup))].filter((v,i,a)=>a.indexOf(v)===i);
  return(<div>
    <div className="ph"><div><div className="pt">Ejercicios</div><div className="ps">{exercises.length} ejercicios</div></div><button className="btn btn-p" onClick={openAdd}>+ Agregar</button></div>
    <div className="tabs">{["normal","stretching"].map(t=>(<div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>{setTab(t);setFilter("Todos")}}>{t==="normal"?"🏋️ Ejercicios":"🧘 Estiramientos"}</div>))}</div>
    <input className="inp" placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:8}}/>
    <div className="chips">{groups.map(g=><button key={g} className={`chip${filter===g?" on":""}`} onClick={()=>setFilter(g)}>{g}</button>)}</div>
    <div className="card" style={{padding:0,overflowX:"auto"}}>
      <table className="tbl"><thead><tr><th>Ejercicio</th><th>Músculo</th><th>Equipo</th><th>Video</th><th></th></tr></thead>
      <tbody>{list.map(ex=>(<tr key={ex.id}>
        <td><strong>{ex.name}</strong></td><td><span className="badge bd-blue">{ex.muscleGroup}</span></td><td><span className="badge bd-gray">{ex.equipment||"Ninguno"}</span></td>
        <td>{ex.videoUrl?<button className="vbtn" onClick={()=>setVideoEx(ex)}>▶</button>:<span style={{color:"#6B7A99",fontSize:10}}>—</span>}</td>
        <td style={{display:"flex",gap:4}}><button className="ibtn" onClick={()=>openEdit(ex)}>✏️</button><button className="ibtn d" onClick={()=>del(ex.id)}>🗑</button></td>
      </tr>))}{list.length===0&&<tr><td colSpan={5}><div className="empty"><div className="ico">🏋️</div><p>Sin ejercicios</p></div></td></tr>}</tbody></table>
    </div>
    {showAdd&&<Modal title={editing?"Editar ejercicio":"Nuevo ejercicio"} onClose={()=>setShowAdd(false)}>
      <div className="fg"><label>Nombre</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nombre del ejercicio"/></div>
      <div className="fr2">
        <div className="fg"><label>Grupo muscular</label><input className="inp" list="mg-list" value={form.muscleGroup} onChange={e=>setForm({...form,muscleGroup:e.target.value})}/><datalist id="mg-list">{MUSCLE_GROUPS_FILTER.slice(1).map(g=><option key={g} value={g}/>)}</datalist></div>
        <div className="fg"><label>Tipo</label><select className="sel" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="normal">Normal</option><option value="stretching">Estiramiento</option></select></div>
      </div>
      <div className="fg"><label>Equipo</label><select className="sel" value={form.equipment} onChange={e=>setForm({...form,equipment:e.target.value})}>{EQUIPMENT_TYPES.map(eq=><option key={eq} value={eq}>{eq}</option>)}</select></div>
      <div className="fg"><label>URL Video (YouTube)</label><input className="inp" value={form.videoUrl} onChange={e=>setForm({...form,videoUrl:e.target.value})} placeholder="https://www.youtube.com/..."/></div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={save}>{editing?"Guardar":"Crear"}</button><button className="btn btn-g" onClick={()=>setShowAdd(false)}>Cancelar</button></div>
    </Modal>}
    {videoEx&&<VideoModal name={videoEx.name} url={videoEx.videoUrl} onClose={()=>setVideoEx(null)}/>}
  </div>);
}

// ── ROUTINE EDITOR ──
function RoutineEditor({routine,exercises,users,onSave,onBack}){
  const blank={id:genId(),userId:"",title:"Nueva Rutina",daysPerWeek:0,note:"",days:[],warmupStretchIds:[],cooldownStretchIds:[]};
  const[rt,setRt]=useState(()=>routine?JSON.parse(JSON.stringify(routine)):blank);
  const[selDay,setSelDay]=useState(0);const[exPicker,setExPicker]=useState(null);const[strPicker,setStrPicker]=useState(null);

  function updateDays(count){
    if(!count){setRt(r=>({...r,daysPerWeek:0,days:[]}));return}
    const days=[...rt.days];
    while(days.length<count)days.push({id:genId(),label:`Entrenamiento ${days.length+1}`,groups:[]});
    const nd=days.slice(0,count);
    setRt(r=>({...r,daysPerWeek:count,days:nd}));
    if(selDay>=count)setSelDay(Math.max(0,count-1));
  }
  function addGroup(di){const labels=["A","B","C","D","E","F","G"];setRt(r=>{const days=r.days.map((d,i)=>{if(i!==di)return d;const lbl=labels[d.groups.length]||`G${d.groups.length+1}`;return{...d,groups:[...d.groups,{id:genId(),label:lbl,restSeconds:60,exercises:[]}]};});return{...r,days}});}
  function removeGroup(di,gi){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.filter((_,j)=>j!==gi)});return{...r,days}})}
  function updGroup(di,gi,k,v){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.map((g,j)=>j!==gi?g:{...g,[k]:v})});return{...r,days}})}
  function addEx(di,gi,ex){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.map((g,j)=>j!==gi?g:{...g,exercises:[...g.exercises,{exId:ex.id,series:3,reps:"12",notes:"",weightAmount:"",weightUnit:"lbs",equipment:ex.equipment||"Ninguno",surface:"Ninguno"}]})});return{...r,days}});setExPicker(null);}
  function removeEx(di,gi,ei){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.map((g,j)=>j!==gi?g:{...g,exercises:g.exercises.filter((_,k)=>k!==ei)})});return{...r,days}})}
  function updEx(di,gi,ei,k,v){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.map((g,j)=>j!==gi?g:{...g,exercises:g.exercises.map((e,k2)=>k2!==ei?e:{...e,[k]:v})})});return{...r,days}})}
  function toggleStretch(kind,id){const key=kind==="warmup"?"warmupStretchIds":"cooldownStretchIds";setRt(r=>{const arr=r[key]||[];return{...r,[key]:arr.includes(id)?arr.filter(x=>x!==id):[...arr,id]}});}

  const day=rt.days[selDay];
  const warmupIds=rt.warmupStretchIds||[];
  const cooldownIds=rt.cooldownStretchIds||[];

  return(<div>
    <button className="back-btn" onClick={onBack}>← Volver a Rutinas</button>
    <div className="ph"><div><div className="pt">{routine?"Editar Rutina":"Nueva Rutina"}</div></div><button className="btn btn-ok" onClick={()=>onSave(rt)}>💾 Guardar</button></div>
    <div className="card" style={{marginBottom:12}}>
      <div className="fr2">
        <div className="fg"><label>Título</label><input className="inp" value={rt.title} onChange={e=>setRt(r=>({...r,title:e.target.value}))}/></div>
        <div className="fg"><label>Cliente</label><select className="sel" value={rt.userId} onChange={e=>setRt(r=>({...r,userId:e.target.value}))}><option value="">— Seleccionar —</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
      </div>
      <div className="fr2">
        <div className="fg"><label>Días por semana</label>
          <select className="sel" value={rt.daysPerWeek} onChange={e=>updateDays(Number(e.target.value))}>
            <option value={0}>— Seleccionar días —</option>
            {[1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n} {n===1?"día":"días"}</option>)}
          </select>
        </div>
        <div className="fg"><label>Nota general</label><input className="inp" value={rt.note||""} onChange={e=>setRt(r=>({...r,note:e.target.value}))} placeholder="Instrucciones para el cliente..."/></div>
      </div>
      <div className="fr2">
        <div className="fg"><label>🧘 Calentamiento ({warmupIds.length})</label><button className="btn btn-s btn-sm" onClick={()=>setStrPicker("warmup")}>Configurar</button>{warmupIds.length>0&&<div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>{warmupIds.map(id=>{const ex=exercises.find(e=>e.id===id);return ex&&<span key={id} className="badge bd-green">{ex.name}</span>})}</div>}</div>
        <div className="fg"><label>🧘 Enfriamiento ({cooldownIds.length})</label><button className="btn btn-s btn-sm" onClick={()=>setStrPicker("cooldown")}>Configurar</button>{cooldownIds.length>0&&<div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>{cooldownIds.map(id=>{const ex=exercises.find(e=>e.id===id);return ex&&<span key={id} className="badge bd-teal">{ex.name}</span>})}</div>}</div>
      </div>
    </div>

    {rt.days.length>0&&<>
      <div className="tabs">{rt.days.map((d,i)=>(<div key={d.id} className={`tab${selDay===i?" active":""}`} onClick={()=>setSelDay(i)}>Día {i+1}</div>))}</div>
      {day&&<div className="card">
        <div className="fg"><label>Nombre del día</label><input className="inp" value={day.label} onChange={e=>setRt(r=>{const days=r.days.map((d,i)=>i===selDay?{...d,label:e.target.value}:d);return{...r,days}})}/></div>
        {day.groups.map((g,gi)=>(<div key={g.id} className="grp-card">
          <div className="grp-h">
            <div className="grp-lbl">{g.label}</div>
            <input className="inp" style={{width:50,minHeight:34,fontSize:12}} value={g.label} onChange={e=>updGroup(selDay,gi,"label",e.target.value)}/>
            <span style={{fontSize:11,color:"#6B7A99"}}>Desc:</span>
            <select className="sel" style={{width:80,minHeight:34,fontSize:12}} value={g.restSeconds} onChange={e=>updGroup(selDay,gi,"restSeconds",Number(e.target.value))}>{[15,20,30,45,60,90,120].map(s=><option key={s} value={s}>{s}s</option>)}</select>
            <button className="ibtn d" style={{marginLeft:"auto"}} onClick={()=>removeGroup(selDay,gi)}>🗑</button>
          </div>
          <div className="grp-b">
            {g.exercises.map((ex,ei)=>{const info=exercises.find(e=>e.id===ex.exId);return(<div key={ei} style={{borderBottom:"1px solid #DDE4F0",paddingBottom:10,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><strong style={{fontSize:13,flex:1}}>{info?.name||"?"}</strong><span className="badge bd-blue" style={{fontSize:9}}>{info?.muscleGroup}</span><button className="ibtn d" onClick={()=>removeEx(selDay,gi,ei)}>✕</button></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                <div><label style={{fontSize:9}}>Series</label><input className="inp" type="number" min={1} value={ex.series} onChange={e=>updEx(selDay,gi,ei,"series",Number(e.target.value))}/></div>
                <div><label style={{fontSize:9}}>Reps / Duración</label><input className="inp" value={ex.reps} onChange={e=>updEx(selDay,gi,ei,"reps",e.target.value)}/></div>
                <div><label style={{fontSize:9}}>Peso</label><div style={{display:"flex",gap:3}}><input className="inp" style={{flex:1}} type="number" value={ex.weightAmount} onChange={e=>updEx(selDay,gi,ei,"weightAmount",e.target.value)} placeholder="0"/><select className="sel" style={{width:65}} value={ex.weightUnit} onChange={e=>updEx(selDay,gi,ei,"weightUnit",e.target.value)}><option value="lbs">lbs</option><option value="kg">kg</option></select></div></div>
                <div><label style={{fontSize:9}}>Equipo</label><select className="sel" value={ex.equipment} onChange={e=>updEx(selDay,gi,ei,"equipment",e.target.value)}>{EQUIPMENT_TYPES.map(eq=><option key={eq} value={eq}>{eq}</option>)}</select></div>
                <div><label style={{fontSize:9}}>Superficie</label><select className="sel" value={ex.surface||"Ninguno"} onChange={e=>updEx(selDay,gi,ei,"surface",e.target.value)}>{SURFACE_TYPES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={{fontSize:9}}>Notas</label><input className="inp" value={ex.notes} onChange={e=>updEx(selDay,gi,ei,"notes",e.target.value)} placeholder="Obs..."/></div>
              </div>
            </div>);})}
            <button className="btn btn-s btn-sm" onClick={()=>setExPicker({dayIdx:selDay,gIdx:gi})}>+ Agregar ejercicio</button>
          </div>
        </div>))}
        <button className="btn btn-g btn-sm" style={{marginTop:4}} onClick={()=>addGroup(selDay)}>+ Grupo</button>
      </div>}
    </>}
    {rt.days.length===0&&<div className="card"><div className="empty"><div className="ico">📅</div><p>Selecciona los días por semana arriba</p></div></div>}
    <div style={{display:"flex",gap:8,marginTop:14,paddingTop:14,borderTop:"1px solid #DDE4F0"}}>
      <button className="btn btn-ok" onClick={()=>onSave(rt)}>💾 Guardar rutina</button>
      <button className="btn btn-g" onClick={onBack}>Cancelar</button>
    </div>
    {exPicker&&<ExercisePicker exercises={exercises} onPick={ex=>addEx(exPicker.dayIdx,exPicker.gIdx,ex)} onClose={()=>setExPicker(null)}/>}
    {strPicker&&<StretchPicker exercises={exercises} selected={strPicker==="warmup"?warmupIds:cooldownIds} onToggle={id=>toggleStretch(strPicker,id)} onClose={()=>setStrPicker(null)}/>}
  </div>);
}

// ── ROUTINES LIST ──
function RoutinesPage({routines,setRoutines,users,exercises}){
  const[editing,setEditing]=useState(null);
  function saveRoutine(rt){
    const exists=routines.find(r=>r.id===rt.id);
    if(exists)setRoutines(routines.map(r=>r.id===rt.id?{...rt,updatedAt:new Date().toISOString()}:r));
    else setRoutines([...routines,{...rt,updatedAt:new Date().toISOString()}]);
    setEditing(null);
  }
  function del(id){if(!confirm("¿Eliminar rutina?"))return;setRoutines(routines.filter(r=>r.id!==id))}
  function copy(rt){const newRt={...JSON.parse(JSON.stringify(rt)),id:genId(),title:rt.title+" (copia)",updatedAt:new Date().toISOString(),userId:""};setRoutines([...routines,newRt]);}

  if(editing!==null)return<RoutineEditor routine={editing==="__new__"?null:editing} exercises={exercises} users={users} onSave={saveRoutine} onBack={()=>setEditing(null)}/>;
  return(<div>
    <div className="ph"><div><div className="pt">Rutinas</div><div className="ps">{routines.length} rutinas</div></div><button className="btn btn-p" onClick={()=>setEditing("__new__")}>+ Nueva</button></div>
    {routines.map(rt=>{const user=users.find(u=>u.id===rt.userId);const totalEx=rt.days?.reduce((s,d)=>s+d.groups.reduce((ss,g)=>ss+g.exercises.length,0),0)||0;
    return(<div key={rt.id} className="card" style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:900,color:"#0B1F4B"}}>{rt.title}</span>
            <span className="badge bd-blue">{rt.daysPerWeek}d/sem</span>
            {user&&<span className="badge bd-green">{user.name}</span>}
          </div>
          <div style={{fontSize:11,color:"#6B7A99",display:"flex",gap:12,flexWrap:"wrap"}}>
            <span>📅 {rt.days?.length||0} días</span><span>🏋️ {totalEx} ejercicios</span>{rt.updatedAt&&<span>🔄 {fmtDate(rt.updatedAt)}</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0,flexWrap:"wrap"}}>
          <button className="btn btn-g btn-sm" onClick={()=>copy(rt)} title="Copiar rutina">📋 Copiar</button>
          <button className="btn btn-s btn-sm" onClick={()=>setEditing(rt)}>✏️ Editar</button>
          <button className="btn btn-d btn-sm" onClick={()=>del(rt.id)}>🗑</button>
        </div>
      </div>
    </div>);})}
    {routines.length===0&&<div className="card"><div className="empty"><div className="ico">📋</div><p>Sin rutinas</p></div></div>}
  </div>);
}

// ── WORKOUT TIMER (per group) ──
function GroupTimer({restSeconds}){
  const[secs,setSecs]=useState(0);const[running,setRunning]=useState(false);
  const[restLeft,setRestLeft]=useState(0);const[restActive,setRestActive]=useState(false);
  const intRef=useRef(null);const restRef=useRef(null);

  useEffect(()=>{
    if(running){intRef.current=setInterval(()=>setSecs(s=>s+1),1000)}
    else clearInterval(intRef.current);
    return()=>clearInterval(intRef.current);
  },[running]);

  useEffect(()=>{
    if(restActive&&restLeft>0){restRef.current=setInterval(()=>setRestLeft(s=>{if(s<=1){clearInterval(restRef.current);setRestActive(false);return 0}return s-1}),1000)}
    else clearInterval(restRef.current);
    return()=>clearInterval(restRef.current);
  },[restActive,restLeft]);

  function startRest(s){setRestLeft(s);setRestActive(true)}
  function fmt(s){const m=Math.floor(s/60);const sec=s%60;return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`}

  return(<div className="timer-wrap">
    <div className="timer-box">
      <div>
        <div className="timer-lbl">Cronómetro</div>
        <div className="timer-disp">{fmt(secs)}</div>
      </div>
      <div style={{display:"flex",gap:5}}>
        <button className="btn btn-sm" style={{background:running?"#E53935":"#2E7D32",color:"#fff",minHeight:36}} onClick={()=>setRunning(r=>!r)}>{running?"⏸":"▶"}</button>
        <button className="btn btn-sm btn-g" style={{minHeight:36}} onClick={()=>{setSecs(0);setRunning(false)}}>↺</button>
      </div>
      <div style={{marginLeft:"auto",textAlign:"right"}}>
        <div className="timer-lbl">Descanso</div>
        <div style={{display:"flex",gap:4,justifyContent:"flex-end",marginTop:3}}>
          {[restSeconds,30,60].filter((v,i,a)=>a.indexOf(v)===i).map(s=>(
            <button key={s} className="btn btn-xs" style={{background:"#1A5DC8",color:"#fff"}} onClick={()=>startRest(s)}>{s}s</button>
          ))}
        </div>
      </div>
    </div>
    {restActive&&restLeft>0&&(
      <div className="rest-active">
        <span style={{color:"#fff",fontSize:13,fontWeight:700}}>⏱ Descanso</span>
        <div className="rest-disp">{fmt(restLeft)}</div>
        <button className="btn btn-xs" style={{background:"rgba(255,255,255,0.2)",color:"#fff",marginLeft:"auto"}} onClick={()=>{setRestActive(false);setRestLeft(0)}}>✕</button>
      </div>
    )}
  </div>);
}

// ── USER ROUTINE PAGE ──
function MyRoutinePage({user,routines,exercises}){
  const routine=routines.find(r=>r.userId===user.id);
  const[openDays,setOpenDays]=useState({});
  const[videoEx,setVideoEx]=useState(null);
  function toggleDay(id){setOpenDays(s=>({...s,[id]:!s[id]}))}
  if(!routine)return(<div><div className="ph"><div className="pt">Mi Rutina</div></div><div className="card"><div className="empty"><div className="ico">📋</div><p>Tu entrenador aún no te ha asignado una rutina.<br/>¡Pronto llegará tu plan!</p></div></div></div>);
  const warmupIds=routine.warmupStretchIds||[];
  const cooldownIds=routine.cooldownStretchIds||[];
  return(<div>
    <div className="ph">
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Logo size={36}/>
        <div><div className="pt" style={{fontSize:19}}>{routine.title}</div><div className="ps">{routine.daysPerWeek} días/semana</div></div>
      </div>
    </div>
    {routine.note&&<div className="note-box"><span>📝</span><span>{routine.note}</span></div>}
    {warmupIds.length>0&&(<div className="card" style={{marginBottom:12,background:"#E8F5E9",border:"1px solid #C8E6C9"}}>
      <div style={{fontWeight:700,fontSize:12,color:"#2E7D32",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>🧘 Calentamiento (20 seg c/u)</div>
      {warmupIds.map((id,i)=>{const ex=exercises.find(e=>e.id===id);return ex&&(<div key={id} style={{fontSize:13,padding:"6px 0",borderBottom:"1px solid #C8E6C9",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#2E7D32",fontWeight:700}}>{i+1}.</span><span style={{flex:1}}>{ex.name}</span>{ex.videoUrl&&<button className="vbtn" onClick={()=>setVideoEx(ex)}>▶</button>}</div>);})}
    </div>)}
    {routine.days.map((day)=>(<div key={day.id} className="day-card">
      <div className="day-h" onClick={()=>toggleDay(day.id)}>
        <div><div className="day-ht">{day.label}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.55)",marginTop:2}}>{day.groups.length} grupos · {day.groups.reduce((s,g)=>s+g.exercises.length,0)} ejercicios</div></div>
        <span style={{color:"rgba(255,255,255,0.5)",fontSize:20}}>{openDays[day.id]?"▲":"▼"}</span>
      </div>
      {openDays[day.id]&&(<div className="day-b">
        {day.groups.map((g)=>(<div key={g.id} className="grp-card">
          <div className="grp-h">
            <div className="grp-lbl">{g.label}</div>
            <span style={{fontSize:13,fontWeight:700}}>Grupo {g.label}</span>
            <span style={{marginLeft:"auto",fontSize:11,color:"#6B7A99"}}>⏱ {g.restSeconds}s</span>
          </div>
          <div className="grp-b">
            <GroupTimer restSeconds={g.restSeconds}/>
            {g.exercises.map((ex,ei)=>{
              const info=exercises.find(e=>e.id===ex.exId);
              const hasWeight=ex.weightAmount&&Number(ex.weightAmount)>0;
              const hasSurface=ex.surface&&ex.surface!=="Ninguno";
              const hasEquip=ex.equipment&&ex.equipment!=="Ninguno";
              return(<div key={ei} className="ex-row">
                <div className="ex-num">{ei+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="ex-nm">{info?.name||"Ejercicio"}</div>
                  <div className="ex-tags">
                    <span className="ex-tag"><span className="tag-lbl">Series</span>{ex.series}</span>
                    <span className="ex-tag"><span className="tag-lbl">Reps</span>{ex.reps}</span>
                    {hasWeight&&<span className="ex-tag"><span className="tag-lbl">Peso</span>{ex.weightAmount} {ex.weightUnit}</span>}
                    {hasEquip&&<span className="ex-tag"><span className="tag-lbl">Equipo</span>{ex.equipment}</span>}
                    {hasSurface&&<span className="ex-tag" style={{background:"#FFF3E0",borderColor:"#FFE0B2",color:"#F57C00"}}><span className="tag-lbl" style={{color:"#FB8C00"}}>Superficie</span>{ex.surface}</span>}
                  </div>
                  {ex.notes&&<div className="ex-dt">📌 {ex.notes}</div>}
                </div>
                {info?.videoUrl&&<button className="vbtn" onClick={()=>setVideoEx(info)}>▶</button>}
              </div>);
            })}
          </div>
        </div>))}
      </div>)}
    </div>))}
    {cooldownIds.length>0&&(<div className="card" style={{marginTop:12,background:"#E3F0FF",border:"1px solid #BBDEFB"}}>
      <div style={{fontWeight:700,fontSize:12,color:"#1A5DC8",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>🧘 Enfriamiento (20 seg c/u)</div>
      {cooldownIds.map((id,i)=>{const ex=exercises.find(e=>e.id===id);return ex&&(<div key={id} style={{fontSize:13,padding:"6px 0",borderBottom:"1px solid #BBDEFB",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#1A5DC8",fontWeight:700}}>{i+1}.</span><span style={{flex:1}}>{ex.name}</span>{ex.videoUrl&&<button className="vbtn" onClick={()=>setVideoEx(ex)}>▶</button>}</div>);})}
    </div>)}
    {videoEx&&<VideoModal name={videoEx.name} url={videoEx.videoUrl} onClose={()=>setVideoEx(null)}/>}
  </div>);
}

// ── USER PROFILE ──
function MyProfilePage({user,setUsers,users,measurements}){
  const[tab,setTab]=useState("info");
  const[editing,setEditing]=useState(false);
  const[form,setForm]=useState({...user});
  const[chartField,setChartField]=useState("weight");
  const photoKey="jh_photo_"+user.id;
  const[photo,setPhoto]=useState(()=>localStorage.getItem(photoKey)||"");

  const age=user.dob?calcAge(user.dob):null;
  const dl=daysLeft(user.plan?.endDate);
  const ini=initials(user.name);
  const clientMs=measurements.filter(m=>m.clientId===user.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const latest=clientMs[0];
  const chartData=clientMs.slice(0,10).reverse().filter(m=>m[chartField]&&Number(m[chartField])>0);

  function saveProfile(){
    setUsers(users.map(u=>u.id===user.id?{...u,...form}:u));
    setEditing(false);
  }

  function handlePhoto(e){
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{const data=ev.target.result;localStorage.setItem(photoKey,data);setPhoto(data);}
    reader.readAsDataURL(file);
  }

  const max=chartData.length?Math.max(...chartData.map(m=>Number(m[chartField]))):1;
  const min=chartData.length?Math.min(...chartData.map(m=>Number(m[chartField]))):0;
  const range=max-min||1;

  return(<div>
    <div className="ph"><div className="pt">Mi Perfil</div></div>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
      <label className="avatar-wrap" style={{cursor:"pointer"}}>
        <input type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
        <div className="avatar-big" style={{width:70,height:70,fontSize:26}}>{photo?<img src={photo} alt="foto"/>:ini}</div>
        <div className="avatar-edit">📷</div>
      </label>
      <div>
        <div style={{fontSize:20,fontWeight:800,color:"#0B1F4B"}}>{user.name}</div>
        <div style={{color:"#6B7A99",fontSize:12}}>@{user.username}{age!==null&&` · ${age} años`}</div>
      </div>
    </div>

    <div className="tabs">
      {[["info","👤 Info"],["measurements","📊 Mediciones"],["history","📈 Historial"]].map(([id,lbl])=>(<div key={id} className={`tab${tab===id?" active":""}`} onClick={()=>setTab(id)}>{lbl}</div>))}
    </div>

    {tab==="info"&&(<div>
      <div className="card" style={{marginBottom:12}}>
        <div className="sa"><div style={{fontWeight:700,fontSize:13}}>Mis datos</div><button className="btn btn-s btn-sm" onClick={()=>{setForm({...user});setEditing(true)}}>✏️ Editar</button></div>
        {[["Correo",user.email],["Teléfono",user.phone],["Cédula",user.cedula],["Fecha nac.",fmtDate(user.dob)],["Edad",age!==null?(age+" años"):"—"],["Estatura",user.height?(user.height+" cm"):"—"]].map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #DDE4F0",fontSize:13}}><span style={{color:"#6B7A99"}}>{k}</span><span style={{fontWeight:600}}>{v||"—"}</span></div>))}
      </div>
      <div className="card">
        <div style={{fontSize:11,fontWeight:700,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Mi plan</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
          <span className={`badge ${planColor(user.plan?.type)}`}>{user.plan?.type||"—"}</span>
          <span className="badge bd-gray">{user.plan?.modality||"—"}</span>
          <span className="badge bd-gray">{user.plan?.format||"—"}</span>
          {dl!==null&&<span className={`badge ${dl<0?"bd-red":dl<=30?"bd-orange":"bd-green"}`}>{dl<0?"Vencido":`${dl} días restantes`}</span>}
        </div>
        <div style={{fontSize:12,color:"#6B7A99"}}>Entrenador: <strong style={{color:"#0B1F4B"}}>Johel Herrera</strong></div>
      </div>
      {editing&&<Modal title="Editar mis datos" onClose={()=>setEditing(false)}>
        <div className="fr2">
          <div className="fg"><label>Correo</label><input className="inp" type="email" value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="fg"><label>Teléfono</label><input className="inp" value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div className="fg"><label>Cédula</label><input className="inp" value={form.cedula||""} onChange={e=>setForm({...form,cedula:e.target.value})}/></div>
          <div className="fg"><label>Fecha de nacimiento</label><input className="inp" type="date" value={form.dob||""} onChange={e=>setForm({...form,dob:e.target.value})}/></div>
          <div className="fg"><label>Estatura (cm)</label><input className="inp" type="number" value={form.height||""} onChange={e=>setForm({...form,height:e.target.value})}/></div>
        </div>
        <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={saveProfile}>Guardar</button><button className="btn btn-g" onClick={()=>setEditing(false)}>Cancelar</button></div>
      </Modal>}
    </div>)}

    {tab==="measurements"&&(<div>
      <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Última medición{latest?` — ${fmtDate(latest.date)}`:""}</div>
      {latest?(<div className="m-grid">{MEASUREMENT_FIELDS.map(f=>{const v=latest[f.key];return v?(<div key={f.key} className="m-card"><div className="m-lbl">{f.label}</div><div className="m-val">{v}<span className="m-unit"> {f.unit}</span></div></div>):null;})}</div>):<div className="empty"><div className="ico">📊</div><p>Sin mediciones registradas aún</p></div>}
    </div>)}

    {tab==="history"&&(<div>
      {clientMs.length>1&&<div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,color:"#6B7A99",textTransform:"uppercase"}}>Ver:</span>
          <select className="sel" style={{width:"auto",minWidth:140,minHeight:36}} value={chartField} onChange={e=>setChartField(e.target.value)}>{MEASUREMENT_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}{f.unit?` (${f.unit})`:""}</option>)}</select>
        </div>
        {chartData.length>1?(<div className="chart-wrap"><div className="chart-inner">{chartData.map((m,i)=>{const h=Math.max(4,((Number(m[chartField])-min)/range)*80+10);return(<div key={i} className="chart-col"><div className="chart-val">{m[chartField]}</div><div className="chart-bar-f" style={{height:h}}/><div className="chart-lbl">{m.date?.slice(5)}</div></div>);})}</div></div>):<div style={{textAlign:"center",padding:10,color:"#6B7A99",fontSize:12}}>Necesitas más datos para ver la gráfica</div>}
      </div>}
      {clientMs.map(m=>(<div key={m.id} className="hist-row"><div className="hist-date">{fmtDate(m.date)}</div><div className="hist-vals">{MEASUREMENT_FIELDS.map(f=>m[f.key]&&<span key={f.key} className="hist-val">{f.label.split(" ")[0]}: {m[f.key]}{f.unit}</span>)}</div></div>))}
      {clientMs.length===0&&<div className="empty"><div className="ico">📈</div><p>Sin historial</p></div>}
    </div>)}
  </div>);
}

// ── ROOT APP ──
export default function App(){
  const[currentUser,setCurrentUser]=useState(null);
  const[page,setPage]=useState("dashboard");
  const[exercises,setExercises]=useLS("jh_ex_v3",ALL_EXERCISES);
  const[users,setUsers]=useLS("jh_users_v3",INITIAL_USERS);
  const[routines,setRoutines]=useLS("jh_routines_v3",[]);
  const[measurements,setMeasurements]=useLS("jh_meas_v3",[]);
  const trainer=INITIAL_TRAINER;

  function login(u){setCurrentUser(u);setPage(u.role==="trainer"?"dashboard":"my-routine")}
  function logout(){setCurrentUser(null);setPage("dashboard")}

  if(!currentUser)return(<><style>{STYLES}</style><LoginPage onLogin={login} trainer={trainer} users={users}/></>);

  const isT=currentUser.role==="trainer";
  const liveUser=isT?currentUser:(users.find(u=>u.id===currentUser.id)||currentUser);
  let content;
  if(isT){
    if(page==="dashboard")content=<Dashboard users={users} routines={routines}/>;
    else if(page==="clients")content=<ClientsPage users={users} setUsers={setUsers} routines={routines} measurements={measurements} setMeasurements={setMeasurements}/>;
    else if(page==="routines")content=<RoutinesPage routines={routines} setRoutines={setRoutines} users={users} exercises={exercises}/>;
    else if(page==="exercises")content=<ExercisesPage exercises={exercises} setExercises={setExercises}/>;
    else if(page==="admins")content=<AdminsPage/>;
  } else {
    if(page==="my-routine")content=<MyRoutinePage user={liveUser} routines={routines} exercises={exercises}/>;
    else if(page==="my-profile")content=<MyProfilePage user={liveUser} setUsers={setUsers} users={users} measurements={measurements}/>;
  }

  return(<>
    <style>{STYLES}</style>
    <div className="app">
      <Sidebar user={liveUser} page={page} setPage={setPage} onLogout={logout}/>
      <main className="main">{content}</main>
    </div>
  </>);
}
