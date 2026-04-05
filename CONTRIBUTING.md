# Contribuindo para vite-electron-app

Obrigado pelo seu interesse em contribuir!

Este é um projeto CLI que permite criar rapidamente aplicações desktop com Electron + Vite + React + TypeScript

## Pré-requisitos

- **Node.js**: >= 18.x
- **pnpm**: >= 8.x (gerenciador de pacotes recomendado)

## Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/joaomjbraga/vite-electron-app.git
cd vite-electron-app
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure o link simbólico (desenvolvimento local)

Para testar a CLI localmente antes de publicar:

```bash
npm link
```

Isso permite usar `vite-electron-app` globalmente como se estivesse instalado via npm.

### 4. Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o desenvolvimento (watch mode) |
| `pnpm build` | Gera build de produção |
| `pnpm test` | Executa os testes (inclui build automático) |
| `pnpm test:unit` | Executa apenas testes unitários |
| `pnpm test:integration` | Executa apenas testes de integração |
| `pnpm test:e2e` | Executa testes E2E com Playwright |
| `pnpm test:e2e:ui` | Executa testes E2E com interface visual |
| `pnpm test:e2e:headed` | Executa testes E2E no browser |
| `pnpm coverage` | Executa testes com report de coverage |
| `pnpm watch` | Watch mode para build |

### 5. Teste localmente

Após linked, você pode testar a CLI:

```bash
# Cria um novo projeto
npx vite-electron-app meu-teste-app

# Ou use diretamente após npm link
vite-electron-app meu-teste-app
```

## Estrutura do Projeto

```
vite-electron-app/
├── src/                        # Código fonte da CLI
│   ├── index.ts               # Ponto de entrada principal
│   └── utils.ts               # Funções utilitárias
│
├── electron/                   # Template Electron (copiado para novos projetos)
│   ├── main.ts                # Processo principal do Electron
│   ├── preload.ts             # Script de preload (IPC seguro)
│   ├── electron-env.d.ts      # Tipos TypeScript
│   ├── package.json           # Dependências do Electron
│   └── electron-builder.json5 # Configuração do empacotador
│
├── template-react-ts/          # Template padrão (React + TypeScript)
│   ├── src/                   # Código fonte React
│   ├── public/                # Arquivos públicos
│   ├── index.html             # HTML principal
│   ├── vite.config.ts         # Configuração Vite
│   └── ...
│
├── __tests__/                  # Testes
│   ├── unit/                  # Testes unitários
│   ├── integration/           # Testes de integração
│   └── e2e/                  # Testes E2E (Playwright)
│
└── .github/workflows/         # Workflows CI/CD
```

## Fazendo Alterações

### 1. Crie uma branch

```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bug
```

### 2. Faça suas alterações

- CLI: Edite os arquivos em `src/`
- Template: Edite os arquivos em `electron/` e `template-react-ts/`

### Adicionando Handlers IPC

O template Electron utiliza comunicação segura via IPC (Inter-Process Communication):

**No main process (`electron/main.ts`):**
```typescript
import { ipcMain, shell } from 'electron'

ipcMain.handle('nome-do-handler', async (_, param: string) => {
  // Lógica do handler
})
```

**No preload (`electron/preload.ts`):**
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  nomeHandler: (param: string) => ipcRenderer.invoke('nome-do-handler', param),
})
```

**No renderer:**
```typescript
window.electronAPI.nomeHandler('meu-param')
```

### 3. Execute os testes

```bash
pnpm test
```

### Coverage

O projeto usa Vitest com V8 coverage provider. Threshold mínimo: 80%.

```bash
# Gera report de coverage
pnpm coverage
```

Os reports são gerados em:
- `coverage/` - Report HTML
- `coverage/lcov.info` - Para integração com Codecov

### Testes E2E

Os testes E2E usam Playwright para verificar se o projeto gerado funciona corretamente.

```bash
# Executa testes E2E
pnpm test:e2e

# Com interface visual
pnpm test:e2e:ui

# No browser (headed mode)
pnpm test:e2e:headed
```

### 4. Build (se aplicável)

```bash
pnpm build
```

### 5. Commit suas alterações

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo | Descrição |
|------|-----------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Mudanças na documentação |
| `style:` | Mudanças de estilo (formatação, etc) |
| `refactor:` | Refatoração de código |
| `test:` | Mudanças em testes |
| `chore:` | Mudanças em build, ferramentas, etc |

Exemplo:

```bash
git commit -m 'feat: adiciona suporte a template Vue'
git commit -m 'fix: corrige caminho do ícone no Windows'
```

### 6. Push para a branch

```bash
git push origin feature/minha-feature
```

### 7. Abra um Pull Request

- Use um título claro seguindo Conventional Commits
- Descreva o que foi alterado e por quê
- Referencie issues relacionados

## Estilo de Código

- Use **TypeScript** para todo código novo
- Siga as convenções existentes no código
- Adicione tipos para funções e interfaces
- Certifique-se de que os testes passam antes de submeter PR

## Reportando Issues

Ao reportar problemas, inclua:

- **Descrição clara** do problema
- **Passos para reproduzir**
- **Comportamento esperado** vs **comportamento atual**
- **Ambiente**: Node.js versão, sistema operacional
- **Versão do pacote** (se aplicável)

Use o [GitHub Issues](https://github.com/joaomjbraga/vite-electron-app/issues).

## Dicas para Desenvolvimento

### Testando templates

Para testar se o template gerado funciona corretamente:

```bash
# 1. Crie um projeto de teste
npx vite-electron-app test-template

# 2. Entre no projeto
cd test-template

# 3. Instale dependências
pnpm install

# 4. Teste o dev
pnpm dev

# 5. Teste o build
pnpm build
```

### Debugando a CLI

Adicione logs em `src/index.ts` para entender o fluxo:

```typescript
console.log('Debug info:', someVariable);
```

## Perguntas?

Sinta-se à vontade para abrir uma [discussion](https://github.com/joaomjbraga/vite-electron-app/discussions) ou issue para qualquer pergunta!
