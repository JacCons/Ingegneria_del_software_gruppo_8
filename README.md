# SecuriTrento

Progetto di Ingegneria del Software - Gruppo 8

## Descrizione

Il progetto mira a sviluppare un’applicazione che consenta ai cittadini di Trento di segnalare situazioni di pericolo o comportamenti illeciti, contribuendo così a migliorare la sicurezza urbana e la collaborazione tra la comunità e le autorità locali.

---

## Requisiti

- Node.js (v22.15)
- npm (v10.9.2)
---

## Installazione e Avvio Locale

### 1. Clona la repository

```bash
git clone https://github.com/JacCons/Ingegneria_del_software_gruppo_8.git
cd Ingegneria_del_software_gruppo_8
```
---

### 2. Avvio Backend

```bash
cd SecuriTrento_BE
npm run clean-modules #scarica le librerie e i moduli necessari
```

Aggiungere il file `.env`:


Avvia il backend:
```bash
node app.ts 
```

- Il backend sarà disponibile su [http://localhost:3000](http://localhost:3000)
- La documentazione Swagger sarà su [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

### 3. Avvio Frontend

Apri un nuovo terminale e spostati nella cartella del frontend:

```bash
cd SecuriTrento_FE
npm run clean-modules #scarica le librerie e i moduli necessari
npm start #avvia il Front-End
```

- Il frontend sarà disponibile su [http://localhost:4200](http://localhost:4200)

---
# Deploy Su Render
Backend: https://ingegneria-del-software-gruppo-8.onrender.com/api-docs

Frontend: https://ingegneria-del-software-gruppo-8-fee.onrender.com/
