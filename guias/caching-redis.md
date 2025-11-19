# Cache con Redis

## Setup

```ts
// cache.service.ts
@Injectable()
export class CacheService {
  private client = new IORedis(process.env.REDIS_URL);

  async getOrSet<T>(key: string, ttl: number, compute: () => Promise<T>): Promise<T> {
    const cached = await this.client.get(key);
    if (cached) return JSON.parse(cached);
    const value = await compute();
    await this.client.set(key, JSON.stringify(value), "EX", ttl);
    return value;
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
```

---

## Uso

```ts
async list(page: number, pageSize: number) {
  const key = `products:list:p=${page}:s=${pageSize}`;
  return this.cache.getOrSet(key, 60, async () => {
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.product.count(),
    ]);
    return { items, total, page, pageSize };
  });
}

async create(input: any) {
  const product = await this.prisma.product.create({ data: input });
  await this.cache.del("products:list:p=1:s=20"); // invalida
  return product;
}
```

---

## TTLs

- Listas: 30-60s
- Detalles: 5-10min
- Rate limit: 1min

---

## Check

- [ ] Qué hace getOrSet? → Lee cache → miss → computa → guarda
- [ ] Cuándo invalidar? → Tras create/update/delete

**Mini-reto**: cachea `GET /orders` 60s + invalida tras crear order.
