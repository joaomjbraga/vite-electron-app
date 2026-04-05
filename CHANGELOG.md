# Changelog

Todas as alterações significativas deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/spec/v2.0.0.html).

## [1.3.0] - 2026-04-05

### Adicionado

- Funcionalidade de abertura de links externos via IPC
- Handler `open-external` no main process usando `shell.openExternal`
- Suporte a `contextBridge` para comunicação segura renderer-main
- Template atualizado com estrutura para links externos
- Comentários documentados explicando padrão IPC

### Alterado

- Template `preload.ts` com estrutura documentada para exposição de APIs
- Comentários mais claros no código para facilitar customização

## [1.2.0] - 2026-04-05

### Corrigido

- Vulnerabilidade de path traversal na validação do diretório alvo
- Código redundante na edição de vite.config.ts e tsconfig.json
- Lógica do .gitignore para adicionar dist-electron e release independente de dist-ssr
- Regex de plugins para lidar com arrays em múltiplas linhas corretamente
- isEmpty para tratar diretórios não existentes
- Validação de template antes de criar o diretório de destino
- Build script com undefined causando string inválida
- Verificação redundante na lógica de diretório

### Adicionado

- Sistema de log padronizado com cores (log.info, log.success, log.error, log.warn, log.step)
- Mensagens de progresso durante o scaffolding
- Cleanup em caso de falha no setupElectron
- Detecção de pnpm via lockfile
- Proteção contra arquivos perigosos (.env, *.key, *.pem, etc.)
- Try-catch em todas as operações de arquivo
- Validação de path com path.resolve() para detectar traversal como /foo/../bar

### Alterado

- Removido .npmrc do template (específico do pnpm)
- Mensagens de erro mais amigáveis (sem stack traces)
- Verificação de lockfiles para detectar gerenciador de pacotes

### Refatorado

- emptyDir agora lança erro em vez de apenas warn
- isValidPackageName verifica limite de 214 caracteres do npm
- Código organizado com funções menores de log

## [0.1.0] - 2026-04-05

### Corrigido

- Bug de sintaxe no template literal do plugin Electron (backticks internos)
- Código inalcançável em `editFile` do tsconfig.json
- Testes com descrições incorretas sobre comportamento de validação

### Refatorado

- Código movido para escopo local onde possível
- Expressão `watch` inlined no vite.config.ts

### Alterado

- Renomeado projeto de `create-elec-app` para `vite-electron-app`
- Atualizadas URLs do repositório GitHub para `github.com/joaomjbraga/vite-electron-app`
- Atualizado nome do binário CLI de `create-elec-app` para `vite-electron-app`
- Versão resetada para 0.1.0 após renomeação

## [0.1.5] - 2026-04-05

### Alterado

- Removido código demo do template Electron (comentários e listeners IPC não utilizados)
- Simplificado arquivos main.ts, preload.ts e electron-env.d.ts

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

## [0.1.2] - 2026-04-04

### Corrigido

- Verificação inválida de `dependencies` em `vite.config.ts` (sempre retornava true)
- Arquivos SVG não existentes sendo copiados do diretório `electron/`
- Geração de `vite.config.ts` com posicionamento incorreto de imports
- Problemas de idempotência em operações de edição de arquivos

### Refatorado

- Simplificação da geração de snippet IPC
- Regex melhorada para detecção de `plugins: [react()]`
- Melhores verificações de idempotência para `tsconfig.json` e `.gitignore`

### Removido

- Funções de cores não utilizadas (`gary`, `cyan`, `yellow`, `green`)
- Chamada desnecessária de `editFile` para `App.tsx`
- Código morto do codebase

### Manutenção

- Adicionado script `pretest` para build automático antes dos testes
- Atualizado teste para usar o nome correto `vite.svg`
- Adicionado tratamento de erros para `electron/package.json` ausente

## [0.1.1] - 2026-04-04

### Corrigido

- Melhorado electron main e preload com melhores comentários e API IPC

## [0.1.0] - 2026-04-04

### Adicionado

- Lançamento inicial
- Scaffold de Electron + Vite + React + TypeScript
- Configuração do Electron Builder
- Exemplo de comunicação IPC
- Testes unitários e de integração
