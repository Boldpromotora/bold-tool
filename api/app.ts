import express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';

import { handler as CPFHandler } from '../src/handlers/buscaCpf';

const app = express();

app.get('/cpf', async (req, res) => {
    
    const vercelReq = req as unknown as VercelRequest;
    const vercelRes = res as unknown as VercelResponse;
  
    await CPFHandler(vercelReq, vercelRes);
  });

export default app;
