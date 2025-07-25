import 'dotenv/config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is required but not found in environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('JWT') || key.includes('SECRET')));
    process.exit(1);
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Google OAuth credentials are required but not found in environment variables');
    console.log('Missing: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET');
    process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('🔐 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('🔐 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { googleId: profile.id }
        });

        if (user) {
            // Update last login
            user = await prisma.user.update({
                where: { id: user.id },
                data: { 
                    lastLogin: new Date(),
                    picture: profile.photos[0]?.value || user.picture,
                    name: profile.displayName || user.name
                }
            });
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    picture: profile.photos[0]?.value,
                    lastLogin: new Date()
                }
            });
        }

        return done(null, user);
    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
    }
}));

// JWT Strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.userId }
        });

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Generate JWT token
export function generateToken(user) {
    return jwt.sign(
        { 
            userId: user.id,
            email: user.email,
            name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Middleware to require authentication
export function requireAuth(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Authentication error' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        req.user = user;
        next();
    })(req, res, next);
}

// Optional authentication middleware
export function optionalAuth(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
}

export { prisma };
export default passport; 