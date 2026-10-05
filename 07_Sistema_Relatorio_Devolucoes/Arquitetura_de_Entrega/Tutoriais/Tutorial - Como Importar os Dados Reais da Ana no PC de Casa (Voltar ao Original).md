---
tipo: tutorial
dominio: banco_de_dados
status: ativa
criado: 04/10/2026
atualizado_em: 04/10/2026 06:16
relacionado: [Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador), Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe), Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]
---

# Tutorial - Como Importar os Dados Reais da Ana no PC de Casa (Voltar ao Original)

Este tutorial ensina a **copiar os dados reais do sistema da Ana** (os dois bancos MySQL, um por empresa, mais as fotos) para o **PC de casa**, deixando o ambiente de casa idêntico ao de produção. Serve para duas situações: (1) trabalhar em casa com dados de verdade em vez de dados inventados, e (2) **voltar ao original** sempre que os testes em casa bagunçarem o banco (por exemplo, depois de apagar ou editar devoluções para testar uma tela) — basta repetir o tutorial.

> [!info] Quando usar
> | Situação | O que fazer |
> |---|---|
> | Primeira vez levando os dados para casa | Partes 1, 2 e 3 inteiras |
> | Os testes em casa deixaram o banco diferente do real e você quer "voltar ao original" | Partes 1, 2 e 3 de novo, **com o passo opcional de apagar os bancos de casa** (Parte 2, passo 2) |
> | Só as fotos estão desatualizadas | Só a Parte 3 |

## Conceitos usados aqui

| Termo | O que é |
|---|---|
| **Produção** | O PC da Ana, onde o sistema roda de verdade e o MySQL guarda os dados reais. Nada deste tutorial altera a produção: ela só é **lida**. |
| **PC de casa** | O PC onde você desenvolve e testa. É nele que os dados reais são recriados. |
| **`mysqldump`** | Programa que já vem instalado junto com o MySQL (fica na pasta `bin` dele). Lê um banco e grava tudo num arquivo de texto (`.sql`) feito de comandos SQL. É a ferramenta certa porque o editor de consultas do Workbench só executa SQL: não existe nele um comando que exporte um banco inteiro (o `SELECT ... INTO OUTFILE` exporta uma tabela por vez, sem a estrutura, e depende de permissão do servidor). |
| **cmd** | O Prompt de Comando do Windows. **Não use o PowerShell** neste tutorial: o `<` da importação (Parte 2, passo 4) não funciona nele. |
| **`migrate`** | Comando do Django que **cria as tabelas** do banco a partir do código. Neste projeto ele exige `--database` de propósito (ver `devolucoes/management/commands/migrate.py`): sem isso, só o banco `default` seria migrado e o outro ficaria desatualizado em silêncio. |
| **`DADOS_DIR` e `media`** | `DADOS_DIR` é uma pasta definida no arquivo `.env` de cada PC. As fotos ficam em `DADOS_DIR\media` (em `projeto_sistema_devolucao_mb_sv/settings.py`: `MEDIA_ROOT = DADOS_DIR / 'media'`). |

## Os dois bancos

O sistema tem **um banco MySQL por empresa**, e os dois entram no mesmo arquivo de exportação:

| Banco | Empresa |
|---|---|
| `sistema_devolucao_magazine` | Magazine Brasileiro (MB) |
| `sistema_devolucao_samvale` | Samvale (SV) |

O `settings.py` ainda tem um alias chamado `default`, mas ele aponta para o **mesmo** banco da Magazine. Não é um terceiro banco. Os usuários de login do sistema ficam no banco da Magazine, então eles chegam junto com a importação.

## A pasta de transporte

Todos os arquivos do tutorial (o `.sql` e o `.rar` das fotos) passam por uma **pasta fixa**, para nada ficar solto na raiz do `C:`:

```text
%USERPROFILE%\Desktop\PROJETO MB\importar_backup_sistema_devolucao
```

Por que escrita assim: `%USERPROFILE%` é uma variável do Windows que vira a pasta do usuário logado (no seu PC, `C:\Users\Mateus`). Assim o **mesmo comando funciona no PC da Ana** mesmo com outro nome de usuário. O caminho tem espaço ("PROJETO MB"), por isso **todo comando abaixo leva o caminho entre aspas**.

| Arquivo | O que é | Quem cria |
|---|---|---|
| `devolucao_dados.sql` | Os dados dos dois bancos | Parte 1 (produção) |
| `media.rar` | As fotos (pasta `media` compactada) | Parte 3 (produção) |

## Visão geral

| Parte | Onde | O que acontece |
|---|---|---|
| 1 | Produção (PC da Ana) | Gerar o `devolucao_dados.sql` com o `mysqldump` |
| 2 | PC de casa | (Opcional) apagar e recriar os bancos, rodar o `migrate` e importar o `.sql` |
| 3 | Produção → casa | Levar as fotos em `.rar` e extrair em `DADOS_DIR` |

## Parte 1 — Gerar o arquivo de dados (na produção)

1. Aperte `Win + R`, digite `cmd` e dê Enter.
2. Crie a pasta de transporte (se já existir, o cmd só avisa, e está tudo certo):

```bat
mkdir "%USERPROFILE%\Desktop\PROJETO MB\importar_backup_sistema_devolucao"
```

3. Rode o comando abaixo, **tudo em uma linha só**. Troque `root` pelo `DB_USER` do `.env` se for outro usuário:

```bat
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p --databases sistema_devolucao_magazine sistema_devolucao_samvale --no-create-info --no-create-db --replace --complete-insert --skip-triggers --single-transaction --no-tablespaces --set-gtid-purged=OFF --default-character-set=utf8mb4 --result-file="%USERPROFILE%\Desktop\PROJETO MB\importar_backup_sistema_devolucao\devolucao_dados.sql"
```

4. Ele pede a senha do MySQL. Digite e dê Enter (ela não aparece enquanto você digita — é normal).
5. Se o cursor voltar sem nenhuma mensagem, terminou. Pode demorar um pouco, conforme o tamanho do banco. A Ana pode continuar usando o sistema.

O que cada opção faz:

| Opção | O que faz | Por quê |
|---|---|---|
| `--databases` | Exporta os dois bancos e escreve uma linha `USE nome_do_banco;` antes dos dados de cada um | Uma única importação em casa preenche os dois bancos |
| `--no-create-info` | Grava **só os dados**, sem as tabelas | As tabelas quem cria é o `migrate` de casa |
| `--no-create-db` | Não tenta criar os bancos | Você já os cria em casa (Parte 2, passo 2) |
| `--replace` | Usa `REPLACE INTO` no lugar de `INSERT` | Tabelas internas do Django que o `migrate` já preencheu (como `django_migrations`) não dão erro de chave duplicada |
| `--complete-insert` | Escreve o nome das colunas em cada comando | Evita erro se a ordem das colunas for diferente |
| `--skip-triggers` | Não leva triggers (gatilhos do banco) | A estrutura do banco quem cria é o `migrate` |
| `--single-transaction` | Lê o banco como uma "foto" de um instante, sem travar | Não atrapalha a Ana |
| `--no-tablespaces` e `--set-gtid-purged=OFF` | Evitam dois erros comuns do MySQL 8 | Sem eles o dump pode falhar por falta de permissão ou por linhas de GTID |
| `--default-character-set=utf8mb4` | Acentos e emojis corretos | O banco usa utf8mb4 |
| `--result-file=` | O próprio programa grava o arquivo | **Não use `>`**: no Windows ele pode estragar a codificação do arquivo |

**Conferir se o arquivo ficou completo** (2 comandos, no mesmo cmd):

```bat
findstr /c:"Dump completed" "%USERPROFILE%\Desktop\PROJETO MB\importar_backup_sistema_devolucao\devolucao_dados.sql"
```

Deve aparecer uma linha com "Dump completed". Ela prova que o arquivo foi gravado até o fim.

```bat
findstr /c:"USE `sistema_devolucao" "%USERPROFILE%\Desktop\PROJETO MB\importar_backup_sistema_devolucao\devolucao_dados.sql"
```

Devem aparecer **duas** linhas, uma por banco:

```text
USE `sistema_devolucao_magazine`;
USE `sistema_devolucao_samvale`;
```

Se faltar uma delas, o arquivo está incompleto: refaça o passo 3. Um arquivo de poucos KB para bancos com muitas devoluções também é sinal de que algo ficou de fora (olhe o tamanho no Explorer).

## Parte 2 — Importar no PC de casa

> [!warning] Só no PC de casa
> O passo 2 **apaga os bancos**. Nunca rode a Parte 2 no PC da Ana.

### Passo 1 — Levar o arquivo

Copie o `devolucao_dados.sql` (pendrive, rede, o que for mais prático) para a **mesma pasta de transporte**, no PC de casa. Se a pasta não existir lá, crie no cmd:

```bat
mkdir "%USERPROFILE%\Desktop\PROJETO MB\importar_backup_sistema_devolucao"
```

### Passo 2 — Apagar e recriar os bancos (obrigatório para "voltar ao original")

No MySQL Workbench, abra uma aba de consulta e rode os 4 comandos:

```sql
DROP DATABASE IF EXISTS sistema_devolucao_magazine;
DROP DATABASE IF EXISTS sistema_devolucao_samvale;
CREATE DATABASE sistema_devolucao_magazine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE sistema_devolucao_samvale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Por que apagar, e não só importar por cima? O `--replace` do arquivo sobrescreve as linhas que existem na produção, mas **não remove** o que você criou só em casa. Exemplo: você criou uma devolução de teste (id 50) que não existe na produção. Importando por cima, a devolução 50 continua lá, como um fantasma. Apagando os bancos antes, o resultado é **idêntico à produção**.

Na **primeira vez** (bancos ainda não existem), os dois `DROP` não fazem nada e os dois `CREATE` criam os bancos.

### Passo 3 — Criar as tabelas com o `migrate`

No terminal do projeto (o PowerShell com o ambiente do Poetry já serve aqui, porque neste passo não existe o `<`), rode **os dois**, um de cada vez:

```bat
poetry run python manage.py migrate --database magazine
```

```bat
poetry run python manage.py migrate --database samvale
```

Isso cria as tabelas **vazias**, do jeito que o código de casa espera.

> [!important] O código de casa precisa estar na mesma versão da produção
> O arquivo `.sql` grava os nomes das colunas. Se a produção tiver uma coluna (migration) que o código de casa ainda não conhece, a importação falha com `Unknown column`. Antes de começar, confira que o `git pull` de casa está em dia com o que foi para a produção.

### Passo 4 — Importar o arquivo

Aqui **precisa ser o cmd** (`Win + R`, `cmd`, Enter), porque o `<` não funciona no PowerShell. Uma linha só:

```bat
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p --default-character-set=utf8mb4 < "%USERPROFILE%\Desktop\PROJETO MB\importar_backup_sistema_devolucao\devolucao_dados.sql"
```

Digite a senha do MySQL de casa e dê Enter. **Não precisa dizer o nome do banco**: o arquivo já tem as linhas `USE` e cada bloco de dados vai para o banco certo. Se voltar o cursor sem nenhuma mensagem, deu certo (no MySQL, silêncio é sucesso).

Por que a ordem das tabelas não dá problema: o próprio arquivo desliga a checagem de chaves estrangeiras durante a importação e religa no fim.

### Passo 5 — Conferir

No Workbench, rode:

```sql
SELECT 'magazine' AS banco, COUNT(*) AS devolucoes FROM sistema_devolucao_magazine.devolucoes_devolucao
UNION ALL
SELECT 'samvale', COUNT(*) FROM sistema_devolucao_samvale.devolucoes_devolucao;
```

O resultado deve ser **igual ao da produção** (rode a mesma consulta lá para comparar). Depois abra o sistema em casa e confira duas coisas: o login da Ana funciona (os usuários vieram do banco da Magazine) e a lista de devoluções mostra os pedidos reais.

## Parte 3 — As fotos (pasta `media`)

O banco guarda só o **caminho relativo** de cada foto, por exemplo `Devoluções/Pedido_2000017788033354/Fotos do cliente/foto_1.jpg`. O arquivo em si está na pasta `media`. Por isso a importação do banco (Parte 2) **não traz as imagens**: sem esta parte, o sistema de casa mostra as devoluções com a foto quebrada.

A Parte 3 é independente da Parte 2: pode ser feita antes ou depois.

### Na produção

1. Abra o `.env` da produção e veja a linha `DADOS_DIR=...`. A pasta `media` está dentro dela.
2. Clique com o botão direito na pasta **`media`** (a pasta inteira, não o conteúdo) → **Adicionar ao arquivo...** (WinRAR).
3. Nome do arquivo: `media.rar`. Salve **na pasta de transporte**:

```text
%USERPROFILE%\Desktop\PROJETO MB\importar_backup_sistema_devolucao
```

Por que compactar a pasta `media` em si: assim o `.rar` carrega a pasta `media` por dentro, e a extração em casa cai no lugar certo sem ajuste.

### No PC de casa

1. Copie o `media.rar` para a pasta de transporte de casa.
2. Abra o `.env` de casa e veja o `DADOS_DIR`.
3. Se já existir uma pasta `media` dentro do `DADOS_DIR` (fotos de testes antigos), **renomeie para `media_antiga`**. Assim nada se mistura e você pode apagar depois, com calma.
4. Clique com o botão direito no `media.rar` → **Extrair arquivos...** → escolha como destino o próprio **`DADOS_DIR`** (não a pasta `media`).

> [!warning] O erro clássico: `media` dentro de `media`
> O destino é o `DADOS_DIR`, porque o `.rar` já traz a pasta `media` por dentro. Se você escolher a pasta `media` como destino, o resultado vira `DADOS_DIR\media\media\...` e o sistema não acha nenhuma foto.

Conferência: no Explorer, o caminho tem que ficar `DADOS_DIR\media\Devoluções\Pedido_...` (sem um segundo `media` no meio). Depois abra, no sistema de casa, uma devolução que tenha foto e veja se a imagem aparece.

## Exemplo completo, do começo ao fim

Situação (04/10/2026): você quer testar uma tela em casa com os dados reais e, no fim, voltar tudo ao original.

1. **Produção, cmd:** `mkdir` da pasta de transporte, depois o `mysqldump` da Parte 1. Os dois `findstr` mostram "Dump completed" e as duas linhas `USE`.
2. **Produção, Explorer:** botão direito na pasta `media` → Adicionar ao arquivo → `media.rar` na pasta de transporte.
3. **Pendrive:** leve `devolucao_dados.sql` e `media.rar` para a pasta de transporte de casa.
4. **Casa, Workbench:** os 4 comandos `DROP`/`CREATE` (Parte 2, passo 2).
5. **Casa, terminal do projeto:** `migrate --database magazine` e `migrate --database samvale`.
6. **Casa, cmd:** o `mysql.exe` com o `<` (Parte 2, passo 4).
7. **Casa, Workbench:** a consulta de contagem. Naquele dia eram **49 devoluções: 19 na Magazine e 30 na Samvale**. Os números mudam com o tempo; o que vale é bater com a produção.
8. **Casa, Explorer:** renomear a `media` antiga para `media_antiga` e extrair o `media.rar` no `DADOS_DIR`.
9. **Casa, sistema:** abrir o sistema e uma devolução com foto. Pronto: você está de volta ao original.
10. **Faxina:** apague o `.sql` e o `.rar` da pasta de transporte (ver "Cuidados").

## Erros comuns

| Mensagem ou sintoma | O que significa | O que fazer |
|---|---|---|
| `ERROR 1049 (42000): Unknown database` | O banco de casa não existe | Rode os `CREATE DATABASE` (Parte 2, passo 2) e repita o passo 4 |
| `ERROR 1146: Table '...' doesn't exist` | O `migrate` não rodou, ou rodou só para um dos bancos | Rode os **dois** `migrate` (passo 3) e repita o passo 4 |
| `Unknown column '...' in 'field list'` | A produção tem uma coluna que o código de casa não conhece | Você faz o `git pull` e o `migrate`; depois repita os passos 2, 3 e 4 |
| `Access denied for user` | Usuário ou senha errados | Use o `DB_USER` e o `DB_PASSWORD` do `.env` **daquele** PC |
| "O sistema não pode encontrar o caminho especificado" ou "não é reconhecido" para `mysqldump.exe` ou `mysql.exe` | A versão do MySQL (ou a pasta) é outra | Rode `dir "C:\Program Files\MySQL" /s /b \| findstr mysqldump.exe` (ou `mysql.exe`) e troque o caminho no comando pelo que aparecer |
| A importação não faz nada, ou dá erro estranho de sintaxe logo no começo | Você está no PowerShell | Use o **cmd** |
| Devoluções aparecem, mas as fotos estão quebradas | Pasta `media` no lugar errado (o clássico `media\media`) ou `DADOS_DIR` diferente do que você imaginou | Confira a conferência da Parte 3 e o `DADOS_DIR` do `.env` de casa |

## Cuidados

- **O passo 2 apaga os bancos de casa.** Tudo que só existe em casa (devoluções de teste, usuários criados só ali) some. É exatamente o objetivo, mas só faça com isso em mente.
- **O `.sql` e o `.rar` têm dados reais de clientes** (nomes, endereços, fotos) e os usuários do sistema. Não deixe em nuvem, e-mail ou pendrive compartilhado, e **apague os dois depois de usar**. A pasta de transporte fica fora do repositório do projeto, então o git não enxerga esses arquivos.
- **A produção só é lida.** O `mysqldump` e a compactação das fotos não alteram nada no PC da Ana, e ela pode continuar usando o sistema durante a cópia.
- **A senha do MySQL não aparece na tela** quando você digita. É normal.

## Por que assim (decisão registrada)

**Escolhido: só os dados + `migrate` em casa.** A estrutura das tabelas passa a vir sempre das migrations do código, a mesma fonte usada na produção e em casa, e o arquivo `.sql` fica mais leve e mais fácil de conferir.

**Alternativa que não foi usada: dump completo.** Um `mysqldump` com `--add-drop-database` e sem o `--no-create-info` leva também as tabelas, e dispensa o passo do `migrate`. Funciona, mas o banco de casa passa a ter a estrutura da produção em vez da estrutura do código de casa. Fica anotada caso um dia faça sentido.

## Estado da validação

| Parte | Situação |
|---|---|
| Parte 1 (exportar na produção) | **Executada e confirmada** por Matheus em 04/10/2026: o arquivo foi gerado e as duas linhas `USE` apareceram |
| Parte 2 (importar em casa) | Documentada. O resultado da conferência final (passo 5) **ainda não foi registrado** |
| Parte 3 (fotos) | Documentada. A conferência de fotos abrindo no sistema **ainda não foi registrada** |

> [!todo] Quando rodar a Parte 2 e a Parte 3
> Atualize esta tabela com o resultado (contagem batendo com a produção, fotos abrindo) e com qualquer erro novo que aparecer na tabela "Erros comuns".

## Relacionado

- [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]] — a decisão de usar MySQL e entregar em pasta; é de onde vêm os dois bancos e o `DADOS_DIR`.
- [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]] — o outro tutorial do sistema, para testar a versão compilada depois de importar os dados.
- [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]] — por que o `DADOS_DIR` é fixo e onde ficam banco e mídia.
