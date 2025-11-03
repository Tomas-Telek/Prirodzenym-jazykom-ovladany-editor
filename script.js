const form = document.getElementById('form');
const mytextInput = document.getElementById('mytext');
const editor = document.getElementById('editor');
const paragraphs = editor.querySelectorAll('div');

function highlightParagraph(index) {
    paragraphs.forEach((p, i) => {
        p.classList.toggle('highlight', i === index);
    });
}

let currentIndex = 10;
const editKeywords = [
    'napíš', 'napis', 'prepíš', 'prepis', 'vymaž', 'vymaz',
    'nahraď', 'nahrad', 'zmeň', 'zmen', 'uprav', 'pridaj',
    'doplň', 'dopln', 'odstráň', 'odstran', 'preformuluj',
    'rozšír', 'rozsir', 'vymeň', 'vymen', 'dopíš', 'dopis', 
    'vynechaj', 'vlož', 'vloz'
];
highlightParagraph(currentIndex);


const apiKeyInput = document.getElementById('apiKey');


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mytext = mytextInput.value.trim();
    if (/<script|<.*?>/.test(mytext)) {
        alert("HTML alebo skripty nie sú povolené.");
        return;
    }



    if (mytext) {
        const shouldEdit = editKeywords.some(keyword => mytext.toLowerCase().includes(keyword));


        const requestBody = shouldEdit
            ? {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Si asistent, ktorý upravuje text jedného odseku na základe zadania používateľa.
                                    Tvoja úloha je presne vykonať zmenu podľa inštrukcie – doplniť, odstrániť alebo
                                    nahradiť vetu alebo slovo – bez zmeny iného obsahu. **Vety začínajú veľkým
                                    písmenom a končia bodkou.** Postupuj krok za krokom nasledovne:
                                    1. Najprv identifikuj vetu alebo presné miesto v texte, ktorého sa požiadavka
                                    týka, tak že zo začiatku pozeráš pri každej vete na jej presný začiatok a koniec.
                                    2. Pozorne si pozri, kde začína a kde končí celá veta.
                                    3.Urči, čo máš s danou vetou alebo slovom urobiť – či ju doplniť, vymazať alebo
                                    nahradiť.
                                    4. Vykonaj zmenu tak, aby štruktúra textu zostala gramaticky správna a logicky
                                    nadväzovala.
                                    5. Zachovaj formátovanie: každá veta začína veľkým písmenom a končí bodkou.
                                    **Nepridávaj žiadne komentáre, úvodzovky.** Výstupom je len čistý, opravený text
                                    celého odseku.`
                    },
                    {
                        role: 'user',
                        content: `Odstavec: ${paragraphs[currentIndex].innerText}. Inštrukcia: ${mytext}`
                    }
                ]
            }
            : {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Momentálne sa nachádzaš na odseku číslo ${currentIndex + 1} z celkových ${paragraphs.length}. 
                        Používateľ ti prirodzeným jazykom povie, na ktorý odsek sa chce presunúť. 
                        Ak požiadavka obsahuje smerové výrazy ako „vyššie“, „späť“, „predchádzajúci“, interpretuj ich ako presun na predchádzajúci odsek (číselne zníž aktuálny index o 1). 
                        Ak obsahuje výrazy ako „nižšie“, „ďalší“, „dopredu“, interpretuj ich ako presun na nasledujúci odsek (číselne zvýš aktuálny index o 1).
                        Tvoja úloha je odpovedať výhradne jedným celým číslom od 1 do ${paragraphs.length}, ktoré reprezentuje cieľový odsek. 
                        Nikdy neprekroč rozsah 1 až ${paragraphs.length} a nevypisuj nič iné.`
                    },
                    {
                        role: 'user',
                        content: mytext
                    }
                ]
            };




        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeyInput.value.trim()}`,
                    
                },
                body: JSON.stringify({
                    ...requestBody,
                    temperature: 0,
                    top_p: 1,
                    n: 1,
                }),
            });
            apiKeyInput.value = "";
            if (response.ok) {
                const data = await response.json();
                const result = data.choices[0].message.content.trim();
                console.log("Odpoveď od API:", result);

                if (shouldEdit) {
                    paragraphs[currentIndex].textContent = result;
                } else {
                    const index = parseInt(result, 10) - 1;
                    if (!isNaN(index) && index >= 0 && index < paragraphs.length) {
                        currentIndex = index;
                        highlightParagraph(currentIndex);
                    } else {
                        console.warn('AI vrátil neplatný index odseku:', result);
                    }
                }

                mytextInput.value = '';


            } else {
                console.log('Error: Unable to process your request.1');
            }
        } catch (error) {
            console.error(error);
            console.log('Error: Unable to process your request.2');
        }
    }
});