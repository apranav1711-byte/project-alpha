import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "placeholder",
      clientSecret: process.env.GITHUB_SECRET || "placeholder",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "placeholder",
      clientSecret: process.env.GOOGLE_SECRET || "placeholder",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // If sign in is successful, attach provider details to JWT token
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session as any).provider = token.provider || "none";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/profile",
  },
});

export { handler as GET, handler as POST };
