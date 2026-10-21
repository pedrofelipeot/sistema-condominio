type DadosPix = {
  chave: string;
  nomeRecebedor: string;
  cidade: string;
  valor: number;
  referencia: string;
};

export type ConfiguracaoPixApi =
  | { configurado: false }
  | {
      configurado: true;
      chave: string;
      nomeRecebedor: string;
      cidade: string;
    };

function campoPix(id: string, valor: string) {
  const tamanho = new TextEncoder().encode(valor).length;
  if (tamanho > 99) {
    throw new Error(`O campo Pix ${id} excede o tamanho permitido.`);
  }
  return `${id}${String(tamanho).padStart(2, "0")}${valor}`;
}

export function calcularCrc16Pix(valor: string) {
  let crc = 0xffff;

  for (const byte of new TextEncoder().encode(valor)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function normalizarCampoRecebedor(valor: string, limite: number) {
  const normalizado = valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizado || normalizado.length > limite) {
    throw new Error(
      `O campo do recebedor deve conter entre 1 e ${limite} caracteres válidos para Pix.`,
    );
  }

  return normalizado;
}

export function construirPixCopiaECola({
  chave,
  nomeRecebedor,
  cidade,
  valor,
  referencia,
}: DadosPix) {
  const chaveLimpa = chave.trim();
  if (
    !chaveLimpa ||
    new TextEncoder().encode(chaveLimpa).length > 77 ||
    /[\u0000-\u001f\u007f]/.test(chaveLimpa)
  ) {
    throw new Error("A chave Pix configurada é inválida.");
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error("O valor da cobrança precisa ser maior que zero.");
  }
  if (!/^[A-Z0-9]{1,25}$/.test(referencia)) {
    throw new Error("A referência da cobrança é inválida.");
  }

  const valorFormatado = valor.toFixed(2);
  if (valorFormatado.length > 13) {
    throw new Error("O valor da cobrança excede o limite suportado pelo Pix.");
  }

  const contaRecebedor =
    campoPix("00", "br.gov.bcb.pix") + campoPix("01", chaveLimpa);
  const dadosAdicionais = campoPix("05", referencia);
  const payload =
    campoPix("00", "01") +
    campoPix("01", "11") +
    campoPix("26", contaRecebedor) +
    campoPix("52", "0000") +
    campoPix("53", "986") +
    campoPix("54", valorFormatado) +
    campoPix("58", "BR") +
    campoPix("59", normalizarCampoRecebedor(nomeRecebedor, 25)) +
    campoPix("60", normalizarCampoRecebedor(cidade, 15)) +
    campoPix("62", dadosAdicionais) +
    "6304";

  return `${payload}${calcularCrc16Pix(payload)}`;
}
