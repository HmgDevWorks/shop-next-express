# Auth JWT + Refresh + RBAC

## Flujo

```
POST /auth/login → valida password → genera accessToken (15m) + refreshToken (7d)
GET /orders con Authorization: Bearer <access> → JwtGuard verifica → req.user poblado
POST /auth/refresh con refreshToken → genera nuevos tokens
```

---

## AuthService

```ts
@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: "15m" }),
      refreshToken: this.jwt.sign({ sub: user.id }, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "7d",
      }),
    };
  }

  async refresh(refreshToken: string) {
    const decoded = this.jwt.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    }) as { sub: number };

    const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) throw new UnauthorizedException();

    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: "15m" }),
      refreshToken: this.jwt.sign({ sub: user.id }, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "7d",
      }),
    };
  }
}
```

---

## JwtStrategy + Guard

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  validate(payload: { sub: number; email: string; roles: string[] }) {
    return payload; // → req.user
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

---

## RolesGuard

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
```

---

## Uso

```ts
@UseGuards(JwtAuthGuard, new RolesGuard(["admin"]))
@Delete(":id")
delete() {}
```

---

## Check

- [ ] Access vs refresh? → Access corto (15m), refresh largo (7d)
- [ ] Por qué 2 secretos? → Limita daño si comprometen uno
- [ ] Qué va en payload? → sub, email, roles (no password)

**Mini-reto**: implementa `POST /auth/signup` con bcrypt hash y auto-login.
