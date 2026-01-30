require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const VAST_API_KEY = process.env.VAST_API_KEY;
const VAST_API_URL = 'https://console.vast.ai/api/v0';

let instanceState = {
  id: null,
  ip: null,
  port: 8188,
  status: 'offline',
  lastCheck: null
};

app.use(express.json());
app.use(express.static('public'));

const vastHeaders = {
  'Accept': 'application/json',
  'Authorization': `Bearer ${VAST_API_KEY}`
};

// Status da instância
app.get('/api/status', async (req, res) => {
  try {
    if (instanceState.id) {
      const response = await axios.get(
        `${VAST_API_URL}/instances/${instanceState.id}`,
        { headers: vastHeaders }
      );
      
      const instance = response.data.instances[0];
      instanceState.status = instance.actual_status;
      instanceState.ip = instance.public_ipaddr;
      instanceState.lastCheck = new Date();
    }
    
    res.json(instanceState);
  } catch (error) {
    console.error('Erro ao verificar status:', error.message);
    res.json(instanceState);
  }
});

// Ligar GPU
app.post('/api/start', async (req, res) => {
  try {
    const searchResponse = await axios.get(
      `${VAST_API_URL}/bundles/?q={"verified":{"eq":true},"gpu_name":{"in":["RTX 4090","RTX 4080","RTX 3090"]}}`,
      { headers: vastHeaders }
    );
    
    const offers = searchResponse.data.offers;
    if (!offers || offers.length === 0) {
      return res.status(404).json({ error: 'Nenhuma GPU disponível' });
    }
    
    const bestOffer = offers.sort((a, b) => a.dph_total - b.dph_total)[0];
    
    const createResponse = await axios.put(
      `${VAST_API_URL}/asks/${bestOffer.id}/?`,
      {
        client_id: 'me',
        image: 'nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04',
        disk: 50,
        onstart: `
          apt-get update && apt-get install -y git python3.10 python3-pip wget &&
          git clone https://github.com/Comfy-Org/ComfyUI.git /workspace/ComfyUI &&
          cd /workspace/ComfyUI &&
          pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 &&
          pip3 install -r requirements.txt &&
          mkdir -p models/checkpoints models/vae models/loras models/embeddings &&
          python3 main.py --listen 0.0.0.0 --port 8188
        `,
        env: {},
        jupyter: false,
        direct_port_count: 0,
        direct_port_start: 8188,
        direct_port_end: 8188
      },
      { headers: vastHeaders }
    );
    
    instanceState.id = createResponse.data.new_contract;
    instanceState.status = 'starting';
    
    res.json({ 
      message: 'GPU iniciando... Aguarde ~2-3 minutos',
      instanceId: instanceState.id 
    });
    
    setTimeout(checkInstanceReady, 10000);
    
  } catch (error) {
    console.error('Erro ao iniciar GPU:', error.response?.data || error.message);
    res.status(500).json({ error: 'Falha ao iniciar GPU' });
  }
});

// Desligar GPU
app.post('/api/stop', async (req, res) => {
  try {
    if (!instanceState.id) {
      return res.status(400).json({ error: 'Nenhuma instância ativa' });
    }
    
    await axios.delete(
      `${VAST_API_URL}/instances/${instanceState.id}/`,
      { headers: vastHeaders }
    );
    
    instanceState = {
      id: null,
      ip: null,
      port: 8188,
      status: 'offline',
      lastCheck: new Date()
    };
    
    res.json({ message: 'GPU desligada com sucesso' });
    
  } catch (error) {
    console.error('Erro ao desligar GPU:', error.message);
    res.status(500).json({ error: 'Falha ao desligar GPU' });
  }
});

// Proxy para ComfyUI
app.use('/comfyui', (req, res, next) => {
  if (instanceState.status !== 'running' || !instanceState.ip) {
    return res.status(503).json({ 
      error: 'ComfyUI offline',
      message: 'Inicie a GPU primeiro' 
    });
  }
  
  createProxyMiddleware({
    target: `http://${instanceState.ip}:${instanceState.port}`,
    changeOrigin: true,
    pathRewrite: { '^/comfyui': '' },
    ws: true,
    onError: (err, req, res) => {
      res.status(502).json({ error: 'ComfyUI não acessível' });
    }
  })(req, res, next);
});

async function checkInstanceReady() {
  try {
    const response = await axios.get(
      `${VAST_API_URL}/instances/${instanceState.id}`,
      { headers: vastHeaders }
    );
    
    const instance = response.data.instances[0];
    
    if (instance.actual_status === 'running') {
      instanceState.ip = instance.public_ipaddr;
      instanceState.status = 'running';
      console.log(`✅ GPU pronta! IP: ${instanceState.ip}`);
    } else {
      console.log(`⏳ Aguardando GPU... Status: ${instance.actual_status}`);
      setTimeout(checkInstanceReady, 10000);
    }
  } catch (error) {
    console.error('Erro ao verificar instância:', error.message);
    setTimeout(checkInstanceReady, 10000);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔧 Vast.ai API: ${VAST_API_KEY ? 'Configurada' : 'NÃO CONFIGURADA'}`);
});
