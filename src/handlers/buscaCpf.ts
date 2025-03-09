import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    try {
      const cpf: string | undefined = req.query.cpf as string;

        if (!/^\d{11}$/.test(cpf)) {
            res.status(400).json({ data: { message: 'CPF inválido. Certifique-se de enviar 11 dígitos numéricos.' } });
        }
        const isValidCpf = (cpf: string): boolean => {
            let sum = 0;
            let remainder;

            if (cpf === "00000000000") return false;

            for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
            remainder = (sum * 10) % 11;

            if ((remainder === 10) || (remainder === 11)) remainder = 0;
            if (remainder !== parseInt(cpf.substring(9, 10))) return false;

            sum = 0;
            for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
            remainder = (sum * 10) % 11;

            if ((remainder === 10) || (remainder === 11)) remainder = 0;
            if (remainder !== parseInt(cpf.substring(10, 11))) return false;

            return true;
        };

        if (!isValidCpf(cpf)) {
            res.status(400).json({ data: {  message: 'CPF inválido.'} });
        }

        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Token não fornecido.' });
            return;
        }
        // erro 3: API da crefisa retornou erro
        // erro 2: Erro ao fazer a requisição para a API da crefisa
        // erro 1: Erro interno
        await axios.get(`https://app1.gerencialcredito.com.br/microservice/crefisa/10431/captura/operacao-cliente/${cpf}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            console.log(response.data); 
            const responseData :any = response.data as { data: any };
            if (responseData.erro == true ){
                res.status(500).json({ data: {message: 'Alguma coisa deu errado, código de erro 3, tente novamente mais tarde..' }});
            } else{
                if (responseData.objeto.perfilProposta != null && responseData.objeto.perfilProposta[0].permiteEmissao) {
                    res.json({ data: { message: 'Parabéns, você está apto a fazer um empréstimo, estamos transferindo você.' } });
                } else {
                    res.status(500).json({ data: { message: 'Infelizmente você já tem um contrato ativo, agradecemos seu contato.' } });
                }
            }
        }).catch((error) => {
            res.status(500).json({ data: { message: 'Alguma coisa deu errado, código de erro 2, tente novamente mais tarde..' } });
        });
    } catch (error) {
        res.status(500).json({ data: { message: 'Alguma coisa deu errado, código de erro 1, tente novamente mais tarde..' } });
    }
}