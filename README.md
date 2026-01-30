# 🎨 ComfyUI GPU On-Demand Controller

**Hospede ComfyUI no Coolify + GPU sob demanda na Vast.ai**

Solução econômica para rodar ComfyUI: mantenha um proxy leve no Coolify (sempre online) e alugue GPUs da Vast.ai apenas quando precisar gerar imagens.

## 💡 Como Funciona

```
[Coolify - Proxy Node.js]
         ↓
    (liga/desliga)
         ↓
[Vast.ai - ComfyUI + GPU]
```

- **Proxy no Coolify**: Roda 24/7, custo baixo (sem GPU)
- **ComfyUI na Vast.ai**: Liga apenas quando for usar, desliga logo em seguida
- **Economia máxima**: Pague GPU só quando estiver gerando imagens

## 🚀 Deploy no Coolify

### 1. Criar App no Coolify

1. Acesse seu Coolify
2. Clique em **New Resource** > **Public Repository**
3. Cole a URL: `https://github.com/galhosostore-coder/comfyui-coolify-vast`
4. Escolha **Dockerfile** como build pack
5. Configure as variáveis de ambiente:

```bash
VAST_API_KEY=sua_chave_api_vast_aqui
PORT=3000
```

### 2. Pegar API Key da Vast.ai

1. Acesse [https://cloud.vast.ai](https://cloud.vast.ai)
2. Faça login ou crie uma conta
3. Vá em **Account** > **API Keys**
4. Clique em **Create New Key**
5. Copie a chave e cole no Coolify

### 3. Deploy

- Clique em **Deploy**
- Aguarde o build finalizar (~2 minutos)
- Acesse a URL fornecida pelo Coolify

## 🎮 Usando o Painel de Controle

### Ligar a GPU

1. Acesse a URL do seu app no Coolify
2. Clique em **⚡ Iniciar GPU**
3. Aguarde ~2-3 minutos (o painel atualiza automaticamente)
4. Quando o status mudar para **RUNNING**, clique em **🚀 Abrir ComfyUI**

### Desligar a GPU

⚠️ **IMPORTANTE**: Sempre desligue a GPU quando terminar!

1. Clique em **🛑 Desligar GPU**
2. Confirme a ação
3. O custo para de contar instantaneamente

## 💰 Estimativa de Custos

### Coolify (sempre ligado)
- VPS com 2 cores + 4GB RAM: **~$5-10/mês**
- Sem GPU, custo fixo baixo

### Vast.ai (pay-per-use)
- RTX 4090: **$0.40-0.60/hora**
- RTX 3090: **$0.25-0.35/hora** 
- RTX 4080: **$0.30-0.45/hora**

**Exemplo**: Usar 30 minutos/dia = ~$5-9/mês na GPU

**Total**: ~$10-20/mês (vs $50-100/mês GPU dedicada)

## 📁 Arquivos que Faltam Criar

O repositório já tem `Dockerfile` e `package.json`. Você precisa criar mais 3 arquivos:

###  `server.js` - Backend com integração Vast.ai

Veja o código completo no final deste README.

### 📂 `public/index.html` - Painel de controle

Interface web para ligar/desligar GPU.

### 🎨 `public/style.css` - Estilo do painel

CSS moderno para o painel de controle.

## ⚙️ Configuração da Vast.ai

O script já está configurado para:

- Buscar GPUs RTX 4090/4080/3090 verificadas
- Escolher a oferta mais barata automaticamente
- Instalar ComfyUI com todas dependências
- Expor porta 8188

## 🔧 Troubleshooting

### GPU não inicia
- Verifique se tem créditos na Vast.ai
- Verifique se a API key está correta
- Tente novamente em alguns minutos

### Proxy retorna erro 502
- GPU ainda está iniciando (aguarde mais 1-2 min)
- GPU foi desligada
- Verifique logs no Coolify

### ComfyUI não carrega modelos
- Na primeira vez, precisa fazer upload dos modelos
- Use a interface do ComfyUI para upload
- Modelos ficam salvos na instância da Vast.ai

## 🎯 Próximos Passos

1. **Auto-shutdown**: Adicionar timer para desligar GPU após X minutos sem uso
2. **Persisêtencia de modelos**: Integrar com storage externo (S3/R2)
3. **Fila de jobs**: Sistema de fila para geração em lote
4. **Webhook**: Notificar quando GPU estiver pronta

## 📝 Licença

MIT License - Use livremente!

---

## 📦 Arquivos Completos

Agora vou listar todos os arquivos que você precisa criar:

### ✔️ Já criados:
- `Dockerfile` ✅
- `package.json` ✅  
- `README.md` ✅ (este arquivo)

### 🚧 Faltam criar:

Você pode criar estes arquivos diretamente no GitHub ou fazer clone local e adicionar.
