---
# Twin Development Plan
Generated: 2026-01-24T16:15:00
Task: Por que as alterações no código de programas não alteram na página?
Quality Level: pragmatic

## Análise Técnica
O arquivo `src/pages/Index.tsx` utiliza o hook `usePublishedSiteContent` para buscar o conteúdo publicado no Supabase. Na linha 288, existe a lógica:
`const cards = items.length ? items : fallback;`
Isso significa que, se houver qualquer item cadastrado no banco de dados para a seção `programs_highlights`, o array hardcoded `fallback` (que o usuário está editando) será ignorado. Como a página não reflete as mudanças do código, é certo que já existem dados publicados no banco.

## Plano de Implementação
Não é necessário alterar o código funcional se o objetivo do projeto é ser gerenciável via CMS. A solução é orientar o usuário a atualizar os dados através do Painel Administrativo ou, se desejar usar apenas o código, limpar a entrada no banco de dados.

Contudo, para evitar confusões futuras, propomos uma pequena alteração no código para alertar no console quando o fallback está sendo ignorado em ambiente de desenvolvimento.

### Arquivos a Modificar:
- src/pages/Index.tsx - Adicionar um console.log informativo quando os dados vierem do CMS em vez do fallback.

### Ordem de Implementação:
1. Explicar a causa técnica ao usuário.
2. Adicionar log de depuração em `Index.tsx` para tornar a origem dos dados transparente.
3. Orientar o uso do `/admin/builder`.

### Riscos Técnicos:
- Nenhum. Mudança apenas informativa.

## Próximo Passo
Para implementar este plano, digite: ok, continue, ou approve
Para cancelar, digite: cancel ou inicie uma nova tarefa
---
