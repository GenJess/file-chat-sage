
import { useState } from "react";
import { FileDocument } from "@/types";
import { initializeKnowledgeBase, fetchDocuments, uploadDocument, deleteDocument } from "@/utils/elevenlabs";
import { useToast } from "@/hooks/use-toast";

export const useDocuments = (apiKey: string) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<FileDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string>("");

  const initializeKnowledgeBaseAndFetchDocs = async (key: string) => {
    try {
      const kb = await initializeKnowledgeBase(key);
      setKnowledgeBaseId(kb.knowledge_base_id);
      
      const docsData = await fetchDocuments(key, kb.knowledge_base_id);
      if (docsData.documents) {
        const formattedDocs: FileDocument[] = docsData.documents.map((doc: any) => ({
          id: doc.id,
          name: doc.name || "Unknown Document",
          size: doc.size || 0,
          type: doc.type || "application/octet-stream",
          uploadDate: doc.upload_date || new Date().toISOString()
        }));
        
        setDocuments(formattedDocs);
      }
    } catch (error) {
      console.error("Failed to initialize knowledge base:", error);
      toast({
        title: "Error",
        description: "Failed to initialize knowledge base. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!knowledgeBaseId) return;

    setIsUploading(true);
    
    try {
      const uploadedDocs: FileDocument[] = [];
      
      for (const file of files) {
        const result = await uploadDocument(apiKey, knowledgeBaseId, file);
        
        if (result.document_id) {
          uploadedDocs.push({
            id: result.document_id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString()
          });
        }
      }
      
      setDocuments(prev => [...prev, ...uploadedDocs]);
      
      toast({
        title: "Files Uploaded",
        description: `Successfully uploaded ${uploadedDocs.length} file(s).`,
      });
      
      return uploadedDocs;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!knowledgeBaseId) return;

    try {
      await deleteDocument(apiKey, knowledgeBaseId, documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Document Deleted",
        description: "Document successfully removed from your knowledge base.",
      });
      
      return documentId;
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Deletion Failed",
        description: "There was an error removing your document.",
        variant: "destructive"
      });
    }
  };

  return {
    documents,
    isUploading,
    knowledgeBaseId,
    initializeKnowledgeBaseAndFetchDocs,
    handleFileUpload,
    handleDocumentDelete
  };
};
