import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email și parola sunt obligatorii")
        }

        // Verifică mai întâi în tabelul Admin (pentru admini cu credentials)
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email }
        })

        if (admin && admin.authType === "credentials" && admin.password) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          )

          if (isPasswordValid) {
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              image: null,
              isAdmin: true
            }
          }
        }

        // Apoi verifică în tabelul User (pentru utilizatori normali)
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          throw new Error("Email sau parolă incorectă")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Email sau parolă incorectă")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Permite autentificarea cu Google și salvează/actualizează imaginea în baza de date
      if (account?.provider === "google" && profile?.picture) {
        try {
          // Întotdeauna actualizează imaginea la autentificare cu Google pentru User
          await prisma.user.upsert({
            where: { email: profile.email },
            update: { 
              image: profile.picture,
              name: profile.name 
            },
            create: {
              email: profile.email,
              name: profile.name,
              image: profile.picture
            }
          })
          
          // Actualizează adminul dacă există (pentru admini creați prin Google)
          const admin = await prisma.admin.findUnique({
            where: { email: profile.email }
          })
          if (admin && admin.authType === "google") {
            await prisma.admin.update({
              where: { email: profile.email },
              data: { 
                name: admin.name || profile.name,
                image: profile.picture 
              }
            })
            console.log(`Updated admin profile from Google for ${profile.email}`)
          }
          
          console.log(`Updated Google profile image for ${profile.email}`)
        } catch (error) {
          console.error("Error updating user image:", error)
        }
        return true
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirect către pagina principală după autentificare
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user, account, profile }) {
      // La prima autentificare, salvăm datele userului în token
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }
      // Pentru Google, folosim datele din profil
      if (account?.provider === "google" && profile) {
        token.name = profile.name
        token.picture = profile.picture
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.image = token.picture
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
