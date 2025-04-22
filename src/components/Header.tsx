
import { Key } from "lucide-react";
import ApiKeyInput from "@/components/ApiKeyInput";

interface HeaderProps {
  onApiKeySubmit: (key: string) => void;
  defaultApiKey?: string;
}

const Header = ({ onApiKeySubmit, defaultApiKey }: HeaderProps) => {
  return (
    <header className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">FileChatSage</h1>
        <ApiKeyInput 
          onSubmit={onApiKeySubmit} 
          defaultApiKey={defaultApiKey}
        />
      </div>
    </header>
  );
};

export default Header;
