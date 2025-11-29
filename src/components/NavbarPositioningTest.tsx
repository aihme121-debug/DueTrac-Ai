import React, { useEffect } from 'react';
import { NavigationWeb } from '../components/NavigationWeb';
 

export const NavbarPositioningTest: React.FC = () => {
  

  useEffect(() => {
    
  }, []);

  const handleSectionChange = (section: string) => {
    console.log('Section changed to:', section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <NavigationWeb 
        activeSection="dashboard" 
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <div className="pt-24 lg:pt-16 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Navbar Positioning Test
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Click the bell icon in the navbar to test the dropdown positioning
            </p>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Instructions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Desktop Test</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Click the bell icon in the top navbar</li>
                    <li>• Dropdown should appear right-aligned with the bell</li>
                    <li>• Arrow should point to the bell icon</li>
                    <li>• Should not go off-screen</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mobile Test</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Resize browser to mobile width</li>
                    <li>• Click the bell icon</li>
                    <li>• Dropdown should use full width with margins</li>
                    <li>• Should stay within viewport</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Expected Behavior</h3>
              <p className="text-green-800 text-sm">
                The dropdown should position itself directly next to the bell icon 
                in the navbar, with the right edge of the dropdown aligned to the right edge 
                of the bell icon. It should intelligently flip above if there's insufficient 
                space below, and stay within viewport boundaries on all screen sizes.
              </p>
            </div>
          </div>

          {/* Test Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Test 1: Basic Positioning</h3>
              <p className="text-gray-600 text-sm mb-4">
                Verify the dropdown appears next to the bell icon
              </p>
              <div className="bg-blue-100 rounded p-3 text-xs text-blue-800">
                Click the bell icon in the navbar above
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Test 2: Responsive Behavior</h3>
              <p className="text-gray-600 text-sm mb-4">
                Resize browser to test mobile positioning
              </p>
              <div className="bg-green-100 rounded p-3 text-xs text-green-800">
                Try different screen sizes
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Test 3: Flip Positioning</h3>
              <p className="text-gray-600 text-sm mb-4">
                Scroll to test intelligent flip positioning
              </p>
              <div className="bg-purple-100 rounded p-3 text-xs text-purple-800">
                Scroll page and test dropdown
              </div>
            </div>
          </div>

          {/* Spacer to allow scrolling */}
          <div className="h-96"></div>
        </div>
      </div>
    </div>
  );
};

export default NavbarPositioningTest;