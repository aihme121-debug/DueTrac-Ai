import React from 'react';

function App() {

  return (
    <div className="App">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Professional System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-8">
                <a href="#docs" className="text-gray-600 hover:text-gray-900">Docs</a>
                <a href="#demo" className="text-gray-600 hover:text-gray-900">Demo</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <section id="docs" className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Documentation</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Intelligent Positioning</h4>
                          <p className="text-sm text-gray-600">Automatically determines optimal placement based on viewport space</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Mobile Boundaries</h4>
                          <p className="text-sm text-gray-600">Ensures dropdown stays within mobile viewport limits</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Flip Positioning</h4>
                          <p className="text-sm text-gray-600">Intelligently flips above when space below is limited</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Glass Morphism</h4>
                          <p className="text-sm text-gray-600">Modern frosted glass effect with backdrop blur</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Real-time Updates</h4>
                          <p className="text-sm text-gray-600">Repositions on window resize and scroll events</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Arrow Positioning</h4>
                          <p className="text-sm text-gray-600">Dynamic arrow that points to the icon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">API Reference</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notification System</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Old dropdown has been removed.</li>
                      <li>New system will be implemented with dynamic features.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
                Professional System - Built with React, TypeScript, and Tailwind CSS
              </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;