const checkbox = document.getElementById("tutorialcheck");
const res = document.getElementById("res")
const tutorialtext = `
Como faço o interpretador interpretar minha ficha?

é simples, Basta indentificar seus marcadores de HP, Fome e Sede, e antes de cada um deles escrever uma tag
Sua ficha deve ficar assim:

NÃO copie as observações abaixo para dentro da ficha.
As observações servem apenas para explicar o que cada número significa.

[VIDAVALUE] HP 100/100
[FOMEVALUE] Fome 100/100 1
Observação: o "1" após os valores de fome é o indice no qual sua fome desce, numero cujo qual pode mudar conforme seu personagem
[FOMETURNO] 0/5
Este acima determina em quantos turnos sua fome irá decair
[SEDEVALUE] Sede 100/100 1
Observação: o "1" após os valores de sede é o indice no qual sua sede desce, numero que pode mudar conforme seu personagem
[SEDETURNO] 0/4
Este acima determina em quantos turnos sua sede irá decair
[MANAVALUE] Mana: 100/100 -1
[MANATURNO] 0/5

        Como eu importo e exporto uma ficha?

        Basta utilizar os botões Importar e Exportar
        Importar: Basta escolher o arquivo do seu personagem (.rpg)
        Exportar: Basta escrever o nome de seu personagem e o sistema exportará para seu celular um arquivo no formato .rpg, você só pode
        acessa-lo neste site, e não se preocupe, estes arquivos são minúsculos, quando quiser importa-los basta utilizar o botão Importar`

checkbox.addEventListener('change', (event) => {
    if (event.target.checked) {
        res.innerHTML = tutorialtext;
        console.log("😎👍👍")
    } else {
        res.textContent = "o carai💥";
        console.log("FAAAAAAHHH");
    }
})


function processarStatus(
    linhas,
    tagValor,
    tagTurno,
    nomeStatus,
    mudancaPorCiclo,
    aoCompletarCiclo = null
) {

    let indiceValor = -1;

    // Procura a linha do valor
    for (let i = 0; i < linhas.length; i++) {
        if (linhas[i].startsWith(tagValor)) {
            indiceValor = i;
            break;
        }
    }

    // Sem a linha do status, não há o que processar
    if (indiceValor === -1) {
        return;
    }

    // Procura e processa o contador
    for (let i = 0; i < linhas.length; i++) {

        if (!linhas[i].startsWith(tagTurno)) {
            continue;
        }

        let numeros = linhas[i].match(/\d+/g);

        if (!numeros || numeros.length < 2) {
            continue;
        }

        let turnoAtual = Number(numeros[0]);
        let turnoMax = Number(numeros[1]);

        // Evita ciclos inválidos
        if (turnoMax <= 0) {
            continue;
        }

        turnoAtual++;

        if (turnoAtual >= turnoMax) {

            let numerosValor = linhas[indiceValor].match(/\d+/g);

            if (!numerosValor || numerosValor.length < 2) {
                continue;
            }

            let valorAtual = Number(numerosValor[0]);
            let valorMax = Number(numerosValor[1]);

            // Terceiro número = mudança por ciclo
            let quantidade = numerosValor.length >= 3
                ? Number(numerosValor[2])
                : Math.abs(mudancaPorCiclo);

            if (mudancaPorCiclo > 0) {
                valorAtual += quantidade;
            } else {
                valorAtual -= quantidade;
            }

            valorAtual = Math.max(
                0,
                Math.min(valorAtual, valorMax)
            );

            linhas[indiceValor] =
                `${tagValor} ${nomeStatus}: ${valorAtual}/${valorMax} ${quantidade}`;

            turnoAtual = 0;

            // Executa uma ação opcional quando o ciclo termina
            if (aoCompletarCiclo !== null) {
                aoCompletarCiclo(linhas);
            }
        }

        linhas[i] = `${tagTurno} ${turnoAtual}/${turnoMax}`;

        break;
    }
}

function processarEfeito(
    linhas,
    tagEfeito,
    tagValor,
    nomeValor,
    multiplicador
) {

    let indiceValor = -1;
    let indiceEfeito = -1;

    // procura as linhas importantes
    for (let i = 0; i < linhas.length; i++) {

        if (linhas[i].startsWith(tagValor)) {
            indiceValor = i;
        }

        if (linhas[i].startsWith(tagEfeito)) {
            indiceEfeito = i;
        }
    }

    if (indiceValor === -1 || indiceEfeito === -1) {
        return;
    }

    // [CURA] 5 3
    //        ^ ^
    //      valor turnos

    let numerosEfeito = linhas[indiceEfeito].match(/\d+/g);

    let valorEfeito = Number(numerosEfeito[0]);
    let turnos = Number(numerosEfeito[1]);

    let numerosValor = linhas[indiceValor].match(/\d+/g);

    let valorAtual = Number(numerosValor[0]);
    let valorMax = Number(numerosValor[1]);

    if (tipo === "porcentagem") {
    valor -= Math.ceil(valor * (alteracao / 100));
} else {
    valor += alteracao;
}

    valorAtual += valorEfeito * multiplicador;

    valorAtual = Math.max(0, Math.min(valorAtual, valorMax));

    linhas[indiceValor] =
        `${tagValor} ${nomeValor}: ${valorAtual}/${valorMax}`;

    turnos--;

    if (turnos <= 0) {
        linhas.splice(indiceEfeito, 1);
    }
    else {
        linhas[indiceEfeito] =
            `${tagEfeito} ${valorEfeito} ${turnos}`;
    }

}

function passarTurno() {

    let texto = document.getElementById("ficha").value;

    let linhas = texto.split("\n");

    // Regeneração natural: +1 HP a cada 5 turnos
    processarStatus(
        linhas,
        "[VIDAVALUE]",
        "[VIDATURNO]",
        "HP",
        1
    );

    // Fome: diminui conforme seu próprio ciclo
    processarStatus(
        linhas,
        "[FOMEVALUE]",
        "[FOMETURNO]",
        "Fome",
        -1
    );

    // Sede: diminui conforme seu ciclo.
    // Quando o ciclo termina, o Choque também diminui em 1.
    processarStatus(
        linhas,
        "[SEDEVALUE]",
        "[SEDETURNO]",
        "Sede",
        -1,
        function(linhas) {
            alterarStatus(
                linhas,
                "[CHOQUEVALUE]",
                -1
            );
        }
    );

    // Mana: recupera conforme seu próprio ciclo
    processarStatus(
        linhas,
        "[MANAVALUE]",
        "[MANATURNO]",
        "Mana",
        1
    );

    // Cura temporária
    processarEfeito(
        linhas,
        "[CURA]",
        "[VIDAVALUE]",
        "HP",
        1
    );

    // Veneno
    processarEfeito(
        linhas,
        "[VENENO]",
        "[VIDAVALUE]",
        "HP",
        -1
    );

    // Atualiza a ficha
    document.getElementById("ficha").value =
        linhas.join("\n");

    salvarFicha();
}

function alterarStatus(linhas, tagValor, quantidade) {

    for (let i = 0; i < linhas.length; i++) {

        if (linhas[i].startsWith(tagValor)) {

            let numeros = linhas[i].match(/\d+/g);

            let valorAtual = Number(numeros[0]);

            let valorMax = numeros.length > 1
                ? Number(numeros[1])
                : 100;

            valorAtual += quantidade;

            valorAtual = Math.max(0, valorAtual);
            valorAtual = Math.min(valorAtual, valorMax);

            let nomeStatus =
                linhas[i]
                .replace(tagValor, "")
                .split(":")[0]
                .trim();

            linhas[i] =
                `${tagValor} ${nomeStatus}: ${valorAtual}/${valorMax}`;
            salvarFicha();
            break;
        }
    }
}

function comer() {

    let texto = document.getElementById("ficha").value;

    let linhas = texto.split("\n");

    alterarStatus(
        linhas,
        "[FOMEVALUE]",
        -1
    );

    document.getElementById("ficha").value =
        linhas.join("\n");
        salvarFicha();
}

function beber() {
    
    let texto = document.getElementById("ficha").value;

    let linhas = texto.split("\n");

    alterarStatus(
        linhas,
        "[SEDEVALUE]",
        -1
    );

    document.getElementById("ficha").value =
        linhas.join("\n");
        salvarFicha();
}

function exportarFichaRPG(){

    let texto = document.getElementById("ficha").value;

    const nome = prompt("Nome do personagem:");

    if (nome === null) return;

    let blob = new Blob([texto], {
        type: "text/plain;charset=utf-8"
    });

    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = `${nome || "Personagem"}.rpg`;

    link.click();

    URL.revokeObjectURL(link.href);
salvarFicha();
}

function importarFicha(event){

    const arquivo = event.target.files[0];

    if(!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = function(e){

        document.getElementById("ficha").value =
            e.target.result;

    };

    leitor.readAsText(arquivo, "UTF-8");
salvarFicha();
}


function salvarFicha() {
    localStorage.setItem(
        "fichaRPG",
        document.getElementById("ficha").value
    );
}
window.addEventListener("DOMContentLoaded", () => {
    const ficha = document.getElementById("ficha");
    const fichaSalva = localStorage.getItem("fichaRPG");

    if (fichaSalva !== null) {
        ficha.value = fichaSalva;
    }
});