// Gera src/data/biblioteca.json a partir da biblioteca curada do coreup-dash-pro.
//
// A biblioteca é do dash-pro: é lá que os ids (ex-NNN) nascem, e são eles que
// planos.dados e serie_executada.exercicio_ref gravam. O app NÃO pode ter uma
// segunda lista — ids divergentes quebrariam o histórico no dia da integração.
//
// Uso:  node scripts/gerar-biblioteca.mjs [caminho-do-dash-pro]
// Padrão: ../coreup-dash-pro
//
// TODO(M2): quando a API existir (#8), trocar este snapshot por download +
// cache local, e este script deixa de ser necessário.

import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const dash = resolve(process.argv[2] ?? '../coreup-dash-pro')
const fonte = join(dash, 'src/lib/biblioteca/exercicios.ts')

const src = readFileSync(fonte, 'utf8')
const ini = src.indexOf('const dados: Lib[] = [')
const fim = src.indexOf('\n];', ini)
if (ini < 0 || fim < 0) throw new Error(`Não achei o array de curados em ${fonte}`)

const bloco = src.slice(ini, fim)
const linhas = bloco.split('\n').filter((l) => l.trim().startsWith('{ id:'))

const exercicios = linhas.map((linha) => {
  // as entradas são literais de objeto de uma linha, com chaves sem aspas
  const obj = eval('(' + linha.trim().replace(/,$/, '') + ')')
  return {
    id: obj.id,
    nome: obj.nome,
    musculoPrincipal: obj.musculoPrincipal,
    musculosSecundarios: obj.musculosSecundarios ?? [],
    padraoMovimento: obj.padraoMovimento,
    tipo: obj.tipo ?? null,
    equipamentos: obj.equipamentos ?? [],
    nivel: obj.nivel,
    compensa: obj.compensa ?? [],
  }
})

const ids = new Set()
for (const e of exercicios) {
  if (ids.has(e.id)) throw new Error(`id duplicado na origem: ${e.id}`)
  ids.add(e.id)
}

const saida = join(import.meta.dirname, '../src/data/biblioteca.json')
writeFileSync(saida, JSON.stringify(exercicios, null, 2) + '\n', 'utf8')
console.log(`${exercicios.length} exercícios · ${exercicios.filter((e) => e.compensa.length).length} com taxonomia postural`)
console.log(`gravado em ${saida}`)
