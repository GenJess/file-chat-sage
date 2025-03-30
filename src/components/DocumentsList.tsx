
import { FileDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentsListProps {
  documents: FileDocument[];
  onDelete: (id: string) => void;
}

const DocumentsList = ({ documents, onDelete }: DocumentsListProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-slate-500">
        <FileText className="h-12 w-12 text-slate-300 mb-2" />
        <p className="text-center">No documents uploaded yet</p>
        <p className="text-sm text-center">Upload documents to start chatting about them</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="bg-slate-50 rounded-md p-3 flex items-center justify-between"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-slate-500 mr-2" />
              <div>
                <p className="font-medium text-sm truncate max-w-[180px]">{doc.name}</p>
                <div className="flex text-xs text-slate-500">
                  <span>{formatFileSize(doc.size)}</span>
                  <span className="mx-1">•</span>
                  <span>{formatDate(doc.uploadDate)}</span>
                </div>
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Document</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{doc.name}"? This will remove the document from your knowledge base and the AI will no longer have access to this information.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(doc.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default DocumentsList;
