---
tipo: tutorial
dominio: python
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Modelo de Escrita — Instrucao Procedural (Tutorial), Exemplo — Checkpoint (Modelo de Demonstracao), Exemplo — Decisao (Modelo de Demonstracao)]
resumo: Nota-modelo (demonstração) do tipo tutorial — como rodar a grade de precificação com o cache ativado (implementado em [[Exemplo — Decisao (Modelo de Demonstracao)]]) e confirmar, com dado real, que a segunda chamada usa o resultado guardado em vez de recalcular (só funciona pra produtos de frete fixo).
---

# Tutorial: Como Rodar a Grade de Precificação com Cache Ativado (Tutorial)

**Resumo**: como rodar a grade de precificação com o cache ativado (implementado em [[Exemplo — Decisao (Modelo de Demonstracao)]]) e confirmar, com dado real, que a segunda chamada usa o resultado guardado em vez de recalcular (só funciona pra produtos de frete fixo).

> [!warning] Isto é uma nota-modelo, não um tutorial real do sistema
> Criada em 30/08/2026 só pra demonstrar o modelo de escrita [[Modelo de Escrita — Instrucao Procedural (Tutorial)]]. Válido só pra produtos de frete fixo — ver limitação na seção "Armadilhas comuns".

## Pré-requisitos

- O cache de grade de precificação já precisa estar implementado, conforme a sessão de 14/07/2026 registrada em [[Exemplo — Checkpoint (Modelo de Demonstracao)]].
- Ter o identificador de um produto de frete fixo à mão (produtos de frete variável não se beneficiam do cache — ver "Armadilhas comuns" abaixo).
- Ambiente local rodando, com acesso ao banco de dados de teste.

## Passos

Rode o comando abaixo, trocando `K-430` pelo identificador do produto que você quer testar:

```bash
python manage.py calcular_grade_precificacao_ml --produto K-430
```

Anote o tempo de execução mostrado no final da saída do comando (ex: `Executado em 0.842s`).

Rode o mesmo comando de novo, imediatamente, sem alterar nada:

```bash
python manage.py calcular_grade_precificacao_ml --produto K-430
```

## Como verificar que deu certo

Compare o tempo de execução da segunda chamada com o da primeira: a segunda deve ser visivelmente mais rápida (na ordem de milissegundos, contra frações de segundo da primeira) — isso indica que o resultado veio do cache, não de um recálculo completo. Se quiser confirmar com mais certeza, rode o comando de inspeção de cache:

```bash
python manage.py inspecionar_cache_grade --produto K-430
```

A saída deve mostrar `calculado_em` com o mesmo timestamp da primeira execução, não um timestamp novo — confirmando que o valor não foi recalculado na segunda chamada.

## Armadilhas comuns

> [!warning] Produto de frete variável não mostra ganho nenhum
> Se você repetir este tutorial com um produto de frete variável, a segunda chamada **não** vai ficar mais rápida — os 2 tempos de execução vão ficar parecidos. Isso não é um erro de configuração do seu ambiente: é a limitação real documentada em [[Exemplo — Descoberta (Modelo de Demonstracao)]], ainda sem solução decidida no momento em que este tutorial foi escrito. Use um produto de frete fixo pra testar o cache até essa limitação ser resolvida.

## Relacionado

- [[Modelo de Escrita — Instrucao Procedural (Tutorial)]]
- [[Exemplo — Checkpoint (Modelo de Demonstracao)]]
- [[Exemplo — Decisao (Modelo de Demonstracao)]]
