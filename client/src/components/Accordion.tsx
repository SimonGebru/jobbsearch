import { useState } from "react";

const Accordion = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-md shadow mb-2 bg-white">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left px-4 py-2 font-semibold bg-gray-100 hover:bg-gray-200 rounded-t"
      >
        {title} {isOpen ? "▲" : "▼"}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

export default Accordion;