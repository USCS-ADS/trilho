# Preenche o modelo de apresentação da disciplina (8 slides, 7 minutos) com o conteúdo do Trilho, baseado na especificação
# (Relatorio_Final_PIM_III_-_Trilho.docx) e no que o software já tem (páginas, casos de uso, telas).
# Uso: python preencher-modelo.py [caminho-do-modelo.pptx]
#   Modelo padrão: Desktop\Faculdade\4-semestre\Pim\apresentacao-extensao.pptx.
#   Saída: saida/Trilho-Apresentacao-modelo.pptx e saida/roteiro-fala-modelo.md
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
from pptx.util import Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "img")
OUT = os.path.join(HERE, "saida")
DEFAULT_TEMPLATE = os.path.join(os.path.expanduser("~"), "Desktop", "Faculdade", "4-semestre", "Pim", "apresentacao-extensao.pptx")
TEMPLATE = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_TEMPLATE
os.makedirs(OUT, exist_ok=True)

prs = Presentation(TEMPLATE)
S = list(prs.slides)

# cores do próprio modelo (tema: azul-petróleo, laranja, fundo claro)
TEAL = MSO_THEME_COLOR.ACCENT_1
ORANGE = MSO_THEME_COLOR.ACCENT_2
LIGHT = MSO_THEME_COLOR.BACKGROUND_2
WHITE = MSO_THEME_COLOR.BACKGROUND_1


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
        pars[-1]._p.addnext(copy.deepcopy(pars[-1]._p))
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


def picture(slide, sh, path, alt, pad=0.12):
    """Insere a imagem dentro do quadro `sh`, sem distorcer (ajusta ao espaço) e centralizada."""
    clear(sh)
    solid(sh)
    w, h = Image.open(path).size
    scale = min((sh.width - Inches(2 * pad)) / w, (sh.height - Inches(2 * pad)) / h)
    pw, ph = int(w * scale), int(h * scale)
    pic = slide.shapes.add_picture(path, sh.left + (sh.width - pw) // 2, sh.top + (sh.height - ph) // 2, pw, ph)
    pic._element.nvPicPr.cNvPr.set("descr", alt)
    return pic


def textbox(slide, x, y, w, h, paragraphs, size=18, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, name=None, space_after=0):
    """Caixa de texto. `paragraphs`: texto simples ou lista de parágrafos; cada parágrafo é texto ou lista de (texto, negrito, cor)."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if name:
        tb.name = name
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.05)
    tf.margin_top = tf.margin_bottom = Inches(0.02)
    if isinstance(paragraphs, str):
        paragraphs = [paragraphs]
    for i, content in enumerate(paragraphs):
        par = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        par.alignment = align
        par.space_after = Pt(space_after)
        parts = [(content, False, None)] if isinstance(content, str) else content
        for text, bold, color in parts:
            run = par.add_run()
            run.text = text
            run.font.size = Pt(size)
            run.font.bold = bold
            run.font.name = "Calibri"
            if color is not None:
                run.font.color.theme_color = color
    return tb


# ---------------------------------------------------------------- slide 1: título e grupo
s = S[0]
set_lines(shape(s, "Text 0"), ["Trilho"])
tema = shape(s, "Tema")
tema.width, tema.height = Inches(8.5), Inches(1.1)
set_lines(tema, ["Gestão inteligente de times e projeto de desenvolvimento"])
grupo = shape(s, "Grupo")
grupo.top, grupo.width = Inches(4.65), Inches(8.4)
set_lines(grupo, ["x", "x", "x"])
set_par_br(grupo.text_frame.paragraphs[0], ["Integrantes: Ana Luiza Lourenço · Arthur Rodrigues · Giovanna Tamos", "Raphael Carneiro · Vitor Medina"])
set_par_br(grupo.text_frame.paragraphs[1], ["ADS – 5º período · Projeto de Extensão / PIM", "Profa. Karhyne Sousa Padilha de Assis"])
set_par(grupo.text_frame.paragraphs[2], "USCS · Novembro de 2026")
logo = shape(s, "Logo")
clear(logo)
lw = Inches(2.0)
pic = s.shapes.add_picture(os.path.join(IMG, "logo-trilho.png"), logo.left + (logo.width - lw) // 2, logo.top + (logo.height - lw) // 2, lw, lw)
pic._element.nvPicPr.cNvPr.set("descr", "Logo do Trilho: letra T branca sobre quadrado azul")

# ---------------------------------------------------------------- slide 2: proposta e origem da ideia (cap. 1, 2 e 3)
s = S[1]
set_lines(shape(s, "Texto 1"), ["Problema encontrado", "Planilhas e quadros soltos: sem visão única, prioridade subjetiva, longe do código"])
set_lines(shape(s, "Texto 2"), ["Público atendido", "Nexus Advanced Analytics: 4 times técnicos e a liderança (Head de Engenharia)"])
set_lines(shape(s, "Texto 3"), ["Como surgiu a ideia", "Dor da Nexus (Double Diamond), confirmada em pesquisa com 18 empresas"])
set_lines(shape(s, "Objetivo"), ["Objetivo", "O Trilho centraliza times, tarefas e código da Nexus, resolvendo a falta de visão geral e a prioridade subjetiva."])
textbox(
    s, 9.05, 4.85, 3.45, 1.65,
    [
        [("Pesquisa com 18 empresas", True, ORANGE)],
        [("83% ", True, ORANGE), ("sem visão da carga", False, WHITE)],
        [("72% ", True, ORANGE), ("prioridade subjetiva", False, WHITE)],
        [("67% ", True, ORANGE), ("plano fora do código", False, WHITE)],
    ],
    size=18, name="Dados da pesquisa",
)

# ---------------------------------------------------------------- slide 3: requisitos (cap. 6.1 e 6.3)
s = S[2]
set_lines(shape(s, "Lista RF"), ["RF05: quadro Kanban por time", "RF06: Git atualiza a tarefa", "RF07: prioridade sugerida com IA", "RF08: dashboard e notificações"])
textbox(s, 1.0, 5.3, 5.6, 0.75, "Base: RF01 a RF04 (usuários, times, tarefas e subtarefas)", size=18, name="Base RF01-RF04")
set_lines(shape(s, "Lista RNF"), ["RNF01: segurança (bcrypt e JWT)", "RNF04: responsivo (mobile-first)"])
box = shape(s, "Diagrama casos de uso")
clear(box)
box.line.fill.background()  # sem borda tracejada: vira cartão como os demais
box.fill.solid()
box.fill.fore_color.theme_color = LIGHT
textbox(s, 7.4, 4.42, 5.1, 0.4, [[("Casos de uso (13 especificados)", True, TEAL)]], size=18, name="Titulo casos de uso")
rows = [("Membro", "UC05 Mover tarefa", 5.0), ("Líder", "UC10 Vincular a PR", 5.55), ("Administrador", "UC12 Dashboard", 6.1)]
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

# ---------------------------------------------------------------- slide 4: arquitetura e tecnologias (cap. 5, 6.2 e 7.1)
s = S[3]
set_lines(shape(s, "Camada 1"), ["Front-end", "Next.js 16 · 13 páginas"])
set_lines(shape(s, "Camada 2"), ["Back-end", ".NET 8 · 56 casos de uso"])
set_lines(shape(s, "Camada 3"), ["Banco de dados", "MySQL 8 · 12 tabelas"])
techs = [("nextjs", "Next.js"), ("react", "React"), ("typescript", "TypeScript"), ("tailwind", "Tailwind"), ("dotnet", ".NET 8"), ("mysql", "MySQL"), ("docker", "Docker")]
slots = [shape(s, f"Logo tec {i}") for i in range(1, 5)]
for _ in range(len(techs) - 4):  # o modelo traz 4 quadros; clonamos os que faltam
    clone = copy.deepcopy(slots[0]._element)
    clone.nvSpPr.cNvPr.set("id", str(max(int(x.get("id")) for x in s.shapes._spTree.iter() if x.tag.endswith("}cNvPr")) + 1))
    slots[-1]._element.addnext(clone)
    slots = [sh for sh in s.shapes if sh.name.startswith("Logo tec")]
for i, (sh, (key, label)) in enumerate(zip(slots, techs), start=1):
    sh.name = f"Logo tec {i}"
    sh.left, sh.top, sh.width, sh.height = Inches(1.0 + (i - 1) * 1.55), Inches(4.55), Inches(1.35), Inches(0.95)
    clear(sh)
    solid(sh)
    side = Inches(0.62)
    pic = s.shapes.add_picture(os.path.join(IMG, f"tec-{key}.png"), sh.left + (sh.width - side) // 2, sh.top + (sh.height - side) // 2, side, side)
    pic._element.nvPicPr.cNvPr.set("descr", f"Logo {label}")
    textbox(s, 1.0 + (i - 1) * 1.55, 5.52, 1.35, 0.36, [[(label, False, TEAL)]], size=18, align=PP_ALIGN.CENTER, name=f"Nome tec {i}")
host = shape(s, "Hospedagem")
host.top = Inches(5.95)
set_lines(host, ["Hospedagem prevista: VPS Linux (IaaS) com Docker; hoje roda localmente"])

# ---------------------------------------------------------------- slide 5: telas principais (cap. 7.3)
s = S[4]
prints = [
    ("Print 1", "Legenda 1", "dashboard.png", "Tela 1: Dashboard (UC12)", "Dashboard consolidado com tarefas ativas, atrasadas e carga por time"),
    ("Print 2", "Legenda 2", "kanban.png", "Tela 2: Quadro Kanban (UC05)", "Quadro Kanban do Time Backend com as colunas Backlog, A fazer e Em andamento"),
    ("Print 3", "Legenda 3", "tarefa-git.png", "Tela 3: Tarefa ligada ao PR (UC10)", "Detalhe da tarefa com a prioridade sugerida pela IA e o pull request ligado"),
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
movie._element.nvPicPr.cNvPr.set("descr", "Vídeo curto do sistema: arrastar uma tarefa, abrir o detalhe com Git, criar tarefa e ver a priorização")
set_lines(shape(s, "Lista Recursos"), ["Painel administrativo", "Integrações GitHub e GitLab", "Notificações de prazo", "Uso no celular"])

# ---------------------------------------------------------------- slide 7: resultados e trabalhos futuros (cap. 7.6, 7.7 e 2.1)
s = S[6]
set_lines(shape(s, "Numero 1"), ["8"])
set_lines(shape(s, "Rotulo 1"), ["requisitos funcionais entregues"])
set_lines(shape(s, "Numero 2"), ["319"])
set_lines(shape(s, "Rotulo 2"), ["testes automatizados"])
set_lines(shape(s, "Feedback"), ["Pesquisa de campo: 89% de 18 empresas têm interesse em IA + Git."])
set_lines(shape(s, "Futuro 1"), ["Publicar no ar (VPS, HTTPS)"])
set_lines(shape(s, "Futuro 2"), ["Priorização com aprendizado de máquina"])
set_lines(shape(s, "Futuro 3"), ["Colunas do Kanban personalizáveis"])

# ---------------------------------------------------------------- slide 8: conclusão
s = S[7]
set_lines(shape(s, "Item 1"), ["Contribuição para a comunidade", "Nexus com visão única e prioridade objetiva"])
set_lines(shape(s, "Item 2"), ["Aprendizados do grupo", "Double Diamond, SOLID e testes automatizados"])
set_lines(shape(s, "Item 3"), ["Agradecimentos", "Profa. Karhyne, Nexus e 18 empresas entrevistadas"])
qr = shape(s, "QR code")
clear(qr)
side = Inches(2.6)
pic = s.shapes.add_picture(os.path.join(IMG, "qr-repositorio.png"), qr.left + (qr.width - side) // 2, qr.top + (qr.height - side) // 2, side, side)
pic._element.nvPicPr.cNvPr.set("descr", "QR code do repositório github.com/USCS-ADS/trilho")
contato = shape(s, "Contato")
contato.left, contato.width = Inches(8.55), Inches(4.7)
set_lines(contato, ["Repositório no GitHub", "github.com/USCS-ADS/trilho"])

# ---------------------------------------------------------------- anotações do orador (fala de cada slide)
# Divisão segue o Apêndice B do relatório: Giovanna (pesquisa), Raphael (requisitos e casos de uso), Vitor (arquitetura),
# Ana (protótipos e telas) e Arthur (redação do relatório e fechamento).
FALAS = [
    ("Giovanna Tamos", 20,
     "Olá, professora e colegas. Somos o grupo do Trilho: Ana Luiza, Arthur, Giovanna, Raphael e Vitor, do curso de Análise e Desenvolvimento de Sistemas da USCS. "
     "Nosso trabalho de extensão é uma plataforma de gestão inteligente de times e projetos de desenvolvimento, e vamos apresentá-la em sete minutos."),
    ("Giovanna Tamos", 50,
     "A Nexus Advanced Analytics é uma empresa de tecnologia e análise de dados que cresceu rápido e hoje tem quatro times: Dados, Machine Learning, Backend e Frontend. "
     "Só que o planejamento continua em planilhas, quadros pessoais e grupos de mensagens, sem nenhuma ligação com o código. "
     "Aplicamos o Double Diamond e fizemos uma pesquisa de campo com dezoito empresas da região do ABC e da capital: oitenta e três por cento relatam falta de visibilidade da carga entre os times, "
     "setenta e dois por cento, prioridade subjetiva, e sessenta e sete por cento, planejamento desalinhado do código. "
     "O objetivo do Trilho é centralizar times, tarefas e código para a Nexus, resolvendo esses problemas."),
    ("Raphael Carneiro", 50,
     "Levantamos oito requisitos funcionais. Os quatro principais são: o quadro Kanban por time; a integração com Git, que atualiza a tarefa quando o pull request é aberto ou mesclado; "
     "a prioridade sugerida, com justificativa; e o dashboard com notificações de prazo. A base são os usuários, com três perfis, os times, as tarefas e as subtarefas. "
     "Entre os não funcionais, destaco a segurança, com senhas em bcrypt e autenticação por JWT, e a responsividade, com a interface pensada primeiro para o celular. "
     "Especificamos treze casos de uso. No diagrama, o membro move tarefas, o líder vincula a tarefa a um pull request e o administrador acompanha o dashboard consolidado."),
    ("Vitor Medina", 50,
     "A arquitetura tem três partes. O front-end é Next.js 16 com React, TypeScript e Tailwind, com treze páginas, e só o servidor do Next conversa com a API, guardando o token em um cookie httpOnly. "
     "O back-end é C# com .NET 8, em camadas e seguindo os princípios SOLID, com cinquenta e seis casos de uso, onze grupos de endpoints e acesso a dados com Entity Framework Core. "
     "O banco é o MySQL 8, com doze tabelas. Tudo roda em contêineres Docker. A hospedagem prevista é uma VPS Linux, mas, por enquanto, o sistema roda localmente: publicá-lo é a próxima etapa."),
    ("Ana Luiza Lourenço", 60,
     "Vou mostrar o fluxo principal do usuário. Primeiro, o dashboard consolidado, caso de uso doze: o administrador vê as tarefas ativas, as concluídas na sprint e as atrasadas, "
     "a carga de trabalho de cada time e as entregas por sprint, tudo em uma só tela. "
     "Segundo, o quadro Kanban de um time, caso de uso cinco, com as colunas Backlog, A fazer, Em andamento, Em revisão e Concluído; as tarefas são arrastadas, e o cartão já mostra a prioridade, o responsável e o atraso. "
     "Terceiro, o detalhe da tarefa: a sugestão de prioridade com o motivo, sempre como recomendação para o líder decidir, e o pull request ligado a ela. "
     "Quando o pull request é aberto, a tarefa vai sozinha para Em revisão e, no merge, para Concluído."),
    ("Ana Luiza Lourenço", 60,
     "Neste vídeo curto, gravado no sistema real, arrastamos uma tarefa entre as colunas, abrimos o detalhe de uma tarefa ligada ao Git, começamos a criar uma nova, com a prioridade sugerida a partir do prazo, "
     "e vemos a tela de priorização, que ordena as tarefas e explica o motivo de cada sugestão. "
     "Além disso, o painel administrativo permite convidar usuários por e-mail ou criar a conta direto; as integrações Git conectam repositórios do GitHub e do GitLab; "
     "há notificações quando o prazo se aproxima e o sistema funciona no celular. "
     "[Plano B, se o vídeo não tocar: seguir falando com os prints do slide anterior. O arquivo demo-trilho-30s.mp4 está salvo junto da apresentação.]"),
    ("Arthur Rodrigues", 60,
     "Em resultados, os oito requisitos funcionais foram atendidos, com ajustes que registramos no relatório. O sistema tem trezentos e dezenove testes automatizados: "
     "oitenta e seis unitários e cento e sessenta e quatro de integração no backend, quarenta e um no front-end e vinte e oito de interface. "
     "Sobre validação, a pesquisa de campo com dezoito empresas mostrou que oitenta e nove por cento têm interesse em uma plataforma com inteligência artificial e integração com Git. "
     "Ainda não temos retorno de usuários reais, e é honesto dizer isso. "
     "Como trabalhos futuros: publicar o sistema no ar, em uma VPS com HTTPS; evoluir a priorização para aprendizado de máquina, com o histórico das tarefas; e deixar o líder personalizar as colunas do Kanban."),
    ("Arthur Rodrigues", 40,
     "Para concluir: a contribuição do Trilho é dar à Nexus uma visão única dos times, prioridade com critério e tarefas ligadas ao código, para escalar a engenharia com previsibilidade. "
     "Como grupo, aprendemos a partir de um problema real, com Double Diamond e protótipos, a organizar o sistema em camadas com SOLID e a testar de forma automatizada. "
     "Agradecemos à professora Karhyne, à Nexus e às dezoito empresas que responderam à pesquisa. O código está no QR code. Muito obrigado!"),
]
lines = ["# Trilho — roteiro de fala (modelo da disciplina, 7 minutos)", ""]
total_words, clock = 0, 0
for i, (who, secs, text) in enumerate(FALAS):
    S[i].notes_slide.notes_text_frame.text = f"[{who} · {secs} s]\n\n{text}"
    words = len(text.split())
    total_words += words
    lines += [f"## Slide {i + 1} · {who} · {clock // 60}:{clock % 60:02d} (previsto {secs} s, {words} palavras)", "", text, ""]
    clock += secs
open(os.path.join(OUT, "roteiro-fala-modelo.md"), "w", encoding="utf-8").write("\n".join(lines))

dest = os.path.join(OUT, "Trilho-Apresentacao-modelo.pptx")
prs.save(dest)
print(f"salvo: {dest}")
print(f"palavras: {total_words} (~{total_words / 135:.1f} min a 135 palavras/min); tempo previsto do modelo: {sum(f[1] for f in FALAS)} s")
