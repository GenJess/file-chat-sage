
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Key } from "lucide-react";

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyInput = ({ onSubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-slate-200 border-slate-600 hover:bg-slate-700">
          <Key className="mr-2 h-4 w-4" />
          Set API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ElevenLabs API Key</DialogTitle>
          <DialogDescription>
            To use the ElevenLabs AI voice agent, you need to provide your API key.
            This key will only be stored in your browser for this session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="api-key"
                placeholder="Enter your ElevenLabs API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full"
                type="password"
                autoComplete="off"
              />
              <div className="text-xs text-slate-500">
                <p>Don't have an API key? <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Get one from ElevenLabs</a></p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!apiKey.trim()}>
              Save API Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyInput;
