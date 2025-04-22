
import { FileDocument } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentsList from "@/components/DocumentsList";
import FileUploadZone from "@/components/FileUploadZone";

interface DocumentPanelProps {
  documents: FileDocument[];
  isUploading: boolean;
  onUpload: (files: File[]) => void;
  onDelete: (id: string) => void;
}

const DocumentPanel = ({
  documents,
  isUploading,
  onUpload,
  onDelete
}: DocumentPanelProps) => {
  return (
    <div className="w-1/3 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <Tabs defaultValue="upload" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="flex-1 flex flex-col p-4">
          <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
          <FileUploadZone onUpload={onUpload} isUploading={isUploading} />
          <div className="mt-4 text-sm text-slate-500">
            <p>Supported file types: PDF, DOCX, TXT</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="flex-1 flex flex-col p-4">
          <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
          <DocumentsList documents={documents} onDelete={onDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentPanel;
