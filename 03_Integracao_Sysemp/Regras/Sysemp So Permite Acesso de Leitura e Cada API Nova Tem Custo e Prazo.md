---
tipo: regra
dominio: 
status: ativa
criado: 09/08/2026
atualizado_em: 09/08/2026 17:05
relacionado: [Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta, Padrao de Robustez para Clientes de API Externa]
---

# Sysemp Só Permite Acesso de Leitura, e Cada API Nova Tem Custo e Prazo

## Regra

Vale pra qualquer projeto futuro envolvendo o Sysemp, não só o de impostos — cross-cutting neste mundo.

1. **Só leitura.** Nenhuma escrita via API no Sysemp será feita — independente de quão simples ou básica a operação pareça. Já foi dito explicitamente que isso não é negociável.
2. **Acesso não é livre nem fácil.** Não existe "acesso geral" aos dados do Sysemp — só temos os endpoints específicos que já foram pedidos e que a Sysemp desenvolveu (hoje: impostos de entrada). Qualquer dado novo (ex.: Cadastro de Produtos, impostos de saída) precisa ser solicitado formalmente à Sysemp, e depende deles pra existir.
3. **Toda API nova tem custo real**: custo de desenvolvimento (deles), tempo de desenvolvimento (deles), e tempo de validação (nosso, depois que a API está pronta e antes de confiar nela — mesmo princípio de [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]).

## Implicação prática

Ao planejar qualquer projeto que dependa de dado do Sysemp, considerar esse custo/prazo antes de propor ideias — não assumir acesso "de graça" a um dado só porque ele existe na tela do sistema deles. "Existe no Sysemp" ≠ "temos acesso via API a isso".

## Exemplos em andamento (09/08/2026)

- **API de Cadastro de Produtos**: Sysemp confirmou que pode ser desenvolvida (é a tela "Cadastro de Produtos" do próprio sistema deles — produtos ativos/inativos, códigos, fotos, nome, dimensões físicas). "Pode ser desenvolvida" ≠ "já existe" — ainda não tem prazo. Ver [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]].
- **API de dados de saída** (ICMS/PIS-COFINS de venda): em desenvolvimento em paralelo, sem previsão de prazo — mesma lógica.

## Relacionado

- [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]
- [[Padrao de Robustez para Clientes de API Externa]]
