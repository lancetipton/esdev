import path from 'path'
import { fileURLToPath } from 'url'

// @ts-ignore
const dirname = path.dirname(fileURLToPath(import.meta.url))
const resolveRoot = () => dirname

export const ESBRoot = resolveRoot()