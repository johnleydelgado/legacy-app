import { Search } from "lucide-react";

const FloatingZoomButton = () => {
  return (
    <button className="fixed bottom-6 right-6 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800">
      <Search className="h-5 w-5" />
    </button>
  );
};

export default FloatingZoomButton;
