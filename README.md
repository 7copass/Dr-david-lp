# Dr. David Pires — Landing Page

Recriação do site **drdavidpires.com.br** com scroll suave e animações no scroll.

## Duas versões

Mesmo conteúdo, mesmas seções, mesmos links de WhatsApp — só a direção de arte muda.

| Versão | Arquivo | URL | Cara |
|---|---|---|---|
| **Editorial** | `index.html` | `/` | papel off-white + naval, serifa Fraunces, listas e filetes |
| **Clássica** | `classico.html` | `/classico.html` | naval sobre azul-claro, Plus Jakarta, cards e pílulas — estrutura da referência enviada |

Cada uma tem seu próprio CSS e JS (`assets/css/style.css` + `assets/js/main.js` para a
editorial; `assets/css/classico.css` + `assets/js/classico.js` para a clássica). As
imagens em `assets/img/` são compartilhadas. Mexer numa não afeta a outra.

Para trocar qual é a padrão, basta inverter os nomes dos dois HTML.

## Direção de arte — versão editorial

Partiu da referência enviada (template azul royal sobre azul claro) e foi reancorada
para fugir do visual de template:

| | |
|---|---|
| **Papel** | off-white quente `#faf8f4` / `#f2efe8`, moldura `#e3dfd5` — no lugar do azul-claro genérico |
| **Tinta** | naval da marca `#013356`; `#0a5c90` só como acento (itálicos, numerais, links) |
| **Display** | **Fraunces** variável (`SOFT 0 · WONK 0`), itálico com `WONK 1` nos trechos destacados |
| **Texto/UI** | **Plus Jakarta Sans** |
| **Forma** | raio grande só nos painéis (26px); cards 10px; fotos quase retas (4px) |
| **Profundidade** | fios de 1px em vez de sombra; sombra curta e seca só nos elementos flutuantes |
| **Textura** | grão SVG a 5,5% sobre a página inteira |
| **Marca** | logotipo oficial (joelho + serifa), extraído do fundo naval para PNG transparente |

Decisões que tiram a "cara de template": sobrancelhas em versalete com fio (não pílulas),
numerais serifados no lugar de ícones outline, bento assimétrico nas áreas de atuação
(card 01 em linha cheia), diferenciais e trajetória como colunas/listas editoriais com
filetes em vez de grid de cards iguais, e a foto real do consultório como faixa de
fechamento em vez de repetir o recorte do médico.

## Cor da marca

`#013356` é o naval da marca e vale para as duas versões — a clássica também o
adotou no lugar do azul royal `#1668ff` da referência, para bater com o logotipo.
Toda a escala (hovers, tints de fundo, gradientes, fios) é derivada dele; o único
tom fora da família é o verde `#25d366` do WhatsApp.

## Stack

Site estático, sem build. Basta servir a pasta.

| Lib | Para quê |
|---|---|
| [Lenis](https://lenis.darkroom.engineering/) 1.1.14 | scroll suave (inércia) |
| [GSAP](https://gsap.com/) 3.12.5 | timeline de animação |
| GSAP **ScrollTrigger** | reveals, stagger, parallax e scrub |

Tudo vem de CDN (jsDelivr / cdnjs) — nenhuma dependência instalada.
Fontes: **Fraunces** + **Plus Jakarta Sans** (Google Fonts).

## Estrutura

```
index.html                 versão editorial
classico.html              versão clássica (azul)

assets/css/style.css       design system da editorial
assets/css/classico.css    design system da clássica
assets/js/main.js          scroll e animações da editorial
assets/js/classico.js      scroll e animações da clássica

assets/img/logo-*.png      logotipo oficial recortado do fundo (dark p/ claro, light p/ escuro)
assets/img/dr-*.webp       ensaio profissional, recortado e otimizado (~55-75 KB cada)
assets/img/src/            JPG de origem dos recortes
assets/img/src/legacy/     imagens da primeira versão, substituídas
.claude/launch.json        config do servidor de desenvolvimento
```

## Rodar localmente

```bash
python3 -m http.server 4321
```

Depois abra http://localhost:4321 (editorial) e http://localhost:4321/classico.html (clássica)

## Animações implementadas (ambas as versões)

- **Scroll suave** com Lenis, sincronizado ao ticker do GSAP
- **Barra de progresso** de leitura no topo
- **Split text**: títulos entram palavra por palavra sob máscara, preservando os `<em>` em itálico
- **Reveal + stagger** nas listas e cards (ScrollTrigger)
- **Cortina** (`clip-path`) abrindo a foto do Sobre e **arco do hero** crescendo da base *(só na editorial)*
- **Brilho seguindo o mouse** nos cards de atuação *(só na clássica)*
- **Parallax** com `scrub` nas três fotos
- **Marquee infinito** com as instituições de formação
- **Card de contato** do hero com flutuação contínua (yoyo)
- **Botões magnéticos** discretos (16% de deslocamento)
- **Nav** ganha fundo fosco e filete ao rolar
- **Acordeão do FAQ** com altura animada e abertura exclusiva
- **FAB do WhatsApp** entra após 560px de scroll
- Tudo desligado em `prefers-reduced-motion: reduce`

## Decisões de conteúdo

A referência visual tem blocos de **depoimentos de pacientes**, **“2.5K reviews”** e
**“300+ especialistas”**. Esses blocos **não** foram reproduzidos: seriam números e
depoimentos inventados para um médico real — e a publicação de depoimentos de
pacientes em publicidade médica é vedada pelo CFM (Res. 1.974/2011).

No lugar deles entraram seções factuais, com conteúdo tirado do site atual:

- **Trajetória** — as seis instituições (SCMRP, PUCCAMP, SBCJ, CMC, Palmeiras, UEPA)
- **Perguntas frequentes** — agendamento, formato da consulta, endereço, casos atendidos

Todo o resto (posicionamento, bio, 4 áreas de atuação, 4 diferenciais, contato,
CRM/RQE) é o texto original do site.

## Deploy

Qualquer host estático. Na Vercel:

```bash
npx vercel --prod
```

Sem configuração: a raiz do projeto já é o output.

## Imagens

Logotipo oficial do médico, extraído do arquivo em fundo naval para dois PNG
transparentes: `logo-dark.png` (fundos claros) e `logo-light.png` (fundos escuros).

As fotos vêm do ensaio profissional (Nikon Z6 II, 15 fotos). Seleção:

| Uso | Origem | Por quê |
|---|---|---|
| Hero | `IMG_5085` | jaleco, sorriso aberto, pose 3/4 — a mais acolhedora do ensaio |
| Sobre | `IMG_5078` | sentado, inclinado à frente — lê como escuta, combina com "cuidado humanizado" |
| CTA | `IMG_5080` | camisa teal, olhar fora de câmera — troca de figurino, fecha a página sem repetir |

Na editorial o retrato vive dentro do arco; na clássica, dentro da forma orgânica azul.
Nenhuma das duas usa recorte em fundo chapado.

## Pontos de contato (iguais nas duas versões)

- WhatsApp: `https://wa.me/555391178239` — 7 ocorrências
- Telefone: `(53) 99117-8239`
- Endereço: Rio Med Saúde — Av. Marechal Rondon, 1649, Santa Clara
