import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, doc, onSnapshot, updateDoc, collection, addDoc } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

const Workspace = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [content, setContent] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!user) return;

 
    const urlParams = new URLSearchParams(window.location.search);
    const wsId = urlParams.get('id');

    if (wsId) {
      // Join existing workspace
      setWorkspaceId(wsId);
      joinWorkspace(wsId);
    } else {
      // Create new workspace if none exists
      createNewWorkspace();
    }

    return () => {
      // Clean up - remove user from active users when leaving
      if (workspaceId && user) {
        removeUserFromWorkspace();
      }
    };
  }, [user]);

  // Subscribe to workspace changes
  useEffect(() => {
    if (!workspaceId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'workspaces', workspaceId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setContent(data.content || '');
          setActiveUsers(data.activeUsers || []);
        } else {
          setError('Workspace not found');
        }
      },
      (error) => {
        setError(`Error loading workspace: ${error.message}`);
      }
    );

    return () => unsubscribe();
  }, [workspaceId]);

  const createNewWorkspace = async () => {
    try {
      setIsLoading(true);
      const docRef = await addDoc(collection(db, 'workspaces'), {
        content: '',
        createdAt: new Date(),
        createdBy: user.uid,
        activeUsers: [{
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          email: user.email,
          joinedAt: new Date()
        }]
      });

      setWorkspaceId(docRef.id);
      
      // Update URL with workspace ID for sharing
      window.history.pushState({}, '', `?id=${docRef.id}`);
      setIsLoading(false);
    } catch (error) {
      setError(`Error creating workspace: ${error.message}`);
      setIsLoading(false);
    }
  };

  const joinWorkspace = async (wsId) => {
    try {
      setIsLoading(true);
      
      // Add current user to active users if not already there
      const workspaceRef = doc(db, 'workspaces', wsId);
      
      const userInfo = {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        email: user.email,
        joinedAt: new Date()
      };
      
      // Check if user already exists in the array to avoid duplicates
      await updateDoc(workspaceRef, {
        activeUsers: activeUsers.some(u => u.uid === user.uid) 
          ? activeUsers 
          : [...activeUsers, userInfo]
      });
      
      setIsLoading(false);
    } catch (error) {
      setError(`Error joining workspace: ${error.message}`);
      setIsLoading(false);
    }
  };

  const removeUserFromWorkspace = async () => {
    if (!workspaceId || !user) return;
    
    try {
      const workspaceRef = doc(db, 'workspaces', workspaceId);
      await updateDoc(workspaceRef, {
        activeUsers: activeUsers.filter(u => u.uid !== user.uid)
      });
    } catch (error) {
      console.error('Error removing user from workspace:', error);
    }
  };

  const handleContentChange = async (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Debounce updates to Firestore (you could add a more sophisticated debounce)
    if (workspaceId) {
      try {
        await updateDoc(doc(db, 'workspaces', workspaceId), {
          content: newContent,
          lastUpdated: new Date(),
          lastUpdatedBy: user.uid
        });
      } catch (error) {
        setError(`Error saving changes: ${error.message}`);
      }
    }
  };

  const copyLinkToClipboard = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert('Workspace link copied to clipboard! Share with others to collaborate.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Collaborative Workspace</h1>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={copyLinkToClipboard}
                  className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-md text-sm font-medium hover:bg-indigo-200"
                >
                  Share Workspace
                </button>
                <span className="text-sm text-gray-600">
                  Logged in as {user.displayName || user.email}
                </span>
                <button 
                  onClick={() => auth.signOut()}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md font-medium"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {user ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Active Users */}
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Active Users ({activeUsers.length}):
                </span>
                <div className="flex -space-x-1 overflow-hidden">
                  {activeUsers.map((activeUser) => (
                    <div
                      key={activeUser.uid}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-500 text-xs text-white ring-2 ring-white"
                      title={activeUser.displayName || activeUser.email}
                    >
                      {(activeUser.displayName || activeUser.email || '?').charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                {activeUsers.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {activeUsers.map(u => u.displayName || u.email).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Collaborative Editor */}
            <div className="p-4">
              <textarea
                className="w-full h-64 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={content}
                onChange={handleContentChange}
                placeholder="Start collaborating here. Any changes will be visible to others in real-time."
              ></textarea>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to the Collaborative Workspace
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to create or join a collaborative workspace.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md font-medium"
            >
              Login to Get Started
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Workspace;