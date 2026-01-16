## Kľúčové funkcie

### Interaktívne zvýraznenie
Editor v reálnom čase vizuálne odlišuje odsek, na ktorý sa momentálne sústredíte. Všetky príkazy na úpravu sa aplikujú práve na tento **aktívny blok**.

### Inteligentná editácia (AI)
Podpora komplexných inštrukcií v slovenčine:
* **Tvorba a zmena:** *"napíš"*, *"prepíš"*, *"doplň"*, *"nahraď"*,*...*
* **Mazanie:** *"vymaž"*, *"odstráň"*,*...*

### Smart navigácia
Editoru môžete zadávať smerové príkazy na presun medzi odsekmi bez použitia myši:
* **Smer hore:** *"vyššie"*, *"späť"*
* **Smer dole:** *"ďalší"*, *"dopredu"*


## Inštrukcie na použitie

1. **Otvorenie:** Spustite súbor `index.html` v ľubovoľnom modernom prehliadači.
2. **Konfigurácia:** Vložte svoj osobný **OpenAI API kľúč** do poľa v hornom paneli.
3. **Zadanie inštrukcie:** Do príkazového riadku napíšte, čo chcete s textom urobiť (napr. *"Doplň do tohto odseku tri vety o dôležitosti technológií"*).
4. **Spracovanie:** Po kliknutí na **Submit** AI vyhodnotí typ príkazu:
    * **Textový príkaz:** Obsah odseku sa okamžite aktualizuje.
    * **Navigačný príkaz:** Zmení sa fokus (zvýraznenie) na iný odsek.

---

## Technické veci
1. **Detekcia úmyslu (Intent Recognition):** Skript kontroluje vstup používateľa voči zoznamu kľúčových slov (`editKeywords`). Ak príkaz obsahuje slovo ako *"prepíš"* alebo *"doplň"*, aktivuje sa režim úpravy; v opačnom prípade sa príkaz interpretuje ako navigácia.
2. **Dynamické prepínanie promptov:** Podľa detegovaného úmyslu aplikácia posiela modelu GPT-4o rôzne systémové inštrukcie – buď pre precíznu gramatickú úpravu textu, alebo pre vrátenie číselného indexu nového odseku.
3. **Správa stavu (DOM State):** Aktuálna poloha v dokumente je sledovaná pomocou premennej `currentIndex`. Funkcia `highlightParagraph` zabezpečuje vizuálnu spätnú väzbu prepínaním CSS triedy `.highlight` na divoch editora.
4. **Bezpečnostný filter:** Pred odoslaním na API prechádza text Regex kontrolou `/<script|<.*?>/`, ktorá blokuje pokusy o vloženie škodlivého kódu alebo HTML značiek.
5. **Priama API komunikácia:** Aplikácia využíva `fetch` na asynchrónne volanie OpenAI API s parametrom `temperature: 0`, čo zaručuje deterministické (stále a presné) odpovede potrebné pre navigáciu a opravu textu.
