import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: Role;
      organizationId: string;
    };
  }

  interface User {
    role: Role;
    organizationId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    organizationId: string;
  }
}
