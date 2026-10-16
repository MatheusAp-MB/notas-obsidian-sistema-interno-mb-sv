---
tipo: decisao
dominio: 
status: em_andamento
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Checkpoint - Busca Legal no Botao Atualizar - Expandir e Substituir (16-10-2026), Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo, Sistema Interno V2 e Produto Real - Padrao Maximo de Qualidade, Documentacao, Validacao e Resolucao Real do Cliente]
resumo: Busca Legal ao atualizar: Expandir (padrão, nunca apaga) ou Substituir na opção B, em que o sistema fica literalmente igual à planilha, apagando o que ela não tem, com janela que lista tudo o que será afetado.
---

# Decisão - Busca Legal ao Atualizar: Expandir ou Substituir (Opção B)

**Resumo**: em 16/10/2026 Matheus decidiu que o botão "Atualizar o sistema com o Drive" terá, para a planilha Busca Legal, dois modos: **Expandir** (padrão, nunca apaga) e **Substituir**, que na **opção B** deixa o sistema **literalmente igual à planilha**, inclusive apagando o CST e os impostos dos produtos cujo EAN não está nela, desde que a janela de confirmação deixe **explícito, de forma clara e direta, tudo o que será afetado**.

## Contexto

A planilha Busca Legal cobre hoje 100% dos itens, mas precisa crescer a cada compra de itens novos. Matheus trouxe a ideia de oferecer duas opções ao atualizar, "Expandir tabela atual" e "Substituir tabela atual", e depois explicou a teoria dele (ver [[Checkpoint - Busca Legal no Botao Atualizar - Expandir e Substituir (16-10-2026)]]): banco zerado, subir a planilha basta; banco existente com Substituir, a planilha substitui tudo; com Expandir, linha existente é atualizada, linha nova é criada e nada é apagado.

Claude propôs implementar em micro-ciclos: (1) Expandir; (2) Substituir; (3) e (4) recálculo automático das grades afetadas. Matheus respondeu "pode". Chegando ao ciclo 2, ficou uma pergunta que só ele podia responder: **o que fazer com o CST dos produtos cujo EAN não está na planilha?**

## As duas opções

| Opção | O que o Substituir faz com um produto que **não está** na planilha |
|---|---|
| **A** | Mantém o CST (e os impostos) que ele já tinha. |
| **B** | **Apaga** o CST e os impostos de saída dele. |

## A decisão

Matheus escolheu a **opção B**, nas palavras dele: depois da confirmação do usuário o sistema todo fica literalmente igual à planilha, e "se não está na planilha, não está no sistema". E exigiu que a janela de confirmação deixe **explícito tudo o que será afetado**.

Como ficou (detalhes técnicos em [[Checkpoint - Busca Legal no Botao Atualizar - Expandir e Substituir (16-10-2026)]]):

- A janela de confirmação oferece **Expandir** (já marcado) ou **Substituir**.
- O Substituir abre uma **prévia** (nada é gravado) que lista tudo o que será apagado, **por motivo**, com totais exatos.
- O botão vermelho "Substituir e apagar" só libera depois de marcar "Li a lista…", e o servidor exige que a prévia lida seja a do arquivo que está no Drive naquele momento.
- O **produto em si nunca é apagado**: só os 5 campos fiscais de saída dele.

## Por que é assim e não de outro jeito

- **A opção A foi descartada** porque deixaria no sistema um valor que não vem de lugar nenhum da planilha. A planilha deixaria de ser a fonte única, e o sistema deixaria de ser o espelho dela, que é justamente o que o Substituir promete (e que Matheus já havia decidido para as tabelas de frete, ver [[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]).
- **O risco da opção B é real**: uma planilha incompleta, enviada por engano, apagaria muita coisa. Por isso o desenho tem várias travas: prévia, lista por motivo com totais exatos, caixa obrigatória, trava por MD5, destaque em vermelho quando o Substituir tira o CST de 20% ou mais dos produtos, backup pelo botão "Baixar" e recusa de planilha da empresa errada.
- **O Expandir continua o padrão** porque nunca apaga: uma planilha menor nunca destrói o que o sistema já sabe.

## Exemplo

Números de exemplo, **não** são do sistema real. O sistema tem 400 produtos com CST e a planilha traz CST de 250 deles. No Substituir, os outros 150 produtos perdem o CST (37,5%, que a janela mostra como **38%**). Como passa de 20%, a prévia destaca em vermelho: "confira se esta é mesmo a planilha completa". No Expandir, esses 150 continuariam com o CST que tinham.

## Em aberto

- [ ] Matheus testar o Substituir no sistema real (Magazine, depois Samvale).
- [ ] Os ciclos de recálculo automático das grades (3 e 4).

## Relacionado

- [[Checkpoint - Busca Legal no Botao Atualizar - Expandir e Substituir (16-10-2026)]]
- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]
- [[Sistema Interno V2 e Produto Real - Padrao Maximo de Qualidade, Documentacao, Validacao e Resolucao Real do Cliente]]
