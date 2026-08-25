Frontend desenvolvido utilizando **React** e **Vite**.

## Tecnologias

* React
* Vite
* JavaScript
* CSS

## Requisitos

Antes de executar o projeto, certifique-se de ter instalado:

* [Node.js](https://nodejs.org/)
* npm

Para verificar a instalação:

```bash
node -v
npm -v
```

## Instalação

Clone o repositório e entre na pasta do frontend:

```bash
git clone https://github.com/Grupo-9-2CCOA/Frontend.git
cd frontend
```

Instale as dependências:

```bash
npm install
```

## Executando o projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Após executar o comando, o Vite disponibilizará a aplicação em um endereço semelhante a:

```text
http://localhost:5173
```

Acesse o endereço exibido no terminal pelo navegador.

## Build

Para gerar a versão de produção:

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

## Estrutura básica

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## Comandos principais

| Comando           | Função                               |
| ----------------- | ------------------------------------ |
| `npm install`     | Instala as dependências              |
| `npm run dev`     | Inicia o servidor de desenvolvimento |
| `npm run build`   | Gera o build de produção             |
| `npm run preview` | Visualiza o build localmente         |
