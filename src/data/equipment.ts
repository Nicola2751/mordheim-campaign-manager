export type EquipmentItem = {
  id: string
  name: string
  category: string
  cost: number
  rarity: string
  restriction?: string
}

export const equipment: EquipmentItem[] = [
  {id:'dagger',name:'Pugnale (secondo)',category:'Mischia',cost:2,rarity:'Comune'},
  {id:'club',name:'Randello, mazza o martello',category:'Mischia',cost:5,rarity:'Comune'},
  {id:'axe',name:'Ascia',category:'Mischia',cost:5,rarity:'Comune'},
  {id:'short-sword',name:'Spada corta',category:'Mischia',cost:6,rarity:'Comune'},
  {id:'sword',name:'Spada',category:'Mischia',cost:10,rarity:'Comune'},
  {id:'flail',name:'Flagello',category:'Mischia',cost:15,rarity:'Comune'},
  {id:'morning-star',name:'Mazzafrusto',category:'Mischia',cost:15,rarity:'Comune'},
  {id:'whip',name:'Frusta',category:'Mischia',cost:10,rarity:'Comune'},
  {id:'halberd',name:'Alabarda',category:'Mischia',cost:10,rarity:'Comune'},
  {id:'spear',name:'Lancia',category:'Mischia',cost:10,rarity:'Comune'},
  {id:'two-handed',name:'Arma a due mani',category:'Mischia',cost:20,rarity:'Comune'},
  {id:'scythe',name:'Falce',category:'Mischia',cost:10,rarity:'Comune'},
  {id:'throwing-knife',name:'Pugnali da lancio / Shuriken',category:'Tiro',cost:10,rarity:'Raro 5'},
  {id:'javelin',name:'Giavellotto',category:'Tiro',cost:5,rarity:'Comune'},
  {id:'sling',name:'Fionda',category:'Tiro',cost:5,rarity:'Comune'},
  {id:'short-bow',name:'Arco corto',category:'Tiro',cost:5,rarity:'Comune'},
  {id:'longbow',name:'Arco lungo',category:'Tiro',cost:15,rarity:'Comune'},
  {id:'crossbow',name:'Balestra',category:'Tiro',cost:25,rarity:'Comune'},
  {id:'pistol',name:'Pistola',category:'Armi da fuoco',cost:15,rarity:'Raro 8'},
  {id:'duelling-pistol',name:'Pistola da duello',category:'Armi da fuoco',cost:30,rarity:'Raro 10'},
  {id:'arquebus',name:'Archibugio',category:'Armi da fuoco',cost:30,rarity:'Raro 8'},
  {id:'blunderbuss',name:'Trombone',category:'Armi da fuoco',cost:30,rarity:'Raro 9'},
  {id:'buckler',name:'Brocchiere',category:'Armature',cost:5,rarity:'Comune'},
  {id:'shield',name:'Scudo',category:'Armature',cost:5,rarity:'Comune'},
  {id:'helmet',name:'Elmo',category:'Armature',cost:10,rarity:'Comune'},
  {id:'leather',name:'Lavori in pelle indurita',category:'Armature',cost:5,rarity:'Comune'},
  {id:'light-armour',name:'Armatura leggera',category:'Armature',cost:20,rarity:'Comune'},
  {id:'heavy-armour',name:'Armatura pesante',category:'Armature',cost:50,rarity:'Comune'},
  {id:'rope',name:'Corda e rampino',category:'Equipaggiamento',cost:5,rarity:'Comune'},
  {id:'lantern',name:'Lanterna',category:'Equipaggiamento',cost:10,rarity:'Comune'},
  {id:'torch',name:'Torcia',category:'Equipaggiamento',cost:2,rarity:'Comune'},
  {id:'net',name:'Rete',category:'Equipaggiamento',cost:5,rarity:'Comune'},
  {id:'rations',name:'Viveri',category:'Equipaggiamento',cost:8,rarity:'Comune'},
  {id:'map',name:'Mappa di Mordheim',category:'Equipaggiamento',cost:20,rarity:'Raro 9'},
  {id:'black-lotus',name:'Loto nero',category:'Droghe e veleni',cost:10,rarity:'Raro 9'},
  {id:'healing-herbs',name:'Erbe curative',category:'Droghe e veleni',cost:20,rarity:'Raro 8'},
  {id:'holy-water',name:'Acqua santa',category:'Droghe e veleni',cost:10,rarity:'Raro 6'},
  {id:'garlic',name:'Aglio',category:'Droghe e veleni',cost:1,rarity:'Comune'},
  {id:'healing-potion',name:'Pozione di guarigione',category:'Droghe e veleni',cost:30,rarity:'Raro 5'},
  {id:'smoke-bombs',name:'Bombe fumogene',category:'Droghe e veleni',cost:5,rarity:'Raro 5'},
  {id:'lucky-charm',name:'Portafortuna',category:'Amuleti',cost:10,rarity:'Raro 6'},
  {id:'rabbit-foot',name:'Zampa di coniglio',category:'Amuleti',cost:10,rarity:'Raro 5'},
  {id:'rosary',name:'Rosario',category:'Amuleti',cost:10,rarity:'Raro 6'},
  {id:'mule',name:'Mulo',category:'Cavalcature',cost:30,rarity:'Comune'}
]

export const explorationFinds = [
  {min:1,max:5,stones:1},{min:6,max:11,stones:2},{min:12,max:17,stones:3},
  {min:18,max:24,stones:4},{min:25,max:30,stones:5},{min:31,max:35,stones:6},
  {min:36,max:999,stones:7}
]
