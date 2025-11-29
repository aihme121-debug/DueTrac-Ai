import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface AuthUser extends User {
  role?: 'admin' | 'user';
  createdAt?: Date;
  lastLoginAt?: Date;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

class AuthService {
  private auth = getAuth();
  private currentUser: AuthUser | null = null;
  private authStateCallbacks: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.initializeAuthStateListener();
  }

  private initializeAuthStateListener() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const userProfile = await this.getUserProfile(user.uid);
        this.currentUser = {
          ...user,
          role: userProfile?.role || 'user',
          createdAt: userProfile?.createdAt,
          lastLoginAt: userProfile?.lastLoginAt
        } as AuthUser;
        
        await this.updateLastLogin(user.uid);
      } else {
        this.currentUser = null;
      }
      
      this.authStateCallbacks.forEach(callback => callback(this.currentUser));
    });
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authStateCallbacks.push(callback);
    
    return () => {
      const index = this.authStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.authStateCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      if (!userProfile) {
        await this.createUserProfile(userCredential.user, 'user');
      }
      
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async signUp(email: string, password: string, displayName: string, role: 'admin' | 'user' = 'user'): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      await updateProfile(userCredential.user, { displayName });
      
      await this.createUserProfile(userCredential.user, role);
      
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser = null;
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Update user profile
  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      const updates: any = {};
      if (displayName !== undefined) updates.displayName = displayName;
      if (photoURL !== undefined) updates.photoURL = photoURL;
      
      await updateProfile(this.currentUser, updates);
      
      // Update Firestore profile
      if (this.currentUser?.uid) {
        const userRef = doc(db, 'users', this.currentUser.uid);
        await setDoc(userRef, {
          displayName,
          photoURL,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  private async createUserProfile(user: User, role: 'admin' | 'user'): Promise<void> {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      role,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true
    };

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      ...userProfile,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });
  }

  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  private handleAuthError(error: AuthError): Error {
    let message = 'An authentication error occurred';
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account already exists with this email';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      default:
        message = error.message || 'Authentication failed';
    }
    
    return new Error(message);
  }
}

export const authService = new AuthService();