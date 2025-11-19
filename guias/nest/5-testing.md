# Testing

## Unit (services)

```ts
describe("OrdersService", () => {
  let service: OrdersService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = { order: { findMany: jest.fn(), count: jest.fn() } } as any;
    service = new OrdersService(prisma);
  });

  it("list returns pagination", async () => {
    prisma.order.findMany.mockResolvedValue([{ id: 1 }] as any);
    prisma.order.count.mockResolvedValue(1);

    const res = await service.list(1, 20);

    expect(res.total).toBe(1);
    expect(prisma.order.findMany).toHaveBeenCalled();
  });
});
```

---

## E2E (endpoints)

```ts
describe("Orders (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it("GET /orders", async () => {
    const res = await request(app.getHttpServer()).get("/orders").expect(200);
    expect(res.body).toHaveProperty("items");
  });
});
```

---

## Check

- [ ] Unit vs E2E? → Unit mockea deps, E2E testea HTTP + DB
- [ ] Qué testear? → Lógica crítica (auth, orders, validación)

**Mini-reto**: test unit de `create()` mockeando `$transaction`.
