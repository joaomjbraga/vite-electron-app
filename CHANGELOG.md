# Changelog

Todas as alterações significativas deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/spec/v2.0.0.html).

## [0.1.4] - 2026-04-04

### Corrigido

- Removida dependência `vite-plugin-electron-renderer` que causava erro "not found" ao iniciar dev server
- Corrigido erro de sintaxe no snippet IPC (ponto e vírgula faltando causando parse error no main.tsx)

### Alterado

- `renderer: {}` removido da configuração do plugin Electron por padrão
- Usuários que precisam de Node.js no renderer podem adicionar manualmente `vite-plugin-electron-renderer`

## [0.1.3] - 2026-04-04

### Adicionado

- Adicionar `edge-cases.test.ts` com 30 novos testes unitários
- Testar edge cases de `isValidPackageName` (caracteres especiais, unicode, hífens)
- Testar edge cases de `toValidPackageName` (múltiplos caracteres inválidos, tabs, quebras de linha)
- Testar `emptyDir` que preserva `.git` e trata diretórios não existentes
- Testar `copy` e `copyDir` com diretórios aninhados
- Testar `editFile` com várias modificações de conteúdo
- Adicionar scripts de teste: `test:watch`, `test:unit`, `test:integration`
