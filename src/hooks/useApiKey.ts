
import { useState, useEffect } from "react";

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("elevenlabs_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    setIsApiKeySet(true);
  };

  return { apiKey, isApiKeySet, handleApiKeySubmit };
};
