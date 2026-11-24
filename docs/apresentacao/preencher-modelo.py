# Preenche o modelo de apresentação da disciplina (8 slides, 7 minutos) com o conteúdo do Trilho.
# Uso: python preencher-modelo.py [caminho-do-modelo.pptx]
#   Modelo padrão: Desktop\apresentacao-extensao.pptx.  Saída: saida/Trilho-Apresentacao-modelo.pptx e saida/roteiro-fala-modelo.md
# Imagens: img/ (gere com assets.mjs e capturas.mjs); vídeo do slide 6: saida/demo-trilho-30s.mp4 (gere com demo30.mjs).
import copy
import os
import sys

from PIL import Image
from pptx import Presentation
from pptx.enum.dml import MSO_LINE, MSO_THEME_COLOR
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "img")
OUT = os.path.join(HERE, "saida")
TEMPLATE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.expanduser("~"), "Desktop", "apresentacao-extensao.pptx")
os.makedirs(OUT, exist_ok=True)

prs = Presentation(TEMPLATE)
S = list(prs.slides)


# ---------------------------------------------------------------- utilidades
def shape(slide, name):
    for sh in slide.shapes:
        if sh.name == name:
            return sh
    raise KeyError(name)


def set_par(par, text):
    """Troca o texto de um parágrafo mantendo a formatação do primeiro trecho."""
    runs = par.runs
    if runs:
        runs[0].text = text
        for extra in runs[1:]:
            extra._r.getparent().remove(extra._r)
    else:
        par.add_run().text = text


def set_par_br(par, lines):
    """Parágrafo com quebras de linha intencionais (<a:br/>), mantendo a formatação do primeiro trecho."""
    set_par(par, lines[0])
    last = par.runs[0]._r
    for line in lines[1:]:
        br = copy.deepcopy(last.getparent().makeelement(qn("a:br"), {}))
        rpr = last.find(qn("a:rPr"))
        if rpr is not None:
            br.append(copy.deepcopy(rpr))
        run = copy.deepcopy(par.runs[0]._r)
        last.addnext(br)
        br.addnext(run)
        run.find(qn("a:t")).text = line
        last = run


def set_lines(sh, lines):
    """Define os parágrafos de uma caixa de texto (clona o último se faltar, remove se sobrar)."""
    pars = sh.text_frame.paragraphs
    while len(pars) < len(lines):
        clone = copy.deepcopy(pars[-1]._p)
        pars[-1]._p.addnext(clone)
        pars = sh.text_frame.paragraphs
    while len(pars) > len(lines):
        pars[-1]._p.getparent().remove(pars[-1]._p)
        pars = sh.text_frame.paragraphs
    for par, line in zip(pars, lines):
        set_par(par, line)


def solid(sh):
    """Troca a borda tracejada de 'espaço reservado' por uma borda contínua."""
    sh.line.dash_style = MSO_LINE.SOLID


def clear(sh):
    for par in sh.text_frame.paragraphs:
        for run in par.runs:
            run.text = ""


def picture(slide, sh, path, alt, pad=0.12, valign="center"):
    """Insere a imagem dentro do quadro `sh`, sem distorcer (ajusta ao espaço) e centralizada."""
    clear(sh)
    solid(sh)
    w, h = Image.open(path).size
    box_w, box_h = sh.width - Inches(2 * pad), sh.height - Inches(2 * pad)
    scale = min(box_w / w, box_h / h)
    pw, ph = int(w * scale), int(h * scale)
    left = sh.left + (sh.width - pw) // 2
    top = sh.top + (sh.height - ph) // 2 if valign == "center" else sh.top + Inches(pad)
    pic = slide.shapes.add_picture(path, left, top, pw, ph)
    pic._element.nvPicPr.cNvPr.set("descr", alt)
    return pic


def textbox(slide, x, y, w, h, text, size=18, bold=False, color=None, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, name=None):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if name:
        tb.name = name
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.05)
    tf.margin_top = tf.margin_bottom = Inches(0.02)
    par = tf.paragraphs[0]
    par.alignment = align
    run = par.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.name = "Calibri"
    if color is not None:
        run.font.color.theme_color = color
    return tb


def notes(slide, who, seconds, text):
    slide.notes_slide.notes_text_frame.text = f"[{who} · {seconds} s]\n\n{text}"


# cores do próprio modelo (tema: azul-petróleo, laranja, fundo claro), para não divergir
TEAL = MSO_THEME_COLOR.ACCENT_1
ORANGE = MSO_THEME_COLOR.ACCENT_2
LIGHT = MSO_THEME_COLOR.BACKGROUND_2
WHITE = MSO_THEME_COLOR.BACKGROUND_1

# ---------------------------------------------------------------- slide 1: título e grupo
s = S[0]
set_lines(shape(s, "Text 0"), ["Trilho"])
tema = shape(s, "Tema")
tema.width = Inches(8.5)
tema.height = Inches(1.1)
set_lines(tema, ["Gestão de tarefas e times de desenvolvimento"])
grupo = shape(s, "Grupo")
grupo.top = Inches(4.65)
grupo.width = Inches(8.4)
set_lines(grupo, ["x", "x", "x"])
set_par_br(grupo.text_frame.paragraphs[0], ["Integrantes: Ana Luiza · Arthur Rodrigues · Giovanna Tamos", "Raphael Carneiro · Vitor Medina"])
set_par_br(grupo.text_frame.paragraphs[1], ["ADS – 5º período · Projeto de Extensão", "Profa. Karhyne Sousa Padilha de Assis"])
set_par(grupo.text_frame.paragraphs[2], "USCS · Novembro de 2026")
logo = shape(s, "Logo")
clear(logo)
lw = Inches(2.0)
pic = s.shapes.add_picture(os.path.join(IMG, "logo-trilho.png"), logo.left + (logo.width - lw) // 2, logo.top + (logo.height - lw) // 2, lw, lw)
pic._element.nvPicPr.cNvPr.set("descr", "Logo do Trilho: letra T branca sobre quadrado azul")

# ---------------------------------------------------------------- slide 2: proposta e origem da ideia
s = S[1]
set_lines(shape(s, "Texto 1"), ["Problema encontrado", "Sem visão geral, prioridade subjetiva, plano longe do código"])
set_lines(shape(s, "Texto 2"), ["Público atendido", "Nexus Advanced Analytics: 4 times técnicos de desenvolvimento"])
set_lines(shape(s, "Texto 3"), ["Como surgiu a ideia", "Pesquisa de campo com 18 empresas e a necessidade da Nexus"])
set_lines(
    shape(s, "Objetivo"),
    ["Objetivo", "O sistema organiza tarefas e times de desenvolvimento para a Nexus, resolvendo a falta de visão geral e de critério de prioridade."],
)

# ---------------------------------------------------------------- slide 3: requisitos
s = S[2]
set_lines(
    shape(s, "Lista RF"),
    [
        "RF1: gerenciar tarefas no Kanban",
        "RF2: dashboard consolidado dos times",
        "RF3: sugerir prioridade por prazo e carga",
        "RF4: atualizar tarefas por commits e PRs",
    ],
)
set_lines(shape(s, "Lista RNF"), ["RNF1: seguro (senhas com hash)", "RNF2: acessível pelo celular"])
# mini diagrama de casos de uso no lugar do quadro tracejado
box = shape(s, "Diagrama casos de uso")
clear(box)
box.line.fill.background()  # sem borda tracejada: vira cartão como os demais
box.fill.solid()
box.fill.fore_color.theme_color = LIGHT
textbox(s, 7.4, 4.42, 5.0, 0.4, "Casos de uso", size=18, bold=True, color=TEAL, name="Titulo casos de uso")
rows = [("Membro", "Mover tarefas", 5.0), ("Líder", "Conectar Git", 5.55), ("Administrador", "Gerenciar usuários", 6.1)]
for actor, case, cy in rows:
    chip = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.35), Inches(cy - 0.22), Inches(1.7), Inches(0.44))
    chip.name = f"Ator {actor}"
    chip.fill.solid()
    chip.fill.fore_color.theme_color = TEAL
    chip.line.fill.background()
    chip.shadow.inherit = False
    tf = chip.text_frame
    tf.margin_left = tf.margin_right = Inches(0.04)
    tf.margin_top = tf.margin_bottom = 0
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    r = tf.paragraphs[0].add_run()
    r.text = actor
    r.font.size, r.font.bold, r.font.name = Pt(18), True, "Calibri"
    r.font.color.theme_color = WHITE
    oval = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9.5), Inches(cy - 0.24), Inches(3.05), Inches(0.48))
    oval.name = f"Caso de uso {case}"
    oval.fill.solid()
    oval.fill.fore_color.theme_color = WHITE
    oval.line.color.theme_color = TEAL
    oval.line.width = Pt(1.5)
    oval.shadow.inherit = False
    tf = oval.text_frame
    tf.word_wrap = False
    tf.margin_left = tf.margin_right = Inches(0.02)
    tf.margin_top = tf.margin_bottom = 0
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    r = tf.paragraphs[0].add_run()
    r.text = case
    r.font.size, r.font.name = Pt(18), "Calibri"
    r.font.color.theme_color = TEAL
    line = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(9.05), Inches(cy), Inches(9.5), Inches(cy))
    line.name = f"Associação {actor}"
    line.line.color.theme_color = TEAL
    line.line.width = Pt(1.5)

# ---------------------------------------------------------------- slide 4: arquitetura e tecnologias
s = S[3]
set_lines(shape(s, "Camada 1"), ["Front-end", "Next.js 16 + React 19"])
set_lines(shape(s, "Camada 2"), ["Back-end", ".NET 8 em camadas"])
set_lines(shape(s, "Camada 3"), ["Banco de dados", "MySQL 8"])
techs = [("nextjs", "Next.js"), ("react", "React"), ("dotnet", ".NET 8"), ("mysql", "MySQL"), ("docker", "Docker"), ("actions", "Actions")]
slots = [shape(s, f"Logo tec {i}") for i in range(1, 5)]
for extra in range(2):  # o modelo traz 4 quadros; clonamos mais 2 para Docker e GitHub Actions
    clone = copy.deepcopy(slots[0]._element)
    clone.nvSpPr.cNvPr.set("id", str(max(int(x.get("id")) for x in s.shapes._spTree.iter() if x.tag.endswith("}cNvPr")) + 1))
    slots[-1]._element.addnext(clone)
    slots = [sh for sh in s.shapes if sh.name.startswith("Logo tec")]
for i, (sh, (key, label)) in enumerate(zip(slots, techs), start=1):
    sh.name = f"Logo tec {i}"
    sh.left, sh.top, sh.width, sh.height = Inches(1.0 + (i - 1) * 1.85), Inches(4.55), Inches(1.6), Inches(0.95)
    clear(sh)
    solid(sh)
    p = Image.open(os.path.join(IMG, f"tec-{key}.png")).size
    side = Inches(0.62)
    pic = s.shapes.add_picture(os.path.join(IMG, f"tec-{key}.png"), sh.left + (sh.width - side) // 2, sh.top + (sh.height - side) // 2, side, side)
    pic._element.nvPicPr.cNvPr.set("descr", f"Logo {label}")
    textbox(s, 1.0 + (i - 1) * 1.85, 5.52, 1.6, 0.36, label, size=18, color=TEAL, align=PP_ALIGN.CENTER, name=f"Nome tec {i}")
host = shape(s, "Hospedagem")
host.top = Inches(5.95)
set_lines(host, ["Hospedagem: roda localmente (Docker); publicação em servidor é o próximo passo"])

# ---------------------------------------------------------------- slide 5: telas principais
s = S[4]
prints = [
    ("Print 1", "Legenda 1", "dashboard.png", "Tela 1: Dashboard dos times", "Dashboard consolidado com tarefas ativas, atrasadas e carga por time"),
    ("Print 2", "Legenda 2", "kanban.png", "Tela 2: Quadro Kanban", "Quadro Kanban do Time Backend com as colunas Backlog, A fazer e Em andamento"),
    ("Print 3", "Legenda 3", "priorizacao.png", "Tela 3: Prioridade sugerida", "Tela de priorização com a ordem sugerida das tarefas e o motivo de cada uma"),
]
for pname, lname, file, caption, alt in prints:
    picture(s, shape(s, pname), os.path.join(IMG, file), alt)
    set_lines(shape(s, lname), [caption])

# ---------------------------------------------------------------- slide 6: demonstração
s = S[5]
frame = shape(s, "Video demo")
clear(frame)
solid(frame)
vid_w = frame.width - Inches(0.2)
vid_h = int(vid_w * 9 / 16)
movie = s.shapes.add_movie(
    os.path.join(OUT, "demo-trilho-30s.mp4"),
    frame.left + Inches(0.1),
    frame.top + (frame.height - vid_h) // 2,
    vid_w,
    vid_h,
    poster_frame_image=os.path.join(OUT, "demo-poster.png"),
    mime_type="video/mp4",
)
movie.name = "Vídeo de demonstração"
movie._element.nvPicPr.cNvPr.set("descr", "Vídeo curto do sistema: arrastar uma tarefa, abrir o detalhe, criar tarefa e ver a priorização")
set_lines(shape(s, "Lista Recursos"), ["Painel administrativo", "Convite de usuários por e-mail", "Notificações de prazo", "Uso no celular"])

# ---------------------------------------------------------------- slide 7: resultados e trabalhos futuros
s = S[6]
set_lines(shape(s, "Numero 1"), ["8"])
set_lines(shape(s, "Rotulo 1"), ["requisitos funcionais entregues"])
set_lines(shape(s, "Numero 2"), ["333"])
set_lines(shape(s, "Rotulo 2"), ["testes automatizados passando"])
set_lines(shape(s, "Feedback"), ["Validação: pesquisa com 18 empresas confirmou o problema."])
set_lines(shape(s, "Futuro 1"), ["Publicar o sistema no ar, com HTTPS"])
set_lines(shape(s, "Futuro 2"), ["Priorização com aprendizado de máquina"])
set_lines(shape(s, "Futuro 3"), ["Colunas do Kanban personalizáveis"])

# ---------------------------------------------------------------- slide 8: conclusão
s = S[7]
set_lines(shape(s, "Item 1"), ["Contribuição para a comunidade", "Times da Nexus com visão única e prioridade clara"])
set_lines(shape(s, "Item 2"), ["Aprendizados do grupo", "Camadas, testes automatizados e trabalho em equipe"])
set_lines(shape(s, "Item 3"), ["Agradecimentos", "Professora Karhyne, colegas e Nexus Advanced Analytics"])
qr = shape(s, "QR code")
clear(qr)
side = Inches(2.6)
pic = s.shapes.add_picture(os.path.join(IMG, "qr-repositorio.png"), qr.left + (qr.width - side) // 2, qr.top + (qr.height - side) // 2, side, side)
pic._element.nvPicPr.cNvPr.set("descr", "QR code do repositório github.com/USCS-ADS/trilho")
contato = shape(s, "Contato")
contato.left, contato.width = Inches(8.55), Inches(4.7)
set_lines(contato, ["Repositório no GitHub", "github.com/USCS-ADS/trilho"])

# ---------------------------------------------------------------- anotações do orador (fala de cada slide)
FALAS = [
    ("Ana Luiza", 20,
     "Olá, professora e colegas. Somos o grupo do Trilho, um sistema de gestão de tarefas e times de desenvolvimento, nosso trabalho de extensão do curso de ADS na USCS. "
     "Eu sou a Ana Luiza e, junto com o Arthur, a Giovanna, o Raphael e o Vitor, vamos apresentar o sistema em sete minutos."),
    ("Ana Luiza", 50,
     "O Trilho nasceu de um problema real da Nexus Advanced Analytics, uma empresa de tecnologia que cresceu para quatro times técnicos sem uma ferramenta própria de planejamento. "
     "Uma pesquisa de campo com dezoito empresas confirmou o problema: ninguém tem visão geral da carga de cada time, a prioridade das tarefas é subjetiva e o planejamento fica longe do código. "
     "O público atendido são os times de desenvolvimento da Nexus. Por isso, o objetivo do sistema é organizar tarefas e times de desenvolvimento, dando visão geral, critério de prioridade e ligação com o código."),
    ("Arthur Rodrigues", 50,
     "Partindo da especificação aprovada, escolhemos quatro requisitos funcionais principais. Primeiro, gerenciar as tarefas em um quadro Kanban. Segundo, um dashboard que consolida todos os times. "
     "Terceiro, a sugestão de prioridade a partir do prazo e da carga de cada pessoa. E quarto, a integração com GitHub e GitLab, que atualiza as tarefas a partir de commits e pull requests. "
     "Entre os requisitos não funcionais, o sistema é seguro, com senhas protegidas por hash, e pode ser usado pelo celular. "
     "No diagrama, o membro move tarefas, o líder conecta repositórios Git e o administrador gerencia usuários e times."),
    ("Raphael Carneiro", 50,
     "A arquitetura tem três partes. O front-end é Next.js com React, e só o servidor do Next conversa com a API. "
     "O back-end é uma API em .NET 8, organizada em camadas: controladores, casos de uso, domínio e infraestrutura. E os dados ficam em um banco MySQL 8. "
     "Usamos Docker para empacotar o sistema e o GitHub Actions para rodar o build e os testes a cada alteração. "
     "As regras de negócio ficam no back-end, e cada perfil só acessa o que tem permissão. "
     "Sobre a hospedagem: hoje o sistema roda localmente, e publicá-lo em um servidor é o nosso próximo passo."),
    ("Giovanna Tamos", 60,
     "Este é o fluxo principal. Na primeira tela, o dashboard consolidado mostra as tarefas ativas, atrasadas e concluídas e a carga de cada time. "
     "Na segunda, o quadro Kanban do time, com as colunas de Backlog até Concluído: as tarefas são arrastadas entre as colunas e dá para filtrar por responsável e prioridade, e cada cartão mostra a prioridade, o responsável e se a tarefa está atrasada. "
     "Na terceira, a tela de priorização, que ordena as tarefas do time pela prioridade sugerida e explica o motivo de cada uma; a decisão final continua com o líder. "
     "Por dentro de cada tarefa há prazo, subtarefas, comentários e histórico. E quando um pull request é aberto, a tarefa vai sozinha para Em revisão, e no merge ela vai para Concluído."),
    ("Giovanna Tamos", 60,
     "Neste vídeo curto, gravado no sistema real, a gente arrasta uma tarefa entre as colunas, abre o detalhe de uma tarefa ligada ao Git, começa a criar uma nova e vê a tela de priorização, que ordena as tarefas e explica o motivo de cada sugestão. "
     "Além disso, o painel administrativo permite convidar usuários por e-mail ou criar a conta direto. Há notificações quando o prazo se aproxima e o sistema também funciona bem no celular. "
     "[Plano B, se o vídeo não tocar: seguir falando com os prints do slide anterior. O arquivo demo-trilho-30s.mp4 está salvo junto da apresentação.]"),
    ("Vitor Medina", 60,
     "Em resultados: entregamos os oito requisitos funcionais da especificação, com os ajustes que explicamos no relatório, e o sistema passa em trezentos e trinta e três testes automatizados: "
     "duzentos e cinquenta e três no backend, quarenta e um unitários no front-end e trinta e nove de ponta a ponta, com verificação de acessibilidade. "
     "A pesquisa com dezoito empresas confirmou o problema que resolvemos. "
     "Como trabalhos futuros, queremos publicar o sistema no ar com HTTPS, evoluir a priorização para um modelo de aprendizado de máquina com o histórico das tarefas e permitir que o líder personalize as colunas do Kanban. "
     "Os testes rodam automaticamente a cada alteração no GitHub. Também falta testar o envio real de e-mails e validar o webhook com um repositório real."),
    ("Vitor Medina", 40,
     "Para fechar: a nossa contribuição é dar aos times da Nexus uma visão única do trabalho e um critério claro de prioridade, com o planejamento ligado ao código. "
     "Aprendemos a organizar um sistema em camadas, a testar de forma automatizada e a trabalhar em equipe, levando um problema real até um sistema funcionando. "
     "Agradecemos à professora Karhyne, aos colegas e à Nexus Advanced Analytics. O código está disponível no QR code, no GitHub. Muito obrigado!"),
]
lines = ["# Trilho — roteiro de fala (modelo da disciplina, 7 minutos)", ""]
total_words = 0
clock = 0
for i, (who, secs, text) in enumerate(FALAS):
    notes(S[i], who, secs, text)
    words = len(text.split())
    total_words += words
    lines += [f"## Slide {i + 1} · {who} · {clock // 60}:{clock % 60:02d} (previsto {secs} s, {words} palavras)", "", text, ""]
    clock += secs
open(os.path.join(OUT, "roteiro-fala-modelo.md"), "w", encoding="utf-8").write("\n".join(lines))

dest = os.path.join(OUT, "Trilho-Apresentacao-modelo.pptx")
prs.save(dest)
print(f"salvo: {dest}")
print(f"palavras: {total_words} (~{total_words / 135:.1f} min a 135 palavras/min); tempo previsto do modelo: {sum(f[1] for f in FALAS)} s")
