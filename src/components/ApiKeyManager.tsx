import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: number;
  service_name: string;
  key: string;
  created_at: string | null;
  last_pdf_generated: string | null;
}

interface ApiKeyManagerProps {
  user: User;
}

const ApiKeyManager = ({ user }: ApiKeyManagerProps) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState({ service: "", key: "" });
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async () => {
    if (!newKey.service || !newKey.key) {
      toast({
        title: "Error",
        description: "Please provide both service name and API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("api_keys").insert({
        service_name: newKey.service,
        key: newKey.key,
      });

      if (error) throw error;

      await fetchApiKeys();
      setNewKey({ service: "", key: "" });
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    }
  };

  const handleDeleteKey = async (keyId: number) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId);

      if (error) throw error;

      setApiKeys(prev => prev.filter(k => k.id !== keyId));
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const toggleKeyVisibility = (keyId: number) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "*".repeat(key.length);
    return key.substring(0, 4) + "*".repeat(key.length - 8) + key.substring(key.length - 4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Add API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service">Service Name</Label>
              <select
                id="service"
                value={newKey.service}
                onChange={(e) => setNewKey(prev => ({ ...prev, service: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Service</option>
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="mistral">Mistral</option>
                <option value="pica">Pica (Notion/Gemini Proxy)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="key">API Key</Label>
              <Input
                id="key"
                type="password"
                value={newKey.key}
                onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                placeholder="Enter your API key"
              />
            </div>
          </div>
          <Button onClick={handleSaveKey} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save API Key
          </Button>
        </CardContent>
      </Card>

      {/* Existing Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Saved API Keys</CardTitle>
            <Badge variant="secondary">{apiKeys.length} keys</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
              <p className="text-gray-600">Add your first API key to get started with automation tools</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{apiKey.service_name}</Badge>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Added: {apiKey.created_at ? new Date(apiKey.created_at).toLocaleDateString() : "Unknown"}
                      {apiKey.last_pdf_generated && (
                        <span className="ml-4">
                          Last used: {new Date(apiKey.last_pdf_generated).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteKey(apiKey.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
