---
tipo: bug_conhecido
dominio: js
status: corrigido
criado: 06/09/2026
atualizado_em: 06/09/2026 23:02
relacionado: [Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown, Ciclo de Vida de Dúvida e Bug Conhecido]
---

# Perda Silenciosa da Marca ao Digitar Texto Livre Nao Cadastrado

**Resumo**: o campo de marca do formulário de produto era texto livre sem `name`/validação — digitar uma marca que não batia com nenhuma opção real deixava o campo escondido `marca_id` vazio, e o servidor salvava o produto com `marca=None`, sem erro nenhum pro usuário. Corrigido substituindo o campo por um dropdown obrigatório com busca (ver [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]).

## Como foi encontrado

Ao investigar o que acontece quando um usuário digita uma marca inexistente no formulário de produto: o texto digitado nunca era validado contra o banco, e não existia nenhum mecanismo de erro — o produto era salvo mesmo assim, só que sem marca nenhuma vinculada. Achado silencioso — sem exceção, sem mensagem, sem log.

## Causa raiz

O campo de marca era um `<input type="text">` puro, sem atributo `name`. A seleção real acontecia via um campo escondido (`marca_id`) preenchido só quando o texto digitado batia exatamente com uma marca já carregada na página. Se não batia, `marca_id` continuava vazio, e a view aceitava isso sem checar — resultado: `Produto.objects.create(..., marca=None)`.

## Correção

Substituição completa do campo de texto livre por um seletor obrigatório em dropdown (ver decisão linkada) — o usuário só pode escolher entre as marcas reais já cadastradas ou cadastrar uma nova ali mesmo; nunca mais digita marca como texto solto. O submit do formulário é bloqueado no cliente se nenhuma marca foi de fato selecionada.

## Relacionado

- [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]
