# Pipes, Guards e Interceptors

## Orden de ejecución

```
Request → Guards (auth) → Pipes (validación) → Handler → Interceptors (logging/transform) → Response
```

---

## Pipes (validación)

**Qué**: validan/transforman input antes del handler.

```ts
// ParseIntPipe (built-in)
@Get(":id")
getById(@Param("id", ParseIntPipe) id: number) {}

// Zod custom
@Post()
@UsePipes(new ZodValidationPipe(CreateOrderSchema))
create(@Body() body: CreateOrderInput) {}
```

**Cuándo**: validar body/params/query.

---

## Guards (auth)

**Qué**: deciden si la request puede proceder.

```ts
// JWT Guard
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  validate(payload: { sub: number; roles: string[] }) {
    return payload; // se adjunta a req.user
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

// Uso
@UseGuards(JwtAuthGuard)
@Get()
list() {}
```

**Roles**:

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private roles: string[]) {}
  canActivate(ctx: ExecutionContext) {
    const user = ctx.switchToHttp().getRequest().user;
    if (!user.roles.some(r => this.roles.includes(r))) {
      throw new ForbiddenException();
    }
    return true;
  }
}

// Uso
@UseGuards(JwtAuthGuard, new RolesGuard(["admin"]))
@Delete(":id")
delete() {}
```

**Orden crítico**: `JwtAuthGuard` primero (popula `req.user`), luego `RolesGuard`.

---

## Interceptors (logging, transform)

**Qué**: envuelven handler (antes/después).

```ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest();
    const start = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`[${req.method}] ${req.url} - ${Date.now() - start}ms`))
    );
  }
}

// Global
app.useGlobalInterceptors(new LoggingInterceptor());
```

---

## Check

- [ ] Pipes validan qué? → Input (body/params/query)
- [ ] Guards verifican qué? → Auth/roles
- [ ] Orden Guards vs Pipes? → Guards primero

**Mini-reto**: protege `POST /orders` con JWT + rol "user" + validación Zod.
