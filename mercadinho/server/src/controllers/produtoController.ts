import { z } from 'zod';
import { prisma } from '../prisma';

const produtoSchema = z.object({
  nome: z.string().trim().min(1),
  descricao: z.string().nullable(),
  preco: z.number().nonnegative(),
  estoque: z.number().int().nonnegative(),
  imagem: z.string().url().nullable(),
  categoria: z.string().nullable(),
});

async function resolverImagem(url: string | null) {
  if (!url || /\.(avif|gif|jpe?g|png|webp)(\?.*)?$/i.test(url)) return url;

  try {
    const page = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!page.ok) return url;

    const html = await page.text();
    const imageMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
    return imageMatch?.[1] ? new URL(imageMatch[1], url).toString() : url;
  } catch {
    return url;
  }
}

export async function listarProdutos(_request: unknown, response: any) {
  const produtos = await prisma.produto.findMany({ orderBy: { createdAt: 'desc' } });
  response.json(produtos);
}

export async function criarProduto(request: any, response: any) {
  const data = produtoSchema.parse(request.body);
  data.imagem = await resolverImagem(data.imagem);
  const produto = await prisma.produto.create({ data });
  response.status(201).json(produto);
}

export async function atualizarProduto(request: any, response: any) {
  const data = produtoSchema.parse(request.body);
  data.imagem = await resolverImagem(data.imagem);
  const produto = await prisma.produto.update({
    where: { id: request.params.id },
    data,
  });
  response.json(produto);
}

export async function excluirProduto(request: any, response: any) {
  await prisma.produto.delete({ where: { id: request.params.id } });
  response.status(204).send();
}
