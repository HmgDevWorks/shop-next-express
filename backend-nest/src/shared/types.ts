/**
 * 🔥 COMMON TYPESCRIPT UTILITIES
 * Copia este archivo en cualquier proyecto TypeScript para empezar rápido
 * Incluye: Result pattern, Paginated, DTOs básicos, Error classes, Type guards, etc.
 */

// ==========================================
// 1) RESULT PATTERN (manejo de errores sin try/catch)
// ==========================================

export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

/**
 * Envuelve una función async en Result pattern
 * Usa Awaited<T> para resolver Promises anidadas correctamente
 * @example
 * const result = await safe(async () => fetchUser(id));
 * if (!result.ok) console.error(result.error);
 * else console.log(result.data);
 */
export async function safe<T>(
  fn: () => Promise<T>
): Promise<Result<Awaited<T>>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}

/**
 * Versión síncrona de safe
 */
export function trySafe<T>(fn: () => T): Result<T> {
  try {
    const data = fn();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}

// ==========================================
// 2) PAGINACIÓN
// ==========================================

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Helper para crear respuestas paginadas
 */
export function createPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): Paginated<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ==========================================
// 3) HELPERS GENÉRICOS DE DTOs
// ==========================================

/**
 * Helper type para crear DTOs de creación (sin id, createdAt, updatedAt)
 * @example
 * interface User { id: number; name: string; createdAt: Date }
 * type UserCreate = CreateDTO<User> // { name: string }
 */
export type CreateDTO<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

/**
 * Helper type para crear DTOs de actualización (todo opcional)
 * @example
 * type UserUpdate = UpdateDTO<User> // Partial de User sin id
 */
export type UpdateDTO<T> = Partial<CreateDTO<T>>;

/**
 * Helper type para entidades con timestamps
 */
export interface WithTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper type para entidades con id
 */
export interface WithId {
  id: number;
}

// ==========================================
// 4) CUSTOM ERROR CLASSES
// ==========================================

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends Error {
  constructor(message = "Conflict") {
    super(message);
    this.name = "ConflictError";
  }
}

// ==========================================
// 5) TYPE GUARDS (para narrowing)
// ==========================================

/**
 * Type guard para verificar que un valor no es null/undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard para verificar que un valor es un string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard para verificar que un valor es un number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Type guard para verificar que un valor es un objeto
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type guard para verificar que un valor es un array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// ==========================================
// 6) ASSERTION FUNCTIONS
// ==========================================

/**
 * Afirma que un valor no es null/undefined
 * @throws Error si el valor es null/undefined
 */
export function assertPresent<T>(
  value: T,
  message = "Value is required"
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new ValidationError(message);
  }
}

/**
 * Afirma que un valor es un string
 */
export function assertString(
  value: unknown,
  message = "Value must be a string"
): asserts value is string {
  if (typeof value !== "string") {
    throw new ValidationError(message);
  }
}

/**
 * Afirma que un valor es un number
 */
export function assertNumber(
  value: unknown,
  message = "Value must be a number"
): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(message);
  }
}

// ==========================================
// 7) VALIDACIÓN Y PARSING
// ==========================================

/**
 * Convierte un string/number a un ID entero positivo válido
 * @throws ValidationError si no es válido
 */
export function toIntId(value: unknown): number {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new ValidationError("ID must be a string or number");
  }

  const num = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    throw new ValidationError("ID must be a positive integer");
  }

  return num;
}

/**
 * Convierte un valor desconocido a number
 * @throws ValidationError si no es válido
 */
export function toNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num;
    }
  }

  throw new ValidationError("Invalid number");
}

/**
 * Convierte un valor desconocido a boolean
 */
export function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  throw new ValidationError("Invalid boolean");
}

/**
 * Valida que un string no esté vacío
 */
export function notEmptyString(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError("String cannot be empty");
  }
  return value.trim();
}

/**
 * Valida un email básico (usa Zod para validación real)
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==========================================
// 8) UTILITY TYPES AVANZADOS
// ==========================================

/**
 * Hace que las propiedades especificadas sean requeridas
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Hace que las propiedades especificadas sean opcionales
 */
export type PartialFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Tipo para respuestas de API exitosas
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/**
 * Tipo para respuestas de API con error
 */
export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

/**
 * Tipo para respuestas de API
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Helper para crear respuesta exitosa
 */
export function successResponse<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

/**
 * Helper para crear respuesta de error
 */
export function errorResponse(error: string, details?: unknown): ApiError {
  return { success: false, error, details };
}

// ==========================================
// 9) HELPERS DE FETCH/AXIOS
// ==========================================

/**
 * Wrapper tipado para fetch
 */
export async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Wrapper tipado para fetch con Result pattern
 */
export async function safeFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<Result<T>> {
  return safe(async () => fetchJson<T>(input, init));
}

// Para usar con Axios (descomenta si usas axios):
/*
import axios, { AxiosError } from 'axios';

export async function getJson<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`HTTP ${error.response?.status}: ${error.message}`);
    }
    throw error;
  }
}

export async function safeGetJson<T>(url: string): Promise<Result<T>> {
  return safe(async () => getJson<T>(url));
}
*/

// ==========================================
// 10) HELPERS VARIOS
// ==========================================

/**
 * Espera X milisegundos
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry de una función con backoff exponencial
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      if (i < maxRetries - 1) {
        await sleep(delayMs * Math.pow(2, i));
      }
    }
  }

  throw lastError!;
}

/**
 * Filtra valores null/undefined de un array
 */
export function compact<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(isDefined);
}

/**
 * Agrupa un array por una key
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string | number, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string | number, T[]>);
}

/**
 * Crea un Record/Map de un array
 */
export function keyBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string | number, T> {
  return array.reduce((acc, item) => {
    acc[keyFn(item)] = item;
    return acc;
  }, {} as Record<string | number, T>);
}

/**
 * Elimina duplicados de un array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Divide un array en chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ==========================================
// 11) CONSTANTES COMUNES
// ==========================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// ==========================================
// EXPORT DEFAULT (para usar todo junto)
// ==========================================

export default {
  // Result pattern
  safe,
  trySafe,

  // Pagination
  createPaginated,

  // Error classes
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,

  // Type guards
  isDefined,
  isString,
  isNumber,
  isObject,
  isArray,

  // Assertions
  assertPresent,
  assertString,
  assertNumber,

  // Parsing
  toIntId,
  toNumber,
  toBoolean,
  notEmptyString,
  isValidEmail,

  // API helpers
  successResponse,
  errorResponse,
  fetchJson,
  safeFetch,

  // Utilities
  sleep,
  retry,
  compact,
  groupBy,
  keyBy,
  unique,
  chunk,

  // Constants
  HTTP_STATUS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
