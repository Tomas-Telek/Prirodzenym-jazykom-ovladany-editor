index.html

    Cieľ: Slúži ako statická kostra a vstupná brána pre prehliadač. Existuje preto, aby mal React kam "vstúpiť" a kde zobraziť rozhranie.

    Popis: Obsahuje prázdny prvok <div id="root">, ktorý slúži ako plátno, a načítava hlavný skript (main.tsx) ako modul.

main.tsx

    Cieľ: Oficiálny štartovací bod aplikácie v rámci Reactu. Jeho úlohou je prepojiť logiku JavaScriptu s fyzickým miestom v HTML dokumente.

    Popis: Využíva funkciu createRoot, ktorá uchopí spomínaný "root" element a vykreslí doň hlavný komponent <App />. Taktiež zapína StrictMode pre detekciu chýb počas vývoja.

App.tsx

    Cieľ: Riadiace centrum celého editora. Existuje preto, aby spájalo používateľský vstup (hlas/text), stav dát (texty v editore) a inteligenciu agenta.

    Popis:

        Stav (useState): Ukladá si texty (odseky), aktuálnu pozíciu a API kľúč...

        Smerovanie dát: Funkcia handleSubmit zoberie akýkoľvek príkaz, pošle ho agentovi a na základe jeho odpovede (edit alebo navigate) rozhodne, či sa zmení text alebo len poloha kurzora.

SpeechWhisper.tsx

    Cieľ: Zachytiť zvuk z mikrofónu používateľa, premeniť ho na digitálny audio súbor a nechať ho AI modelom prepísať do textu (Slovenčiny). 

    Popis:

        Web Media API (navigator.mediaDevices): Používa natívne funkcie prehliadača na získanie prístupu k hardvéru (mikrofónu) a nahrávanie audia.


        Whisper API Integrácia: Funkcia sendToWhisper posiela nahratý súbor priamo do OpenAI.

        Callback (onText): Po úspešnom prepise pošle výsledný text späť do App.tsx, čím spustí celý ten agentívny kolotoč (Router -> Agent -> Edit).


routerAgent.ts

    Cieľ: Rozhodnúť, aký druh úlohy používateľ zadal. Musí určiť, či chce používateľ text meniť (Edit), alebo sa v ňom len pohybovať (Navigate).

    Popis:

        Heuristika (Kľúčové slová): Najprv použije pole editKeywords. Ak v príkaze nájde slovo ako "napíš", "zmeň" alebo "vymaž", automaticky to vyhodnotí ako úpravu textu. Je to rýchle a 100 % spoľahlivé pre jasné príkazy.

        Delegovanie (Sub-agenti): Akonáhle určí typ akcie, nerieši ju sám, ale zavolá špecializovaného agenta

editAgent.ts

    Cieľ: Vykonať konkrétnu textovú transformáciu na úrovni jedného odseku. Existuje preto, aby izoloval logiku úpravy od navigácie a zabezpečil, že AI vráti čistý text, ktorý môžeš okamžite vložiť späť do aplikácie bez nutnosti manuálneho čistenia.

navigateAgent.ts

    Cieľ: Premeniť prirodzený jazyk (napr. "choď na koniec" alebo "vráť sa na začiatok") na konkrétny index odseku. Existuje preto, aby používateľ nemusel klikať myšou, ale mohol sa v dokumente pohybovať čisto hlasom.


langchainClient.ts

    Cieľ: Standardizovať komunikáciu s umelou inteligenciou. Existuje preto, aby si nemusel v každom agentovi znova riešiť konfiguráciu modelu a manuálne spracovávať odpovede z API.

    Popis:

        Konfigurácia modelu (getLCModel)


        Preklad správ (callLC):

            Premieňa obyčajné objekty na špeciálne triedy LangChainu: SystemMessage, HumanMessage, AIMessage.

            model.invoke(converted): Toto je ten moment, kedy dáta reálne opúšťajú prehliadač a putujú na servery OpenAI.