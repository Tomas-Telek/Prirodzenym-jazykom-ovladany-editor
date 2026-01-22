## Technológie
* **Frontend:** React, TypeScript
* **AI Framework:** LangChain
* **Modely:** OpenAI Whisper (Audio), GPT-4o/GPT-3.5 (Text)

---

##  Štruktúra projektu a komponenty

### Vstupná brána

#### `index.html`
* **Cieľ:** Slúži ako statická kostra a vstupná brána pre prehliadač.
* **Popis:** Obsahuje prázdny prvok `<div id="root">`, ktorý slúži ako plátno pre React aplikáciu, a načítava hlavný skript (`main.tsx`) ako modul.

#### `main.tsx`
* **Cieľ:** Oficiálny štartovací bod aplikácie v rámci Reactu.
* **Popis:** Prepája logiku JavaScriptu s fyzickým miestom v HTML. Využíva funkciu `createRoot`, vykresľuje hlavný komponent `<App />` a aktivuje `StrictMode` pre lepšiu detekciu chýb.

---

### Jadro aplikácie (Orchestrácia)

#### `App.tsx`
* **Cieľ:** Riadiace centrum celého editora. Spája používateľský vstup, stav dát a inteligenciu agentov.
* **Popis:**
    * **Stav (useState):** Spravuje textový obsah (odseky), aktuálnu pozíciu kurzora a konfiguračné údaje (API kľúč).
    * **Smerovanie dát:** Funkcia `handleSubmit` spracováva príkazy a na základe rozhodnutia agentov aktualizuje buď obsah textu, alebo polohu navigácie.

---

### Hlasové rozhranie

#### `SpeechWhisper.tsx`
* **Cieľ:** Transformácia hlasu na text (STT - Speech-to-Text).
* **Popis:**
    * **Web Media API:** Získava prístup k mikrofónu a nahráva audio dáta.
    * **Whisper API:** Funkcia `sendToWhisper` odosiela audio súbor do OpenAI na prepis do slovenčiny.
    * **Callback (onText):** Po získaní textu ho odovzdáva späť do `App.tsx` na ďalšie spracovanie.

---

### Agentívna Logika (AI Rozhodovanie)



#### `routerAgent.ts`
* **Cieľ:** Rozhodnúť o zámere (intent) používateľa.
* **Popis:** * Využíva **heuristiku** (kľúčové slová ako "zmeň", "napíš") na rýchlu identifikáciu úprav.
    * Následne deleguje úlohu špecializovaným sub-agentom.

#### `editAgent.ts`
* **Cieľ:** Vykonávanie textových transformácií.
* **Popis:** Izoluje logiku úprav na úrovni jedného odseku. Zabezpečuje, aby AI vrátila čistý text bez balastu, pripravený na okamžité vloženie.

#### `MapsAgent.ts`
* **Cieľ:** Hlasová navigácia v dokumente.
* **Popis:** Premieňa prirodzený jazyk (napr. "choď na začiatok") na konkrétny index v poli odsekov, čím nahrádza potrebu klikať myšou.

---

### Infraštruktúra

#### `langchainClient.ts`
* **Cieľ:** Štandardizácia komunikácie s LLM modelmi.
* **Popis:**
    * **Konfigurácia:** Centrálne miesto pre nastavenie modelu (`getLCModel`).
    * **Preklad správ:** Transformuje bežné dáta na objekty LangChainu (`SystemMessage`, `HumanMessage`).
    * **Exekúcia:** Metóda `model.invoke()` zabezpečuje reálnu komunikáciu so servermi OpenAI.

