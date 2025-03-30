
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

const FileUploadZone = ({ onUpload, isUploading }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onUpload(filesArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onUpload(filesArray);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 transition-colors",
        isDragging 
          ? "border-blue-400 bg-blue-50" 
          : "border-gray-300 hover:border-gray-400"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileInputChange}
      />
      
      <FileText className="h-12 w-12 text-slate-400 mb-4" />
      
      <div className="text-center mb-4">
        <p className="font-medium text-slate-700">Drop your files here</p>
        <p className="text-sm text-slate-500">or click to browse</p>
      </div>
      
      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="bg-slate-800 hover:bg-slate-700"
      >
        {isUploading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Select Files
          </>
        )}
      </Button>
    </div>
  );
};

export default FileUploadZone;
