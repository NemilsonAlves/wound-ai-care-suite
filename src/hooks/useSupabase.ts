import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useSupabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = useCallback(async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    successMessage?: string
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await queryFn();
      
      if (error) {
        setError(error.message);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      if (successMessage) {
        toast({
          title: "Sucesso",
          description: successMessage,
        });
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (
    bucket: string,
    path: string,
    file: File
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) {
        setError(error.message);
        toast({
          title: "Erro no upload",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no upload';
      setError(errorMessage);
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (
    bucket: string,
    path: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        setError(error.message);
        toast({
          title: "Erro ao deletar arquivo",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar arquivo';
      setError(errorMessage);
      toast({
        title: "Erro ao deletar arquivo",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    executeQuery,
    uploadFile,
    deleteFile,
  };
}