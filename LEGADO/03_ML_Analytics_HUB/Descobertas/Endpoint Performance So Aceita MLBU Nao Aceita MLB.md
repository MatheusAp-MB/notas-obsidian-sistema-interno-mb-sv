---
tipo: descoberta
dominio: python
status: ativa
criado: 10/07/2026
relacionado: [MLBU Compartilhado Entre Base E Catalogo Pareado, Score De Performance Do Catalogo E Do Base Compartilhado]
---

# Endpoint de Performance Só Aceita MLBU, Não Aceita MLB

O endpoint `/user-product/{id}/performance` rejeita o identificador MLB
— só funciona passando o MLBU.

## Contexto que levou ao teste

Surgiu a pergunta se seria possível contornar o problema do "score do
Catálogo é na prática o score do Base" (ver nota relacionada) passando o
MLB do Catálogo diretamente na URL, em vez do MLBU compartilhado — na
esperança de que o endpoint calculasse algo específico para aquele MLB.

## Evidência real

```
GET /user-product/MLB3346875129/performance
→ HTTP 404
{"error": "resource not found", "message": "..."}
```

## Conclusão

Não existe atalho técnico para obter performance exclusiva de um MLB de
Catálogo contornando o compartilhamento de MLBU — o endpoint literalmente
não reconhece MLB como identificador válido nesse recurso. A limitação
descrita em "Score de Performance do Catálogo é o Score do Base" não tem
solução por essa via.

## Relacionado

- [[MLBU Compartilhado Entre Base E Catalogo Pareado]]
- [[Score De Performance Do Catalogo E Do Base Compartilhado]]