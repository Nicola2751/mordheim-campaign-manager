# Mordheim Campaign Manager

Web app in italiano per la gestione locale di una campagna di Mordheim, con interfaccia gotica e dati conservati nel browser.

## Avvio locale

Richiede Node.js 20 o superiore.

```bash
npm install
npm run dev
```

Per verificare la build di produzione:

```bash
npm run build
```

## Pubblicazione

Il workflow GitHub Actions pubblica automaticamente su GitHub Pages a ogni push su `main`.

Sito: https://nicola2751.github.io/mordheim-campaign-manager/

## Funzioni

### Bande e guerrieri
- Creazione e gestione di più bande, tesoreria e valore banda.
- Registro guerrieri con PE, ferite, stato, equipaggiamento e gruppi Truppa.
- Limite generale di sei Eroi incluso il Capitano e avviso per bande sotto i tre guerrieri.
- Carriera individuale dei guerrieri e archivio di caduti/ex membri.
- Restituzione alla riserva dell'equipaggiamento dei guerrieri archiviati.

### Partite e sequenza post-partita
- Registro degli scontri con avversario, risultato, note e valore delle bande.
- Snapshot del roster e dei valori al momento della partita, per mantenere consultabile lo storico.
- Sequenza guidata delle dieci fasi post-partita.
- PE di sopravvivenza e bonus banda svantaggiata, applicati una sola volta agli aventi diritto registrati nello snapshot.
- Esplorazione collegata alla partita selezionata, con dadi degli Eroi idonei, bonus vittoria, massimo sei dadi e conversione in Malapietra.
- Vendita della Malapietra e ricerca degli oggetti rari collegate alla partita selezionata.
- Fasi automatiche: esperienza, esplorazione, vendita della Malapietra e ricerca rara. Le fasi non automatizzate richiedono conferma manuale; le fasi automatiche possono essere registrate come non necessarie quando non si applicano.
- Ferite gravi: tiro di sopravvivenza della Truppa e tiro D66 degli Eroi con annotazione manuale dell'esito.
- Diario battaglie, confronto tra snapshot di due partite ed evoluzione cronologica della campagna.

### Armeria ed economia
- Catalogo di equipaggiamento, acquisto di oggetti comuni e ricerca degli oggetti rari tramite 2D6.
- Un solo tentativo di ricerca per Eroe nella stessa fase post-partita.
- Assegnazione e restituzione dell'equipaggiamento individuale; vendita degli oggetti usati a metà prezzo.
- Inventario di Malapietra e vendita con prezzo per pietra configurabile.
- Registro contabile di entrate e uscite, movimenti automatici e manuali, bilancio per partita e progressione economica cumulativa.
- Esportazione CSV di confronti, evoluzione campagna e report economici.

### Strumenti e protezione dei dati
- Cronaca della campagna.
- Esportazione e importazione dei dati JSON con validazione strutturale e coerenza dei riferimenti.
- Recupero dei dati locali malformati: prima dell'inizializzazione dei dati iniziali, il contenuto non valido viene conservato per consentire il ripristino o lo scaricamento.
- Compatibilità con i backup precedenti per i campi storici aggiunti nel corso dello sviluppo.

## Regole e limiti

I calcoli automatizzati riflettono solo le regole del Tomo 1 effettivamente trascritte e verificate durante lo sviluppo. Le tabelle D66 degli Eroi, gli avanzamenti dettagliati, le abilità, le restrizioni specifiche per fazione, le disponibilità e i costi variabili, gli Avventurieri speciali e le regole del secondo tomo richiedono ancora verifica sui manuali completi.

Le fasi post-partita non ancora automatizzate restano registrabili manualmente. Dove il regolamento non è stato verificato, l'app lascia l'esito o il valore all'inserimento dell'utente anziché inventarlo.

## Dati e privacy

I dati sono salvati nel `localStorage` del browser e non vengono sincronizzati automaticamente tra dispositivi. Usa **Esporta JSON** per creare regolarmente una copia di sicurezza e **Importa JSON** per ripristinarla. Conserva sempre una copia del file esportato: cancellare i dati del browser o cambiare dispositivo può renderli indisponibili.
