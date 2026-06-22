export const CHART_COLORS=["#1A5DC8","#E53935","#2E7D32","#F57C00","#7B1FA2","#00695C","#F9A825","#0288D1","#AD1457","#558B2F"];

export const PLAN_TYPES = ["Base","Elite","Activación","Transformación","Especial"];
export const PLAN_MODALITIES = ["Virtual","En Estudio","En Visita"];
export const PLAN_FORMATS = ["Individual","Pareja","Trío","Grupo"];
export const PAYMENT_PERIODS = [
  {label:"1 mes",months:1},{label:"3 meses (trimestre)",months:3},
  {label:"4 meses (cuatrimestre)",months:4},{label:"6 meses (semestre)",months:6},
  {label:"12 meses (anual)",months:12},
];
export const EQUIPMENT_TYPES = ["Ninguno","Mancuerna","Kettlebell","Disco","Liga/Banda","Barra","Otro"];
export const SURFACE_TYPES = ["Ninguno","Banco","Piso","Grada","Cajón","Pared","Polea"];
export const MUSCLE_GROUPS_FILTER = ["Todos","Glúteos","Piernas","Espalda","Pecho","Hombros","Bíceps","Tríceps","Abdomen","Core","Full Body","Brazos"];
export const MEASUREMENT_FIELDS = [
  {key:"weight",label:"Peso",unit:"kg"},{key:"fat",label:"Grasa corporal",unit:"%"},
  {key:"water",label:"Agua",unit:"%"},{key:"imc",label:"IMC",unit:""},
  {key:"visceralFat",label:"Grasa visceral",unit:""},{key:"protein",label:"Proteína",unit:"%"},
  {key:"muscleMass",label:"Masa muscular",unit:"kg"},{key:"boneMass",label:"Masa ósea",unit:"kg"},
  {key:"bmi",label:"BMI",unit:""},{key:"metabolicAge",label:"Edad metabólica",unit:"años"},
];

export const INITIAL_TRAINER = {id:"t1",username:"johel",password:"johel123",name:"Johel Herrera",role:"trainer"};

export const ALL_EXERCISES = []; // Ejercicios cargados desde Supabase
