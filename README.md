# Mordheim Campaign Manager

Web app in italiano per la gestione locale di una campagna di Mordheim.

## Avvio locale
Richiede Node.js 20 o superiore.

```bash
npm install
npm run dev
```

## Pubblicazione
Il workflow GitHub Actions pubblica automaticamente su GitHub Pages a ogni push su `main`.

Sito: https://nicola2751.github.io/mordheim-campaign-manager/

## Funzioni attuali
- Creazione bande, gestione tesoreria e valore banda.
- Registro guerrieri, PE, ferite, stati e equipaggiamento individuale.
- Limite generale di sei Eroi incluso il Capitano e avviso per bande sotto i tre guerrieri.
- Armeria con acquisto di oggetti comuni e ricerca degli oggetti rari tramite 2D6.
- Registro dei tentativi di ricerca: un solo tentativo per Eroe nella stessa fase post-partita.
- Gestione dei gruppi Truppa, assegnazione e restituzione dell'equipaggiamento, vendita degli oggetti usati a metà prezzo.
- Sequenza guidata delle dieci fasi post-partita, con completamento manuale delle fasi non ancora automatizzate.
- Esplorazione con dadi per gli Eroi disponibili, bonus vittoria, limite di sei dadi e conversione del totale in Malapietra.
- Inventario di Malapietra e vendita con prezzo per pietra configurabile.
- Registro partite, assegnazione PE di sopravvivenza e bonus banda svantaggiata.
- Ferite gravi: tiro di sopravvivenza della Truppa e tiro D66 degli Eroi con annotazione manuale dell'esito.
- Validazione strutturale dei backup JSON prima dell'importazione, inclusi gli identificativi duplicati e i tiri del mercato.
- Cronaca, esportazione e importazione dei dati JSON.

## Regole e limiti
I calcoli automatizzati riflettono solo le regole del Tomo 1 effettivamente trascritte e verificate durante lo sviluppo. Le tabelle D66 degli Eroi, gli avanzamenti dettagliati, le restrizioni di equipaggiamento specifiche per fazione, le disponibilità e i costi variabili, gli Avventurieri speciali e le regole del secondo tomo richiedono ancora verifica sui manuali completi. Dove il regolamento non è stato verificato, l'app lascia l'esito o il valore all'inserimento dell'utente anziché inventarlo.

## Dati e privacy
I dati sono salvati nel localStorage del browser e non vengono sincronizzati automaticamente tra dispositivi. Usa **Esporta JSON** per creare una copia di sicurezza e **Importa JSON** per ripristinarla. Conserva sempre una copia del file esportato.
