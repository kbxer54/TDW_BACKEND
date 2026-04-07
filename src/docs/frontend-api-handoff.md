# Handoff de Integracao Frontend

Este documento resume o contrato atual da API para o frontend consumir sem quebrar os fluxos publicos que ja existiam.

## Regras gerais

- Base URL:
  - desenvolvimento: `http://localhost:3001/`
  - producao: usar a URL publica da API
- Rotas protegidas usam header:
  - `Authorization: Bearer <token>`
- Quando a API retornar `401`, o frontend deve limpar a sessao e pedir login novamente.
- Quando a API retornar `403`, o frontend deve esconder ou bloquear a acao para o usuario atual.
- O frontend nao precisa mudar os payloads publicos antigos de:
  - `POST /jobs/:id/apply`
  - `POST /jobs/contact`
  - `POST /subscribe`

## Padrao de erro

Formato padrao:

```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

Regras:

- Sempre ler `message`.
- Se `errors` existir, exibir por campo quando fizer sentido.
- Em alguns erros de negocio, a API pode retornar apenas:

```json
{
  "message": "Authentication required"
}
```

## Auth

### POST /auth/login

Request:

```json
{
  "email": "admin.test@tdw.local",
  "password": "Admin1234"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "Admin Teste",
    "email": "admin.test@tdw.local",
    "role": "ADMIN",
    "createdAt": "2026-04-06T00:00:00.000Z",
    "updatedAt": "2026-04-06T00:00:00.000Z"
  }
}
```

### POST /auth/register

Protegida.

Quem pode usar:

- `ADMIN` pode criar `ADMIN`, `LEADER` e `DEVELOPER`
- `LEADER` pode criar apenas `DEVELOPER`

Request:

```json
{
  "name": "Novo Usuario",
  "email": "novo@thedarkwest.com",
  "password": "StrongPassword123",
  "role": "DEVELOPER"
}
```

Response:

```json
{
  "id": 2,
  "name": "Novo Usuario",
  "email": "novo@thedarkwest.com",
  "role": "DEVELOPER",
  "createdAt": "2026-04-06T00:00:00.000Z",
  "updatedAt": "2026-04-06T00:00:00.000Z"
}
```

### GET /auth/me

Protegida.

Response:

```json
{
  "id": 1,
  "name": "Admin Teste",
  "email": "admin.test@tdw.local",
  "role": "ADMIN",
  "createdAt": "2026-04-06T00:00:00.000Z",
  "updatedAt": "2026-04-06T00:00:00.000Z"
}
```

### PATCH /auth/me

Protegida.

Campos aceitos:

- `name`
- `email`
- `password`
- `currentPassword`

Regra:

- se enviar `password`, deve enviar `currentPassword`

Exemplo:

```json
{
  "name": "Nome Atualizado"
}
```

Ou:

```json
{
  "password": "NovaSenha123",
  "currentPassword": "SenhaAtual123"
}
```

## Jobs

### GET /jobs

Publica.

Response:

```json
[
  {
    "id": 1,
    "title": "Frontend Developer",
    "description": "Descricao da vaga",
    "isActive": true,
    "createdAt": "2026-04-06T00:00:00.000Z"
  }
]
```

### GET /jobs/:id

Publica.

Response:

```json
{
  "id": 1,
  "title": "Frontend Developer",
  "description": "Descricao da vaga",
  "isActive": true,
  "createdAt": "2026-04-06T00:00:00.000Z"
}
```

### POST /jobs/:id/apply

Publica.

Compatibilidade preservada:

- aceita contrato novo
- aceita contrato legado

Contrato novo:

```json
{
  "name": "Arthur Morgan",
  "email": "arthur@example.com",
  "message": "Texto da candidatura com pelo menos 10 caracteres",
  "portfolioLink": "https://portfolio.example.com",
  "jobName": "Frontend Developer"
}
```

Contrato legado:

```json
{
  "name": "Arthur Morgan",
  "email": "arthur@example.com",
  "coverLetter": "Texto da candidatura com pelo menos 10 caracteres",
  "portfolioUrl": "portfolio.example.com",
  "jobName": "Frontend Developer"
}
```

Regras:

- `message` ou `coverLetter`: obrigatorio
- `portfolioLink` ou `portfolioUrl`: opcional
- `jobName`: opcional
- se o usuario mandar URL sem `https://`, o backend tenta normalizar

Response:

```json
{
  "message": "Email sent successfully!"
}
```

### POST /jobs/contact

Publica.

Request:

```json
{
  "name": "Arthur Morgan",
  "email": "arthur@example.com",
  "subject": "Partnership",
  "message": "Mensagem de contato"
}
```

Response:

```json
{
  "message": "Contact email sent successfully!"
}
```

### POST /jobs/user-info

Publica.

Request:

```json
{
  "name": "Arthur Morgan",
  "email": "arthur@example.com"
}
```

Response:

```json
{
  "message": "Email sent successfully!"
}
```

## Newsletter

### POST /subscribe

Publica.

Request:

```json
{
  "name": "Arthur Morgan",
  "email": "arthur@example.com"
}
```

Responses possiveis:

```json
{
  "message": "Subscription successful!"
}
```

```json
{
  "message": "This email is already subscribed."
}
```

## Publications

## Tipos suportados

- `ANNOUNCEMENT`
- `PATCH_NOTE`
- `DEV_LOG`
- `LIVESTREAM`

## GET /publications

Publica.

Query params:

- `page`
- `limit`
- `type` opcional

Exemplos:

- `GET /publications?page=1&limit=10`
- `GET /publications?page=1&limit=10&type=PATCH_NOTE`
- `GET /publications?page=1&limit=10&type=ANNOUNCEMENT`

Response:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Patch 1.0.6",
      "summary": "Resumo",
      "content": "<p>Conteudo</p>",
      "slug": "patch-1-0-6",
      "type": "PATCH_NOTE",
      "author": {
        "id": 1,
        "name": "Admin Teste",
        "role": "ADMIN"
      },
      "images": [
        {
          "id": 10,
          "fileUrl": "/uploads/publications/arquivo.png",
          "fileName": "arquivo.png",
          "mimeType": "image/png",
          "size": 12345,
          "order": 0,
          "createdAt": "2026-04-06T00:00:00.000Z"
        }
      ],
      "createdAt": "2026-04-06T00:00:00.000Z",
      "updatedAt": "2026-04-06T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1
}
```

## GET /publications/:id

Publica.

Response:

```json
{
  "id": 1,
  "title": "Patch 1.0.6",
  "summary": "Resumo",
  "content": "<p>Conteudo</p>",
  "slug": "patch-1-0-6",
  "type": "PATCH_NOTE",
  "author": {
    "id": 1,
    "name": "Admin Teste",
    "role": "ADMIN"
  },
  "images": [],
  "createdAt": "2026-04-06T00:00:00.000Z",
  "updatedAt": "2026-04-06T00:00:00.000Z"
}
```

## GET /publications/slug/:slug

Publica.

Uso recomendado para o frontend publico.

## POST /publications

Protegida para `ADMIN` e `LEADER`.

Sem imagem, pode enviar JSON:

```json
{
  "title": "Patch 1.0.6",
  "summary": "Resumo da atualizacao",
  "content": "<p>Conteudo completo</p>",
  "type": "PATCH_NOTE"
}
```

Com imagem, usar `multipart/form-data`.

Campos aceitos:

- `title`
- `summary`
- `content`
- `type`
- `image` ou `images`

Regras de upload:

- imagens sao opcionais
- maximo de 6 imagens
- maximo de 5MB por arquivo
- tipos aceitos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

## PATCH /publications/:id

Protegida para `ADMIN` e `LEADER`.

Pode enviar:

- somente texto
- somente nova imagem
- texto + imagem
- alteracao de `type`

JSON:

```json
{
  "summary": "Resumo atualizado",
  "type": "ANNOUNCEMENT"
}
```

Ou `multipart/form-data` para anexar imagem.

## DELETE /publications/:id

Protegida para `ADMIN` e `LEADER`.

Response:

```json
{
  "message": "Publication deleted successfully"
}
```

## DELETE /publications/:publicationId/images/:imageId

Protegida para `ADMIN` e `LEADER`.

Response:

```json
{
  "message": "Publication image removed successfully"
}
```

## Regras recomendadas para o frontend

### Sessao

- salvar `token` e `user`
- sempre enviar Bearer token nas rotas protegidas
- em `401`, deslogar e redirecionar para login

### Permissao

- `ADMIN`: exibir gestao completa
- `LEADER`: exibir criacao/edicao de publicacoes e vagas
- `DEVELOPER`: nao exibir tela de criacao de contas nem gestao admin

### Publications

- usar `GET /publications?type=PATCH_NOTE` para aba Patch Notes
- usar `GET /publications?type=ANNOUNCEMENT` para aba News
- usar `GET /publications?type=DEV_LOG` para aba Dev Logs
- usar `GET /publications?type=LIVESTREAM` para aba Livestreams Archived
- abrir detalhe publico preferencialmente por `slug`

### Formularios publicos

- manter payload atual do frontend em `apply`, `contact` e `subscribe`
- no `apply`, o frontend pode continuar mandando `jobName`, mas nao precisa depender disso para o futuro

### Upload de imagem

- se nao houver imagem, mandar JSON normal
- se houver imagem, mandar `multipart/form-data`
- para varias imagens, repetir o campo `images`

## Resumo rapido para o frontend

- contratos publicos antigos foram preservados
- novo modulo de `publications` esta pronto para consumo
- `type` organiza a exibicao sem custo alto no backend
- upload de imagens e opcional
- erros seguem o mesmo formato padronizado
