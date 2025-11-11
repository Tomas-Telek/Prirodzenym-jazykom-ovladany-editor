\# Prirodzeným jazykom ovládaný editor



Tento projekt je webová stránka s JavaScriptovým editorom, ktorý umožňuje upravovať text pomocou prirodzeného jazyka a OpenAI API. Užívatelia môžu zadávať príkazy v slovenčine, ako napríklad doplniť, vymazať alebo preformulovať text, a editor podľa toho upraví konkrétny odsek.



---



\## Funkcie



\- Zvýraznenie aktuálneho odseku, ktorý sa upravuje.

\- Podpora prirodzeného jazyka pre príkazy, napr.:

&nbsp; - "napíš", "prepíš", "vymaž", "nahraď", "doplň", "odstráň", atď.

\- Presúvanie sa medzi odsekmi pomocou smerových príkazov, ako:

&nbsp; - "vyššie", "späť", "ďalší", "dopredu"

\- Integrácia s OpenAI API (GPT-4o) na úpravu textu podľa používateľských inštrukcií.

\- Zabezpečenie proti zadaniu HTML alebo skriptov v texte (`<script>` a iné HTML tagy nie sú povolené).



---



\## Štruktúra projektu



/web ← hlavný priečinok s kódom, ktorý beží na stránke

index.html ← HTML stránka editora

script.js ← JavaScript pre spracovanie príkazov a API volania

README.md ← tento súbor s popisom projektu





---



\## Použitie



1\. Otvorte `index.html` vo webovom prehliadači.

2\. Zadajte svoj OpenAI API kľúč do poľa "Zadaj svoj OpenAI API kľúč".

3\. Do textového poľa napíšte príkaz v prirodzenom jazyku.

4\. Kliknite na \*\*Submit\*\*.  

&nbsp;  - Ak je príkaz úpravou odseku, text sa upraví podľa inštrukcie.

&nbsp;  - Ak je príkaz presun na iný odsek, aktuálne zvýraznený odsek sa zmení.



---



\## Poznámky



\- Editor je určený len na testovanie a vzdelávacie účely.

\- Pre správne fungovanie je potrebný platný OpenAI API kľúč.

\- Nepodporuje zadávanie HTML alebo skriptov kvôli bezpečnosti.



---



\## Autor



\- Tomas Telek



