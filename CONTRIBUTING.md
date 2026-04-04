# Contribuindo para create-elec-app

Obrigado pelo seu interesse em contribuir!

Este é um projeto CLI que permite criar rapidamente aplicações desktop com Electron + Vite + React + TypeScript.贡献是受欢迎的！

## Pré-requisitos

- **Node.js**: >= 18.x
- **pnpm**: >= 8.x (gerenciador de pacotes recomendado)

## Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/joaomjbraga/create-elec-app.git
cd create-elec-app
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

Isso permite usar `create-elec-app` globalmente como se estivesse instalado via npm.

### 4. Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o desenvolvimento (watch mode) |
| `pnpm build` | Gera build de produção |
| `pnpm test` | Executa os testes |
| `pnpm watch` | Watch mode para build |

### 5. Teste localmente

Após linked, você pode testar a CLI:

```bash
# Cria um novo projeto
npx create-elec-app meu-teste-app

# Ou use diretamente após npm link
create-elec-app meu-teste-app
```

## Estrutura do Projeto

```
create-elec-app/
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
│   └── integration/           # Testes de integração
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

### 3. Execute os testes

```bash
pnpm test
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

Use o [GitHub Issues](https://github.com/joaomjbraga/create-elec-app/issues).

## Dicas para Desenvolvimento

### Testando templates

Para testar se o template gerado funciona corretamente:

```bash
# 1. Crie um projeto de teste
npx create-elec-app test-template

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

Sinta-se à vontade para abrir uma [discussion](https://github.com/joaomjbraga/create-elec-app/discussions) ou issue para qualquer pergunta!
