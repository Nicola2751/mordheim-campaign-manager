import { useEffect, useMemo, useState } from 'react'
import { equipment } from './data/equipment'

type Warrior = { id: string; name: string; type: string; xp: number; wounds: number; status: string; equipment?: string[]; injuryRoll?: number; injuryResult?: string; earnsXp?: boolean; groupName?: string }
type Warband = { id: string; name: string; faction: string; gold: number; rating: number; warriors: Warrior[]; stash?: string[]; wyrdstone?: number }
type Exploration = { id: string; date: string; bandId?: string; bandName: string; dice: number[]; total: number; stones: number; victoryBonus: boolean }
type MarketSearch = { id:string; date:string; bandId:string; gameId?:string; heroId:string; heroName:string; itemName:string; roll:number; rarity:number; success:boolean }
type Campaign = { bands: Warband[]; games: { id: string; date: string; opponent: string; result: string; notes: string; bandId?: string; xpBonus?: number; xpAwarded?: boolean; postGameSteps?: number[] }[]; chronicle: string[]; explorations: Exploration[]; marketSearches: MarketSearch[] }
const postGamePhases = ['Ferite gravi','Esperienza','Esplorazione','Vendita della Malapietra','Veterani disponibili','Ricerca e acquisto oggetti rari','Avventurieri speciali','Reclutamento e oggetti comuni','Trasferimento equipaggiamento','Valore della banda']
const starter: Campaign = { bands: [], games: [], chronicle: [], explorations: [], marketSearches: [] }
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const isCampaignBackup = (value: unknown): value is Campaign => {
  if (!isRecord(value) || !Array.isArray(value.bands) || !Array.isArray(value.games) || !Array.isArray(value.chronicle)) return false
  const validWarriors = (warriors: unknown) => Array.isArray(warriors) && warriors.every(w => isRecord(w) && typeof w.id === 'string' && w.id.length > 0 && typeof w.name === 'string' && typeof w.type === 'string' && typeof w.status === 'string' && typeof w.xp === 'number' && Number.isInteger(w.xp) && w.xp >= 0 && typeof w.wounds === 'number' && Number.isInteger(w.wounds) && w.wounds >= 0 && (w.equipment === undefined || (Array.isArray(w.equipment) && w.equipment.every(x => typeof x === 'string'))) && (w.earnsXp === undefined || typeof w.earnsXp === 'boolean') && (w.groupName === undefined || typeof w.groupName === 'string'))
  if (!value.bands.every(b => isRecord(b) && typeof b.id === 'string' && b.id.length > 0 && typeof b.name === 'string' && typeof b.faction === 'string' && typeof b.gold === 'number' && Number.isFinite(b.gold) && b.gold >= 0 && typeof b.rating === 'number' && Number.isInteger(b.rating) && b.rating >= 0 && (b.wyrdstone === undefined || (typeof b.wyrdstone === 'number' && Number.isInteger(b.wyrdstone) && b.wyrdstone >= 0)) && validWarriors(b.warriors) && (b.stash === undefined || (Array.isArray(b.stash) && b.stash.every(x => typeof x === 'string'))))) return false
  if (!value.games.every(g => isRecord(g) && typeof g.id === 'string' && g.id.length > 0 && typeof g.date === 'string' && typeof g.opponent === 'string' && typeof g.result === 'string' && typeof g.notes === 'string' && (g.bandId === undefined || typeof g.bandId === 'string') && (g.xpBonus === undefined || (typeof g.xpBonus === 'number' && Number.isInteger(g.xpBonus) && g.xpBonus >= 0)) && (g.xpAwarded === undefined || typeof g.xpAwarded === 'boolean') && (g.postGameSteps === undefined || (Array.isArray(g.postGameSteps) && g.postGameSteps.every(x => Number.isInteger(x) && x >= 0 && x < postGamePhases.length) && new Set(g.postGameSteps).size === g.postGameSteps.length)))) return false
  if (!value.chronicle.every(x => typeof x === 'string')) return false
  const validExplorations = (items: unknown[]) => items.every(e => { if (!isRecord(e)) return false; if (!(typeof e.id === 'string' && e.id.length > 0 && typeof e.date === 'string' && typeof e.bandName === 'string' && (e.bandId === undefined || typeof e.bandId === 'string') && Array.isArray(e.dice) && e.dice.length <= 6 && e.dice.every(x => Number.isInteger(x) && x >= 1 && x <= 6) && typeof e.total === 'number' && Number.isInteger(e.total) && typeof e.stones === 'number' && Number.isInteger(e.stones) && typeof e.victoryBonus === 'boolean')) return false; const total = e.dice.reduce((sum: number, die: number) => sum + die, 0); const stones = total <= 5 ? 1 : total <= 11 ? 2 : total <= 17 ? 3 : total <= 24 ? 4 : total <= 30 ? 5 : total <= 35 ? 6 : 7; return e.total === total && e.stones === stones })
  if (value.explorations !== undefined && (!Array.isArray(value.explorations) || !validExplorations(value.explorations))) return false
  if (value.marketSearches !== undefined && (!Array.isArray(value.marketSearches) || !value.marketSearches.every(x => isRecord(x) && typeof x.id === 'string' && x.id.length > 0 && typeof x.date === 'string' && typeof x.bandId === 'string' && typeof x.heroId === 'string' && typeof x.heroName === 'string' && typeof x.itemName === 'string' && typeof x.roll === 'number' && Number.isInteger(x.roll) && x.roll >= 2 && x.roll <= 12 && typeof x.rarity === 'number' && Number.isInteger(x.rarity) && x.rarity >= 2 && x.rarity <= 12 && typeof x.success === 'boolean' && x.success === (x.roll >= x.rarity) && (x.gameId === undefined || typeof x.gameId === 'string')))) return false
  const uniqueIds = (items: unknown[], field = 'id') => { const ids = items.map(item => isRecord(item) ? item[field] : undefined); return ids.every(id => typeof id === 'string' && id.length > 0) && new Set(ids).size === ids.length }
  if (!uniqueIds(value.bands) || !uniqueIds(value.games)) return false
  if (value.bands.some(b => isRecord(b) && !uniqueIds(b.warriors as unknown[]))) return false
  if (value.explorations !== undefined && !uniqueIds(value.explorations)) return false
  if (value.marketSearches !== undefined && !uniqueIds(value.marketSearches)) return false
  const bandIds = new Set(value.bands.map((b: Warband) => b.id))
  const gameIds = new Set(value.games.map((g: Campaign['games'][number]) => g.id))
  if (value.games.some((g: Campaign['games'][number]) => g.bandId !== undefined && !bandIds.has(g.bandId))) return false
  if ((value.explorations || []).some((e: Exploration) => e.bandId !== undefined && !bandIds.has(e.bandId))) return false
  if ((value.marketSearches || []).some((x: MarketSearch) => !bandIds.has(x.bandId) || (x.gameId !== undefined && !gameIds.has(x.gameId)))) return false
  const gamesById = new Map((value.games as Campaign['games']).map(g => [g.id, g]))
  if ((value.marketSearches || []).some((x: MarketSearch) => x.gameId !== undefined && gamesById.get(x.gameId)?.bandId !== x.bandId)) return false
  const searchAttempts = (value.marketSearches || []).filter((x: MarketSearch) => x.gameId !== undefined).map((x: MarketSearch) => x.gameId + ':' + x.heroId)
  if (new Set(searchAttempts).size !== searchAttempts.length) return false
  return true
}
const uid = () => Math.random().toString(36).slice(2, 10)
const read = (): Campaign => {
  let raw: string | null = null
  try {
    raw = localStorage.getItem('mordheim-ledger')
    if (!raw) return starter
    const saved: unknown = JSON.parse(raw)
    if (!isCampaignBackup(saved)) {
      // Preserve invalid data before the initial React effect writes the fallback state.
      localStorage.setItem('mordheim-ledger-recovery', raw)
      return starter
    }
    return { ...starter, ...saved, explorations: (saved.explorations || []).map((e: Exploration) => ({...e, bandId: e.bandId || saved.bands.find((b: Warband) => b.name === e.bandName)?.id})), marketSearches: saved.marketSearches || [] }
  } catch {
    // Malformed JSON is recoverable too: keep the original string before returning an empty campaign.
    if (raw) { try { localStorage.setItem('mordheim-ledger-recovery', raw) } catch { /* storage unavailable */ } }
    return starter
  }
}

export default function App() {
  const [data, setData] = useState<Campaign>(read)
  const [recoveryData, setRecoveryData] = useState<string>(() => { try { return localStorage.getItem('mordheim-ledger-recovery') || '' } catch { return '' } })
  const [tab, setTab] = useState('bande')
  const [bandName, setBandName] = useState('')
  const [faction, setFaction] = useState('Banda mercenaria')
  const [selected, setSelected] = useState('')
  const [warriorName, setWarriorName] = useState('')
  const [warriorType, setWarriorType] = useState('Capitano')
  const [warriorGroup, setWarriorGroup] = useState('')
  const [goldDelta, setGoldDelta] = useState('0')
  const [opponent, setOpponent] = useState('')
  const [opponentRating, setOpponentRating] = useState('0')
  const [postGameMessage, setPostGameMessage] = useState('')
  const [result, setResult] = useState('Vittoria')
  const [notes, setNotes] = useState('')
  const [chronicle, setChronicle] = useState('')
  const [dice, setDice] = useState<number[]>([])
  const [equipmentCategory, setEquipmentCategory] = useState('Tutte')
  const [marketMessage, setMarketMessage] = useState('')
  const [explorationVictory, setExplorationVictory] = useState(false)
  const [explorationMessage, setExplorationMessage] = useState('')
  const [equipmentSelection, setEquipmentSelection] = useState<Record<string,string>>({})
  const [marketHero, setMarketHero] = useState('')
  const [marketSearchMessage, setMarketSearchMessage] = useState('')
  const [injuryDrafts, setInjuryDrafts] = useState<Record<string,string>>({})
  const [sellStones, setSellStones] = useState('1')
  const [stonePrice, setStonePrice] = useState('5')
  useEffect(() => localStorage.setItem('mordheim-ledger', JSON.stringify(data)), [data])
  const active = data.bands.find(b => b.id === selected) || data.bands[0]
  const totalWarriors = useMemo(() => data.bands.reduce((n,b) => n + b.warriors.length, 0), [data])
  const patchBand = (id: string, patch: Partial<Warband>) => setData(d => ({...d, bands:d.bands.map(b => b.id === id ? {...b,...patch} : b)}))
  const addBand = () => { if (!bandName.trim()) return; const b: Warband = {id:uid(),name:bandName.trim(),faction,gold:500,rating:0,warriors:[],stash:[]}; setData(d=>({...d,bands:[...d.bands,b]})); setSelected(b.id); setBandName('') }
  const deleteBand = (band: Warband) => {
    if (!window.confirm('Vuoi davvero cancellare la banda “'+band.name+'”? Verranno eliminati anche il suo registro partite, le esplorazioni e i tentativi di mercato. Questa operazione non può essere annullata.')) return
    setData(d=>({...d,bands:d.bands.filter(b=>b.id!==band.id),games:d.games.filter(g=>g.bandId!==band.id),explorations:d.explorations.filter(e=>e.bandId ? e.bandId!==band.id : e.bandName!==band.name),marketSearches:d.marketSearches.filter(x=>x.bandId!==band.id)}))
    setSelected(current=>current===band.id?'':current)
    setPostGameMessage('Banda “'+band.name+'” cancellata.')
  }
  const addWarrior = () => {
    if (!active || !warriorName.trim()) return
    const heroes = active.warriors.filter(w=>['Capitano','Eroe'].includes(w.type)).length
    if (['Capitano','Eroe'].includes(warriorType) && heroes>=6) { setPostGameMessage('Limite generale raggiunto: massimo sei Eroi incluso il Capitano. Verifica eventuali eccezioni della tua banda nel manuale.'); return }
    if (warriorType==='Capitano' && active.warriors.some(w=>w.type==='Capitano')) { setPostGameMessage('La banda ha già un Capitano registrato.'); return }
    patchBand(active.id,{warriors:[...active.warriors,{id:uid(),name:warriorName.trim(),type:warriorType,xp:0,wounds:1,status:'In salute',equipment:[],earnsXp:true,...(warriorType==='Truppa'&&warriorGroup.trim()?{groupName:warriorGroup.trim()}: {})}]})
    setWarriorName('')
    setWarriorGroup('')
    setPostGameMessage('')
  }
  const buyEquipment = (item: typeof equipment[number]) => {
    if (!active) return
    if (active.gold < item.cost) { setMarketMessage('Tesoro insufficiente per acquistare questo oggetto.'); return }
    const rarityMatch = item.rarity.match(/Raro\s*(\d+)/i)
    if (rarityMatch) {
      const heroes = active.warriors.filter(w=>['Capitano','Eroe'].includes(w.type)&&w.status!=='Fuori combattimento')
      const hero = heroes.find(w=>w.id===marketHero) || heroes[0]
      if (!hero) { setMarketMessage('Serve un Eroe disponibile per cercare oggetti rari.'); return }
      const latestGame = data.games.find(g=>g.bandId===active.id)
      if (!latestGame) { setMarketMessage('Registra prima la partita: la ricerca degli oggetti rari si effettua nella fase post-partita.'); return }
      const today = new Date().toLocaleDateString('it-IT')
      if ((data.marketSearches||[]).some(x=>x.bandId===active.id&&x.gameId===latestGame.id&&x.heroId===hero.id)) { setMarketMessage(hero.name+' ha già effettuato il suo tentativo di ricerca in questa fase post-partita.'); return }
      const roll = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1
      const rarity = Number(rarityMatch[1])
      const success = roll>=rarity
      const record:MarketSearch={id:uid(),date:today,bandId:active.id,gameId:latestGame.id,heroId:hero.id,heroName:hero.name,itemName:item.name,roll,rarity,success}
      setData(d=>({...d,marketSearches:[record,...(d.marketSearches||[])]}))
      if (!success) { setMarketMessage(hero.name+': 2D6 = '+roll+'. Ricerca fallita (necessario '+rarity+').'); return }
      patchBand(active.id,{gold:active.gold-item.cost,stash:[...(active.stash||[]),item.name]})
      setMarketMessage(hero.name+': 2D6 = '+roll+'. '+item.name+' trovato e acquistato per '+item.cost+' CO.')
      return
    }
    patchBand(active.id,{gold:active.gold-item.cost,stash:[...(active.stash || []),item.name]})
    setMarketMessage(item.name+' aggiunto alla riserva della banda.')
  }
  const equipItem = (warriorId:string, stashIndex:number) => {
    if (!active) return
    const warrior = active.warriors.find(w => w.id === warriorId)
    const itemName = active.stash?.[stashIndex]
    if (!warrior || !itemName) return
    const item = equipment.find(x => x.name === itemName)
    const current = warrior.equipment || []
    const category = item?.category
    const meleeCount = current.filter(name => equipment.find(x => x.name === name)?.category === 'Mischia').length
    const rangedItems = current.filter(name => ['Tiro','Armi da fuoco'].includes(equipment.find(x => x.name === name)?.category || ''))
    const pistolCount = rangedItems.filter(name => ['Pistola','Pistola da duello'].includes(name)).length
    const rangedCount = rangedItems.filter(name => equipment.find(x => x.name === name)?.category === 'Tiro' || !['Pistola','Pistola da duello'].includes(name)).length + Math.ceil(pistolCount / 2)
    if (category === 'Mischia' && meleeCount >= 2) { setMarketMessage('Limite raggiunto: massimo due armi da mischia oltre al pugnale gratuito.'); return }
    if (['Tiro','Armi da fuoco'].includes(category || '') && rangedCount >= 2) { setMarketMessage('Limite raggiunto: massimo due armi da tiro.'); return }
    patchBand(active.id,{stash:active.stash?.filter((_,i)=>i!==stashIndex),warriors:active.warriors.map(w=>w.id===warriorId?{...w,equipment:[...current,itemName]}:w)})
    setEquipmentSelection({})
    setMarketMessage(itemName+' assegnato a '+warrior.name+'.')
  }
  const unequipItem = (warriorId:string, itemIndex:number) => {
    if (!active) return
    const warrior = active.warriors.find(w=>w.id===warriorId)
    if (!warrior) return
    const current=warrior.equipment||[]
    const itemName=current[itemIndex]
    if (!itemName) return
    patchBand(active.id,{stash:[...(active.stash||[]),itemName],warriors:active.warriors.map(w=>w.id===warriorId?{...w,equipment:current.filter((_,i)=>i!==itemIndex)}:w)})
    setEquipmentSelection({})
    setMarketMessage(itemName+' restituito alla riserva.')
  }
  const sellUsedItem = (itemName:string, source:'stash'|'warrior', warriorId?:string, itemIndex?:number) => {
    if (!active) return
    const item = equipment.find(x=>x.name===itemName)
    if (!item) { setMarketMessage('Prezzo di vendita non disponibile per questo oggetto.'); return }
    const value = item.cost / 2
    if (source==='stash') {
      if (itemIndex===undefined || active.stash?.[itemIndex]!==itemName) return
      patchBand(active.id,{stash:active.stash.filter((_,i)=>i!==itemIndex),gold:active.gold+value})
      setEquipmentSelection({})
    } else {
      const warrior = active.warriors.find(w=>w.id===warriorId)
      if (!warrior || itemIndex===undefined || warrior.equipment?.[itemIndex]!==itemName) return
      patchBand(active.id,{warriors:active.warriors.map(w=>w.id===warriorId?{...w,equipment:(w.equipment||[]).filter((_,i)=>i!==itemIndex)}:w),gold:active.gold+value})
    }
    setMarketMessage(itemName+' venduto per '+value+' CO (metà del prezzo di acquisto).')
  }
  const sellWyrdstone = () => {
    if (!active) return
    const quantity = Number(sellStones)
    const price = Number(stonePrice)
    if (!Number.isInteger(quantity)||quantity<1||quantity>(active.wyrdstone||0)||!Number.isInteger(price)||price<0) { setExplorationMessage('Inserisci una quantità intera disponibile e un prezzo intero non negativo.'); return }
    patchBand(active.id,{wyrdstone:(active.wyrdstone||0)-quantity,gold:active.gold+quantity*price})
    setExplorationMessage('Vendute '+quantity+' pietre per '+(quantity*price)+' CO.')
  }
  const adjustGold = () => {
    if (!active) return
    const delta = Number(goldDelta)
    if (!Number.isFinite(delta)||!Number.isInteger(delta)) { setPostGameMessage('Inserisci una variazione di tesoreria espressa in CO intere.'); return }
    patchBand(active.id,{gold:Math.max(0,active.gold+delta)})
    setPostGameMessage('Tesoreria aggiornata: '+Math.max(0,active.gold+delta)+' CO.')
  }
  const rollHeroInjury = (warriorId:string) => {
    if (!active) return
    const roll = (Math.floor(Math.random()*6)+1)*10 + Math.floor(Math.random()*6)+1
    patchBand(active.id,{warriors:active.warriors.map(w=>w.id===warriorId?{...w,injuryRoll:roll}:w)})
  }
  const saveHeroInjury = (warriorId:string) => {
    if (!active) return
    const result = (injuryDrafts[warriorId]||'').trim()
    if (!result) return
    patchBand(active.id,{warriors:active.warriors.map(w=>w.id===warriorId?{...w,injuryResult:result,status:'In convalescenza'}:w)})
    setInjuryDrafts(v=>({...v,[warriorId]:''}))
  }
  const resolveTroopInjury = (warriorId:string) => {
    if (!active) return
    const warrior = active.warriors.find(w=>w.id===warriorId)
    if (!warrior || warrior.status!=='Fuori combattimento' || warrior.type==='Capitano' || warrior.type==='Eroe') return
    const die = Math.floor(Math.random()*6)+1
    if (die<=2) {
      patchBand(active.id,{warriors:active.warriors.filter(w=>w.id!==warriorId)})
      setData(d=>({...d,chronicle:[''+warrior.name+' ('+active.name+'): eliminato dopo il tiro ferite gravi della Truppa (D6 '+die+').',...d.chronicle]}))
    } else {
      patchBand(active.id,{warriors:active.warriors.map(w=>w.id===warriorId?{...w,status:'In salute'}:w)})
      setData(d=>({...d,chronicle:[''+warrior.name+' ('+active.name+'): sopravvive alle ferite gravi della Truppa (D6 '+die+').',...d.chronicle]}))
    }
  }
  const roll = (n:number) => setDice(Array.from({length:n},()=>Math.floor(Math.random()*6)+1))
  const eligibleHeroes = active ? active.warriors.filter(w => ['Capitano','Eroe'].includes(w.type) && w.status !== 'Fuori combattimento').length : 0
  const explorationTotal = dice.reduce((sum,value)=>sum+value,0)
  const explorationStones = explorationTotal<=0?0:explorationTotal<=5?1:explorationTotal<=11?2:explorationTotal<=17?3:explorationTotal<=24?4:explorationTotal<=30?5:explorationTotal<=35?6:7
  const resolveExploration = () => { if (!active) return; const count = Math.min(6,eligibleHeroes+(explorationVictory?1:0)); if (count===0) { setExplorationMessage('Servono almeno un Eroe disponibile o il dado bonus vittoria.'); return; } const results=Array.from({length:count},()=>Math.floor(Math.random()*6)+1); const total=results.reduce((a,b)=>a+b,0); const stones=total<=5?1:total<=11?2:total<=17?3:total<=24?4:total<=30?5:total<=35?6:7; const entry: Exploration={id:uid(),date:new Date().toLocaleDateString('it-IT'),bandId:active.id,bandName:active.name,dice:results,total,stones,victoryBonus:explorationVictory}; setDice(results); setData(d=>({...d,explorations:[entry,...(d.explorations||[])],bands:d.bands.map(b=>b.id===active.id?{...b,wyrdstone:(b.wyrdstone||0)+stones}:b)})); setExplorationMessage('Esplorazione registrata: '+stones+' pietre di Malapietra.'); }
  const exportData = () => { const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='mordheim-campagna.json'; a.click(); URL.revokeObjectURL(a.href) }
  const recoverLocalData = () => {
    if (!recoveryData) return
    try {
      const parsed: unknown = JSON.parse(recoveryData)
      if (isCampaignBackup(parsed)) {
        if (!window.confirm('Il salvataggio di recupero è valido. Vuoi ripristinarlo? I dati correnti verranno sostituiti.')) return
        setData({ ...starter, ...parsed, explorations: (parsed.explorations || []).map((e: Exploration) => ({ ...e, bandId: e.bandId || parsed.bands.find((b: Warband) => b.name === e.bandName)?.id })), marketSearches: parsed.marketSearches || [] })
        setSelected('')
        localStorage.removeItem('mordheim-ledger-recovery')
        setRecoveryData('')
        window.alert('Salvataggio locale ripristinato.')
        return
      }
    } catch { /* Keep malformed data available for export below. */ }
    const blob = new Blob([recoveryData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mordheim-salvataggio-da-recuperare.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  const underdogBonus = (difference:number) => difference<=50?0:difference<=75?1:difference<=100?2:difference<=150?3:difference<=300?4:5
  const applyPostGameExperience = () => {
    if (!active) { setPostGameMessage('Seleziona prima la banda.'); return }
    const game = data.games.find(g=>g.bandId===active.id)
    if (!game) { setPostGameMessage('Registra prima la partita di questa banda.'); return }
    if (game.xpAwarded) { setPostGameMessage('I PE per l’ultima partita registrata sono già stati assegnati.'); return }
    const bonus = game.xpBonus ?? 0
    const eligible = active.warriors.filter(w=>w.status!=='Fuori combattimento' && w.earnsXp!==false)
    if (!eligible.length) { setPostGameMessage('Nessun guerriero sopravvissuto disponibile per ricevere PE.'); return }
    setData(d=>({...d,bands:d.bands.map(b=>b.id===active.id?{...b,warriors:b.warriors.map(w=>w.status!=='Fuori combattimento' && w.earnsXp!==false?{...w,xp:w.xp+1+bonus}:w)}:b),games:d.games.map(g=>g.id===game.id?{...g,xpAwarded:true}:g)}))
    setPostGameMessage('Assegnati '+(1+bonus)+' PE a '+eligible.length+' guerrieri sopravvissuti e abilitati (1 PE sopravvivenza + '+bonus+' bonus svantaggio).')
  }
  const markNextPostGamePhase = (gameId:string) => {
    setData(d=>({...d,games:d.games.map(g=>{ if(g.id!==gameId)return g; const done=g.postGameSteps||[]; const next=postGamePhases.findIndex((_,i)=>!done.includes(i)); return next<0?g:{...g,postGameSteps:[...done,next]} })}))
  }
  const addGame = () => { if(!active) { setPostGameMessage('Seleziona prima la banda a cui associare la partita.'); return } if(!opponent.trim()) return; const rivalRating=Number(opponentRating); if(!Number.isInteger(rivalRating)||rivalRating<0) { setPostGameMessage('Inserisci un valore banda avversaria valido e non negativo.'); return } setData(d=>({...d,games:[{id:uid(),date:new Date().toLocaleDateString('it-IT'),opponent:opponent.trim(),result,notes,bandId:active.id,xpAwarded:false,xpBonus:underdogBonus(Math.max(0,rivalRating-active.rating))},...d.games]})); setOpponent('');setNotes('');setPostGameMessage('') }
  const addChronicle = () => { if(chronicle.trim()) {setData(d=>({...d,chronicle:[chronicle.trim(),...d.chronicle]}));setChronicle('')} }
  return <div className="shell">
    <aside className="sidebar"><div className="sigil">M</div><div className="brand"><span>IL REGISTRO DI</span><strong>MORDHEIM</strong><small>CAMPAIGN LEDGER</small></div><nav>{[['bande','♜','Le bande'],['armeria','⚒','Armeria'],['partite','⚔','Partite'],['esplorazione','☠','Esplorazione'],['cronaca','✒','Cronaca']].map(([id,ic,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><span>{ic}</span>{label}</button>)}</nav><div className="side-bottom"><span className="dot"/> CAMPAGNA LOCALE<br/><small>I dati restano su questo dispositivo</small></div></aside>
    <main><header><div><span className="eyebrow">CITTÀ DEI DANNATI · REGISTRO DI CAMPAGNA</span><h1>{tab==='bande'?'Le bande':tab==='armeria'?'Armeria e mercato':tab==='partite'?'Registro delle partite':tab==='esplorazione'?'Esplorazione':'Cronaca della campagna'}</h1></div><div className="backup-tools"><button className="outline" onClick={exportData}>↓ Esporta JSON</button><label className="outline import-label">↑ Importa JSON<input type="file" accept="application/json,.json" onChange={e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(String(reader.result));if(!isCampaignBackup(parsed))throw new Error('Formato o dati non validi');setData({...starter,...parsed,explorations:Array.isArray(parsed.explorations)?parsed.explorations.map((e: Exploration)=>({...e,bandId:e.bandId||parsed.bands.find((b: Warband)=>b.name===e.bandName)?.id})):[],marketSearches:Array.isArray(parsed.marketSearches)?parsed.marketSearches:[]});setSelected('');}catch{window.alert('File non valido: nessuna modifica importata.')}e.target.value='';};reader.readAsText(file);}}/></label></div></header>
    {recoveryData && <section className="panel recovery-notice"><div className="panel-head"><div><span className="eyebrow">SALVATAGGIO PRECEDENTE CONSERVATO</span><h2>È disponibile un recupero locale</h2></div></div><p className="muted">L'app ha trovato un salvataggio precedente non leggibile e lo ha conservato senza sovrascriverne la copia di recupero. Se il file è valido puoi ripristinarlo; altrimenti puoi scaricarlo per analizzarlo senza perderlo.</p><button className="outline" onClick={recoverLocalData}>Ripristina o scarica recupero</button></section>}
    <section className="stats"><div><span>BANDE IN CAMPAGNA</span><b>{data.bands.length.toString().padStart(2,'0')}</b></div><div><span>GUERRIERI REGISTRATI</span><b>{totalWarriors.toString().padStart(2,'0')}</b></div><div><span>SCONTRI DISPUTATI</span><b>{data.games.length.toString().padStart(2,'0')}</b></div><div><span>VITTORIE</span><b>{data.games.filter(g=>g.result==='Vittoria').length.toString().padStart(2,'0')}</b></div></section>
    {tab==='bande' && <div className="content-grid"><section className="panel"><div className="panel-head"><div><span className="eyebrow">FAZIONI IN GIOCO</span><h2>Le tue bande</h2></div><span className="count">{data.bands.length} TOTALI</span></div>{data.bands.length===0?<div className="empty"><div>♜</div><h3>Nessuna banda registrata</h3><p>La città attende i suoi primi comandanti.</p></div>:<div className="band-list">{data.bands.map(b=><button key={b.id} onClick={()=>setSelected(b.id)} className={'band-row '+(active?.id===b.id?'chosen':'')}><span className="crest">♜</span><span><b>{b.name}</b><small>{b.faction} · {b.warriors.length} guerrieri</small></span><strong>{b.gold} <small>CO</small></strong></button>)}</div>}<div className="create-band"><h3>Fondare una banda</h3><input value={bandName} onChange={e=>setBandName(e.target.value)} placeholder="Nome della banda"/><select value={faction} onChange={e=>setFaction(e.target.value)}>{['Banda mercenaria','Sorelle di Sigmar','Culto dei Posseduti','Skaven','Orchi e Goblin','Nonmorti','Cacciatori di streghe','Kisleviti'].map(x=><option>{x}</option>)}</select><button className="primary" onClick={addBand}>+ Crea banda</button></div></section>
    <section className="panel"><div className="panel-head"><div><span className="eyebrow">SCHEDA DELLA BANDA</span><h2>{active?.name || 'Seleziona una banda'}</h2></div></div>{active?<><div className="band-meta"><span>{active.faction}</span><label>VALORE BANDA <input className="rating-input" type="number" min="0" value={active.rating} onChange={e=>patchBand(active.id,{rating:Math.max(0,Math.floor(Number(e.target.value)||0))})}/></label><label>TESORERIA <b>{active.gold} CO</b></label><button className="danger" onClick={()=>deleteBand(active)}>Cancella banda</button></div><div className="gold-tools"><input type="number" value={goldDelta} onChange={e=>setGoldDelta(e.target.value)}/><button className="outline" onClick={adjustGold}>Aggiorna oro</button></div><div className="panel-head roster-head"><h3>Composizione</h3><span className="count">{active.warriors.length} MEMBRI</span></div>{active.warriors.length<3&&<p className="roster-warning">Banda incompleta: il regolamento generale richiede almeno tre guerrieri, incluso il Capitano, prima di iniziare.</p>}{postGameMessage&&<p className="muted">{postGameMessage}</p>}<div className="roster">{active.warriors.map(w=><div className="warrior" key={w.id}><span className="mini-crest">✦</span><div className="warrior-info"><b>{w.name}</b><small>{w.type} · {w.status}</small>{w.type==='Truppa'&&<div className="troop-group"><label>GRUPPO <input value={w.groupName||''} onChange={e=>patchBand(active.id,{warriors:active.warriors.map(x=>x.id===w.id?{...x,groupName:e.target.value}:x)})} placeholder="Nome gruppo (facoltativo)"/></label>{w.groupName?.trim()&&<small>{active.warriors.filter(x=>x.type==='Truppa'&&x.groupName?.trim()===(w.groupName||'').trim()).length} modelli nel gruppo</small>}</div>}<div className="assigned-equipment"><small>Equipaggiamento: {(w.equipment||[]).length?(w.equipment||[]).join(', '):'nessuno'}</small>{(w.equipment||[]).map((item,i)=><span key={i}><button className="remove" title={'Restituisci '+item} onClick={()=>unequipItem(w.id,i)}>−</button><button className="remove" title={'Vendi '+item+' a metà prezzo'} onClick={()=>sellUsedItem(item,'warrior',w.id,i)}>€</button></span>)}{(active.stash||[]).length>0&&<><select aria-label={'Oggetto per '+w.name} value={equipmentSelection[w.id]||''} onChange={e=>setEquipmentSelection(v=>({...v,[w.id]:e.target.value}))}><option value="">Dalla riserva…</option>{(active.stash||[]).map((item,i)=><option value={String(i)} key={i}>{item}</option>)}</select><button className="outline" disabled={!equipmentSelection[w.id]} onClick={()=>equipItem(w.id,Number(equipmentSelection[w.id]))}>Assegna</button></>}</div></div><label className="xp-control">PE <input type="number" min="0" value={w.xp} onChange={e=>patchBand(active.id,{warriors:active.warriors.map(x=>x.id===w.id?{...x,xp:Math.max(0,Math.floor(Number(e.target.value)||0))}:x)})}/></label><label className="xp-eligibility"><input type="checkbox" checked={w.earnsXp!==false} onChange={e=>patchBand(active.id,{warriors:active.warriors.map(x=>x.id===w.id?{...x,earnsXp:e.target.checked}:x)})}/> PE</label><label className="wounds-control">FERITE <input type="number" min="0" value={w.wounds} onChange={e=>patchBand(active.id,{warriors:active.warriors.map(x=>x.id===w.id?{...x,wounds:Math.max(0,Math.floor(Number(e.target.value)||0))}:x)})}/></label><select aria-label={'Stato di '+w.name} value={w.status} onChange={e=>patchBand(active.id,{warriors:active.warriors.map(x=>x.id===w.id?{...x,status:e.target.value}:x)})}><option>In salute</option><option>Fuori combattimento</option><option>In convalescenza</option></select>{w.status==='Fuori combattimento'&&!['Capitano','Eroe'].includes(w.type)&&<button className="outline" onClick={()=>resolveTroopInjury(w.id)}>Tiro ferite D6</button>}{w.status==='Fuori combattimento'&&['Capitano','Eroe'].includes(w.type)&&<div className="hero-injury"><button className="outline" onClick={()=>rollHeroInjury(w.id)}>Tira D66</button>{w.injuryRoll&&<b>D66: {w.injuryRoll}</b>}<input value={injuryDrafts[w.id]??w.injuryResult??''} onChange={e=>setInjuryDrafts(v=>({...v,[w.id]:e.target.value}))} placeholder="Esito dalla tabella D66"/><button className="outline" onClick={()=>saveHeroInjury(w.id)}>Registra esito</button></div>}<button className="remove" title="Rimuovi" onClick={()=>patchBand(active.id,{stash:[...(active.stash||[]),...(w.equipment||[])],warriors:active.warriors.filter(x=>x.id!==w.id)})}>×</button></div>)}{active.warriors.length===0&&<p className="muted">Nessun guerriero. Aggiungi il primo membro della banda.</p>}</div><div className="add-warrior"><input value={warriorName} onChange={e=>setWarriorName(e.target.value)} placeholder="Nome guerriero"/><select value={warriorType} onChange={e=>setWarriorType(e.target.value)}>{['Capitano','Eroe','Truppa','Tiratore','Specialista'].map(x=><option key={x}>{x}</option>)}</select>{warriorType==='Truppa'&&<><input list="troop-groups" value={warriorGroup} onChange={e=>setWarriorGroup(e.target.value)} placeholder="Gruppo Truppa (facoltativo)"/><datalist id="troop-groups">{Array.from(new Set(active.warriors.filter(w=>w.type==='Truppa'&&w.groupName?.trim()).map(w=>w.groupName!.trim()))).map(group=><option key={group} value={group}/>)}</datalist></>}<button className="primary" onClick={addWarrior}>Aggiungi</button></div>{Array.from(new Set(active.warriors.filter(w=>w.type==='Truppa'&&w.groupName?.trim()).map(w=>w.groupName!.trim()))).map(group=>{const count=active.warriors.filter(w=>w.type==='Truppa'&&w.groupName?.trim()===group).length;return count>5?<p className="roster-warning" key={group}>Il gruppo “{group}” comprende {count} modelli. Il riferimento generale è 1–5: verifica eventuali eccezioni della banda nel manuale.</p>:null})}</>:<div className="empty compact"><div>☩</div><p>Crea o seleziona una banda per gestirne la scheda.</p></div>}</section></div>}
    {tab==='armeria'&&<section className="panel wide"><div className="panel-head"><div><span className="eyebrow">LISTINO DEL TOMO 1 · PAGINE 591–595</span><h2>Armeria e mercato</h2></div><span className="count">PREZZI IN CORONE D'ORO</span></div>{!active?<p className="muted">Crea prima una banda nella sezione Le bande.</p>:<><div className="band-meta"><span>{active.name} · {active.faction}</span><label>TESORERIA <b>{active.gold} CO</b></label></div><p className="muted">Gli oggetti comuni si acquistano direttamente. Per gli oggetti rari ogni Eroe disponibile effettua un tentativo con 2D6: il risultato deve raggiungere la rarità indicata. Il tiro viene registrato per consentire un solo tentativo per Eroe nella stessa fase post-partita, indipendentemente dall'oggetto cercato.</p><label className="market-hero-label">EROE CHE CERCA <select value={marketHero} onChange={e=>setMarketHero(e.target.value)}><option value="">Selezione automatica</option>{active.warriors.filter(w=>['Capitano','Eroe'].includes(w.type)&&w.status!=='Fuori combattimento').map(w=><option value={w.id} key={w.id}>{w.name}</option>)}</select></label><select value={equipmentCategory} onChange={e=>setEquipmentCategory(e.target.value)}><option>Tutte</option>{Array.from(new Set(equipment.map(x=>x.category))).map(x=><option key={x}>{x}</option>)}</select>{marketMessage&&<p className="muted">{marketMessage}</p>}<div className="roster">{equipment.filter(x=>equipmentCategory==='Tutte'||x.category===equipmentCategory).map(item=><div className="warrior" key={item.id}><div className="warrior-info"><b>{item.name}</b><small>{item.category} · {item.rarity}</small></div><label><b>{item.cost} co</b></label><button className="outline" onClick={()=>buyEquipment(item)}>Acquista</button></div>)}</div><div className="panel-head roster-head"><h3>Riserva della banda</h3><span className="count">{(active.stash||[]).length} OGGETTI</span></div>{(active.stash||[]).length===0?<p className="muted">La riserva è vuota.</p>:<div className="roster">{(active.stash||[]).map((item,i)=><div className="warrior" key={i}><span className="mini-crest">✦</span><b>{item}</b><button className="outline" onClick={()=>sellUsedItem(item,'stash',undefined,i)}>Vendi · {((equipment.find(x=>x.name===item)?.cost||0)/2)} CO</button></div>)}</div>}<div className="panel-head roster-head"><h3>Ricerche oggetti rari</h3></div>{(data.marketSearches||[]).filter(x=>x.bandId===active.id).length===0?<p className="muted">Nessun tentativo registrato.</p>:<div className="roster">{(data.marketSearches||[]).filter(x=>x.bandId===active.id).map(x=><div className="warrior" key={x.id}><div className="warrior-info"><b>{x.heroName} · {x.itemName}</b><small>{x.date} · 2D6: {x.roll} / {x.rarity} richiesto</small></div><b>{x.success?'TROVATO':'FALLITO'}</b></div>)}</div>}</>}</section>}    {tab==='partite'&&<section className="panel wide"><div className="panel-head"><div><span className="eyebrow">DOPO OGNI SCONTRO</span><h2>Registra una partita</h2></div></div><div className="game-form"><input value={opponent} onChange={e=>setOpponent(e.target.value)} placeholder="Banda avversaria"/><input type="number" min="0" value={opponentRating} onChange={e=>setOpponentRating(e.target.value)} placeholder="Valore banda avversaria"/><select value={result} onChange={e=>setResult(e.target.value)}><option>Vittoria</option><option>Pareggio</option><option>Sconfitta</option></select><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Note, bottino, eventi..."/><button className="primary" onClick={addGame} disabled={!active||!opponent.trim()}>Registra scontro</button></div><div className="post-game-tools"><h3>Esperienza post-partita · {active?.name||'nessuna banda selezionata'}</h3><p className="muted">Assegna 1 PE ai guerrieri sopravvissuti abilitati alla crescita. Puoi disattivare PE nella scheda del singolo guerriero per le categorie che non accumulano esperienza secondo il regolamento della tua banda.</p><button className="primary" onClick={applyPostGameExperience} disabled={!active}>Assegna PE post-partita</button>{postGameMessage&&<p className="muted">{postGameMessage}</p>}</div><div className="post-game-tools"><h3>Sequenza guidata post-partita</h3><p className="muted">Segna le fasi completate seguendo l'ordine del Tomo 1. Le fasi non ancora automatizzate restano verificabili e registrabili manualmente.</p>{data.games.filter(g=>g.bandId===active?.id).slice(0,1).map(g=>{const done=g.postGameSteps||[];const next=postGamePhases.findIndex((_,i)=>!done.includes(i));return <div key={g.id}><b>{g.date} · vs {g.opponent}</b><p className="muted">{done.length} / {postGamePhases.length} fasi completate</p><div className="roster">{postGamePhases.map((phase,i)=><div className="warrior" key={phase}><span className="mini-crest">{done.includes(i)?'✓':String(i+1).padStart(2,'0')}</span><b>{phase}</b><small>{done.includes(i)?'Completata':i===next?'Prossima fase':'In attesa'}</small></div>)}</div><button className="outline" disabled={next<0} onClick={()=>markNextPostGamePhase(g.id)}>{next<0?'Sequenza completata':'Completa fase: '+postGamePhases[next]}</button></div>})}{!data.games.some(g=>g.bandId===active?.id)&&<p className="muted">Registra uno scontro per avviare la sequenza post-partita.</p>}</div><h3 className="section-title">Storico degli scontri</h3>{data.games.filter(g=>!active||g.bandId===active.id).length===0?<p className="muted">Ancora nessuno scontro annotato per questa banda.</p>:data.games.filter(g=>!active||g.bandId===active.id).map(g=><div className="history-row" key={g.id}><span className="date">{g.date}</span><b>vs {g.opponent}</b><span className={'result '+g.result.toLowerCase()}>{g.result}</span><small>{g.notes}</small></div>)}</section>}
    {tab==='esplorazione'&&<section className="panel wide"><div className="panel-head"><div><span className="eyebrow">FASE POST-PARTITA · TOMO 1</span><h2>Esplorazione e Malapietra</h2></div></div>{!active?<p className="muted">Seleziona o crea una banda nella sezione Le bande.</p>:<><div className="band-meta"><span>{active.name}</span><label>EROI DISPONIBILI <b>{eligibleHeroes}</b></label></div><p className="muted">Un D6 per ogni Eroe sopravvissuto e non fuori combattimento. In caso di vittoria aggiungi un dado. Si considerano al massimo sei risultati.</p><label className="victory-toggle"><input type="checkbox" checked={explorationVictory} onChange={e=>setExplorationVictory(e.target.checked)}/> Vittoria: aggiungi un D6</label><div className="dice-results">{dice.map((d,i)=><div className="die" key={i}>{d}</div>)}</div><button className="primary" onClick={resolveExploration}>Tira e registra esplorazione ({Math.min(6,eligibleHeroes+(explorationVictory?1:0))}D6)</button>{explorationMessage&&<p className="muted">{explorationMessage}</p>}{dice.length>0&&<p className="exploration-result">Totale: <b>{explorationTotal}</b> · Malapietra: <b>{explorationStones}</b></p>}</>}<div className="stone-inventory"><h3>Riserva di Malapietra: {active?.wyrdstone||0}</h3><p className="muted">Registra la vendita al prezzo applicabile alla tua campagna.</p><div className="stone-sale"><input type="number" min="1" value={sellStones} onChange={e=>setSellStones(e.target.value)} aria-label="Quantità di pietre"/><input type="number" min="0" value={stonePrice} onChange={e=>setStonePrice(e.target.value)} aria-label="Prezzo per pietra" placeholder="CO per pietra"/><button className="outline" onClick={sellWyrdstone} disabled={!active}>Vendi Malapietra</button></div></div><div className="panel-head roster-head"><h3>Storico esplorazioni</h3><span className="count">{(data.explorations||[]).length} REGISTRATE</span></div>{(data.explorations||[]).length===0?<p className="muted">Nessuna esplorazione registrata.</p>:<div className="roster">{data.explorations.filter(e=>!active||e.bandId===active.id||(!e.bandId&&e.bandName===active.name)).map(e=><div className="warrior" key={e.id}><div className="warrior-info"><b>{e.bandName} · {e.stones} pietre</b><small>{e.date} · Dadi {e.dice.join(', ')} · Totale {e.total}{e.victoryBonus?' · Bonus vittoria':''}</small></div></div>)}</div>}</section>}
    {tab==='cronaca'&&<section className="panel wide"><div className="panel-head"><div><span className="eyebrow">MEMORIE DALLA CITTÀ DEI DANNATI</span><h2>La cronaca</h2></div></div><textarea value={chronicle} onChange={e=>setChronicle(e.target.value)} placeholder="Annota eventi, rivalità, gesta eroiche e tradimenti..."/><button className="primary" onClick={addChronicle}>Aggiungi alla cronaca</button><div className="chronicle">{data.chronicle.map((entry,i)=><article key={i}><span>✒</span><p>{entry}</p></article>)}</div></section>}
    <footer>IL REGISTRO DI MORDHEIM <span>·</span> UNA CAMPAGNA TRA LE ROVINE</footer></main></div>
}