import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const hash = process.env.AUTH_PASSWORD_HASH;
        if (!hash) {
          throw new Error("AUTH_PASSWORD_HASH not set");
        }
        const pw = creds?.password;
        if (typeof pw !== "string" || pw.length === 0) return null;
        const ok = await bcrypt.compare(pw, hash);
        if (!ok) return null;
        return { id: "owner", name: "Owner" };
      },
    }),
  ],
});
