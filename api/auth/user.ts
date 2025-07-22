// Simple in-memory session (for demo purposes)
interface User {
  id: number;
  email: string;
  username: string;
  organizationId: number;
  role: string;
  firstName: string;
  lastName: string;
}

let userSession: {
  isLoggedIn: boolean;
  user: User | null;
} = {
  isLoggedIn: false,
  user: null
};

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    // Check if user is logged in
    if (!userSession.isLoggedIn || !userSession.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return current user data
    res.json(userSession.user);
  } else if (req.method === 'POST') {
    // Login endpoint
    userSession.isLoggedIn = true;
    userSession.user = {
      id: 1,
      email: "user@example.com",
      username: "demo_user",
      organizationId: 1,
      role: "user",
      firstName: "Demo",
      lastName: "User"
    };
    
    res.json({ success: true, user: userSession.user });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 