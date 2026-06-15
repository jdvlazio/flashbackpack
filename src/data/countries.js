// Datos de países visitados. Extraído verbatim del baseline (Web/index.html).
export const PROFILE = {
  name: "Juan David Villa",
  totalPhotos: 807,
};

export const VISITED = [
  {id:"724",name:"España",         multi:true, flag:"🇪🇸",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"250",name:"Francia",                   flag:"🇫🇷",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"276",name:"Alemania",                  flag:"🇩🇪",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"756",name:"Suiza",                     flag:"🇨🇭",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"203",name:"Chequia",                   flag:"🇨🇿",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"208",name:"Dinamarca",                 flag:"🇩🇰",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"578",name:"Noruega",                   flag:"🇳🇴",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"752",name:"Suecia",                    flag:"🇸🇪",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"528",name:"Países Bajos",              flag:"🇳🇱",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"056",name:"Bélgica",       multi:true, flag:"🇧🇪",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"348",name:"Hungría",                   flag:"🇭🇺",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"040",name:"Austria",                   flag:"🇦🇹",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"703",name:"Eslovaquia",                flag:"🇸🇰",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"380",name:"Italia",                    flag:"🇮🇹",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"336",name:"Vaticano",                  flag:"🇻🇦",year:2014,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"246",name:"Finlandia",                 flag:"🇫🇮",year:2018,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"643",name:"Rusia",                     flag:"🇷🇺",year:2018,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"826",name:"Inglaterra",                flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",year:2024,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"620",name:"Portugal",                  flag:"🇵🇹",year:2024,continent:"Europa", showYear:true, pixiesetUrl:"#"},
  {id:"792",name:"Turquía",                   flag:"🇹🇷",year:2013,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"156",name:"China",                     flag:"🇨🇳",year:2015,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"344",name:"Hong Kong",                 flag:"🇭🇰",year:2016,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"704",name:"Vietnam",                   flag:"🇻🇳",year:2016,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"116",name:"Camboya",                   flag:"🇰🇭",year:2016,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"418",name:"Laos",                      flag:"🇱🇦",year:2016,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"764",name:"Tailandia",                 flag:"🇹🇭",year:2016,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"410",name:"Corea del Sur",             flag:"🇰🇷",year:2016,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"376",name:"Israel",        multi:true, flag:"🇮🇱",year:2018,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"275",name:"Palestina",                 flag:"🇵🇸",year:2018,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"356",name:"India",                     flag:"🇮🇳",year:2018,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"524",name:"Nepal",                     flag:"🇳🇵",year:2018,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"702",name:"Singapur",                  flag:"🇸🇬",year:2019,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"158",name:"Taiwán",                    flag:"🇹🇼",year:2019,continent:"Asia",   showYear:true, pixiesetUrl:"#"},
  {id:"170",name:"Colombia",      multi:true, flag:"🇨🇴",year:2024,continent:"América",showYear:false,pixiesetUrl:"#"},
  {id:"484",name:"México",                    flag:"🇲🇽",year:2016,continent:"América",showYear:true, pixiesetUrl:"#"},
  {id:"032",name:"Argentina",                 flag:"🇦🇷",year:2021,continent:"América",showYear:true, pixiesetUrl:"#"},
  {id:"840",name:"Estados Unidos",multi:true, flag:"🇺🇸",year:2024,continent:"América",showYear:true, pixiesetUrl:"#"},
  {id:"036",name:"Australia",                 flag:"🇦🇺",year:2019,continent:"Oceanía",showYear:true, pixiesetUrl:"#"},
];

// Orden EXACTO de continentes para el pasaporte (no derivar dinámicamente).
export const CONTINENT_ORDER = ["Europa","Asia","América","Oceanía"];

// Mapa ADM0_A3 -> código numérico (id de país). Verbatim del baseline.
export const A3_TO_NUM = {"ESP":"724","FRA":"250","DEU":"276","CHE":"756","CZE":"203","DNK":"208","NOR":"578","SWE":"752","NLD":"528","BEL":"056","HUN":"348","AUT":"040","SVK":"703","ITA":"380","VAT":"336","FIN":"246","RUS":"643","GBR":"826","PRT":"620","TUR":"792","CHN":"156","HKG":"344","VNM":"704","KHM":"116","LAO":"418","THA":"764","KOR":"410","ISR":"376","PSE":"275","IND":"356","NPL":"524","SGP":"702","TWN":"158","COL":"170","MEX":"484","ARG":"032","USA":"840","AUS":"036"};
