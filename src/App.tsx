import { useEffect, useMemo, useState } from 'react'
import { equipment } from './data/equipment'

type Warrior = { id: string; name: string; type: string; xp: number; wounds: number; status: string; equipment?: string[] }
type Warband = { id: string; name: string; faction: string; gold: number; rating: number; warriors: Warrior[]; stash?: string[] }
type Exploration = { id: string; date: string; bandName: string; dice: number[]; total: number; stones: number; victoryBonus: boolean }
type MarketSearch = { id:string; date:string; bandId:string; heroName:string; itemName:string; roll:number; rarity:number; success:boolean }\ntype Campaign = { bands: Warband[]; games: { id: string; date: string; opponent: string; result: string; notes: string; bandId?: string; xpBonus?: number }[]; chronicle: string[]; explorations: Exploration[]; marketSearches: MarketSearch[] }
const starter: Campaign = { bands: [], games: [], chronicle: [], explorations: [], marketSearches: [] }
const uid = () => Math.random().toString(36).slice(2, 10)
const read = (): Campaign => { try { const saved = JSON.parse(localStorage.getItem('mordheim-ledger') || 'null'); return saved ? { ...starter, ...saved, explorations: saved.explorations || [], marketSearches: saved.marketSearches || [] } : starter } catch { return starter } }

export default function App() {
  const [data, setData] = useState<Campaign>(read)
  const [tab, setTab] = useState('bande')
  const [bandName, setBandName] = useState('')
  const [faction, setFaction] = useState('Banda mercenaria')
  const [selected, setSelected] = useState('')
  const [warriorName, setWarriorName] = useState('')
  const [warriorType, setWarriorType] = useState('Capitano')
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
  const [equipmentSelection, setEquipmentSelection] = useState<Record<string,string>>({})\n  const [marketHero, setMarketHero] = useState('')\n  const [marketSearchMessage, setMarketSearchMessage] = useState('')
  useEffect(() => localStorage.setItem('mordheim-ledger', JSON.stringify(data)), [data])
  const active = data.bands.find(b => b.id === selected) || data.bands[0]
  const totalWarriors = useMemo(() => data.bands.reduce((n,b) => n + b.warriors.length, 0), [data])
  const patchBand = (id: string, patch: Partial<Warband>) => setData(d => ({...d, bands:d.bands.map(b => b.id === id ? {...b,...patch} : b)}))
  const addBand = () => { if (!bandName.trim()) return; const b: Warband = {id:uid(),name:bandName.trim(),faction,gold:500,rating:0,warriors:[],stash:[]}; setData(d=>({...d,bands:[...d.bands,b]})); setSelected(b.id); setBandName('') }
  const addWarrior = () => { if (!active || !warriorName.trim()) return; patchBand(active.id,{warriors:[...active.warriors,{id:uid(),name:warriorName.trim(),type:warriorType,xp:0,wounds:1,status:'In salute',equipment:[]}]}); setWarriorName('') }
  const buyEquipment = (item: typeof equipment[number]) => {
    if (!active) return
    if (active.gold < item.cost) { setMarketMessage('Tesoro insufficiente per acquistare questo oggetto.'); return }
    const rarityMatch = item.rarity.match(/Raro\\s*(\\d+)/i)
    if (rarityMatch) {
      const heroes = active.warriors.filter(w=>['Capitano','Eroe'].includes(w.type)&&w.status!=='Fuori combattimento')
      const hero = heroes.find(w=>w.id===marketHero) || heroes[0]
      if (!hero) { setMarketMessage('Serve un Eroe disponibile per cercare oggetti rari.'); return }
      const today = new Date().toLocaleDateString('it-IT')
      if ((data.marketSearches||[]).some(x=>x.bandId===active.id&&x.heroName===hero.name&&x.itemName===item.name&&x.date===today)) { setMarketMessage(hero.name+' ha già tentato di trovare '+item.name+' oggi.'); return }
      const roll = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1
      const rarity = Number(rarityMatch[1])
      const success = roll>=rarity
      const record:MarketSearch={id:uid(),date:today,bandId:active.id,heroName:hero.name,itemName:item.name,roll,rarity,success}
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
    const rangedCount = current.filter(name => ['Tiro','Armi da fuoco'].includes(equipment.find(x => x.name === name)?.category || '')).length
    if (category === 'Mischia' && meleeCount >= 2) { setMarketMessage('Limite raggiunto: massimo due armi da mischia oltre al pugnale gratuito.'); return }
    if (['Tiro','Armi da fuoco'].includes(category || '') && rangedCount >= 2) { setMarketMessage('Limite raggiunto: massimo due armi da tiro.'); return }
    patchBand(active.id,{stash:active.stash?.filter((_,i)=>i!==stashIndex),warriors:active.warriors.map(w=>w.id===warriorId?{...w,equipment:[...current,itemName]}:w)})
    setEquipmentSelection(v=>({...v,[warriorId]:''}))
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
    setMarketMessage(itemName+' restituito alla riserva.')
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
  const resolveExploration = () => { if (!active) return; const count = Math.min(6,eligibleHeroes+(explorationVictory?1:0)); if (count===0) { setExplorationMessage('Servono almeno un Eroe disponibile o il dado bonus vittoria.'); return; } const results=Array.from({length:count},()=>Math.floor(Math.random()*6)+1); const total=results.reduce((a,b)=>a+b,0); const stones=total<=5?1:total<=11?2:total<=17?3:total<=24?4:total<=30?5:total<=35?6:7; const entry: Exploration={id:uid(),date:new Date().toLocaleDateString('it-IT'),bandName:active.name,dice:results,total,stones,victoryBonus:explorationVictory}; setDice(results); setData(d=>({...d,explorations:[entry,...(d.explorations||[])]})); setExplorationMessage('Esplorazione registrata: '+stones+' pietre di Malapietra.'); }
  const exportData = () => { const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='mordheim-campagna.json'; a.click(); URL.revokeObjectURL(a.href) }
  const underdogBonus = (difference:number) => difference<=50?0:difference<=75?1:difference<=100?2:difference<=150?3:difference<=300?4:5
  const applyPostGameExperience = () => {
    if (!active) { setPostGameMessage('Seleziona prima la banda.'); return }
    const diff = Math.max(0,Number(opponentRating)-active.rating)
    const bonus = underdogBonus(diff)
    const eligible = active.warriors.filter(w=>w.status!=='Fuori combattimento')
    if (!eligible.length) { setPostGameMessage('Nessun guerriero sopravvissuto disponibile per ricevere PE.'); return }
    patchBand(active.id,{warriors:active.warriors.map(w=>w.status!=='Fuori combattimento'?{...w,xp:w.xp+1+bonus}:w)})
    setPostGameMessage('Assegnati '+(1+bonus)+' PE a '+eligible.length+' guerrieri sopravvissuti (1 PE sopravvivenza + '+bonus+' bonus svantaggio).')
  }
  const addGame = () => { if(!opponent.trim()) return; setData(d=>({...d,games:[{id:uid(),date:new Date().toLocaleDateString('it-IT'),opponent,result,notes,bandId:active?.id,xpBonus:underdogBonus(Math.max(0,Number(opponentRating)-(active?.rating||0)))},...d.games]})); setOpponent('');setNotes('') }
  const addChronicle = () => { if(chronicle.trim()) {setData(d=>({...d,chronicle:[chronicle.trim(),...d.chronicle]}));setChronicle('')} }
  return <div className="shell">
    <aside className="sidebar"><div className="sigil">M</div><div className="brand"><span>IL REGISTRO DI</span><strong>MORDHEIM</strong><small>CAMPAIGN LEDGER</small></div><nav>{[['bande','♜','Le bande'],['armeria','⚒','Armeria'],['partite','⚔','Partite'],['esplorazione','☠','Esplorazione'],['cronaca','✒','Cronaca']].map(([id,ic,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><span>{ic}</span>{label}</button>)}</nav><div className="side-bottom"><span className="dot"/> CAMPAGNA LOCALE<br/><small>I dati restano su questo dispositivo</small></div></aside>
    <main><header><div><span className="eyebrow">CITTÀ DEI DANNATI · REGISTRO DI CAMPAGNA</span><h1>{tab==='bande'?'Le bande':tab==='armeria'?'Armeria e mercato':tab==='partite'?'Registro delle partite':tab==='esplorazione'?'Esplorazione':'Cronaca della campagna'}</h1></div><button className="outline" onClick={exportData}>↓ Esporta JSON</button></header>
    <section className="stats"><div><span>BANDE IN CAMPAGNA</span><b>{data.bands.length.toString().padStart(2,'0')}</b></div><div><span>GUERRIERI REGISTRATI</span><b>{totalWarriors.toString().padStart(2,'0')}</b></div><div><span>SCONTRI DISPUTATI</span><b>{data.games.length.toString().padStart(2,'0')}</b></div><div><span>VITTORIE</span><b>{data.games.filter(g=>g.result==='Vittoria').length.toString().padStart(2,'0')}</b></div></section>
    {tab==='bande' && <div className="content-grid"><section className="panel"><div className="panel-head"><div><span className="eyebrow">FAZIONI IN GIOCO</span><h2>Le tue bande</h2></div><span className="count">{data.bands.length} TOTALI</span></div>{data.bands.length===0?<div className="empty"><div>♜</div><h3>Nessuna banda registrata</h3><p>La città attende i suoi primi comandanti.</p></div>:<div className="band-list">{data.bands.map(b=><button key={b.id} onClick={()=>setSelected(b.id)} className={'band-row '+(active?.id===b.id?'chosen':'')}><span className="crest">♜</span><span><b>{b.name}</b><small>{b.faction} · {b.warriors.length} guerrieri</small></span><strong>{b.gold} <small>CO</small></strong></button>)}</div>}<div className="create-band"><h3>Fondare una banda</h3><input value={bandName} onChange={e=>setBandName(e.target.value)} placeholder="Nome della banda"/><select value={faction} onChange={e=>setFaction(e.target.value)}>{['Banda mercenaria','Sorelle di Sigmar','Culto dei Posseduti','Skaven','Orchi e Goblin','Nonmorti','Cacciatori di streghe','Kisleviti'].map(x=><option>{x}</option>)}</select><button className="primary" onClick={addBand}>+ Crea banda</button></div></section>
    <section className="panel"><div className="panel-head"><div><span className="eyebrow">SCHEDA DELLA BANDA</span><h2>{active?.name || 'Seleziona una banda'}</h2></div></div>{active?<><div className="band-meta"><span>{active.faction}</span><label>VALORE BANDA <input className="rating-input" type="number" min="0" value={active.rating} onChange={e=>patchBand(active.id,{rating:Math.max(0,Number(e.target.value))})}/></label><label>TESORERIA <b>{active.gold} CO</b></label></div><div className="gold-tools"><input type="number" value={goldDelta} onChange={e=>setGoldDelta(e.target.value)}/><button className="outline" onClick={()=>patchBand(active.id,{gold:Math.max(0,active.gold+Number(goldDelta))})}>Aggiorna oro</button></div><div className="panel-head roster-head"><h3>Composizione</h3><span className="count">{active.warriors.length} MEMBRI</span></div><div className="roster">{active.warriors.map(w=><div className="warrior" key={w.id}><span className="mini-crest">✦</span><div className="warrior-info"><b>{w.name}</b><small>{w.type} · {w.status}</small><div className="assigned-equipment"><small>Equipaggiamento: {(w.equipment||[]).length?(w.equipment||[]).join(', '):'nessuno'}</small>{(w.equipment||[]).map((item,i)=><button className="remove" title={'Restituisci '+item} onClick={()=>unequipItem(w.id,i)} key={i}>−</button>)}{(active.stash||[]).length>0&&<><select aria-label={'Oggetto per '+w.name} value={equipmentSelection[w.id]||''} onChange={e=>setEquipmentSelection(v=>({...v,[w.id]:e.target.value}))}><option value="">Dalla riserva…</option>{(active.stash||[]).map((item,i)=><option value={String(i)} key={i}>{item}</option>)}</select><button className="outline" disabled={!equipmentSelection[w.id]} onClick={()=>equipItem(w.id,Number(equipmentSelection[w.id]))}>Assegna</button></>}</div></div><label className="xp-control">PE <input type="number" min="0" value={w.xp} onChange={e=>patchBand(active.id,{warriors:active.warriors.map(x=>x.id===w.id?{...x,xp:Math.max(0,Number(e.target.value))}:x)})}/></label><label>FERITE <b>{w.wounds}</b></label><select aria-label={'Stato di '+w.name} value={w.status} onChange={e=>patchBand(active.id,{warriors:active.warriors.map(x=>x.id===w.id?{...x,status:e.target.value}:x)})}><option>In salute</option><option>Fuori combattimento</option><option>In convalescenza</option></select>{w.status==='Fuori combattimento'&&!['Capitano','Eroe'].includes(w.type)&&<button className="outline" onClick={()=>resolveTroopInjury(w.id)}>Tiro ferite D6</button>}<button className="remove" title="Rimuovi" onClick={()=>patchBand(active.id,{warriors:active.warriors.filter(x=>x.id!==w.id)})}>×</button></div>)}{active.warriors.length===0&&<p className="muted">Nessun guerriero. Aggiungi il primo membro della banda.</p>}</div><div className="add-warrior"><input value={warriorName} onChange={e=>setWarriorName(e.target.value)} placeholder="Nome guerriero"/><select value={warriorType} onChange={e=>setWarriorType(e.target.value)}>{['Capitano','Eroe','Truppa','Tiratore','Specialista'].map(x=><option>{x}</option>)}</select><button className="primary" onClick={addWarrior}>Aggiungi</button></div></>:<div className="empty compact"><div>☩</div><p>Crea o seleziona una banda per gestirne la scheda.</p></div>}</section></div>}
    {tab==='armeria'&&<section className="panel wide"><div className="panel-head"><div><span className="eyebrow">LISTINO DEL TOMO 1 · PAGINE 591–595</span><h2>Armeria e mercato</h2></div><span className="count">PREZZI IN CORONE D'ORO</span></div>{!active?<p className="muted">Crea prima una banda nella sezione Le bande.</p>:<><div className="band-meta"><span>{active.name} · {active.faction}</span><label>TESORERIA <b>{active.gold} CO</b></label></div><p className="muted">Gli oggetti comuni si acquistano direttamente. Per gli oggetti rari ogni Eroe disponibile effettua un tentativo con 2D6: il risultato deve raggiungere la rarità indicata. Il tiro viene registrato per evitare tentativi ripetuti dello stesso Eroe sullo stesso oggetto nella stessa giornata.</p><label className="market-hero-label">EROE CHE CERCA <select value={marketHero} onChange={e=>setMarketHero(e.target.value)}><option value="">Selezione automatica</option>{active.warriors.filter(w=>['Capitano','Eroe'].includes(w.type)&&w.status!=='Fuori combattimento').map(w=><option value={w.id} key={w.id}>{w.name}</option>)}</select></label><select value={equipmentCategory} onChange={e=>setEquipmentCategory(e.target.value)}><option>Tutte</option>{Array.from(new Set(equipment.map(x=>x.category))).map(x=><option key={x}>{x}</option>)}</select>{marketMessage&&<p className="muted">{marketMessage}</p>}<div className="roster">{equipment.filter(x=>equipmentCategory==='Tutte'||x.category===equipmentCategory).map(item=><div className="warrior" key={item.id}><div className="warrior-info"><b>{item.name}</b><small>{item.category} · {item.rarity}</small></div><label><b>{item.cost} co</b></label><button className="outline" onClick={()=>buyEquipment(item)}>Acquista</button></div>)}</div><div className="panel-head roster-head"><h3>Riserva della banda</h3><span className="count">{(active.stash||[]).length} OGGETTI</span></div>{(active.stash||[]).length===0?<p className="muted">La riserva è vuota.</p>:<div className="roster">{(active.stash||[]).map((item,i)=><div className="warrior" key={i}><span className="mini-crest">✦</span><b>{item}</b></div>)}</div>}</>}</section>}    {tab==='partite'&&<section className="panel wide"><div className="panel-head"><div><span className="eyebrow">DOPO OGNI SCONTRO</span><h2>Registra una partita</h2></div></div><div className="game-form"><input value={opponent} onChange={e=>setOpponent(e.target.value)} placeholder="Banda avversaria"/><input type="number" min="0" value={opponentRating} onChange={e=>setOpponentRating(e.target.value)} placeholder="Valore banda avversaria"/><select value={result} onChange={e=>setResult(e.target.value)}><option>Vittoria</option><option>Pareggio</option><option>Sconfitta</option></select><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Note, bottino, eventi..."/><button className="primary" onClick={addGame}>Registra scontro</button></div><div className="post-game-tools"><h3>Esperienza post-partita · {active?.name||'nessuna banda selezionata'}</h3><p className="muted">Assegna 1 PE ai guerrieri non fuori combattimento per la sopravvivenza e il bonus per banda svantaggiata in base alla differenza di valore.</p><button className="primary" onClick={applyPostGameExperience} disabled={!active}>Assegna PE post-partita</button>{postGameMessage&&<p className="muted">{postGameMessage}</p>}</div><h3 className="section-title">Storico degli scontri</h3>{data.games.length===0?<p className="muted">Ancora nessuno scontro annotato.</p>:data.games.map(g=><div className="history-row" key={g.id}><span className="date">{g.date}</span><b>vs {g.opponent}</b><span className={'result '+g.result.toLowerCase()}>{g.result}</span><small>{g.notes}</small></div>)}</section>}
    {tab==='esplorazione'&&<section className="panel wide"><div className="panel-head"><div><span className="eyebrow">FASE POST-PARTITA · TOMO 1</span><h2>Esplorazione e Malapietra</h2></div></div>{!active?<p className="muted">Seleziona o crea una banda nella sezione Le bande.</p>:<><div className="band-meta"><span>{active.name}</span><label>EROI DISPONIBILI <b>{eligibleHeroes}</b></label></div><p className="muted">Un D6 per ogni Eroe sopravvissuto e non fuori combattimento. In caso di vittoria aggiungi un dado. Si considerano al massimo sei risultati.</p><label className="victory-toggle"><input type="checkbox" checked={explorationVictory} onChange={e=>setExplorationVictory(e.target.checked)}/> Vittoria: aggiungi un D6</label><div className="dice-results">{dice.map((d,i)=><div className="die" key={i}>{d}</div>)}</div><button className="primary" onClick={resolveExploration}>Tira e registra esplorazione ({Math.min(6,eligibleHeroes+(explorationVictory?1:0))}D6)</button>{explorationMessage&&<p className="muted">{explorationMessage}</p>}{dice.length>0&&<p className="exploration-result">Totale: <b>{explorationTotal}</b> · Malapietra: <b>{explorationStones}</b></p>}</>}<div className="panel-head roster-head"><h3>Storico esplorazioni</h3><span className="count">{(data.explorations||[]).length} REGISTRATE</span></div>{(data.explorations||[]).length===0?<p className="muted">Nessuna esplorazione registrata.</p>:<div className="roster">{data.explorations.map(e=><div className="warrior" key={e.id}><div className="warrior-info"><b>{e.bandName} · {e.stones} pietre</b><small>{e.date} · Dadi {e.dice.join(', ')} · Totale {e.total}{e.victoryBonus?' · Bonus vittoria':''}</small></div></div>)}</div>}</section>}
    {tab==='cronaca'&&<section className="panel wide"><div className="panel-head"><div><span className="eyebrow">MEMORIE DALLA CITTÀ DEI DANNATI</span><h2>La cronaca</h2></div></div><textarea value={chronicle} onChange={e=>setChronicle(e.target.value)} placeholder="Annota eventi, rivalità, gesta eroiche e tradimenti..."/><button className="primary" onClick={addChronicle}>Aggiungi alla cronaca</button><div className="chronicle">{data.chronicle.map((entry,i)=><article key={i}><span>✒</span><p>{entry}</p></article>)}</div></section>}
    <footer>IL REGISTRO DI MORDHEIM <span>·</span> UNA CAMPAGNA TRA LE ROVINE</footer></main></div>
}