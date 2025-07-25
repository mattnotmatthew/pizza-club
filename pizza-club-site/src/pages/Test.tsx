import React from 'react';

const Test: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-red-600 mb-4">CSS Test Page</h1>
      <p className="text-blue-500 text-xl mb-4">If you see blue text, Tailwind is working!</p>
      <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
        Green background box
      </div>
      <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
        Purple Button
      </button>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-200 p-4 rounded">Column 1</div>
        <div className="bg-gray-300 p-4 rounded">Column 2</div>
      </div>
    </div>
  );
};

export default Test;