# Mordheim Campaign Manager

Web app in italiano per tenere traccia di bande, guerrieri, partite ed eventi di una campagna di Mordheim.

## Avvio locale
Richiede Node.js 20 o superiore.

```bash
npm install
npm run dev
```

## Pubblicazione su GitHub Pages
Il workflow in `.github/workflows/deploy.yml` pubblica automaticamente il progetto a ogni push su `main`. In GitHub, apri **Settings → Pages** e imposta **Build and deployment → Source: GitHub Actions**.

Sito: https://nicola2751.github.io/mordheim-campaign-manager/

## Dati
La prima versione salva i dati nel localStorage del browser. Usa **Esporta JSON** per fare una copia di sicurezza o trasferire i dati manualmente. La sincronizzazione tra dispositivi non è ancora attiva.

## Funzioni
- Creazione e gestione bande
- Registro guerrieri, esperienza e ferite
- Gestione tesoreria
- Registro partite e cronaca
- Tiri di dadi D6
- Esportazione dei dati in JSON
